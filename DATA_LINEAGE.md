# MDPA Data Lineage Map

**Generated:** 2026-03-19
**Workflow:** 2020_DataProcess_v5.2.yxmd (49,082 lines XML)
**Ground truth:** XML file is authoritative. Doc field names and formulas verified against XML.
**Phase 1 corrections applied:**
  - `Risk_Score` does not exist in XML — correct field is `Decision FICO Grade` (categorical A+/A/B/C/D/E)
  - `Net Charge Off Amount` uses conditional formula, not simple subtraction
  - 7-stage model (XML ToolContainer structure), not 5-stage model from doc 6
  - Vintage Adjustment values are pre-computed and carried in from prior period, not recalculated

---

## Part 1: Source Systems and Input Fields

### 1.1 Source 1: Loan Portfolio (CU-Uploaded Files via DynamicInput)

**Ingestion path (two-step):**
```
CU-uploaded loan file
  → JSON_Input (JSON metadata describing file group)
  → JSONParse (extract routing fields: FileGroupNum, Info, RowNum, Header)
  → RegEx + Filter tools (parse routing metadata)
  → DynamicInput (uses FileGroupNum to route to institution-specific CU file)
  → LoanFileTmp.yxdb  (\\10.2.7.56\Shared\PortfolioAnalysis\99_References\LoanFileTmp.yxdb)
  → Stage 1 processing stream
```

`FileGroupNum` is the routing key extracted from the JSON metadata. Each credit union's uploaded file is addressed by its `FileGroupNum`. The DynamicInput tool loads the institution-specific file, which is then written to `LoanFileTmp.yxdb` as an intermediate staging file before entering the main workflow stream.

**Confirmed input fields (from XML `FormulaField` and `Field` metadata):**

| Field Name | Type / Notes | Used In |
|------------|--------------|---------|
| `Loan Type` | String — loan product category | Stage 3 coalesce formula; FormulaField `field="Loan Type"` |
| `Loan Group` | String — loan classification group | Stage 4 standardization: `Trim(Uppercase([Loan Group]))` |
| `Loan Subgroup` | String — sub-classification | Stage 4 standardization: `Trim(Uppercase([Loan Subgroup]))` |
| `Allowance Group` | String — ALLL assignment grouping | Stage 4 standardization: `Trim(Uppercase([Allowance Group]))` |
| `LoanAllowanceGroup` | String — alternate allowance group field | Used in Summarize aggregations |
| `Report Date` | Date — reporting period date from CU file | Stage 1: coalesced with `ReportingPeriodDate` if empty |
| `PeerNo` | String — credit union peer identifier | Stage 7 output file path construction |
| `Origination Date` | Date — loan origination date | Stage 4 calculations: `Years until Charge off`, `Days from Origination`, `Origination Quarter`, `Vintage Year`, `Vehicle Age at Origination` |
| `Charge Off Date` | Date — date loan was charged off | Stage 4 calculations: `Years until Charge off`, `Days from Origination`, `Charged off past 36 Months?` |
| `Interest Rate` | Double — loan interest rate | Stage 6 Fair Lending: `Rate Differential` formula |
| `Original Credit Score` | Double — borrower credit score at origination | Stage 6: `Decision FICO Grade` formula |
| `Term` | Double — loan term (months) | Stage 4: `Rounded Term`, `Term Grouping` formulas |
| `Model Year` | String — vehicle model year (auto loans) | Stage 4: `Vehicle Age at Origination`; cleaned via `IIF(ToString([Model Year])!='NOT AVAILABLE',[Model Year],Null())` |
| `Loan Description` | String — free-text loan description | Stage 3 coalesce: `if !IsNull([Right_Loan Description]) and [Loan Description]='NULL' then [Right_Loan Description] else [Loan Description] endif` |
| `PeerGroupName` | String — peer group label | Stage 4 standardization: `Trim(Uppercase([PeerGroupName]))` |
| `LTV` | Double — loan-to-value ratio (current) | Present as Field metadata; source from CU-uploaded file; null-coalesced in PreProcess: `IIF(IsEmpty([_CurrentField_]),0,[_CurrentField_])` |
| `Current LTV` | Double — current loan-to-value ratio | Present as Field metadata; source from CU-uploaded file; same null-coalesce treatment |
| `Original LTV` | Double — LTV at origination | Present as Field metadata; source from CU-uploaded file; same null-coalesce treatment |
| `Days Past Due` | Double — delinquency days | Present as Field metadata; source from CU-uploaded file; same null-coalesce treatment |

