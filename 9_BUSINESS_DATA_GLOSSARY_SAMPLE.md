# MDPA Business Data Glossary - Sample

**Purpose:** Comprehensive dictionary of all input and output data with business context, definitions, and usage

**Format:** Tabular glossary organized by data source (inputs) and deliverable (outputs)

**Last Updated:** 2026-03-17

---

## INPUT DATA GLOSSARY

### Loan Portfolio Master (Core Data Source)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Required? | Valid Values/Range | Owner |
|---|---|---|---|---|---|---|---|---|
| `Loan_ID` | Loan Identifier | String | NNNNNNNNNN (10 digits) | Unique identifier for each loan in the portfolio | Primary key for joining with other data sources; enables tracking of individual loans through entire process | Required | 1000000000-9999999999 | Loan Operations |
| `Member_ID` | Member/Borrower ID | String | NNNNNNNNNN (10 digits) | Unique identifier for the credit union member who borrowed funds | Enables member-level analysis; required for regulatory reporting; supports member financial health assessment | Required | 1000000000-9999999999 | Member Services |
| `Loan_Type` | Loan Product Type | String | Auto, Mortgage, Personal, Home Equity, Credit Card, Other | Classification of loan product/purpose | Enables portfolio segmentation; drives different processing rules; supports product profitability analysis | Required | Auto, Mortgage, Personal, Home Equity, Credit Card, Other | Product Management |
| `Origination_Date` | Loan Origination Date | Date | YYYY-MM-DD | Date the loan was originated/funded | Used to calculate loan age (maturity calculations); required for delinquency aging; supports trend analysis | Required | 2000-01-01 to TODAY() | Loan Operations |
| `Maturity_Date` | Loan Maturity/Payoff Date | Date | YYYY-MM-DD | Scheduled date for final loan payment | Used to calculate months to maturity; determines prepayment status; drives revenue recognition | Required | Origination_Date + Term to 2099-12-31 | Loan Operations |
| `Original_Amount` | Original Loan Amount | Currency | $X,XXX.XX | Loan amount at origination | Baseline for calculating loss severity; enables loan size analysis; supports portfolio volume tracking | Required | $100.00 - $500,000.00 | Loan Operations |
| `Current_Balance` | Current Outstanding Balance | Currency | $X,XXX.XX | Outstanding principal amount remaining on the loan | Primary metric for portfolio valuation; used in LTV calculations; drives risk assessments | Required | $0.00 - Original_Amount | Loan Operations |
| `Interest_Rate` | Loan Interest Rate (Annual) | Decimal | X.XX% | Annual percentage rate charged on the loan | Used for interest income calculations; supports pricing analysis; required for regulatory disclosures | Required | 0.00% - 30.00% | Loan Pricing |
| `Payment_Frequency` | Payment Frequency | String | Monthly, Quarterly, Annual | How often loan payments are due | Determines payment schedule; used in delinquency calculations; supports cash flow projections | Required | Monthly, Quarterly, Annual | Loan Operations |
| `Payment_Status` | Current Delinquency Status | String | Current, 30DPD, 60DPD, 90DPD, 120DPD+, Default, Paid Off | Days past due status as of report date | Primary risk indicator; drives collection actions; required for regulatory compliance (CRA reporting) | Required | See Valid Values | Credit Risk |
| `Days_Past_Due` | Days Past Due | Integer | NNN | Number of days the payment is overdue | Granular delinquency metric; used to predict default; supports early warning systems | Optional | 0 - 9999 | Credit Risk |
| `Collateral_Type` | Collateral Type | String | Auto, Real Estate, Securities, Equipment, Unsecured, Other | Type of collateral securing the loan | Determines loss severity in default; drives LTV calculations; supports credit decisions | Optional | Auto, Real Estate, Securities, Equipment, Unsecured, Other | Credit Risk |
| `Collateral_Value` | Collateral Current Fair Market Value | Currency | $X,XXX.XX | Current estimated market value of collateral | Used to calculate LTV ratio; determines recovery potential; supports stress testing | Optional | $0.00 - $9,999,999.99 | Appraisal System |
| `LTV_Ratio` | Loan-to-Value Ratio | Decimal | XXX.XX% | Current Balance / Collateral_Value | Risk indicator; determines loan risk category; supports portfolio stress testing | Calculated | 0% - 500% | Credit Risk |
| `Credit_Score` | Member Credit Score (FICO) | Integer | NNN | FICO credit score from primary credit bureau | Primary credit risk indicator; supports underwriting decisions; required for fair lending analysis | Optional | 300 - 850 | Credit Risk |
| `DTI_Ratio` | Debt-to-Income Ratio | Decimal | XXX.XX% | Total monthly debt payments / Monthly gross income | Measures borrower repayment capacity; used in underwriting; supports portfolio risk assessment | Optional | 0% - 500% | Credit Risk |

---

