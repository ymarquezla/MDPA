# Portal Documentation Analysis - Executive Summary

**Date:** 2026-03-23
**Analysis Status:** ✅ COMPLETE
**Files Analyzed:** 6 portal PDFs + 24 MDPA internal docs
**Time to Knowledge Transfer Deadline:** ~2 months (May 31, 2026)

---

## Critical Findings

### Finding #1: FAIR LENDING ALGORITHM UNDOCUMENTED (G01-001)
**Severity:** CRITICAL

**What Portal Says:**
- CFPB-approved BISG (Bayesian Improved Surname Geocoding) methodology
- 5-step process: surname prediction → metro area mapping → census data lookup → Bayesian calculation → geographic adjustment
- Outputs: Predicted Ethnicity (4 categories), Predicted Gender, Confidence scores
- 9 dashboards track rate variance, charge-offs, redlining by protected class

**What MDPA Docs Say:**
- "Fair Lending Files" mentioned as data source (Doc 14)
- NO algorithm description, confidence methodology, or output logic documented
- Team cannot explain HOW the system predicts ethnicity/gender

**Impact:**
- Team cannot troubleshoot Fair Lending features
- Cannot validate model assumptions
- Risk to regulatory compliance (ECOA/FHA exams)

**Action:** Schedule Fair Lending deep-dive session Week 2 (90 min) with SMEs

---

### Finding #2: CECL CALCULATION METHODOLOGY COMPLETELY MISSING (G01-004)
**Severity:** CRITICAL

**What Portal Says (159 pages):**
- 4 CECL methodologies: Vintage (historical loss pooling), Vintage Q (with qualitative adjustment), PD (probability of default), WARM (Call Report-based)
- Complete formulas for each method
- Expected Loss curves, vintage cohort construction, pro-rata allocation logic
- Loss Given Default (LGD) with collateral valuation hierarchy
- Scenario weighting, forecast/reversion periods
- Unfunded commitment treatment per methodology

**What MDPA Docs Say:**
- Doc 6 references CECL fields but NO formulas
- Doc 9-11 (data glossary, logical/physical models) do not document calculation logic
- Team has field names but not calculation methodology

**Impact:**
- Team cannot explain how reserves are calculated
- Cannot troubleshoot reserve discrepancies
- Cannot validate model inputs/outputs
- Certification requirements at risk (MountainView validation in progress)

**Action:** Distribute CECL User Guide to team immediately; schedule 3-4 methodology sessions Weeks 2-4

---

### Finding #3: Q3 2023 SYSTEM CHANGES NOT IN MDPA DOCS
**Severity:** CRITICAL

**What Portal Says (Aug-Sept 2023):**
1. **PD Null Credit Score Handling** (Aug 30, 2023)
   - Changed: null/empty credit scores now treated as "0" (vs. previous unhandled exception)
   - Impact: Affects reserve calculations for portfolio segments with incomplete credit data

2. **Gross vs. Net Charge-Offs** (July 2022)
   - Changed: All charge-off amounts now GROSS (not net)
   - Recovery: Managed via Recovery Factor parameter, not charge-off data

3. **Vintage Loss Rate Averaging** (July 2022)
   - Changed: Now includes years with zero charge-offs (more conservative)
   - Example: (0.02 + 0.08 + 0.00)/3 = 0.033 (vs. previous (0.02+0.08)/2 = 0.05)

4. **Weighted Scenarios for Vintage** (New feature)
   - New columns: Weighted Expected Losses (Vintage), Weighted Scenario Adjustment
   - Applies PD stress scenarios to Vintage methodology

5. **Loss Given Default Superior Mortgages** (Bug fix)
   - Reserve capped at current balance (prevents overstatement in stress scenarios)

6. **Dashboard Reorganization** (Aug 28-31, 2023)
   - Renamed: [Probability of Default_CECL] → [PD Visual Model]
   - Reordered dashboards to prioritize user inputs