**Note on LTV and Days Past Due:** These fields appear in the XML as Field metadata elements (not as `FormulaField` targets), indicating they are passed through from the CU-uploaded source file rather than computed as new derived fields in the main workflow. They are passed through the PreProcess macro's MultiFieldFormula standardization (null-coalesce: `IIF(IsEmpty([_CurrentField_]),0,[_CurrentField_])`). Their internal formulas inside the `Append RE Values.yxmc` macro are not confirmed from the main XML — see Section 1.3.

---

### 1.2 Source 2: Charge-Off/Recovery (CU-Uploaded Files via DynamicInput)

**Ingestion path (two-step):**
```
CU-uploaded charge-off file
  → JSON_Input (same JSON routing mechanism as Source 1)
  → JSONParse → RegEx + Filter (extract FileGroupNum)
  → DynamicInput (routes to institution-specific charge-off file)
  → ChargeOffTmp.yxdb  (\\10.2.7.56\Shared\PortfolioAnalysis\99_References\ChargeOffTmp.yxdb)
  → Stage 3 Charge-Off Append (joins to loan records)
```

**Confirmed input fields (from XML `FormulaField` expressions):**

| Field Name | Type / Notes | Used In |
|------------|--------------|---------|
| `Charge Off Amount` | Double — gross charge-off amount for the loan | Stage 4: `Gross Charge Off Amount` pass-through; `Years until Charge off` conditional |
| `Charge Off Date` | Date — date of charge-off event | Stage 4: `Years until Charge off`, `Days from Origination`, `Charged off past 36 Months?` |
| `Recovery Amount` | Double — recoveries against the charged-off loan | Present in source file; used in commented-out Net Charge Off formula (inactive) |
| `Recovery Date` | Date — date of recovery event | Present in source file |
| `Charge Offs` | Double — **distinct from `Charge Off Amount`** — cumulative charge-off measure | Stage 4: `Net Charge Off Amount` conditional: `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif` |

**Important distinction:** `Charge Offs` and `Charge Off Amount` are two separate fields in the source data. `Charge Offs` is used in the active `Net Charge Off Amount` conditional formula. `Charge Off Amount` is used for `Gross Charge Off Amount` and the `Years until Charge off` calculation. The original (now inactive/commented-out) formula used `[Charge Off Amount] - [Recovery Amount]`; the active formula replaced this.

---

### 1.3 Source 3: Real Estate Valuations (via Append RE Values.yxmc Macro)

**Ingestion mechanism:** The `Append RE Values.yxmc` macro appends real estate valuation fields to matching loan records. Individual field names from inside the macro are not confirmed from the main workflow XML's `FormulaField` scan — the macro's internal XML would need to be inspected separately (Phase 6).

**Confirmed from main XML field metadata:** `LTV`, `Current LTV`, `Original LTV` appear as field metadata after the macro executes, suggesting these are the primary output fields. These fields are then processed by the PreProcess macro's MultiFieldFormula standardization.

**Reference:** `0000_19000101_CURRENT RE MODEL.xlsx` provides real estate model parameters used by this macro (see Section 1.5).

**Macro path:** `Append RE Values.yxmc`

**Status:** Individual field-level formula logic inside macro: **not confirmed from main XML** — requires macro XML inspection (Phase 6).

---

### 1.4 Source 4: TransUnion Credit Bureau (via TransUnion Mask_FICO Only_v2.yxmc Macro)

**Ingestion mechanism:** The `TransUnion Mask_FICO Only_v2.yxmc` macro loads TransUnion credit bureau data and masks all fields except `Original Credit Score`. This is a privacy/compliance masking step — only the credit score is carried forward into the main processing stream.

**Confirmed output field (used in main workflow formulas):**

| Field Name | Type / Notes | Used In |
|------------|--------------|---------|
| `Original Credit Score` | Double — borrower credit score from TransUnion | Stage 6: `Decision FICO Grade` formula: `IF ([Original Credit Score]=[NR] or IsEmpty([Original Credit Score])) then "NR" elseIF [Original Credit Score]>[A+] then "A+" ...` |

