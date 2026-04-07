# Validation Dashboard — Client Onboarding Guide

**Report:** Validation | **Data As Of:** 3/31/2026 | **Version:** 25.4.5.3 | **Last Updated:** 4/3/2026
**Workspace:** 10966-MPCU-prod-loan-analytics-data-validation

---

## How to Use This Guide

This guide is designed to walk you through the Validation Dashboard with a new client during the onboarding process. Each section covers one dashboard page: what it shows, how to interpret it, what to look for, what healthy vs. problematic data looks like, and the key questions or talking points to raise with the client. Work through the pages in order — they build on each other.

**Before starting, confirm the following with the client:**
- What is the source system (core system, data warehouse, Snowflake export, etc.)?
- What is the reporting cutoff date (should match the "Data As Of" footer on each page)?
- Has the client provided a complete extract, or is this a partial file?
- Is this the first time this client's data has been loaded, or is this a refresh?

---

## Page 1 — Loan Validation
### Tie Out / Validation Summary

**Purpose:** This is the primary reconciliation page. It confirms that the loan balance and charge-off data in the system matches what the client provided. Think of this as the "starting point" of the onboarding conversation — if the numbers here don't tie out, everything downstream will be off.

### Filters — Set These First

Before reviewing any numbers, walk the client through the three filters at the top:

- **Source File Filter** — Defaults to "All." If the client has provided multiple source files (e.g., different loan categories or multiple core systems), you can isolate one file at a time here. Ask the client: "Did you provide data from more than one source system or file?" If yes, filter one at a time to validate each independently before reviewing the combined view.
- **Charge Off Date** — Defaults to Last 5 Years (currently showing 4/8/2021–4/7/2026). This controls how many years of charge-off history are pulled into the Charge Offs table. For onboarding, 5 years is standard. If the client's portfolio is newer or older, adjust accordingly. Note: loans originated before 2023 that charged off are filtered out of the Charge Off Date × Origination Year cross-tab at the bottom — this is expected behavior, and the page includes a note explaining it.
- **Reporting Period Date** — Defaults to "Current Date," which pulls the most recent data as-of month-end. Do not change this unless you are doing a historical review.

### Balances Table (Left Panel)

This table shows the current outstanding principal balance by Loan Subgroup — these are the active, non-charged-off loans in the portfolio.

**What to do:** Compare the Grand Total here ($159,318,910) against the total balance the client provided in their source file or trial balance. These numbers should match exactly, or within a very small rounding tolerance.

**What to look for:**
- Grand Total matches the client's reported total balance
- All expected loan subgroups are present (ask the client for a list of their product types before the call)
- No unexpected subgroups appearing that the client didn't mention
- No subgroups with $0 balance that should have balances (may indicate a mapping failure)

**Red flags:**
- Grand Total is significantly lower than the client's reported balance — this often means records were dropped (see Page 6)
- A subgroup is missing entirely — the loan type codes for that product may not be mapped
- An unexpected subgroup appears — loan type codes may be miscategorized
- "CONS – UPSTART SIGNATURE" or similar third-party program balances appearing for the first time — confirm with the client if they have partnerships or sub-serviced loans

**Questions to ask the client:**
- "Can you confirm your total active loan portfolio balance as of [reporting date]?"
- "Do these product categories match the loan types you offer? Do you see anything missing or unexpected?"
- "Do you have any loans sub-serviced by a third party that may be in your data?"

### Charge Offs Table (Right Panel)

This table shows Gross Charge Off amounts by Loan Subgroup broken out by year (2023, 2024, 2025, 2026). The Grand Total row shows total charge-offs across all years.

**What to do:** Compare the Grand Total row ($439,755 in 2023 / $701,130 in 2024 / $777,266 in 2025 / $148,697 in 2026 / Grand Total $2,066,847) to what the client has reported in their call reports or internal charge-off schedules.

