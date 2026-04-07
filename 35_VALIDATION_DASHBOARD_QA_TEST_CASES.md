# Validation Dashboard — QA Test Cases

**Dashboard:** Validation | **Version:** 25.4.5.3
**Prepared for:** Preeti (QA Analyst) — Sprintendo Team
**Reference Document:** 33_VALIDATION_DASHBOARD_ONBOARDING_GUIDE.md
**Date:** April 2026

---

## How to Use This Document

Each test case includes:
- **TC-ID** — Unique test case identifier
- **Page** — Dashboard page the test applies to
- **Category** — Type of test (Filter, Data Accuracy, Visual, Business Rule, Edge Case)
- **Preconditions** — What must be true before running the test
- **Steps** — Exact actions to perform
- **Expected Result** — What should happen if the dashboard is working correctly
- **Fail Condition** — What indicates a defect

Test cases are organized by dashboard page. Run them in page order during a full regression cycle.

---

## Page 1 — Loan Validation (Tie Out / Validation Summary)

### Filters

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P1-001 | Filter | Source File Filter — default state | Open Page 1. Observe Source File Filter. | Filter defaults to "All" and all source files are included in totals. | Filter defaults to a single file, excluding data. |
| TC-P1-002 | Filter | Source File Filter — single file isolation | Select one specific source file from the Source File Filter. | Balances and Charge Offs tables update to show only records from that file. Grand Total decreases accordingly. | Totals do not change after filtering, or filter has no effect. |
| TC-P1-003 | Filter | Charge Off Date — default range | Open Page 1. Check the Charge Off Date filter. | Defaults to "Last 5 Years." Date range label shows correct start/end dates (e.g., 4/8/2021–4/7/2026). | Date range is incorrect, blank, or does not reflect a 5-year window. |
| TC-P1-004 | Filter | Charge Off Date — custom range | Change Charge Off Date to Last 3 Years. | Charge Offs table updates to show only charge-offs within the last 3 years. Prior years disappear from the table columns. | Table does not update, or shows data outside the selected range. |
| TC-P1-005 | Filter | Reporting Period Date — default | Open Page 1. Check the Reporting Period Date filter. | Defaults to "Current Date" (most recent month-end as-of date). | Filter defaults to a historical date or shows blank. |
| TC-P1-006 | Filter | Reporting Period Date — historical | Change Reporting Period Date to a prior month. | Balances table updates to show balances as of that historical date. Grand Total changes to reflect the prior period portfolio. | Grand Total does not change, or page shows current data regardless of selection. |

### Balances Table

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P1-007 | Data Accuracy | Grand Total balance present | Load Page 1 with all filters at default. | Grand Total row is visible at the bottom of the Balances table and shows a non-zero dollar value. | Grand Total row is missing or shows $0. |
| TC-P1-008 | Data Accuracy | Loan Subgroup sum equals Grand Total | Sum all Loan Subgroup balance rows manually or via export. | Sum of all subgroup balances equals the Grand Total. Acceptable rounding tolerance: ±$1. | Sum of subgroups does not match Grand Total by more than $1. |
| TC-P1-009 | Business Rule | No active subgroup shows negative balance | Review all rows in Balances table. | No Loan Subgroup shows a negative Current Balance. | Any subgroup shows a negative balance value. |
| TC-P1-010 | Business Rule | All expected loan subgroups present | Compare Balances table rows against the client's known product list. | Every product type the client has indicated should appear as a row. | A known active product type is missing from the table. |
| TC-P1-011 | Edge Case | Subgroup with zero balance | If a known product has no active loans, observe its row. | Either the subgroup does not appear (filtered out) or appears with $0 balance. A $0 balance subgroup should be investigated — document for client follow-up. | A subgroup appears with a balance but the client has confirmed no active loans for that product. |

