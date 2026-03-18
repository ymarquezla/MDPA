# MDPA Data Sources & File Locations

**Document Version:** 1.0
**Last Updated:** 2026-03-11
**Based On:** Analysis of 2020_DataProcess_v5.2.yxmd Alteryx workflow

---

## Executive Summary

The MDPA workflow pulls data from a **shared network server** (\\10.2.7.56) with a highly organized folder structure. Data sources include:
- **Monthly loan portfolio files** from credit unions (01_CU_Files)
- **Reference/macro input files** for calculations
- **Temporary working files** (processed intermediate data)
- **Final output files** by peer/institution
- **Reference tables** for lookups and calculations

---

## Network Infrastructure

### Primary Server
- **Network Path:** `\\10.2.7.56\Shared`
- **Server IP:** 10.2.7.56
- **Access Type:** Windows network share (SMB/CIFS)
- **Data Volume:** Large (Alteryx .yxdb binary format + Excel files)

### Root Directory Structure
```
\\10.2.7.56\Shared\
├── PortfolioAnalysis/          (Main MDPA data)
├── Consulting_Client_Files/    (Client-specific data)
├── Prod/                        (Production outputs)
└── (other shared resources)
```

---

## Primary Folder Structure

### 1. PORTFOLIO ANALYSIS (`PortfolioAnalysis/`)
Main MDPA processing directory

#### **01_CU_Files/** - Credit Union Source Data
Monthly data files from credit unions/financial institutions
```
├── zz_Testing/
│   └── 02_Processed/
│       ├── XXXX_testAppend.yxdb         [Test data - appended records]
│       └── XXXX_vin.yxdb                [Test data - VIN-related]
└── [Institution Monthly Files]          [Active CU data files]
```

**File Format:** Alteryx binary (.yxdb) or Excel (.xlsx)
**Update Frequency:** Monthly
**Usage:** Primary loan portfolio source data

---

#### **02_TTA_Files/** - Transformation & Temporary Files
Data files used during transformation (TTA = Transformation, Temporary, Analysis)