**What to look for:**
- Year-over-year trends: are charge-offs growing, flat, or declining? A consistent growth trend in charge-offs is expected in a growing portfolio; a sudden spike deserves a conversation
- Subgroups with charge-offs that didn't appear in the Balances table — this means the loan was fully charged off and is no longer active, which is normal
- Subgroups with $0 charge-offs across all years — if this is a product that typically charges off (e.g., unsecured consumer), this may mean charge-off records are missing from the source file
- The "Charged Off Loan Type Change" issue that is reflected in the Dropped page — some charge-offs may be in Page 6 rather than here

**Red flags:**
- Grand Total charge-offs are significantly lower than what the client reports — check the Dropped page (Page 6) for a reconciling difference
- A sharp increase in 2025–2026 charge-offs in CONS – UNSECURED or CONS – CREDIT CARD — ask the client if there was a policy change or economic event
- Subgroups like R/E – 1ST MORTGAGE or R/E – HOME EQUITY showing charge-offs — real estate charge-offs are less common and should be verified

**Questions to ask the client:**
- "Do these charge-off totals align with what you've reported internally or on your call report?"
- "Have there been any charge-off policy changes in the past two years — for example, changes to when you charge off revolving vs. installment loans?"
- "Are there any charge-offs we should expect to see that aren't appearing here?"

### Charge Off Date × Origination Year (Bottom Table)

This cross-tab breaks down charge-off amounts by the year the loan was originally funded (vintage) against the year it charged off. It is one of the most analytically rich sections on this page.

**What to look for:**
- 2019 vintage shows the highest cumulative charge-off amount ($1,206,756 Grand Total) — this is expected, as older loans have had more time to season and default
- Loans originated in 2023 or 2024 charging off quickly (within 1–2 years of origination) may signal underwriting issues in those vintages
- Loans originated before 2023 that charged off are filtered out of this table (noted at the bottom of the page) — if the client has a long charge-off history, those pre-2023 originations are excluded from this view

**Red flags:**
- A 2023 or 2024 origination year showing large charge-off amounts in 2025 or 2026 — early default on recent originations is a credit quality concern
- A vintage year with no charge-offs at all when the product type historically defaults — may indicate data is missing

**Questions to ask the client:**
- "Does the charge-off pattern by vintage match what you'd expect based on your underwriting history?"
- "Were there any underwriting changes in 2022–2023 that might affect default rates on those vintages?"

---

## Page 2 — Loan Type Validation
### Balances by Loan Type

**Purpose:** This page maps every individual Loan Type code (e.g., L0001, L0007, L0100) to its corresponding Loan Subgroup and confirms the balance for each. It validates that the client's internal loan type codes are correctly mapped in the system. This page is filtered to show Active loans only (Loan Status = ACTIVE, visible in the Filters pane).

### Balances by Loan Type Table

Each row represents a specific loan type code within a subgroup. For example, AUTO – DIRECT NEW contains L0001, L0030, and L0077. Each code contributes a specific balance to the total subgroup balance shown on Page 1.

**What to do:** Review this table with the client's IT or core system contact. Ask them to provide a list of all loan type codes in their system and confirm each one maps to the correct product category.

**What to look for:**
- Every loan type code the client uses should appear in this table
- The balance per loan type code should reflect the client's expectation (e.g., L0007 AUTO – DIRECT USED is $13,607,257 — is that plausible for this client's auto portfolio?)
- Available Credit column: for revolving products like CONS – CREDIT CARD (L0100), this should be non-zero. If a revolving product shows $0 available credit, the credit limit field may be missing from the source file

**Red flags:**
- A loan type code appearing under the wrong subgroup — e.g., an auto loan code mapped to CONS — indicates a mapping configuration error that must be corrected before the model runs
- A loan type code from the client's system that does not appear in this table at all — those records may have been dropped (check Page 6)
- L0099 appearing in this table — L0099 is a catch-all code used when a loan type cannot be matched. Its presence means some loans could not be classified and will likely appear on the Dropped page
- Available credit showing $0 for CONS – CREDIT CARD or similar revolving products — the credit limit field must be populated for CECL revolving credit calculations

