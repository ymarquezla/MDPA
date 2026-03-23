---
phase: 5
slug: data-lineage-confluence-publication
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js script + Confluence REST API (live verification) |
| **Config file** | none |
| **Quick run command** | `node -e "fetch('https://trellance.atlassian.net/wiki/rest/api/content/4244045841/child/page',{headers:{Authorization:'Basic '+Buffer.from(require('fs').readFileSync('/home/mabushanab/claude-agents/CLIP/dashboard/server/.env','utf8').match(/CONFLUENCE_API_TOKEN=(.+)/)[1]).toString('base64')}}).then(r=>r.json()).then(d=>console.log(d.results?.map(p=>p.title)))"` |
| **Full suite command** | Manual: visit Confluence page and verify content visually |
| **Estimated runtime** | ~10 seconds (API call) |

---

## Sampling Rate

- **After publish script runs:** Verify API returns page ID and 200 status
- **After wave completes:** Run quick command to confirm "Data Lineage Map" title appears under parent
- **Before `/gsd:verify-work`:** Visit page URL and confirm content is readable
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 05-01 | 1 | LIN-05 | automated | Node.js publish script exits 0 + prints page URL | ❌ W0 | ⬜ pending |
| 5-01-02 | 05-01 | 1 | LIN-05 | manual | Visit page URL, confirm content matches DATA_LINEAGE.md | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/publish-data-lineage.js` — adapted from Phase 3 script, creates page under parent 4244045841

*Wave 0 creates the publish script so Task 1 has an executable to run.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Page content matches DATA_LINEAGE.md | LIN-05 | Cannot auto-verify visual rendering quality | Open published page URL, spot-check: Part 1 source systems table, a Stage 4 transformation table, a Part 3 formula row, one traceability example |
| Stakeholder can trace field without repo access | LIN-05 | Requires human judgment on readability | Read page as if you had no context; confirm tables render, expand macros work, code blocks display formulas |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
