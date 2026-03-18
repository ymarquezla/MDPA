---
phase: 2
slug: gap-analysis-prioritization-and-report
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual review (documentation transformation — no code execution) |
| **Config file** | none |
| **Quick run command** | `grep -c "Critical\|Medium\|Low" /home/mabushanab/claude-agents/MDPA/GAP_ANALYSIS.md` |
| **Full suite command** | Manual checklist review against success criteria |
| **Estimated runtime** | ~5 minutes |

---

## Sampling Rate

- **After every task commit:** Verify Priority column exists and section is populated
- **After every plan wave:** Run full checklist against GAP_ANALYSIS.md
- **Before `/gsd:verify-work`:** All three success criteria must be demonstrably true
- **Max feedback latency:** ~5 minutes (manual review)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 02-01 | 1 | GAP-04 | manual | `grep -c "Critical" GAP_ANALYSIS.md` | ✅ | ⬜ pending |
| 2-01-02 | 02-01 | 1 | GAP-04 | manual | `grep -c "## Remediation" GAP_ANALYSIS.md` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — GAP_ANALYSIS.md already exists from Phase 1. No stub creation needed.

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Every gap has exactly one priority tier | GAP-04 | Requires human judgment on triage accuracy | Read Priority column in all three gap tables; confirm no row has blank or dual tiers |
| Remediation list is engineer-actionable | GAP-04 | Requires human judgment on clarity | Read each remediation item; confirm it includes what to do, what file/tool to change, and what done looks like |
| Report is coherent as standalone doc | GAP-04 | Requires human reading | Read GAP_ANALYSIS.md from top to bottom without referring to source docs; confirm it makes sense |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
