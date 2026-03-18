# MDPA Business Data Glossary

**Comprehensive Dictionary of All Input and Output Data Fields**

**Version:** 1.0
**Last Updated:** 2026-03-17
**Purpose:** Complete reference for all data elements used as inputs and generated as outputs in the MDPA workflow
**Audience:** Business users, analysts, data stewards, developers, compliance

---

## Quick Navigation

- **Input Data Sources:** Loan Portfolio, Charge-Off & Recovery, Real Estate, Credit Bureau
- **Output Deliverables:** Client File, QA Report, Tableau Extract, Archive, Summary Metrics
- **Calculated Fields:** All derived/computed metrics
- **Data Quality Standards:** Validation rules and acceptable ranges
- **Cross-References:** Links to detailed documentation

---

## INPUT DATA GLOSSARY

### 1. Loan Portfolio Master (Primary Data Source)

**Source System:** ERP/Core Banking System
**Refresh Frequency:** Daily
**Record Count:** 10,000-50,000+ loans
**Key Purpose:** Primary portfolio data for all analysis
**Related Documentation:** See [4_DATA_SOURCES_AND_LOCATIONS.md](4_DATA_SOURCES_AND_LOCATIONS.md)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Required? | Valid Values/Range | Owner | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `Loan_ID` | Loan Identifier | String | NNNNNNNNNN (10 digits) | Unique identifier for each loan in the portfolio | Primary key for joining with other data sources; enables tracking of individual loans through entire process | Required | 1000000000-9999999999 | Loan Operations | Never changes; immutable |
| `Member_ID` | Member/Borrower ID | String | NNNNNNNNNN (10 digits) | Unique identifier for the credit union member who borrowed funds | Enables member-level analysis; required for regulatory reporting; supports member financial health assessment | Required | 1000000000-9999999999 | Member Services | Can be used to aggregate at member level |
| `Loan_Type` | Loan Product Type | String | See Valid Values | Classification of loan product/purpose | Enables portfolio segmentation; drives different processing rules; supports product profitability analysis | Required | Auto, Mortgage, Personal, Home Equity, Credit Card, Line of Credit, Other | Product Management | Used to calculate product-level metrics |
| `Origination_Date` | Loan Origination Date | Date | YYYY-MM-DD | Date the loan was originated/funded | Used to calculate loan age (maturity calculations); required for delinquency aging; supports trend analysis | Required | 2000-01-01 to TODAY() | Loan Operations | Cannot be future-dated |
| `Maturity_Date` | Loan Maturity/Payoff Date | Date | YYYY-MM-DD | Scheduled date for final loan payment | Used to calculate months to maturity; determines prepayment status; drives revenue recognition | Required | Origination_Date + Term to 2099-12-31 | Loan Operations | Must be after Origination_Date |
| `Original_Amount` | Original Loan Amount | Currency | $X,XXX.XX | Loan amount at origination | Baseline for calculating loss severity; enables loan size analysis; supports portfolio volume tracking | Required | $100.00 - $500,000.00 | Loan Operations | Static; never changes |
| `Current_Balance` | Current Outstanding Balance | Currency | $X,XXX.XX | Outstanding principal amount remaining on the loan | Primary metric for portfolio valuation; used in LTV calculations; drives risk assessments | Required | $0.00 - Original_Amount | Loan Operations | Updates monthly; key balance sheet item |
| `Interest_Rate` | Loan Interest Rate (Annual) | Decimal | X.XX% | Annual percentage rate charged on the loan | Used for interest income calculations; supports pricing analysis; required for regulatory disclosures | Required | 0.00% - 30.00% | Loan Pricing | Can be fixed or variable |
| `Payment_Frequency` | Payment Frequency | String | Monthly, Quarterly, Annual | How often loan payments are due | Determines payment schedule; used in delinquency calculations; supports cash flow projections | Required | Monthly, Quarterly, Annual | Loan Operations | Most common is Monthly (>95%) |
| `Payment_Status` | Current Delinquency Status | String | Current, 30DPD, 60DPD, 90DPD, 120DPD+, Default, Paid Off, Charged Off | Days past due status as of report date | Primary risk indicator; drives collection actions; required for regulatory compliance (CRA reporting); Fair Lending analysis | Required | See Valid Values | Credit Risk | Updated daily; critical for risk management |
| `Days_Past_Due` | Days Past Due (Numeric) | Integer | NNN | Number of days the payment is overdue | Granular delinquency metric; used to predict default; supports early warning systems | Optional | 0 - 9999 | Credit Risk | Null if Payment_Status = "Current" or "Paid Off" |
| `Collateral_Type` | Type of Collateral | String | Auto, Real Estate, Securities, Equipment, Unsecured, Other | Type of collateral securing the loan | Determines loss severity in default; drives LTV calculations; supports credit decisions; impacts recovery modeling | Optional | See Valid Values | Credit Risk | Impacts risk category significantly |
| `Collateral_Value` | Collateral Current Fair Market Value | Currency | $X,XXX.XX | Current estimated market value of collateral | Used to calculate LTV ratio; determines recovery potential; supports stress testing; used in capital adequacy | Optional | $0.00 - $9,999,999.99 | Appraisal System | May be null for unsecured loans |
| `LTV_Ratio` | Loan-to-Value Ratio | Decimal | XXX.XX% | Current_Balance / Collateral_Value × 100 | Risk indicator; determines loan risk category; supports portfolio stress testing; regulatory capital requirement | Calculated | 0% - 500% | Credit Risk | Can exceed 100% if collateral value declined |
| `Credit_Score` | Member Credit Score (FICO) | Integer | NNN | FICO credit score from primary credit bureau (TransUnion) | Primary credit risk indicator; supports underwriting decisions; required for fair lending analysis; impacts pricing | Optional | 300 - 850 | Credit Risk | Updated monthly from bureau |
| `DTI_Ratio` | Debt-to-Income Ratio | Decimal | XXX.XX% | Total monthly debt obligations / Monthly gross income | Measures borrower repayment capacity; used in underwriting; supports portfolio risk assessment; regulatory requirement | Optional | 0% - 500% | Credit Risk | Recalculated annually or at renewal |