**Questions to ask the client:**
- "Can you provide a complete list of loan type codes from your core system and what each one represents?"
- "Are there any loan types in your system that you do not see listed here?"
- "For your credit card or HELOC products, does your system capture both the outstanding balance and the credit limit separately?"

---

## Page 3 — CO and Recovery Validation
### Charge Offs and Recoveries

**Purpose:** This page validates the charge-off totals including the reconciliation of records that were dropped from processing, and validates recovery data. It also specifically flags recoveries that have no matching charge-off record — which is critical because those cannot be used in CECL calculations.

### Charge Offs and Recoveries by Charge Off Year (Top Table)

This table shows Gross Charge Off Amount, Recovery Amount, and net Charge Offs by year, matching the totals from Page 1.

**What to look for:**
- Recovery Amount shows $0 across all years in the current data — this is a significant finding. It means either the client has collected no recoveries on charged-off loans (uncommon for a mature portfolio) or recovery data is not being provided in the source file
- If the client has recoveries but they show as $0 here, check whether recovery transactions are being captured in the source system and included in the data extract

**Red flags:**
- Recovery Amount = $0 across all years for a portfolio with years of charge-off history — this is abnormal. Most credit unions and banks recover some portion of charged-off debt through collections, sale, or garnishment
- Recovery Amount dramatically higher than charge-offs in a given year — could indicate a data loading error (e.g., principal payments being misclassified as recoveries)

### Charge Off Reconciliation Table (Middle Section)

This table is critical for understanding the full scope of charge-offs. It shows:

| Column | Meaning |
|--------|---------|
| Gross Charge Off Amount | Charge-offs that processed successfully ($2,066,847) |
| Add: Dropped Charge Offs | Charge-offs in the source file that were dropped and not processed ($78,376,140) |
| Grand Total Gross Charge Off Amount | The true total of all charge-offs the client provided ($80,442,987) |

**What this means:** The client's source file contains $80,442,987 in charge-offs total, but only $2,066,847 processed. The difference — $78,376,140 — is the amount on the Dropped page that could not be processed, primarily due to the "Charged Off Loan Type Change" issue. This is a very large drop rate and must be resolved before CECL calculations are meaningful.

**Red flags:**
- Dropped Charge Offs that represent a significant portion (more than 5–10%) of total charge-offs are a serious data quality concern
- In this case, approximately 97% of charge-offs were dropped — this is a critical issue that must be the top priority for resolution

**Questions to ask the client:**
- "Are you aware that the loan type codes on your charged-off loans differ from the loan type codes on those same loans when they were active?"
- "Do loan type codes in your system change after charge-off? For example, does your core system reclassify loans to a different code when they are charged off?"
- "What process does your system use to change the status of a loan after it is charged off?"

### Recoveries by Charge Off Year and Recovery Year (Bottom Table)

This section validates recovery data and specifically flags recoveries where no Charge Off date exists in the system.

> **Note:** "Recoveries where Charge Off date is 'Null', if any, indicate recoveries on loans where no Charge Off exists in our records. Recoveries on loans where no Charge Off exist are not utilized in our CECL calculations."

**What this means:** If a recovery payment comes in on a loan that has no charge-off date in the data, the system cannot use that recovery in the CECL model. Currently showing $0, which is consistent with the finding above that no recovery data is present.

**What to look for:** Once the client provides recovery data, verify that each recovery record has a corresponding charge-off date. Any Null row in this table represents recoveries that will be excluded from CECL and should be investigated.

---

## Page 4 — Charge-Off KPIs
### 12-Month Charge-Off Performance

**Purpose:** This page provides a risk-tiered, performance-oriented summary of charge-off activity over the most recent 12-month lookback window. It is used to contextualize credit quality for the CECL model and to verify that the risk segmentation in the data is functioning correctly.

### Filters

- **Loan Subgroup** — Can be filtered to focus on one product category. For onboarding, keep this at "All" first to get a portfolio-wide view, then drill into any segments that look unusual.
- **Original FICO Grade** — Filters the KPI table by borrower credit grade at origination. Keeping this at "All" gives the blended portfolio view.

