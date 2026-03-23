---
phase: 4
slug: data-lineage-field-tracing-and-stage-mapping
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual review (documentation analysis — no code execution) |
| **Config file** | none |
| **Quick run command** | `grep -c "\|" /home/mabushanab/claude-agents/MDPA/DATA_LINEAGE.md` |
| **Full suite command** | Manual checklist review against success criteria |
| **Estimated runtime** | ~5 minutes |

---

## Sampling Rate

- **After every task commit:** Verify DATA_LINEAGE.md section is populated and table rows exist
- **After every plan wave:** Run full checklist against DATA_LINEAGE.md sections
- **Before `/gsd:verify-work`:** All four success criteria must be demonstrably true
- **Max feedback latency:** ~5 minutes (manual review)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 04-01 | 1 | LIN-01 | manual | `grep -c "Loan Portfolio" DATA_LINEAGE.md` | ❌ W0 | ⬜ pending |
| 4-01-02 | 04-01 | 1 | LIN-02 | manual | `grep -c "Stage" DATA_LINEAGE.md` | ❌ W0 | ⬜ pending |
| 4-01-03 | 04-01 | 1 | LIN-03 | manual | `grep -c "Decision FICO Grade" DATA_LINEAGE.md` | ❌ W0 | ⬜ pending |
| 4-01-04 | 04-01 | 1 | LIN-04 | manual | `grep -c "formula" DATA_LINEAGE.md` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `DATA_LINEAGE.md` stub with section headers (Source Systems, Processing Stages, Field Lineage, Derived Fields, Output Mapping)

*Wave 0 creates the output artifact stub so all subsequent tasks have a file to write into.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Every output field traces back to a source field | LIN-01 | Requires human judgment on completeness of lineage coverage | Pick 5 output fields from Client File, QA Report, Tableau Extract, Archive, Executive Summary; confirm each has a documented source in one of the 4 input systems |
| Each of 7 processing stages shows transformations per field | LIN-02 | Requires cross-referencing XML tool chain against stage labels | Read Stage Mapping section; confirm each stage entry lists tools, transformations, and field-level changes |
| All derived fields have full formula lineage paths | LIN-03 | Requires judgment on formula completeness | Read Derived Fields section; confirm Decision FICO Grade, Net Charge Off Amount, Vintage Adjusted Expected Losses, Probability of Default each have full formula + source field documentation |
| Report is usable for troubleshooting without repo access | LIN-04 | Requires human reading | Read DATA_LINEAGE.md top-to-bottom without referring to XML; confirm a developer could use it to trace a data issue |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