**What MDPA Docs Say:**
- MDPA documentation finalized March 18, 2026
- Portal updates released August 2023 (v2022.1)
- **GAP: 7 months of system changes not documented**
- No mention of PD null credit score handling, gross vs. net charge-offs, new scenario features

**Impact:**
- Team operating with outdated procedures
- May be using net charge-offs when system expects gross
- May not be accounting for zero charge-off year effects
- Risk of incorrect reserve calculations

**Action:** Week 1 orientation session required; update Docs 1, 2, 6, 16 immediately

---

## Gap Summary by Severity

| Gap ID | Topic | MDPA Docs | Portal Source | Priority |
|--------|-------|-----------|---------------|----------|
| G01-001 | Fair Lending Algorithm | Missing | Fair Lending Guide | CRITICAL |
| G01-004 | CECL Calculation Methodology | Partial | CECL User Guide (159 pp) | CRITICAL |
| System Changes | Q3 2023 Updates | Missing | Portal Updates + TTAData v2022.1 | CRITICAL |
| MethodologyComparison | Vintage vs. PD vs. WARM | Missing | CECL Guide Ch. 2 | HIGH |
| ScenarioWeighting | Weighted expected losses | Missing | CECL Guide Ch. 4 | HIGH |
| UnfundedCommitments | ACL treatment | Missing | CECL Guide Ch. 5 | HIGH |
| LTVAssumptions | Collateral valuation | Missing | CECL Guide Ch. 3 | HIGH |

---

## Recommended Knowledge Transfer Schedule

**TOTAL HOURS:** 18 hours SME time + ~30 hours team member preparation

### WEEK 1: System Changes & Architecture (4 hours SME)
- Session 1A: Q3 2023 Updates & System Changes (90 min)
  - PD null credit score handling, gross vs. net, loss rate averaging, scenario features
  - Attendees: Entire Sprintendo team

- Session 1B: MDPA Process Overview & Macro Architecture (90 min)
  - Workflow stages, macro dependencies, critical decision points
  - Attendees: Venkat (TPA), Yomar (PM), Mwafaq (SM)

### WEEK 2: Undocumented Features (4 hours SME)
- Session 2A: Fair Lending Analysis Deep Dive (120 min) **[CRITICAL - UNDOCUMENTED FEATURE]**
  - BISG methodology, confidence scoring, dashboards, regulatory framework
  - Attendees: Venkat, Bhavani, Preeti, Yomar
  - Deliverable: Fair Lending technical runbook

- Session 2B: CECL Methodologies Overview (90 min) **[CRITICAL - CALCULATION METHODOLOGY]**
  - Vintage vs. PD vs. WARM framework, method selection criteria, parameters
  - Attendees: Bhavani (BI), Preeti (QA), Yomar (PM)
  - Deliverable: Methodology decision tree

### WEEK 3: CECL Deep Dive - Formulas (4 hours SME)
- Session 3A: Vintage Expected Loss Curves (120 min)
  - Historical pooling, vintage cohort construction, Year 1-7 derivation, vintage adjustment
  - Attendees: Bhavani, Preeti, Venkat
  - Deliverable: Vintage walkthrough with test data

- Session 3B: Probability of Default Methodology (120 min)
  - PD tables, LGD formula, collateral hierarchy, null credit score handling
  - Attendees: Bhavani, Preeti, Venkat
  - Deliverable: PD calculation validation suite

### WEEK 4: Scenarios & Special Topics (4 hours SME)
- Session 4A: Scenario Weighting & Forecast Period (90 min)
  - Weighted expected losses, stressor application, reversion period logic
  - Attendees: Bhavani, Preeti
  - Deliverable: Scenario adjustment decision log

- Session 4B: Unfunded Commitments & LTV Assumptions (90 min)
  - Collateral valuation, superior mortgage hierarchy, off-balance-sheet treatment
  - Attendees: Bhavani, Preeti, Venkat
  - Deliverable: Unfunded commitment treatment guide

