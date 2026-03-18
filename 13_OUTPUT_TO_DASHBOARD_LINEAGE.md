# MDPA Output to Dashboard Lineage & Mapping

**Data Flow from Alteryx Workflow Outputs to Tableau Dashboard Visualizations**

**Version:** 1.0
**Last Updated:** 2026-03-18
**Purpose:** Document the complete lineage of data from MDPA workflow outputs to dashboard objects, enabling impact analysis and troubleshooting
**Audience:** Data engineers, analytics team, dashboard developers, IT support

---

## Executive Summary

This document maps the data flow from the MDPA Alteryx v5.2 workflow outputs directly to the Tableau dashboard suite. It traces how loan portfolio data, processed through the 7-stage Alteryx workflow, becomes the output files (especially the Tableau Extract) that feed the dashboards, and ultimately appear as charts, tables, and metrics visible to end users.

**Key Takeaway:** Every dashboard chart, table, and metric originates from fields processed by the Alteryx workflow. Understanding this lineage enables troubleshooting, data quality validation, and impact analysis.

---

## Part 1: Overview of Output Formats & Dashboard Consumption

### MDPA Workflow Output Files

The MDPA Alteryx workflow produces five output types:

| Output Type | Format | Primary Purpose | Consumed By | Refresh Frequency |
|---|---|---|---|---|
| **Tableau Extract** | .hyper or .tde | Dashboard data source | Tableau Server (all dashboards) | Daily (automated refresh) |
| **Client Deliverable File** | Excel (.xlsx) or CSV | Client portfolio reporting | End users (external clients) | Monthly |
| **QA Report** | Excel (.xlsx) with charts | Internal quality assurance | Internal teams (Data QA, Operations) | Monthly |
| **Archive File** | ZIP (complete snapshot) | Compliance & audit trail | Compliance, Audit, Records Mgmt | Monthly |
| **Executive Summary** | PDF or slide deck | Board-level KPI reporting | Executive team, Board | Monthly |

### Primary Dashboard Data Source: Tableau Extract

```
MDPA Alteryx Workflow (Stages 1-7)
    ↓
    ├─ Consolidated LOAN Dataset (enriched with all calculations)
    ├─ CHARGE_OFF_RECOVERY records (linked to loans)
    ├─ PROPERTY_COLLATERAL records (RE loans)
    └─ CREDIT_BUREAU_PROFILE records (member credit)
    ↓
    └─ Tableau Extract (.hyper file)
        ↓
        └─ Tableau Server
            ↓
            └─ All 23+ Dashboard Tabs
```

**Note:** The Tableau Extract is the primary data source for dashboards. It contains the consolidated, enriched, calculated dataset produced by the workflow.

---

## Part 2: Field Lineage - From Workflow to Dashboard

This section traces specific fields from their source through the workflow stages to their final appearance in dashboard objects.

### Example 1: Current Balance Field

**Business Purpose:** Portfolio valuation; concentration analysis; profitability metrics

| Stage | Field Name | Transformation | Source | Notes |
|---|---|---|---|---|
| **Stage 1: Ingestion** | Current_Balance | Input from Loan Portfolio file | ERP Core Banking | Raw balance; no transformation |
| **Stage 2: Cleansing** | Current_Balance | Validated: NOT NULL, ≥ 0, ≤ Original_Amount | Validation rule | Reject if invalid |
| **Stage 3: Enrichment** | Current_Balance | No change | Pass-through | Used in LTV, Risk_Score calculations |
| **Stage 4: Consolidation** | Current_Balance | Consolidated with Charge_Off_Recovery & Property data | Join on Loan_ID | Ready for output |
| **Stage 5: Compliance** | Current_Balance | Used in regulatory ratios | Calculation input | Total portfolio balance, concentration % |
| **Stage 6: Output Prep** | Current_Balance | Formatted to currency ($X,XXX.XX) | Excel/CSV format | Client file output |
| **Stage 7: Delivery** | Current_Balance | Loaded into Tableau Extract | .hyper file | Dashboard dimension |
| **Tableau Dashboards** | Current Balance | Used in 15+ charts & tables | Dimension + Measure | See below |

**Dashboard Appearances:**

| Dashboard Tab | Object | Chart Type | Aggregation |
|---|---|---|---|
| Main Landing Page | Current Balance by Group | Donut Chart | SUM(Current_Balance) by Loan Group |
| Main Landing Page | Current Balance – Real Estate | Donut Chart | SUM by RE Subgroup |
| Main Landing Page | Current Balance – Auto | Donut Chart | SUM by Auto Subgroup |
| Main Landing Page | Current Balance – Consumer | Donut Chart | SUM by Consumer Subgroup |
| Delinquency Landing Page | Delinquent Loans | Stacked Bar | SUM(Current_Balance) by delinquency bucket |
| Risk Landing Page | Total Balance KPI | Single Value | SUM(Current_Balance) all loans |
| Risk Landing Page | Balance by Risk Tier | Cross-Tab | SUM(Current_Balance) by Risk Tier × Loan Group |
| Concentration Monitoring | Concentration Table | Data Table | Current_Balance & calculated concentration %s |
| Concentration Monitoring | Balance as % of Net Worth | Stacked Bar | SUM(Current_Balance) by Subgroup |
| Interest Margins | Interest Margin Bubble | Bubble Chart | SUM(Current_Balance) = bubble size |
| RE Value Download | Current Balance Column | Data Export | Individual loan Current_Balance |
| Auto Value Download | Current Balance Column | Data Export | Individual loan Current_Balance |
| Concentration Risk Analysis | Capital Risk Matrix | Data Table | Current_Balance and High Risk exposure |
| Static Pooling | Vintage Year Table | Summary Table | Current Balance ($ 000s) by vintage |
| Pooled Delinquency | Current Balance by Delinquency | Cross-Tab | SUM(Current_Balance) by DPD bucket × vintage |

---

### Example 2: Payment_Status & Days_Past_Due (Delinquency Classification)

**Business Purpose:** Delinquency tracking; collections priority; risk assessment

| Stage | Field Name(s) | Transformation | Source | Notes |
|---|---|---|---|---|
| **Stage 1: Ingestion** | Payment_Status, Days_Past_Due | Input from Loan Portfolio file | ERP Core Banking | Raw delinquency data |
| **Stage 2: Cleansing** | Payment_Status | Validated IN (Current, 30DPD, 60DPD, 90DPD, 120DPD+, Default, PaidOff, ChargedOff) | Validation rule | Reject if invalid |
| **Stage 2: Cleansing** | Days_Past_Due | Validated: 0-9999 or NULL if Current | Validation rule | Reject if invalid |
| **Stage 3: Enrichment** | Days_Past_Due | Reclassified if needed; aligned with Payment_Status | Business logic | Ensure consistency |
| **Stage 4: Consolidation** | Payment_Status, Days_Past_Due | Consolidated with charge-off records | Join on Loan_ID | Link to CHARGE_OFF_RECOVERY |
| **Stage 5: Compliance** | Payment_Status | Used in regulatory calculations (delinquency rate, counts) | KPI calculation | COUNT(*) by status |
| **Stage 6: Output Prep** | Payment_Status, Days_Past_Due | Formatted to client display | Client File output | Readable format |
| **Stage 7: Delivery** | Payment_Status, Days_Past_Due | Loaded into Tableau Extract | .hyper file | Dashboard dimensions |
| **Tableau Dashboards** | Payment_Status, Days_Past_Due | Used in delinquency & risk charts | Dimensions | See below |

