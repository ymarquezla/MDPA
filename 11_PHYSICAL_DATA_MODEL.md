# MDPA Physical Data Model

**Database Schema Design & Technical Implementation**

**Version:** 1.0
**Last Updated:** 2026-03-18
**Purpose:** Define actual table structures, data types, constraints, and database implementation details
**Audience:** Database administrators, backend developers, data engineers, technical architects
**Target Platform:** SQL Server / Snowflake / PostGreSQL (dialect-agnostic with platform-specific notes)

---

## Executive Summary

The Physical Data Model translates the logical entities into five normalized production tables, supplemented by staging tables for the monthly processing pipeline. The design prioritizes:

1. **Data Integrity:** Primary keys, foreign keys, unique constraints
2. **Query Performance:** Indexed columns for frequent joins/filters
3. **Audit Trail:** Timestamp tracking for all changes
4. **Scalability:** Support for 10K-50K+ loans per month with 7+ years retention

---

## Schema Overview

```
PRODUCTION SCHEMA (mdpa_prod):
├─ LOAN (Primary table; 10K-50K rows/month)
├─ CHARGE_OFF_RECOVERY (Supporting; 1K-5K rows/month)
├─ PROPERTY_COLLATERAL (Supporting; 3K-10K rows/month)
├─ CREDIT_BUREAU_PROFILE (Supporting; 8K-40K rows/month)
└─ PORTFOLIO_MONTHLY_SUMMARY (Aggregate; 1 row/month)

STAGING SCHEMA (mdpa_staging):
├─ STG_LOAN_RAW (Raw input; cleared after validation)
├─ STG_CHARGE_OFF_RAW (Raw input; cleared after validation)
├─ STG_PROPERTY_RAW (Raw input; cleared after validation)
├─ STG_BUREAU_RAW (Raw input; cleared after validation)
└─ STG_PROCESSING_METRICS (Workflow metrics; archived monthly)

ARCHIVE SCHEMA (mdpa_archive):
└─ LOAN_HISTORY (7+ year history; immutable archive)
└─ PROCESSING_LOG (Audit trail; immutable)
```

---

## Production Tables

### TABLE: LOAN

**Primary table containing all loan-level data. Central hub for all relationships.**

```sql
CREATE TABLE mdpa_prod.LOAN (
    -- Primary Key
    Loan_ID CHAR(10) NOT NULL PRIMARY KEY,
        CONSTRAINT PK_LOAN PRIMARY KEY (Loan_ID),

    -- Foreign Keys
    Member_ID CHAR(10) NOT NULL,
        CONSTRAINT FK_LOAN_MEMBER FOREIGN KEY (Member_ID)
        REFERENCES mdpa_prod.MEMBER(Member_ID),

    -- Core Loan Attributes
    Loan_Type VARCHAR(20) NOT NULL,
        CONSTRAINT CHK_LOAN_TYPE CHECK (Loan_Type IN
        ('Auto', 'Mortgage', 'Personal', 'HomeEquity', 'CreditCard', 'LineOfCredit', 'Other')),

    Origination_Date DATE NOT NULL,
        CONSTRAINT CHK_ORIG_DATE CHECK (Origination_Date <= CAST(GETDATE() AS DATE) AND Origination_Date >= '2000-01-01'),

    Maturity_Date DATE NOT NULL,
        CONSTRAINT CHK_MAT_DATE CHECK (Maturity_Date > Origination_Date AND Maturity_Date <= '2099-12-31'),

    Original_Amount DECIMAL(12,2) NOT NULL,
        CONSTRAINT CHK_ORIG_AMT CHECK (Original_Amount >= 100.00 AND Original_Amount <= 500000.00),

    Current_Balance DECIMAL(12,2) NOT NULL,
        CONSTRAINT CHK_CURR_BAL CHECK (Current_Balance >= 0 AND Current_Balance <= Original_Amount),

    Interest_Rate DECIMAL(5,2) NOT NULL,
        CONSTRAINT CHK_INT_RATE CHECK (Interest_Rate >= 0 AND Interest_Rate <= 30),

    Payment_Frequency VARCHAR(20) NOT NULL DEFAULT 'Monthly',
        CONSTRAINT CHK_PAY_FREQ CHECK (Payment_Frequency IN ('Monthly', 'Quarterly', 'Annual')),

    Payment_Status VARCHAR(20) NOT NULL DEFAULT 'Current',
        CONSTRAINT CHK_PAY_STATUS CHECK (Payment_Status IN
        ('Current', '30DPD', '60DPD', '90DPD', '120DPD+', 'Default', 'PaidOff', 'ChargedOff')),

    Days_Past_Due INT,
        CONSTRAINT CHK_DPD CHECK (Days_Past_Due IS NULL OR (Days_Past_Due >= 0 AND Days_Past_Due <= 9999)),

    Collateral_Type VARCHAR(20),
        CONSTRAINT CHK_COLLATERAL_TYPE CHECK (Collateral_Type IS NULL OR Collateral_Type IN
        ('Auto', 'RealEstate', 'Securities', 'Equipment', 'Unsecured', 'Other')),

    Collateral_Value DECIMAL(12,2),
        CONSTRAINT CHK_COLLATERAL_VAL CHECK (Collateral_Value IS NULL OR Collateral_Value > 0),

    LTV_Ratio DECIMAL(5,2),
        CONSTRAINT CHK_LTV_RATIO CHECK (LTV_Ratio IS NULL OR (LTV_Ratio >= 0 AND LTV_Ratio <= 500)),

    Credit_Score INT,
        CONSTRAINT CHK_CREDIT_SCORE CHECK (Credit_Score IS NULL OR (Credit_Score >= 300 AND Credit_Score <= 850)),

    DTI_Ratio DECIMAL(5,2),
        CONSTRAINT CHK_DTI_RATIO CHECK (DTI_Ratio IS NULL OR (DTI_Ratio >= 0 AND DTI_Ratio <= 500)),

    Risk_Score DECIMAL(5,2),
        CONSTRAINT CHK_RISK_SCORE CHECK (Risk_Score IS NULL OR (Risk_Score >= 0 AND Risk_Score <= 100)),

    Risk_Level VARCHAR(20),
        CONSTRAINT CHK_RISK_LEVEL CHECK (Risk_Level IS NULL OR Risk_Level IN ('Low', 'Medium', 'High', 'Critical')),

    -- Audit/Processing Columns
    Data_Quality_Flag CHAR(1) DEFAULT 'Y' NOT NULL,
        CONSTRAINT CHK_DQ_FLAG CHECK (Data_Quality_Flag IN ('Y', 'N', 'W')), -- Y=Valid, N=Invalid, W=Warning

    Processing_Date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    Processing_Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    Source_System VARCHAR(50) NOT NULL DEFAULT 'ERP_CoreBanking',

    Record_Created_Date DATETIME NOT NULL DEFAULT GETDATE(),
    Record_Modified_Date DATETIME NOT NULL DEFAULT GETDATE(),

    -- Indexes
    INDEX IDX_LOAN_MEMBER ON LOAN(Member_ID),
    INDEX IDX_LOAN_PAYMENT_STATUS ON LOAN(Payment_Status),
    INDEX IDX_LOAN_TYPE ON LOAN(Loan_Type),
    INDEX IDX_LOAN_RISK_LEVEL ON LOAN(Risk_Level),
    INDEX IDX_LOAN_COLLATERAL_TYPE ON LOAN(Collateral_Type),
    INDEX IDX_LOAN_PROCESSING_DATE ON LOAN(Processing_Date DESC),

    -- Constraints
    CONSTRAINT CHK_DATES_LOGICAL CHECK (Origination_Date <= Maturity_Date)
);

-- Partitioning Strategy (for large implementations)
-- PARTITION BY RANGE(Processing_Date) BY MONTH for 7+ years retention
-- Enables faster archive/purge operations
```

