# MDPA Field Mapping & Data Lineage

**Document Version:** 1.0
**Last Updated:** 2026-03-17
**Purpose:** Complete field tracking from source system through all transformations to final outputs

---

## Executive Summary

This document provides:
- **Complete field inventory** from all input sources
- **Transformation tracking** showing how fields are modified through the workflow
- **Data lineage** from source → staging → processing → output
- **Field dependencies** and calculation chains
- **Output mapping** showing which fields appear in each deliverable

---

## Field Inventory by Source System

### Source 1: Loan Portfolio Master (Primary Data Source)

| Field Name | Data Type | Source System | Required | Purpose |
|---|---|---|---|---|
| `Loan_ID` | String | Core Portfolio | Y | Unique loan identifier (key) |
| `Member_ID` | String | Core Portfolio | Y | Member/borrower identifier |
| `Loan_Type` | String | Core Portfolio | Y | Loan product classification |
| `Origination_Date` | Date | Core Portfolio | Y | Date loan was originated |
| `Maturity_Date` | Date | Core Portfolio | Y | Scheduled loan payoff date |
| `Original_Amount` | Currency | Core Portfolio | Y | Loan amount at origination |
| `Current_Balance` | Currency | Core Portfolio | Y | Outstanding loan balance |
| `Interest_Rate` | Decimal | Core Portfolio | Y | Loan interest rate (%) |
| `Payment_Frequency` | String | Core Portfolio | Y | Monthly/Quarterly/Annual |
| `Payment_Status` | String | Core Portfolio | Y | Current/30DPD/60DPD/90DPD+ |
| `Days_Past_Due` | Integer | Core Portfolio | N | Number of days delinquent |
| `Collateral_Type` | String | Core Portfolio | N | Type of loan collateral |
| `Collateral_Value` | Currency | Core Portfolio | N | Current fair market value |
| `LTV_Ratio` | Decimal | Core Portfolio | N | Loan-to-value ratio (%) |
| `Credit_Score` | Integer | Core Portfolio | N | Member credit score (FICO) |
| `DTI_Ratio` | Decimal | Core Portfolio | N | Debt-to-income ratio (%) |

### Source 2: Charge-Off & Recovery Data

| Field Name | Data Type | Source System | Required | Purpose |
|---|---|---|---|---|
| `Charge_Off_Date` | Date | Loss Management | N | Date loan was charged off |
| `Charge_Off_Amount` | Currency | Loss Management | N | Amount written off |
| `Recovery_Amount` | Currency | Loss Management | N | Cumulative recovery to date |
| `Recovery_Date` | Date | Loss Management | N | Date of recovery/collection |
| `Recovery_Transaction_Type` | String | Loss Management | N | COFR, NSF, etc. |
| `Principal_Recovered` | Currency | Loss Management | N | Principal portion recovered |
| `Interest_Recovered` | Currency | Loss Management | N | Interest portion recovered |

### Source 3: Real Estate Valuation Data

| Field Name | Data Type | Source System | Required | Purpose |
|---|---|---|---|---|
| `Property_Address` | String | Appraisal System | N | Collateral property address |
| `Appraised_Value` | Currency | Appraisal System | N | Most recent appraisal value |
| `Appraisal_Date` | Date | Appraisal System | N | Date of appraisal |
| `Market_Value_Trend` | String | Market Analysis | N | Up/Down/Stable |

### Source 4: Credit Bureau Data (TransUnion)

| Field Name | Data Type | Source System | Required | Purpose |
|---|---|---|---|---|
| `Credit_Score` | Integer | TransUnion | N | Credit score (FICO) |
| `Score_Trend` | String | TransUnion | N | Improving/Declining/Stable |
| `Public_Records_Count` | Integer | TransUnion | N | Bankruptcy, liens, judgments |
| `Active_Accounts` | Integer | TransUnion | N | Number of active credit lines |
| `Total_Revolving_Balance` | Currency | TransUnion | N | Total credit card balances |

---

## Data Transformation Chain

### Stage 1: Data Ingestion & Validation

**Input Fields:** All source fields listed above

**Transformations:**
- Validate date formats (convert to standardized YYYY-MM-DD)
- Convert currency fields to decimal (handle $ symbols, commas)
- Trim whitespace from text fields
- Validate numeric ranges (interest rates 0-30%, DTI 0-500%, etc.)

**Output Fields:** Cleansed versions of all inputs

**Key Macros:**
- `Cleanse.yxmc` - General data cleansing
- `Contingent File Input.yxmc` - Conditional input handling

---

### Stage 2: Data Enrichment & Calculations