**02_TTA_Files/00_MacroInputs/**
```
├── 5233_19000101_MacroParamInputs.xlsx  [Macro parameters - monthly refresh]
└── [Additional parameter files]
```
**Purpose:** Stores month-specific parameters, assumptions, calculations
**Update:** Monthly

**02_TTA_Files/01_AutoFiles/**
```
└── [Auto-generated intermediate files during processing]
```
**Purpose:** Automatic file generation during workflow execution
**Update:** Each workflow run

**02_TTA_Files/02_MortgageFiles/**
```
└── [Mortgage-specific loan data]
```
**Purpose:** Mortgage portfolio subset
**Update:** Monthly

**02_TTA_Files/03_CreditScore/**
```
└── TransUnion Masters by PeerNo/
    └── [Credit score/demographic data by institution]
```
**Purpose:** External credit score data from TransUnion
**Update:** Periodic (as provided by vendor)

**02_TTA_Files/05_Other/**
```
├── 0000_19001231_SECURITIES.yxdb               [Securities portfolio]
├── 0000_20170125_PROBABILITY OF DEFAULT.xlsx   [PD model reference]
├── CO Data SBA - Excel Version.xlsx             [SBA data]
└── NAICS PD_20190731.xlsx                      [NAICS probability of default]
```
**Purpose:** Reference and supplementary data files
**Update:** As needed (NAICS, PD models updated annually)

**02_TTA_Files/06_Participations/**
```
└── 0000_MASTER_PARTICIPATIONS.yxdb    [Loan participation data]
```
**Purpose:** Loan syndication/participation records
**Update:** Monthly

**02_TTA_Files/99_Templates/**
```
└── 0000_19000101_CURRENT RE MODEL.xlsx    [Real estate valuation model]
```
**Purpose:** Template/reference for RE calculations
**Update:** Periodic

---

#### **03_Results/** - Processing Output Files
Final and intermediate results organized by type

**03_Results/01_CLIENT_FILES/**
```
├── [PEER_ID]_[YYYYMMDD]_CLIENT_FILE.yxdb   [Main output file by institution]
└── [Multiple files per institution per run]
```
**Naming Convention:** `[PeerNo]_[DATETIMEFORMAT(Current Period,'%Y%m%d')]_CLIENT_FILE.yxdb`
**Frequency:** One file per institution per monthly run
**Purpose:** Primary deliverable - processed loan portfolio

**03_Results/02_TDE/**
```
└── [PEER_ID]_[YYYYMMDD]_CLIENT_FILE.tde    [Tableau Data Extract]
```
**Format:** Tableau Data Extract (.tde)
**Purpose:** Tableau reporting/visualization
**Update:** Monthly with CLIENT_FILES

**03_Results/06_DROP_RECORDS/**
```
├── [PEER_ID]_19000101_DROPPED RECORDS.yxdb   [Records excluded from processing]
└── Test.yxdb                                   [Test data]
```
**Purpose:** Quality assurance - records that failed validation
**Update:** Monthly

**03_Results/14_SECURITIES/**
```
├── [PEER_ID]_19000101_SECURITIES.yxdb   [Securities portfolio subset]
└── Test.yxdb                              [Test data]
```
**Purpose:** Securities-specific analysis
**Update:** Monthly

---

#### **99_References/** - Temporary Working Files
Intermediate files created during workflow execution
```
├── ChargeOffTmp.yxdb          [Charge-off records temporary table]
├── ImpairedLoanTmp.yxdb       [Impaired loan records temporary table]
├── LoanFileTmp.yxdb           [Full loan file temporary table]
└── SecuritiesTmp.yxdb         [Securities temporary table]
```
**Purpose:** Working tables - can be regenerated during processing
**Lifespan:** Temporary (cleaned up after successful run)
**Update:** Each workflow execution

---

### 2. CONSULTING CLIENT FILES (`Consulting_Client_Files/`)
Client-specific historical and supplementary data
```
├── 2020/
│   ├── 0009_DOVER/
│   │   └── 0009_Cycle_2019-09-30/
│   │       └── Client Source Files/
│   │           └── ChargeOffs 093019.xlsx    [Client charge-off data]
│   └── 0000_OTHER/
│       └── Alan/
│           └── Fair Lending Files/
│               └── Zip Code Ethnicity Index.csv    [Fair lending reference]
└── [Other client files by year/ID]
```
**Purpose:** Client-specific data, historical records, special analyses
**Update:** As needed per client

---

### 3. PRODUCTION OUTPUTS (`Prod/`)
Production-ready output files
```
└── Outputs/
    └── Call Report Files/
        └── Twb Data Source Files/
            └── CallReportDataShort.yxdb    [Call Report regulatory data]
```
**Purpose:** Regulatory reporting (Call Report - FFIEC)
**Update:** Monthly with MDPA processing

---

## Data Source Mapping

### Input Files (What the workflow reads)

| Data Element | Source Path | Format | Frequency | Owner |
|---|---|---|---|---|
| **Loan Portfolio** | `01_CU_Files/[Institution]` | YXDB/XLSX | Monthly | Each CU |
| **Macro Parameters** | `02_TTA_Files/00_MacroInputs/*_MacroParamInputs.xlsx` | XLSX | Monthly | Admin |
| **Mortgage Data** | `02_TTA_Files/02_MortgageFiles/` | YXDB | Monthly | Admin |
| **Credit Scores** | `02_TTA_Files/03_CreditScore/TransUnion Masters/` | YXDB | Periodic | TransUnion vendor |
| **Securities Data** | `02_TTA_Files/05_Other/0000_19001231_SECURITIES.yxdb` | YXDB | Annual | Admin |
| **PD Model** | `02_TTA_Files/05_Other/0000_20170125_PROBABILITY_OF_DEFAULT.xlsx` | XLSX | Annual | Risk/Analytics |
| **Participations** | `02_TTA_Files/06_Participations/0000_MASTER_PARTICIPATIONS.yxdb` | YXDB | Monthly | Admin |
| **RE Model Template** | `02_TTA_Files/99_Templates/0000_19000101_CURRENT_RE_MODEL.xlsx` | XLSX | Periodic | Admin |
| **Reference Lookups** | `02_TTA_Files/05_Other/NAICS_PD_20190731.xlsx` | XLSX | Annual | Admin |
| **Fair Lending Data** | `Consulting_Client_Files/[year]/[client]/Fair_Lending_Files/` | CSV | Periodic | Compliance |

### Output Files (What the workflow creates)

| Output Type | Output Path | Format | Frequency | Consumer |
|---|---|---|---|---|
| **Client Files** | `03_Results/01_CLIENT_FILES/[PEERID]_[DATE]_CLIENT_FILE.yxdb` | YXDB | Monthly | End users |
| **Tableau Extract** | `03_Results/02_TDE/[PEERID]_[DATE]_CLIENT_FILE.tde` | TDE | Monthly | Tableau dashboards |
| **Dropped Records** | `03_Results/06_DROP_RECORDS/[PEERID]_[DATE]_DROPPED_RECORDS.yxdb` | YXDB | Monthly | QA/Audit |
| **Securities Output** | `03_Results/14_SECURITIES/[PEERID]_[DATE]_SECURITIES.yxdb` | YXDB | Monthly | Analytics |
| **Call Report Data** | `Prod/Outputs/Call Report Files/CallReportDataShort.yxdb` | YXDB | Monthly | Regulatory |

---

## File Naming Conventions

### Standard Patterns

**Macro Parameter Files:**
```
[PEERID]_[YYYYMMDD]_MacroParamInputs.xlsx
Example: 5233_19000101_MacroParamInputs.xlsx
```

**Output Files (Client Files):**
```
[PeerNo]_[DATETIMEFORMAT(Current Period,'%Y%m%d')]_CLIENT_FILE.[yxdb|tde]
Example: 1234_20260311_CLIENT_FILE.yxdb
```

**Dropped Records:**
```
[PeerNo]_19000101_DROPPED_RECORDS.yxdb
```

**Securities Output:**
```
[PeerNo]_19000101_SECURITIES.yxdb
```

**Reference Files:**
```
0000_[YYYYMMDD]_[DESCRIPTION].xlsx or .yxdb
Example: 0000_19001231_SECURITIES.yxdb
```

---

## Data Dictionary - Key Fields in Files

### Loan Portfolio Files (01_CU_Files)
Includes fields from the SELECT tool (67 instances in workflow):
- **Loan Identifiers:** Loan ID, Account Number, Unique ID
- **Loan Characteristics:** Loan Type, Loan Description, Loan Source
- **Collateral:** Collateral Code, Collateral Description, VIN (for auto loans)
- **Borrower Info:** Name, CoBorrower Name, City, State, Zip, Address
- **Risk Metrics:** Current LTV, Payment Frequency Code
- **Classification Fields:** LoanAllowanceGroup, LoanSubgroup, PeerGroupCode, PeerGroupName
- **Status Fields:** External Status Code, TDR Status, Impairment Status
- **Custom Fields:** Custom String_1, Custom String_2
- **Administrative:** FileName, Report Date (added by workflow)

### Macro Parameter Files
- Month-specific assumptions
- Calculation parameters
- Adjustment factors
- Peer group definitions
- Model assumptions

---

## Monthly Data Load Process

### Typical Monthly Workflow

**1. Data Preparation (Before MDPA runs):**
   - Each institution deposits monthly loan file to `01_CU_Files/[Institution]/`
   - Format: Excel (.xlsx) or pre-processed Alteryx (.yxdb)
   - Timeline: Due by [TBD - 5 business days post month-end?]

**2. Macro Parameters Update:**
   - Admin updates `02_TTA_Files/00_MacroInputs/*_MacroParamInputs.xlsx`
   - Sets current period date
   - Updates month-specific assumptions

**3. Workflow Execution:**
   - Alteryx opens `2020_DataProcess_v5.2.yxmd`
   - Reads all input files from above locations
   - Creates temporary working files in `99_References/`
   - Processes loan records through 300+ transformation tools
   - Validates and filters records

**4. Output Generation:**
   - Creates `03_Results/01_CLIENT_FILES/[PEERID]_[DATE]_CLIENT_FILE.yxdb`
   - Creates `03_Results/02_TDE/[PEERID]_[DATE]_CLIENT_FILE.tde`
   - Generates `03_Results/06_DROP_RECORDS/` for failed records
   - Updates `Prod/Outputs/CallReportDataShort.yxdb`

**5. Delivery:**
   - Files available in `03_Results/01_CLIENT_FILES/` for end users
   - Tableau refreshes from `.tde` files
   - Call report data ready for regulatory submission

---

## Automation Considerations

### File Discovery
- Monitor `01_CU_Files/` for new monthly deposits
- Detect when institutions have uploaded their data
- Track which institutions have submitted

### Parameter Management
- Store macro parameters in version control (GitHub)
- Auto-update parameters from config file at runtime
- Track parameter changes by month

### Scheduling Points
- Check for input files: [Day TBD, typically 3 business days post month-end]
- Validate all required files present
- Trigger workflow if ready
- Monitor execution and catch errors

### Output Validation
- Record counts: Compare current month to prior month (-/+ threshold %)
- Dropped records: Alert if drop rate exceeds threshold
- File completeness: Verify all peer outputs generated
- Quality checks: Validate key metrics are within expected ranges

---

## Access & Security Considerations

### Network Access
- \\10.2.7.56 is shared network server
- Windows authentication (likely domain)
- May require VPN for remote access
- Firewall rules may restrict access

### Permissions
- Read-access needed: Input folders (01_CU_Files, 02_TTA_Files)
- Write-access needed: Output folders (03_Results, 99_References)
- Admin-access may be needed for: Macro parameters, Template updates

### Credentials for Automation
- Service account may be required
- Network share access credentials
- Database connection credentials (if applicable)
- Tableau Server credentials (for TDE uploads)

---

## Next Steps

1. **Confirm Current Month Process:**
   - When do institutions typically upload files?
   - What triggers the manual workflow run currently?
   - Who monitors the process?

2. **Validate File Paths:**
   - Confirm all paths are still current (some date from 2020)
   - Verify access permissions from automation server
   - Check network connectivity

3. **Database Connections:**
   - Identify any database connections (not found in XML)
   - Document source system credentials
   - Verify connection strings

4. **Identify Monthly Schedule:**
   - Confirm month-end close process
   - Determine optimal run date (3 business days after month-end)
   - Identify error handling procedures

5. **Automation Implementation:**
   - Set up file monitoring on `01_CU_Files/`
   - Create scheduled task/workflow orchestration
   - Build error notifications/alerts
   - Create audit logging