### Charge Offs Table

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P1-012 | Data Accuracy | Charge Off years match filter range | Set Charge Off Date to Last 5 Years. Observe column headers. | Columns display the correct calendar years within the filter range (e.g., 2022, 2023, 2024, 2025, 2026). | Columns show years outside the filter range. |
| TC-P1-013 | Data Accuracy | Grand Total charge-off equals sum of years | Sum the Grand Total values across all year columns for one subgroup. | Grand Total for that subgroup equals the sum of its individual year amounts. | Grand Total does not equal the sum of year columns. |
| TC-P1-014 | Business Rule | No negative charge-off amounts | Review all values in the Charge Offs table. | All charge-off amounts are zero or positive. | Any cell shows a negative charge-off amount. |
| TC-P1-015 | Business Rule | Charge-off subgroups may differ from balance subgroups | Compare Charge Offs table rows to Balances table rows. | Charge Offs table may include subgroups not in Balances (fully charged-off products with no remaining active balance). This is expected. | A subgroup appears in Charge Offs but has never been a valid product type for the client. |

### Charge Off Date × Origination Year Table

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P1-016 | Data Accuracy | Cross-tab rows and columns are labeled | Open the bottom cross-tab table. | Rows are labeled by Charge Off Year. Columns are labeled by Origination Year. All labels are non-blank. | Row or column headers are blank or unlabeled. |
| TC-P1-017 | Business Rule | Pre-2023 originations filtered out | Check for origination year columns earlier than 2023 per the page note. | Loans originated before 2023 that charged off are not shown in this cross-tab. A page note explains this filter. | Pre-2023 origination year data appears in the cross-tab without explanation. |
| TC-P1-018 | Business Rule | No charge-off amount exceeds original loan balance | Review cross-tab values for any single cell. | No individual cell value (charge-off in a given year for a given vintage) should exceed a reasonable portfolio bound. Flag outliers for investigation. | A single cell shows a charge-off amount many times larger than would be plausible for a single vintage cohort. |

---

## Page 2 — Loan Type Validation (Balances by Loan Type)

### Filters

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P2-001 | Filter | Loan Status default filter = ACTIVE | Open Page 2. Check the Filters pane. | Page Filter shows Loan Status = ACTIVE. Only active loans are displayed. | Filters pane shows Loan Status as blank or ALL, including non-active loans in the table. |
| TC-P2-002 | Filter | Source File Filter isolation | Select a single source file. | Loan Type table updates to show only codes from that file. | Table does not change after selecting a specific source file. |
| TC-P2-003 | Filter | Reporting Period Date | Change to a prior reporting period. | Balances update to reflect that period's data. | Balances remain unchanged regardless of period selected. |

### Balances by Loan Type Table

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P2-004 | Data Accuracy | Loan Type codes are present for all subgroups | Review each Loan Subgroup row. | Each subgroup has at least one Loan Type code mapped to it. No subgroup row is blank in the Loan Type column. | A Loan Subgroup row has a blank or null Loan Type code. |
| TC-P2-005 | Data Accuracy | Subgroup balances roll up to Page 1 Grand Total | Sum all Current Balance values on Page 2. | Grand Total of Page 2 balances equals the Grand Total on Page 1 Balances table (same filters). Tolerance: ±$1. | Page 2 Grand Total differs from Page 1 Grand Total by more than $1. |
| TC-P2-006 | Business Rule | L0099 absence (clean data) | Check whether L0099 appears in the Loan Type column. | L0099 should NOT appear. Its presence indicates unmapped or misclassified loans. If found, flag as a defect for client data investigation. | L0099 appears in the Loan Type column. |
| TC-P2-007 | Business Rule | Revolving products show non-zero Available Credit | Identify revolving product subgroups (CONS – CREDIT CARD, R/E – HOME EQUITY, etc.). | Available Credit is non-zero for revolving products. | Available Credit = $0 for a revolving product, indicating credit limit data is missing. |
| TC-P2-008 | Business Rule | Non-revolving products show $0 or blank Available Credit | Identify installment product subgroups (AUTO, R/E – 1ST MORTGAGE, etc.). | Available Credit is $0 or blank for non-revolving products. | An installment loan subgroup shows a non-zero Available Credit value (likely a mapping error). |
| TC-P2-009 | Edge Case | No duplicate Loan Type codes within a subgroup | Review each subgroup's Loan Type codes. | Each Loan Type code appears only once within a given subgroup. | The same Loan Type code appears on two different rows within the same subgroup. |
| TC-P2-010 | Edge Case | No Loan Type code mapped to two different subgroups | Scan all Loan Type codes across all subgroups. | Each Loan Type code maps to exactly one Loan Subgroup. | The same Loan Type code (e.g., L0007) appears under two different Loan Subgroups. |