**Input Fields:** Cleansed portfolio data + all source fields

**Calculations:**
```
Age_of_Loan_Days = TODAY() - Origination_Date
Months_to_Maturity = (Maturity_Date - TODAY()) / 30
Payment_History_Score = IF(Current_Status="Current", 100, 90-DPD*2)
Risk_Score = (100-Credit_Score/10) * (DTI_Ratio/100) * (Age_of_Loan_Days/365)
Recovery_Rate = Recovery_Amount / Charge_Off_Amount
Market_LTV = Current_Balance / Current_Market_Value
```

**Output Fields:**
- `Age_of_Loan_Days`
- `Months_to_Maturity`
- `Payment_History_Score`
- `Risk_Score`
- `Recovery_Rate`
- `Market_LTV`

**Key Macros:**
- `2020_Date_Converter.yxmc` - Date calculations
- `Generate Unique ID.yxmc` - ID generation

---

### Stage 3: Data Matching & Consolidation

**Input Fields:** Enriched data from Stage 2

**Transformations:**
- Match Charge-Off records to active portfolio
- Match Recovery transactions to charge-offs
- Append Real Estate values by property address
- Consolidate multiple sources into single record

**Output Fields:** Consolidated loan records with all source data

**Key Macros:**
- `Append Charge Offs and Matching.yxmc` - CO matching
- `Append RE Values.yxmc` - Real estate data append
- `Union Subset Prior Period.yxmc` - Prior period consolidation

---

### Stage 4: Compliance & Quality Processing

**Input Fields:** Consolidated records

**Transformations:**
- Mask PII (member names, SSN, addresses per regulatory requirements)
- Apply regulatory filters
- Create audit trail entries
- Validate acceptance criteria

**Output Fields:** Compliance-ready records

**Key Macros:**
- `TransUnion Mask_FICO Only_v2.yxmc` - PII masking
- `Ethnic & Gender ID.yxmc` - Demographic coding

---

### Stage 5: Output Preparation

**Input Fields:** Processed records from Stage 4

**Transformations (by output type):**

#### Client Output File
- Select specific fields for client delivery
- Format for Excel/CSV
- Apply name formatting (Last, First)
- Round currency to 2 decimals

#### QA Report
- Aggregate by loan type, status, risk level
- Count records by category
- Calculate summary statistics

#### Tableau Extract
- Transform to star schema format
- Create dimensional hierarchies
- Denormalize for dashboard performance

**Output Fields:** Type-specific field sets

**Key Macros:**
- `Last Name Comma First Name Cleaner_v2.yxmc` - Name formatting
- `Tableau New Macro.yxmc` - Tableau format
- `Tableau New Macro Dropped.yxmc` - Dropped records format
- `Tableau New Macro Securities.yxmc` - Securities format

---

## Data Lineage Diagram

```
SOURCE SYSTEMS
├── Loan Portfolio Master
│   ├── Loan_ID, Member_ID, Loan_Type
│   ├── Origination_Date, Current_Balance
│   └── Payment_Status, Credit_Score
├── Charge-Off System
│   ├── Charge_Off_Date, Charge_Off_Amount
│   └── Recovery_Amount, Recovery_Transaction_Type
├── Real Estate System
│   ├── Property_Address
│   └── Appraised_Value
└── TransUnion
    ├── Credit_Score
    └── Public_Records_Count

                ↓ [CLEANSE]

STAGING LAYER (Validated)
├── Cleansed portfolio fields
├── Validated dates & currency
└── Quality checks applied

                ↓ [ENRICH]

ENRICHMENT LAYER (Calculated)
├── Age_of_Loan_Days
├── Payment_History_Score
├── Risk_Score
├── Recovery_Rate
└── Market_LTV

                ↓ [CONSOLIDATE]

CONSOLIDATION LAYER (Matched)
├── Portfolio + Charge-Offs matched
├── Real Estate values appended
├── Prior period combined
└── Single record per loan

                ↓ [COMPLY]

COMPLIANCE LAYER (Masked/Filtered)
├── PII masked
├── Regulatory filters applied
├── Audit trail created
└── Acceptance criteria validated

                ↓ [OUTPUT]

OUTPUT LAYER (Formatted)
├── Client File (XLSX/CSV)
├── QA Report (Summary metrics)
├── Tableau Extract (Star schema)
└── Archive (Historical backup)
```

---

## Field Dependencies & Calculations

### Critical Calculation Chains

**Risk Assessment Chain:**
```
DTI_Ratio + Credit_Score + Days_Past_Due
  → Payment_History_Score
    → Risk_Score
      → Risk_Category (Low/Medium/High/Critical)
```