**Record Count:** 10,000 - 50,000 per monthly load (cumulative: 1.2M+ over 7 years)
**Growth Rate:** ~15K records/month average (new loans + status updates)
**Update Frequency:** Monthly full refresh (truncate/reload pattern)
**Retention:** 7+ years for regulatory compliance

**Data Dictionary:**

| Column | Type | Size | NULL | Default | Purpose | Notes |
|---|---|---|---|---|---|---|
| Loan_ID | CHAR | 10 | No | | Primary identifier; 10-digit loan number | Immutable; never changes |
| Member_ID | CHAR | 10 | No | | Foreign key to borrower | Links to CREDIT_BUREAU via Member |
| Loan_Type | VARCHAR | 20 | No | | Product classification | Auto, Mortgage, Personal, etc. |
| Origination_Date | DATE | | No | | Loan funding date | Used for aging; immutable |
| Maturity_Date | DATE | | No | | Scheduled payoff | Can change on refi/modification |
| Original_Amount | DECIMAL | 12,2 | No | | Amount at funding | Baseline for loss severity |
| Current_Balance | DECIMAL | 12,2 | No | | Outstanding principal | Reconciles to GL; updates monthly |
| Interest_Rate | DECIMAL | 5,2 | No | | Annual percentage rate | Can be variable; updated on ARM reset |
| Payment_Frequency | VARCHAR | 20 | No | Monthly | Payment schedule | Most are Monthly (>95%) |
| Payment_Status | VARCHAR | 20 | No | Current | Delinquency status | Key filter/risk indicator |
| Days_Past_Due | INT | | Yes | | DPD count if delinquent | NULL if Current |
| Collateral_Type | VARCHAR | 20 | Yes | | Collateral classification | RE, Auto, Unsecured, etc. |
| Collateral_Value | DECIMAL | 12,2 | Yes | | Current appraised value | For LTV calculation |
| LTV_Ratio | DECIMAL | 5,2 | Yes | | Loan-to-value percentage | Calculated; updated monthly |
| Credit_Score | INT | | Yes | | FICO from bureau | From CREDIT_BUREAU_PROFILE |
| DTI_Ratio | DECIMAL | 5,2 | Yes | | Debt-to-income percentage | Recalculated annually |
| Risk_Score | DECIMAL | 5,2 | Yes | | Composite risk calculation | Bucketed into Risk_Level |
| Risk_Level | VARCHAR | 20 | Yes | | Risk classification | Low, Medium, High, Critical |
| Data_Quality_Flag | CHAR | 1 | No | Y | Record validation status | Y=Valid, N=Invalid, W=Warning |
| Processing_Date | DATE | | No | | Monthly cycle date | Used for historical trending |
| Processing_Timestamp | DATETIME | | No | | Row insert time | Audit trail |
| Source_System | VARCHAR | 50 | No | | Origin system | ERP_CoreBanking, etc. |
| Record_Created_Date | DATETIME | | No | | Audit trail creation | Never updated |
| Record_Modified_Date | DATETIME | | No | | Last update time | Updated on any change |

---

### TABLE: CHARGE_OFF_RECOVERY

**Tracks charge-offs and recovery activity; linked 1:1 with LOAN.**