---

### 2. Charge-Off & Recovery Data

**Source System:** Loss Management/Collections System
**Refresh Frequency:** Daily
**Record Count:** 1,000-5,000 active charge-offs
**Key Purpose:** Track losses and recovery progress
**Related Documentation:** See [4_DATA_SOURCES_AND_LOCATIONS.md](4_DATA_SOURCES_AND_LOCATIONS.md) and [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Required? | Valid Values/Range | Owner | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `Charge_Off_Date` | Charge-Off Date | Date | YYYY-MM-DD | Date loan was charged off as uncollectible | Determines loss realization date; supports loss analysis; required for financial reporting; drives loan loss provision | Optional (only if charged off) | Origination_Date to TODAY() | Collections | GAAP Tier 1: Must age loan 120+ DPD |
| `Charge_Off_Amount` | Principal Charge-Off Amount | Currency | $X,XXX.XX | Principal amount written off as loss | Measures credit loss; used in loss rate calculations; supports reserve adequacy analysis; regulatory reporting | Optional | $0.00 - Original_Amount | Collections | Never includes accrued interest |
| `Recovery_Amount` | Total Recovery to Date | Currency | $X,XXX.XX | Cumulative amount recovered after charge-off (principal + interest) | Reduces net credit loss; measures collection effectiveness; supports reserve recapture; impacts loss mitigation | Optional | $0.00 - Unlimited | Collections | Cumulative across all recovery activity |
| `Recovery_Date` | Most Recent Recovery Date | Date | YYYY-MM-DD | Date of most recent recovery/collection payment | Measures collection timeliness; supports aging analysis; determines recovery velocity; impacts reserves | Optional | Charge_Off_Date to TODAY() | Collections | Updates with each recovery transaction |
| `Recovery_Transaction_Type` | Recovery Transaction Code | String | COFR, NSF, GAP, REP, MAN, OTH | Type of recovery (Charge-Off Recovery, NSF Fee, GAP Insurance, Repossession, Manual Payment, Other) | Categorizes recovery sources; enables recovery pattern analysis; supports trend identification; drives follow-up strategy | Optional | See Valid Values | Collections | Used to route to appropriate collection channel |
| `Principal_Recovered` | Principal Amount Recovered | Currency | $X,XXX.XX | Principal portion of recovery amount | Measures principal recovery; supports loss severity analysis; required for regulatory reporting; impacts reserve releases | Optional | $0.00 - Charge_Off_Amount | Collections | Excludes interest/fees recovered |
| `Interest_Recovered` | Interest & Fees Recovered | Currency | $X,XXX.XX | Interest and fee portion of recovery amount | Measures additional income recovery; supports profitability analysis; impacts net charge-off amount | Optional | $0.00 - Unlimited | Collections | Can exceed interest accrued due to late fees |

---

### 3. Real Estate Valuation Data

**Source System:** Appraisal Management System
**Refresh Frequency:** Quarterly (appraisals) or as-needed
**Record Count:** 3,000-10,000 properties
**Key Purpose:** Support LTV calculations and collateral risk assessment
**Related Documentation:** See [4_DATA_SOURCES_AND_LOCATIONS.md](4_DATA_SOURCES_AND_LOCATIONS.md)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Required? | Valid Values/Range | Owner | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `Property_Address` | Collateral Property Address | String | "123 Main St, City, ST 12345" | Complete mailing address of collateral property | Enables property-level tracking; supports collateral documentation; required for regulatory exams; enables geographic analysis | Optional (RE loans only) | Valid US address | Appraisal System | Used to match/consolidate properties |
| `Appraised_Value` | Most Recent Appraisal Value | Currency | $X,XXX.XX | Fair market value per most recent appraisal | Primary input for LTV calculation; determines loan risk category; supports stress testing; drives capital adequacy | Optional (RE loans only) | $10,000 - $5,000,000 | Appraisal System | Used for regulatory capital calculations |
| `Appraisal_Date` | Appraisal Date | Date | YYYY-MM-DD | Date of most recent property appraisal | Determines appraisal age/staleness; triggers re-appraisal requirement if >12 months; supports compliance | Optional (RE loans only) | 2000-01-01 to TODAY() | Appraisal System | Re-appraisal required if >12 months old |
| `Market_Value_Trend` | Property Market Value Trend | String | Up, Down, Stable, Unknown | Direction of property market value movement | Indicates collateral risk trend; supports stress testing; informs collection strategy | Optional | Up, Down, Stable, Unknown | Appraisal System | Used in risk assessment and portfolio analysis |

---

### 4. TransUnion Credit Bureau Data

**Source System:** TransUnion (External Credit Bureau)
**Refresh Frequency:** Monthly (batch update)
**Record Count:** 8,000-40,000 members (subset of portfolio)
**Key Purpose:** Enhance risk assessment with external credit metrics
**Related Documentation:** See [4_DATA_SOURCES_AND_LOCATIONS.md](4_DATA_SOURCES_AND_LOCATIONS.md)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Required? | Valid Values/Range | Owner | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `Credit_Score` | Member Credit Score (FICO) | Integer | NNN | FICO credit score from TransUnion | Primary credit risk indicator; supports underwriting decisions; required for fair lending analysis (CRA); pricing input | Optional | 300 - 850 | Credit Risk | Updated monthly; 2-day reporting lag |
| `Score_Trend` | Credit Score Trend | String | Improving, Declining, Stable | Direction of member's credit score movement | Indicator of member financial trajectory; supports risk prediction; informs collection timing | Optional | Improving, Declining, Stable, Unknown | Credit Risk | Calculated month-over-month |
| `Public_Records_Count` | Public Records Count | Integer | NN | Count of negative public records (bankruptcy, liens, judgments) | Indicators of severe financial distress; drives default risk; supports collection priority | Optional | 0 - 99 | Credit Risk | Major risk factor; usually weights heavily |
| `Active_Accounts` | Number of Active Credit Accounts | Integer | NN | Count of active credit lines/accounts | Measures credit diversification; indicates available liquidity; impacts DTI assessment | Optional | 0 - 99 | Credit Risk | Includes all types of credit accounts |
| `Total_Revolving_Balance` | Total Revolving Credit Balance | Currency | $X,XXX.XX | Sum of all credit card and revolving balances | Used in DTI calculations; measures liquidity constraints; impacts debt capacity | Optional | $0.00 - $9,999,999.99 | Credit Risk | Key input for DTI ratio |

---

## OUTPUT DATA GLOSSARY

### 1. Client Deliverable File (Monthly Client Report)

**Recipient:** Credit Union Clients (External)
**Format:** Excel (.xlsx) or CSV
**Frequency:** Monthly
**Record Count:** Same as input portfolio (10,000-50,000+ rows)
**Purpose:** Monthly portfolio reporting for client reconciliation and analysis
**Related Documentation:** See [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Source/Calculation | PII Masked? | Notes |
|---|---|---|---|---|---|---|---|---|
| `Loan_ID` | Loan Identifier | String | NNNNNNNNNN | Unique loan identifier | Primary reference for client portfolio matching and reconciliation | Pass-through from Loan Portfolio | No (client data) | Used to match against client records |
| `Member_Name` | Borrower Name | String | "LastName, FirstName" | Name of borrower (formatted for readability) | Client portfolio identification; required for disclosures | Formatted from Member_First_Name, Member_Last_Name | Yes (per policy) | Applied all client-facing outputs |
| `Loan_Amount` | Original Loan Amount | Currency | $X,XXX.XX | Original loan amount at origination | Portfolio reference; supports volume analysis; reconciliation | Pass-through from Original_Amount | No | For historical reconciliation |
| `Current_Balance` | Current Outstanding Balance | Currency | $X,XXX.XX | Current principal balance as of report date | Primary metric for portfolio valuation; reconciliation with GL; balance verification | Pass-through from Current_Balance | No | Most important metric for reconciliation |
| `Interest_Rate` | Annual Interest Rate | Decimal | X.XX% | Annual percentage rate | Pricing verification; supports profitability analysis; regulatory disclosures | Pass-through from Interest_Rate | No | Used for interest income verification |
| `Payment_Status` | Loan Status | String | Current, 30DPD, 60DPD, 90DPD+, Default, Paid Off, Charged Off | Current delinquency status as of report date | Portfolio health indicator; determines collection priority; regulatory classification | Pass-through from Payment_Status | No | Critical for risk segmentation |
| `Days_PD` | Days Past Due (if delinquent) | Integer | NNN | Number of days delinquent | Delinquency detail; supports aging analysis; collection priority | Pass-through from Days_Past_Due (null if Current) | No | Null for non-delinquent loans |
| `Risk_Level` | Credit Risk Category | String | Low, Medium, High, Critical | Risk classification based on payment status and credit metrics | Portfolio risk summary; supports board reporting; drives collection strategy; regulatory capital | Calculated: Bucket Risk_Score into tiers | No | Used for portfolio dashboard |
| `Recovery_Flag` | Charge-Off Recovery Indicator | String | Y/N | Whether loan has charge-off recoveries | Identifies loans with recent recovery activity; tracks loss mitigation | IF Recovery_Amount > 0 THEN "Y" ELSE "N" | No | Alerts client to recovery progress |

---

### 2. QA & Validation Report (Internal Quality Assurance)

**Recipient:** Internal QA Team, Management
**Format:** Excel (.xlsx) with charts
**Frequency:** Monthly (after each run)
**Purpose:** Quality assurance and process health metrics
**Related Documentation:** See [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md) and [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Source/Calculation | PII Masked? | Notes |
|---|---|---|---|---|---|---|---|---|
| `Report_Date` | Report Date | Date | YYYY-MM-DD | Date the MDPA process was run | Process identification and audit trail; historical tracking | System current date at execution | No | Used to verify timeliness |
| `Report_Period` | Report Month/Quarter | String | YYYY-MM or YYYY-Q# | Period covered by the report | Aligns with financial reporting cycle; enables trending | Derived from Report_Date | No | For reconciliation to GL |
| `Total_Loans` | Total Loans Processed | Integer | NNNNNNN | Total count of loans in portfolio | Portfolio volume metric; trend tracking; capacity planning | COUNT(*) from input file | No | Should match previous month ±10% |
| `Portfolio_Balance` | Total Portfolio Balance | Currency | $XXX,XXX,XXX.XX | Sum of all current outstanding balances | Portfolio valuation for financial statements; GL reconciliation | SUM(Current_Balance) | No | Reconciled to General Ledger |
| `Average_Interest_Rate` | Weighted Average Interest Rate | Decimal | X.XX% | Average rate across entire portfolio weighted by balance | Portfolio yield metric; supports pricing analysis; profitability modeling | AVG(Interest_Rate) weighted by Current_Balance | No | Used in NIM analysis |
| `Current_Loans` | Count of Current Loans | Integer | NNNNN | Count of loans with Payment_Status = "Current" | Baseline portfolio health metric | COUNT(*) WHERE Payment_Status = "Current" | No | Complement to delinquency counts |
| `Delinquent_Loans` | Count of Delinquent Loans | Integer | NNNNN | Count of loans 30+ days past due | Risk indicator; supports early warning; triggers collection actions | COUNT(*) WHERE Days_Past_Due >= 30 | No | Used in risk monitoring |
| `Delinquency_Rate` | Portfolio Delinquency Rate | Decimal | X.XX% | Percentage of portfolio 30+ DPD | Industry benchmark metric; peer comparison; regulatory compliance (call report) | Delinquent_Loans / Total_Loans × 100 | No | Required for regulatory reporting |
| `Charge_Off_Count` | Loans Charged Off (Period) | Integer | NNNNN | Count of new charge-offs in period | Loss activity tracking; trend analysis; loss reserve adequacy | COUNT(*) WHERE Charge_Off_Date in period | No | Monitored for trends |
| `Charge_Off_Amount` | Total Charge-Off Amount (Period) | Currency | $XXX,XXX,XXX.XX | Sum of charge-off amounts in current period | Credit loss quantification; loss provision input; regulatory reporting | SUM(Charge_Off_Amount) WHERE Charge_Off_Date in period | No | Used in reserve calculation |
| `Charge_Off_Rate` | Annualized Charge-Off Rate | Decimal | X.XX% | Annualized charge-offs as % of beginning portfolio balance | Loss rate metric for reserve calculations; peer benchmarking; stress testing | (Charge_Off_Amount / Beginning_Balance) × 12 | No | Key metric for loan loss reserve |
| `Recovery_Count` | Loans with Recoveries (Period) | Integer | NNNNN | Count of loans with recovery activity in period | Collection activity level; indicates active collections | COUNT(*) WHERE Recovery_Date in period AND Recovery_Amount > 0 | No | Measures collection effort |
| `Recovery_Amount` | Total Recoveries (Period) | Currency | $XXX,XXX,XXX.XX | Sum of recovery amounts in period | Loss mitigation quantification; reserve release; profitability impact | SUM(Recovery_Amount) WHERE Recovery_Date in period | No | Reduces net charge-offs |
| `Recovery_Rate` | Recovery Success Rate | Decimal | X.XX% | Recoveries as % of charge-offs (period) | Collection effectiveness metric; management KPI; peer comparison | Recovery_Amount / Charge_Off_Amount × 100 | No | Target: >20% typically |
| `Data_Quality_Score` | Overall Data Quality Score | Decimal | X.XX% | Percentage of records passing all validation rules | Data integrity indicator; process health; SLA compliance | (Records_Passed / Total_Records) × 100 | No | Target: >99% |
| `Processing_Duration` | Workflow Processing Time | Decimal | NNN.NN minutes | Actual execution time of complete workflow | Performance tracking; SLA monitoring; capacity planning; bottleneck identification | System execution time capture | No | Baseline: ~150 min (2.5 hrs) |
| `Error_Count` | Validation Errors (Period) | Integer | NNNNN | Count of records failing validation rules | Data quality issues requiring investigation/correction | COUNT(*) of failed validation rules | No | Should trend toward zero |
| `Exception_Count` | Records in Exception Queue | Integer | NNNNN | Count of records flagged for manual review | Manual intervention requirements; process backlog | COUNT(*) of manually flagged records | No | Drives resource planning |

---

### 3. Tableau Extract (Analytics & Dashboard)

**Recipient:** Internal Analytics/BI Team, Management Dashboards
**Format:** Tableau Data Extract (.tde or .hyper)
**Frequency:** Daily (automated refresh)
**Purpose:** Feed dashboards and analytics tools; real-time portfolio visibility
**Related Documentation:** See [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Source/Calculation | PII Masked? | Notes |
|---|---|---|---|---|---|---|---|---|
| `Loan_ID` | Loan Identifier (Dimension) | String | NNNNNNNNNN | Unique loan identifier | Drill-down dimension in dashboards; transaction detail | Pass-through | No | Denormalized for dashboard query performance |
| `Loan_Type` | Loan Type (Dimension) | String | See Valid Values | Loan product classification | Dashboard filter; enables product-level analysis | Pass-through | No | Used in product performance dashboard |
| `Payment_Status` | Payment Status (Dimension) | String | Current, 30DPD, 60DPD, 90DPD+, Default, Paid Off | Delinquency status | Primary dashboard filter; drives segmentation | Pass-through | No | Most-used dimension in dashboards |
| `Risk_Category` | Risk Category (Dimension) | String | Low, Medium, High, Critical | Risk classification | Dashboard filter; color coding; risk heat maps | Calculated: Bucket Risk_Score | No | Used in Executive Dashboard |
| `Origination_Month` | Origination Month (Dimension) | Date | YYYY-MM | Month loan was originated | Vintage analysis; cohort tracking; performance by vintage | TRUNC(Origination_Date, 'month') | No | Used in Seasoning & Vintage dashboards |
| `Current_Balance` | Current Balance (Measure) | Currency | $X,XXX.XX | Outstanding principal | Key metric in all dashboards; portfolio valuation | Pass-through | No | Summed in all portfolio aggregates |
| `Risk_Score` | Risk Score (Measure) | Decimal | X.XX | Composite risk calculation | Numeric risk representation; dashboard aggregation | (100-Credit_Score/10)×(DTI/100)×(Age/365) | No | Used in risk clustering analysis |
| `Days_PD` | Days Past Due (Measure) | Integer | NNN | Days delinquent | Dashboard detail; drill-down detail | Pass-through (null if Current) | No | Used in delinquency aging analysis |
| `Report_Date` | Report Date (Dimension) | Date | YYYY-MM-DD | Date of data extract | Time dimension for dashboard filtering | System date | No | Enables historical trending |

---

### 4. Archive File (Historical & Audit Trail)

**Recipient:** Compliance, Audit, Records Management
**Format:** Compressed archive (.zip) containing all stage outputs
**Frequency:** Monthly (after completion)
**Purpose:** Compliance, audit trail, historical reference, recovery
**Related Documentation:** See [3_MACROS_AND_DEPENDENCIES.md](3_MACROS_AND_DEPENDENCIES.md)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Source/Calculation | PII Masked? | Notes |
|---|---|---|---|---|---|---|---|---|
| `Archive_Date` | Archive Creation Date | Date | YYYY-MM-DD | Date archive was created | Audit trail; file inventory; retention scheduling | System date | No | Used for retention policies (7+ years) |
| `Archive_Period` | Period Covered | String | YYYY-MM | Month/period included in archive | Historical reference; enables period lookups | Derived from report period | No | Used to identify correct archive |
| `Input_File_Hash` | Input File Checksum | String | SHA256 hash | Cryptographic hash of input file | Data integrity verification; audit trail; fraud prevention | SHA256(input_file) | No | Enables verification of input file |
| `Output_File_Hash` | Output File Checksum | String | SHA256 hash | Cryptographic hash of output file | Data integrity verification; audit trail; ensures data hasn't been modified | SHA256(output_file) | No | Enables verification of output |
| `Processing_Log` | Processing Log File | Text | Plain text log | Complete log of processing steps, duration, errors | Audit trail; troubleshooting; compliance documentation | Captured from workflow execution | No | Used in audit reviews |
| `Data_Dictionary` | Included Data Dictionary | Reference | This glossary | Field definitions, business logic, calculations | Enables understanding of archived data without original documentation | Reference to 9_BUSINESS_DATA_GLOSSARY.md | No | Included in each archive |

---

### 5. Summary Metrics File (Executive Reporting)

**Recipient:** Executive Management, Board of Directors
**Format:** Slide deck or executive summary PDF
**Frequency:** Monthly
**Purpose:** High-level KPI reporting for strategic decision-making
**Related Documentation:** See [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Source/Calculation | PII Masked? | Notes |
|---|---|---|---|---|---|---|---|---|
| `Portfolio_Balance` | Total Portfolio Balance | Currency | $XXX,XXX,XXX.XX | Sum of all outstanding balances | Board-level financial metric; balance sheet item | SUM(Current_Balance) | No | Reconciled to GL for accuracy |
| `Delinquency_Rate` | 30+ Day Delinquency Rate | Decimal | X.XX% | Portfolio delinquency percentage | Board KPI; peer comparison; regulatory metric | Delinquent_Count / Total_Loans × 100 | No | Trended month-over-month |
| `Charge_Off_Rate` | Annualized Charge-Off Rate | Decimal | X.XX% | Loss rate | Loan loss reserve adequacy; peer benchmarking | (CO_Amount / Beginning_Balance) × 12 | No | Used in reserve analysis |
| `Charge_Off_Trend` | Charge-Off Trend (6-month) | Chart/Graph | Line chart | 6-month trend of charge-off activity | Risk trend analysis; early warning indicator | Calculated from historical data | No | Shows deterioration/improvement |
| `Recovery_Rate` | Recovery Success Rate | Decimal | X.XX% | Recoveries as % of charge-offs | Loss mitigation effectiveness; operational efficiency | Recovery_Amount / Charge_Off_Amount × 100 | No | Collections effectiveness metric |
| `Largest_Loans` | Top 10 Loans by Balance | List | Table format | Largest loans in portfolio (concentration risk) | Concentration risk analysis; board oversight | TOP 10 ORDER BY Current_Balance DESC | Yes (names masked) | Identifies single-obligor risk |

---

## CALCULATED FIELDS LEGEND

**All Derived/Computed Metrics**

| Calculation | Formula | Data Type | Used In | Business Purpose | Calculation Timing | Owner |
|---|---|---|---|---|---|---|
| **LTV Ratio** | (Current_Balance / Collateral_Value) × 100 | Decimal % | QA Report, Risk Analysis | Risk indicator; determines loss recovery potential; regulatory capital | At-run time | Credit Risk |
| **Risk Score** | (100 - Credit_Score/10) × (DTI_Ratio/100) × (Age_Days/365) | Decimal (0-100) | Client Report, Tableau | Composite risk combining payment behavior, capacity, loan seasoning | At-run time | Credit Risk |
| **Risk_Level** | IF Risk_Score < 20 THEN "Low" ELSE IF < 50 THEN "Medium" ELSE IF < 80 THEN "High" ELSE "Critical" | String | Client Report | Risk bucketing for portfolio segmentation and collection priority | At-run time | Credit Risk |
| **Age_of_Loan_Days** | TODAY() - Origination_Date | Integer | QA Report (internal), Tableau | Loan seasoning; maturity profile analysis; default probability (older loans typically safer) | At-run time | Credit Risk |
| **Months_to_Maturity** | (Maturity_Date - TODAY()) / 30 | Decimal | QA Report (internal) | Prepayment/payoff timeline; refinance opportunity identification | At-run time | Loan Operations |
| **Delinquency_Rate** | Delinquent_Loans / Total_Loans × 100 | Decimal % | QA Report, Executive Summary | Portfolio health metric; regulatory report (call report item); peer comparison | Monthly | Credit Risk |
| **Charge_Off_Rate** | (Charge_Off_Amount / Beginning_Portfolio_Balance) × 12 | Decimal % | QA Report, Executive Summary | Annualized loss rate; loan loss reserve adequacy; ALCO metric | Monthly | Credit Risk |
| **Recovery_Rate** | Recovery_Amount / Charge_Off_Amount × 100 | Decimal % | QA Report, Executive Summary | Collection effectiveness; loss mitigation success; operational efficiency | Monthly | Collections |
| **Data_Quality_Score** | (Records_Passed / Total_Records) × 100 | Decimal % | QA Report | Data integrity indicator; process health; SLA compliance (target: >99%) | At-run time | Data QA |
| **Days_to_Write_Off** | Days_Past_Due where threshold (120 typically) | Integer | Risk Monitoring | Identifies loans approaching charge-off threshold; triggers review | Daily | Credit Risk |

---

## DATA QUALITY STANDARDS & VALIDATION RULES

**All Data Governance Rules**

| Field | Validation Rule | Failure Action | Severity | Owner | Related Doc |
|---|---|---|---|---|---|
| **Loan_ID** | NOT NULL AND UNIQUE AND LENGTH=10 AND ALL DIGITS | Reject record from processing | CRITICAL | Data QA | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |
| **Member_ID** | NOT NULL AND LENGTH=10 AND ALL DIGITS | Reject record from processing | CRITICAL | Data QA | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |
| **Current_Balance** | > 0 AND ≤ Original_Amount | Flag as anomaly; require manual review | HIGH | Credit Risk | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |
| **Interest_Rate** | 0% ≤ rate ≤ 30% | Flag if outside range; review pricing | MEDIUM | Loan Pricing | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |
| **Days_Past_Due** | IF Current THEN NULL ELSE 0 ≤ DPD ≤ 9999 | Set to NULL if invalid | MEDIUM | Credit Risk | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |
| **Credit_Score** | (300-850) OR NULL | Flag if outside range; investigate | HIGH | Credit Risk | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |
| **LTV_Ratio** | 0% ≤ LTV ≤ 200% (allows >100%) | Flag if LTV > 200%; investigate collateral | HIGH | Credit Risk | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |
| **Origination_Date** | NOT NULL AND ≤ TODAY() | Reject record; verify source data | CRITICAL | Loan Operations | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |
| **Maturity_Date** | NOT NULL AND > Origination_Date AND ≤ 2099-12-31 | Reject record; verify source data | CRITICAL | Loan Operations | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |
| **Payment_Status** | IN (Current, 30DPD, 60DPD, 90DPD, 120DPD+, Default, Paid Off, Charged Off) | Reject record; invalid status | CRITICAL | Credit Risk | [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md) |
| **Charge_Off_Date** | IF Charged_Off THEN Date ≤ TODAY() ELSE NULL | Reject if CO_Date > TODAY() | CRITICAL | Collections | [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md) |
| **Recovery_Amount** | IF Charged_Off THEN ≥ $0 ELSE NULL | Set to $0 if null for CO loans | MEDIUM | Collections | [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md) |
| **Collateral_Value** | NULL OR > $0 | Flag if missing for collateralized loans | MEDIUM | Appraisal System | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |
| **Data_Completeness** | All required fields populated for >99% of records | Alert if <99%; investigate missing data | MEDIUM | Data QA | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |

---

## Cross-Reference Guide

**How to Navigate Between Documentation and Glossary**

| Topic | See This Document |
|---|---|
| **Input Data Sources** | [4_DATA_SOURCES_AND_LOCATIONS.md](4_DATA_SOURCES_AND_LOCATIONS.md) - Details on file paths, refresh schedules, SLAs |
| **Data Transformations** | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) - 7-stage transformation showing how fields change |
| **Quality & Validation** | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) - Validation rules and quality gates |
| **Macro Processing** | [7_MACROS_DEEP_DIVE.md](7_MACROS_DEEP_DIVE.md) - Detail on which macros process which fields |
| **Alerts & Errors** | [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md) - What triggers alerts on data quality issues |
| **Workflow Overview** | [1_MDPA_PROCESS_DOCUMENTATION.md](1_MDPA_PROCESS_DOCUMENTATION.md) - High-level context for all data flows |
| **Architecture Details** | [2_WORKFLOW_ARCHITECTURE.md](2_WORKFLOW_ARCHITECTURE.md) - Tool-by-tool processing logic |

---

## Usage Guide by Role

### For Business Users / Analysts
1. Start with **Output Data** section (what you'll see in reports)
2. Reference **Calculated Fields** for metric definitions
3. Check **Data Quality Standards** to understand acceptable values
4. Link to [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) for transformation logic

### For Data Stewards / Data Governance
1. Review **Data Quality Standards** section
2. Check field **Owners** for stewardship assignments
3. Reference **Valid Values/Ranges** for data governance rules
4. Monitor via [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md) for quality issues

### For Developers / Technical Teams
1. Start with **Input Data** glossary
2. Reference **Calculated Fields** for logic implementation
3. See [7_MACROS_DEEP_DIVE.md](7_MACROS_DEEP_DIVE.md) for macro field processing
4. Check [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) for transformation SQL

### For Compliance / Audit
1. Review **Data Quality Standards** for control framework
2. Check **Owners** column for accountability
3. See [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md) for control alerts
4. Reference **Archive** output type for compliance documentation

---

## Maintenance & Updates

**This glossary should be updated when:**
- New fields are added to any input source
- New output types/deliverables are created
- Validation rules change
- Data owners change
- Calculated formulas are modified
- Data quality standards shift

**Update Process:**
1. Document change with effective date
2. Update relevant field row
3. Update cross-reference links if applicable
4. Notify all stakeholder groups
5. Archive previous version

---

## Contact & Governance

| Question | Contact | Resource |
|---|---|---|
| Field definition or business purpose | Data owner (see Owner column) | This glossary |
| Data quality issues | Data QA team | [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md) |
| Transformation logic | Development team | [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) |
| Macro processing | Alteryx support | [7_MACROS_DEEP_DIVE.md](7_MACROS_DEEP_DIVE.md) |
| Source system data | Systems team | [4_DATA_SOURCES_AND_LOCATIONS.md](4_DATA_SOURCES_AND_LOCATIONS.md) |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-17
**Document Owner:** Loan Analytics Team
**Related Validation:** See [VALIDATION_PLAN.md](VALIDATION_PLAN.md) - Week 2 data source validation

---