---

## Page 3 — CO and Recovery Validation

### Charge Offs and Recoveries by Year

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P3-001 | Data Accuracy | Charge Off totals match Page 1 | Compare Gross Charge Off Grand Total on Page 3 top table to Page 1 Charge Offs Grand Total. | Values match. Tolerance: ±$1. | Values differ by more than $1. |
| TC-P3-002 | Business Rule | Recovery Amount does not exceed Gross Charge Off in any year | Check Recovery Amount vs. Gross Charge Off Amount for each year row. | Recovery Amount ≤ Gross Charge Off Amount for every year. Net charge-offs must be ≥ $0. | Recovery Amount exceeds Gross Charge Off Amount for any year (net charge-off would be negative). |
| TC-P3-003 | Edge Case | Recovery Amount = $0 — flag for investigation | Check if all Recovery Amount values are $0. | If $0 across all years, flag this as a data quality finding. Document for client review: confirm whether recovery data is missing from the source extract. | (This is a data quality flag, not a hard pass/fail — document the finding.) |

### Charge Off Reconciliation Table

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P3-004 | Data Accuracy | Reconciliation math is correct | Verify: Gross Charge Off Amount + Dropped Charge Offs = Grand Total Gross Charge Off Amount. | The arithmetic holds exactly. | Grand Total ≠ Gross + Dropped. |
| TC-P3-005 | Business Rule | Dropped Charge Offs < 10% of Grand Total (warning threshold) | Calculate: Dropped ÷ Grand Total × 100. | Result is less than 10%. If ≥ 10%, flag as a critical data quality issue requiring resolution before model run. | Dropped Charge Offs represent ≥ 10% of Grand Total Gross Charge Off Amount. |
| TC-P3-006 | Business Rule | Gross Charge Off Amount matches processed charge-off history | Cross-reference Gross Charge Off Amount against Page 1 Charge Offs Grand Total (same filter window). | Values match. Tolerance: ±$1. | Values differ by more than $1. |

### Recoveries by Charge Off Year and Recovery Year

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P3-007 | Business Rule | Null charge-off date recoveries flagged | Check for any row in the recovery table where Charge Off Year = Null. | If any Null rows exist, they are clearly visible and labeled. The page note explaining they are excluded from CECL is present. | Null charge-off date recoveries appear but are not flagged or explained. |
| TC-P3-008 | Visual | Page note is visible | Scroll to the bottom of the page. | The embedded note "Recoveries where Charge Off date is 'Null'..." is visible and readable. | Note is missing, truncated, or obscured. |

---

## Page 4 — Charge-Off KPIs