```sql
CREATE TABLE mdpa_prod.CHARGE_OFF_RECOVERY (
    -- Primary Key
    Charge_Off_ID INT NOT NULL PRIMARY KEY,
        CONSTRAINT PK_CHARGEOFF PRIMARY KEY (Charge_Off_ID),

    -- Foreign Key
    Loan_ID CHAR(10) NOT NULL UNIQUE,
        CONSTRAINT FK_CHARGEOFF_LOAN FOREIGN KEY (Loan_ID)
        REFERENCES mdpa_prod.LOAN(Loan_ID),

    -- Charge-Off Attributes
    Charge_Off_Date DATE NOT NULL,
        CONSTRAINT CHK_CHARGEOFF_DATE CHECK (Charge_Off_Date <= CAST(GETDATE() AS DATE)),

    Charge_Off_Amount DECIMAL(12,2) NOT NULL,
        CONSTRAINT CHK_CHARGEOFF_AMT CHECK (Charge_Off_Amount >= 0),

    -- Recovery Tracking (Cumulative)
    Recovery_Amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        CONSTRAINT CHK_RECOVERY_AMT CHECK (Recovery_Amount >= 0),

    Principal_Recovered DECIMAL(12,2) NOT NULL DEFAULT 0,
        CONSTRAINT CHK_PRINCIPAL_RECOVERED CHECK (Principal_Recovered >= 0 AND Principal_Recovered <= Charge_Off_Amount),

    Interest_Recovered DECIMAL(12,2) NOT NULL DEFAULT 0,
        CONSTRAINT CHK_INTEREST_RECOVERED CHECK (Interest_Recovered >= 0),

    Recovery_Date DATE,
        CONSTRAINT CHK_RECOVERY_DATE CHECK (Recovery_Date IS NULL OR (Recovery_Date >= Charge_Off_Date AND Recovery_Date <= CAST(GETDATE() AS DATE))),

    Recovery_Transaction_Type VARCHAR(10),
        CONSTRAINT CHK_RECOVERY_TYPE CHECK (Recovery_Transaction_Type IS NULL OR Recovery_Transaction_Type IN
        ('COFR', 'NSF', 'GAP', 'REP', 'MAN', 'OTH')),

    Recovery_Flag CHAR(1) DEFAULT 'N',
        CONSTRAINT CHK_RECOVERY_FLAG CHECK (Recovery_Flag IN ('Y', 'N')),

    -- Audit Columns
    Processing_Date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    Processing_Timestamp DATETIME NOT NULL DEFAULT GETDATE(),

    Record_Created_Date DATETIME NOT NULL DEFAULT GETDATE(),
    Record_Modified_Date DATETIME NOT NULL DEFAULT GETDATE(),

    -- Indexes
    INDEX IDX_CHARGEOFF_LOAN ON CHARGE_OFF_RECOVERY(Loan_ID),
    INDEX IDX_CHARGEOFF_DATE ON CHARGE_OFF_RECOVERY(Charge_Off_Date DESC),
    INDEX IDX_CHARGEOFF_RECOVERY_FLAG ON CHARGE_OFF_RECOVERY(Recovery_Flag),
    INDEX IDX_CHARGEOFF_PROCESSING_DATE ON CHARGE_OFF_RECOVERY(Processing_Date DESC)
);
```

**Record Count:** 1,000 - 5,000 per month (active charge-offs only)
**Relationship:** 1:1 optional with LOAN (zero or one charge-off per loan)
**Update Pattern:** Append-only for recoveries; charge-off record created once at charge-off date
**Retention:** 7+ years (matches LOAN history)

---

### TABLE: PROPERTY_COLLATERAL

**Real estate collateral data; linked 1:1 with LOAN (for RE collateral only).**

```sql
CREATE TABLE mdpa_prod.PROPERTY_COLLATERAL (
    -- Primary Key
    Property_ID INT NOT NULL PRIMARY KEY,
        CONSTRAINT PK_PROPERTY PRIMARY KEY (Property_ID),

    -- Foreign Key (Optional; only for RE loans)
    Loan_ID CHAR(10),
        CONSTRAINT FK_PROPERTY_LOAN FOREIGN KEY (Loan_ID)
        REFERENCES mdpa_prod.LOAN(Loan_ID),

    -- Property Attributes
    Property_Address VARCHAR(255) NOT NULL,
        CONSTRAINT CHK_PROPERTY_ADDRESS CHECK (Property_Address IS NOT NULL AND LEN(TRIM(Property_Address)) > 0),

    Property_Zip VARCHAR(10),
    Property_State CHAR(2),

    Appraised_Value DECIMAL(12,2) NOT NULL,
        CONSTRAINT CHK_APPRAISED_VALUE CHECK (Appraised_Value >= 10000 AND Appraised_Value <= 5000000),

    Appraisal_Date DATE NOT NULL,
        CONSTRAINT CHK_APPRAISAL_DATE CHECK (Appraisal_Date <= CAST(GETDATE() AS DATE) AND Appraisal_Date >= '2000-01-01'),

    Market_Value_Trend VARCHAR(20),
        CONSTRAINT CHK_MARKET_TREND CHECK (Market_Value_Trend IS NULL OR Market_Value_Trend IN
        ('Up', 'Down', 'Stable', 'Unknown')),

    Appraisal_Compliance VARCHAR(20),
        CONSTRAINT CHK_APPRAISAL_COMPLIANCE CHECK (Appraisal_Compliance IN
        ('Current', 'Stale', 'Expired')),

    -- Audit Columns
    Processing_Date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    Processing_Timestamp DATETIME NOT NULL DEFAULT GETDATE(),

    Record_Created_Date DATETIME NOT NULL DEFAULT GETDATE(),
    Record_Modified_Date DATETIME NOT NULL DEFAULT GETDATE(),

    -- Indexes
    INDEX IDX_PROPERTY_LOAN ON PROPERTY_COLLATERAL(Loan_ID),
    INDEX IDX_PROPERTY_ZIP ON PROPERTY_COLLATERAL(Property_Zip),
    INDEX IDX_PROPERTY_STATE ON PROPERTY_COLLATERAL(Property_State),
    INDEX IDX_PROPERTY_APPRAISAL_DATE ON PROPERTY_COLLATERAL(Appraisal_Date DESC),
    INDEX IDX_PROPERTY_APPRAISAL_COMPLIANCE ON PROPERTY_COLLATERAL(Appraisal_Compliance)
);
```