**Dashboard Appearances:**

| Dashboard Tab | Object | Chart Type | Metric |
|---|---|---|---|
| Main Landing Page | Delinquent Loans | Horizontal Stacked Bar | COUNT & SUM(balance) by Payment_Status |
| Main Landing Page | Default Risk | 100% Stacked Bar | % by risk tier |
| Delinquency Landing Page | Delinquent Loans | Stacked Bar | SUM(balance) by delinquency bucket |
| Risk Landing Page | Current Balance by Credit Score | Bar Chart | SUM(balance) by score band; colored by Payment_Status |
| Pooled Delinquency | Current Balance by Delinquency | Cross-Tab | SUM(balance) by DPD bucket × vintage quarter |
| All Landing Pages | Delinquency Rate KPI | Calculated Metric | COUNT(delinquent) / COUNT(total) × 100 |
| RE Value Download | Days Past Due Column | Data Export | Individual Days_Past_Due value |
| Auto Value Download | Days Past Due Column | Data Export | Individual Days_Past_Due value |

---

### Example 3: Credit Score Fields (Oldest_Score, Most_Recent_Score)

**Business Purpose:** Credit quality assessment; migration analysis; risk tier classification

| Stage | Field Name(s) | Transformation | Source | Notes |
|---|---|---|---|---|
| **Stage 1: Ingestion** | Oldest_Score (Original FICO) | Input from Loan Portfolio file | ERP system (at origination) | Original credit grade |
| **Stage 1: Ingestion** | Most_Recent_Score (Current FICO) | Input from TransUnion extract | Credit Bureau (monthly update) | Current credit grade; 2-day lag |
| **Stage 2: Cleansing** | Oldest_Score, Most_Recent_Score | Validated: 300-850 or NULL | Validation rule | Range check |
| **Stage 3: Enrichment** | Change in FICO Score | CALCULATED: Most_Recent_Score – Oldest_Score | Calculation | Identifies improvement/decline |
| **Stage 3: Enrichment** | Score_Trend | CALCULATED: IF (Change > 25) "Improving" ELSE IF (Change < -25) "Declining" ELSE "Stable" | Calculation | Directional classification |
| **Stage 3: Enrichment** | Original FICO Grade | CALCULATED: Bucket Oldest_Score into tiers (A+, A, B, C, D, E) | Custom tier boundaries | User-defined tier setup |
| **Stage 3: Enrichment** | Current FICO Grade | CALCULATED: Bucket Most_Recent_Score into tiers | Custom tier boundaries | User-defined tier setup |
| **Stage 3: Enrichment** | FICO Directional Grouping | CALCULATED: Bucket Change into (>100 Dec, 75-100 Dec, ..., >100 Imp) | Multi-tier bucketing | 13 categories |
| **Stage 4: Consolidation** | All FICO fields | Consolidated with loan & charge-off records | Join on Member_ID (via Loan) | Complete borrower profile |
| **Stage 5: Compliance** | Credit Grade distribution | Used in regulatory reporting | Aggregation | Percentage by tier |
| **Stage 6: Output Prep** | All FICO fields | Formatted to client display | Client File & Credit Score Download | Readable format |
| **Stage 7: Delivery** | All FICO fields | Loaded into Tableau Extract | .hyper file | Dashboard dimensions & measures |
| **Tableau Dashboards** | All FICO fields | Used in migration, risk, profitability dashboards | Dimensions & calculated fields | See below |

**Dashboard Appearances:**

| Dashboard Tab | Object | Chart Type | Metric |
|---|---|---|---|
| Introduction | Original FICO Grade by Loan Type | Stacked Bar (3 charts) | % distribution by tier × loan group |
| Introduction | Default Risk by Loan Type | Stacked Bar (3 charts) | % by risk tier × loan group |
| Risk Landing Page | Current Balance by Credit Score | Bar Chart | SUM(balance) by 10-point score band |
| Migration Landing Page | Migration of Loans | Stacked Bar | SUM(balance) by FICO Directional Grouping |
| Credit Score Migration Dashboard | % Loans Improved KPI | Calculated Metric | % where Current_Score > Original_Score |
| Credit Score Migration Dashboard | % Loans Deteriorated KPI | Calculated Metric | % where Current_Score < Original_Score |
| Credit Score Migration Dashboard | Credit Score Migration – Dollar Matrix | Heat Map Cross-Tab | SUM(balance) Original Grade × Current Grade |
| Credit Score Migration Dashboard | Credit Score Migration – Percentage Matrix | Heat Map Cross-Tab | % of portfolio Original Grade × Current Grade |
| Concentration Monitoring | Balance as % of Net Worth Chart | Stacked Bar | SUM(balance) by Subgroup, colored by Original FICO Grade |
| Interest Margins | Interest Margin Bar Chart | Stacked Bar | Margin components by Loan Subgroup |
| Profitability Calculator | All profitability tables | Data Table | Weighted Avg Interest Rate by FICO tier |
| Static Pooling | Static Pool Cumulative Charge Off Curve | Line Chart | Charge-off % by vintage × year of seasoning |
| Pooled Current FICO | Current Balance by FICO Grade | Cross-Tab | SUM(balance) by origination quarter × current FICO grade |
| Credit Score Download | All FICO columns | Data Export | Individual loan credit score data |

---

## Part 3: Calculated Metrics Lineage

This section traces how complex calculated metrics flow from workflow calculation → output file → dashboard visualization.

### Lineage: Risk_Score Metric

**Business Definition:** Composite risk indicator combining payment behavior, financial capacity, and loan seasoning.

**Calculation Formula:**
```
Risk_Score = (100 - Credit_Score/10) × (DTI_Ratio/100) × (Age_Days/365)
Result Range: 0-100 (higher = more risky)
```

| Stage | Activity | Calculation Details | Inputs | Output |
|---|---|---|---|---|
| **Stage 3: Enrichment** | Risk Score Calculation | Apply formula above | Credit_Score, DTI_Ratio, Age_Days | Risk_Score (decimal 0-100) |
| **Stage 3: Enrichment** | Risk Level Bucketing | IF Risk_Score < 20 THEN "Low" ELSE IF < 50 THEN "Medium" ELSE IF < 80 THEN "High" ELSE "Critical" | Risk_Score | Risk_Level (categorical) |
| **Stage 4: Consolidation** | Risk fields consolidated | Risk_Score & Risk_Level joined to main LOAN record | All loan dimensions | Enriched LOAN record |
| **Stage 5: Compliance** | Regulatory KPIs | COUNT, SUM by Risk_Level; % distribution | Risk_Level | Risk tier aggregates |
| **Stage 6: Output Prep** | Risk data formatted | Risk_Score & Risk_Level output to Tableau Extract | Enriched LOAN record | Tableau Extract columns |
| **Stage 7: Delivery** | Loaded to dashboard | Risk_Score & Risk_Level available as dimensions & measures | Tableau Extract | Dashboard fields |

**Dashboard Appearance Path:**