### Charge-Off KPI Table

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P4-001 | Data Accuracy | Net Charge Off = Gross Charge Off minus Recoveries | For any FICO Grade row, verify: Net CO Balance = Gross CO Balance - Recovery Amount. | Arithmetic holds for every row. | Net CO Balance does not equal Gross minus Recoveries for any row. |
| TC-P4-002 | Data Accuracy | Gross Charge Off Ratio calculation | For any FICO Grade row, verify: Gross CO Ratio = Gross CO Balance ÷ Total Portfolio Balance. | Result matches the displayed ratio. Tolerance: ±0.01%. | Displayed ratio does not match the calculated ratio. |
| TC-P4-003 | Data Accuracy | Sum of FICO Grade balances equals Grand Total portfolio | Sum all Total Portfolio values by FICO Grade. | Sum equals the Grand Total Portfolio value. Tolerance: ±$1. | Sum differs from Grand Total by more than $1. |
| TC-P4-004 | Business Rule | FICO Grade ordering is A+, A, B, C, D, E, NR | Observe the row order in the KPI table. | Grades appear in order: A+, A, B, C, D, E, NR. | Grades appear out of order or a grade is missing from the table. |
| TC-P4-005 | Business Rule | Higher-risk grades have higher charge-off ratios (directional check) | Compare Gross CO Ratio for A+ vs. E grade. | E grade Gross CO Ratio > A+ grade Gross CO Ratio. (Lower credit quality = higher loss rate.) | A+ grade shows a higher charge-off ratio than E or D grades. |
| TC-P4-006 | Filter | Loan Subgroup filter updates KPI table | Select a single Loan Subgroup. | All KPI values update to reflect only that subgroup's data. Grand Total decreases. | Table does not update after subgroup selection. |
| TC-P4-007 | Filter | Original FICO Grade filter | Select a single FICO Grade from the filter. | KPI table shows only that grade's row. Grand Total updates. | Table shows all grades regardless of filter selection. |

### Default Risk Tables

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P4-008 | Data Accuracy | HIGH + MED + LOW loan counts equal total charged-off loans | Sum the loan counts across HIGH, MED, LOW tiers. | Total equals the Grand Total count of charged-off loans shown elsewhere on the page. | Sum of tiers does not equal the Grand Total loan count. |
| TC-P4-009 | Business Rule | HIGH default risk charge-off rate > LOW default risk rate | Compare % Charge Off for HIGH vs. LOW tier. | HIGH % Charge Off > LOW % Charge Off. | LOW % Charge Off exceeds or equals HIGH % Charge Off (suggests risk model miscalibration). |
| TC-P4-010 | Data Accuracy | % of Charge Offs by risk tier sums to 100% | Sum HIGH + MED + LOW percentages from the Charge Off Groups table. | Sum = 100% (±0.1% for rounding). | Sum is materially above or below 100%. |

---

## Page 5 — Balance and Record Growth

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P5-001 | Data Accuracy | Each month's Active Current Balance matches Page 1 balance for that period | Select a historical reporting period on Page 1. Compare its Grand Total to the corresponding row on Page 5. | Values match. Tolerance: ±$1. | Page 5 monthly balance differs from Page 1 for the same period by more than $1. |
| TC-P5-002 | Data Accuracy | Balance Growth calculation is correct | For any two consecutive rows, verify: Balance Growth = Current Month Balance - Prior Month Balance. | Arithmetic holds. Negative value (shrink) is displayed in parentheses. | Balance Growth column does not match the calculated difference. |
| TC-P5-003 | Data Accuracy | Loan Record Growth is non-negative | Review all Loan Record Growth values. | All values are ≥ 0. (The system adds records; it does not delete them month-over-month in normal operation.) | Any row shows a negative Loan Record Growth value — flag for investigation. |
| TC-P5-004 | Business Rule | Record growth in stable months is consistent with origination volume | Compare Loan Record Growth for months where no system changes are known. | Record growth is low and consistent (typically 50–200 new records per month for a typical credit union). | Any single month shows record growth > 3x the average of surrounding months — flag as anomaly. |
| TC-P5-005 | Business Rule | February 2026 spike is documented | Locate the February 2026 row. | Record growth of 1,049 and balance growth of $18,511,826 are present. This known anomaly should be visible and flagged for client follow-up. | February 2026 row is missing from the table. |
| TC-P5-006 | Visual | Months are in chronological order | Review the As-of Date column. | Rows are ordered oldest to newest (ascending by date). | Rows appear out of chronological order. |
| TC-P5-007 | Visual | Embedded description is present | Scroll to top of page. | The page description explaining Unique Identifier behavior is visible. | Description is missing or truncated. |

---

## Page 6 — Dropped Records