**Additional TransUnion fields:** Masked by macro — specifics in macro XML (Phase 6). These fields do not propagate into the main workflow beyond `Original Credit Score`.

**Macro path:** `TransUnion Mask_FICO Only_v2.yxmc`

**Status:** Additional masked fields: **not confirmed from main XML** — requires macro XML inspection (Phase 6).

---

### 1.5 Reference/Supplementary Sources (TTA Internal Files)

These files are static TTA-managed reference datasets loaded directly into the workflow (not from CU uploads). All paths confirmed from XML file path extraction.

| File | Format | Fields Provided | Usage in Workflow |
|------|--------|-----------------|-------------------|
| `0000_19001231_SECURITIES.yxdb` | Alteryx binary (.yxdb) | Securities data (fields TBD via Phase 6) | Feeds `SecuritiesTmp.yxdb` staging; final output to `14_SECURITIES` folder |
| `CallReportDataShort.yxdb` | Alteryx binary (.yxdb) | `Probability of Default`, `Total Assets`, `Net Worth`, `ALLL` (XML annotation: "Adding 3 fields from the call report data each quarter") | Joined to loan records for PD enrichment; output path: `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb` |
| `0000_20170125_PROBABILITY OF DEFAULT.xlsx` | Excel (.xlsx) | PD lookup table (probability of default by loan category) | Joined to loan records for `Probability of Default` assignment |
| `0000_MASTER_PARTICIPATIONS.yxdb` | Alteryx binary (.yxdb) | Participation loan master records | Loaded for participation loan matching/identification |
| `NAICS PD_20190731.xlsx` | Excel (.xlsx) | NAICS-based probability of default rates | NAICS code PD lookup for commercial loan types |
| `CO Data SBA - Excel Version.xlsx` | Excel (.xlsx) | SBA charge-off reference data | SBA loan charge-off benchmarks/lookups |
| `0000_19000101_CURRENT RE MODEL.xlsx` | Excel (.xlsx) | Real estate model parameters | Used by `Append RE Values.yxmc` macro (Source 3) for RE valuation computation |
| `Zip Code Ethnicity Index.csv` | CSV | Zip code to ethnicity demographic mapping | Stage 6 Fair Lending: `Predicted Ethnicity` computation (proxy ethnicity method) |

**Full UNC paths confirmed from XML:**
- `\\10.2.7.56\Shared\PortfolioAnalysis\02_TTA_Files\05_Other\0000_19001231_SECURITIES.yxdb`
- `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb`
- `\\10.2.7.56\Shared\PortfolioAnalysis\02_TTA_Files\05_Other\0000_20170125_PROBABILITY OF DEFAULT.xlsx`
- `\\10.2.7.56\Shared\PortfolioAnalysis\02_TTA_Files\06_Participations\0000_MASTER_PARTICIPATIONS.yxdb`
- `\\10.2.7.56\shared\PortfolioAnalysis\02_TTA_Files\05_Other\NAICS PD_20190731.xlsx`
- `\\10.2.7.56\shared\PortfolioAnalysis\02_TTA_Files\05_Other\CO Data SBA - Excel Version.xlsx`
- `\\10.2.7.56\Shared\PortfolioAnalysis\02_TTA_Files\99_Templates\0000_19000101_CURRENT RE MODEL.xlsx`
- `\\10.2.7.56\shared\Consulting_Client_Files\2020\0000_OTHER\Alan\Fair Lending Files\Zip Code Ethnicity Index.csv`

---

### 1.6 Input Staging Architecture

The MDPA workflow uses a **two-step input path** for CU-uploaded data (Sources 1 and 2). Data does not flow directly from the CU file into Stage 1 processing — it passes through intermediate staging `.yxdb` files first.