```
Introduction Tab:
  └─ Default Risk by Loan Type (3 charts)
     └─ % of loans by Risk_Level bucket × Loan Group
     └─ DATA: COUNTD(Loan_ID) / COUNTD(all Loan_IDs) × 100 WHERE Loan_Group = {selected}
     └─ SOURCE: Risk_Level dimension from Tableau Extract

Main Landing Page:
  └─ Default Risk (100% Stacked Bar)
     └─ % of portfolio balance by Risk_Level × Loan Group
     └─ DATA: SUM(Current_Balance) / SUM(total Current_Balance) × 100 by Risk_Level
     └─ SOURCE: Risk_Level dimension; Current_Balance measure

Risk Landing Page:
  └─ Balance by Risk Tier (Cross-Tab)
     └─ SUM(Current_Balance) by Risk_Level × Loan Group
     └─ SOURCE: Risk_Level dimension; Current_Balance measure

Concentration Risk Analysis:
  └─ Capital Risk Matrix
     └─ Loss Given Default, Risk of Loss High (stress-adjusted)
     └─ Risk_Score not directly visible but influences High Risk classification
     └─ SOURCE: Calculated during Stage 5 (Compliance)
```

---

### Lineage: Delinquency_Rate Metric

**Business Definition:** Portfolio health indicator; regulatory reporting metric (call report item); peer comparison benchmark.

**Calculation Formula:**
```
Delinquency_Rate = Delinquent_Loans / Total_Loans × 100
  WHERE Delinquent_Loans = COUNT(*) WHERE Days_Past_Due >= 30
  AND Total_Loans = COUNT(*) all loans
```

| Stage | Activity | Calculation Details | Inputs | Output |
|---|---|---|---|---|
| **Stage 2: Cleansing** | Delinquency classification | Validate Payment_Status; validate Days_Past_Due | Payment_Status, Days_Past_Due | Validated fields |
| **Stage 3: Enrichment** | Delinquency flagging | Create binary flag: IF Days_Past_Due >= 30 THEN "Delinquent" ELSE "Current" | Days_Past_Due | Delinquent_Flag |
| **Stage 5: Compliance** | Delinquency Rate Calculation | COUNT delinquent / COUNT total × 100 | Delinquent_Flag, Total_Loans | Delinquency_Rate (%) |
| **Stage 5: Compliance** | Regulatory bucketing | Delinquent_Loans split into buckets: 30-59, 60-89, 90+ DPD | Days_Past_Due | Delinquency buckets |
| **Stage 6: Output Prep** | QA Report & Client File | Delinquency metrics output to Excel | Calculated metrics | Excel tables |
| **Stage 7: Delivery** | Tableau Extract | Delinquency_Rate & bucket counts loaded | Calculated metrics | Tableau measure |

**Dashboard Appearance Path:**

```
Main Landing Page:
  └─ Delinquent Loans (Horizontal Stacked Bar)
     └─ SUM(Current_Balance) by delinquency bucket (30-59, 60-89, 90+, Current) × Loan Group
     └─ SOURCE: Days_Past_Due dimension; Current_Balance measure

Risk Landing Page:
  └─ Dashboard showing Delinquency_Rate KPI
     └─ DATA: SUM(balance where Days_Past_Due >= 30) / SUM(all balance) × 100
     └─ SOURCE: Days_Past_Due dimension; Current_Balance measure; Calculated field in Tableau

QA Report (Excel output from Stage 6):
  └─ Portfolio Summary section
     └─ Delinquency Rate = XX.XX%
     └─ Delinquent Loans count = XXXX
     └─ SOURCE: Aggregated in Stage 5 Compliance

Concentration Risk Analysis:
  └─ Summary KPI section
     └─ Current Delinquency Rate displayed
     └─ Used as baseline for stress scenario
```

---

### Lineage: Charge_Off_Rate Metric

**Business Definition:** Annualized loan loss rate; loan loss reserve adequacy input; regulatory reporting metric.

**Calculation Formula:**
```
Charge_Off_Rate (%) = (Charge_Off_Amount / Beginning_Portfolio_Balance) × 12

Where:
  Charge_Off_Amount = SUM(Charge_Off_Amount) WHERE Charge_Off_Date in current month
  Beginning_Portfolio_Balance = Total Current_Balance at start of month
```

| Stage | Activity | Calculation Details | Inputs | Output |
|---|---|---|---|---|
| **Stage 1: Ingestion** | Charge-off data input | Load from Charge-Off & Recovery System | Charge_Off_Date, Charge_Off_Amount, Loan_ID | Raw charge-off records |
| **Stage 2: Cleansing** | Charge-off validation | Validate: Charge_Off_Date ≤ TODAY, Charge_Off_Amount > 0, Loan_ID exists | Charge_Off_Date, Charge_Off_Amount | Validated charge-offs |
| **Stage 4: Consolidation** | Link charge-offs to loans | JOIN CHARGE_OFF_RECOVERY to LOAN on Loan_ID | Charge_Off_Amount + Loan dimensions | Enriched loan record |
| **Stage 5: Compliance** | Charge-Off Rate Calculation | SUM(Charge_Off_Amount) / Beginning_Balance × 12 / 12 (annualized) | Charge_Off_Amount, Beginning balance | Charge_Off_Rate (%) |
| **Stage 5: Compliance** | Charge-off aggregation | GROUP BY Loan Group; COUNT charge-offs | Charge_Off_Amount, Loan_Group | Charge-offs by Group |
| **Stage 6: Output Prep** | QA Report output | Charge-off metrics & trends | Calculated charge-off metrics | Excel tables/charts |
| **Stage 7: Delivery** | Tableau Extract | Charge-off counts & amounts loaded as measures | Charge-off dimension & measures | Tableau fields |

**Dashboard Appearance Path:**

```
Risk Landing Page:
  └─ Charge-offs by Group (Horizontal Bar Chart)
     └─ SUM(Charge_Off_Amount) by Loan Group
     └─ SOURCE: Charge_Off_Amount measure from CHARGE_OFF_RECOVERY records

Concentration Risk Analysis:
  └─ Capital Risk Matrix
     └─ Loss Given Default = estimated $ loss if all default
     └─ Risk of Loss High = estimated $ exposure on high-risk loans
     └─ CALCULATED using historical Charge_Off_Rate as input
     └─ SOURCE: One Year Charge Off Rate (from static pool analysis)

Static Pooling:
  └─ Cumulative Charge Off % Curve
     └─ Y-axis = Cumulative % of original pool balance charged off
     └─ Calculated for each vintage year, tracked over years of seasoning
     └─ SOURCE: Charge-off records linked to origination date

Interest Margins:
  └─ Interest Margin Bar Chart
     └─ One Year Charge Off Rate component (red segment)
     └─ Shows how charge-off rate "consumes" portion of interest earned
     └─ SOURCE: One Year Charge Off Rate derived from static pool data

Profitability Calculator:
  └─ All profitability tables
     └─ One Year Charge Off Rate is input cost component
     └─ Subtracted from Weighted Avg Interest Rate
     └─ SOURCE: Calculated from charge-off history by loan subgroup × FICO tier

Executive Summary (PDF):
  └─ Charge-Off Rate KPI
     └─ Annualized charge-off rate for board reporting
     └─ Trended 6-month history
     └─ SOURCE: Aggregated in Stage 5 Compliance
```

---

### Lineage: LTV (Loan-to-Value) Metric

**Business Definition:** Risk indicator; determines loss recovery potential; used in stress testing and capital adequacy.

**Calculation Formula:**
```
LTV_Ratio (%) = (Current_Balance / Collateral_Value) × 100

Where:
  Current_Balance = Outstanding principal as of Report Date
  Collateral_Value = Current estimated fair market value
    FOR Auto: Total Collateral Value (retail, trade-in, or wholesale)
    FOR Real Estate: RE Collateral Value (appraised value)
    FOR Other: Null / Not applicable
```