### Charge-Off KPI Table (Top Section)

This table breaks down 12-month charge-off activity by FICO Grade (A+, A, B, C, D, E, NR).

| Metric | What It Tells You |
|--------|------------------|
| Gross Charge Off Balance | Total dollar amount charged off per grade in the last 12 months |
| Net Charge Off Balance | Gross minus recoveries (currently same as Gross since recoveries = $0) |
| Gross Charge Off Ratio | Charge-off balance ÷ total portfolio balance per grade |
| Net Charge Off Ratio | Net charge-offs ÷ total portfolio balance |
| Total Portfolio | Balance in that FICO grade bucket |

Current data: Grand Total Net Charge Off Ratio = 0.49%. Total Portfolio = $159,318,910.

**What to look for:**
- The E and NR (Not Rated) grades typically have the highest charge-off ratios — in this data, E = 2.90% and NR = 2.90%, which is consistent with expectations
- A+ and A grade charge-off ratios should be very low — here they are 0.09% and 0.14%, which is healthy
- NR (Not Rated) carrying a 2.90% charge-off ratio at $198,860 — this is a flag. Ask the client what percentage of their portfolio has no FICO score and why
- A very high NR portfolio balance ($6,847,618) means a significant portion of the portfolio is not scored — this matters for the CECL model's predictive accuracy

**Red flags:**
- A+ or A grades showing charge-off ratios above 0.50% — unexpected for high-credit-quality borrowers and may indicate a scoring issue
- C or D grades showing charge-off ratios below 0.50% — too low for subprime-adjacent borrowers and may indicate charge-off timing issues (loans not being written off promptly)
- NR grade carrying a large portfolio share — affects model reliability; ask the client to investigate why scores are missing

### Default Risk Commentary and Table (Bottom Left)

This section categorizes charge-offs by a three-tier default risk model (HIGH, MEDIUM, LOW).

Current data: Of 120 loans charged off in the period, 11 were graded HIGH Default Risk, 11 were MEDIUM, and 98 were LOW.

**What this means:** 81.7% of charged-off loans (98 of 120) were LOW default risk at the time they were flagged. This seems counterintuitive — loans rated as low risk are charging off at the highest volume. This can happen for several reasons: the low-risk bucket is the largest segment of the portfolio by volume, or the risk model has not yet been fully calibrated to this client's specific loss patterns.

**Questions to ask the client:**
- "Are you familiar with how default risk tiers are applied in the model? Would you like us to walk through the criteria?"
- "Do you have your own internal risk rating or delinquency-based tier system we should compare against?"

### Charge Off Groups Table (Bottom Right)

This table shows the 12-month charge-off totals by default risk tier and the percentage of the total portfolio each tier represents.

Key metric: % Charge Off by Default Risk — HIGH = 1.75%, MED = 0.53%, LOW = 0.60%, Total = 0.64%.

**What to look for:** The HIGH default risk tier has a charge-off rate of 1.75% — nearly 3x the LOW risk tier's 0.60%. This is directionally correct (higher risk = higher losses), but the spread is relatively narrow. A well-functioning risk model would typically show a much wider spread (e.g., HIGH at 5%+ vs. LOW below 0.25%).

**Red flags:**
- HIGH and LOW default risk tiers with similar charge-off ratios — indicates the risk segmentation may not be discriminating well between risky and safe borrowers
- LOW risk tier carrying a higher charge-off rate than MED risk tier — indicates a model calibration issue

---

## Page 5 — Balance and Record Growth
### Month-over-Month Portfolio Tracking

**Purpose:** This page monitors changes in portfolio balance and loan record count month over month. Its primary use in onboarding is to detect data anomalies — specifically, unusual spikes in new records that might indicate the client's Unique ID generation has changed, causing the system to treat existing loans as new ones.

### Understanding the Table

