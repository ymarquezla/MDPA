---
phase: 6
slug: macro-inventory-cataloguing-and-risk-rating
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual review (documentation synthesis — no code execution) |
| **Config file** | none |
| **Quick run command** | `grep -c "^\| " /home/mabushanab/claude-agents/MDPA/MACRO_INVENTORY.md` |
| **Full suite command** | Manual checklist review against success criteria |
| **Estimated runtime** | ~5 minutes |

---

## Sampling Rate

- **After every task commit:** Verify MACRO_INVENTORY.md section is populated and row/entry count is growing
- **After every plan wave:** Run full checklist against MACRO_INVENTORY.md sections
- **Before `/gsd:verify-work`:** All four success criteria must be demonstrably true
- **Max feedback latency:** ~5 minutes (manual review)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 06-01 | 1 | MAC-01 | manual | `grep -c "^\| " MACRO_INVENTORY.md` | ❌ W0 | ⬜ pending |
| 6-01-02 | 06-01 | 1 | MAC-02 | manual | `grep -c "Logic Summary" MACRO_INVENTORY.md` | ❌ W0 | ⬜ pending |
| 6-02-01 | 06-02 | 2 | MAC-03 | manual | `grep -c "CRITICAL\|HIGH\|MEDIUM" MACRO_INVENTORY.md` | ❌ W0 | ⬜ pending |
| 6-02-02 | 06-02 | 2 | MAC-04 | manual | `grep -c "Dependency Map\|execution order" MACRO_INVENTORY.md` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `MACRO_INVENTORY.md` stub with section headers (Macro Index, Detailed Entries, Risk Summary, Dependency Map)

*Wave 0 creates the output artifact stub so all subsequent tasks have a file to write into.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All 20 macros are present with correct instance counts | MAC-01 | Requires comparison against XML extraction results | Read Macro Index table; confirm 20 rows, instance counts sum to 41, all 4 categories present |
| Logic summaries are plain-language and engineer-actionable | MAC-02 | Requires human judgment on description quality | Read 3 macro entries; confirm logic summary explains what the macro does without requiring Alteryx expertise |
| Risk ratings are accurate and actionable | MAC-03 | Requires cross-referencing GAP_ANALYSIS.md risk tiers | Read Risk Summary section; confirm every macro has a tier (CRITICAL/HIGH/MEDIUM), CReW macros flagged, temp-path macros flagged |
| Dependency map shows execution order | MAC-04 | Requires human verification of sequencing logic | Read Dependency Map section; confirm a developer could determine which macros must run before others |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