| Stage | Activity | Calculation Details | Inputs | Output |
|---|---|---|---|---|
| **Stage 1: Ingestion** | Collateral data input | Load property valuations & auto values from appraisal & valuation systems | RE_Collateral_Value, Auto_Value_Retail/Trade/Wholesale | Raw collateral values |
| **Stage 2: Cleansing** | Collateral validation | Validate: Collateral_Value > 0 if Collateral_Type ≠ Unsecured; date checks (appraisal ≤ 12 months old) | Collateral_Value, Appraisal_Date | Validated values |
| **Stage 3: Enrichment** | LTV Calculation | IF Collateral_Value > 0 THEN (Current_Balance / Collateral_Value) × 100 ELSE NULL | Current_Balance, Collateral_Value | LTV_Ratio (%) |
| **Stage 3: Enrichment** | LTV Bucketing | Bucket LTV into bands: <80%, 80-90%, 90-100%, 100-110%, 110-120%, >120% | LTV_Ratio | CLTV_Grouping |
| **Stage 3: Enrichment** | Current Balance Exposed | CALCULATED: IF (Current_Balance > Collateral_Value) THEN (Current_Balance - Collateral_Value) ELSE 0 | Current_Balance, Collateral_Value | Exposed amount |
| **Stage 4: Consolidation** | LTV fields consolidated | Link LTV & collateral fields to main LOAN record | LTV, CLTV_Grouping, Exposed | Enriched LOAN |
| **Stage 5: Compliance** | Stress LTV calculation | IF applying Real Estate/Auto stressor THEN adjust Collateral_Value down by stressor % then recalc LTV | Stressor %, Collateral_Value | Stress_Adjusted_LTV |
| **Stage 6: Output Prep** | Data downloads output | LTV_Ratio, Collateral values, Current Balance Exposed | LTV & collateral fields | Excel downloads |
| **Stage 7: Delivery** | Tableau Extract | LTV_Ratio, CLTV_Grouping loaded as dimensions & measures | LTV fields | Tableau fields |

**Dashboard Appearance Path:**

```
Migration Landing Page:
  └─ CLTV_Grouping Filter
     └─ Multi-select filter allowing drill-down by LTV bands
     └─ SOURCE: CLTV_Grouping dimension from Tableau Extract

Risk Landing Page:
  └─ No direct LTV visualization, but used in Risk_Score calculation
     └─ Risk_Score impacts Default Risk classification
     └─ SOURCE: LTV used in enrichment stage

Concentration Monitoring:
  └─ Concentration Table
     └─ No direct LTV metric, but concentration driven by balance
     └─ Filter available for CLTV_Grouping
     └─ SOURCE: CLTV_Grouping dimension

Concentration Risk Analysis:
  └─ Capital Risk Matrix
     └─ Loss Given Default influenced by CLTV (higher CLTV = greater loss)
     └─ Stress Adjusted Loss Given Default applies collateral stressors to LTV
     └─ If Real Estate Stressor = 20%, then RE Collateral_Value reduced by 20%
     └─ If Auto Stressor = 15%, then Auto Collateral_Value reduced by 15%
     └─ Stressed LTV recalculated: Stressed_LTV = Current_Balance / (Collateral_Value × (1 - Stressor%))
     └─ SOURCE: Real Estate Stressor & Auto Stressor parameters; LTV calculation

RE Value Download:
  └─ CLTV Column
     └─ Individual loan CLTV for each real estate loan
     └─ Current Balance Exposed column
     └─ SOURCE: LTV_Ratio calculation; Current_Balance, RE_Collateral_Value

Auto Value Download:
  └─ CLTV Column
     └─ Individual loan CLTV for each auto loan
     └─ Current Balance Exposed column
     └─ Multiple collateral value columns (Retail, Trade-In, Wholesale)
     └─ SOURCE: LTV_Ratio calculation; Current_Balance, Total_Collateral_Value

Interest Margins & Profitability:
  └─ No direct LTV visualization
  └─ But LTV indirectly affects Loss Given Default
  └─ Which affects One Year Charge Off Rate
  └─ Which feeds into Profitability Margin calculations
  └─ SOURCE: Lineage through loss estimation
```

---

## Part 4: Data Download Lineage

This section traces how individual loan-level data from the workflow outputs appears in the Tableau data download tabs (RE Value Download, Auto Value Download, Credit Score Download, Loan List).

### Real Estate Value Download Lineage

```
STAGE 1-4: Ingestion → Consolidation
  ├─ Loan Portfolio: Loan_ID, Member_ID, Original_Amount, Current_Balance,
  │                  Interest_Rate, Origination_Date, Maturity_Date, Collateral_Type
  ├─ Property_Collateral: RE_Collateral_Value, Appraised_Value, Appraisal_Date
  ├─ Credit_Bureau_Profile: Credit_Score (oldest, most recent), Change_in_Score
  └─ CHARGE_OFF_RECOVERY: (optional, if charged off)

STAGE 5: Compliance
  └─ Calculate: CLTV, Change_in_FICO_Score, Current_Balance_Exposed

STAGE 6: Output Preparation (Tableau Extract)
  └─ Filter: WHERE Loan_Type IN ('Mortgage', 'Home Equity', 'Vacant Land', etc.)
  └─ Select columns:
     • Unique ID (Loan_ID)
     • Loan Subgroup
     • Original Balance
     • Current Balance
     • Credit Limit (if HELOC)
     • Available Credit (if open-end)
     • Interest Rate
     • Oldest Score (from origin)
     • Most Recent Score
     • Change in FICO Score
     • Days Past Due
     • RE Collateral Value
     • Total Superior (senior liens)
     • Current Balance Exposed
     • CLTV
  └─ Format to currency/percentage as needed

STAGE 7: Delivery → Tableau Server
  └─ Tableau Dashboard: RE Value Download tab
     └─ Data Grid: Renders all columns above
     └─ User Actions: Sort, Filter, Export to Excel
```

### Auto Value Download Lineage

```
STAGE 1-4: Ingestion → Consolidation
  ├─ Loan Portfolio: Loan_ID, Member_ID, Original_Amount, Current_Balance,
  │                  Interest_Rate, Loan_Subgroup (Auto product type)
  ├─ Property_Collateral (Vehicle Values): Auto_Value_Retail, Trade_In, Wholesale
  ├─ Credit_Bureau_Profile: Credit_Score (oldest, most recent)
  └─ CHARGE_OFF_RECOVERY: (if applicable)

STAGE 3: Enrichment
  └─ Dealer Name: Extracted from loan origination source
  └─ Collateral Description: Vehicle make/model/year

STAGE 5: Compliance
  └─ Calculate: CLTV (using highest applicable auto value or policy value)
  └─ Current_Balance_Exposed

STAGE 6: Output Preparation (Tableau Extract)
  └─ Filter: WHERE Loan_Type IN ('Auto-Direct New', 'Auto-Direct Used', 'Auto-Indirect New', 'Auto-Indirect Used', 'REC Veh')
  └─ Select columns:
     • Unique ID (Loan_ID)
     • Loan Subgroup
     • Original Balance
     • Current Balance
     • Interest Rate
     • Oldest Score
     • Most Recent Score
     • Change in FICO Score
     • Days Past Due
     • Auto Value Retail
     • Auto Value Trade-In
     • Auto Value Wholesale
     • Total Collateral Value (policy-selected value)
     • Current Balance Exposed
     • CLTV
  └─ Format as needed

STAGE 7: Delivery → Tableau Server
  └─ Tableau Dashboard: Auto Value Download tab
     └─ Data Grid: Renders all columns above
     └─ Dealer Analysis tab also references this data
```

