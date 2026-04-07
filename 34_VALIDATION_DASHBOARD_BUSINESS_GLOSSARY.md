# Validation Dashboard — Business Glossary

**Scope:** Terms and metrics used across all 9 pages of the Validation Dashboard (Version 25.4.5.3)
**Audience:** Client onboarding team, data analysts, QA, and client-facing staff

---

| Term | Definition |
|------|-----------|
| **Active Current Balance** | The total outstanding unpaid principal balance across all active (non-charged-off) loans at a given reporting date. |
| **Allowance Group** | A classification grouping of loans used for CECL allowance calculation purposes (e.g., by collateral type or product). |
| **Available Credit** | The unused portion of a revolving credit facility (e.g., credit card, HELOC). Calculated as credit limit minus current balance. |
| **Balance Growth / (Shrink)** | Month-over-month change in the total active portfolio balance. A negative value in parentheses indicates a net decrease. |
| **CECL** | Current Expected Credit Loss. The accounting standard (ASC 326) requiring financial institutions to estimate and reserve for lifetime expected credit losses on loans at origination. |
| **Charge Off** | The formal write-off of a loan balance deemed uncollectible by the institution. Results in a debit to the Allowance for Loan and Lease Losses (ALLL) or Allowance for Credit Losses (ACL). |
| **Charge Off Amount** | The dollar balance written off at the time of charge-off. |
| **Charge Off Date** | The date on which a loan was formally charged off by the institution. |
| **Charge Off Ratio (Gross)** | Gross Charge Off Balance divided by Total Portfolio Balance. Measures raw loss rate before recoveries. |
| **Charge Off Ratio (Net)** | (Gross Charge Offs minus Recoveries) divided by Total Portfolio Balance. Measures loss rate net of amounts recovered. |
| **CLTV (Combined Loan-to-Value)** | The ratio of the total loan balance to the appraised value of the collateral. A negative CLTV may indicate collateral value exceeds the total loan obligation. Used primarily for real estate and auto loans. |
| **Credit Limit** | The maximum authorized borrowing amount on a revolving credit product. |
| **Current Balance** | The outstanding unpaid principal balance on a loan as of the reporting date. |
| **Data Completeness** | A measure of the percentage of records that contain required data fields. Incomplete records may be excluded from model calculations. |
| **Days Past Due (DPD)** | The number of calendar days a scheduled loan payment is overdue. A DPD of 0 indicates current status. |
| **Default Risk** | A tiered classification (HIGH, MEDIUM, LOW) indicating the likelihood of a borrower defaulting. Used to segment portfolio risk and analyze charge-off concentrations. |
| **Drop Reason** | The specific cause for which a loan record was excluded from system processing (e.g., "Charged Off Loan Type Change" — loan type was changed after charge-off, making the record invalid for processing). |
| **Dropped Records** | Loan records present in the source file that could not be processed by the system due to data conflicts, invalid mappings, or rule violations. These records are excluded from all CECL calculations until resolved. |
| **FICO Grade** | A letter-grade classification of borrower credit quality derived from FICO score ranges: A+ (highest), A, B, C, D, E, NR (Not Rated). |
| **FICO Score (Current)** | The most recent credit bureau score for the borrower, used to track credit quality migration. |
| **FICO Score (Original)** | The borrower's credit bureau score at the time the loan was originated. |
| **Grand Total** | The sum of all values across all groups or categories in a given table or visual. |
| **Gross Charge Off Amount** | The total dollar amount of loans charged off, before any recoveries are subtracted. |
| **Interest Rate** | The annual percentage rate charged on the outstanding balance of a loan. |
| **Loan Record Growth** | The number of new unique loan records added to the system between two consecutive reporting periods. |
| **Loan Status** | The current standing of a loan (e.g., ACTIVE, CHARGED OFF). The Loan Type Validation page filters for ACTIVE loans by default. |
| **Loan Subgroup** | A business-level categorization of loans that groups similar products (e.g., AUTO – DIRECT NEW, CONS – CREDIT CARD, R/E – HOME EQUITY). Used throughout the dashboard for analysis and tie-out. |
| **Loan Type (Code)** | An internal alphanumeric code (e.g., L0001, L0007, L0099) that maps directly to a Loan Subgroup. The client's source system must assign valid loan type codes to all records. |
| **Net Charge Off Balance** | Gross Charge Off Balance minus Recovery Amount. Represents the actual financial loss to the institution. |
| **NR (Not Rated)** | A FICO grade designation for borrowers who do not have a scoreable credit file. |
| **Origination Date** | The date on which a loan was originally funded and the borrower-lender agreement became effective. |
| **Original Balance** | The principal amount of the loan at the time of origination. |
| **Peer Group Name** | Equivalent to Loan Subgroup on the Key Characteristics page. Refers to the business segment used for peer benchmarking. |
| **Recovery Amount** | Dollars collected on a loan after it has been charged off. Recoveries reduce the net loss to the institution. |
| **Reporting Period Date** | The as-of date for which data is displayed. Typically set to "Current Date" (most recent available data as of month-end). |
| **Source File** | The data extract provided by the client's core system or data warehouse. Each file represents a specific reporting date snapshot. The file name typically includes the date and system identifier (e.g., 0476_2026-03-31_SNOWFLAKEOUTPUT.YXDB). |
| **Tie Out** | The reconciliation process of comparing the client's source data totals against the system's computed values to confirm they match. A successful tie-out indicates data integrity. |
| **Unique ID** | The system-generated primary key for each loan record, composed of account number, loan suffix, and other institution-specific identifiers. Duplication or unexpected patterns in Unique IDs can cause data integrity issues. |
| **Version** | The software/model version number displayed on each page footer (e.g., 25.4.5.3). Useful for tracking which model version was used during a client's validation cycle. |
| **Vintage (Origination Year)** | The year a loan was originated. Used to analyze charge-off patterns by loan cohort — newer vintages typically have lower cumulative losses than older ones. |
| **Weighted Average** | A calculation that weights each value by the outstanding balance of the corresponding loan, ensuring that larger loans have proportionally more influence on the metric. Used for FICO, CLTV, and Term. |
| **Weighted Average Term** | The average remaining or original loan term (in months), weighted by current balance. |

---

**Prepared by:** Sprintendo — Loan Analytics Team
**Date:** April 2026
**Dashboard Version:** 25.4.5.3
**Related Document:** [33_VALIDATION_DASHBOARD_ONBOARDING_GUIDE.md](33_VALIDATION_DASHBOARD_ONBOARDING_GUIDE.md)