### Charge-Off & Recovery Data

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Required? | Valid Values/Range | Owner |
|---|---|---|---|---|---|---|---|---|
| `Charge_Off_Date` | Charge-Off Date | Date | YYYY-MM-DD | Date loan was charged off as uncollectible | Determines loss realization date; supports loss analysis; required for financial reporting | Optional | Origination_Date to TODAY() | Collections |
| `Charge_Off_Amount` | Charge-Off Amount | Currency | $X,XXX.XX | Principal amount written off as loss | Measures credit loss; used in loss rate calculations; supports reserve adequacy analysis | Optional | $0.00 - Original_Amount | Collections |
| `Recovery_Amount` | Total Recovery to Date | Currency | $X,XXX.XX | Cumulative amount recovered after charge-off | Reduces net credit loss; measures collection effectiveness; supports reserve recapture | Optional | $0.00 - Charge_Off_Amount | Collections |
| `Recovery_Date` | Most Recent Recovery Date | Date | YYYY-MM-DD | Date of most recent recovery/collection payment | Measures collection timeliness; supports aging analysis; determines recovery velocity | Optional | Charge_Off_Date to TODAY() | Collections |
| `Recovery_Transaction_Type` | Recovery Transaction Code | String | COFR, NSF, GAP, REP, MAN, OTH | Type of recovery transaction (Charge-off Recovery, NSF Fee, GAP, etc.) | Categorizes recovery sources; enables recovery pattern analysis; supports trend identification | Optional | COFR, NSF, GAP, REP, MAN, OTH | Collections |
| `Principal_Recovered` | Principal Amount Recovered | Currency | $X,XXX.XX | Principal portion of recovery amount | Measures principal recovery; supports loss severity analysis; required for regulatory reporting | Optional | $0.00 - Charge_Off_Amount | Collections |
| `Interest_Recovered` | Interest/Fees Recovered | Currency | $X,XXX.XX | Interest and fee portion of recovery amount | Measures additional income recovery; supports profitability analysis | Optional | $0.00 - Unlimited | Collections |

---

## OUTPUT DATA GLOSSARY

### Client Deliverable File (Monthly Client Report)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Source Calculation | Recipient |
|---|---|---|---|---|---|---|---|
| `Loan_ID` | Loan Identifier | String | NNNNNNNNNN | Unique loan identifier | Primary reference for client portfolio matching | Pass-through from input | Credit Union Client |
| `Member_Name` | Borrower Name | String | "LastName, FirstName" | Name of borrower (PII Masked per policy) | Client portfolio identification; regulatory requirement | Formatted: LASTNAME, FIRSTNAME | Credit Union Client |
| `Loan_Amount` | Original Loan Amount | Currency | $X,XXX.XX | Original loan amount at origination | Portfolio reference; supports volume analysis | Pass-through from input | Credit Union Client |
| `Current_Balance` | Current Outstanding Balance | Currency | $X,XXX.XX | Current principal balance | Primary metric for portfolio valuation; reconciliation with GL | Pass-through from input | Credit Union Client |
| `Interest_Rate` | Annual Interest Rate | Decimal | X.XX% | Annual percentage rate | Pricing verification; supports profitability analysis | Pass-through from input | Credit Union Client |
| `Payment_Status` | Loan Status | String | Current, 30DPD, 60DPD, 90DPD+, Default, Paid Off | Current delinquency status | Portfolio health indicator; determines collection priority | Pass-through from input | Credit Union Client |
| `Days_PD` | Days Past Due | Integer | NNN | Number of days delinquent (if applicable) | Delinquency detail; supports aging analysis | Pass-through from input | Credit Union Client |
| `Risk_Level` | Credit Risk Category | String | Low, Medium, High, Critical | Risk classification based on payment status and credit metrics | Portfolio risk summary; supports board reporting; drives collection strategy | Calculated: Bucket Risk_Score into tiers | Credit Union Client |
| `Recovery_Flag` | Charge-Off Recovery Indicator | String | Y/N | Whether loan has charge-off recoveries | Identifies loans with recent recovery activity | IF Recovery_Amount > 0 THEN "Y" ELSE "N" | Credit Union Client |

---

### QA & Validation Report (Internal Quality Assurance)