---

## Part 5: Dashboard Object Lineage - Detailed Mapping

This section maps specific dashboard objects back to their data sources in the workflow outputs.

### Main Landing Page: "Current Balance by Group" (Donut Chart)

```
DATA FLOW:
  Workflow Stage 4 (Consolidation)
    └─ Consolidated LOAN records with Loan_Group dimension

  Workflow Stage 7 (Delivery)
    └─ Loaded to Tableau Extract:
       ├─ Measure: Current_Balance (SUM aggregatable)
       └─ Dimension: Loan_Group (Auto, Consumer, Real Estate)

  Tableau Dashboard - Main Landing Page
    └─ Data Source: Tableau Extract
    └─ Chart Type: Donut Chart (pie-style visualization)
    └─ Aggregation: SUM(Current_Balance)
    └─ Dimension: Loan_Group
    └─ Filters: Report_Date = [User Selected]
    └─ Calculation: Each segment = SUM(Current_Balance) WHERE Loan_Group = {segment}
    └─ Center Label: TOTAL SUM(Current_Balance) across all groups
    └─ Segment Labels: Dollar value + % of total

IMPACT ANALYSIS:
  If Current_Balance data changes in Stage 7:
    → Chart values update proportionally
    → If a loan balance increases, donut segment grows
    → If loans are charged off, segment shrinks
```

### Risk Landing Page: "Charge-offs by Group" (Horizontal Bar Chart)

```
DATA FLOW:
  Workflow Stage 1-2 (Ingestion → Cleansing)
    └─ Charge-Off & Recovery system data
       ├─ Charge_Off_Date
       ├─ Charge_Off_Amount
       └─ Loan_ID

  Workflow Stage 4 (Consolidation)
    └─ CHARGE_OFF_RECOVERY table JOINed to LOAN
       └─ Now linked to Loan_Group dimension

  Workflow Stage 5 (Compliance)
    └─ Aggregation: SUM(Charge_Off_Amount) by Loan_Group

  Workflow Stage 7 (Delivery)
    └─ Loaded to Tableau Extract:
       ├─ Measure: Charge_Off_Amount (SUM aggregatable)
       └─ Dimension: Loan_Group (from linked LOAN record)

  Tableau Dashboard - Risk Landing Page
    └─ Data Source: Tableau Extract
    └─ Chart Type: Horizontal Bar Chart
    └─ Aggregation: SUM(Charge_Off_Amount)
    └─ Dimension: Loan_Group
    └─ Filters: Report_Date = [User Selected]
    └─ Calculation: Each bar = SUM(Charge_Off_Amount) WHERE Loan_Group = {bar}
    └─ Labels: Dollar value per group

IMPACT ANALYSIS:
  If charge-off data changes in Stage 2:
    → Validation errors may reject records in Stage 2
    → Accepted charge-offs flow through to Stage 4 consolidation
    → Amount aggregated in Stage 5
    → Dashboard shows updated totals per group
```

### Concentration Monitoring: "Balance as % of Net Worth" (Stacked Bar Chart)

```
DATA FLOW:
  Workflow Stages 1-4: Consolidation
    └─ LOAN records with Current_Balance + Loan_Subgroup dimensions

  Workflow Stage 5 (Compliance)
    └─ Aggregation by Loan_Subgroup:
       ├─ SUM(Current_Balance) per subgroup
       └─ Calculation: (SUM(Current_Balance) / Regulatory_Net_Worth) × 100

  Workflow Stage 6 (Output Prep)
    └─ Concentration metrics prepared for output

  Workflow Stage 7 (Delivery)
    └─ Loaded to Tableau Extract:
       ├─ Measure: Current_Balance (SUM aggregatable)
       ├─ Dimension: Loan_Subgroup
       └─ Parameter Input: Regulatory_Net_Worth (from Introduction tab)

  Tableau Dashboard - Concentration Monitoring
    └─ Data Source: Tableau Extract
    └─ Chart Type: Stacked Bar Chart
    └─ Metric Calculation:
       ├─ X-axis: Each bar = one loan subgroup
       ├─ Y-axis: (SUM(Current_Balance) / Regulatory_Net_Worth) × 100
       ├─ Color: Original_FICO_Grade (optional filter)
       └─ Stacked segments: Different FICO grades within each subgroup

    └─ User Input: Regulatory_Net_Worth entered on Introduction tab
    └─ Filters: Loan_Subgroup (multi-select)
    └─ Calculation: Real-time: bar height = SUM(balance) / [Net Worth from Intro]

IMPACT ANALYSIS:
  If Current_Balance changes:
    → Concentration % changes proportionally
    → New high-concentration products become visible
    → May exceed institution's concentration policy thresholds

  If Regulatory_Net_Worth parameter changes on Introduction tab:
    → All concentration % values update immediately (inverse relationship)
    → Higher net worth = lower concentration %
```

### Static Pooling: "Cumulative Charge Off %" (Line Chart)

```
DATA FLOW:
  Workflow Stage 1-2 (Ingestion → Cleansing)
    └─ Loan Portfolio data with Origination_Date
    └─ Charge-Off & Recovery data with Charge_Off_Date, Charge_Off_Amount

  Workflow Stage 4 (Consolidation)
    └─ LOAN JOINed to CHARGE_OFF_RECOVERY on Loan_ID
    └─ Link charge-offs to origination date (vintage)

  Workflow Stage 5 (Compliance)
    └─ Calculation (for each vintage year):
       ├─ Original_Balance = SUM(Original_Amount) WHERE Origination_Year = {year}
       ├─ For each seasoning point (Year 1, 2, 3, ..., 7):
       │  └─ Cumulative_Charge_Off_Amount = SUM(Charge_Off_Amount)
       │                                    WHERE Origination_Year = {year}
       │                                    AND Charge_Off_Date ≤ (Origination_Year + Seasoning_Years)
       └─ Cumulative_Charge_Off_% = (Cumulative_Charge_Off_Amount / Original_Balance) × 100

  Workflow Stage 7 (Delivery)
    └─ Loaded to Tableau Extract:
       ├─ Dimension: Origination_Year
       ├─ Dimension: Years_Since_Origination (seasoning point)
       ├─ Measure: Cumulative_Charge_Off_%
       └─ Filter: Loan_Subgroup, Original_FICO_Grade (optional)

  Tableau Dashboard - Static Pooling
    └─ Data Source: Tableau Extract
    └─ Chart Type: Multi-line chart
    └─ Construction:
       ├─ X-axis: Years_Since_Origination (0 to 7)
       ├─ Y-axis: Cumulative_Charge_Off_%
       ├─ Each line: Represents one Origination_Year
       └─ Line color: Different color per vintage year

    └─ Filters:
       ├─ Origination_Year_Range (slider)
       ├─ Loan_Subgroup (multi-select)
       └─ Original_FICO_Grade (optional)

    └─ Data Table Below: Shows raw numbers (Original Balance, Current Balance, Cumulative %)

IMPACT ANALYSIS:
  If charge-off data for a vintage changes:
    → Cumulative_Charge_Off_% for that vintage recalculates
    → Line for that vintage adjusts (rises if new charge-offs added)
    → Steeper slopes = deteriorating vintage quality
    → Flat/declining slopes = improving underwriting standards in newer vintages
```

