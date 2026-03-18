# MDPA Tableau Dashboard Glossary

**Client-Facing Dashboard Object & Metric Reference**

**Comprehensive Reference Guide for Multi-Dimensional Portfolio Analysis Dashboard Suite**

**Version:** 1.0
**Last Updated:** 2026-03-18
**Purpose:** Define and explain every dashboard object, metric, and filter for end users and stakeholders
**Audience:** Credit union executives, portfolio managers, loan officers, compliance teams, board members

---

## Overview

This glossary documents the Tableau dashboard suite built from MDPA (Monthly Data Process Assessment) data extracts. The MDPA workflow processes monthly loan portfolio data and produces insights across delinquency, risk, credit quality, charge-offs, recoveries, and concentration metrics.

**Workflow Data Source:** MDPA Alteryx v5.2 workflow (300+ tools, 23 macros)
**Data Refresh Frequency:** Monthly
**Data Retention:** 7+ years (regulatory compliance)
**Key Datasets:** Loan Portfolio (10K-50K loans), Charge-Off/Recovery (1K-5K active), Real Estate Valuations (3K-10K properties), TransUnion Credit Bureau (8K-40K members)

---

## Tab 1: Introduction (Configuration & Setup)

**Purpose:** Configuration page for the entire dashboard suite. Users select the analysis date, enter institutional financial figures, and define custom credit score tiers. All downstream calculations depend on inputs made here.

### Step 1: Select Report Date

| Object | Description | Business Use |
|---|---|---|
| **Report Date Selector** | A dropdown that sets the as-of date for all portfolio analysis. All balances, delinquency statuses, credit scores, and risk classifications reflect the state of the portfolio on the selected date. | Enables month-to-month comparison; allows analysis of historical periods. Users select the date after the MDPA workflow completes monthly processing. |

### Step 2: Financial Data Entry

| Object | Description | Business Use |
|---|---|---|
| **Regulatory Net Worth** | User-entered field: the credit union's net worth as reported to regulators (OCC, NCUA). Required for concentration risk calculations and capital adequacy analysis. | Denominator for all net worth-based concentration ratios (e.g., "Balance as % of Net Worth"). Critical for regulatory compliance dashboards. |
| **Total Assets** | User-entered field: total book value of all institutional assets. | Denominator for asset-based concentration ratios. Used in capital adequacy and stress-testing calculations. |
| **Allowance for Loan Losses (ALL)** | User-entered field: the loan loss reserve account representing management's estimate of probable credit losses. | Factored into capital/stress analysis calculations. Represents management's provision for credit risk. |
| **Auto LTV Estimate (If No Value)** | User-entered default LTV percentage applied to auto loans when current vehicle valuations are unavailable in the data. | Ensures every auto loan receives an LTV classification for risk modeling, even if appraisal is missing. Typical values: 85-95%. |
| **Real Estate LTV Estimate (If No Value)** | User-entered default LTV percentage applied to real estate loans when current property valuations are unavailable. | Ensures comprehensive LTV coverage across the real estate portfolio. Typical values: 75-85%. |

### Step 3: Define Custom Credit Score Tiers

| Object | Description | Business Use |
|---|---|---|
| **Tier 1 – Greater than [score]** | User-entered minimum score threshold (e.g., 740). All borrowers with scores above this value are classified as Tier 1 (highest quality). | Enables customized risk banding. Tier 1 typically represents "prime" borrowers with strong credit histories. |
| **Tier 2 – Less than Tier 1 and Greater than [score]** | User-entered score range floor (e.g., 700). Borrowers between Tier 1 and this value = Tier 2. | Defines "near-prime" borrowers. Allows institution to align dashboard tiers with its own underwriting standards. |
| **Tier 3 – Less than Tier 2 and Greater than [score]** | User-entered score range floor (e.g., 660). Borrowers between Tier 2 and this value = Tier 3. | Defines "subprime" borrowers. |
| **Tier 4 – Less than Tier 3 and Greater than [score]** | User-entered score range floor (e.g., 620). Borrowers between Tier 3 and this value = Tier 4. | Defines lower-quality borrower tier. |
| **Tier 5 – Less than Tier 4 and Greater than [score]** | User-entered score range floor (e.g., 580). Borrowers between Tier 4 and this value = Tier 5. | Defines high-risk borrower tier. |
| **Tier 6 – Less than Tier 5** | Automatic tier: all borrowers below Tier 5 threshold. No input required. | Captures "deep subprime" borrowers with lowest credit scores (<580 typically). |

### Step 4: Preview Charts

| Object | Description | Business Use |
|---|---|---|
| **Original FICO Grade by Loan Type (3 charts)** | Three stacked bar charts (Auto, Consumer, Real Estate) showing the distribution of origination-date credit scores by custom tier. Each bar represents a loan group; segments show the % or $ of the portfolio originated in each tier. | Quick visual check of underwriting quality at origination across loan types. Helps identify whether lending standards have changed over time or differ by product. |
| **Default Risk by Loan Type (3 charts)** | Three stacked bar charts (Auto, Consumer, Real Estate) showing current portfolio composition by risk classification (Low, Medium, High). | Executive snapshot of current risk posture. Highlights which loan groups have the highest concentration of high-risk loans. |

---

## Tab 2: Main Landing Page

**Purpose:** High-level executive summary of the entire loan portfolio. Designed for board-level or C-suite review to provide a single-page view of where balances are concentrated, the magnitude of delinquency and charge-offs, and overall risk distribution.

### Balance Distribution Charts

| Object | Description | Business Use |
|---|---|---|
| **Current Balance by Group (Donut Chart)** | Displays total outstanding portfolio balance split across the three major loan groups: Auto, Consumer, and Real Estate. Dollar values and percentages labeled on each segment; total portfolio balance shown in center. | Shows lending concentration across major product lines. Enables quick assessment of portfolio composition and identifies which loan group drives largest balance. |
| **Current Balance – Real Estate (Donut Chart)** | Shows breakdown of the Real Estate portfolio by loan subgroup (e.g., 1st Mortgage, Home Equity Fixed, Home Equity Variable, Vacant Land). | Reveals concentration within the real estate segment. Highlights whether the RE portfolio is diversified across product types or concentrated in single product (e.g., heavily weighted to 1st mortgages). |
| **Current Balance – Auto (Donut Chart)** | Shows Auto portfolio breakdown by loan subgroup (e.g., Direct New, Direct Used, Indirect New, Indirect Used, REC Veh). | Identifies auto product concentration. Useful for assessing dealer concentration risk and new vs. used vehicle lending mix. |
| **Current Balance – Consumer (Donut Chart)** | Shows Consumer portfolio breakdown by loan subgroup (e.g., Unsecured, Credit Card, Share Secured, DLOC). | Reveals composition of the unsecured and consumer lending book. Highlights reliance on secured vs. unsecured products. |

### Risk & Delinquency Summary Charts

| Object | Description | Business Use |
|---|---|---|
| **Delinquent Loans (Horizontal Stacked Bar Chart)** | Displays total delinquent balances for each loan group (Auto, Consumer, Real Estate). Bars are color-coded by delinquency severity bucket: 16–29 days, 30–59 days, 60–89 days, 90+ days past due. | Quickly identifies total dollar amount of delinquent loans and the severity/maturity of delinquency. Helps prioritize collections efforts and assess portfolio stress. |
| **Default Risk (100% Stacked Bar Chart)** | Shows each loan group's balance composition by risk tier: Low Risk (green), Medium Risk (yellow), High Risk (red). Each bar = one loan group; segments sum to 100%. | Enables fast risk profile comparison across Auto, Consumer, and Real Estate. Color coding makes it intuitive: green = safe, red = elevated risk. |