| Column | What It Means |
|--------|--------------|
| As-of Date | Month-end reporting date |
| Active Current Balance | Total active portfolio balance at that month-end |
| Balance Growth / (Shrink) | Dollar change from prior month (negative = shrinkage) |
| Number of Loan Records | Count of distinct active loan records |
| Loan Record Growth | Count of new records not seen in the prior month |

> **Embedded description:** "Our system creates a record for each Unique Identifier that did not exist the month before. Substantial, atypical record growth in the current month may indicate inconsistencies with how your system is generating your account numbers, loan suffixes or other fields utilized in creating your Unique Identifier."

### Walkthrough of the Data

- **March 2025 → August 2025:** Balance grows from $123M to $133M with Loan Record Growth = 0. This means no new unique loan IDs were detected — the system recognized all records from prior months. This is normal and expected.
- **September–December 2025:** Small record growth of 46, 120, 80, and 92 loans respectively — these represent genuinely new loans being added to the portfolio each month. This is expected and healthy.
- **January 2026:** Record growth of 118. Normal.
- **February 2026:** Record growth of 1,049 and balance growth of $18,511,826 — this is a notable spike. In one month, 1,049 "new" records appeared and $18.5 million in new balance was added. This is materially higher than any prior month.
- **March 2026:** Record growth of 337 and $3,958,124 balance growth — elevated but lower than February.

**What to look for:**
- Months where record growth is dramatically higher than the portfolio's typical new originations volume
- Months where balance growth is flat but record growth is high (or vice versa) — this asymmetry is unusual
- The February 2026 spike warrants a direct question to the client

**Red flags:**
- A single month where record count jumps by hundreds or thousands more than the typical monthly origination pace — this may mean the client changed their account number format, loan suffix, or Unique ID construction, causing the system to see existing loans as new
- A month showing record shrinkage (negative Loan Record Growth) — this is not shown here but would indicate records being deleted or merged

**Questions to ask the client:**
- "In February 2026, we see 1,049 new loan records appearing. Is that consistent with your actual new origination volume for that month, or was there a system change?"
- "Did your core system undergo any upgrades, migrations, or account renumbering between January and March 2026?"
- "Has your loan suffix or account number format changed at any point in the last 12 months?"

---

## Page 6 — Dropped
### Records Dropped from System

**Purpose:** This page shows every loan record that was present in the source file but could not be processed by the system. Dropped records are completely excluded from all balance, charge-off, and CECL calculations. This page is critical — unresolved drops mean the model is working with incomplete data.

### Records Dropped from System Bar Chart

The bar chart shows drop volume by drop reason. Currently, there is one reason: **Charged Off Loan Type Change — 13,026 records dropped.**

**What this means:** These 13,026 loans exist in the source file with a loan type code (L0099) that does not match the loan type code they carried when they were active. The system cannot reconcile the charged-off record to the active loan record because the identifier has changed.

**Why this happens:** Many core systems automatically reassign a loan to a different internal code category when it is charged off — for example, moving it from L0007 (Auto Direct Used – Active) to L0099 (a charged-off holding bucket). When the data is loaded, the system cannot match the charged-off record to the original active loan because the loan type code changed.

### Detail Table

The detail table lists every dropped loan with the following fields:
- **Unique Id** — the loan identifier from the source file
- **Loan Type** — L0099 for all dropped records (the reclassified code)
- **Current Balance** — typically blank or $0 since these are charged-off
- **Original Balance** — the original loan amount (ranges from $882 to $19,714 and higher in these records)
- **Interest Rate** — 0.00 for charged-off loans
- **Credit Limit** — typically blank
- **Days Past Due** — 0 (already charged off)
- **Charge Off Amount** — the amount that was written off
- **Recovery Amount** — any amounts collected post charge-off

**What to do with this table:** Use the "Source File" filter at the top to isolate drops by source file if multiple files were provided. The detail table can be exported (via the Export button in the toolbar) and shared with the client's IT team to help them identify which loans are affected and why their loan type codes are changing at charge-off.