### Bar Chart

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P6-001 | Visual | Bar chart displays at least one drop reason | Open Page 6. | Bar chart is visible and shows at least one bar with a labeled drop reason and count. | Bar chart is blank or shows no data. |
| TC-P6-002 | Data Accuracy | Bar chart count matches detail table count | Count the rows in the detail table for a given drop reason. | Count matches the bar height/label for that drop reason. | Bar chart shows a different count than the number of rows in the detail table for the same reason. |
| TC-P6-003 | Business Rule | "Charged Off Loan Type Change" is present as a drop reason | Check bar chart labels. | The reason "Charged Off Loan Type Change" is visible with a count of 13,026 (or updated count per current data). | This reason is absent from the bar chart when the client has charged-off loan type changes in their data. |

### Detail Table

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P6-004 | Data Accuracy | All dropped records show Loan Type = L0099 (for current data) | Filter detail table by drop reason "Charged Off Loan Type Change." Review Loan Type column. | All records in that filter show Loan Type = L0099. | Records with drop reason "Charged Off Loan Type Change" show a loan type other than L0099. |
| TC-P6-005 | Data Accuracy | Dropped record count matches reconciliation table | Count total rows in detail table. Compare to "Dropped Charge Offs" count shown on Page 3 reconciliation. | Counts match. | Dropped count on Page 6 differs from Dropped Charge Offs on Page 3. |
| TC-P6-006 | Business Rule | Dropped records show $0 or blank Current Balance | Review Current Balance column for dropped records. | Current Balance is $0 or blank for all dropped records (they are charged-off, not active). | Dropped records show a non-zero Current Balance (would indicate an active loan being incorrectly dropped). |
| TC-P6-007 | Business Rule | Charge Off Amount is non-zero for dropped records | Review Charge Off Amount column. | Charge Off Amount is non-zero for records dropped due to "Charged Off Loan Type Change." | Charge Off Amount = $0 for a record that is supposed to be a charged-off loan. |
| TC-P6-008 | Filter | Source File filter isolates dropped records by file | Select a single source file. | Detail table updates to show only dropped records from that file. Bar chart also updates. | Table and chart do not update after source file selection. |
| TC-P6-009 | Edge Case | Export button is functional | Click the Export button in the toolbar. | Export initiates and produces a downloadable file (CSV or Excel). File contains the same records visible in the detail table. | Export fails, produces an empty file, or produces a file with more/fewer records than the table. |

---

## Page 7 — Data Completeness

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P7-001 | Data Accuracy | Number of Records matches Page 2 total active loan count | Compare Number of Records on Page 7 to the total row count on Page 2. | Values match. | Values differ by more than a small rounding tolerance. |
| TC-P7-002 | Data Accuracy | % Missing = Count Missing ÷ Number of Records × 100 | For any completeness metric, verify: % = (Count Missing ÷ Total Records) × 100. | Displayed percentage matches the calculated value. Tolerance: ±0.01%. | Displayed percentage does not match the calculated value. |
| TC-P7-003 | Business Rule | Origination Date — 0% missing | Locate "No Origination Date" row. | Count = 0 and % = 0.00%. Any non-zero value here is a critical defect requiring immediate escalation. | No Origination Date count is greater than 0. |
| TC-P7-004 | Business Rule | Missing credit scores do not exceed 70% threshold | Check "% No Original Credit Score" and "% No Current Credit Score." | Both percentages are below 70%. Above 70% is a critical threshold that severely limits CECL model accuracy — flag for client escalation. | Either credit score missing rate exceeds 70%. |
| TC-P7-005 | Filter | Allowance Group filter updates metrics | Select a specific Allowance Group. | All completeness metrics update to reflect only records in that group. | Metrics do not change after Allowance Group selection. |
| TC-P7-006 | Filter | Reporting Period Date filter | Change to a prior reporting period. | Metrics update to reflect data as of that period. Total record count and missing counts may differ. | Metrics remain unchanged regardless of period selected. |
| TC-P7-007 | Visual | Source file name is displayed | Open Page 7. | The source file name (e.g., 0476_2026-03-31_SNOWFLAKEOUTPUT.YXDB) is visible as a label or header for the completeness table. | No source file identifier is shown. |

