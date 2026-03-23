# MDPA Logical Data Model

**Conceptual Entity-Relationship Model for Monthly Data Process Assessment**

**Version:** 1.0
**Last Updated:** 2026-03-18
**Purpose:** Define business entities, attributes, and relationships independent of technical implementation
**Audience:** Business architects, data modelers, technical leads, compliance/audit

---

## Executive Summary

The MDPA Logical Data Model represents the core business concepts and their relationships required to assess monthly loan portfolio performance. The model is built around four primary entities:

1. **LOAN** - The central business entity representing individual credit facilities
2. **CHARGE_OFF_RECOVERY** - Loss and recovery activity linked to loans
3. **PROPERTY_COLLATERAL** - Real estate collateral information for secured loans
4. **CREDIT_BUREAU_PROFILE** - External credit enhancement data from TransUnion

These entities are related through their primary business identifier (Loan_ID) and flow through seven processing stages to produce five distinct output deliverables.

---

## Entity-Relationship Diagram (Conceptual)

```
┌─────────────────────────────────────┐
│            LOAN                     │
├─────────────────────────────────────┤
│ PK: Loan_ID                         │
│ FK: Member_ID                       │
│ --- Core Attributes ---             │
│ Loan_Type                           │
│ Origination_Date                    │
│ Maturity_Date                       │
│ Original_Amount                     │
│ Current_Balance                     │
│ Interest_Rate                       │
│ Payment_Status                      │
│ Days_Past_Due                       │
│ Collateral_Type                     │
│ Collateral_Value                    │
│ LTV_Ratio (calculated)              │
│ Credit_Score (from CREDIT_BUREAU)   │
│ DTI_Ratio                           │
│ Risk_Level (calculated)             │
└────────────┬────────────────────────┘
             │
             │ 1:1 relationship
             │ (optional)
             │
             ▼
┌─────────────────────────────────────┐
│   CHARGE_OFF_RECOVERY               │
├─────────────────────────────────────┤
│ PK: Charge_Off_ID                   │
│ FK: Loan_ID                         │
│ --- Attributes ---                  │
│ Charge_Off_Date                     │
│ Charge_Off_Amount                   │
│ Recovery_Amount (cumulative)        │
│ Principal_Recovered                 │
│ Interest_Recovered                  │
│ Recovery_Date (most recent)         │
│ Recovery_Transaction_Type           │
│ Recovery_Flag (calculated)          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   PROPERTY_COLLATERAL               │
├─────────────────────────────────────┤
│ PK: Property_ID                     │
│ FK: Loan_ID                         │
│ --- Attributes ---                  │
│ Property_Address                    │
│ Appraised_Value                     │
│ Appraisal_Date                      │
│ Market_Value_Trend                  │
└─────────────────────────────────────┘
             ▲
             │ 1:1 relationship
             │ (optional, RE loans only)
             │
             └────────────┬────────────┘
                          │
┌─────────────────────────────────────┐
│   CREDIT_BUREAU_PROFILE             │
├─────────────────────────────────────┤
│ PK: Bureau_Profile_ID               │
│ FK: Member_ID                       │
│ --- Attributes ---                  │
│ Credit_Score (FICO)                 │
│ Score_Trend                         │
│ Public_Records_Count                │
│ Active_Accounts                     │
│ Total_Revolving_Balance             │
│ Last_Update_Date                    │
└─────────────────────────────────────┘
             ▲
             │ 1:N relationship
             │ (Member has 1 active bureau)
             │ profile; historical versions
             │
             └─────────────────────────┘

PROCESSING STAGES:
Stage 1: INGESTION
   ├─ Input: Loan Portfolio (10K-50K+ loans)
   ├─ Input: Charge-Off/Recovery (1K-5K active)
   ├─ Input: Property Collateral (3K-10K properties)
   └─ Input: Credit Bureau (8K-40K members)

Stage 2-7: CLEANSING → ENRICHMENT → CONSOLIDATION → COMPLIANCE → OUTPUT_PREP → DELIVERY
   └─ Validation, transformation, calculation, and output generation

OUTPUT DELIVERABLES:
   ├─ Client File (enriched LOAN data + Risk calculations)
   ├─ QA Report (aggregated metrics and quality scores)
   ├─ Tableau Extract (denormalized dimensional data)
   ├─ Archive (complete audit trail with hashes)
   └─ Executive Summary (KPI dashboard metrics)
```

