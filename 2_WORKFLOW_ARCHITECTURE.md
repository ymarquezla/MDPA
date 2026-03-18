# MDPA Workflow Architecture

**Document Version:** 1.0
**Last Updated:** 2026-03-11
**Based On:** Analysis of 2020_DataProcess_v5.2.yxmd

---

## Executive Summary

The MDPA system consists of **ONE primary Alteryx workflow** that functions as a data processing **engine**. It is:
- Called/orchestrated by a **TTA Web Portal** via Alteryx Gallery API
- Triggered on-demand or scheduled monthly
- Parameterized via **JSON input** to process different credit union data
- Produces outputs visible in **Tableau dashboards** and as **client files**

**No chained/dependent workflows found** - this is a single monolithic workflow.

---

## Workflow Inventory

### Primary Workflow

**File Name:** `2020_DataProcess_v5.2.yxmd`
**Format:** Alteryx Desktop Workflow (.yxmd)
**Size:** 6 MB (49,082 lines XML)
**Tools:** 300+ (67 Select, 60 Formula, 27 Filter, 24 Union, 24 Summarize, 21 Join, etc.)

**Workflow IDs:**
```
Current ID:   de10921b-8c69-4057-ab96-d5f411e4129e
Previous ID:  53624fc9-1399-48da-a4ac-555debb40f42
Origin ID:    53624fc9-1399-48da-a4ac-555debb40f42
```

**Version History:**
- **2020-05-20** - Added Formula Tool (746) to prioritize loan file data over impairment file data
- **2022-08-05** - Added "Years until Charge off" formula tool (860) for Tableau reporting
- **2022-11-09** - Added bypass for prior period data to avoid recomputation; kept vintage values static
- **[Later dates]** - Added Vintage Adjustment and Vintage Adjusted Expected Losses fields
- **Current** - Version 5.2 (as of upload date)

---

## System Architecture

### High-Level Workflow Topology

```
┌─────────────────────────────────────────────────────────┐
│          TTA WEB PORTAL / GALLERY                       │
│    (Entry point - user submits monthly data)            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Gallery API Call
                   │ (Passes JSON parameters)
                   ▼
┌─────────────────────────────────────────────────────────┐
│   ALTERYX GALLERY / SERVER                              │
│   (Workflow execution environment)                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Execute Workflow
                   ▼
┌─────────────────────────────────────────────────────────┐
│   2020_DataProcess_v5.2.yxmd                            │
│   (PRIMARY MDPA ENGINE WORKFLOW)                        │
│                                                         │
│   - Reads JSON input parameters                        │
│   - Loads monthly loan data from network shares        │
│   - Transforms via 300+ tools                          │
│   - Applies TTA proprietary model                      │
│   - Generates outputs                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
    ┌───────┐ ┌──────┐  ┌──────────┐
    │Client │ │YXDB  │  │Call      │
    │Files  │ │Files │  │Report    │
    │(YXDB) │ │      │  │Data      │
    └───────┘ └──────┘  └──────────┘
        │          │          │
        └──────────┼──────────┘
                   ▼
        ┌─────────────────────┐
        │  Tableau Data       │
        │  Extracts (TDE)     │
        └─────────────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │  TABLEAU DASHBOARDS │
        │  (User Reports)     │
        └─────────────────────┘
```

---

## Workflow Purpose & Function

### Primary Purpose
**"Behind the scenes data processing engine for the TTA web portal"**

Quoted from workflow documentation:
> "This workflow will be used as a behind the scene data processing engine for the TTA web portal. The portal will call on the Gallery API service calling this workflow and supply it with a JSON object which will be used to direct the workflow on how to process the varying files from each CU. The workflow is then processed through TTA's proprietary model and generates results to be reported within Tableau as well as a client file to reference prior period values on subsequent months."

### Key Functions

1. **Parameterized Processing**
   - Accepts JSON input from portal
   - Dynamically processes data for different credit unions
   - Routes based on institution parameters

2. **Data Integration**
   - Reads monthly loan files from network shares
   - Appends reference data (credit scores, PD models, participation records)
   - Reconciles prior period data

3. **Proprietary Calculations**
   - Applies TTA proprietary financial model
   - Calculates loan loss allowances
   - Computes peer comparison metrics
   - Generates risk metrics and classifications

4. **Quality Assurance**
   - Validates data at multiple stages (27 filter tools)
   - Identifies and isolates dropped/invalid records
   - Maintains audit trail of excluded records

5. **Multi-Format Output**
   - Binary Alteryx format (.yxdb) for client files
   - Tableau Data Extracts (.tde) for dashboard visualization
   - Regulatory data (Call Report format)
   - Temporary working tables for internal processing

