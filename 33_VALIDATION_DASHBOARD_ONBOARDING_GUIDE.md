# Validation Dashboard — Onboarding Guide

**Dashboard Name:** Validation
**Data As Of:** 3/31/2026 | **Version:** 25.4.5.3 | **Last Updated:** 4/3/2026
**Workspace:** 10966-MPCU-prod-loan-analytics-data-validation

---

## Overview

The Validation Dashboard is used during the client onboarding process to verify the integrity, completeness, and accuracy of loan portfolio data ingested from the client's source system. It compares client-provided data against expected system calculations and flags anomalies, dropped records, missing fields, and inconsistencies across loan balances, charge-offs, and recoveries.

The dashboard is organized into **9 pages (tabs)**, each serving a distinct validation purpose.

---

## Dashboard Pages

### Page 1: Loan Validation — Tie Out / Validation Summary

**Purpose:** The primary summary page. It reconciles loan balances and charge-off activity by loan subgroup across multiple years. Used to "tie out" the client's data against the system's computed values.

**Filters Available:**
- Source File Filter – Select one or all source files
- Charge Off Date – Filter by a lookback period (e.g., Last 5 Years); range shown as 4/8/2021–4/7/2026
- Reporting Period Date – Defaults to Current Date

**Visuals / Tables:**

| Section | Description |
|---------|-------------|
| Balances | Displays Current Balance by Loan Subgroup. Grand Total shown (e.g., $159,318,910). |
| Charge Offs | Shows Gross Charge Off Amounts by Loan Subgroup broken out by year (2023, 2024, 2025, 2026). Grand Total: $2,066,847. |
| Charge Off Date × Origination Year | Cross-tab of charge-off amounts by loan origination year. Useful for vintage analysis. |

**Button:** "Loan Details" — Drills through to loan-level detail for any selected subgroup.

---

### Page 2: Loan Type Validation — Balances by Loan Type

**Purpose:** Validates that loan subgroups are correctly mapped to specific Loan Type codes (e.g., L0001, L0030, L0100). Confirms the correct classification of each loan by its internal loan type identifier.

**Filters Available:**
- Source File Filter
- Reporting Period Date — Current Date
- Page Filter: Loan Status = ACTIVE (visible in the Filters pane)

**Visual / Table:**

| Column | Description |
|--------|-------------|
| Loan Subgroup | Business category (e.g., AUTO – DIRECT NEW, CONS – CREDIT CARD) |
| Loan Type | Internal code (e.g., L0001, L0007, L0030, L0100) |
| Current Balance | Active outstanding balance per loan type |
| Available Credit | Open credit line availability (relevant for revolving products) |

**Key Use:** Verify that all loan type codes present in the source file are correctly mapped to a loan subgroup. Unmapped or unexpected codes should be flagged for investigation.

---

### Page 3: CO and Recovery Validation — Charge Offs and Recoveries

**Purpose:** Validates charge-off and recovery amounts by year, and reconciles dropped records against the system totals.

**Filters Available:**
- Source File Filter
- Reporting Period Date — Current Date

**Visuals / Tables:**

| Section | Description |
|---------|-------------|
| Charge Offs and Recoveries by Charge Off Year | Gross Charge Off Amount and Recovery Amount by year. Grand Total CO: $2,066,847. |
| Reconciliation Table | Gross Charge Off Amount + Add: Dropped Charge Offs = Grand Total Gross Charge Off Amount ($80,442,987). |
| Recoveries by Charge Off Year and Recovery Year | Identifies recoveries where no corresponding charge-off date exists (Null). These are flagged because recoveries on loans with no Charge Off date are not used in CECL calculations. |

> **Important Note:** "Recoveries where Charge Off date is 'Null', if any, indicate recoveries on loans where no Charge Off exists in our records. Recoveries on loans where no Charge Off exist are not utilized in our CECL calculations."

---

### Page 4: Charge-Off KPIs

**Purpose:** Provides risk-tiered performance KPIs for charge-off activity over a 12-month lookback window. Used to assess portfolio credit quality at onboarding.

**Filters Available:**
- Reporting Period Date — Current Date
- Loan Subgroup — All
- Original FICO Grade — All

**Visuals / Tables:**

| Section | Description |
|---------|-------------|
| Charge Offs (12-Month Lookback) by FICO Grade | Gross Charge Off Balance and Net Charge Off Balance by FICO grade (A+, A, B, C, D, E, NR). Grand Total: $783,971. |
| Charge Off Ratios | Gross and Net Charge Off Ratio by FICO grade and Grand Total (0.49%). |
| Total Portfolio by FICO Grade | Portfolio balance breakdown: Grand Total $159,318,910. |
| Default Risk Commentary | Narrative describing distribution of charged-off loans across HIGH, MEDIUM, and LOW default risk categories. |
| Loans by Default Risk (by Loan Subgroup) | Table showing charge-off amounts split by HIGH, MED, LOW default risk tiers per loan subgroup. |
| Charge Off Groups — Last 12 Months | % of Charge Offs by default risk. HIGH = 9.97%, MED = 5.08%, LOW = 85.55% of total. |
| % Charge Off by Default Risk | HIGH = 1.75%, MED = 0.53%, LOW = 0.60%, Total = 0.64%. |

---

### Page 5: Balance and Record Growth