---

## Core Entities Definition

### 1. LOAN (Primary/Central Entity)

**Business Definition:** A credit facility extended to a member by the credit union, with repayment terms, collateral, and risk characteristics.

**Primary Key:** Loan_ID (10-digit unique identifier)
**Alternative Keys:** Member_ID + Origination_Date (identifies member's specific loan)
**Cardinality:** 10,000-50,000+ loans per monthly cycle

| Attribute | Domain | Required | Business Rule | Cardinality |
|---|---|---|---|---|
| **Loan_ID** | Numeric(10) | Yes | Unique, immutable, assigned at origination | PK |
| **Member_ID** | Numeric(10) | Yes | Foreign key to MEMBER entity (implicit) | FK |
| **Loan_Type** | String(20) | Yes | Auto, Mortgage, Personal, Home Equity, Credit Card, Line of Credit, Other | Fixed domain |
| **Origination_Date** | Date | Yes | Date loan was funded; cannot be future date or before 2000-01-01 | Immutable |
| **Maturity_Date** | Date | Yes | Scheduled payoff date; must be > Origination_Date | Changes: Only by refi/mod |
| **Original_Amount** | Currency | Yes | Amount at funding; immutable baseline for loss severity | Immutable |
| **Current_Balance** | Currency | Yes | Outstanding principal; updates monthly; range [$0, Original_Amount] | Changes monthly |
| **Interest_Rate** | Decimal(4,2) | Yes | Annual rate; range [0%, 30%]; can be fixed or variable | Changes: Refi/ARM reset |
| **Payment_Frequency** | String(20) | Yes | Monthly, Quarterly, Annual; >95% are Monthly | Fixed at origination |
| **Payment_Status** | String(20) | Yes | Current, 30DPD, 60DPD, 90DPD, 120DPD+, Default, PaidOff, ChargedOff | Changes monthly |
| **Days_Past_Due** | Integer | Conditional | 0-9999; NULL if Current/Paid Off/Charged Off | Changes monthly |
| **Collateral_Type** | String(20) | Conditional | Auto, Real Estate, Securities, Equipment, Unsecured, Other | Fixed at origination |
| **Collateral_Value** | Currency | Conditional | Current FMV; required if collateral_type ≠ Unsecured | Updates quarterly |
| **LTV_Ratio** | Decimal(5,2) | Calculated | (Current_Balance / Collateral_Value) × 100 | Calculated monthly |
| **Credit_Score** | Integer | Conditional | FICO score 300-850; from CREDIT_BUREAU_PROFILE | Updates monthly (lag: 2 days) |
| **DTI_Ratio** | Decimal(5,2) | Conditional | Debt-to-income %; recalculated annually | Updates annually |

**Business Rules:**
- Origination_Date ≤ Current_Date (no future dates)
- Maturity_Date > Origination_Date
- Current_Balance ≤ Original_Amount
- LTV_Ratio can exceed 100% (underwater scenarios)
- Payment_Status drives collection priority
- Days_Past_Due only valid if Payment_Status is delinquent

**Relationships:**
- 1:1 with CHARGE_OFF_RECOVERY (optional; only if charged off)
- 1:1 with PROPERTY_COLLATERAL (optional; only if RE collateral)
- N:1 with CREDIT_BUREAU_PROFILE (via Member_ID)

---

### 2. CHARGE_OFF_RECOVERY (Loss/Recovery Entity)

**Business Definition:** Records of loan charge-offs and subsequent recovery activity, tracking both loss realization and loss mitigation efforts.

**Primary Key:** Charge_Off_ID
**Foreign Key:** Loan_ID (required; one per loan maximum)
**Cardinality:** 1,000-5,000 active charge-offs per month

| Attribute | Domain | Required | Business Rule | Cardinality |
|---|---|---|---|---|
| **Charge_Off_ID** | Numeric | Yes | Unique identifier; auto-generated | PK |
| **Loan_ID** | Numeric(10) | Yes | Foreign key; 1:1 with LOAN | FK |
| **Charge_Off_Date** | Date | Yes (if CO) | Date loan deemed uncollectible; ≤ Current_Date; must be ≥ 120 DPD | Immutable |
| **Charge_Off_Amount** | Currency | Yes (if CO) | Principal written off; range [$0, Original_Amount]; excludes interest | Immutable |
| **Recovery_Amount** | Currency | Conditional | Cumulative recovery (principal + interest + fees); updates with each recovery | Changes monthly |
| **Principal_Recovered** | Currency | Conditional | Principal portion of recovery; range [$0, Charge_Off_Amount] | Changes monthly |
| **Interest_Recovered** | Currency | Conditional | Interest & fees recovered; can exceed accrued interest due to late fees | Changes monthly |
| **Recovery_Date** | Date | Conditional | Most recent recovery transaction date; ≤ Current_Date | Updates with recovery |
| **Recovery_Transaction_Type** | String(10) | Conditional | COFR, NSF, GAP, REP, MAN, OTH (specific transaction codes) | Changes with each recovery |
| **Recovery_Flag** | String(1) | Calculated | Y/N based on whether Recovery_Amount > 0 | Calculated monthly |

**Business Rules:**
- Charge_Off_Date ≥ (Origination_Date + 120 days) in production
- Charge_Off_Amount ≤ Original_Amount
- Recovery_Amount ≥ Principal_Recovered + Interest_Recovered
- Recovery_Date must be ≥ Charge_Off_Date
- Recovery transactions must be categorized by type
- Recovery_Amount can accumulate over years

**Relationships:**
- 1:1 with LOAN (zero or one per loan)
- 1:N with RECOVERY_TRANSACTION (each recovery is separate transaction)

---

### 3. PROPERTY_COLLATERAL (Collateral Entity)

**Business Definition:** Real estate properties pledged as collateral for secured loans, with market valuation and trend tracking.

**Primary Key:** Property_ID
**Foreign Key:** Loan_ID (optional; only for RE loans)
**Cardinality:** 3,000-10,000 properties; multiple loans can reference same property

| Attribute | Domain | Required | Business Rule | Cardinality |
|---|---|---|---|---|
| **Property_ID** | Numeric | Yes | Unique identifier; auto-generated | PK |
| **Loan_ID** | Numeric(10) | Conditional | Foreign key; required for RE collateral; can be multiple loans per property | FK |
| **Property_Address** | String(200) | Yes | Complete mailing address; standardized format | Immutable |
| **Appraised_Value** | Currency | Yes | Fair market value per appraisal; range [$10K, $5M] | Updates quarterly |
| **Appraisal_Date** | Date | Yes | Date of most recent appraisal; triggers re-appraisal if >12 months | Updates quarterly |
| **Market_Value_Trend** | String(10) | Yes | Up, Down, Stable, Unknown; directional indicator | Updates quarterly |
| **Appraisal_Compliance** | String(20) | Calculated | Current, Stale (>12 months), Expired; compliance status | Calculated monthly |

**Business Rules:**
- Appraised_Value must be ≥ $10,000 for mortgages
- Appraisal_Date within last 12 months (compliance requirement)
- If Appraisal_Date > 12 months old → triggers re-appraisal workflow
- Property address used for geographic analysis (market trends, concentration risk)
- Multiple loans can share same property (e.g., junior mortgages)

**Relationships:**
- 1:1 with LOAN (zero or one RE property per RE loan)
- N:1 with PROPERTY (can have multiple loans secured against same property)

---

### 4. CREDIT_BUREAU_PROFILE (External Enhancement Entity)

**Business Definition:** External credit metrics from TransUnion (major credit bureau) providing third-party risk assessment and financial health indicators.

**Primary Key:** Bureau_Profile_ID
**Foreign Key:** Member_ID (N:1; members can have historical profiles)
**Cardinality:** 8,000-40,000 members; monthly snapshots

| Attribute | Domain | Required | Business Rule | Cardinality |
|---|---|---|---|---|
| **Bureau_Profile_ID** | Numeric | Yes | Unique identifier; auto-generated for historical tracking | PK |
| **Member_ID** | Numeric(10) | Yes | Foreign key; N:1 relationship (historical versions) | FK |
| **Credit_Score** | Integer | Yes | FICO score; range [300, 850]; required for risk calculations | Changes monthly |
| **Score_Trend** | String(20) | Yes | Improving, Declining, Stable, Unknown; directional indicator | Changes monthly |
| **Public_Records_Count** | Integer | Yes | Count of bankruptcies, liens, judgments; range [0, 99] | Changes on public record events |
| **Active_Accounts** | Integer | Yes | Count of active credit accounts; range [0, 99] | Changes on account events |
| **Total_Revolving_Balance** | Currency | Yes | Sum of CC and revolving balances; used in DTI; range [$0, $9.9M] | Changes monthly |
| **Last_Update_Date** | Date | Yes | TransUnion data date; typically 2-day lag | Updates monthly |
| **Data_Quality_Flag** | String(1) | Conditional | Y/N; indicates if data is stale or missing | Calculated |

**Business Rules:**
- Credit_Score mandatory for risk scoring and fair lending analysis
- Public_Records_Count is major risk factor (weights heavily in risk models)
- Score_Trend calculated month-over-month
- Total_Revolving_Balance used in DTI_Ratio calculations
- 2-day reporting lag from TransUnion (not real-time)
- Historical profiles retained for audit trail (7+ years)

**Relationships:**
- N:1 with MEMBER (members can have multiple historical profiles)
- 1:1 with LOAN (via Member_ID join)

---

## Derived/Calculated Entities

### LOAN_RISK_SCORE (Calculated View)

**Definition:** Composite risk indicator combining payment behavior, financial capacity, and loan seasoning.

**Calculation:**
```
Risk_Score = (100 - Credit_Score/10) × (DTI_Ratio/100) × (Age_Days/365)
Result Range: 0-100 (higher = more risky)
Bucketing:
  - Risk_Level = "Low" if Score < 20
  - Risk_Level = "Medium" if 20 ≤ Score < 50
  - Risk_Level = "High" if 50 ≤ Score < 80
  - Risk_Level = "Critical" if Score ≥ 80
```

**Used in:** Client Report, Tableau Extract, Executive Summary

---

### PORTFOLIO_AGGREGATE (Calculated View)

**Definition:** Monthly portfolio-level summary statistics aggregated from individual loans.

**Key Metrics:**
- Total_Loans: COUNT(*)
- Portfolio_Balance: SUM(Current_Balance)
- Delinquent_Loans: COUNT(*) WHERE Days_Past_Due ≥ 30
- Delinquency_Rate: Delinquent_Loans / Total_Loans × 100
- Charge_Off_Count: COUNT(*) WHERE Charge_Off_Date in period
- Charge_Off_Rate: (Charge_Off_Amount / Beginning_Balance) × 12
- Recovery_Count: COUNT(*) WHERE Recovery_Date in period
- Recovery_Rate: Recovery_Amount / Charge_Off_Amount × 100

**Used in:** QA Report, Executive Summary, Board Dashboards

---

## Entity Lifecycle & State Transitions

### LOAN State Machine

```
CREATED
  └─→ ACTIVE (Origination_Date to Maturity_Date)
       ├─→ CURRENT (Payment_Status = "Current")
       ├─→ 30DPD (Payment_Status = "30DPD"; Days_Past_Due 30-59)
       ├─→ 60DPD (Payment_Status = "60DPD"; Days_Past_Due 60-89)
       ├─→ 90DPD (Payment_Status = "90DPD"; Days_Past_Due 90-119)
       ├─→ 120DPD+ (Payment_Status = "120DPD+"; Days_Past_Due ≥ 120)
       │    └─→ CHARGED_OFF (Created CHARGE_OFF_RECOVERY record; status = "Charged Off")
       │         └─→ IN_RECOVERY (Recovery_Amount > 0)
       │            └─→ RECOVERED (Recovery_Amount ≥ Charge_Off_Amount)
       └─→ PAID_OFF (Payment_Status = "Paid Off"; Current_Balance = $0)
```

### Processing Flow & Data Dependency

```
MONTH START: New loan portfolio received
     │
     ├─→ Stage 1: INGESTION
     │   └─ Load: Loan Portfolio, Charge-Off/Recovery, Property, Credit Bureau
     │
     ├─→ Stage 2: CLEANSING
     │   └─ Validate each entity against business rules
     │      └─ Reject invalid records / Flag anomalies
     │
     ├─→ Stage 3: ENRICHMENT
     │   └─ Calculate: LTV, Risk_Score, Risk_Level, Age_of_Loan, Delinquency classification
     │   └─ Lookup: Credit bureau data via Member_ID
     │   └─ Update: Property valuations, Market trends
     │
     ├─→ Stage 4: CONSOLIDATION
     │   └─ Join LOAN + CHARGE_OFF_RECOVERY + PROPERTY + CREDIT_BUREAU
     │   └─ Aggregate: Portfolio-level metrics
     │
     ├─→ Stage 5: COMPLIANCE
     │   └─ Verify: Regulatory requirements (Loan_ID uniqueness, dates, statuses)
     │   └─ Calculate: Regulatory ratios (Delinquency, Charge-Off, Recovery rates)
     │
     ├─→ Stage 6: OUTPUT_PREP
     │   └─ Format: Client file, QA report, Tableau extract, Archive, Executive summary
     │
     └─→ Stage 7: DELIVERY
        └─ Deliver outputs to: Clients, Analytics, Compliance, Management

MONTH END: Archive with complete audit trail
```

---

## Relationship Cardinality Summary

| Relationship | Cardinality | Optionality | Business Meaning |
|---|---|---|---|
| LOAN : MEMBER | N:1 | Required | Many loans per member |
| LOAN : CHARGE_OFF_RECOVERY | 1:1 | Optional | Loans may or may not be charged off |
| LOAN : PROPERTY_COLLATERAL | 1:1 | Optional | Only RE-collateralized loans have property records |
| LOAN : CREDIT_BUREAU_PROFILE | 1:1 | Optional | Bureau data may not be available for all members |
| CHARGE_OFF_RECOVERY : RECOVERY_TRANSACTION | 1:N | Dependent | Multiple recovery transactions per charge-off |
| PROPERTY_COLLATERAL : LOAN | N:1 | Dependent | Same property can secure multiple loans |
| CREDIT_BUREAU_PROFILE : MEMBER | N:1 | Optional | Historical profiles; current + 24-month history |

---

## Data Flow Through Processing Stages

### Stage 1: Ingestion (Raw Input)
```
INPUT FILES:
  Loan_Portfolio.csv (10K-50K loans)
    └─ Entities: LOAN core attributes
  Charge_Off_Recovery.csv (1K-5K active)
    └─ Entities: CHARGE_OFF_RECOVERY records
  Property_Collateral.csv (3K-10K properties)
    └─ Entities: PROPERTY_COLLATERAL records
  TransUnion_Bureau_Extract.csv (8K-40K)
    └─ Entities: CREDIT_BUREAU_PROFILE records
```

### Stage 2: Cleansing
```
VALIDATIONS APPLIED:
  LOAN:
    ✓ Loan_ID: NOT NULL, UNIQUE, 10 digits
    ✓ Origination_Date: ≤ Current_Date, ≥ 2000-01-01
    ✓ Maturity_Date: > Origination_Date
    ✓ Current_Balance: ≥ $0, ≤ Original_Amount
    ✓ Payment_Status: IN (valid status list)
    ✗ Reject: Invalid Loan_ID or Origination_Date
    ⚠ Flag: Current_Balance > Original_Amount (data quality issue)

  CHARGE_OFF_RECOVERY:
    ✓ Loan_ID: Must exist in LOAN
    ✓ Charge_Off_Date: ≤ Current_Date, ≥ Origination_Date + 120 days
    ✓ Charge_Off_Amount: ≤ Original_Amount
    ⚠ Flag: Recovery_Amount inconsistencies

  PROPERTY_COLLATERAL:
    ✓ Property_Address: Valid US format
    ✓ Appraised_Value: ≥ $10K for RE loans
    ✓ Appraisal_Date: ≤ 12 months old
    ⚠ Flag: Appraisal_Date > 12 months (stale appraisal)

  CREDIT_BUREAU_PROFILE:
    ✓ Credit_Score: 300-850 or NULL
    ✓ Last_Update_Date: ≤ 2 days old
    ⚠ Flag: Score_Trend inconsistencies
```

### Stage 3: Enrichment
```
CALCULATIONS ADDED:
  LOAN → Add LTV_Ratio = (Current_Balance / Collateral_Value) × 100
  LOAN → Add Risk_Score = composite calculation
  LOAN → Add Risk_Level = bucketed classification
  LOAN → Add Age_of_Loan_Days = TODAY() - Origination_Date
  LOAN → Add Months_to_Maturity = (Maturity_Date - TODAY()) / 30

  CHARGE_OFF_RECOVERY:
    └─ Add Recovery_Flag = IF Recovery_Amount > 0 THEN "Y" ELSE "N"

  PORTFOLIO:
    └─ Aggregate metrics (Delinquency_Rate, Charge_Off_Rate, Recovery_Rate)
```

### Stage 4: Consolidation
```
JOINS PERFORMED:
  LOAN
    └─ [1:1] JOIN CHARGE_OFF_RECOVERY ON Loan_ID
    └─ [1:1] LEFT JOIN PROPERTY_COLLATERAL ON Loan_ID (where Collateral_Type = "Real Estate")
    └─ [1:1] LEFT JOIN CREDIT_BUREAU_PROFILE ON Member_ID (current profile only)

  Result: Consolidated LOAN view with all enrichment
```

### Stages 5-7: Compliance, Output Prep, Delivery
```
OUTPUT FORMATTING:
  ├─ CLIENT_DELIVERABLE
  │  └─ LOAN fields (Loan_ID, Member_Name, Current_Balance, Payment_Status, Risk_Level)
  │  └─ Calculated fields (Risk_Score, Recovery_Flag, Days_PD)
  │  └─ Format: Excel/CSV with client branding
  │
  ├─ QA_REPORT
  │  └─ Portfolio aggregates (Total_Loans, Delinquency_Rate, Charge_Off_Rate)
  │  └─ Quality metrics (Data_Quality_Score, Error_Count, Processing_Duration)
  │  └─ Format: Excel with charts and commentary
  │
  ├─ TABLEAU_EXTRACT
  │  └─ Denormalized LOAN view (all dimensions + measures)
  │  └─ Format: .hyper file for Tableau Server
  │  └─ Refresh: Daily (automated)
  │
  ├─ ARCHIVE
  │  └─ Complete snapshot of all stages
  │  └─ Include: Input files, processing logs, output files
  │  └─ Format: ZIP with checksums for integrity
  │
  └─ EXECUTIVE_SUMMARY
     └─ KPIs: Portfolio_Balance, Delinquency_Rate, Charge_Off_Rate, Recovery_Rate
     └─ Format: Slide deck or PDF summary
```

---

## Data Governance & Stewardship

### Entity Ownership

| Entity | Business Owner | Technical Owner | Data Steward | Refresh Frequency |
|---|---|---|---|---|
| **LOAN** | Loan Operations | Data Platform | Credit Risk | Daily (portfolio updates) |
| **CHARGE_OFF_RECOVERY** | Collections | Data Platform | Collections | Daily (recovery updates) |
| **PROPERTY_COLLATERAL** | Appraisal System | Data Platform | Appraisal Mgmt | Quarterly (appraisals) |
| **CREDIT_BUREAU_PROFILE** | Credit Risk | TransUnion (external) | Credit Risk | Monthly (2-day lag) |

### Data Quality Standards by Entity

| Entity | Critical Validations | SLA Compliance |
|---|---|---|
| **LOAN** | Loan_ID uniqueness, dates, balance ranges | 99.9% completeness |
| **CHARGE_OFF_RECOVERY** | Loan_ID existence, date logic, amount logic | 100% if created |
| **PROPERTY_COLLATERAL** | Appraisal currency (≤12 months), value > $0 | Appraisal current on all RE loans |
| **CREDIT_BUREAU_PROFILE** | Score range, data recency (≤2 days old) | 90%+ of members by month 10 |

---

## Cross-Reference to Other Documentation

- **Input Data Details:** See [4_DATA_SOURCES_AND_LOCATIONS.md](4_DATA_SOURCES_AND_LOCATIONS.md)
- **Data Quality Rules:** See [9_BUSINESS_DATA_GLOSSARY.md](9_BUSINESS_DATA_GLOSSARY.md) - Data Quality Standards section
- **Field-Level Transformations:** See [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md)
- **Physical Implementation:** See [11_PHYSICAL_DATA_MODEL.md](11_PHYSICAL_DATA_MODEL.md)
- **Process Workflow:** See [1_MDPA_PROCESS_DOCUMENTATION.md](1_MDPA_PROCESS_DOCUMENTATION.md)
- **Architecture Details:** See [2_WORKFLOW_ARCHITECTURE.md](2_WORKFLOW_ARCHITECTURE.md)