- Session 4C: Data Quality & QA Procedures (90 min)
  - CECL data requirements, validation rules, quality gates, month-end processing
  - Attendees: Preeti, Venkat, Yomar
  - Deliverable: Updated QA runbook for Q3 2023 changes

### WEEK 5: Integration & Operations (2 hours SME)
- Session 5A: Dashboard Ecosystem & Reporting (90 min)
  - Tableau integration, dashboard navigation, peer group reconciliation
  - Attendees: Bhavani, Yomar
  - Deliverable: Updated dashboard navigation guide

- Session 5B: Month-End Execution & Troubleshooting (120 min)
  - Updated execution checklist, common issues, Q3 2023 resolution steps
  - Attendees: Venkat, Preeti, Mwafaq, Yomar
  - Deliverable: Month-end operational runbook

### WEEK 6: Knowledge Handoff (2 hours SME)
- Session 6A: Decision Log Review (90 min)
  - Review all 14 decision logs created during Weeks 1-5
  - Attendees: Entire Sprintendo team
  - Deliverable: Complete Decision Log + Product Playbook

- Session 6B: Independence Validation (120 min)
  - Role-specific testing, scenario exercises, knowledge sign-off
  - Attendees: Entire Sprintendo team
  - Deliverable: Team certification of readiness

---

## Files Created/Updated

✅ **PORTAL_CONTENT_ANALYSIS_FRAMEWORK.md** - Methodology for comparative analysis
✅ **PORTAL_CONTENT_GAPS.md** - 14-section detailed gap analysis (15+ pages)
✅ **PORTAL_CONTENT_SUMMARY.md** - This file (executive summary)

**Files Ready to Be Updated:**
- VALIDATION_PLAN.md (session schedule expansion)
- MDPA Docs 1, 2, 6, 16 (Q3 2023 changes integration)

---

## Next Actions (Priority Order)

### IMMEDIATE (This Week - 2026-03-24 to 2026-03-28)
1. **Brief Sprintendo team** on Q3 2023 system changes (1 hr call)
2. **Distribute portal documents** to team (PDFs or links)
3. **Schedule Week 1 sessions** (send calendar invites to SMEs)
4. **Create decision log template** for knowledge capture

### WEEK 1 (2026-03-31 to 2026-04-04)
1. **Execute Sessions 1A & 1B** (system changes + architecture)
2. **Capture decision logs** from sessions
3. **Identify deployment status** of Q3 2023 changes

### WEEKS 2-5 (2026-04-07 to 2026-05-02)
1. **Execute all feature & methodology sessions** (12 sessions)
2. **Create role-specific runbooks** as deliverables
3. **Accumulate decision logs** for Week 6 review

### WEEK 6 (2026-05-05 to 2026-05-09)
1. **Review all decision logs** with SMEs
2. **Validate team independence** through exercises
3. **Sign off on knowledge transfer** completion

### POST-TRANSFER (By 2026-05-31 DEADLINE)
1. **Update MDPA Docs 1, 2, 6, 16** with Q3 2023 changes
2. **Archive decision logs** as product history
3. **Begin independent operations** - Sprintendo team owns MDPA

---

## Success Metrics

✅ **Knowledge Transfer Complete When:**
- [ ] Fair Lending algorithm walkthrough documented and validated
- [ ] CECL calculation formulas verified against portal guide
- [ ] All Q3 2023 system changes operationalized
- [ ] Each team member explains their module independently
- [ ] Month-end procedures updated and executed
- [ ] SMEs can hand off with confidence

**Expected Outcome:** Sprintendo team ready for independent MDPA product support by May 31, 2026

---

**Analysis completed by:** Claude Code agent extraction (3 parallel agents)
**Portal documentation dates:** July 2024 - November 2023
**Status:** Ready for Sprintendo knowledge transfer sessions