**What to look for:**
- Loan Type column: if all dropped records show L0099, this confirms the charged-off loan type change issue
- Original Balance field: scan for loans with large original balances — a $500,000 charged-off mortgage being dropped is a very different concern than a $1,000 consumer loan
- Recovery Amount field: any dropped records that show a non-zero recovery — these recoveries will not be captured in the CECL model at all until the underlying drop is resolved

**Red flags:**
- Drop volume exceeding 10% of total loan records — at 13,026 drops out of ~107,280 total records (~12%), this is at the high end and must be resolved
- Multiple different drop reasons — would indicate compound data quality issues
- Large original balances in dropped records — suggests significant portfolio value is unaccounted for

**Questions to ask the client:**
- "Does your core system change the loan type code or status code on a loan when it is charged off?"
- "Can you provide a crosswalk showing what loan type code a loan carries when it is active versus after it is charged off?"
- "Who in your IT or core system team can help us understand how charged-off loans are categorized in your system?"
- "Are you aware of these 13,026 records not being included in our calculations? This represents approximately $78.4M in charge-off history that is currently excluded."

---

## Page 7 — Data Completeness
### Missing Fields by Source File

**Purpose:** This page identifies fields that are present in the data structure but contain null or blank values. Data completeness issues originate at the source system level — the data extract does not contain these values, and they cannot be fabricated. Each missing field affects the CECL model's accuracy to varying degrees.

> **Important:** This is not a system error on our end. These are fields that exist in the data model but were not populated in the client's source extract. Communicate this clearly to the client.

### Completeness Metrics Table

Current source file: **0476_2026-03-31_SNOWFLAKEOUTPUT.YXDB**

| Field | Count Missing | % Missing | Severity |
|-------|--------------|-----------|----------|
| Number of Records | — | 14,314 total | Reference |
| No Original Score | 7,086 | 49.50% | Medium |
| No Current Credit Score | 6,799 | 47.50% | Medium |
| No Origination Date | 0 | 0.00% | Clean |
| No Maturity Date or Available Credit | 65 | 0.45% | Low |

**Walking through each field with the client:**

- **Original Credit Score (49.50% missing):** Nearly half of all records have no original FICO score. This is common in portfolios where loans were originated without a formal credit pull (e.g., share-secured loans, small-dollar loans, or loans originated before FICO scoring was standard). The CECL model uses original FICO as an input — records without it will be handled differently in the model, which may reduce precision for those segments. The model can still run without this field, but the more records that lack it, the less differentiated the loss estimates will be by credit quality.
- **Current Credit Score (47.50% missing):** Nearly half of all records also have no current FICO score. This can happen when a credit union does not pull periodic bureau refreshes on existing borrowers. This is a significant limitation for CECL models that use current credit quality as a predictor of future loss. Ask the client if they can obtain and share current bureau scores.
- **Origination Date (0% missing):** This is a critical field and it is fully populated — no action needed.
- **Maturity Date or Available Credit (0.45% missing):** Only 65 records are missing this field — a very small number. For installment loans, this is the maturity/payoff date. For revolving loans, this is the credit limit. The 65 missing records are likely edge cases (e.g., open-ended lines with no set maturity, or very old legacy loans). Flag for the client to investigate but not a blocking issue.

**Red flags:**
- Original Score or Current Score missing for more than 60–70% of records — at that level, the CECL model essentially has no credit quality signal and results will be based almost entirely on product-type and vintage, which reduces accuracy
- Origination Date missing for any records — this is a required field and must be resolved before the model can run
- Maturity Date missing for a large share of installment loans — without a maturity date, the model cannot calculate expected remaining life, which is fundamental to CECL

**Questions to ask the client:**
- "Do you pull credit scores at origination for all loan types? If not, which ones are typically originated without a credit pull?"
- "Does your system store periodic bureau refresh scores? Could those be included in future data extracts?"
- "For the 65 loans missing maturity date or available credit — are those revolving lines of credit that were opened without a formal credit limit?"

---