```
CU-Uploaded Files (Source 1: Loan Portfolio)
  |
  +-- JSON routing metadata (JSON_Input)
       |
       +-- JSONParse --> RegEx/Filter (extract FileGroupNum)
            |
            +-- DynamicInput [routes to institution file by FileGroupNum]
                 |
                 +-->  LoanFileTmp.yxdb
                 |     \\10.2.7.56\Shared\PortfolioAnalysis\99_References\LoanFileTmp.yxdb
                 |
                 +-->  ImpairedLoanTmp.yxdb  (impaired loan subset)
                       \\10.2.7.56\Shared\PortfolioAnalysis\99_References\ImpairedLoanTmp.yxdb

CU-Uploaded Files (Source 2: Charge-Off/Recovery)
  |
  +-- JSON routing metadata (same DynamicInput pattern)
       |
       +-->  ChargeOffTmp.yxdb
             \\10.2.7.56\Shared\PortfolioAnalysis\99_References\ChargeOffTmp.yxdb

TTA Internal Files (Source: Securities/Reference data)
  |
  +-- Direct file read (0000_19001231_SECURITIES.yxdb + CallReportDataShort.yxdb)
       |
       +-->  SecuritiesTmp.yxdb
             \\10.2.7.56\Shared\PortfolioAnalysis\99_References\SecuritiesTmp.yxdb

All four staging files --> Stage 1 processing (Data Input / JSON Entry Point)
```

**All 4 intermediate staging file paths (confirmed from XML):**

| Staging File | UNC Path | Feeds |
|---|---|---|
| `LoanFileTmp.yxdb` | `\\10.2.7.56\Shared\PortfolioAnalysis\99_References\LoanFileTmp.yxdb` | Stage 1 main loan processing stream |
| `ImpairedLoanTmp.yxdb` | `\\10.2.7.56\Shared\PortfolioAnalysis\99_References\ImpairedLoanTmp.yxdb` | Stage 3 impaired loan subset joining |
| `ChargeOffTmp.yxdb` | `\\10.2.7.56\Shared\PortfolioAnalysis\99_References\ChargeOffTmp.yxdb` | Stage 3 Charge-Off Append |
| `SecuritiesTmp.yxdb` | `\\10.2.7.56\Shared\PortfolioAnalysis\99_References\SecuritiesTmp.yxdb` | Stage 7 Securities output stream |

**Open field-level questions for Phase 6:**
- `LTV`, `Current LTV`, `Original LTV`: Confirmed present in XML field metadata; specific formula logic inside `Append RE Values.yxmc` not confirmed from main XML. Delinquency is tracked via `Days Past Due` (confirmed field metadata) — no `Delinquency_Rate` aggregate field found in `FormulaField` scan (may be a Summarize tool aggregation, not a record-level formula field).
- `Risk_Score`: Does **not exist** in XML. Equivalent field is `Decision FICO Grade` (categorical, Stage 6). See Phase 1 GAP-03 finding.
- `Charge_Off_Rate`: Not found in XML `FormulaField` scan. May be computed as a Summarize aggregation rather than a record-level derived field. Flagged as open question.

---

## Part 2: Processing Stage Transformations

*Stub — to be fully populated in Plan 04-02*

**Stage boundaries confirmed from XML ToolContainer annotations and TextBox labels.**

### Stage 1: Data Input and JSON Routing

*Stub — to be populated in Plan 04-02*

**Entry point:** JSON_Input → JSONParse → RegEx/Filter → DynamicInput → `LoanFileTmp.yxdb` / `ChargeOffTmp.yxdb`
**Key routing field:** `FileGroupNum` (institution identifier extracted from JSON metadata)

### Stage 2: PreProcess and Field Standardization

*Stub — to be populated in Plan 04-02*

**Key tools:** PreProcess_Iterative macro; MultiFieldFormula bulk standardization (uppercase/trim); Contingent File Input (8 instances)

### Stage 3: Data Matching and Consolidation

*Stub — to be populated in Plan 04-02*

**Key operations:** Append Charge Offs and Matching; Append RE Values (Source 3 ingestion); Union Subset Prior Period; Only Prior Period join

### Stage 4: Calculations and Enrichment

*Stub — to be populated in Plan 04-02*

**Key derived fields:** `Net Charge Off Amount`, `Gross Charge Off Amount`, `Years until Charge off`, `Days from Origination`, `Origination Quarter`, `Vintage Year`, `Term Grouping`, `Vehicle Age at Origination`, `Probability of Default`, `Charged off past 36 Months?`

### Stage 5: Static Pool and Vintage Cohort Construction

*Stub — to be populated in Plan 04-02*

**Key derived fields:** `Year 0` through `Year 6` flags; `Expected Loss - Year 1` through `Year 7`; `Vintage Adjustment`; `Vintage Adjusted Expected Losses`; `PP Vintage Adjustment`; `Vintage Adjustment Flag`

### Stage 6: Fair Lending Analysis and Compliance Masking

*Stub — to be populated in Plan 04-02*