---

## Input Methods

### Method 1: TTA Web Portal (Primary)
- **Entry Point:** TTA Web Portal application
- **Trigger:** User uploads monthly data or clicks "Process"
- **Parameter Delivery:** JSON object via Gallery API
- **Scheduling:** On-demand or scheduled monthly
- **Parameters Passed:**
  - Credit Union/Peer ID
  - Report date
  - File locations/names
  - Processing options/flags
  - Calculation parameters

### Method 2: Manual Alteryx Desktop (Backup)
- **File:** Open `2020_DataProcess_v5.2.yxmd` directly in Alteryx Designer
- **Configuration:** Set parameters manually or via questions
- **Use Case:** Testing, ad-hoc runs, troubleshooting

### Method 3: Gallery API Direct (Advanced)
- **Host:** Alteryx Gallery/Server
- **Authentication:** API credentials
- **Trigger:** External systems can call via REST API
- **Example:** Scheduling tool, orchestration platform

---

## Workflow Inputs (Detailed)

### JSON Input Parameter
**Tool:** "JSON_Input" (TextBox)
- **Format:** JSON object
- **Delivery:** TTA Portal passes via Gallery API
- **Contains:**
  - Institution/Peer number
  - Report date (current period)
  - File paths for monthly data
  - Processing flags
  - Calculation parameters

**Example Structure (inferred):**
```json
{
  "PeerNo": "1234",
  "ReportDate": "2026-03-31",
  "LoanFilePath": "\\10.2.7.56\\Shared\\PortfolioAnalysis\\01_CU_Files\\INST_1234\\",
  "OutputFolder": "\\10.2.7.56\\Shared\\PortfolioAnalysis\\03_Results\\01_CLIENT_FILES\\",
  "ProcessingFlags": {
    "recalculate_prior": false,
    "include_participations": true
  }
}
```

### Data Files
See `DATA_SOURCES_AND_LOCATIONS.md` for complete list:
- Loan portfolio files (monthly)
- Reference tables (credit scores, NAICS, PD models)
- Macro parameter files
- Prior period client files (for comparison)

---

## Workflow Outputs