| Field Name | Business Label | Data Type | Format | Description | Business Purpose | Source Calculation | Recipient |
|---|---|---|---|---|---|---|---|
| `Report_Date` | Report Date | Date | YYYY-MM-DD | Date the MDPA process was run | Process identification and audit trail | System current date | Internal QA Team |
| `Total_Loans` | Total Loans Processed | Integer | NNNNNNN | Total count of loans in portfolio | Portfolio volume metric; trend tracking | COUNT(*) from input file | Internal QA Team |
| `Portfolio_Balance` | Total Portfolio Balance | Currency | $XXX,XXX,XXX.XX | Sum of all current outstanding balances | Portfolio valuation for financial statements | SUM(Current_Balance) | Internal QA Team |
| `Average_Interest_Rate` | Weighted Average Interest Rate | Decimal | X.XX% | Average rate across entire portfolio | Portfolio yield metric; supports pricing analysis | AVG(Interest_Rate) weighted by balance | Internal QA Team |
| `Delinquent_Loans` | Count of Delinquent Loans | Integer | NNNNN | Count of loans 30+ days past due | Risk indicator; supports early warning | COUNT(*) WHERE Days_Past_Due >= 30 | Internal QA Team |
| `Delinquency_Rate` | Delinquency Rate | Decimal | X.XX% | Percentage of portfolio 30+ DPD | Industry benchmark metric; peer comparison | Delinquent_Loans / Total_Loans | Internal QA Team |
| `Charge_Off_Count` | Loans Charged Off (Period) | Integer | NNNNN | Count of new charge-offs in period | Loss activity tracking; trend analysis | COUNT(*) WHERE Charge_Off_Date in period | Internal QA Team |
| `Charge_Off_Amount` | Total Charge-Off Amount (Period) | Currency | $XXX,XXX,XXX.XX | Sum of charge-off amounts | Credit loss quantification | SUM(Charge_Off_Amount) | Internal QA Team |
| `Charge_Off_Rate` | Annualized Charge-Off Rate | Decimal | X.XX% | Charge-offs as % of beginning portfolio balance | Loss rate metric for reserve calculations | (Charge_Off_Amount / Beginning_Balance) × 12 | Internal QA Team |
| `Recovery_Amount` | Total Recoveries (Period) | Currency | $XXX,XXX,XXX.XX | Sum of recovery amounts in period | Loss mitigation quantification | SUM(Recovery_Amount) WHERE Recovery_Date in period | Internal QA Team |
| `Recovery_Rate` | Recovery Success Rate | Decimal | X.XX% | Recoveries as % of charge-offs | Collection effectiveness metric; management KPI | Recovery_Amount / Charge_Off_Amount | Internal QA Team |
| `Data_Quality_Score` | Overall Data Quality Score | Decimal | X.XX% | Percentage of records passing all validation rules | Data integrity indicator; process health | (Records_Passed / Total_Records) × 100 | Internal QA Team |
| `Processing_Duration` | Processing Duration (Minutes) | Decimal | NNN.NN | Actual execution time of workflow | Performance tracking; SLA monitoring | System execution time capture | Internal QA Team |

---

## Calculated Fields Legend

| Calculation | Formula | Used In | Purpose |
|---|---|---|---|
| **LTV Ratio** | Current_Balance / Collateral_Value | Client Report, QA | Determines loan risk category; identifies vulnerable loans |
| **Risk Score** | (100 - Credit_Score/10) × (DTI_Ratio/100) × (Age_Days/365) | Client Report | Composite risk indicator combining multiple risk factors |
| **Risk_Level (Category)** | IF Risk_Score < 20 THEN "Low" ELSE IF < 50 THEN "Medium" ELSE IF < 80 THEN "High" ELSE "Critical" | Client Report | Risk bucketing for portfolio segmentation |
| **Age_of_Loan_Days** | TODAY() - Origination_Date | QA Report (internal) | Loan seasoning; maturity profile analysis |
| **Months_to_Maturity** | (Maturity_Date - TODAY()) / 30 | QA Report (internal) | Prepayment/payoff maturity forecasting |
| **Delinquency_Rate** | Delinquent_Loans / Total_Loans | QA Report | Portfolio health KPI; peer comparison metric |
| **Charge_Off_Rate** | (Charge_Off_Amount / Beginning_Balance) × 12 | QA Report | Annualized loss rate; reserve adequacy |
| **Recovery_Rate** | Recovery_Amount / Charge_Off_Amount | QA Report | Collection effectiveness; recovery velocity |

---

## Data Quality Standards

| Field | Validation Rule | Action if Failed | Owner |
|---|---|---|---|
| Loan_ID | Not null, unique, 10 digits | Reject record | Data QA |
| Member_ID | Not null, 10 digits | Reject record | Data QA |
| Current_Balance | > 0 AND ≤ Original_Amount | Flag as anomaly | Credit Risk |
| Interest_Rate | 0% - 30% | Flag if outside range | Loan Pricing |
| Days_Past_Due | ≥ 0 AND ≤ 9999 | Set to NULL if invalid | Credit Risk |
| Credit_Score | 300-850 OR NULL (allowed) | Flag if outside range | Credit Risk |
| LTV_Ratio | 0% - 200% (allows >100%) | Flag if > 200% | Credit Risk |

---

## Notes on This Sample

This sample covers:
- ✅ **Loan Portfolio Master** (16 fields) - Core input data
- ✅ **Charge-Off & Recovery** (7 fields) - Loss data
- ✅ **Client Deliverable** (9 fields) - Monthly output
- ✅ **QA Report** (13 fields) - Internal quality metrics
- ✅ **Calculated Fields** (7 calculations) - Derived metrics
- ✅ **Quality Standards** (8 validation rules) - Data governance

**To Complete the Full Glossary, Also Include:**
- [ ] Real Estate Valuation Data fields
- [ ] TransUnion Credit Bureau fields
- [ ] Tableau Extract fields
- [ ] Archive/Historical fields
- [ ] All intermediate transformation fields

---

**Would you like me to:**
1. ✅ Expand this to include ALL data sources & outputs?
2. ✅ Add more validation rules?
3. ✅ Include field mappings between stages?
4. ✅ Create separate glossaries by role (e.g., "Analyst view" vs "Ops view")?

