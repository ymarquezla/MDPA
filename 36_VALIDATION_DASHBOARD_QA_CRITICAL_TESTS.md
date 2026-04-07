# Validation Dashboard — QA Critical Tests (First Pass)

**Dashboard:** Validation | **Version:** 25.4.5.3
**QA Owner:** Preeti
**Scope:** 8 critical test cases — must all pass before client handoff
**Full Test Suite:** 35_VALIDATION_DASHBOARD_QA_TEST_CASES.md (72 total cases)
**Date:** April 2026

---

## Why These 8?

These tests catch the two most dangerous failure modes:
1. **Data doesn't balance** — bad numbers reach the client
2. **Critical data is missing** — CECL model cannot run

All 8 must pass before the dashboard is considered ready for client delivery. Failures here are blocking — do not proceed to client handoff until resolved.

---

## Critical Test Cases

### TC-P1-007 — Grand Total Balance Present
**Page:** 1 — Loan Validation
**Category:** Data Accuracy

| Field | Detail |
|-------|--------|
| Precondition | Page 1 is loaded with all filters at default (Source File = All, Reporting Period = Current Date). |
| Steps | Load Page 1. Locate the Grand Total row at the bottom of the Balances table. |
| Expected Result | Grand Total row is visible and shows a non-zero dollar value. |
| Fail Condition | Grand Total row is missing or shows $0. |
| Severity | **BLOCKING** |

---

### TC-P1-008 — Subgroup Balances Sum to Grand Total
**Page:** 1 — Loan Validation
**Category:** Data Accuracy

| Field | Detail |
|-------|--------|
| Precondition | Page 1 is loaded with all filters at default. |
| Steps | Export or manually sum all Loan Subgroup Current Balance rows. Compare to the Grand Total row. |
| Expected Result | Sum of all subgroup balances equals the Grand Total. Acceptable tolerance: ±$1. |
| Fail Condition | Sum of subgroups differs from Grand Total by more than $1. |
| Severity | **BLOCKING** |

---

### TC-P3-004 — Reconciliation Math Is Correct
**Page:** 3 — CO and Recovery Validation
**Category:** Data Accuracy

| Field | Detail |
|-------|--------|
| Precondition | Page 3 is loaded with all filters at default. |
| Steps | Locate the Charge Off Reconciliation table. Verify: Gross Charge Off Amount + Dropped Charge Offs = Grand Total Gross Charge Off Amount. |
| Expected Result | The arithmetic holds exactly. No rounding difference. |
| Fail Condition | Grand Total ≠ Gross + Dropped. |
| Severity | **BLOCKING** |

---

### TC-P3-005 — Dropped Charge-Offs Below 10% Threshold
**Page:** 3 — CO and Recovery Validation
**Category:** Business Rule

| Field | Detail |
|-------|--------|
| Precondition | Page 3 reconciliation table is visible. |
| Steps | Calculate: Dropped Charge Offs ÷ Grand Total Gross Charge Off Amount × 100. |
| Expected Result | Result is less than 10%. |
| Fail Condition | Dropped Charge Offs represent ≥ 10% of Grand Total — flag as a critical data quality issue. Client data must be corrected before model run. |
| Severity | **BLOCKING** |
| Note | Current client data shows ~97% of charge-offs dropped — this is a known critical issue to resolve with the client. |

---

### TC-P6-005 — Dropped Record Count Consistent with Page 3
**Page:** 6 — Dropped Records
**Category:** Data Accuracy

| Field | Detail |
|-------|--------|
| Precondition | Pages 3 and 6 are both loaded at default filters. |
| Steps | Count total rows in the Page 6 detail table. Compare to the "Dropped Charge Offs" row count shown in the Page 3 reconciliation table. |
| Expected Result | Both reflect the same number of dropped records. |
| Fail Condition | Page 6 and Page 3 show different dropped record counts. |
| Severity | **BLOCKING** |

---

### TC-P7-003 — Origination Date Is 0% Missing
**Page:** 7 — Data Completeness
**Category:** Business Rule

| Field | Detail |
|-------|--------|
| Precondition | Page 7 is loaded with Reporting Period Date = Current Date. |
| Steps | Locate the "No Origination Date" row in the completeness table. Check Count and % columns. |
| Expected Result | Count = 0 and % = 0.00%. |
| Fail Condition | No Origination Date count is greater than 0. This is a required field — any missing origination dates are a critical defect requiring immediate escalation. |
| Severity | **BLOCKING** |

---

### TC-XP-001 — Active Balance Consistent Across Pages
**Page:** Cross-Page (Pages 1, 2, 5, 9)
**Category:** Data Accuracy

| Field | Detail |
|-------|--------|
| Precondition | All pages loaded at default filters for the same reporting period. |
| Steps | Note the Grand Total Active Current Balance from: Page 1 (Balances Grand Total), Page 2 (Current Balance Grand Total), Page 5 (most recent month's Active Current Balance), Page 9 (Current Balance Grand Total). Compare all four values. |
| Expected Result | All four values match. Acceptable tolerance: ±$1. |
| Fail Condition | Any page shows a materially different active balance for the same reporting period. |
| Severity | **BLOCKING** |

---

### TC-XP-003 — Charge-Off Grand Total Consistent Across Pages
**Page:** Cross-Page (Pages 1 and 3)
**Category:** Data Accuracy

| Field | Detail |
|-------|--------|
| Precondition | Pages 1 and 3 loaded at default filters. |
| Steps | Note Charge Offs Grand Total on Page 1. Note Gross Charge Off Amount on Page 3 reconciliation table. Compare. |
| Expected Result | Values match. Acceptable tolerance: ±$1. |
| Fail Condition | Values differ by more than $1. |
| Severity | **BLOCKING** |

---

## Test Execution Log

| TC-ID | Page | Result | Notes | Tester | Date |
|-------|------|--------|-------|--------|------|
| TC-P1-007 | 1 | | | | |
| TC-P1-008 | 1 | | | | |
| TC-P3-004 | 3 | | | | |
| TC-P3-005 | 3 | | | | |
| TC-P6-005 | 6 | | | | |
| TC-P7-003 | 7 | | | | |
| TC-XP-001 | Cross | | | | |
| TC-XP-003 | Cross | | | | |

**Pass/Fail Summary:** _____ / 8 passed

**Sign-off (QA):** _________________________ Date: _____________

**Sign-off (PM):** _________________________ Date: _____________

---

**Prepared by:** Sprintendo — Loan Analytics Team
**QA Owner:** Preeti
**Full Test Suite:** 35_VALIDATION_DASHBOARD_QA_TEST_CASES.md
