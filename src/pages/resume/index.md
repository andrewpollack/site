---
layout: ../../layouts/ResumeLayout.astro
title: "Resume - Andrew Pollack-Gray"
mainClass: resume
---

## Andrew Pollack-Gray

Senior Software Engineer with 5+ years driving scalable, secure infrastructure
and developer tooling on cloud platforms. Adept at boosting productivity and
confidence through reversible-change automation, CI/CD architecture to align
with production outcomes, and AI-driven workflows that minimize toil and enable
engineers to contribute more broadly across the codebase. Proven
cross-functional leader who splits complex initiatives into iterative
milestones, mentors engineers, and fosters a culture of continuous learning and
collaboration.

[GitHub](https://github.com/andrewpollack) ·
[LinkedIn](https://www.linkedin.com/in/andrewpkq)

---

## Skills

- **Languages:** Go · Python · Rust
- **Build/CI:** Bazel · Buildkite · Jenkins · GitHub Actions · Prow
- **Infra:** Kubernetes · AWS · Docker · Terraform · ArgoCD · Packer · Ansible
- **Observability:** Prometheus · Grafana · OpenTelemetry · Datadog
- **Artifacts/Dev Envs**: Nexus Repository · Harbor · Coder

---

## Experience

<h3 class="role">
  <img class="role-icon" src="/assets/images/anyscale.png" alt="Anyscale logo" />
  <span>Anyscale — Software Engineer</span>
</h3>

**Dec 2025 – Present · San Francisco, CA**

<h3 class="role">
  <img class="role-icon" src="/assets/images/skydio.jpg" alt="Skydio logo" />
  <span>Skydio — Senior Software Engineer (L5)</span>
</h3>

**Nov 2023 – Jul 2025 · San Mateo, CA**

Cross-functional infrastructure team, designing and building scalable internal
tools that empower engineers to write, test, and release software with
confidence.

- Reduced CI outages 95% (from ~3/month to ~1/year) by migrating the CI control
  plane from Jenkins → Buildkite, hardening security with an isolated AWS
  environment and an allowlisted egress proxy.
- Improved CI efficiency with Go tooling on top of the Prow merge queue:
  merge-locking cut batch cancellation 20% → <2% (saving ~140 minutes per
  batch), and a unified PR merger kept test/compute growth linear.
- Owned and operated developer infrastructure across AWS + Kubernetes:
  standardized provisioning/deployments (Packer, Ansible, Terraform, ArgoCD), CI
  platforms (Buildkite, GitHub Actions, Prow, Jenkins), and artifact systems
  (Nexus Repository, Harbor), supported by monitoring, runbooks, and weekly
  on-call.
- Reduced developer-facing incidents to <1/month by strengthening observability
  (dashboards/alerts) and automating remediation, shifting from reactive
  firefighting to pre-emptive mitigation.
- Led a Cloud Spend working group, shifting reviews to weekly cadence and using
  AWS metrics + tagging to cut CI and development costs by 25%.
- Orchestrated compliant rollout of Windsurf agentic IDE (LLM-powered) across
  150+ engineers, driving 50% DAU in 2 months; onboarded 3 non-technical PMs to
  ship frontend changes and tighten iteration loops.
- Won a hackathon (team of two) by implementing Ruff adoption and tooling,
  reducing lint checks per PR from ~60 minutes → <15 minutes.

<h3 class="role">
  <img class="role-icon" src="/assets/images/google-color.png" alt="Google logo" />
  <span>Google LLC — Software Engineer (L4)</span>
</h3>

**Dec 2021 – Sep 2023 · Mountain View, CA**

Software Delivery team on Fuchsia. Built OTA update and package delivery
workflows with security, reliability, and recovery as core goals.

- Redesigned and implemented "RFC-0208: Distributing Packages with the SDK,"
  adding GN templates and target types; improved versioning, testing, and
  distribution for downstream customers.
- Built a Rust-based CLI for host-to-target blob registration, standardizing
  payload delivery pipelines across the product.
- Facilitated the monthly Fuchsia Rust Working Group to improve Rust developer
  experience and ecosystem adoption.

<h3 class="role">
  <img class="role-icon" src="/assets/images/rust.png" alt="Rust logo" />
  <span>
    The Rust Project — Editor/Publisher,
    <a href="https://this-week-in-rust.org" target="_blank" rel="noopener noreferrer">
      This Week in Rust
    </a>
  </span>
</h3>

**Nov 2021 – Oct 2024 · Virtual**

Open source weekly newsletter with 30,000+ readers covering Rust developments,
learning resources, and community events.

- Developed Docker-based publishing workflow to ensure consistent static
  site/email generation.
- Participated in weekly publishing rotation; implemented a Discord bot to
  improve coordination.

<h3 class="role">
  <img class="role-icon" src="/assets/images/fiddler.png" alt="Fiddler logo" />
  <span>Fiddler Labs — Software Engineer II, Data Platform 
</span>
</h3>

**Nov 2020 – Nov 2021 · Palo Alto, CA**

Data Platform team building AI monitoring and explainability infrastructure.

- Restructured monitoring aggregation logic to enable horizontal scalability via
  application-level sharding, using a RabbitMQ pub/sub pattern deployed on
  Kubernetes.
- Designed a new ingest API supporting multiple formats (CSV, Parquet) and
  storage backends (S3, GCS), reducing new integration development time from
  days to hours.
- Decreased latency for retrieving ML model computations by 95%+ (30+ seconds to
  <1 second) by designing and implementing an intermediate pre-computation
  caching layer.
- Researched and implemented a data-driven benchmarking framework for platform
  services, identifying failure modes and bottlenecks and proposing next steps
  for scalability efforts.
- Spearheaded customer onboarding improvements by identifying pain points and
  leading a documentation overhaul (api.fiddler.ai); helped scale the team by
  leading remote onboarding during Series A → Series B growth.

<h3 class="role">
  <img class="role-icon" src="/assets/images/trust.png" alt="Trust Lab logo" />
  <span>Trust Lab - Software Engineer Intern
</span>
</h3>

**Jun 2020 - Sept 2020 · Palo Alto, CA (Remote)**

Trust & Safety startup (co-founded by ex-Google VP); built foundational platform
infrastructure.

- Designed and implemented Kubernetes-native workflows to automate data
  collection pipelines for Trust & Safety modules.
- Built a metrics framework for evaluating module performance, including
  standardized counters/exporters and dashboards for ongoing monitoring.
- Prototyped internal workflow orchestration and observability patterns using
  Apache Airflow, Prometheus, and Grafana to accelerate platform iteration.
- Partnered with data science to identify failure modes in production modules
  and deliver mitigations to improve reliability and data quality.
- Authored engineering standards for production readiness, introducing blameless
  postmortems and lightweight operational practices.

---

## Education

### Bachelor of Science in Computer Science, Minor in Biology

**Stanford University · Class of 2020 · Stanford, CA**