**Record Count:** 3,000 - 10,000 per month (RE collateral loans only)
**Relationship:** 1:1 optional with LOAN; N:1 with Property (same property multiple loans)
**Update Pattern:** Quarterly appraisal updates
**Retention:** 7+ years (matches LOAN)

---

### TABLE: CREDIT_BUREAU_PROFILE

**TransUnion credit bureau data; N:1 with MEMBER (historical tracking).**

```sql
CREATE TABLE mdpa_prod.CREDIT_BUREAU_PROFILE (
    -- Primary Key
    Bureau_Profile_ID INT NOT NULL PRIMARY KEY,
        CONSTRAINT PK_BUREAU_PROFILE PRIMARY KEY (Bureau_Profile_ID),

    -- Foreign Key
    Member_ID CHAR(10) NOT NULL,
        CONSTRAINT FK_BUREAU_MEMBER FOREIGN KEY (Member_ID)
        REFERENCES mdpa_prod.MEMBER(Member_ID),

    -- Credit Profile Attributes
    Credit_Score INT NOT NULL,
        CONSTRAINT CHK_CREDIT_SCORE_RANGE CHECK (Credit_Score >= 300 AND Credit_Score <= 850),

    Score_Trend VARCHAR(20),
        CONSTRAINT CHK_SCORE_TREND CHECK (Score_Trend IS NULL OR Score_Trend IN
        ('Improving', 'Declining', 'Stable', 'Unknown')),

    Public_Records_Count INT NOT NULL DEFAULT 0,
        CONSTRAINT CHK_PUBLIC_RECORDS CHECK (Public_Records_Count >= 0 AND Public_Records_Count <= 99),

    Active_Accounts INT NOT NULL DEFAULT 0,
        CONSTRAINT CHK_ACTIVE_ACCOUNTS CHECK (Active_Accounts >= 0 AND Active_Accounts <= 99),

    Total_Revolving_Balance DECIMAL(12,2) NOT NULL DEFAULT 0,
        CONSTRAINT CHK_REVOLVING_BALANCE CHECK (Total_Revolving_Balance >= 0 AND Total_Revolving_Balance <= 9999999.99),

    Last_Update_Date DATE NOT NULL,
        CONSTRAINT CHK_LAST_UPDATE_DATE CHECK (Last_Update_Date <= CAST(GETDATE() AS DATE)),

    Data_Quality_Flag CHAR(1) DEFAULT 'Y' NOT NULL,
        CONSTRAINT CHK_BUREAU_DQ_FLAG CHECK (Data_Quality_Flag IN ('Y', 'N', 'W')),

    -- Audit Columns
    Processing_Date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    Processing_Timestamp DATETIME NOT NULL DEFAULT GETDATE(),

    Record_Created_Date DATETIME NOT NULL DEFAULT GETDATE(),
    Record_Modified_Date DATETIME NOT NULL DEFAULT GETDATE(),

    -- Indexes
    INDEX IDX_BUREAU_MEMBER ON CREDIT_BUREAU_PROFILE(Member_ID, Processing_Date DESC),
    INDEX IDX_BUREAU_CREDIT_SCORE ON CREDIT_BUREAU_PROFILE(Credit_Score),
    INDEX IDX_BUREAU_PUBLIC_RECORDS ON CREDIT_BUREAU_PROFILE(Public_Records_Count),
    INDEX IDX_BUREAU_LAST_UPDATE ON CREDIT_BUREAU_PROFILE(Last_Update_Date DESC),
    INDEX IDX_BUREAU_PROCESSING_DATE ON CREDIT_BUREAU_PROFILE(Processing_Date DESC)
);
```

**Record Count:** 8,000 - 40,000 per month (member subset)
**Relationship:** N:1 with MEMBER (current + 24-month history retained)
**Update Pattern:** Monthly refresh; historical versions retained for audit
**Retention:** 24 months rolling (2-year history)
**Reporting Lag:** 2 days from TransUnion

---

### TABLE: PORTFOLIO_MONTHLY_SUMMARY

**Aggregated portfolio-level KPIs; one row per month.**