**Purpose:** Tracks changes in portfolio balance and loan record counts month over month. Used to identify unusual spikes in data volume that may indicate data quality issues with unique identifier generation.

> **Description (embedded):** "Our system creates a record for each Unique Identifier that did not exist the month before. Substantial, atypical record growth in the current month may indicate inconsistencies with how your system is generating your account numbers, loan suffixes or other fields utilized in creating your Unique Identifier."

**Filters Available:** None (page shows all data by as-of date)

**Visual / Table:**

| Column | Description |
|--------|-------------|
| As-of Date | Month-end date |
| Active Current Balance | Total outstanding balance at month end |
| Balance Growth / (Shrink) | Month-over-month change in balance |
| Number of Loan Records | Count of unique active loans |
| Loan Record Growth | Month-over-month change in record count |

**Key Use:** Flag months with atypical record growth (e.g., February 2026 showed a jump of 1,049 new records and $18.5M balance growth — worth reviewing for data anomalies).

---

### Page 6: Dropped — Records Dropped from System

**Purpose:** Lists all loan records that were excluded (dropped) from system processing, along with the reason. Used to quantify and investigate data that could not be processed.

**Filters Available:**
- Source File — All
- Reporting Period Date — Current Date

**Visuals / Tables:**

| Section | Description |
|---------|-------------|
| Bar Chart | Count of records dropped by drop reason. Example: "Charged Off Loan Type Change" = 13,026 records dropped. |
| Detail Table | Loan-level list of dropped records including: Unique Id, Loan Type, Current Balance, Original Balance, Interest Rate, Credit Limit, Days Past Due, Charge Off Amount, Recovery Amount. |

**Key Use:** Any dropped records must be reviewed. High volumes of dropped records — particularly for the "Charged Off Loan Type Change" reason — indicate a mapping or classification issue in the source data that requires resolution before CECL model calculations are run.

---

### Page 7: Data Completeness

**Purpose:** Identifies missing (null/blank) values in key fields required for CECL model processing. Completeness issues typically originate at the source system level.

> **Description (embedded):** "The purpose of this Dashboard is to identify inaccurate or incomplete (missing) data. Typically, issues with data originate at the source system level and as such, completeness is presented by source input file."

**Filters Available:**
- Reporting Period Date — Current Date
- Allowance Group — All

**Visual / Table (per Source File):**

| Metric | Description | Sample Value |
|--------|-------------|-------------|
| Number of Records | Total records in the source file | 14,314 |
| No Original Score | Records missing original credit score | 7,086 |
| % No Original Credit Score | Percentage missing | 49.50% |
| No Current Credit Score | Records missing current FICO score | 6,799 |
| % No Current Credit Score | Percentage missing | 47.50% |
| No Origination Date | Records with no origination date | 0 |
| % No Origination Date | Percentage missing | 0.00% |
| No Maturity Date or Available Credit | Records missing maturity date or credit limit | 65 |
| % No Maturity Date or Available Credit | Percentage missing | 0.45% |

**Key Use:** High rates of missing credit scores (Original or Current) are common but should be flagged and communicated to the client. Missing origination dates or maturity dates are more critical and must be resolved.

---

### Page 8: Monthly Data Completeness

**Purpose:** Extends the Data Completeness analysis across multiple months to identify trends in data quality over time.

**Filters Available:**
- Allowance Group — All

**Visual / Table:** Same metrics as Data Completeness (Page 7), presented in a monthly time series from March 2025 through March 2026.

**Key Use:** Use to determine if data quality issues are **persistent (systemic)** vs. **new (one-time)**. Consistent missing credit scores month-over-month confirm a systemic limitation in the client's source system.

---

### Page 9: Key Characteristics of the Loan Portfolio

**Purpose:** Summarizes the weighted average credit characteristics of the loan portfolio by loan subgroup. Provides a snapshot for model calibration and peer benchmarking.

**Filters Available:**
- Loan Details button (drill-through)

**Visual / Table:**

| Column | Description |
|--------|-------------|
| Peer Group Name | Loan subgroup (e.g., AUTO – DIRECT NEW, R/E – HOME EQUITY) |
| Number of Records | Count of active loans |
| Current Balance | Outstanding balance |
| Available Credit | Open credit line |
| Weighted Avg. Original FICO | FICO score at origination, weighted by balance |
| Weighted Avg. Current FICO | Most recent FICO score, weighted by balance |
| Weighted Avg. CLTV | Combined Loan-to-Value ratio, weighted by balance |
| Weighted Avg. Term | Loan term in months, weighted by balance |

**Sample Grand Totals:**
- Records: 14,314
- Balance: $159,318,910
- Available Credit: $167,463,436
- WA Original FICO: 736.8
- WA Current FICO: 732.5
- WA CLTV: 57.7%
- WA Term: 195.0 months

---

## Global Controls

| Element | Description |
|---------|-------------|
| Loan Details Button | Present on most pages. Drills through to a loan-level detail view for the selected record or subgroup. |
| Source File Filter | Allows selection of a specific source input file (used when multiple files are loaded). |
| Reporting Period Date | Defaults to "Current Date" (most recent as-of date). Can be changed to review historical snapshots. |
| Data As Of / Version | Footer on each page showing data currency and software version (e.g., 3/31/2026, Version 25.4.5.3). |

---

**Prepared by:** Sprintendo — Loan Analytics Team
**Date:** April 2026
**Status:** Active — used for client onboarding