---

## Page 8 — Monthly Data Completeness

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P8-001 | Data Accuracy | March 2026 values match Page 7 exactly | Compare all completeness metrics for the most recent month (March 2026) on Page 8 to Page 7 values. | All values are identical for the same month. | Any metric differs between Page 7 and the corresponding month column on Page 8. |
| TC-P8-002 | Data Accuracy | Record count trend is monotonically increasing or explained | Review Number of Records column month-over-month. | Record count increases each month, or any decrease is accompanied by a known explanation (e.g., client data correction). | Record count decreases from one month to the next with no explanation. |
| TC-P8-003 | Business Rule | No completeness metric worsens by more than 10 percentage points in a single month | Check month-over-month change for all metrics. | No metric increases by more than 10 percentage points in a single month. A sudden jump indicates a new data quality issue. | Any metric shows a month-over-month increase of more than 10 percentage points. |
| TC-P8-004 | Business Rule | Origination Date remains 0% missing for all months | Check "No Origination Date" row across all 13 months. | All cells show 0 or 0.00%. | Any month shows a non-zero missing origination date. |
| TC-P8-005 | Visual | All 13 months are present (March 2025 – March 2026) | Count the month columns on Page 8. | 13 columns are present, covering March 2025 through March 2026. | Fewer than 13 months are displayed, indicating a data gap. |
| TC-P8-006 | Filter | Allowance Group filter applies across all months | Select a specific Allowance Group. | All month columns update to show metrics for only that group. | Some month columns update and others do not. |

---

## Page 9 — Key Characteristics of the Loan Portfolio

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-P9-001 | Data Accuracy | Grand Total balance matches Page 1 and Page 2 | Compare Grand Total Current Balance on Page 9 to Page 1 Balances Grand Total. | Values match. Tolerance: ±$1. | Page 9 Grand Total differs from Page 1 Grand Total by more than $1. |
| TC-P9-002 | Data Accuracy | Grand Total record count matches Page 7 | Compare Number of Records Grand Total on Page 9 to Number of Records on Page 7. | Values match. | Values differ. |
| TC-P9-003 | Data Accuracy | Weighted Average calculation — FICO | For any single subgroup: verify WA Original FICO is plausible (between 300 and 850). | All WA Original FICO values fall between 300 and 850, or are blank for products with no scored borrowers. | Any WA FICO value falls outside the 300–850 range for a scored product (indicates a calculation error). |
| TC-P9-004 | Business Rule | WA CLTV for real estate products is > 0 | Check WA CLTV for R/E subgroups. | WA CLTV is positive and > 0% for all real estate products. | WA CLTV = 0 for a real estate product (missing collateral value data). |
| TC-P9-005 | Business Rule | WA CLTV for unsecured products may be negative or zero | Check WA CLTV for CONS – UNSECURED, CONS – STUDENT LOANS, etc. | Negative or zero CLTV is acceptable for unsecured products (no collateral). Document the values — do not flag negative CLTV for these product types as a defect. | Negative CLTV appears for a secured product (e.g., AUTO or MORTGAGE). |
| TC-P9-006 | Business Rule | WA Current FICO not more than 50 points below WA Original FICO for any subgroup | Compare WA Original FICO to WA Current FICO for each subgroup. | Difference (Original - Current) is ≤ 50 points for all subgroups. A larger gap indicates credit quality deterioration. | Any subgroup shows a WA Current FICO more than 50 points below its WA Original FICO — flag for client discussion. |
| TC-P9-007 | Business Rule | WA Term for auto loans is between 36 and 96 months | Check WA Term for all AUTO subgroups. | WA Term is between 36 and 96 months for auto products. | WA Term for any AUTO subgroup is below 36 or above 96 months (possible data entry error). |
| TC-P9-008 | Business Rule | Revolving products show non-zero Available Credit | Check Available Credit for CONS – CREDIT CARD, R/E – HOME EQUITY. | Available Credit is non-zero. | Available Credit = $0 for a revolving product (missing credit limit data). |
| TC-P9-009 | Visual | Drill-through Loan Details button functions | Click the Loan Details button for any subgroup row. | A drill-through opens showing loan-level detail for that subgroup. Data in the drill-through matches the aggregated values on Page 9. | Drill-through does not open, opens blank, or shows data for the wrong subgroup. |
| TC-P9-010 | Data Accuracy | Available Credit Grand Total is plausible | Review Available Credit Grand Total. | Value is ≥ 0 and reflects the total open credit line exposure across revolving products. | Available Credit Grand Total is negative or zero when the portfolio contains revolving products. |