### Output 1: Client Files (PRIMARY)
**Location:** `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\01_CLIENT_FILES\`
**Naming:** `[PeerNo]_[YYYYMMDD]_CLIENT_FILE.yxdb`
**Format:** Alteryx binary (.yxdb)
**Consumers:** End users, downstream analysis
**Contains:**
- Processed loan records with all calculated fields
- Peer group assignments
- Risk classifications
- Allowance amounts
- All enhanced/transformed fields

### Output 2: Tableau Extracts
**Location:** `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\02_TDE\`
**Naming:** `[PeerNo]_[YYYYMMDD]_CLIENT_FILE.tde`
**Format:** Tableau Data Extract (.tde)
**Consumers:** Tableau dashboards, portal analytics
**Use:** Fast refresh for dashboard rendering

### Output 3: Quality Assurance Files
**Location:** `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\06_DROP_RECORDS\`
**Naming:** `[PeerNo]_[YYYYMMDD]_DROPPED_RECORDS.yxdb`
**Format:** Alteryx binary (.yxdb)
**Purpose:** Records that failed validation or filtering
**Consumers:** QA, audit, investigation

### Output 4: Regulatory Data
**Location:** `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\`
**File:** `CallReportDataShort.yxdb`
**Format:** Alteryx binary (.yxdb)
**Purpose:** Call Report (FFIEC) regulatory submission
**Consumers:** Regulatory reporting team

### Output 5: Intermediate/Working Files
**Location:** `\\10.2.7.56\Shared\PortfolioAnalysis\99_References\`
**Files:**
- `LoanFileTmp.yxdb` - Loan records in-process
- `ImpairedLoanTmp.yxdb` - Impaired loans subset
- `ChargeOffTmp.yxdb` - Charge-offs subset
- `SecuritiesTmp.yxdb` - Securities portfolio subset
**Lifespan:** Temporary (can be cleaned up post-run)
**Purpose:** Intermediate processing stages

---

## Related Systems

### TTA Web Portal
- **Purpose:** User interface for monthly submissions
- **Function:**
  - Uploads monthly CU data files
  - Submits JSON parameters to MDPA workflow
  - Tracks workflow execution status
  - Displays processing results
  - Routes outputs to users

### Alteryx Gallery / Server
- **Purpose:** Execution environment
- **Function:**
  - Hosts the MDPA workflow
  - Exposes Gallery API for portal calls
  - Manages workflow scheduling
  - Logs execution history
  - Stores published workflows

### Tableau Dashboards
- **Purpose:** Analytics and reporting UI
- **Data Source:** Tableau Data Extracts (.tde files)
- **Refresh:** After each MDPA monthly run
- **Consumers:** Business users, analysts, executives

### Network File Shares
- **Path:** `\\10.2.7.56\Shared`
- **Purpose:** Data staging, temporary files, final outputs
- **Components:** Input files, reference data, outputs

---

## Workflow Change History

### Known Modifications (from inline documentation)

| Date | Change | Tool | Reason |
|------|--------|------|--------|
| 2020-05-20 | Added field prioritization logic | Formula (746) | Resolve conflicts between loan and impairment files |
| 2022-08-05 | Added years-until-charge-off calculation | Formula (860) | Enable charge-off trend analysis in Tableau |
| 2022-11-09 | Bypass prior period recalculation | Control flow | Preserve vintage calculation accuracy |
| 2024+ | Added Vintage Adjustment fields | Formula | Improve loss estimation methodology |

### Version Control
- **Current:** v5.2 (in GitHub)
- **Previous:** v5.1 (implied by workflow IDs)
- **Original:** Original origin detected from 2020 timestamp
- **Repository:** GitHub `/ymarquezla/MDPA`

---

## No Chained/Dependent Workflows Found

### Investigation Results
✅ **Single Workflow Architecture Confirmed:**
- No `.yxmd` or `.yxwz` files referenced in MDPA workflow
- No "Run Workflow" tools (would invoke other workflows)
- No macro invocations to other workflows
- No async workflow calls

✅ **Dependencies Are External:**
- TTA Portal calls THIS workflow (not the reverse)
- Tableau refreshes FROM outputs (doesn't call workflow)
- No upstream data processing workflows
- No downstream transformation chains

✅ **Architecture: Monolithic Engine**
- Single workflow does ALL processing
- 300+ tools in one .yxmd file
- All logic contained within one execution context
- Outputs flow directly to files and Tableau

---

## Automation Implications

### Single Entry Point
- ONE workflow to schedule and orchestrate
- ONE set of inputs to manage (JSON parameters)
- ONE failure point to monitor
- ONE execution log to track

### Monitoring Points
1. **Input Stage:** Verify JSON parameters are valid
2. **Execution:** Track runtime, resource usage
3. **Output Stage:** Validate all output files created
4. **Quality:** Check dropped record counts

### Scaling Considerations
- **Parallel Execution:** Could run multiple instances (different CUs) simultaneously
- **Scheduling:** Serial monthly run OR parallel daily processing
- **Load Balancing:** Alteryx Server can distribute across multiple engines

---

## Recommendation: Future Modularization

### Current State: Monolithic (300+ tools)
- **Pros:** Single file to maintain, complete control flow visibility
- **Cons:** Large, complex, difficult to test, hard to modify

### Suggested Future Improvements
1. **Module 1: Data Ingestion**
   - Read loan files
   - Read reference data
   - Validate inputs
   - → Output: Cleaned input datasets

2. **Module 2: Transformation & Enrichment**
   - Field transformations
   - Data enrichment (credit scores, peer groups)
   - Calculations
   - → Output: Enhanced loan records

3. **Module 3: Quality & Filtering**
   - Apply business rules
   - Identify dropped records
   - Generate QA reports
   - → Output: Validated records + dropped records

4. **Module 4: Output Generation**
   - Format for client delivery
   - Generate Tableau extracts
   - Create regulatory reports
   - → Output: All final formats

**Benefits:**
- Easier to test individual modules
- Simpler to troubleshoot failures
- Clearer ownership and maintenance
- Enables parallel processing

---

## Summary

| Aspect | Detail |
|--------|--------|
| **Total Workflows** | 1 primary + 0 dependent |
| **File** | 2020_DataProcess_v5.2.yxmd |
| **Tools** | 300+ (mostly Select, Formula, Filter, Union, Summarize) |
| **Input Method** | JSON via TTA Portal Gallery API |
| **Trigger** | Monthly on-demand or scheduled |
| **Architecture** | Monolithic single-file engine |
| **Outputs** | Client files, Tableau extracts, QA records, Call Report data |
| **No Chaining** | ✅ Confirmed - no inter-workflow dependencies |
| **Scaling** | Alteryx Gallery supports parallel execution |

---

## Files Referenced

- `2020_DataProcess_v5.2.yxmd` — Main workflow
- `DATA_SOURCES_AND_LOCATIONS.md` — Input/output file paths
- `MDPA_PROCESS_DOCUMENTATION.md` — Detailed tool analysis
- GitHub: `https://github.com/ymarquezla/MDPA`