```sql
CREATE TABLE mdpa_prod.PORTFOLIO_MONTHLY_SUMMARY (
    -- Primary Key
    Summary_ID INT NOT NULL PRIMARY KEY,

    Processing_Date DATE NOT NULL UNIQUE,
        CONSTRAINT PK_SUMMARY PRIMARY KEY (Processing_Date),

    -- Portfolio Counts
    Total_Loans INT NOT NULL,
    Current_Loans INT NOT NULL,
    Delinquent_Loans INT NOT NULL,
    Charged_Off_Loans INT NOT NULL,
    Paid_Off_Loans INT NOT NULL,

    -- Portfolio Balances
    Portfolio_Balance DECIMAL(15,2) NOT NULL,
    Current_Loans_Balance DECIMAL(15,2) NOT NULL,
    Delinquent_Balance DECIMAL(15,2) NOT NULL,
    Charged_Off_Balance DECIMAL(15,2) NOT NULL,

    -- Key Metrics
    Average_Interest_Rate DECIMAL(5,2) NOT NULL,
    Weighted_Average_Interest_Rate DECIMAL(5,2) NOT NULL,

    Delinquency_Rate DECIMAL(5,2) NOT NULL,
        CONSTRAINT CHK_DELINQUENCY_RATE CHECK (Delinquency_Rate >= 0 AND Delinquency_Rate <= 100),

    Charge_Off_Rate DECIMAL(5,2) NOT NULL,
        CONSTRAINT CHK_CHARGEOFF_RATE CHECK (Charge_Off_Rate >= 0 AND Charge_Off_Rate <= 100),

    Recovery_Count INT NOT NULL DEFAULT 0,
    Recovery_Amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    Recovery_Rate DECIMAL(5,2),
        CONSTRAINT CHK_RECOVERY_RATE CHECK (Recovery_Rate IS NULL OR (Recovery_Rate >= 0 AND Recovery_Rate <= 200)),

    -- Quality Metrics
    Data_Quality_Score DECIMAL(5,2) NOT NULL,
        CONSTRAINT CHK_OVERALL_DQ CHECK (Data_Quality_Score >= 0 AND Data_Quality_Score <= 100),

    Processing_Duration_Minutes DECIMAL(7,2) NOT NULL,
    Error_Count INT NOT NULL DEFAULT 0,
    Exception_Count INT NOT NULL DEFAULT 0,

    -- Audit
    Record_Created_Date DATETIME NOT NULL DEFAULT GETDATE(),
    Processing_Timestamp DATETIME NOT NULL DEFAULT GETDATE(),

    -- Indexes
    INDEX IDX_SUMMARY_DATE ON PORTFOLIO_MONTHLY_SUMMARY(Processing_Date DESC),
    INDEX IDX_SUMMARY_DELINQUENCY ON PORTFOLIO_MONTHLY_SUMMARY(Delinquency_Rate DESC)
);
```

**Record Count:** 1 per month (12 per year)
**Retention:** 7+ years
**Purpose:** Aggregate reporting, trend analysis, KPI tracking

---

## Staging Tables (Pipeline Processing)

### TABLE: STG_LOAN_RAW

**Temporary table for raw input validation and cleansing.**

```sql
CREATE TABLE mdpa_staging.STG_LOAN_RAW (
    -- Raw input columns (exact from source file)
    Loan_ID VARCHAR(20),
    Member_ID VARCHAR(20),
    Loan_Type VARCHAR(50),
    Origination_Date VARCHAR(20),
    Maturity_Date VARCHAR(20),
    Original_Amount VARCHAR(20),
    Current_Balance VARCHAR(20),
    Interest_Rate VARCHAR(20),
    Payment_Frequency VARCHAR(50),
    Payment_Status VARCHAR(50),
    Days_Past_Due VARCHAR(20),
    Collateral_Type VARCHAR(50),
    Collateral_Value VARCHAR(20),
    Credit_Score VARCHAR(20),
    DTI_Ratio VARCHAR(20),

    -- Processing Columns
    Row_Number INT IDENTITY(1,1),
    Processing_Batch_ID INT NOT NULL,
    Processing_Timestamp DATETIME NOT NULL DEFAULT GETDATE(),

    Validation_Status VARCHAR(20) DEFAULT 'PENDING',
        CONSTRAINT CHK_VALIDATION_STATUS CHECK (Validation_Status IN
        ('PENDING', 'VALID', 'INVALID', 'WARNING', 'DUPLICATE')),

    Validation_Errors VARCHAR(MAX),

    INDEX IDX_STG_LOAN_VALIDATION ON STG_LOAN_RAW(Validation_Status),
    INDEX IDX_STG_LOAN_BATCH ON STG_LOAN_RAW(Processing_Batch_ID)
);

-- Lifecycle: Loaded → Validated → Transformed → Cleared after successful completion
-- Retention: 30 days for troubleshooting, then purged
```

---

### TABLE: STG_PROCESSING_METRICS

**Workflow execution metrics and audit trail.**

```sql
CREATE TABLE mdpa_staging.STG_PROCESSING_METRICS (
    Metric_ID INT NOT NULL PRIMARY KEY,
        CONSTRAINT PK_METRICS PRIMARY KEY (Metric_ID),

    Processing_Batch_ID INT NOT NULL UNIQUE,
    Processing_Date DATE NOT NULL,
    Processing_Stage VARCHAR(50) NOT NULL,

    Stage_Start_Time DATETIME NOT NULL,
    Stage_End_Time DATETIME NOT NULL,
    Stage_Duration_Seconds INT NOT NULL,

    Records_Processed INT NOT NULL,
    Records_Valid INT NOT NULL,
    Records_Invalid INT NOT NULL,
    Records_Warning INT NOT NULL,
    Records_Duplicates INT NOT NULL,

    Errors_Critical INT NOT NULL DEFAULT 0,
    Errors_High INT NOT NULL DEFAULT 0,
    Errors_Medium INT NOT NULL DEFAULT 0,

    Data_Quality_Score DECIMAL(5,2),

    Processing_Status VARCHAR(20) DEFAULT 'IN_PROGRESS',
        CONSTRAINT CHK_PROCESSING_STATUS CHECK (Processing_Status IN
        ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'ROLLED_BACK')),

    Error_Message VARCHAR(MAX),

    Record_Created_Date DATETIME NOT NULL DEFAULT GETDATE(),

    INDEX IDX_METRICS_DATE ON STG_PROCESSING_METRICS(Processing_Date DESC),
    INDEX IDX_METRICS_STAGE ON STG_PROCESSING_METRICS(Processing_Stage)
);
```