**Key derived fields:** `Decision FICO Grade`; `Rate Differential`; `Include in Fair Lending?`; `Predicted Ethnicity`; `Predicted Gender`
**Key masking:** TransUnion Mask_FICO Only_v2 macro applied in this stage

### Stage 7: Output Preparation and Publication

*Stub — to be populated in Plan 04-02*

**Key operations:** Output file path construction for each institution (`PeerNo`-based naming); Tableau New Macro 1055 (Client Hyper); Tableau New Macro Dropped 1056 (Dropped Records); Tableau New Macro Securities 1057 (Securities); DbFileOutput (Client File); DbFileOutput (Call Report)

---

## Part 3: Calculated/Derived Field Formulas

*Stub — to be fully populated in Plan 04-02*

**Preview: Key confirmed formulas (from XML `FormulaField` extraction):**

| Field | Formula (verbatim from XML) | Input Fields | Stage |
|-------|----------------------------|--------------|-------|
| `Net Charge Off Amount` | `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif` (active); `[Charge Off Amount]-[Recovery Amount]` (commented-out/inactive) | `Max_Report Date`, `Charge Offs` | Stage 4 |
| `Gross Charge Off Amount` | `[Charge Off Amount]` | `Charge Off Amount` | Stage 4 |
| `Years until Charge off` | `if [Charge Off Amount] > 0 then max(min(7,floor(DateTimeDiff([Charge Off Date],[Origination Date],"days")/365)),0) else Null() endif` | `Charge Off Amount`, `Charge Off Date`, `Origination Date` | Stage 4 |
| `Days from Origination` | `abs(DateTimeDiff([Origination Date],[Charge Off Date],"day"))` | `Origination Date`, `Charge Off Date` | Stage 4 |
| `Decision FICO Grade` | `IF ([Original Credit Score]=[NR] or IsEmpty([Original Credit Score])) then "NR" elseIF [Original Credit Score]>[A+] then "A+" elseIF [Original Credit Score]>[A] then "A" elseIF [Original Credit Score]>[B] then "B" elseIF [Original Credit Score]>[C] then "C" elseIF [Original Credit Score]>[D] then "D" else "E" endif` | `Original Credit Score`, TextInput thresholds | Stage 6 |
| `Rate Differential` | `[Average Interest Rates]-[Interest Rate]` | `Average Interest Rates` (Summarize), `Interest Rate` | Stage 6 |
| `Vintage Year` | `datetimeyear([Origination Date])` | `Origination Date` | Stage 4 |
| `Charged off past 36 Months?` | `if DateTimeDiff([Report_Date],[Charge Off Date],'months') < 36 then 1 else 0 endif` | `Report_Date`, `Charge Off Date` | Stage 4 |

*Full formula table to be completed in Plan 04-02.*

---

## Part 4: Output Field Mapping

*Stub — to be fully populated in Plan 04-03*

**Output file paths confirmed from XML:**

| Output Type | Path Pattern | Format |
|---|---|---|
| Client File | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\01_CLIENT_FILES\[PeerNo]_[YYYYMMDD]_CLIENT_FILE.yxdb` | Alteryx binary |
| Tableau Extract | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\02_TDE\[PeerNo]_[YYYYMMDD]_CLIENT_FILE.hyper` (via Macro 1055) | Hyper |
| Dropped Records | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\06_DROP_RECORDS\[PeerNo]_19000101_DROPPED RECORDS.yxdb` | Alteryx binary |
| Securities | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\14_SECURITIES\[PeerNo]_19000101_SECURITIES.yxdb` | Alteryx binary |
| Call Report / Regulatory | `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb` | Alteryx binary |

*Field-level output mapping to be completed in Plan 04-03.*

---

## Part 5: End-to-End Traceability Examples

*Stub — to be fully populated in Plan 04-03*

**Planned traceability examples:**
1. Tracing `Net Charge Off Amount` from source `Charge Offs` field through Stage 4 conditional formula to Client File output
2. Tracing `Decision FICO Grade` from `Original Credit Score` (TransUnion macro) through Stage 6 grade formula to Tableau Extract
3. Tracing `Vintage Adjusted Expected Losses` from prior period client file join through Stage 5 pass-through to current period Client File
4. Tracing a Tableau dashboard metric back to its CU-uploaded source field

*Full traceability examples to be written in Plan 04-03.*
