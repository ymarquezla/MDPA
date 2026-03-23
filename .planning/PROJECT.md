# MDPA Workflow Analysis

## What This Is

A deep analysis initiative for the MDPA (Monthly Data Process Assessment) Alteryx workflow v5.2 — a 300+ tool pipeline that processes 10K–50K credit union loans monthly across 7 stages, 15+ macros, and 4 data sources to produce client files, QA reports, Tableau dashboards, and executive summaries. The goal is to produce structured analysis artifacts (gap report, lineage map, macro inventory, and validation suite) for both the technical team maintaining the workflow and business stakeholders who rely on its outputs.

## Core Value

A complete, verified understanding of what the MDPA workflow actually does — from raw inputs to final dashboard — so the team can maintain, troubleshoot, and eventually migrate it with confidence.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Gap analysis report identifying undocumented logic, broken dependencies, and missing coverage in existing docs
- [ ] Structured data lineage map from all 4 source systems through 7 processing stages to 5 output types
- [ ] Full macro inventory: all 15+ macros with purpose, inputs, outputs, logic summary, and dependency risk
- [ ] Validation test suite: testable rules to verify workflow produces correct output per documented business logic
- [ ] All deliverables published to both the MDPA repo (Markdown) and Trellance Confluence (TREL space)

### Out of Scope

- Rewriting or porting the Alteryx workflow to another stack — analysis only in this milestone
- Modifying the `.yxmd` workflow file itself
- Connecting to live source systems (analysis is doc-based)

## Context

- **Workflow file:** `2020_DataProcess_v5.2.yxmd` — 300+ tools, ~2.5 hour runtime
- **Original developer:** vnekkanti (may not be reachable — knowledge transfer is a key driver)
- **Known risks:** Macros reference temporary staging paths (`D:\Users\vnekkanti\AppData\Local\Temp\...`) that break on other machines; CReW library macros (4) need separate installation on Alteryx Server
- **Documentation state:** 14 files, ~673 pages already written — but analysis of gaps, lineage accuracy, and testability hasn't been done
- **Data sources:** Loan Portfolio (ERP), Charge-Off/Recovery, Real Estate Valuations (appraisal system), TransUnion Credit Bureau
- **Outputs:** Client delivery file, QA report, Tableau extract, archive, executive summary
- **Confluence:** TREL space at `https://trellance.atlassian.net/wiki/spaces/TREL` — MDPA parent page ID `4244045841`
- **Audience:** Loan Analytics team (technical) + business stakeholders (non-technical)

## Constraints

- **Source:** Analysis must be based on the `.yxmd` XML and existing documentation — no live system access assumed
- **Stack:** Output artifacts are Markdown (repo) + Confluence pages (stakeholder delivery)
- **Scope:** This is analysis, not migration — do not propose rewrites unless surfaced as a gap

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Repo + Confluence dual delivery | Repo = source of truth; Confluence = stakeholder visibility | — Pending |
| Analysis-only scope (no rewrite) | Need to understand before rebuilding; migration is a future milestone | — Pending |
| GSD phases organized by deliverable type | Gap report, lineage, macros, and tests are independent enough to phase separately | — Pending |

---
*Last updated: 2026-03-18 after initialization*