---

## Archive Tables (Historical Retention)

### TABLE: LOAN_HISTORY

**Immutable archive of all loans with 7+ year retention.**

```sql
CREATE TABLE mdpa_archive.LOAN_HISTORY (
    -- All columns from mdpa_prod.LOAN
    Loan_ID CHAR(10) NOT NULL,
    Member_ID CHAR(10) NOT NULL,
    Loan_Type VARCHAR(20) NOT NULL,
    Origination_Date DATE NOT NULL,
    Maturity_Date DATE NOT NULL,
    Original_Amount DECIMAL(12,2) NOT NULL,
    Current_Balance DECIMAL(12,2) NOT NULL,
    Interest_Rate DECIMAL(5,2) NOT NULL,
    Payment_Status VARCHAR(20) NOT NULL,
    Days_Past_Due INT,
    Risk_Level VARCHAR(20),
    Processing_Date DATE NOT NULL,

    -- Archive-Specific Columns
    Archive_Date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    Archive_Period VARCHAR(20) NOT NULL, -- YYYY-MM format
    Archive_Batch_ID INT NOT NULL,

    -- Checksums
    Input_File_Hash CHAR(64), -- SHA256 hash
    Output_File_Hash CHAR(64), -- SHA256 hash

    -- Indexes
    INDEX IDX_ARCHIVE_LOAN ON LOAN_HISTORY(Loan_ID),
    INDEX IDX_ARCHIVE_PERIOD ON LOAN_HISTORY(Archive_Period),
    INDEX IDX_ARCHIVE_DATE ON LOAN_HISTORY(Archive_Date)
);

-- Partitioning Strategy: BY MONTH (Processing_Date)
-- Retention: 7+ years (84 partitions; 1 per month)
-- Immutable: INSERT only; no UPDATE/DELETE
```

---

## Index Strategy

### Primary Indexes (Query Performance)

| Table | Index Name | Columns | Purpose | Query Pattern |
|---|---|---|---|---|
| LOAN | PK_LOAN | Loan_ID | Uniqueness & primary access | BY Loan_ID |
| LOAN | IDX_LOAN_MEMBER | Member_ID | Member-level reporting | Join to MEMBER/BUREAU |
| LOAN | IDX_LOAN_PAYMENT_STATUS | Payment_Status | Risk segmentation | WHERE Payment_Status IN (...) |
| LOAN | IDX_LOAN_RISK_LEVEL | Risk_Level | Portfolio analysis | GROUP BY Risk_Level |
| LOAN | IDX_LOAN_PROCESSING_DATE | Processing_Date DESC | Monthly trending | WHERE Processing_Date >= '2026-02-01' |
| CHARGE_OFF_RECOVERY | FK_CHARGEOFF_LOAN | Loan_ID | 1:1 join enforcement | JOIN on Loan_ID |
| CHARGE_OFF_RECOVERY | IDX_CHARGEOFF_DATE | Charge_Off_Date DESC | Historical analysis | WHERE Charge_Off_Date BETWEEN ... |
| PROPERTY_COLLATERAL | IDX_PROPERTY_APPRAISAL_COMPLIANCE | Appraisal_Compliance | Compliance monitoring | WHERE Appraisal_Compliance = 'Stale' |
| CREDIT_BUREAU_PROFILE | IDX_BUREAU_MEMBER | (Member_ID, Processing_Date DESC) | Current profile lookup | WHERE Member_ID = X ORDER BY Processing_Date DESC |
| PORTFOLIO_MONTHLY_SUMMARY | IDX_SUMMARY_DATE | Processing_Date DESC | KPI trending | ORDER BY Processing_Date DESC LIMIT 12 |

### Covering Indexes (Additional Performance)

```sql
-- Examples for frequently accessed column combinations:
CREATE INDEX IDX_LOAN_STATUS_BALANCE ON mdpa_prod.LOAN(Payment_Status, Current_Balance);
CREATE INDEX IDX_LOAN_TYPE_BALANCE ON mdpa_prod.LOAN(Loan_Type, Current_Balance);
CREATE INDEX IDX_LOAN_COLLATERAL_LTV ON mdpa_prod.LOAN(Collateral_Type, LTV_Ratio);
```

---

## Constraints & Data Integrity

### Primary Key Constraints
- **LOAN.Loan_ID:** UNIQUE, NOT NULL (10-digit identifier)
- **CHARGE_OFF_RECOVERY.Loan_ID:** UNIQUE (1:1 relationship enforced)
- **PORTFOLIO_MONTHLY_SUMMARY.Processing_Date:** UNIQUE (one summary per month)

### Foreign Key Constraints
- **LOAN.Member_ID** → MEMBER.Member_ID (enforces member exists)
- **CHARGE_OFF_RECOVERY.Loan_ID** → LOAN.Loan_ID (enforces loan exists)
- **PROPERTY_COLLATERAL.Loan_ID** → LOAN.Loan_ID (optional; RE loans only)
- **CREDIT_BUREAU_PROFILE.Member_ID** → MEMBER.Member_ID (enforces member exists)