## Page 8 — Monthly Data Completeness
### Completeness Trends Over Time

**Purpose:** This page extends the Data Completeness view across 13 months (March 2025 through March 2026). It allows you to see whether data quality issues are long-standing and systemic, or new and potentially fixable.

### How to Read This Page

The same metrics from Page 7 are displayed in a monthly time series. Each column is a reporting month; each row is a completeness metric. Keep the **Allowance Group** filter at "All" for onboarding. You can filter to a specific allowance group if the client segments their portfolio.

### Walkthrough of Trends

- **Number of Records:** Grows from 13,146 in March 2025 to 14,314 in March 2026 — a net increase of ~1,168 records over 12 months. This aligns with what we see on the Balance and Record Growth page (Page 5).
- **No Original Score (ranging from 49.50% to 55.01% across the year):** This rate has been consistently between 49–55% throughout the entire 12-month window. It has not worsened over time, but it has also not improved. This is a systemic limitation — the client's system has never captured original scores for roughly half their portfolio.
- **No Current Credit Score (ranging from 47.50% to 52.30%):** Similarly consistent. Note that the rate has been slightly declining in recent months (from ~52% in late 2025 to ~47.50% in March 2026) — this could indicate the client is beginning to obtain bureau refreshes on more of their portfolio. Worth highlighting as a positive trend and confirming with the client.
- **No Origination Date:** Consistently 0% across all 13 months — excellent.
- **No Maturity Date or Available Credit (ranging from 0.45% to 0.87%):** Small numbers consistently, with a slight decline over time (from ~114 records in March 2025 to 65 in March 2026). Also a positive trend.

**What to look for:**
- A metric that is stable over time — systemic issue, no quick fix, client should know the CECL model will work within this constraint
- A metric that is suddenly worsening — a new data quality issue introduced recently, requires immediate investigation
- A metric that is improving — shows client is actively working on data quality, which is a good sign for the partnership

**Red flags:**
- A field that was clean in earlier months but becomes suddenly incomplete — indicates a core system change or migration that broke a data feed
- A sudden jump in record count or drop in completeness that coincides with the February 2026 spike noted on Page 5 — would suggest the new records added in that month are lower-quality data

**Questions to ask the client:**
- "Looking at the trend for current credit scores — it appears the completeness rate has improved slightly over the past year. Has your team started pulling bureau refreshes more regularly?"
- "Has your core system or data extraction process changed at any point during this 13-month window?"
- "Are there any months here where you know a system change or data migration occurred that we should be aware of?"

---

## Page 9 — Key Characteristics of the Loan Portfolio
### Weighted Average Portfolio Metrics

**Purpose:** This page summarizes the weighted average credit characteristics of the loan portfolio by product group. It is used to sanity-check the portfolio inputs to the CECL model and to give the client a clear snapshot of their portfolio's overall risk profile as the system sees it.

### Key Characteristics Table

Each row represents a Loan Subgroup. The columns show weighted averages calculated using current outstanding balance as the weight.

| Column | What It Means |
|--------|--------------|
| Number of Records | Count of active loans in this subgroup |
| Current Balance | Total outstanding balance |
| Available Credit | Open credit line (relevant for revolving products) |
| WA Original FICO | Average credit score at origination, weighted by balance |
| WA Current FICO | Average current credit score, weighted by balance |
| WA CLTV | Average Combined Loan-to-Value, weighted by balance |
| WA Term | Average loan term in months, weighted by balance |

**Grand Total:** 14,314 loans | $159,318,910 balance | WA Original FICO: 736.8 | WA Current FICO: 732.5 | WA CLTV: 57.7% | WA Term: 195.0 months

### Walking Through Each Column