---

## Cross-Page Tests

These tests verify consistency across multiple dashboard pages.

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-XP-001 | Data Accuracy | Active balance is consistent across all pages | Note Grand Total Active Current Balance from Pages 1, 2, 5 (most recent month), and 9. | All four values match. Tolerance: ±$1. | Any page shows a materially different active balance for the same reporting period. |
| TC-XP-002 | Data Accuracy | Total record count is consistent across pages | Note Number of Records from Pages 7 and 9. | Values match. | Values differ. |
| TC-XP-003 | Data Accuracy | Charge-off Grand Total is consistent across pages 1 and 3 | Compare Charge Offs Grand Total on Page 1 to Gross Charge Off Amount on Page 3 reconciliation table. | Values match. Tolerance: ±$1. | Values differ by more than $1. |
| TC-XP-004 | Business Rule | Dropped record count is consistent across pages 3 and 6 | Compare "Dropped Charge Offs" amount on Page 3 to total record count on Page 6. | Both reflect the same number of dropped records. | Page 3 and Page 6 show different dropped record counts. |
| TC-XP-005 | Filter | Reporting Period Date filter on Page 1 changes Page 1 data only | Change Reporting Period Date on Page 1. Navigate to Page 2. | Page 2 retains its own Reporting Period Date setting (Current Date default). Filters are per-page, not global. | Changing the filter on Page 1 changes data on Page 2 or other pages. |

---

## Global Controls

| TC-ID | Category | Test Description | Steps | Expected Result | Fail Condition |
|-------|----------|-----------------|-------|-----------------|----------------|
| TC-GC-001 | Visual | Data As Of footer is present on every page | Navigate through all 9 pages. | Every page displays "Data As Of: [date]" in the footer. | Any page is missing the Data As Of footer. |
| TC-GC-002 | Visual | Version number is present on every page | Navigate through all 9 pages. | Every page displays the version number (e.g., 25.4.5.3) in the footer. | Any page is missing the version number. |
| TC-GC-003 | Visual | Loan Details drill-through button is functional on applicable pages | Click Loan Details button on Pages 1, 2, 4, and 9. | Drill-through opens with loan-level detail for the selected record or subgroup. | Button is missing, inactive, or drill-through opens blank. |
| TC-GC-004 | Visual | Source File Filter appears on all applicable pages | Check Pages 1, 2, 3, and 6 for the Source File Filter. | Filter is present and functional on all applicable pages. | Filter is missing or does not function on any applicable page. |

---

## Test Execution Summary Template

Use this table to track results during a test run.

| TC-ID | Page | Result (Pass/Fail/N/A) | Notes | Tester | Date |
|-------|------|----------------------|-------|--------|------|
| TC-P1-001 | 1 | | | | |
| TC-P1-002 | 1 | | | | |
| ... | | | | | |

**Total Test Cases:** 72
**Critical Tests (must pass before client handoff):** TC-P1-007, TC-P1-008, TC-P3-004, TC-P3-005, TC-P6-005, TC-P7-003, TC-XP-001, TC-XP-003

---

**Prepared by:** Sprintendo — Loan Analytics Team
**QA Owner:** Preeti
**Reference:** 33_VALIDATION_DASHBOARD_ONBOARDING_GUIDE.md
**Dashboard Version:** 25.4.5.3