### Check Constraints (Data Validation)
- Date ranges: Origination_Date ≤ Current_Date, Maturity_Date > Origination_Date
- Numeric ranges: Current_Balance [0, Original_Amount], Credit_Score [300, 850]
- Valid values: Payment_Status IN (enumerated list), Loan_Type IN (enumerated list)
- Logical constraints: Current_Balance ≤ Original_Amount, Recovery_Amount ≥ Principal_Recovered

### Unique Constraints
- LOAN.Loan_ID (primary key)
- CHARGE_OFF_RECOVERY.Loan_ID (1:1 relationship)
- PORTFOLIO_MONTHLY_SUMMARY.Processing_Date (one summary per month)

---

## Calculated Columns / Computed Columns

```sql
-- SQL Server COMPUTED COLUMN examples:

ALTER TABLE mdpa_prod.LOAN ADD
    Age_of_Loan_Days AS DATEDIFF(DAY, Origination_Date, CAST(GETDATE() AS DATE)),
    Months_to_Maturity AS DATEDIFF(MONTH, CAST(GETDATE() AS DATE), Maturity_Date),
    LTV_Ratio AS CASE
        WHEN Collateral_Value > 0 THEN (Current_Balance / Collateral_Value) * 100
        ELSE NULL
    END,
    Risk_Score AS CASE
        WHEN Credit_Score IS NOT NULL AND DTI_Ratio IS NOT NULL
        THEN ((100 - (Credit_Score / 10.0)) * (DTI_Ratio / 100.0) * (DATEDIFF(DAY, Origination_Date, CAST(GETDATE() AS DATE)) / 365.0))
        ELSE NULL
    END;
```

---

## Stored Procedures (Key Operations)

### PROCEDURE: usp_Load_LOAN_Stage

**Loads raw loan data from CSV into staging table with validation.**

```sql
CREATE PROCEDURE mdpa_staging.usp_Load_LOAN_Stage
    @batch_id INT,
    @source_file_path VARCHAR(255)
AS
BEGIN
    -- 1. Bulk insert from CSV
    BULK INSERT mdpa_staging.STG_LOAN_RAW
    FROM @source_file_path
    WITH (FIELDTERMINATOR = ',', ROWTERMINATOR = '\n');

    -- 2. Mark all records as PENDING for validation
    UPDATE mdpa_staging.STG_LOAN_RAW
    SET Processing_Batch_ID = @batch_id,
        Validation_Status = 'PENDING'
    WHERE Processing_Batch_ID IS NULL;

    -- 3. Run validation checks
    EXEC mdpa_staging.usp_Validate_LOAN_Data @batch_id;
END;
```

### PROCEDURE: usp_Validate_LOAN_Data

**Validates staged loan data against business rules.**

```sql
CREATE PROCEDURE mdpa_staging.usp_Validate_LOAN_Data
    @batch_id INT
AS
BEGIN
    -- Check 1: Required fields
    UPDATE mdpa_staging.STG_LOAN_RAW
    SET Validation_Status = 'INVALID',
        Validation_Errors = CONCAT(Validation_Errors, 'Missing Loan_ID; ')
    WHERE Processing_Batch_ID = @batch_id
    AND (Loan_ID IS NULL OR LEN(TRIM(Loan_ID)) = 0);

    -- Check 2: Loan_ID format (10 digits)
    UPDATE mdpa_staging.STG_LOAN_RAW
    SET Validation_Status = 'INVALID',
        Validation_Errors = CONCAT(Validation_Errors, 'Invalid Loan_ID format; ')
    WHERE Processing_Batch_ID = @batch_id
    AND Loan_ID NOT LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]';

    -- Check 3: Loan_ID uniqueness (no duplicates)
    UPDATE mdpa_staging.STG_LOAN_RAW
    SET Validation_Status = 'DUPLICATE',
        Validation_Errors = CONCAT(Validation_Errors, 'Duplicate Loan_ID; ')
    WHERE Processing_Batch_ID = @batch_id
    AND Loan_ID IN (SELECT Loan_ID FROM mdpa_staging.STG_LOAN_RAW
                    WHERE Processing_Batch_ID = @batch_id
                    GROUP BY Loan_ID HAVING COUNT(*) > 1);

    -- Check 4: Date validation
    UPDATE mdpa_staging.STG_LOAN_RAW
    SET Validation_Status = 'INVALID',
        Validation_Errors = CONCAT(Validation_Errors, 'Invalid Origination_Date; ')
    WHERE Processing_Batch_ID = @batch_id
    AND (TRY_CONVERT(DATE, Origination_Date) IS NULL
         OR TRY_CONVERT(DATE, Origination_Date) > CAST(GETDATE() AS DATE));

    -- ... additional validation checks ...

    -- Mark all non-invalid as VALID
    UPDATE mdpa_staging.STG_LOAN_RAW
    SET Validation_Status = 'VALID'
    WHERE Processing_Batch_ID = @batch_id
    AND Validation_Status = 'PENDING';
END;
```

### PROCEDURE: usp_Load_Production_LOAN

**Loads validated data from staging to production.**

