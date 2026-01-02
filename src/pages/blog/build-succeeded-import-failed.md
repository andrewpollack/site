---
layout: ../../layouts/PostLayout.astro
title:
  "Build Succeeded, Import Failed: Debugging a glibc Mismatch in Python Wheels"
date: "January 1, 2026"
---

This post is a debug log of an issue I ran into while packaging Python wheels
for [ray](https://pypi.org/project/ray) and
[ray-cpp](https://pypi.org/project/ray-cpp) in the open source
[Ray project](https://github.com/ray-project/ray).

After a build-system refactor, I ended up with a wheel file that built and
installed cleanly but failed at import time in a fresh environment. Below is a
walkthrough, plus the guardrails that keep this class of failure from slipping
through again.

**Quick Definitions:**

- A **native extension** is code (in our case, C++) added to a higher-level
  language (Python) to run performance-critical code behind a Python API.
- A **Python wheel** (`.whl` file) is the standard built-package format for
  distributing Python libraries and applications. It's basically a ZIP archive
  containing all the files necessary for installation, including pre-compiled
  binary components for packages that require them.
- **`glibc`** / **GLIBC_2.xx**: `glibc` is the system C library for many Linux
  distros (it comes from the OS, not the wheel). The GLIBC_2.xx strings seen in
  errors are symbol version requirements embedded in a compiled `.so`. Loading
  the `.so` on system’s glibc is older than required, loading the `.so` (often
  at import time) fails.

## Background

Ray is a mixed-language project: Python provides the public API, and a large
part of the runtime is C++ that gets loaded into Python as native extensions.

When a wheel includes native code, the build isn't just "package Python files."
It's a compatibility contract with every environment you intend to support.

In practice, the wheel build has to answer a few non-negotiable questions:

- **Toolchain + libc:** Which compiler and C/C++ runtime (glibc / libstdc++) are
  we linking against?
- **Python ABI:** Which Python versions / ABIs must this extension load against?
- **Developer ergonomics:** Can a new contributor to this open source project
  build this locally without tribal knowledge?
- **CI efficiency:** Can we reuse expensive C++ outputs instead of recompiling
  repeatedly?

Before the refactor, Ray's wheel build was orchestrated by a Python script that
runs inside a container:
[builder_container.py](https://github.com/ray-project/ray/blob/efb34a676b05da643cf6733c765564757c76c206/ci/ray_ci/builder_container.py#L25-L44).

This containerized flow improves reproducibility, but it has two real tradeoffs:

- It's harder to run and iterate on locally.
- It's easy to miss caching opportunities, especially for large C++ builds.

I recently refactored the wheel build to reuse C++ artifacts produced earlier in
CI, so they're built once and then shared across the wheel build _and_ other
downstream jobs. This also makes local wheel builds easier, because you can pull
the same cached artifacts instead of recompiling everything.

```text
[C++ builder]  ---> produces: bazel-bin/**, .so, headers, etc. (cacheable)
        |
        v
   (shared artifacts)
        |
        +--------------------+
        |                    |
        v                    v
[Wheel builder]         [Downstream jobs]
(assemble wheel)        (unit/integration tests, publish, smoke tests)
```

Locally, everything looked great: the wheel built successfully and even imported
inside the build container.

Then I installed that wheel in a fresh environment on my laptop, and the import
failed at runtime. The failure showed up in two shapes:

```text
OSError: undefined symbol: _PyGen_Send
OSError: /lib64/libm.so.6: version `GLIBC_2.29' not found
```

Oof. So I put my debug hat on and dove right in.

## Quick triage: Python ABI mismatch vs glibc mismatch

Different errors can come from different mismatches (Python ABI vs libc), so the
next step was to determine which one I was actually hitting and inspect the
binary the wheel packaged:

- **Python ABI mismatch:** native extension was compiled/linked against a
  different Python version or incompatible C-API assumptions (often shows up as
  `undefined symbol` for Python C-API names).

- **System libc (glibc) mismatch:** native extension requires a newer glibc
  symbol version than the target machine provides (often shows up explicitly as
  `GLIBC_2.xx not found`).

The glibc error made the direction clear: it's time to verify what glibc version
the packaged `.so` required.

<details class="callout">
<summary>Optional: why this fails at import time (brief aside on dynamic linking)</summary>

When you `import ray`, Python loads `ray/_raylet.so` as a shared library by
calling `dlopen()`. From there, the Linux dynamic linker
(`ld-linux-x86-64.so.2`) reads the `.so`’s declared dependencies (`DT_NEEDED`,
e.g. `libstdc++.so.6`, `libm.so.6`), finds those libraries, and resolves
required symbols. Many glibc symbols are _versioned_ (e.g. `memcpy@GLIBC_2.14`),
and the loader enforces that your system provides at least those versions.

That’s why these failures show up at import time: older systems can’t satisfy
newer GLIBC symbol versions (`GLIBC_2.xx not found`), and mismatched Python
runtimes can’t satisfy expected Python C-API symbols
(`undefined symbol: _Py...`).

</details>

## Diagnosing the problem

I extracted the `.so` from the wheel and inspected its glibc ceiling:

```sh
unzip -p ray-*.whl "ray/_raylet.so" > /tmp/raylet.so
objdump -p /tmp/raylet.so | grep GLIBC | sort -u

GLIBC_2.17
GLIBC_2.25
GLIBC_2.29  # <- too new for expectations
```

Having some known-good wheels on hand, I compared and found the issue
immediately:

```sh
objdump -p /tmp/known-good-raylet.so | grep GLIBC | sort -u

GLIBC_2.14
GLIBC_2.17  # <- highest version is 2.17. Within expectations
```

To make this clear, if you were to publish a wheel like this, **it would fail on
any system whose glibc is older than 2.29, violating
[PEP 599](https://peps.python.org/pep-0599/) compatibility goals.**

## Why this matters: manylinux and the "GLIBC ceiling"

The general rule of thumb when dealing with native extensions is:

- Binaries built against older glibc usually run on newer systems.
- Binaries built against newer glibc do not run on older systems.

If you distribute wheels broadly to Linux users (e.g. via PyPI), one approach is
to target a manylinux baseline. One common baseline is **manylinux2014** (see
[PEP 599](https://peps.python.org/pep-0599/) for more), which corresponds to a
**CentOS 7 / glibc 2.17** environment.

More generally: newer manylinux tags exist (e.g. the `manylinux_2_x` family)
when you intentionally choose a higher baseline. But whatever baseline you
choose, the core rule is the same: your binary must not require glibc symbols
newer than the baseline.

So if your wheel accidentally links against glibc 2.29, it might work on Ubuntu
22.04 but fail on older enterprise distros—and plenty of production environments
still look a lot closer to "old" than "new". The baseline is the **maximum**
glibc you’re allowed to require.

## So, why did the wheel contain the wrong binary?

I jumped into the container that built our `_raylet.so` artifact and verified
the cached binary was fine:

```sh
objdump -p /tmp/ray_pkg/ray/_raylet.so | grep GLIBC | sort -u
...
GLIBC_2.17
```

That binary topped out at glibc 2.17, which is what we're looking for. This is
clearly not the same file that the wheel contains.

### Smoke test: size mismatch suggests a silent rebuild

A quick sanity check that often catches "you packaged a different artifact than
you think" is size:

```text
Known-good _raylet.so:   ~41MB
Suspect _raylet.so:     ~155MB  (unexpectedly large)
```

That discrepancy strongly suggested the wheel packaging step rebuilt (or
relinked) new native code instead of using the cached artifact.

### Root cause: wrong copy path placed artifacts where the build didn't look

After diving into the codebase more, the answer became clear (and a bit
anticlimactic): the underlying issue was bad pathing in the "copy cached
artifacts into the wheel build tree" step:

```text
Expected layout:
python/
  ray/
    _raylet.so    <- builder should grab this

What the wrong copy created:
python/
  ray/
    ray/
      _raylet.so  <- never used
```

The wrong unpack path placed the pre-built `_raylet.so` at
`python/ray/ray/_raylet.so` instead of `python/ray/_raylet.so`, so it never
overwrote the file the packaging process actually used.

Because `_raylet.so` wasn’t present at the expected path, the packaging step
fell back to whatever was already in `python/ray/` (or rebuilt it), and that’s
what ended up in the wheel.

### Leaking the host environment (how the wrong binary got packaged)

This part is subtle but important: when developing Ray locally, one common flow
is to build the C++ portions once and copy them into the `python/` directory.
However, when building the wheel image, the Dockerfile includes this section:

```dockerfile
COPY python/ python/
```

Because the cached artifact never overwrote the expected path, the image build
context kept a locally-built `python/ray/_raylet.so`. That local binary was
produced in a newer environment, so the resulting wheel "looked fine" during
build but was incompatible on older glibc systems.

The good news: once we understood the failure mode, the fix was straightforward.
Additionally, we now have a concrete guardrail we could add to prevent this type
of error forever.

## Prevention: a guardrail that makes this boring

This is mainly a reminder to myself: always verify what you packaged, not just
what you built. The simplest way to make this failure mode go away is to add a
fast, deterministic check directly to the build script (or CI job) that inspects
the wheel and fails if the glibc "ceiling" is too new.

Here's a small guardrail script that unzips the wheel, inspects
`ray/_raylet.so`, and fails if the maximum referenced glibc version is greater
than 2.17 (the manylinux2014 baseline):

<details class="callout">
<summary>Full glibc check</summary>

```sh
# Verify built wheel has correct glibc (must be <= 2.17 for manylinux2014)
# This catches issues where local build artifacts leak into the Docker context.
WHEEL_FILE=$(ls -1 .whl/ray-*.whl 2>/dev/null | grep -v ray_cpp | head -n 1)
if [[ -n "$WHEEL_FILE" ]]; then
  command -v objdump >/dev/null || { echo "ERROR: objdump not found"; exit 1; }
  command -v unzip  >/dev/null || { echo "ERROR: unzip not found"; exit 1; }

  TMPDIR="$(mktemp -d)"
  unzip -q "$WHEEL_FILE" -d "$TMPDIR"

  SO_PATH="$TMPDIR/ray/_raylet.so"
  if [[ ! -f "$SO_PATH" ]]; then
    echo "ERROR: expected $SO_PATH not found in wheel"
    rm -rf "$TMPDIR"
    exit 1
  fi

  MAX_GLIBC=$(
    objdump -p "$SO_PATH" \
      | grep -oE 'GLIBC_[0-9]+\.[0-9]+' \
      | sed 's/^GLIBC_//' \
      | sort -Vu \
      | tail -n 1
  )

  rm -rf "$TMPDIR"

  if [[ -z "$MAX_GLIBC" ]]; then
    echo "WARNING: no glibc version references found in $SO_PATH (unexpected?)"
  elif [[ "$(printf '%s\n' "2.17" "$MAX_GLIBC" | sort -V | tail -n 1)" != "2.17" ]]; then
    echo "ERROR: Wheel contains _raylet.so requiring glibc $MAX_GLIBC (max allowed: 2.17)"
    echo "This usually means a local build artifact leaked into the Docker context."
    exit 1
  else
    echo "glibc check passed: max required glibc is $MAX_GLIBC (allowed <= 2.17)"
  fi
fi
```

</details>

## Key takeaways

- When native artifacts are rebuilt in an unexpected environment, you can get
  multiple runtime error shapes. Treat them as symptoms of divergence, and
  verify what binary you actually packaged.
- "Build succeeded" doesn't mean "wheel is compatible." Native code can be
  rebuilt during packaging without obvious red flags unless you add checks.
- glibc ceiling is the fastest compatibility signal. Bake checks for this into
  the build process.

## Minimal repro: demonstrating the glibc trap in Docker

I like having a minimal demo that proves the concept outside the complexity of a
real project. For this minimal repro, we'll show how a builder and runner image
with different glibc versions can cause issues.

The idea:

- Compile a small C program on a modern distro (new glibc).
- Try to run it on manylinux2014 (older glibc).
- Compile it inside manylinux2014 and observe it runs everywhere.

This is the same failure pattern as "accidentally built outside the manylinux
container."

```sh
docker build --progress=plain --no-cache -t glibc-demo -f glibc-demo.Dockerfile .
```

Here's the smallest snippet that illustrates the idea (build on Ubuntu, test on
manylinux2014):

```dockerfile
FROM ubuntu:22.04 AS ubuntu-builder
RUN apt-get update && apt-get install -y gcc
# build /hello-ubuntu ...

FROM quay.io/pypa/manylinux2014_x86_64 AS test-manylinux
COPY --from=ubuntu-builder /hello-ubuntu /hello-ubuntu
RUN /hello-ubuntu  # <- will fail if it requires newer glibc
```

<details class="callout">
<summary>Full Dockerfile (glibc-demo.Dockerfile)</summary>

```dockerfile
# syntax=docker/dockerfile:1.3-labs
#
# glibc Compatibility Demo
# ========================
# Demonstrates how binaries built on newer glibc fail on older systems.
#
# Build: docker build -f glibc-demo.Dockerfile -t glibc-demo .
# The build output shows the problem and solution.

#############################################################################
# Stage 1: Build on Ubuntu 22.04 (glibc 2.35 - too new for manylinux2014)
#############################################################################
FROM ubuntu:22.04 AS ubuntu-builder

RUN apt-get update && apt-get install -y gcc

# Create a simple C program that uses a function requiring newer glibc
# reallocarray() was added in glibc 2.26
RUN <<EOF
cat > /hello.c << 'CCODE'
#include <stdio.h>
#include <stdlib.h>

int main() {
    // reallocarray requires glibc 2.26+
    int *arr = reallocarray(NULL, 10, sizeof(int));
    if (arr) {
        printf("Hello from Ubuntu-built binary!\\n");
        printf("Array allocated successfully at %p\\n", (void*)arr);
        free(arr);
    }
    return 0;
}
CCODE
EOF

RUN gcc -o /hello-ubuntu /hello.c

# Check glibc ceiling
RUN echo "=== Ubuntu-built binary glibc ceiling ===" && \
    objdump -p /hello-ubuntu | grep GLIBC && \
    echo "" && \
    echo "System glibc version:" && \
    ldd --version | head -1

#############################################################################
# Stage 2: Build on manylinux2014 (glibc 2.17 - compatible)
#############################################################################
FROM quay.io/pypa/manylinux2014_x86_64 AS manylinux-builder

# Create the same program but avoid reallocarray (not available in glibc 2.17)
RUN <<EOF
cat > /hello.c << 'CCODE'
#include <stdio.h>
#include <stdlib.h>

int main() {
    // Use calloc instead - available in all glibc versions
    int *arr = calloc(10, sizeof(int));
    if (arr) {
        printf("Hello from manylinux2014-built binary!\\n");
        printf("Array allocated successfully at %p\\n", (void*)arr);
        free(arr);
    }
    return 0;
}
CCODE
EOF

RUN gcc -o /hello-manylinux /hello.c

# Check glibc ceiling
RUN echo "=== manylinux2014-built binary glibc ceiling ===" && \
    objdump -p /hello-manylinux | grep GLIBC && \
    echo "" && \
    echo "System glibc version:" && \
    ldd --version | head -1

#############################################################################
# Stage 3: Test both binaries on manylinux2014 (glibc 2.17)
#############################################################################
FROM quay.io/pypa/manylinux2014_x86_64 AS test-manylinux

COPY --from=ubuntu-builder /hello-ubuntu /hello-ubuntu
COPY --from=manylinux-builder /hello-manylinux /hello-manylinux

RUN <<EOF
#!/bin/bash
set -x

echo ""
echo "=============================================="
echo "Testing on manylinux2014 (glibc 2.17)"
echo "=============================================="
echo ""

echo "--- System glibc version ---"
ldd --version | head -1
echo ""

echo "--- Ubuntu-built binary glibc ceiling ---"
objdump -p /hello-ubuntu | grep GLIBC || true
echo ""

echo "--- manylinux2014-built binary glibc ceiling ---"
objdump -p /hello-manylinux | grep GLIBC || true
echo ""

echo "=============================================="
echo "TEST 1: Running manylinux2014-built binary"
echo "=============================================="
/hello-manylinux && echo "SUCCESS: manylinux binary works!" || echo "FAILED!"
echo ""

echo "=============================================="
echo "TEST 2: Running Ubuntu-built binary"
echo "=============================================="
/hello-ubuntu && echo "SUCCESS!" || echo "FAILED: Ubuntu binary requires newer glibc!"
echo ""

echo "=============================================="
echo "CONCLUSION"
echo "=============================================="
echo "The Ubuntu-built binary fails because it requires glibc 2.26+"
echo "(for reallocarray), but manylinux2014 only has glibc 2.17."
echo ""
echo "This is exactly what happens when wheel builds accidentally"
echo "use binaries compiled outside the manylinux container."
EOF

#############################################################################
# Stage 4: Test both binaries on Ubuntu 22.04 (glibc 2.35)
#############################################################################
FROM ubuntu:22.04 AS test-ubuntu

COPY --from=ubuntu-builder /hello-ubuntu /hello-ubuntu
COPY --from=manylinux-builder /hello-manylinux /hello-manylinux

RUN <<EOF
#!/bin/bash
set -x

echo ""
echo "=============================================="
echo "Testing on Ubuntu 22.04 (glibc 2.35)"
echo "=============================================="
echo ""

echo "--- System glibc version ---"
ldd --version | head -1
echo ""

echo "=============================================="
echo "TEST 1: Running manylinux2014-built binary"
echo "=============================================="
/hello-manylinux && echo "SUCCESS: manylinux binary works on newer systems too!" || echo "FAILED!"
echo ""

echo "=============================================="
echo "TEST 2: Running Ubuntu-built binary"
echo "=============================================="
/hello-ubuntu && echo "SUCCESS: Ubuntu binary works on Ubuntu!" || echo "FAILED!"
echo ""

echo "=============================================="
echo "KEY INSIGHT"
echo "=============================================="
echo "Binaries built with older glibc work on newer systems (forwards compatible)."
echo "Binaries built with newer glibc do NOT work on older systems."
echo "This is why manylinux2014 (glibc 2.17) ensures broad compatibility."
EOF

#############################################################################
# Final stage - just output the test results
#############################################################################
FROM scratch
COPY --from=test-manylinux /hello-manylinux /test-passed-manylinux
COPY --from=test-ubuntu /hello-ubuntu /test-passed-ubuntu
```

</details>

## Handy commands for later reference

```sh
# Inspect a system's glibc version
ldd --version | head -1

# Show which glibc symbol versions this .so requires (the "glibc ceiling")
objdump -T ray/_raylet.so | grep GLIBC | sort -u

# Quick dependency list from ELF metadata
readelf -d ray/_raylet.so | grep NEEDED

# Where will the loader search from this binary?
readelf -d ray/_raylet.so | grep -E 'RPATH|RUNPATH'

# What this .so will actually load on THIS machine
ldd -v ray/_raylet.so

# Wheel external/shared-library compliance (Linux)
auditwheel show ray-*.whl
```