### Interest Margins: "Margin Components" (Stacked Bar Chart)

```
DATA FLOW:
  Workflow Stages 1-4: Consolidation
    └─ LOAN records with Interest_Rate, Current_Balance, Loan_Subgroup

  Workflow Stage 3 (Enrichment)
    └─ Calculation of derived fields:
       ├─ Charge_Off_Rate = (Cumulative_Charge_Offs / Beginning_Balance) × 12 (annualized)
       ├─ Delinquency_Cost = Count delinquent loans × Cost_per_Delinquent / Balance
       └─ Default_Cost = Count defaults × Cost_per_Default / Balance

  Workflow Stage 5 (Compliance)
    └─ Aggregation by Loan_Subgroup:
       ├─ Weighted_Avg_Interest_Rate = SUM(Interest_Rate × Current_Balance) / SUM(Current_Balance)
       ├─ Charge_Off_Rate = One_Year_Charge_Off_%
       └─ Cost_of_Capital = Cost_of_Capital_% (from Introduction tab parameter)

  Workflow Stage 6 (Output Prep)
    └─ Margin component calculation:
       ├─ Profit_Margin = Weighted_Avg_Interest_Rate - Charge_Off_Rate - Cost_of_Capital
       └─ Format to percentage

  Workflow Stage 7 (Delivery)
    └─ Loaded to Tableau Extract:
       ├─ Measure: Weighted_Avg_Interest_Rate
       ├─ Measure: Charge_Off_Rate
       ├─ Measure: Cost_of_Capital
       ├─ Measure: Profit_Margin (calculated)
       └─ Dimension: Loan_Subgroup

  Tableau Dashboard - Interest Margins
    └─ Data Source: Tableau Extract
    └─ Chart Type: Stacked Bar Chart
    └─ Construction:
       ├─ X-axis: Loan_Subgroup
       ├─ Y-axis: Rate % (stacked heights)
       ├─ Segment 1 (green): Profit_Margin
       ├─ Segment 2 (yellow): Cost_of_Capital
       ├─ Segment 3 (red): Charge_Off_Rate
       └─ Total height: Weighted_Avg_Interest_Rate

    └─ User Inputs:
       ├─ Cost_of_Capital_% (from Introduction tab or adjustable here)
       └─ Unemployment_Stressor (adds to charge-off cost)

IMPACT ANALYSIS:
  If Charge_Off_Rate increases (more historical charge-offs):
    → Red segment grows
    → Profit_Margin shrinks
    → Dashboard shows product becoming less profitable

  If Interest_Rate increases (pricing changes):
    → Total bar height increases
    → Potential to improve Profit_Margin if costs don't rise proportionally
```

---

## Part 6: Complete Data Flow Diagram

```
MDPA WORKFLOW OUTPUT → TABLEAU DASHBOARD LINEAGE

┌─────────────────────────────────────────────────────────────────┐
│ WORKFLOW STAGES 1-7 (Alteryx v5.2)                             │
├─────────────────────────────────────────────────────────────────┤
│ Stage 1: INGESTION                                              │
│ ├─ Loan Portfolio (10K-50K)                                     │
│ ├─ Charge-Off & Recovery (1K-5K)                                │
│ ├─ Property Collateral (3K-10K)                                 │
│ └─ Credit Bureau (8K-40K)                                       │
│                                                                  │
│ Stages 2-5: CLEANSING → ENRICHMENT → CONSOLIDATION → COMPLIANCE │
│ ├─ Validate & transform data                                    │
│ ├─ Calculate: Risk_Score, LTV, CLTV, Delinquency, Charge-Off   │
│ ├─ Join tables: LOAN ← CHARGE_OFF ← PROPERTY ← BUREAU          │
│ └─ Aggregate metrics: Counts, rates, balances by group/tier     │
│                                                                  │
│ Stage 6: OUTPUT PREP                                            │
│ ├─ Format for Excel (Client File, QA Report)                    │
│ ├─ Format for Tableau Extract (.hyper file)                     │
│ ├─ Archive audit trail                                          │
│ └─ Create Executive Summary                                     │
│                                                                  │
│ Stage 7: DELIVERY                                               │
│ └─ Load Tableau Extract to Tableau Server                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ TABLEAU SERVER (Data Source: MDPA Tableau Extract)              │
├─────────────────────────────────────────────────────────────────┤
│ Data Tables Available:                                           │
│ ├─ LOAN (with enriched calculations)                            │
│ ├─ CHARGE_OFF_RECOVERY (linked to LOAN)                         │
│ ├─ PROPERTY_COLLATERAL (linked to LOAN)                         │
│ └─ CREDIT_BUREAU_PROFILE (linked via Member_ID)                │
│                                                                  │
│ Fields/Measures Available:                                       │
│ ├─ Dimensions: Loan_ID, Loan_Group, Loan_Subgroup, Member_ID,  │
│ │              Loan_Type, Origination_Date, Payment_Status,    │
│ │              Risk_Level, Original_FICO_Grade, Current_FICO_Grade
│ │              CLTV_Grouping, Charge_Off_Date, Report_Date, etc.
│ ├─ Measures: Current_Balance, Original_Amount, Interest_Rate,   │
│ │           Charge_Off_Amount, Collateral_Value,               │
│ │           Risk_Score, LTV_Ratio, CLTV, Days_Past_Due, etc.   │
│ └─ Calculated Fields: Delinquency_Rate, Charge_Off_Rate,        │
│                      Recovery_Rate, Concentration_%, etc.
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ TABLEAU DASHBOARDS (23+ Tabs)                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. Introduction Tab                                              │
│    └─ Chart: Default Risk by Loan Type                          │
│       ↑ DATA: Risk_Level dimension, COUNT aggregation           │
│                                                                  │
│ 2. Main Landing Page                                            │
│    ├─ Chart: Current Balance by Group (Donut)                   │
│    │  ↑ DATA: Loan_Group dimension, SUM(Current_Balance)        │
│    ├─ Chart: Delinquent Loans (Stacked Bar)                     │
│    │  ↑ DATA: Payment_Status dimension, SUM(balance) by DPD     │
│    └─ Chart: Default Risk (100% Stacked)                        │
│       ↑ DATA: Risk_Level dimension, % distribution              │
│                                                                  │
│ 3. Delinquency Landing Page                                     │
│    ├─ Filter: Loan_Subgroup (multi-select)                      │
│    └─ Chart: Delinquent Loans by Subgroup                       │
│       ↑ DATA: Payment_Status × Loan_Subgroup × SUM(balance)     │
│                                                                  │
│ 4. Risk Landing Page                                            │
│    ├─ Chart: Charge-offs by Group                               │
│    │  ↑ DATA: SUM(Charge_Off_Amount) by Loan_Group              │
│    ├─ Chart: Current Balance by Credit Score                    │
│    │  ↑ DATA: Current credit score band, SUM(balance)           │
│    └─ Chart: Migration of Available Credit (Bubble)             │
│       ↑ DATA: FICO Directional Grouping, bubble size            │
│                                                                  │
│ [... Additional tabs follow same pattern ...]                   │
│                                                                  │
│ 23. Loan List (Auto Details)                                    │
│     └─ Table: Individual auto loan records                       │
│        ↑ DATA: Row-level detail from Tableau Extract            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ END USER (Analyst, Manager, Executive, Compliance)              │
├─────────────────────────────────────────────────────────────────┤
│ ├─ Views portfolio overview (Main Landing)                       │
│ ├─ Analyzes delinquency trends (Delinquency Landing)            │
│ ├─ Assesses risk & stress scenarios (Risk & Concentration)      │
│ ├─ Evaluates profitability (Interest Margins, Calculator)       │
│ ├─ Tracks vintage performance (Static Pooling)                  │
│ └─ Downloads detailed loan data (Value Downloads)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 7: Impact Analysis - Tracing Changes Through the Lineage

This section shows how changes at any point in the workflow propagate through to dashboards.

### Example 1: Data Quality Issue - Invalid Payment Status

**Scenario:** A loan record with Payment_Status = "PAST_DUE" (invalid; should be "30DPD", "60DPD", etc.)

```
Stage 2 (Cleansing):
  ├─ Validation rule triggered: Payment_Status NOT IN (valid list)
  ├─ Decision: REJECT record OR FLAG as WARNING
  └─ Outcome:
     ├─ If REJECT: Loan excluded from all downstream processing
     ├─ If FLAG: Loan continues but marked Data_Quality_Flag = 'W'