---

## Tab 3: Delinquency Landing Page

**Purpose:** Focused view of delinquent loan balances with filters to drill into specific loan subgroups. Allows portfolio managers to identify which products are driving delinquency and concentrate collections efforts.

### Filters

| Object | Description | Business Use |
|---|---|---|
| **Loan Subgroup Filter** | Multi-select dropdown allowing users to filter by one or more loan subgroups (e.g., Auto-Direct New, R/E-1st Mortgage, Cons-Credit Card). All charts update dynamically when selection changes. | Enables product-level delinquency analysis. Portfolio manager can isolate specific problem products to understand root causes and develop targeted collection strategies. |

### Charts

| Object | Description | Business Use |
|---|---|---|
| **Delinquent Loans by Group (Horizontal Stacked Bar Chart)** | Displays delinquent balance for each loan group (Auto, Consumer, Real Estate) segmented by delinquency bucket. Color coding: red = 30–59 days, orange = 60–89 days, yellow = 90+ days. | Shows total delinquency magnitude and maturity for the filtered loan subgroup(s). Helps identify which products have the most severe aging issues requiring escalated collection actions. |

---

## Tab 4: Risk Landing Page

**Purpose:** Multi-faceted risk dashboard providing a comprehensive view of portfolio risk across multiple dimensions: balance by risk tier, charge-off activity, credit score migration trends, and balance distribution across the credit score spectrum.

### Summary Risk KPI

| Object | Description | Business Use |
|---|---|---|
| **Total Balance (Single KPI)** | Displays the total outstanding portfolio balance. Serves as the reference point against which all risk metrics on this page are calculated and compared. | Baseline metric for portfolio size. Helps contextualize the dollar amounts of charge-offs, delinquencies, and high-risk balances. |

### Risk Distribution Tables

| Object | Description | Business Use |
|---|---|---|
| **Balance by Risk Tier – Auto/Consumer/Real Estate (3 Cross-Tabs)** | Three separate tables showing the breakdown of each loan group's balance into risk tiers: HIGH, MED, LOW. | Identifies how much of each loan group's balance carries elevated risk. Helps portfolio managers understand risk concentration by product line. |

### Risk Analysis Charts

