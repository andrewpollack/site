---
layout: ../../layouts/ResumeLayout.astro
title: "Resume - Andrew Pollack-Gray"
mainClass: resume
---

## Andrew Pollack-Gray

Senior Software Engineer with expertise in infrastructure, developer tooling,
and cloud development; focused on building scalable systems that boost developer
productivity while optimizing cloud costs. Passionate about enabling confident,
easily reversible changes through automation, robust CI/CD processes, and
internal platform tooling. Skilled in leading technical initiatives, mentoring
engineers, and fostering a culture of continuous learning and growth.

[GitHub](https://github.com/andrewpollack) ·
[LinkedIn](https://www.linkedin.com/in/andrewpkq)

---

## Skills

**Languages:** Python · Go · Rust

**Technologies:** AWS · Linux · Docker · Kubernetes · Ansible · Terraform ·
Packer · Bazel · Jenkins · Buildkite · GitHub

---

## Experience

### Skydio — Senior Software Engineer (L5)

**Nov 2023 – Present · San Mateo, CA**

Cross-functional infrastructure team, designing and building scalable internal
tools that empower engineers to write, test, and release software with
confidence.

- Owned and operated core developer infrastructure on AWS and Kubernetes:
  - Managed provisioning, configuration, and operations using Packer, Ansible,
    Terraform, ArgoCD.
  - Operated CI platforms (Buildkite, GitHub Actions, Prow merge queue,
    Jenkins).
  - Maintained artifact repositories (Nexus Repository, Harbor) and developer
    cloud workstations (Coder).
  - Reduced toil through automation, improved monitoring, weekly on-call, and
    runbooks.
- Migrated CI control plane from Jenkins to Buildkite:
  - Improved security via isolated AWS environment and allow-list enforced
    egress proxying.
  - Built integration tooling to connect existing CI systems with Buildkite.
  - Added metrics tracking worker lifecycle to identify bottlenecks and drive
    optimization.
- Implemented merge-locking in Go for the CI merge queue (Prow), reducing batch
  cancellation rates from 20% to under 2% and saving ~140 minutes of CI time per
  batch merge.
- Led a Cloud Spend working group, shifting reviews to weekly cadence and
  leveraging AWS metrics + tagging to reduce CI and development costs by 25%.
- Won hackathon (team of two) by implementing Ruff tooling for Python linting,
  reducing lint checks per PR from ~60 minutes to under 15 minutes.

### Google LLC — Software Engineer (L4)

**Dec 2021 – Sep 2023 · Mountain View, CA**

Software Delivery team on Fuchsia. Built OTA update and package delivery
workflows with security, reliability, and recovery as core goals.

- Redesigned and implemented "RFC-0208: Distributing Packages with the SDK,"
  adding GN templates and target types; improved versioning, testing, and
  distribution for downstream customers.
- Developed host-to-target protocols for registering blob payload sources, using
  a Rust-based CLI.
- Facilitated the monthly Fuchsia Rust Working Group to improve Rust developer
  experience and ecosystem adoption.

### The Rust Project — Editor/Publisher, [This Week in Rust](https://this-week-in-rust.org)

**Nov 2021 – Present · Virtual**

Open source weekly newsletter with 30,000+ readers covering Rust developments,
learning resources, and community events.

- Developed Docker-based publishing workflow to ensure consistent static
  site/email generation.
- Participate in weekly publishing rotation; implemented a Discord bot to
  improve coordination.

### Fiddler Labs — Software Engineer II, Data Platform

**Nov 2020 – Nov 2021 · Palo Alto, CA**

Data Platform team building AI monitoring and explainability infrastructure.

- Restructured monitoring aggregation logic to enable horizontal scalability via
  application-level sharding, using a RabbitMQ pub/sub pattern deployed on
  Kubernetes.
- Designed a new ingest API supporting multiple formats (CSV, Parquet) and
  storage backends (S3, GCS), reducing new integration development time from
  days to hours.

---

## Education

### Bachelor of Science in Computer Science, Minor in Biology

**Stanford University · Class of 2020 · Stanford, CA**