Stage 4 (Consolidation):
  └─ Rejected loans: Not JOINed to CHARGE_OFF or other tables
  └─ Flagged loans: Included but marked as lower quality

Stage 5 (Compliance):
  └─ Delinquency_Rate calculation adjusts:
     IF rejecting: Rate = (Delinquent_Count_Valid - 1) / (Total_Valid - 1)
     IF flagging: Rate = same but note = "1 record with quality flag"

Stage 7 (Tableau Extract):
  └─ Rejected record NOT in extract
  └─ Flagged record in extract but can be filtered by Data_Quality_Flag

Tableau Dashboards:
  └─ Main Landing Page → Delinquent Loans chart:
     ├─ Rejected: Loan not counted in delinquent totals
     └─ Flagged: Loan counted but may be excluded via filter
  └─ QA Report (Stage 6):
     └─ Error_Count increments
     └─ Data_Quality_Score decreases

END RESULT:
  ├─ Portfolio delinquency rate may decrease (if loan rejected)
  ├─ QA Report flags data quality issue
  └─ User alerted to investigate record
```

### Example 2: Collateral Value Update - Real Estate Market Decline

**Scenario:** Property valuations updated; average RE appraised value declines 15% due to market

```
Stage 1 (Ingestion):
  └─ New RE Collateral values loaded from Appraisal System
  └─ Appraised_Value per property: $200K → $170K average

Stage 3 (Enrichment):
  ├─ LTV_Ratio recalculated:
  │  ├─ Old: (Current_Balance $150K / $200K) × 100 = 75%
  │  └─ New: (Current_Balance $150K / $170K) × 100 = 88%
  ├─ CLTV_Grouping reclassified:
  │  ├─ Old: <80% (low risk)
  │  └─ New: 80-90% (elevated risk)
  ├─ Current_Balance_Exposed recalculated (if CLTV > 100%)
  └─ Risk_Score adjusted upward (higher LTV = higher risk)

Stage 5 (Compliance):
  ├─ Loss Given Default recalculated:
  │  └─ Lower collateral values = higher loss severity
  ├─ Stress_Adjusted_LTV recalculated for stress scenarios
  └─ Capital Risk Matrix updated with new LTV values

Stage 7 (Tableau Extract):
  └─ New LTV_Ratio, CLTV_Grouping, Current_Balance_Exposed loaded

Tableau Dashboards:
  └─ Concentration Risk Analysis:
     ├─ Loss Given Default increases for RE portfolio
     ├─ Stress Adjusted Risk of Loss High increases
     ├─ Risk Adjusted Net Worth decreases
     └─ Capital Cushion / (Deficiency) may flip negative
  └─ RE Value Download:
     ├─ CLTV column shows higher values for all RE loans
     ├─ Current_Balance_Exposed increases for underwater loans
  └─ Interest Margins:
     └─ Loss Given Default changes may affect profitability modeling

END RESULT:
  ├─ RE portfolio appears riskier (higher LTV, higher loss potential)
  ├─ Capital adequacy stress test may show deficiency
  ├─ Management alerted to RE market risk
  └─ May trigger pricing changes or tighter underwriting
```

### Example 3: Charge-Off Spike - New Cohort Charge-Offs

**Scenario:** Unusual spike in charge-offs for 2024 Q1 origination cohort

```
Stage 1 (Ingestion):
  └─ Charge-Off system reports 50 new charge-offs for 2024 Q1 loans (20% above normal)

Stage 2 (Cleansing):
  └─ Validate charge-off records; assume all valid

Stage 4 (Consolidation):
  └─ New charge-off records JOINed to LOAN table
  └─ Linked to 2024 Q1 origination_date cohort

Stage 5 (Compliance):
  ├─ Cumulative_Charge_Off_% for 2024 Q1 vintage updated
  ├─ One_Year_Charge_Off_Rate for 2024 Q1 loans recalculated (upward)
  ├─ Loss Given Default increased
  └─ Charge-off count & amount aggregated

Stage 7 (Tableau Extract):
  └─ Updated charge-off measures & 2024 Q1 cohort performance

Tableau Dashboards:
  └─ Static Pooling:
     ├─ Line for 2024 Q1 vintage steepens (more charge-offs)
     ├─ Cumulative Charge-Off % increases visibly
  └─ Risk Landing Page:
     ├─ Charge-offs by Group increases for Consumer group (if 2024 Q1 mostly Consumer)
  └─ Pooled Delinquency:
     ├─ 2024 Q1 rows show increased delinquency alongside increased charge-offs
  └─ Interest Margins:
     ├─ One Year Charge Off Rate for Consumer subgroup increases
     ├─ Profit Margin for Consumer subgroup decreases
     └─ May show red (unprofitable) if rate was marginal
  └─ Concentration Risk Analysis:
     ├─ Loss Given Default for Consumer portfolio increases
     └─ Risk Adjusted Net Worth may decrease

END RESULT:
  ├─ Management alerted to deteriorating 2024 Q1 underwriting quality
  ├─ Charge-off rate trending worse than historical
  ├─ May trigger underwriting review
  ├─ May impact loan loss reserve adequacy
  └─ Potential pricing changes for Consumer products
```

---

## Part 8: Troubleshooting Guide - Using Lineage for Problem Resolution

### Issue: Dashboard Metric Doesn't Match Excel Report

**Problem:** Delinquency_Rate shown in Tableau dashboard ≠ Delinquency_Rate shown in QA Report Excel

**Root Cause Analysis Using Lineage:**

```
CHECK 1: Report Date Mismatch
  └─ Tableau: Check filter for Report_Date
  └─ Excel: Check header date
  └─ If different: Causes discrepancy because different snapshots
  └─ FIX: Ensure both use same Report_Date

CHECK 2: Filter Differences
  └─ Tableau: Check active filters (Loan_Subgroup, Risk_Level, etc.)
  └─ Excel: Check which cohort was exported (all loans or filtered?)
  └─ If different: Causes discrepancy because different denominator
  └─ FIX: Clear Tableau filters or filter Excel to match