- **WA Original vs. Current FICO (736.8 vs. 732.5):** A slight decline from original to current score is normal — borrowers' credit quality naturally changes over time. A larger decline would suggest credit quality migration, which would be a risk concern. Here the spread is minimal, which is healthy.
- **WA CLTV (57.7%):** For the overall portfolio, a 57.7% LTV is very healthy. Specifically, R/E – HOME EQUITY shows 185.7% — this is expected for a HELOC or second lien, where CLTV can exceed 100% when combined with a first mortgage. CONS – STUDENT LOANS shows -376.4% CLTV — negative CLTV is expected for unsecured products where there is no collateral; the number reflects how the formula handles the absence of collateral value.
- **WA Term (195.0 months overall / 16.25 years):** This is strongly influenced by R/E – HOME EQUITY at 299.2 months (~25 years). For auto loans, terms range from 66–77 months (AUTO subgroups), which is normal for today's auto financing market.

**What to look for:**
- WA Current FICO materially lower than WA Original FICO for any subgroup — indicates credit quality deterioration within that segment
- WA CLTV above 80% for any real estate product — higher LTV means less collateral cushion and higher loss severity if the loan defaults
- WA Term significantly longer than industry norms for a product type — excessively long auto or consumer loan terms can indicate payment stretch risk
- CONS – CREDIT CARD Available Credit of $43,704,403 — this is the total unused credit line exposure. For CECL purposes, revolving products need to account for potential drawdowns, so this number feeds directly into the model's unfunded commitment calculations

**Red flags:**
- A subgroup with $0 Available Credit for a revolving product (e.g., HELOC or credit card) — means credit limit data is missing, which will affect unfunded commitment estimates in CECL
- WA Current FICO significantly lower than WA Original FICO for auto or consumer products — may indicate recent delinquency trends not yet showing as charge-offs
- Any subgroup with extremely short WA Term (under 12 months) for what should be long-term loans — may indicate term field is not being populated correctly

**Questions to ask the client:**
- "Does this portfolio snapshot look accurate to you? Do the balances and loan counts by product line align with what you track internally?"
- "For your Home Equity portfolio — the weighted average CLTV of 185.7% reflects the combined first and second lien. Is that consistent with how you underwrite these loans?"
- "Do you currently track credit score migration on your existing borrowers? Do you pull periodic bureau refreshes?"
- "The credit card portfolio has $43.7M in available credit. Can you confirm that represents the full unfunded commitment, and is that the right number to use for CECL purposes?"

---

## Onboarding Wrap-Up — Key Issues to Resolve

After completing the walkthrough, summarize the open items for the client. Based on the current data, the following issues need to be addressed before the CECL model can produce reliable results:

### Critical (Must Resolve Before Model Run)

1. **Charged Off Loan Type Change — 13,026 records dropped.** The client's core system is changing loan type codes at charge-off, causing those records to be unprocessable. The client needs to provide a mapping of what code a loan carries at charge-off vs. when active, or configure their extract to preserve the original loan type code at the time of charge-off. This issue is also responsible for $78.4M in charge-offs being excluded from the model.

2. **Recovery Data Missing.** No recovery amounts are appearing for any year. The client should confirm whether their system captures post-charge-off recoveries, and if so, ensure the data extract includes recovery transaction history.

### Important (Should Resolve for Best Results)

3. **Original Credit Score missing for ~49.5% of records.** The client should identify which loan types are originated without a credit pull and work with their team to determine if historical scores are available or if bureau refreshes can be provided.

4. **Current Credit Score missing for ~47.5% of records.** Recommend the client implement a regular bureau refresh process and include those scores in future data extracts.

5. **February 2026 record growth spike (1,049 new records).** Confirm whether this was a system change, migration, or genuine origination activity. If a system change altered Unique ID construction, previously existing loans may be double-counted.

### Monitor (Watch in Next Data Refresh)

6. **65 records missing Maturity Date or Available Credit.** Small number, but should be investigated to confirm these are genuinely open-ended products vs. missing data.

7. **NR (Not Rated) FICO grade carrying a 2.90% charge-off ratio with $6.8M in portfolio balance.** Understand why this population is unscored and whether any scoring can be applied retroactively.

---

**Prepared by:** Sprintendo — Loan Analytics Team
**Date:** April 2026
**Status:** Active — used for client onboarding