| Object | Description | Business Use |
|---|---|---|
| **Charge-offs by Group (Horizontal Bar Chart)** | Displays total dollar amount of loans written off as uncollectable, broken out by Loan Group (Auto, Consumer, Real Estate, and unclassified). | Shows realized credit losses by product line. Helps assess which loan groups have incurred the largest losses and whether charge-off trends are favorable or deteriorating. |
| **Migration of Available Credit (Bubble Chart)** | Each bubble represents a segment of revolving/open-end credit (home equity lines, credit cards) classified by FICO Directional Grouping (how much borrowers' scores have changed since origination). Bubble size = dollar balance; bubble color = score direction (dark red = >100-point decline, green = >100-point improvement, neutral = no change). | Highlights which revolving credit segments are trending toward higher or lower credit risk. Large bubbles with red color = large balance at deteriorating credit quality = elevated risk concentration. |
| **FICO Directional Grouping Legend (Color Scale)** | Accompanying legend for the Migration of Available Credit bubble chart, mapping colors to score change categories (>100 Dec, 75–100 Dec, ... No Change, ... 5–25 Imp, ... >100 Imp). | Enables interpretation of the bubble chart colors. Makes it easy to identify which segments are improving or declining in credit quality. |
| **Current Balance by Credit Score (Vertical Bar Chart)** | Displays outstanding portfolio balance grouped by borrower's current credit score (in 10-point score bands from ~370 to 870). Bars color-coded by Current FICO Grade (A+, A, B, C, D, E). | Reveals where the bulk of the portfolio sits on the credit score spectrum. Helps identify whether the book is concentrating in higher-quality or lower-quality score bands and whether underwriting standards have shifted over time. |

---

## Tab 5: Migration Landing Page

**Purpose:** High-level view of how the overall loan portfolio has migrated in credit quality since origination. Includes filters to focus analysis by FICO grade, loan subgroup, collateral LTV, and available credit.

### Filters

| Object | Description | Business Use |
|---|---|---|
| **Current FICO Grade Filter** | Multi-select filter showing only loans whose current FICO grade matches the selected value(s) (e.g., A+, B, D). | Enables analysis of how specific borrower tiers have evolved. For example: "Show me how A-tier borrowers at origination have migrated." |
| **Loan Subgroup Filter** | Multi-select dropdown allowing drill-down to one or more specific loan product types. | Identifies whether credit quality migration patterns differ across products (e.g., auto loans may migrate differently than real estate). |
| **CLTV Grouping Filter** | Filters by combined loan-to-value ratio bands (<80%, 80–90%, 90–100%, 100–110%, 110–120%, >120%). | Enables analysis of credit migration by collateral coverage level. For example: "Show me how underwater loans (CLTV > 100%) have performed." |
| **Available Credit Filter** | Filters by remaining available credit balance on open-end loans (e.g., >$5K available, <$5K available). | Helps analyze credit utilization impact on migration. Shows whether borrowers with low available credit have different credit score trajectories. |

### Chart

| Object | Description | Business Use |
|---|---|---|
| **Migration of Loans (Horizontal Stacked Bar Chart)** | Displays total outstanding balance for each loan group (Auto, Consumer, Real Estate) segmented by FICO Directional Grouping: >100 Dec (dark red), 75–100 Dec, ..., No Change (neutral), ..., 5–25 Imp, ..., >100 Imp (dark green). | Shows which loan groups are experiencing the most widespread credit quality deterioration or improvement. Large red segments = significant deterioration (rising delinquency risk). Large green segments = credit quality improvement (lower delinquency risk). |

---

## Tab 6: Credit Score Migration Dashboard

**Purpose:** The most detailed view of credit score migration. Shows a complete matrix of how loans have moved between their original FICO grade at booking and their current FICO grade, in both dollar and percentage terms. A key tool for understanding credit quality evolution.

### Key Performance Indicators (KPI Banners)

| Object | Description | Business Use |
|---|---|---|
| **% of Loans Improved (Green KPI)** | Percentage of total portfolio balance where the borrower's current credit score is higher than their origination score. Range: 0%–100%. | High values (e.g., 40%–60%) indicate healthy credit quality improvement and falling default risk. Low values (e.g., <25%) suggest deteriorating credit quality across the book. |
| **% of Loans Deteriorated (Red KPI)** | Percentage of total portfolio balance where the borrower's current credit score is lower than their origination score. Range: 0%–100%. | High values (e.g., >40%) signal increasing credit risk and potential future delinquency/charge-off. Trending higher month-to-month = warning sign. |
| **% of Loans No Change (Neutral KPI)** | Percentage of total portfolio balance where the borrower's credit score has remained unchanged since origination. Range: 0%–100%. | Indicates stable credit quality. Combined with "Improved" and "Deteriorated" percentages, shows portfolio stability vs. volatility. |

### Filter

| Object | Description | Business Use |
|---|---|---|
| **Loan Subgroup Filter** | Multi-select filter allowing users to isolate migration analysis to specific loan product type(s). | Reveals whether credit migration patterns differ by product (e.g., auto loans may see different credit trends than mortgages). |

### Migration Tables

| Object | Description | Business Use |
|---|---|---|
| **Credit Score Migration – Dollar Matrix (Heat Map Table)** | Cross-tab where rows = Original FICO Grade (A+, A, B, C, D, E) and columns = Current FICO Grade. Each cell shows the outstanding balance of loans that originated in the row grade and currently sit in the column grade. Cells above the diagonal (green highlight) = improvement; cells below the diagonal (red highlight) = deterioration. | Provides precise dollar breakdown of migration. For example: "Show me how much A-tier balance has fallen to C-tier" (red cell, below diagonal = deterioration). Useful for regulatory reporting and risk trending. |
| **Credit Score Migration – Percentage Matrix (Proportional Table)** | Same cross-tab structure as Dollar Matrix, but each cell shows the percentage of total portfolio balance (rather than dollars). | Enables proportional comparison independent of portfolio size. Useful for comparing migration patterns across periods with different total balances or across institutions of different sizes. |

---

## Tab 7: Real Estate Portfolio Download (Data Export)

**Purpose:** Detailed, loan-level data table for the Real Estate portfolio. Designed to provide an exportable record of every real estate loan with key financial characteristics, collateral valuations, and credit score data for further analysis, reconciliation, or regulatory reporting.

### Loan Details Table (Scrollable Grid)

Each row = one real estate loan. Columns include:

| Column Name | Description | Business Use |
|---|---|---|
| **Unique ID** | The loan's unique system identifier (10-digit Loan_ID). | Primary key for matching to core banking system. Used for loan-level follow-up or servicing reference. |
| **Loan Subgroup** | Real estate product type (e.g., R/E-1st Mortgage, R/E-Home Equity Fixed, R/E-Home Equity Variable, R/E-Vacant Land). | Identifies product type and helps portfolio manager understand product mix and concentration. |
| **Original Balance** | The loan amount at origination/funding. | Baseline for loss severity calculations. Shows the original credit decision size. |
| **Current Balance** | The outstanding principal balance as of the Report Date. | Primary metric for portfolio valuation and concentration analysis. Reconciles to GL. |
| **Credit Limit** | The maximum approved credit line amount (applicable to revolving RE products like HELOCs). | Identifies unused borrowing capacity. Current Balance + Available Credit = Credit Limit. |
| **Available Credit** | The unused portion of the credit limit (Credit Limit – Current Balance). | Measures future funding exposure for open-end products. High available credit = elevated risk of balance growth if borrower draws additional funds. |
| **Interest Rate** | The contractual annual interest rate on the loan. | Used in profitability analysis; shows pricing consistency across portfolio. |
| **Oldest Score** | The borrower's credit score at or near origination (original FICO grade). | Baseline credit quality at underwriting decision. Used in migration analysis to track credit deterioration. |
| **Most Recent Score** | The borrower's most current credit score as of the Report Date. | Current credit risk indicator. Used to classify loans by current risk tier and identify deteriorated credit. |
| **Change in FICO Score** | Numerical difference: Most Recent Score – Oldest Score. Positive = improvement; negative = decline. | Identifies loans with significant credit deterioration (e.g., –150 points = major red flag). Used for risk trending and early warning systems. |
| **Days Past Due** | Number of days the loan's payment is currently overdue as of the Report Date. Null = current/not delinquent. | Identifies delinquent loans for collections priority. Higher DPD = increased default risk and near-term charge-off probability. |
| **RE Collateral Value** | Current estimated market value of the real estate property securing the loan. | Key input for LTV and loss severity calculations. Used in stress testing (e.g., "What if property values decline 20%?"). |
| **Total Superior** | Total dollar amount of liens on the property that are senior (superior) to the credit union's lien (e.g., first mortgage vs. second mortgage). | Indicates loss severity in default. Higher superior liens = lower recovery potential for credit union. |
| **Current Balance Exposed** | Portion of outstanding loan balance not covered by collateral (Current Balance – RE Collateral Value, if negative). | Measures uncollateralized exposure. Loans with balance exposed = significantly higher loss given default. |
| **CLTV (Combined Loan-to-Value)** | Percentage ratio: (Current Balance / RE Collateral Value) × 100. Higher = greater collateral risk. | Key risk metric. CLTV > 100% = "underwater" loan with negative equity. Used in stress testing and risk concentration analysis. |

---

## Tab 8: Auto Portfolio Download (Data Export)

**Purpose:** Detailed, loan-level data table for the Auto portfolio. Provides an exportable record of every auto loan with financial characteristics, multiple vehicle valuation estimates, and credit score data for analysis, reconciliation, and compliance.

### Loan Details Table (Scrollable Grid)

Each row = one auto loan. Columns include:

| Column Name | Description | Business Use |
|---|---|---|
| **Unique ID** | The loan's unique system identifier (10-digit Loan_ID). | Primary key for servicing and loan-level follow-up. |
| **Loan Subgroup** | Auto product type (e.g., Auto-Direct New, Auto-Indirect Used, REC Veh). | Identifies dealer channel and vehicle condition; helps assess product-specific performance. |
| **Original Balance** | The loan amount at origination. | Baseline for loss severity. Shows original advance rate relative to vehicle value. |
| **Current Balance** | The outstanding principal balance as of the Report Date. | Primary balance metric for portfolio valuation and LTV calculations. |
| **Interest Rate** | The contractual annual interest rate. | Used in profitability analysis; identifies rate competitiveness by product and risk tier. |
| **Oldest Score** | Borrower's credit score at origination. | Original credit quality at underwriting. Baseline for migration analysis. |
| **Most Recent Score** | Borrower's most current credit score. | Current credit risk indicator. |
| **Change in FICO Score** | Numerical change from origination to Report Date. | Identifies significant credit deterioration (red flag for default risk). |
| **Days Past Due** | Days loan payment is currently overdue. Null = current. | Delinquency status; used for collections priority and default probability assessment. |
| **Auto Value Retail** | Current estimated retail market value of the vehicle (what consumer would pay at dealership). | Conservative valuation; used when retail recovery is anticipated. Higher retail value = better recovery potential. |
| **Auto Value Trade-In** | Current estimated trade-in value of the vehicle (what dealer would offer in trade). | Mid-range valuation; typical used for prudent loss severity estimates. Most common for auto LTV. |
| **Auto Value Wholesale** | Current estimated wholesale/auction market value of the vehicle. | Most conservative valuation; used when forced liquidation is anticipated. Lower value = higher loss severity. |
| **Total Collateral Value** | The vehicle valuation used for risk and LTV calculations (typically the highest applicable auto valuation or policy-selected value). | Primary collateral value input. Determines LTV and loss given default. |
| **Current Balance Exposed** | Portion of loan balance exceeding Total Collateral Value (Current Balance – Total Collateral Value, if negative). | Measures uncollateralized exposure. High balance exposed = high loss if vehicle repossessed and sold at wholesale. |
| **CLTV (Combined Loan-to-Value)** | Percentage ratio: (Current Balance / Total Collateral Value) × 100. | Key risk metric. CLTV > 100% = vehicle worth less than outstanding loan (upside-down). Used in stress testing and risk concentration. |

---

## Tab 9: Credit Score Download (Data Export)

**Purpose:** Loan-level credit score data export. Intended to support off-platform analysis, regulatory reporting, and score-level portfolio reviews.

| Column Name | Description | Business Use |
|---|---|---|
| **Unique ID** | Loan identifier. | Primary key for data matching. |
| **Original FICO Grade** | Borrower's FICO grade at origination (A+, A, B, C, D, E, NR). | Baseline credit quality for migration and underwriting analysis. |
| **Current FICO Grade** | Borrower's current FICO grade (A+, A, B, C, D, E, NR). | Current credit classification. |
| **Change in FICO Score** | Numerical point change (positive = improvement, negative = decline). | Quantifies credit score trajectory. |
| **Oldest Score (Numeric)** | Borrower's credit score at origination (300–850 numeric FICO). | Precise origination credit metric. |
| **Most Recent Score (Numeric)** | Borrower's current credit score (300–850 numeric FICO). | Current credit quality metric. |
| **Score Trend** | Directional classification (Improving, Declining, Stable, Unknown). | Qualitative score direction for trend analysis. |

---

## Tab 10: Concentration Monitoring

**Purpose:** Tracks concentration of the loan portfolio relative to the institution's net worth and total assets for every loan subgroup. A regulatory and risk management tool identifying whether any single loan product is consuming a disproportionate share of capital or the balance sheet.

### Reference Values & Filters

| Object | Description | Business Use |
|---|---|---|
| **Regulatory Net Worth (Displayed)** | Shows the net worth figure entered on the Introduction tab. | Used as the denominator for net worth concentration calculations throughout the page. |
| **Total Assets (Displayed)** | Shows the total assets figure entered on the Introduction tab. | Used as the denominator for asset-based concentration calculations. |
| **Loan Subgroup Filter** | Multi-select dropdown allowing users to limit table and charts to one or more specific loan subgroups. | Enables focused analysis on specific products. For example: "Show me only Auto-Indirect concentration." |
| **Original FICO Grade Filter** | Color-coded selector (NR, E, D, C, B, A, A+) filtering the bar chart to show only loans of the selected credit grade(s). Note: applies only to the chart, not the concentration table. | Reveals whether concentration differs by borrower credit quality. For example: "Is our A-tier Auto concentration excessive?" |

### Concentration Monitoring Table

| Column | Description | Business Use |
|---|---|---|
| **Loan Subgroup** | Specific loan product category. | Groups concentrations by product line. |
| **Current Balance** | Total outstanding balance for the subgroup as of the Report Date. | Absolute balance size. |
| **Balance as a % of Net Worth** | Subgroup's current balance ÷ Regulatory Net Worth × 100. | Key regulatory concentration metric. High values (e.g., >15%) indicate concentration risk to the institution's capital. |
| **Balance as a % of Total Assets** | Subgroup's current balance ÷ Total Assets × 100. | Asset concentration metric. Shows whether subgroup balance is a disproportionate share of the balance sheet. |
| **% of Current Balance** | Subgroup's balance ÷ Total portfolio balance × 100. | Shows subgroup's share of overall portfolio. Helps identify if portfolio is diversified or concentrated in few products. |
| **Available Credit** | Total undrawn credit availability for open-end products within the subgroup. | Identifies future funding exposure. High available credit = elevated risk that balances will grow if borrowers utilize available lines. |
| **Total Funded and Unfunded Commitments** | Combined total of drawn balances and committed-but-undrawn credit lines for the subgroup. | Full exposure including future potential drawdowns. |
| **% of Total Funded and Unfunded Commitments** | Subgroup's total commitments ÷ all portfolio commitments × 100. | Shows subgroup's share of total institution credit exposure (funded + unfunded). |
| **Total as a % of Net Worth** | Total commitments ÷ Regulatory Net Worth × 100. | Concentration metric accounting for future drawdown potential. Critical for capital planning. |
| **% of Total Assets** | Total commitments ÷ Total Assets × 100. | Asset concentration metric for total credit exposure. |

### Concentration Chart

| Object | Description | Business Use |
|---|---|---|
| **Balance as a % of Net Worth – Bar Chart** | Vertical stacked bar chart with one bar per loan subgroup showing each subgroup's balance as a percentage of Regulatory Net Worth, color-coded by Original FICO Grade (A+, A, B, C, D, E). | Provides immediate visual comparison of concentration levels across products. Bars exceeding institutional policy thresholds (e.g., 10%) indicate concentration risk. Helps identify whether high-concentration products are high-risk or low-risk borrowers. |

---

## Tab 11: Concentration Risk Analysis (Stress Testing & Capital Adequacy)

**Purpose:** Stress-testing and capital adequacy tool. Users apply scenario-based stressors to the portfolio to estimate potential losses under adverse conditions and determine whether the institution would maintain adequate net worth. The centerpiece is the Capital Risk Matrix.

### Stress Scenario Input Parameters

| Parameter | Description | Business Use |
|---|---|---|
| **Real Estate Stressor (%)** | User-entered percentage representing an assumed decline in real estate collateral values under a stress scenario (e.g., entering "20%" simulates a 20% drop in property values). | Models potential impact of recession or real estate market downturn. Stress test shows how much net worth would be consumed if properties declined 20%. |
| **Auto Stressor (%)** | User-entered percentage representing an assumed decline in auto collateral values under stress. | Models potential impact of auto market downturn (e.g., used car prices collapse). Shows loss severity impact if auto values drop. |
| **Unemployment Stressor (%)** | User-entered value representing additional default risk attributed to rising unemployment conditions (e.g., entering "5%" adds 5% to the default probability under stress). | Models macroeconomic stress scenario. Higher unemployment = higher defaults on unsecured loans and consumer products. |
| **Minimum Net Worth (%)** | User-entered percentage representing the minimum net worth ratio the institution must maintain to meet regulatory or internal policy requirements (e.g., 6%). | Sets capital adequacy threshold. Dashboard compares stressed net worth ratio against this minimum to identify cushion or deficiency. |
| **Other Shock ($)** | User-entered dollar or rate adjustment representing additional economic shocks not captured by collateral stressors (e.g., interest rate risk, legal settlements, fraud losses). | Captures tail risks and unknown unknowns. Allows management to layer in additional conservative adjustments for worst-case planning. |
| **Min Probability of Default (%)** | User-entered floor percentage for the probability of default applied during stress calculations. Prevents unrealistically low default assumptions in stressed scenarios. | Ensures stress test doesn't underestimate defaults. For example: "Even if unemployment rises, don't assume default rates below 2%." |

### Capital Risk Matrix Table

| Column | Description | Business Use |
|---|---|---|
| **Loan Subgroup** | Specific loan product category. | Groups losses and exposures by product line. |
| **Original Balance** | Total amount loaned for the subgroup at origination. | Reference metric for loss rate calculations. |
| **Current Balance** | Outstanding balance as of the Report Date. | Baseline exposure. |
| **Available Credit** | Undrawn credit availability on open-end products. | Future potential drawdown exposure. |
| **High Risk Unfunded Commitments ($)** | Dollar amount of undrawn commitments on high-risk loans (based on current risk tier classification). | Identifies future funding exposure on deteriorated loans. High values = elevated risk of balance growth if borrowers draw on deteriorated credit quality. |
| **Loss Given Default ($)** | Estimated dollar loss if all loans in the subgroup were to default, accounting for collateral recovery (baseline, before stress adjustments). | Shows uncollateralized exposure. Used to estimate potential losses in normal/expected default scenario. |
| **Risk of Loss High ($)** | Estimated dollar exposure at risk of loss for the high-risk portion of the subgroup (baseline scenario). | Identifies dollar amount of high-risk balance at risk of loss. Feeds into capital adequacy calculations. |
| **Stress Adjusted Loss Given Default ($)** | Loss Given Default recalculated after applying stress stressor inputs (e.g., reduced collateral values, higher default rates). | Shows potential losses in adverse scenario. Compares to baseline to quantify stress impact. For example: "If auto values drop 20%, our loss increases from $2M to $3.2M." |
| **Stress Adjusted Risk of Loss High ($)** | Risk of Loss High after applying scenario stressors. | Stressed loss estimate for high-risk loans; inputs into capital adequacy calculations. |

### Summary Capital Metrics (Right Panel)

| Metric | Description | Business Use |
|---|---|---|
| **Regulatory Net Worth (Starting)** | Current regulatory net worth (from Introduction tab). | Baseline capital position before stress adjustment. |
| **High Risk Unfunded Commitments** | Portfolio-wide total of undrawn commitments on high-risk loans. | Total future exposure on deteriorated credit. |
| **Stress Adjusted Risk of Loss High** | Total stressed loss estimate for high-risk loans across entire portfolio. | Estimated loss that would be realized in stress scenario. Subtracted from net worth to calculate stressed capital position. |
| **Interest Rate / Other Shock** | Total additional loss from the "Other Shock" parameter. | Captures additional losses from non-credit risks (interest rate, operational, legal, etc.). |
| **Allowance for Loan Losses** | Loan loss reserve (from Introduction tab). | Existing reserve available to absorb losses. If stressed losses exceed ALL, institution must recognize additional loss. |
| **Risk Adjusted Net Worth** | Calculated: Regulatory Net Worth – Stressed Risk of Loss High – Other Shock + ALL. Net worth after deducting estimated stress losses and reserves. | **Key metric:** The institution's effective capital position under the stress scenario. This is what net worth would be if the stress scenario were realized. |
| **Risk Adjusted Total Assets** | Total assets adjusted downward to reflect credit losses under stress scenario. | Denominator for stressed net worth ratio calculation. |
| **Minimum Net Worth ($)** | Calculated: Risk Adjusted Total Assets × Minimum Net Worth (%). The minimum dollar net worth required to meet the user-defined minimum net worth ratio. | Regulatory or internal capital adequacy threshold in dollars. Institution must maintain at least this level. |
| **Capital Cushion / (Deficiency)** | Risk Adjusted Net Worth – Minimum Net Worth. Positive = cushion; negative (in parentheses) = deficiency. | **Critical metric for board and regulators:** Shows whether institution passes the stress test. Positive = comfortable cushion above regulatory minimum. Negative (deficiency) = would violate net worth ratio under stress scenario; requires remedial action. |
| **Net Worth % (Pre-Stress)** | Current net worth ratio: Regulatory Net Worth ÷ Total Assets × 100. | Baseline net worth ratio before stress. |
| **Risk Adjusted Net Worth % (Post-Stress)** | Stressed net worth ratio: Risk Adjusted Net Worth ÷ Risk Adjusted Total Assets × 100. | Stressed net worth ratio. Used to assess adequacy against minimum net worth threshold. Compares to "Minimum Net Worth (%)" to determine pass/fail on stress test. |

---

## Tab 12: Static Pooling (Annual Vintage Analysis)

**Purpose:** Evaluates loan performance by origination year (vintage). By tracking groups of loans originated in the same year, this analysis isolates credit performance of each cohort over time — independent of newer or older loans — enabling apples-to-apples comparison of how underwriting quality has evolved.

### Filters

| Filter | Description | Business Use |
|---|---|---|
| **Original FICO Grade** | Multi-select filter narrowing analysis to borrowers of a specific credit grade at origination (e.g., only A+ loans, or A+, A, B combined). | Reveals whether specific credit tiers have consistent performance across vintages (e.g., "Do 2019-origin A+ loans perform better than 2020-origin A+ loans?"). |
| **Loan Subgroup** | Multi-select filter limiting analysis to one or more specific loan product types. | Shows whether charge-off patterns differ by product. For example: "Do Auto-Indirect loans charge off faster than Auto-Direct?" |
| **Origination Year Slider** | Range slider setting the span of origination years included in the analysis (e.g., 2015–2021). | Allows users to focus on recent vintages (which have more history) or compare across multiple years. |

### Charge-Off Performance Chart

| Object | Description | Business Use |
|---|---|---|
| **Static Pool – Cumulative Charge Off % Curve (Line Chart)** | Each line represents a different origination vintage year (e.g., 2019, 2020, 2021). X-axis = years since origination (0 to ~7 years); Y-axis = cumulative % of original pool balance that has been charged off. Lines that rise more steeply = vintages with higher realized losses. | **Key risk management tool:** Compares charge-off curves across vintages to assess whether underwriting standards have tightened or loosened. Steep curves = deteriorating quality; flat curves = improving quality. Regulators use this to assess loan loss reserve adequacy. |

### Vintage Analysis Tables

| Table | Columns | Business Use |
|---|---|---|
| **Static Pool Analysis – Vintage Year Table** | Vintage Year, Original Balance ($ 000s), Current Balance ($ 000s), Grand Total. Shows, for each vintage year: the total amount loaned in that year and how much remains outstanding today. | Shows origination volume by year and paydown/charge-off activity. Identifies which vintages are performing well (current balance high relative to original) vs. poorly (current balance low = heavy charge-offs). |
| **Cumulative Charge Off % by Period Table** | Rows = vintage years; columns = year of seasoning (Year 1, Year 2, ..., Year 7). Each cell = the cumulative charge-off % for that vintage at that point in seasoning. | **Precise numeric comparison across vintages.** For example: "2019 vintage had 3.2% charge-offs by Year 2; 2020 vintage had 2.8% by Year 2." Shows whether recent underwriting is tighter or looser than prior years. |

---

## Tab 13: Static Pooling Quarter (Quarterly Vintage Analysis)

**Purpose:** Identical in concept to Static Pooling (annual) but with origination cohorts broken into calendar quarters rather than full years. Finer granularity enables identification of seasonal patterns in underwriting quality or impact of specific policy changes.

### Filters

| Filter | Description | Business Use |
|---|---|---|
| **Loan Subgroup** | Multi-select filter limiting analysis to specific loan product types. | Identifies seasonal patterns within specific products (e.g., "Do Q4 auto originations charge off faster because of year-end origination spikes?"). |
| **Loan Description** | More granular product filter within a subgroup. | Enables analysis at the sub-product level (e.g., isolate "Auto-Indirect Used" within the Auto subgroup). |
| **Original FICO Grade** | Multi-select filter narrowing to a specific credit grade at origination. | Shows whether seasonal or policy changes affected specific credit tiers differently. |
| **10 Quarter Ending Date** | Sets the end date for the 10-quarter lookback window used in the analysis. | Allows comparison of recent quarters only (more current underwriting) vs. longer historical window. |

### Charts & Tables

| Object | Description | Business Use |
|---|---|---|
| **Static Pool Quarterly – Cumulative Charge Off % Curve (Line Chart)** | Each line represents an origination quarter (e.g., 2019 Q3, 2020 Q1, 2021 Q4). X-axis = Years Until Charge Off; Y-axis = cumulative charge-off %. | Reveals quarterly charge-off patterns. Steeper slopes = deteriorating quality; flat slopes = improving quality. Helps identify seasonal trends or specific policy change impacts. |
| **Static Pool Analysis – Vintage Quarter Table** | Origination quarters and corresponding Original Balance ($ 000s) and Current Balance ($ 000s). | Shows origination volume and paydown by quarter. Identifies which quarters originated the most volume and how each is performing. |
| **Cumulative Charge Off % by Period Table** | Rows = origination quarters; columns = year of seasoning. Each cell = cumulative charge-off % for that quarter at that seasoning point. | Quarterly-level precision comparison across cohorts. More granular than annual analysis; helps pinpoint specific periods of tighter/looser underwriting. |

---

## Tab 14: Pooled Delinquency (Vintage Delinquency Analysis)

**Purpose:** Shows delinquency performance (rather than charge-offs) across static pool cohorts. For each origination quarter, displays how much of the originated balance is current versus how much has fallen into each delinquency bucket, helping assess credit health trajectory of each vintage.

### Filters

| Filter | Description | Business Use |
|---|---|---|
| **Loan Subgroup** | Multi-select filter limiting analysis to specific loan product types. | Identifies delinquency patterns by product. For example: "Do unsecured consumer loans show higher delinquency rates than secured loans?" |
| **Loan Description** | Granular product filter within a subgroup. | Enables sub-product-level delinquency analysis. |
| **Original FICO Grade** | Multi-select filter narrowing to a specific borrower credit grade at origination. | Shows whether delinquency patterns differ by borrower tier. For example: "Are C-tier borrowers experiencing more delinquency than A-tier?" |
| **10 Quarter Ending Date** | Sets end date for the 10-quarter lookback window. | Allows comparison of recent delinquency vs. historical patterns. |

### Delinquency Tables

| Table | Description | Business Use |
|---|---|---|
| **Current Balance by Origination Date and Delinquency – Dollar Table (Cross-Tab)** | Rows = origination quarters; columns = delinquency buckets (16–29 DPD, 30–59 DPD, 60–89 DPD, 90+ DPD, Current). Each cell = outstanding balance in that delinquency category for loans from that origination quarter. | Shows absolute dollar delinquency by vintage. Helps identify which vintages are experiencing the most stress. For example: "2020 Q1 vintage has $2.3M in 90+ DPD; 2020 Q2 has $1.8M." |
| **% of Current Balance by Origination Date and Delinquency – Percentage Table** | Same cross-tab structure, but each cell = delinquent balance as a percentage of that vintage's total outstanding balance. | Shows proportional delinquency by vintage (independent of vintage size). Allows fair comparison of delinquency stress across vintages of different sizes. For example: "2020 Q1 has 2.1% in 90+ DPD; 2020 Q2 has 1.4%." Identifies which vintage is experiencing the most delinquency stress. |

---

## Tab 15: Pooled Current FICO (Vintage Credit Quality Analysis)

**Purpose:** Similar to Pooled Delinquency but bucketing each vintage's outstanding balance by the borrower's current FICO grade. Reveals how the credit quality of each origination cohort has evolved over time.

### Filters

| Filter | Description | Business Use |
|---|---|---|
| **Loan Subgroup** | Multi-select filter limiting analysis to specific loan product types. | Shows whether credit quality degradation differs by product. |
| **Loan Description** | Granular product filter. | Enables sub-product-level analysis. |
| **Original FICO Grade** | Multi-select filter narrowing to a specific credit grade at origination. | Shows whether borrowers of a specific tier have experienced uniform or disparate credit quality degradation. For example: "How have C-tier borrowers at origination fared?" |
| **10 Quarter Ending Date** | Sets end date for 10-quarter lookback. | Allows focus on recent vintages with current underwriting standards. |

### Credit Quality Tables

| Table | Description | Business Use |
|---|---|---|
| **Current Balance by Origination Date and Current FICO Grade – Dollar Table (Cross-Tab)** | Rows = origination quarters; columns = current FICO grades (A+, A, B, C, D, E, NR). Each cell = outstanding balance of loans from that quarter that currently carry that FICO grade. | Shows absolute dollar distribution of credit grades within each vintage. For example: "2020 Q1 loans: $5.2M currently A+, $3.8M currently C." Identifies whether credit quality has migrated favorably (toward A+) or unfavorably (toward E). |
| **% of Current Balance by Origination Date and Current FICO Grade – Percentage Table** | Same cross-tab, but each cell = % of that vintage's total balance currently in that FICO grade. | Proportional credit quality comparison independent of vintage size. Reveals credit quality distribution trends. For example: "2020 Q1: 35% currently A+, 15% currently C. 2020 Q2: 38% currently A+, 12% currently C." Shows whether underwriting or economic conditions have led to favorable or unfavorable credit migration. |

---

## Tab 16: Interest Margins (Profitability by Product)

**Purpose:** Profitability analysis comparing the weighted average interest rate earned on each loan subgroup against its cost components — cost of capital and one-year charge-off rate — to reveal which segments are generating the strongest (and weakest) net interest margins.

### Filters & Parameters

| Object | Description | Business Use |
|---|---|---|
| **Profit Margin Color Scale (Legend)** | Visual gradient legend showing color coding for profit margins, ranging from red (negative margin, e.g., –3.00%) to green (positive margin, e.g., +10.00%). | Helps interpret bubble chart and bar chart colors. Red = unprofitable or low-margin product. Green = highly profitable product. |
| **Origination Year** | Filter allowing analysis of loans originated in a specific year or range. | Reveals whether profitability has changed over time due to underwriting standards, pricing changes, or economic conditions. |
| **Loan Subgroup** | Multi-select filter limiting analysis to specific loan product types. | Enables focused profitability comparison among key products. |
| **Cost of Capital (%)** | User-adjustable rate representing the institution's funding cost (e.g., 0.40% for deposits or borrowings). Subtracted from interest rate to calculate net margin. | Allows sensitivity analysis. Higher cost of capital = lower margin on same interest rate. Users can model "what if our funding costs rise to 0.60%?" |
| **Unemployment Stressor (%)** | User-adjustable value representing additional expected losses under a stressed unemployment scenario (e.g., "If unemployment rises, default losses increase by 2%"). Layered into profitability calculation. | Enables stress-adjusted profitability modeling. Shows how macro shocks affect product profitability. |

### Profitability Charts

| Chart | Description | Business Use |
|---|---|---|
| **Interest Margin Bubble Chart** | Each bubble = one loan subgroup. Bubble size = relative outstanding balance of that subgroup. Bubble color = profit margin (red = unprofitable, green = highly profitable). **Position:** X-axis = weighted average interest rate; Y-axis = default risk or collateral type (depends on dashboard design). | **Executive dashboard:** Immediately identifies most and least profitable loan products. Large green bubbles = profitable AND large volume = core business. Large red bubbles = unprofitable AND large volume = profitability drag. Helps management prioritize which products to expand/contract. |
| **Interest Margin Bar Chart (Stacked Components)** | For each loan subgroup: vertical stacked bar showing the total weighted average interest rate, broken into three color-coded components: Profit Margin (green = net return after costs), Cost of Capital (yellow = funding cost), One Year Charge Off Rate (red = expected credit loss cost). | Shows how the interest rate is "consumed" by different costs vs. retained as profit. For example: "Auto-Direct New earns 6.5% rate, but spends 0.4% on cost of capital and 1.2% on charge-offs, leaving 4.9% profit margin." Transparent view of what drives profitability differences across products. |

---

## Tab 17: Profitability Calculator (Advanced Scenario Modeling)

**Purpose:** Interactive, all-in profitability tool allowing users to model the true net return on each loan segment after accounting for all relevant costs. Users adjust cost assumptions to run scenarios and understand how pricing, risk, or operational changes affect profitability.

### Input Parameters & Filters

| Parameter | Description | Business Use |
|---|---|---|
| **Origination Year** | Filter to loans originated in a specific year. | Isolates profitability of a specific origination cohort, accounting for seasoning effects. |
| **Loan Subgroup** | Multi-select filter limiting analysis to specific loan product types. | Compares profitability across key products. |
| **Loan Description** | Granular product filter. | Enables sub-product-level profitability analysis (e.g., "Auto-Indirect Used, Retail vs. Wholesale"). |
| **Unemployment Stressor (%)** | Add-on loss assumption representing additional defaults under economic stress. | Models recession/unemployment scenario impact on profitability. Higher stressor = lower profitability. |
| **Cost of Delinquency ($)** | User-entered dollar value representing the internal cost to manage and service each delinquent account (collection staff, legal fees, skip tracing). | Captures operational costs of delinquency. Higher delinquency = higher cost = lower profitability. |
| **Origination Costs ($)** | Flat dollar cost to originate a single loan (e.g., $500 per loan for loan origination fees, appraisals, underwriting staff). | One-time front-end cost. High origination costs = lower profitability on short-term loans or early payoffs. |
| **Term (Months)** | Loan term in months, used to amortize the dollar origination cost over the life of the loan. | Longer terms amortize origination costs over more months, reducing annualized cost. |
| **Origination Costs (%)** | Origination cost expressed as a percentage of the loan balance (in addition to or instead of the flat dollar cost). | Alternative way to model origination costs. For example: "1.5% of loan balance goes to origination costs." |
| **Cost of Capital (%)** | Institution's funding cost rate, applied to all outstanding balances (e.g., 0.40%). | Represents the cost to fund the loans. Used in net interest margin calculation. |
| **Cost of Default ($)** | User-entered dollar figure representing the estimated cost per defaulted loan beyond the actual loan loss (e.g., legal fees, collection agency fees, internal admin costs). | Captures non-credit-loss administrative costs of default. |

### Profitability Output Tables & Metrics

The calculator produces detailed outputs showing, for each loan subgroup or FICO tier:

| Metric | Calculation | Business Use |
|---|---|---|
| **Weighted Average Interest Rate (%)** | Average interest rate across the loan group, weighted by outstanding balance. | Baseline revenue rate. Used as the starting point before subtracting all costs. |
| **Cost of Capital (%)** | User-entered funding cost rate. | Funding cost subtracted from interest rate. |
| **One Year Charge Off Rate (%)** | Annualized charge-off rate as % of outstanding balance (derived from static pool charge-off curves). | Expected credit loss cost. Subtracted from interest rate. |
| **Cost of Delinquency (%)** | Cost of managing delinquent accounts expressed as annualized % of balance. | Operational cost. Subtracted from interest rate. |
| **Cost of Default (%)** | Cost of default per loan expressed as annualized % of balance. | Administrative cost of defaults. Subtracted from interest rate. |
| **Origination Cost (Annualized %)** | Origination cost amortized over loan term and expressed as annualized %. | Front-end cost converted to annualized basis. Subtracted from interest rate. |
| **Unemployment Stressor (%)** | Additional loss assumption under stress scenario. | Optional stress adjustment. Reduces profitability under recession assumptions. |
| **Net Profit Margin (%)** | Weighted Average Interest Rate – (Cost of Capital + Charge-Off Rate + Cost of Delinquency + Cost of Default + Origination Cost + Unemployment Stressor). | **Key output:** The true net return on the loan product after accounting for ALL costs. Positive = profitable, Negative = losing money on the product. |

---

## Tab 18: Dealer Analysis (Auto Loan Originator Performance)

**Purpose:** Dealer-level summary of auto portfolio performance. Aggregates auto loans by originating dealer to show origination volume, balance, pricing, and credit quality per dealer. Used to identify top dealers, assess dealer concentration risk, and evaluate dealer credit quality.

### Dealer Performance Table

| Column | Description | Business Use |
|---|---|---|
| **Dealer Name** | Name of the auto dealership that originated the auto loans. | Identifies the dealer. Used for dealer-level performance management and dealer relationship review. |
| **Count of Loans** | Number of loans originated by the dealer. | Shows origination volume per dealer. Identifies top dealers by transaction count. |
| **Total Original Balance** | Total amount funded to loans originated by the dealer. | Shows dollar volume per dealer. Identifies dealers that are the largest credit sources. |
| **Current Balance** | Outstanding balance from loans originated by the dealer. | Shows dealer's current exposure. Used in concentration risk assessment. |
| **Average Interest Rate** | Weighted average interest rate on loans from the dealer. | Shows pricing consistency. Identifies whether certain dealers are charged premium rates (higher risk) or discount rates (preferred partners). |
| **Average Original FICO Grade** | Average credit grade of borrowers at origination (dealer's typical borrower quality). | Indicates dealer's customer credit profile. Premium dealers typically originate higher-tier borrowers; subprime dealers originate lower-tier borrowers. |
| **Average Current FICO Grade** | Average current credit grade of borrowers (how borrower credit has evolved since origination). | Shows credit quality migration. If average current grade is significantly lower than original, indicates deteriorating borrower population. |
| **Delinquency Rate** | Percentage of dealer's loans currently delinquent (30+ DPD). | Performance metric. High delinquency = problem dealer; low delinquency = quality dealer. |
| **Charge-Off Rate** | Annualized charge-off rate for dealer's loans. | Performance metric. High charge-off rate = poor credit quality originations; low = quality dealer. |

---

## Tab 19: Dealership Balance and Risk (Dealer Risk Profile Matrix)

**Purpose:** Dealer-level risk profiling. Shows each dealer's current balance versus risk rating and CLTV distribution, enabling portfolio managers to assess which dealers are concentrations of high-risk collateral or deteriorated credit.

### Dealer Risk Matrix Chart

| Chart Type | Description | Business Use |
|---|---|---|
| **Scatter Plot: Current Balance vs. Risk Rating** | Each bubble = one dealer. Bubble size = dollar balance. Bubble position: X-axis = average risk rating (Low, Medium, High); Y-axis = current balance. Bubble color = delinquency rate or charge-off rate. | Identifies problematic dealer concentrations. Dealers in upper-right quadrant (large balance, high risk, high delinquency) = elevated concentration risk. May warrant dealer exit or reduced credit limits. Dealers in upper-left (large balance, low risk, low delinquency) = quality partners. |

### Dealer CLTV Distribution Table

| Metric | Description | Business Use |
|---|---|---|
| **CLTV Bands by Dealer** | For each dealer, shows breakdown of loans into CLTV bands (<80%, 80–90%, 90–100%, 100–110%, 110–120%, >120%). | Shows collateral coverage by dealer. Dealers with high % of CLTV > 100% (underwater loans) = high loss severity risk. May warrant tighter underwriting or reduced credit limits. |

---

## Tab 20: Loan List (Auto Loan Details)

**Purpose:** Individual auto loan-level detail view. Provides an exportable record of every auto loan with comprehensive financial, collateral, and credit score attributes for loan-level performance analysis, workout, or verification.

### Loan Details Grid

Each row = one auto loan. Key columns include:

| Column | Description | Business Use |
|---|---|---|
| **Dealer Name** | Originating dealer. | Identifies loan source. |
| **Loan Subgroup** | Product type (e.g., Auto-Indirect Used). | Product classification. |
| **Collateral Description** | Vehicle make/model/year. | Identifies collateral. |
| **Days Past Due** | Current delinquency status. | Identifies problem loans. |
| **Current Balance** | Outstanding principal. | Valuation metric. |
| **Total Collateral Value** | Current vehicle valuation. | LTV input. |
| **CLTV** | Current loan-to-value ratio. | Risk metric. |
| **Original FICO Grade** | Credit grade at origination. | Original risk classification. |
| **Current FICO Grade** | Credit grade today. | Current risk classification. |
| **Interest Rate** | Contractual rate. | Pricing metric. |

---

## Tab 21: Balance Trend by Quarter (Production Analysis)

**Purpose:** Tracks loan production (origination) trends over time. Shows original balance originated by quarter for each loan subgroup, revealing seasonal patterns, policy changes, and business growth/contraction.

### Production Trend Chart

| Chart | Description | Business Use |
|---|---|---|
| **Stacked Area Chart: Original Balance Originated by Quarter** | X-axis = quarters (Q1 2019, Q2 2019, ..., Q1 2026); Y-axis = original balance; each loan subgroup = colored area. Stacked areas show total origination volume and product mix by quarter. | Reveals production trends and seasonality. Rising trend = business growth; falling trend = business contraction. Shifts in stacking reveal product mix changes (e.g., "We shifted from Auto to Consumer in 2024"). |

---

## Tab 22: Production Original Balance (Origination Mix by Credit Tier)

**Purpose:** Loan production analysis by credit quality. Shows the % of total original balance originated in each quarter, broken down by FICO grade (A+, A, B, C, D, E). Reveals whether underwriting standards have tightened or loosened over time.

### Production Mix Chart

| Chart | Description | Business Use |
|---|---|---|
| **Stacked Bar Chart: % of Total Original Balance by FICO Grade, by Quarter** | X-axis = quarters; Y-axis = % of total originations; segments = FICO grades (A+, A, B, C, D, E). Shows the credit quality mix of originations over time. | Reveals underwriting standard shifts. Increasing A+/A % = tightening standards; increasing D/E % = loosening standards. Helps identify whether recent originations are higher or lower quality than historical baseline. |

---

## Tab 23: Origination Year (Portfolio Composition by Year & Grade)

**Purpose:** Portfolio composition analysis by origination year and current credit grade. Shows what percentage of the current portfolio balance originated in each year and what percentage currently carries each FICO grade, revealing both portfolio age and current credit quality distribution.

### Portfolio Composition Charts

| Chart | Description | Business Use |
|---|---|---|
| **Stacked Bar Chart: % of Current Balance by Origination Year & Current FICO Grade** | X-axis = origination years (2015, 2016, ..., 2026); Y-axis = % of total current balance; segments = current FICO grades (A+, A, B, C, D, E). | Shows portfolio age and credit quality. For example: "40% of the book originated 2015–2017 and currently grades A+/A" (mature, seasoned, stable). "20% originated 2024–2025 and grades C/D" (new, unseasoned, riskier). Helps assess portfolio risk profile and aging. |

---

## Common Dashboard Filters (Appear on Multiple Tabs)

| Filter | Description | Business Use |
|---|---|---|
| **Report Date** | Select the as-of date for analysis. All metrics reflect the portfolio state on that date. | Enables month-to-month trend analysis. Users can compare current month to prior months. |
| **Loan Subgroup** | Multi-select filter for specific loan product types. | Enables product-level drill-down analysis. |
| **Original FICO Grade** | Filter by borrower credit grade at origination (A+, A, B, C, D, E). | Enables credit-tier-level analysis. |
| **CLTV Grouping** | Filter by loan-to-value ratio band. | Enables collateral-coverage-level analysis. |
| **Default Risk** | Filter by current risk tier (Low, Medium, High). | Enables risk-level filtering. |
| **Delinquency Status** | Filter by current delinquency bucket (Current, 16–29 DPD, 30–59 DPD, ..., 90+ DPD). | Enables delinquency-specific analysis. |

---

## Key Performance Indicators (KPIs) Used Across Dashboards

| KPI | Definition | Business Use | Typical Targets |
|---|---|---|---|
| **Delinquency Rate** | % of portfolio 30+ days past due. | Primary portfolio health metric. Monitored monthly. | Target: < 2% for prime portfolio; < 5% for mixed portfolio |
| **Charge-Off Rate** | Annualized loans written off as % of beginning balance. | Loss metric. Used for reserve adequacy. | Target: < 0.5% for prime; < 1.5% for mixed |
| **Recovery Rate** | Recoveries as % of charge-offs. | Loss mitigation metric. | Target: > 20% typically |
| **CLTV** | Loan balance ÷ collateral value × 100%. | Collateral risk metric. CLTV > 100% = underwater. | Target: < 80% for auto; < 75% for RE |
| **Concentration (% of Net Worth)** | Product balance ÷ regulatory net worth × 100%. | Regulatory concentration risk metric. | Target: < 10% per product (regulatory guidance) |
| **Net Interest Margin** | Weighted avg rate – (cost of capital + charge-offs + delinquency cost + default cost). | Profitability metric. | Target: positive margin across all products |
| **Credit Score Migration** | % of portfolio with improved, deteriorated, or stable credit scores. | Credit quality trend metric. | Target: > 40% improved; < 25% deteriorated |

---

## Cross-Reference to Supporting Documentation

- **Input Data Definitions:** See [9_BUSINESS_DATA_GLOSSARY.md](9_BUSINESS_DATA_GLOSSARY.md)
- **Data Transformations:** See [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md)
- **MDPA Workflow Overview:** See [1_MDPA_PROCESS_DOCUMENTATION.md](1_MDPA_PROCESS_DOCUMENTATION.md)
- **Technical Architecture:** See [2_WORKFLOW_ARCHITECTURE.md](2_WORKFLOW_ARCHITECTURE.md)
- **Data Retention & Quality:** See [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md)
- **Data Models:** See [10_LOGICAL_DATA_MODEL.md](10_LOGICAL_DATA_MODEL.md) and [11_PHYSICAL_DATA_MODEL.md](11_PHYSICAL_DATA_MODEL.md)

---

## Notes for Users

- **All metrics are calculated from the MDPA Alteryx workflow data extracts**, which refresh monthly.
- **Report Date selection drives all analysis.** Always verify you've selected the correct reporting date.
- **Filters are interactive.** Changing a filter updates all charts on that tab dynamically.
- **Export capability.** Most tables can be exported to Excel for further analysis.
- **Drill-down navigation.** Many dashboards support drill-down from summary to detail views (e.g., click a loan subgroup on the main landing page to drill to delinquency details).
- **Contact data stewardship** with questions about data definitions, calculation methodology, or metric availability.

---

**Document Version:** 1.0 | **Last Updated:** 2026-03-18 | **Next Review:** 2026-04-18