CHECK 3: Calculation Timing
  └─ Workflow Stage 5 (Compliance):
     ├─ Delinquency_Rate = SUM(balance where Days_Past_Due ≥ 30) / SUM(all balance) × 100
  └─ Excel output generated in Stage 6 (Output Prep)
  └─ Tableau Extract generated in Stage 6/7 (Delivery)
  └─ If Stage 5 runs at different time than extraction:
     └─ FIX: Re-run workflow to ensure synchronized calculation

CHECK 4: Data Quality Flag
  └─ Tableau: Check Data_Quality_Flag dimension
  └─ Excel: Check Error_Count in QA Report
  └─ If some loans flagged:
     ├─ Tableau may show metric with AND without flagged loans
     ├─ Excel may show separate counts for valid vs. flagged
     └─ FIX: Filter to "Data_Quality_Flag = 'Y'" to match Excel valid count

CHECK 5: Rounding Differences
  └─ Tableau may display rounded to 2 decimals (XX.XX%)
  └─ Excel calculation may have more precision
  └─ Unlikely to cause large discrepancies but worth checking
  └─ FIX: Check Tableau calculated field rounding logic
```

### Issue: Concentration Risk Matrix Shows Negative Capital Cushion

**Problem:** Risk Adjusted Net Worth < Minimum Net Worth; dashboard shows (Deficiency) in parentheses

**Root Cause Analysis Using Lineage:**

```
CHECK 1: Stress Test Parameters
  └─ Concentration Risk Analysis tab > Input Parameters section
  ├─ Real Estate Stressor too aggressive? (e.g., 50% decline)
  ├─ Auto Stressor too aggressive?
  ├─ Unemployment Stressor too aggressive?
  └─ FIX: Reduce stressor % to more realistic values

CHECK 2: Minimum Net Worth Ratio
  └─ Concentration Risk Analysis > "Minimum Net Worth (%)" input
  ├─ Is 6% too high for institution? (regulatory minimum is often 6-7%)
  ├─ Are you applying more conservative internal threshold?
  └─ FIX: Adjust if policy permits

CHECK 3: Actual Loan Loss Reserves
  └─ Introduction tab > "Allowance for Loan Losses (ALL)" input
  ├─ Is ALL adequate? (typically 1-2% of portfolio)
  ├─ Should you increase reserve?
  └─ Check Stage 6 QA Report: Data_Quality_Score section

CHECK 4: Loss Given Default Accuracy
  └─ Lineage path: Collateral_Value [Stage 1] → LTV [Stage 3] → LGD [Stage 5] → Dashboard
  ├─ Are collateral valuations current? (appraisals ≤ 12 months old?)
  ├─ Is LTV calculation correct?
  ├─ Check RE Value Download & Auto Value Download tabs for collateral values
  └─ FIX: Update collateral valuations if stale

CHECK 5: Report Date
  └─ Introduction tab > Report_Date
  ├─ Is this current or historical data?
  ├─ Has significant time passed since data snapshot?
  └─ FIX: Refresh with current month data

REMEDIATION:
  IF deficiency is real:
    ├─ Increase loan loss reserves
    ├─ Reduce high-risk lending
    ├─ Tighten underwriting standards
    ├─ Increase pricing on high-risk segments
    └─ Report to Board & Regulators

  IF deficiency is due to conservative stress test:
    └─ Stress scenario is valid; use for capital planning
```

---

## Part 9: Data Refresh & Update Cycle

Understanding the timing of data flows helps troubleshoot why dashboard shows "stale" data.

### Monthly Workflow Execution Timeline

```
DAY 1 (Month Start - e.g., April 1):
  └─ Previous month (March) data snapshot as-of March 31
  └─ All source systems: Loan Portfolio, Charge-Off, Properties, Credit Bureau
  └─ Data extraction begins

DAYS 2-5 (Alteryx Workflow Execution):
  ├─ Stage 1 (Ingestion): Load raw data files
  ├─ Stage 2 (Cleansing): Validate & reject invalid records
  ├─ Stage 3 (Enrichment): Calculate Risk_Score, LTV, Delinquency, Charge-Offs
  ├─ Stage 4 (Consolidation): JOIN all tables; create consolidated view
  ├─ Stage 5 (Compliance): Aggregate metrics; calculate regulatory ratios
  ├─ Stage 6 (Output Prep): Format for Excel, Tableau, PDF
  └─ Stage 7 (Delivery): Load Tableau Extract to Server; create outputs

DAYS 6-10 (Output Delivery):
  ├─ Tableau Extract refreshes on Tableau Server
  ├─ Client files delivered
  ├─ QA Report generated & distributed
  ├─ Archive created & stored
  └─ Executive Summary prepared

DAYS 11-20 (Analysis & Reporting):
  └─ Dashboards available to users
  └─ Users filter, analyze, download data
  └─ Reports generated for stakeholders

DAY 21 (Month-End):
  └─ Data considered "final" for March
  └─ Archives locked
  └─ Historical data retained

→ Cycle repeats monthly
```

### Data Freshness by Component

| Component | Refresh Frequency | Lag from Report Date | Availability in Dashboard |
|---|---|---|---|
| **Loan Portfolio** | Daily in ERP → Monthly to Alteryx | ~2-5 days | ~Days 6-10 of month |
| **Charge-Off & Recovery** | Daily in Collections system → Monthly to Alteryx | ~2-5 days | ~Days 6-10 of month |
| **Real Estate Valuations** | Quarterly (appraisals) → Monthly to Alteryx | ~2-5 days when available; stale if no recent appraisal | ~Days 6-10 or stale flag |
| **Credit Bureau (TransUnion)** | Monthly from TransUnion (2-day lag built in) | ~3-7 days | ~Days 6-10 of month |
| **Tableau Extract** | Refreshed after Alteryx completes | ~2-5 days from workflow completion | Days 6-10 or on-demand refresh |
| **Dashboard Metrics** | Real-time from Extract (static until next refresh) | Data as-of Report_Date (EOM-1) | Current / interactive |

---

## Cross-Reference to Supporting Documentation

- **Workflow Stages & Processing:** See [1_MDPA_PROCESS_DOCUMENTATION.md](1_MDPA_PROCESS_DOCUMENTATION.md) and [2_WORKFLOW_ARCHITECTURE.md](2_WORKFLOW_ARCHITECTURE.md)
- **Field Transformations:** See [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md)
- **Data Definitions:** See [9_BUSINESS_DATA_GLOSSARY.md](9_BUSINESS_DATA_GLOSSARY.md)
- **Dashboard Reference:** See [12_TABLEAU_DASHBOARD_GLOSSARY.md](12_TABLEAU_DASHBOARD_GLOSSARY.md)
- **Data Models:** See [10_LOGICAL_DATA_MODEL.md](10_LOGICAL_DATA_MODEL.md) and [11_PHYSICAL_DATA_MODEL.md](11_PHYSICAL_DATA_MODEL.md)
- **Quality Standards:** See [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md)

---

## Conclusion

This lineage document provides a complete map from Alteryx workflow outputs to Tableau dashboards. Every metric, chart, and table in the dashboard can be traced back through the processing pipeline to its source data, enabling:

- **Impact Analysis:** Understand how upstream changes affect downstream dashboards
- **Troubleshooting:** Quickly identify root causes of dashboard discrepancies
- **Data Governance:** Validate that calculations follow business logic
- **Quality Assurance:** Confirm that data quality is maintained through all stages
- **Documentation:** Provide auditable proof of data lineage for compliance

---

**Document Version:** 1.0 | **Last Updated:** 2026-03-18 | **Next Review:** 2026-04-18