```sql
CREATE PROCEDURE mdpa_prod.usp_Load_Production_LOAN
    @batch_id INT
AS
BEGIN
    BEGIN TRANSACTION;

    TRY
        -- Truncate current month's data (monthly full refresh pattern)
        DELETE FROM mdpa_prod.LOAN
        WHERE Processing_Date = CAST(GETDATE() AS DATE);

        -- Insert validated records
        INSERT INTO mdpa_prod.LOAN (
            Loan_ID, Member_ID, Loan_Type, Origination_Date, Maturity_Date,
            Original_Amount, Current_Balance, Interest_Rate, Payment_Frequency,
            Payment_Status, Days_Past_Due, Collateral_Type, Collateral_Value,
            Credit_Score, DTI_Ratio, Data_Quality_Flag, Processing_Date,
            Processing_Timestamp, Source_System
        )
        SELECT
            CAST(Loan_ID AS CHAR(10)),
            CAST(Member_ID AS CHAR(10)),
            CAST(Loan_Type AS VARCHAR(20)),
            TRY_CONVERT(DATE, Origination_Date),
            TRY_CONVERT(DATE, Maturity_Date),
            TRY_CONVERT(DECIMAL(12,2), Original_Amount),
            TRY_CONVERT(DECIMAL(12,2), Current_Balance),
            TRY_CONVERT(DECIMAL(5,2), Interest_Rate),
            CAST(COALESCE(Payment_Frequency, 'Monthly') AS VARCHAR(20)),
            CAST(Payment_Status AS VARCHAR(20)),
            TRY_CONVERT(INT, Days_Past_Due),
            CAST(Collateral_Type AS VARCHAR(20)),
            TRY_CONVERT(DECIMAL(12,2), Collateral_Value),
            TRY_CONVERT(INT, Credit_Score),
            TRY_CONVERT(DECIMAL(5,2), DTI_Ratio),
            'Y',
            CAST(GETDATE() AS DATE),
            GETDATE(),
            'ERP_CoreBanking'
        FROM mdpa_staging.STG_LOAN_RAW
        WHERE Processing_Batch_ID = @batch_id
        AND Validation_Status = 'VALID';

        -- Clear staging table
        DELETE FROM mdpa_staging.STG_LOAN_RAW
        WHERE Processing_Batch_ID = @batch_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        RAISERROR('Load failed: %s', 16, 1, ERROR_MESSAGE());
    END CATCH
END;
```

---

## Data Retention & Archive Strategy

| Table | Retention | Partitioning | Archive Frequency | Purge | Notes |
|---|---|---|---|---|---|
| **LOAN** | 7+ years | BY MONTH | Monthly | After 7 years | Regulatory requirement; HIPAA/GLBA compliance |
| **CHARGE_OFF_RECOVERY** | 7+ years | BY MONTH | Monthly | After 7 years | Matches LOAN retention |
| **PROPERTY_COLLATERAL** | 7+ years | BY MONTH | Monthly | After 7 years | Matches LOAN retention |
| **CREDIT_BUREAU_PROFILE** | 24 months | BY MONTH (rolling) | Monthly | After 24 months | Rolling 2-year window; reduce size |
| **PORTFOLIO_MONTHLY_SUMMARY** | 7+ years | BY YEAR | Quarterly | After 7 years | Aggregate; smaller footprint |
| **STG_LOAN_RAW** | 30 days | None | N/A | After 30 days | Troubleshooting only |
| **STG_PROCESSING_METRICS** | 90 days | BY MONTH | Monthly | After 90 days | Audit trail; size management |
| **LOAN_HISTORY** | 7+ years | BY MONTH | Monthly | Never | Immutable archive; compliance |

---

## Performance Considerations

### Query Optimization
- **Loan lookups:** Use Loan_ID (PK) for O(1) access
- **Member analysis:** Index on Member_ID for efficient joins
- **Portfolio reporting:** Leverage PORTFOLIO_MONTHLY_SUMMARY to avoid full aggregations
- **Risk analysis:** Use IDX_LOAN_RISK_LEVEL for risk bucket filtering
- **Delinquency trends:** Use IDX_LOAN_PROCESSING_DATE for time-series queries

### Partitioning Strategy
- **Partition key:** Processing_Date (monthly partitions)
- **Benefit:** Fast archive/purge operations; parallel scan on historical queries
- **Example:** Query for 2025-01 data scans only Jan 2025 partition

### Statistics & Maintenance
```sql
-- Monthly maintenance jobs
UPDATE STATISTICS mdpa_prod.LOAN;
DBCC SHOW_STATISTICS (mdpa_prod.LOAN, IDX_LOAN_PAYMENT_STATUS);
ALTER INDEX ALL ON mdpa_prod.LOAN REBUILD;
ALTER INDEX ALL ON mdpa_prod.LOAN REORGANIZE;
```

---

## Cross-Reference to Other Documentation

- **Logical Model:** See [10_LOGICAL_DATA_MODEL.md](10_LOGICAL_DATA_MODEL.md) for conceptual entities
- **Business Glossary:** See [9_BUSINESS_DATA_GLOSSARY.md](9_BUSINESS_DATA_GLOSSARY.md) for field definitions
- **Data Lineage:** See [6_FIELD_MAPPING_AND_DATA_LINEAGE.md](6_FIELD_MAPPING_AND_DATA_LINEAGE.md) for transformations
- **Quality Standards:** See [9_BUSINESS_DATA_GLOSSARY.md](9_BUSINESS_DATA_GLOSSARY.md) for validation rules
- **Workflow Details:** See [1_MDPA_PROCESS_DOCUMENTATION.md](1_MDPA_PROCESS_DOCUMENTATION.md) for 7-stage pipeline
- **Architecture:** See [2_WORKFLOW_ARCHITECTURE.md](2_WORKFLOW_ARCHITECTURE.md) for tool-level processing