**Recovery Analysis Chain:**
```
Charge_Off_Amount + Recovery_Amount + Recovery_Date
  → Recovery_Rate
    → Time_to_Recovery
      → Recovery_Effectiveness_Score
```

**Collateral Analysis Chain:**
```
Current_Balance + Current_Market_Value
  → Market_LTV
    → LTV_Risk_Category
      → Collateral_Coverage_Adequacy
```

---

## Output Field Mappings

### Client Deliverable File

| Output Field | Source Field(s) | Transformation | Format |
|---|---|---|---|
| `Loan_ID` | Loan_ID | No change | String |
| `Member_Name` | Member_First_Name + Member_Last_Name | "LastName, FirstName" | String |
| `Loan_Amount` | Original_Amount | Currency format | $X,XXX.XX |
| `Current_Balance` | Current_Balance | Currency format | $X,XXX.XX |
| `Interest_Rate` | Interest_Rate | Percentage | X.XX% |
| `Payment_Status` | Payment_Status | No change | String |
| `Days_PD` | Days_Past_Due | No change | Integer |
| `Risk_Level` | Risk_Score | Bucketing (Low/Med/High) | String |

### QA Report Aggregations

| Metric | Calculation | Group By |
|---|---|---|
| `Total_Loans` | COUNT(*) | Loan_Type, Status |
| `Portfolio_Balance` | SUM(Current_Balance) | Loan_Type, Status |
| `Average_Interest_Rate` | AVG(Interest_Rate) | Loan_Type |
| `Charge_Off_Count` | COUNT(Charge_Off_Date) | Loan_Type |
| `Recovery_Success_Rate` | SUM(Recovery_Amount)/SUM(Charge_Off_Amount) | Loan_Type, Period |

### Tableau Extract Dimensions

| Dimension | Source | Hierarchy |
|---|---|---|
| `Loan_Type_Dim` | Loan_Type | Product → Type → Subtype |
| `Status_Dim` | Payment_Status | Current → DPD Buckets → Default |
| `Risk_Dim` | Risk_Score | Low → Medium → High → Critical |
| `Time_Dim` | Report_Date | Year → Quarter → Month → Day |

---

## Quality Metrics & Validation

### Field-Level Quality Rules

| Field | Validation Rule | Action if Failed |
|---|---|---|
| `Loan_ID` | Not null, unique | Reject record |
| `Current_Balance` | > 0, ≤ Original_Amount | Flag as anomaly |
| `Interest_Rate` | 0-30% | Flag as anomaly |
| `Days_Past_Due` | ≥ 0, ≤ 9999 | Set to NULL |
| `Credit_Score` | 300-850 (or NULL) | Flag if outside range |
| `LTV_Ratio` | 0-200% | Flag if >100% |

### Lineage Completeness Check

- **Source → Staging:** All required fields must be present
- **Staging → Enrichment:** No fields lost; new calculated fields added
- **Enrichment → Consolidation:** Matching keys maintained; no data discarded
- **Consolidation → Compliance:** All records tracked; masking logged
- **Compliance → Output:** Type-specific field subsets selected correctly

---

## Change Management

### Field Addition Process

1. Identify new source field requirement
2. Update `Field Inventory by Source System` section
3. Add to appropriate transformation stage
4. Create validation rule
5. Update output mappings
6. Test with sample data
7. Update workflow documentation

### Field Deprecation Process

1. Identify obsolete field
2. Document deprecation date
3. Update dependent calculations
4. Remove from output mappings
5. Purge from new extracts (archive old data)
6. Document in change log

---

## Known Issues & Limitations

### Data Quality Issues

| Issue | Impact | Workaround |
|---|---|---|
| TransUnion data arrives monthly (2-day lag) | Risk scores may be 2 days stale | Document assumption in reports |
| Real estate values updated quarterly | Market LTV may lag actual values | Flag properties with 90+ day old appraisals |
| Member names inconsistently formatted | Matching failures | Apply fuzzy match logic; manual review required |
| Credit scores occasionally missing | Risk assessment incomplete | Treat missing as 650 (average); flag for investigation |

### Workflow Limitations

| Limitation | Current Behavior | Future Enhancement |
|---|---|---|
| Recovery transactions not auto-matched | Manual review required | Implement ML-based matching |
| Charge-off date source limited | Uses primary system only | Add secondary sources (legal, outsourced collections) |
| Market value updates delayed | 90-day lag | Integrate real-time appraisal feeds |

---

**End of Document**
