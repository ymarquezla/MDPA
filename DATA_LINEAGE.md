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

**Stage boundaries confirmed from XML ToolContainer annotations and TextBox labels.**
**All formulas quoted verbatim from XML `FormulaField` expressions (HTML entities decoded).**

---

### Stage 1: Data Input / JSON Entry Point

**XML Container / Annotation:** "This will be the entry point to the API in which the portal will supply the JSON object directing Alteryx where the uploaded files are located, how the headers should map and the loan type lookups."
**Tool types:** JSONParse, DynamicInput (multiple instances), RegEx, Filter, DbFileOutput (staging write)
**Function:** Receives a JSON metadata object from the TTA web portal, extracts the file routing key (`FileGroupNum`), and uses it to dynamically load the institution-specific CU-uploaded files into staging `.yxdb` files.

**Key field transformations:**

| Field | Transformation | Input(s) | Output | Notes |
|-------|----------------|----------|--------|-------|
| `FileGroupNum` | JSONParse → RegEx extract | JSON metadata (`Info`, `RowNum`, `Header`) | `FileGroupNum` (routing key) | Identifies which institution's file to load; drives DynamicInput routing |
| `Report Date` | Coalesce formula | `Report Date`, `ReportingPeriodDate` | `Report Date` (normalized) | `if isempty([Report Date]) then [ReportingPeriodDate] else [Report Date] endif` — ensures every record has a reporting period date |
| All Source 1 fields | DynamicInput load | `FileGroupNum` → institution file path | All Loan Portfolio fields | CU-uploaded loan file loaded as primary record stream |
| All Source 2 fields | DynamicInput load | `FileGroupNum` → charge-off file path | All Charge-Off fields | CU-uploaded charge-off file loaded as secondary stream |

**Fields entering this stage:** JSON metadata only (`FileGroupNum`, `Info`, `RowNum`, `Header`)
**Fields exiting this stage:** Full Loan Portfolio field set + full Charge-Off field set, written to staging files (`LoanFileTmp.yxdb`, `ChargeOffTmp.yxdb`). `Report Date` is resolved at this point.

---

### Stage 2: PreProcess / Field Standardization

**XML Container / Annotation:** "After the 'PreProcess' macro is complete, it would output file paths to where it placed the processed files. These are fed into the Dynamic Input tools and will read in as many 'Loan Files' that were uploaded by the CU." / "PreProcess_Iterative macro" annotation.
**Tool types:** PreProcess_Iterative macro (invoked once per institution), MultiFieldFormula (bulk field standardization), Contingent File Input (8 instances — conditional file loading), Select tools, DynamicInput (reads processed output of macro)
**Function:** Applies bulk data standardization across all fields using the PreProcess_Iterative macro; conditionally loads supplementary reference files; normalizes string fields to uppercase/trimmed format and numeric fields to null-safe values.

**Key field transformations:**

| Field | Transformation | Input(s) | Output | Notes |
|-------|----------------|----------|--------|-------|
| All string classification fields | MultiFieldFormula bulk uppercase+trim | `Loan Group`, `Loan Subgroup`, `Allowance Group`, `PeerGroupName` | Normalized string values | Formula applied to each: `Trim(Uppercase([_CurrentField_]))` |
| `Loan Group` | `Trim(Uppercase([Loan Group]))` | `Loan Group` (raw) | `Loan Group` (standardized) | Prevents case-mismatch grouping errors downstream |
| `Loan Subgroup` | `Trim(Uppercase([Loan Subgroup]))` | `Loan Subgroup` (raw) | `Loan Subgroup` (standardized) | Same pattern |
| `Allowance Group` | `Trim(Uppercase([Allowance Group]))` | `Allowance Group` (raw) | `Allowance Group` (standardized) | Same pattern |
| `PeerGroupName` | `Trim(Uppercase([PeerGroupName]))` | `PeerGroupName` (raw) | `PeerGroupName` (standardized) | Same pattern |
| All numeric fields (incl. `LTV`, `Current LTV`, `Original LTV`, `Days Past Due`, `Average Interest Rates`) | MultiFieldFormula null-coalesce | Raw numeric value or empty | 0 when empty; raw value otherwise | `IIF(IsEmpty([_CurrentField_]),0,[_CurrentField_])` — prevents null-propagation errors in downstream formulas |
| Contingent file inputs (8 instances) | Conditional file load | Institution type / configuration flags | Supplementary reference data joined to stream | Refer to macro XML for file-load conditions; each instance loads a different supplementary file type (e.g., impaired loans, participations) |

**Fields entering this stage:** All staging file fields from Stage 1 (raw, heterogeneous CU-uploaded values)
**Fields exiting this stage:** All fields standardized — string fields uppercase/trimmed; numeric fields null-coalesced to 0; `Report Date` confirmed resolved. Processed files written to output paths consumed by DynamicInput downstream.

---

### Stage 3: Data Matching and Consolidation

**XML Container / Annotation:** "Append Charge Offs and Matching", "Append RE Values", "Union Subset Prior Period (347)", "Only Prior Period (346)"
**Tool types:** Join (charge-off matching by loan identifier), Append Fields (RE Values macro), Union (prior period records 346/347), Filter (subset separation)
**Function:** Consolidates the loan portfolio stream with three additional data sources: charge-off records (joined by loan identifier), real estate valuations (appended via macro), and prior period loan records (unioned in). Produces the complete consolidated record set that enters Calculations.

**Key field transformations:**

| Field | Transformation | Input(s) | Output | Notes |
|-------|----------------|----------|--------|-------|
| `Loan Type` | Coalesce: right-side join value takes priority | `Loan Type` (left/loan stream), `Right_Loan Type` (charge-off join) | `Loan Type` (resolved) | `if [Right_Loan Type] not in (Null(),'','Null') then [Right_Loan Type] else [Loan Type] endif` |
| `Loan Description` | Coalesce: right-side value when left is 'NULL' | `Loan Description` (loan stream), `Right_Loan Description` (charge-off join) | `Loan Description` (resolved) | `if !IsNull([Right_Loan Description]) and [Loan Description] = 'NULL' then [Right_Loan Description] else [Loan Description] endif` |
| `Charge Off Amount` | Pass-through join | Charge-off file (Source 2) → Join to loan record | `Charge Off Amount` appended to loan record | Joined by loan identifier; charge-off fields are null for non-charged-off loans |
| `Charge Off Date` | Pass-through join | Charge-off file (Source 2) → Join to loan record | `Charge Off Date` appended | Same join as Charge Off Amount |
| `LTV`, `Current LTV`, `Original LTV` | Append Fields (macro) | `Append RE Values.yxmc` macro output | RE valuation fields appended to each loan record | Macro internals not confirmed from main XML — requires Phase 6 macro inspection |
| Prior period records | Union (tools 346/347) | Prior period client file | All prior period loan records added to current stream | "Added a bypass for prior period data so it does not get rerun" — prior period records carry their pre-computed vintage values through without recalculation |

**Fields entering this stage:** Standardized loan portfolio fields from Stage 2 (current period only)
**Fields exiting this stage:** Loan records + charge-off fields + RE valuation fields + prior period loan records. This is the full consolidated input to Stage 4 Calculations.

**Stage 3 → Stage 4 link:** The Union of charge-off-appended current records + prior period join produces the complete record set. Prior period records bypass recalculation (XML annotation: "we want to keep the vintage related values in prior periods static and only run the calcs for the current project").

---

### Stage 4: Calculations and Enrichment

**XML Container / Annotation:** "Added Formula Tool (746) to prioritize loan file data fields over impairment file data fields" / "Added Years until Charge off formula tool (860) here to push through to Tableau reporting"
**Tool types:** Formula tools (60 instances across the workflow — concentrated in this stage), Select tools, Join (Call Report / PD data), Summarize (Max_Report Date determination)
**Function:** Applies all record-level derived field calculations. Produces the core analytical metrics used in static pool construction, fair lending analysis, and output reporting. This is the heaviest computation stage in the workflow.

**Key field transformations:**

| Field | Transformation | Input(s) | Output | Notes |
|-------|----------------|----------|--------|-------|
| `Net Charge Off Amount` | Conditional: `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif` | `Max_Report Date` (Summarize), `Charge Offs` | `Net Charge Off Amount` | Active formula. Commented-out inactive formula: `[Charge Off Amount]-[Recovery Amount]`. Uses `Charge Offs` (not `Charge Off Amount`) when `Max_Report Date` is empty |
| `Gross Charge Off Amount` | Pass-through: `[Charge Off Amount]` | `Charge Off Amount` | `Gross Charge Off Amount` | Direct assignment — no transformation |
| `Years until Charge off` | `if [Charge Off Amount] > 0 then max(min(7,floor(DateTimeDiff([Charge Off Date],[Origination Date],"days")/365)),0) else Null() endif` | `Charge Off Amount`, `Charge Off Date`, `Origination Date` | `Years until Charge off` (0–7 integer, or Null) | Capped at 7 years; returns Null for non-charged-off loans. XML note: "Removed Years until Charge off from multi field formula tool (738) so tool won't create zeros in unwanted cells" |
| `Days from Origination` | `abs(DateTimeDiff([Origination Date],[Charge Off Date],"day"))` | `Origination Date`, `Charge Off Date` | `Days from Origination` (integer days) | Commented-out alternate formula using `Months from Origination` is inactive |
| `Origination Quarter` | `Left([Origination Date],4)+' Q'+IIF(Substring([Origination Date],5,2) IN ('01','02','03'),'1',IIF(Substring([Origination Date],5,2) IN ('04','05','06'),'2',IIF(Substring([Origination Date],5,2) IN ('07','08','09'),'3',IIF(Substring([Origination Date],5,2) IN ('10','11','12'),'4',Null()))))` | `Origination Date` | `Origination Quarter` (e.g., "2019 Q2") | String concatenation of year + quarter |
| `Vintage Year` | `datetimeyear([Origination Date])` | `Origination Date` | `Vintage Year` (4-digit integer) | Used as cohort grouping key in Stage 5 |
| `Rounded Term` | `round([Term],12)` | `Term` | `Rounded Term` | Rounds loan term to nearest 12-month boundary |
| `Term Grouping` | `if [Term] <= ToNumber(Right([Term1],2)) then [Term1] elseif [Term] <= ToNumber(Right([Term2],2)) then [Term2] elseif [Term] <= ToNumber(Right([Term3],2)) then [Term3] elseif [Term] <= ToNumber(Right([Term4],2)) then [Term4] else [Term5] endif` | `Term`, TextInput threshold values (`Term1`–`Term5`) | `Term Grouping` (categorical bucket label) | Thresholds sourced from TextInput tool; bucket boundaries are configurable without workflow modification |
| `Model Year` | `IIF([Model Year]!='NOT AVAILABLE',[Model Year],Null())` | `Model Year` (string, raw) | `Model Year` (string or Null) | Cleans 'NOT AVAILABLE' sentinel value to Null |
| `Vehicle Age at Origination` | `if IsEmpty([Model Year]) or [Model Year]='0' or IsEmpty([Origination Date]) then Null() else datetimeyear([Origination Date])-tonumber([Model Year]) endif` | `Model Year`, `Origination Date` | `Vehicle Age at Origination` (integer years, or Null) | Auto loan field; Null for non-auto loans or when model year unavailable |
| `Probability of Default` | `IIF(IsEmpty([Probability of Default]),0,[Probability of Default])` | `Probability of Default` (from Call Report / PD join) | `Probability of Default` (null-safe Double) | Joined from `CallReportDataShort.yxdb` or PD lookup table; set to 0 when no join match |
| `Charged off past 36 Months?` | `if DateTimeDiff([Report_Date],[Charge Off Date],'months') < 36 then 1 else 0 endif` | `Report_Date`, `Charge Off Date` | `Charged off past 36 Months?` (0/1 flag) | Recency flag for charge-off eligibility in analysis |
| `Average Annual Loss Rate` | `0` | (none) | `Average Annual Loss Rate` = 0 | Static default. XML note: "Default if client does not have Fair Lending Parameters set up." Set to 0 as a placeholder when no historical loss rate data exists for the institution |
| `OutputFilePath_Dropped` | `'\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\06_DROP_RECORDS\'+[PeerNo]+"_"+"19000101_DROPPED RECORDS"+'.yxdb'` | `PeerNo` | `OutputFilePath_Dropped` (UNC path string) | Used in Stage 7 to dynamically configure the dropped records output tool path |
| `Originated Past 5 Years?` | `if DateTimeYear([Report_Date])-DateTimeYear([Origination Date]) < 6 then 1 else 0 endif` | `Report_Date`, `Origination Date` | `Originated Past 5 Years?` (0/1 flag) | Filters static pool to loans within recent vintage window |
| `Charge Off % by FICO_Vintage_Group` | `if isnull([Sum_Charge Off Amount]/[Sum_Original Balance]) then 0 else [Sum_Charge Off Amount]/[Sum_Original Balance] endif` | `Sum_Charge Off Amount`, `Sum_Original Balance` | `Charge Off % by FICO_Vintage_Group` | Computed via Summarize aggregation + Formula; feeds Vintage Adjustment calculation in Stage 5 |
| `Charge Off % by Vintage_Group` | `if isnull([Sum_Charge Off Amount]/[Sum_Original Balance]) then 0 else [Sum_Charge Off Amount]/[Sum_Original Balance] endif` | `Sum_Charge Off Amount`, `Sum_Original Balance` | `Charge Off % by Vintage_Group` | Computed via Summarize aggregation + Formula |

**Fields entering this stage:** Full consolidated record set from Stage 3 (loan + charge-off + RE + prior period records)
**Fields exiting this stage:** All Stage 3 fields plus all derived fields listed above. This record set enters both Stage 5 (static pool) and Stage 6 (fair lending) in parallel streams.

---

### Stage 5: Static Pool / Vintage Cohort Construction

**XML Container / Annotation:** "Get the number of years to include for static pool and years until charge off" / "Generate a complete set of records based on allowance group, origination year and years until charge off" / "The tools in this container exist to adjust [Vintage Expected Losses] based on credit quality (Credit Score)."
**Tool types:** Formula tools (Year 0-6 flag computation), Join (to prior period client file — carries in vintage values), Summarize (cohort aggregations: `Sum_Charge Off Amount`, `Sum_Original Balance`, `Max_0`–`Max_6`), Select tools
**Function:** Constructs vintage cohort buckets using day-range flags (Year 0 through Year 6), then joins to the prior period client file to carry in pre-computed vintage adjustment values. The ±5% cap formula shown below was applied in a prior workflow run and is read as a static value in the current run.

**Key field transformations:**

| Field | Transformation | Input(s) | Output | Notes |
|-------|----------------|----------|--------|-------|
| `Year 0` | `If ([Days from Origination]) <366 then 1 else 0 endif` | `Days from Origination` | `Year 0` (0/1 boolean flag) | Loans originated within first year |
| `Year 1` | `If ([Days from Origination])<731 and ([Days from Origination])>365 then 1 else 0 endif` | `Days from Origination` | `Year 1` (0/1 boolean flag) | 366–730 days from origination |
| `Year 2` | `If ([Days from Origination])<1096 and ([Days from Origination])>730 then 1 else 0 endif` | `Days from Origination` | `Year 2` (0/1 boolean flag) | 731–1095 days from origination |
| `Year 3` | `If ([Days from Origination])<1461 and ([Days from Origination])>1095 then 1 else 0 endif` | `Days from Origination` | `Year 3` (0/1 boolean flag) | 1096–1460 days from origination |
| `Year 4` | `If ([Days from Origination])<1826 and ([Days from Origination])>1460 then 1 else 0 endif` | `Days from Origination` | `Year 4` (0/1 boolean flag) | 1461–1825 days from origination |
| `Year 5` | `If ([Days from Origination])<2191 and ([Days from Origination])>1825 then 1 else 0 endif` | `Days from Origination` | `Year 5` (0/1 boolean flag) | 1826–2190 days from origination |
| `Year 6` | `If ([Days from Origination])<2556 and ([Days from Origination])>2190 then 1 else 0 endif` | `Days from Origination` | `Year 6` (0/1 boolean flag) | 2191–2555 days from origination |
| `Expected Loss - Year 1` | PRE-COMPUTED CARRY-IN: `[Right_Expected Loss - Year 1]` | Prior period client file (Join) | `Expected Loss - Year 1` | Value was calculated in a prior workflow run and is read as a static value in the current run |
| `Expected Loss - Year 2` | PRE-COMPUTED CARRY-IN: `[Right_Expected Loss - Year 2]` | Prior period client file (Join) | `Expected Loss - Year 2` | Same — prior run value |
| `Expected Loss - Year 3` | PRE-COMPUTED CARRY-IN: `[Right_Expected Loss - Year 3]` | Prior period client file (Join) | `Expected Loss - Year 3` | Same — prior run value |
| `Expected Loss - Year 4` | PRE-COMPUTED CARRY-IN: `[Right_Expected Loss - Year 4]` | Prior period client file (Join) | `Expected Loss - Year 4` | Same — prior run value |
| `Expected Loss - Year 5` | PRE-COMPUTED CARRY-IN: `[Right_Expected Loss - Year 5]` | Prior period client file (Join) | `Expected Loss - Year 5` | Same — prior run value |
| `Expected Loss - Year 6` | PRE-COMPUTED CARRY-IN: `[Right_Expected Loss - Year 6]` | Prior period client file (Join) | `Expected Loss - Year 6` | Same — prior run value |
| `Expected Loss - Year 7` | PRE-COMPUTED CARRY-IN: `[Right_Expected Loss - Year 7]` | Prior period client file (Join) | `Expected Loss - Year 7` | Same — prior run value |
| `Vintage Expected Losses` | PRE-COMPUTED CARRY-IN: `[Right_Vintage Expected Losses]` | Prior period client file (Join) | `Vintage Expected Losses` | Same — prior run value |
| `Vintage Adjustment` | PRE-COMPUTED CARRY-IN: `[Right_Vintage Adjustment]` | Prior period client file (Join) | `Vintage Adjustment` | **CRITICAL: PRE-COMPUTED CARRY-IN — value was calculated in a prior workflow run (applying the ±5% cap formula) and is read as a static value in the current run. The current run does NOT recalculate the ±5% cap.** For reference: the ±5% cap formula (applied in prior run) was: `if [Vintage Adjustment] > [PP Vintage Adjustment] then min([Vintage Adjustment],[PP Vintage Adjustment]+([PP Vintage Adjustment]*(.05))) elseif [Vintage Adjustment] < [PP Vintage Adjustment] then max([Vintage Adjustment],[PP Vintage Adjustment]-([PP Vintage Adjustment]*(.05))) else [Vintage Adjustment] endif` |
| `Vintage Adjusted Expected Losses` | PRE-COMPUTED CARRY-IN: `[Right_Vintage Adjusted Expected Losses]` | Prior period client file (Join) | `Vintage Adjusted Expected Losses` | Same — prior run value. Formula in prior run: `[Vintage Expected Losses]*[Vintage Adjustment]` |
| `PP Vintage Adjustment` | PRE-COMPUTED CARRY-IN: `[Right_PP Vintage Adjustment]` | Prior period client file (Join) | `PP Vintage Adjustment` | Same — prior run value |
| `Vintage Adjustment Flag` | PRE-COMPUTED CARRY-IN: `[Right_Vintage Adjustment Flag]` | Prior period client file (Join) | `Vintage Adjustment Flag` | Categorical: "First Value" / "Prior +5%" / "Actual Increase" / "Prior -5%" / "Actual Decrease" / "Same". Same — prior run value |
| `Static Pool Provision Required` | `If [First Formula]=-1 then 1 else [Second Part] Endif` (derived from `[Origination Year]+[Years until Charge off]-[Report Year]+1`) | `Origination Year`, `Years until Charge off`, `Report Year` | `Static Pool Provision Required` | Intermediate computation for cohort sizing |

**Fields entering this stage:** Stage 4 output fields (all calculation fields) + prior period client file (via Join)
**Fields exiting this stage:** All Stage 4 fields + Year 0–6 flags + all Expected Loss Year 1–7 fields + Vintage Adjustment chain fields + Static Pool Provision Required. This is the complete record for output.

---

### Stage 6: Fair Lending / Compliance Masking

**XML Container / Annotation:** "Fair Lending ToolContainer" (self-contained compliance analysis unit) / "Default if client does not have Fair Lending Parameters set up" / "10/16/19, JGo"
**Tool types:** Fair Lending ToolContainer (wrapper), TransUnion Mask_FICO Only_v2 macro (demographic enrichment + masking), Formula tools (Decision FICO Grade, Rate Differential, Include in Fair Lending?), Summarize (Average Interest Rates computation), Join (peer group average join-back), Append Fields (Zip Code Ethnicity lookup)
**Function:** A self-contained compliance analysis unit that grades loans by credit quality, computes rate differentials for fair lending outlier detection, applies two-phase outlier elimination, and enriches records with demographic proxies (ethnicity from zip code, gender from TransUnion). Results feed Tableau outputs used in fair lending review.

**Key field transformations:**

| Field | Transformation | Input(s) | Output | Notes |
|-------|----------------|----------|--------|-------|
| `Average Interest Rates` | Summarize: `Avg` of `Interest Rate` grouped by `Loan Subgroup`, `Term Grouping`, `Decision FICO Grade`, `Vehicle Age at Origination`, `Origination Quarter` → renamed from `Avg_Interest Rate` via Select | `Interest Rate` (all records in peer group) | `Average Interest Rates` (Double) | Peer group average rate. Computed as `Avg_Interest Rate` in Summarize, then renamed to `Average Interest Rates` in Select tool (field: `Right_Avg_Interest Rate` → `Average Interest Rates`) |
| `Decision FICO Grade` | `IF ([Original Credit Score]=[NR] or IsEmpty([Original Credit Score])) then "NR" elseiF [Original Credit Score]>[A+] then "A+" elseIF [Original Credit Score]>[A] then "A" elseIF [Original Credit Score]>[B] then "B" elseIF [Original Credit Score]>[C] then "C" elseIF [Original Credit Score]>[D] then "D" else "E" endif` | `Original Credit Score` (TransUnion macro output), TextInput threshold values (`NR`, `A+`, `A`, `B`, `C`, `D`) | `Decision FICO Grade` (categorical: NR/A+/A/B/C/D/E) | Thresholds sourced from TextInput tools — configurable without workflow modification. "NR" = No Rating |
| `Rate Differential (Pre)` | `abs([Average Interest Rates]-[Interest Rate])` | `Average Interest Rates`, `Interest Rate` | `Rate Differential (Pre)` (absolute value Double) | Pre-outlier-elimination rate spread; used in outlier detection phase 1 |
| `Outlier?` (phase 1) | `0` then `1` (two-step formula) | `Rate Differential (Pre)`, threshold | `Outlier?` (0/1 flag) | Two-phase elimination: first marks all as 0, then marks outliers as 1 based on rate spread threshold |
| `Include in Fair Lending?` (phase 1) | `1` then `0` (two-step formula) | `Outlier?` flag | `Include in Fair Lending?` (0/1 flag) | Inverse of Outlier?: `1` = included in fair lending model; `0` = excluded as outlier |
| `Rate Differential` | `[Average Interest Rates]-[Interest Rate]` | `Average Interest Rates`, `Interest Rate` | `Rate Differential` (signed Double) | Signed rate spread (positive = above average). Note: `Average Interest Rates` dropped from output stream after this calculation (Select tool 998 deselects it) |
| `Predicted Ethnicity` | Zip Code Ethnicity Index.csv lookup + BISG-style max-probability assignment | Zip code field, `Zip Code Ethnicity Index.csv` | `Predicted Ethnicity` (categorical: White/Black/Asian/American Indian/Multi Race/Hispanic/Exclude From Model) | Demographic proxy method using geographic ethnicity distribution. "Exclude From Model" assigned when all probability values = 0 |
| `Predicted Gender` | TransUnion Mask_FICO Only_v2 macro output | TransUnion data (masked — only gender and credit score pass through) | `Predicted Gender` (categorical: gender label or "Exclude From Model") | Null/empty values coerced to "Exclude From Model" |

**Fields entering this stage:** Stage 4/5 output fields including `Original Credit Score`, `Interest Rate`, `Loan Subgroup`, `Term Grouping`, `Origination Quarter`, `Vehicle Age at Origination`, zip code field
**Fields exiting this stage:** All incoming fields plus `Decision FICO Grade`, `Average Interest Rates`, `Rate Differential (Pre)`, `Rate Differential`, `Include in Fair Lending?`, `Outlier?`, `Predicted Ethnicity`, `Predicted Gender`. Note: `Average Interest Rates` and `Rate Differential (Pre)` are deselected in downstream Select tool (tool 998) and do not propagate to Stage 7.

---

### Stage 7: Output Preparation and Publication

**XML Container / Annotation:** "Generate a distinct output file path..." / "The formula tools before the output tools create a distinct output file path that will be used to replace the existing 'PLACEHOLDER.ext' path the Output tool is configured with." / "Adding 3 fields from the call report data each quarter (total assets, net worth, ALLL)"
**Tool types:** Formula tools (output path construction), DbFileOutput (Client File, Call Report), Tableau New Macro 1055 (Client Hyper file), Tableau New Macro Dropped 1056 (Dropped Records), Tableau New Macro Securities 1057 (Securities), PortfolioComposerTable (1 instance — summary table generation)
**Function:** Constructs institution-specific output file paths using `PeerNo`-based dynamic naming, then writes the final record set to five distinct output destinations. Tableau output uses `.hyper` format (migrated from legacy `.tde` format via Tableau New Macro tools).

**Key field transformations:**

| Field | Transformation | Input(s) | Output | Notes |
|-------|----------------|----------|--------|-------|
| `OutputFilePath_Dropped` | (computed in Stage 4 — see Stage 4 table) | `PeerNo` | UNC path string | Path used to configure the Dropped Records output tool dynamically |
| Output path fields | Formula: string construction with hardcoded UNC prefix + `[PeerNo]` + date suffix | `PeerNo` | Dynamic UNC file path strings | Same pattern as `OutputFilePath_Dropped` — each output tool has its path overridden at runtime |

**Output destinations (all 5 confirmed from XML):**

| Output Type | UNC Path Pattern | Format | Tool |
|-------------|-----------------|--------|------|
| Client File | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\01_CLIENT_FILES\[PeerNo]_[YYYYMMDD]_CLIENT_FILE.yxdb` | Alteryx binary (.yxdb) | DbFileOutput |
| Tableau Extract (Client) | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\02_TDE\[PeerNo]_[YYYYMMDD]_CLIENT_FILE.hyper` | Tableau Hyper (.hyper) | Tableau New Macro 1055 |
| Dropped Records | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\06_DROP_RECORDS\[PeerNo]_19000101_DROPPED RECORDS.yxdb` | Alteryx binary (.yxdb) | Tableau New Macro 1056 |
| Securities | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\14_SECURITIES\[PeerNo]_19000101_SECURITIES.yxdb` | Alteryx binary (.yxdb) | Tableau New Macro 1057 |
| Call Report | `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb` | Alteryx binary (.yxdb) | DbFileOutput |

**Tableau format migration note:** Output was migrated from legacy `.tde` format to current `.hyper` format. The folder path still shows `02_TDE` (legacy name) but the actual file format is `.hyper`. This is a known naming inconsistency.

**PortfolioComposerTable tool (1 instance — tool ID 954):**
This tool generates a summary table with the following fields: `Project Name`, `Credit Union`, `PeerNo`, `Project Date`, `Timestamp`, `Username`, `PeerGroupName`, `Vintage Adjustment Flag`, `Count`. Output is an HTML-formatted table string (field `Table`, type `V_WString`). The destination of this table output is not confirmed from the main XML — it may represent the "Executive Summary" output referenced in requirements, or it may feed an email notification workflow (XML annotation: "Email functionality"). **Flagged as open question — requires further inspection.**

**Fields entering this stage:** Complete record set from Stage 5/6 (all calculated fields, vintage fields, fair lending fields)
**Fields exiting this stage:** Written to 5 output files listed above. No further downstream processing in this workflow.

---

**Open Question — LTV and Delinquency_Rate:**
Neither `LTV`/`Current LTV`/`Original LTV` aggregation formulas nor a `Delinquency_Rate` field were found in the `FormulaField` scan or in the `SummarizeField` configuration of any Summarize tool. Specifically:
- `LTV`, `Current LTV`, `Original LTV`: Present as pass-through field metadata (confirmed in Part 1, Section 1.1); the internal computation formula lives inside the `Append RE Values.yxmc` macro. Phase 6 macro inspection required.
- `Delinquency_Rate`: Not found as a `FormulaField` target or `SummarizeField` in the main XML. Delinquency tracking at the record level is handled via `Days Past Due` (a CU-source field). If a `Delinquency_Rate` aggregate exists, it is either inside a macro or in a downstream Tableau calculation. This cannot be traced further without macro XML inspection (Phase 6).

---

## Part 3: Calculated/Derived Field Formulas

**All formulas quoted verbatim from XML `FormulaField` expressions (HTML entities decoded: `&gt;` → `>`, `&lt;` → `<`, `&amp;` → `&`, `&quot;` → `"`).**

### 3.1 Complete Formula Inventory

| Field | Formula (verbatim from XML) | Input Fields | Stage Produced | Output Files | Notes |
|-------|----------------------------|--------------|----------------|--------------|-------|
| `Report Date` | `if isempty([Report Date]) then [ReportingPeriodDate] else [Report Date] endif` | `Report Date`, `ReportingPeriodDate` | Stage 1/2 | All | Coalesces to reporting period date when loan-level date is absent |
| `Loan Type` | `if [Right_Loan Type] not in (Null(),'','Null') then [Right_Loan Type] else [Loan Type] endif` | `Right_Loan Type` (join), `Loan Type` | Stage 3 | All | Right-side charge-off join value takes priority when available |
| `Loan Description` | `if !IsNull([Right_Loan Description]) and [Loan Description] = 'NULL' then [Right_Loan Description] else [Loan Description] endif` | `Right_Loan Description` (join), `Loan Description` | Stage 3 | Client File, Tableau Extract | Right-side value fills in when left side contains sentinel string 'NULL' |
| `Net Charge Off Amount` | `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif` | `Max_Report Date` (Summarize), `Charge Offs` | Stage 4 | Client File, Tableau Extract | **ACTIVE formula.** Doc 6 discrepancy: prior docs describe `[Charge Off Amount] - [Recovery Amount]` — that formula is commented-out/inactive in the XML. The active formula uses `Charge Offs` (not `Charge Off Amount`) as the fallback. |
| `Gross Charge Off Amount` | `[Charge Off Amount]` | `Charge Off Amount` | Stage 4 | Client File, Tableau Extract | Direct pass-through assignment |
| `Years until Charge off` | `if [Charge Off Amount] > 0 then max(min(7, floor(DateTimeDiff([Charge Off Date],[Origination Date],"days")/365)),0) else Null() endif` | `Charge Off Amount`, `Charge Off Date`, `Origination Date` | Stage 4 | Client File, Tableau Extract | Capped at 7 years maximum; returns Null for non-charged-off loans. XML note: removed from multi-field formula tool (738) to prevent unwanted zero generation |
| `Days from Origination` | `abs(DateTimeDiff([Origination Date],[Charge Off Date],"day"))` | `Origination Date`, `Charge Off Date` | Stage 4 | Client File | Intermediate field; drives Year 0–6 cohort flags in Stage 5. Inactive alternative using `Months from Origination * 30` is commented out |
| `Origination Quarter` | `Left([Origination Date],4)+' Q'+IIF(Substring([Origination Date],5,2) IN ('01','02','03'),'1',IIF(Substring([Origination Date],5,2) IN ('04','05','06'),'2',IIF(Substring([Origination Date],5,2) IN ('07','08','09'),'3',IIF(Substring([Origination Date],5,2) IN ('10','11','12'),'4',Null()))))` | `Origination Date` | Stage 4 | Client File, Tableau Extract | String concat: year + quarter label (e.g., "2019 Q2") |
| `Vintage Year` | `datetimeyear([Origination Date])` | `Origination Date` | Stage 4 | Client File, Tableau Extract | 4-digit integer cohort grouping key |
| `Rounded Term` | `round([Term],12)` | `Term` | Stage 4 | Client File | Rounds loan term to nearest 12-month boundary |
| `Term Grouping` | `if [Term] <= ToNumber(Right([Term1],2)) then [Term1] elseif [Term] <= ToNumber(Right([Term2],2)) then [Term2] elseif [Term] <= ToNumber(Right([Term3],2)) then [Term3] elseif [Term] <= ToNumber(Right([Term4],2)) then [Term4] else [Term5] endif` | `Term`, TextInput thresholds (`Term1`–`Term5`) | Stage 4 | Client File, Tableau Extract | Bucket boundaries sourced from TextInput tools — configurable without workflow modification |
| `Model Year` | `IIF([Model Year]!='NOT AVAILABLE',[Model Year],Null())` | `Model Year` (string, raw) | Stage 4 | Client File | Cleans 'NOT AVAILABLE' sentinel to Null; preserves valid model year strings |
| `Vehicle Age at Origination` | `if IsEmpty([Model Year]) or [Model Year]='0' or IsEmpty([Origination Date]) then Null() else datetimeyear([Origination Date])-tonumber([Model Year]) endif` | `Model Year`, `Origination Date` | Stage 4 | Client File, Tableau Extract | Auto loan field; returns Null for non-auto loans or when model year is unavailable |
| `Probability of Default` | `IIF(IsEmpty([Probability of Default]),0,[Probability of Default])` | `Probability of Default` (from PD join) | Stage 4 | Client File, Call Report | Null-coalesces to 0 when no PD join match. **Note: PD = 0 means no data available — not that default risk is zero.** |
| `Charged off past 36 Months?` | `if DateTimeDiff([Report_Date],[Charge Off Date],'months') < 36 then 1 else 0 endif` | `Report_Date`, `Charge Off Date` | Stage 4 | Client File, Tableau Extract | 0/1 recency flag for charge-off eligibility |
| `Average Annual Loss Rate` | `0` | N/A — hardcoded | Stage 4 | Client File | Static default. XML note: "Default if client does not have Fair Lending Parameters set up." |
| `OutputFilePath_Dropped` | `'\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\06_DROP_RECORDS\'+[PeerNo]+"_"+"19000101_DROPPED RECORDS"+'.yxdb'` | `PeerNo` | Stage 4 | — (path config only) | Configures the Dropped Records output tool path at runtime |
| `Originated Past 5 Years?` | `if DateTimeYear([Report_Date])-DateTimeYear([Origination Date]) < 6 then 1 else 0 endif` | `Report_Date`, `Origination Date` | Stage 4 | Client File | 0/1 flag; filters static pool to recent vintage window |
| `Charge Off % by FICO_Vintage_Group` | `if isnull([Sum_Charge Off Amount]/[Sum_Original Balance]) then 0 else [Sum_Charge Off Amount]/[Sum_Original Balance] endif` | `Sum_Charge Off Amount`, `Sum_Original Balance` (Summarize aggregations) | Stage 4 | Client File | Feeds Vintage Adjustment calculation chain in Stage 5 |
| `Charge Off % by Vintage_Group` | `if isnull([Sum_Charge Off Amount]/[Sum_Original Balance]) then 0 else [Sum_Charge Off Amount]/[Sum_Original Balance] endif` | `Sum_Charge Off Amount`, `Sum_Original Balance` (Summarize aggregations) | Stage 4 | Client File | Same null-safe ratio; grouped without FICO dimension |
| `Vintage Adjustment` (initial) | `if isnull([Avg_Charge Off % by FICO_Vintage_Group]/[Avg_Base Charge Off Rate]) then 1 else [Avg_Charge Off % by FICO_Vintage_Group]/[Avg_Base Charge Off Rate] endif` | `Avg_Charge Off % by FICO_Vintage_Group`, `Avg_Base Charge Off Rate` | Stage 4 (prior run) | — (prior run artifact) | **PRE-COMPUTED in a prior workflow run.** Current run reads as `[Right_Vintage Adjustment]` carry-in (see below). |
| `Vintage Adjustment` (±5% cap) | `if [Vintage Adjustment] > [PP Vintage Adjustment] then min([Vintage Adjustment],[PP Vintage Adjustment]+([PP Vintage Adjustment]*(.05))) elseif [Vintage Adjustment] < [PP Vintage Adjustment] then max([Vintage Adjustment],[PP Vintage Adjustment]-([PP Vintage Adjustment]*(.05))) else [Vintage Adjustment] endif` | `Vintage Adjustment`, `PP Vintage Adjustment` | Stage 4 (prior run) | — (prior run artifact) | **PRE-COMPUTED in a prior run.** Applied ±5% cap before the value was stored in prior period client file. |
| `Vintage Adjustment Flag` | `if isempty([PP Vintage Adjustment]) then "First Value" elseif [Vintage Adjustment] > [PP Vintage Adjustment] && [Vintage Adjustment] = [PP Vintage Adjustment]+([PP Vintage Adjustment]*(.05)) then "Prior +5%" elseif [Vintage Adjustment] > [PP Vintage Adjustment] then "Actual Increase" elseif [Vintage Adjustment] < [PP Vintage Adjustment] && [Vintage Adjustment] = [PP Vintage Adjustment]-([PP Vintage Adjustment]*(.05)) then "Prior -5%" elseif [Vintage Adjustment] < [PP Vintage Adjustment] then "Actual Decrease" else "Same" endif` | `Vintage Adjustment`, `PP Vintage Adjustment` | Stage 5 (prior run) | Client File, Tableau Extract | **PRE-COMPUTED CARRY-IN.** Current run reads `[Right_Vintage Adjustment Flag]` from prior period client file. Categories: "First Value" / "Prior +5%" / "Actual Increase" / "Prior -5%" / "Actual Decrease" / "Same" |
| `Year 0` | `If ([Days from Origination]) <366 then 1 else 0 endif` | `Days from Origination` | Stage 5 | Client File | Loans originated within first year (days 0–365) |
| `Year 1` | `If ([Days from Origination])<731 and ([Days from Origination])>365 then 1 else 0 endif` | `Days from Origination` | Stage 5 | Client File | Days 366–730 from origination |
| `Year 2` | `If ([Days from Origination])<1096 and ([Days from Origination])>730 then 1 else 0 endif` | `Days from Origination` | Stage 5 | Client File | Days 731–1095 from origination |
| `Year 3` | `If ([Days from Origination])<1461 and ([Days from Origination])>1095 then 1 else 0 endif` | `Days from Origination` | Stage 5 | Client File | Days 1096–1460 from origination |
| `Year 4` | `If ([Days from Origination])<1826 and ([Days from Origination])>1460 then 1 else 0 endif` | `Days from Origination` | Stage 5 | Client File | Days 1461–1825 from origination |
| `Year 5` | `If ([Days from Origination])<2191 and ([Days from Origination])>1825 then 1 else 0 endif` | `Days from Origination` | Stage 5 | Client File | Days 1826–2190 from origination |
| `Year 6` | `If ([Days from Origination])<2556 and ([Days from Origination])>2190 then 1 else 0 endif` | `Days from Origination` | Stage 5 | Client File | Days 2191–2555 from origination |
| `Expected Loss - Year 1` | `[Right_Expected Loss - Year 1]` | Prior period client file (Join) | Stage 5 | Client File, Tableau Extract | **PRE-COMPUTED CARRY-IN from prior period client file.** |
| `Expected Loss - Year 2` | `[Right_Expected Loss - Year 2]` | Prior period client file (Join) | Stage 5 | Client File, Tableau Extract | PRE-COMPUTED CARRY-IN |
| `Expected Loss - Year 3` | `[Right_Expected Loss - Year 3]` | Prior period client file (Join) | Stage 5 | Client File, Tableau Extract | PRE-COMPUTED CARRY-IN |
| `Expected Loss - Year 4` | `[Right_Expected Loss - Year 4]` | Prior period client file (Join) | Stage 5 | Client File, Tableau Extract | PRE-COMPUTED CARRY-IN |
| `Expected Loss - Year 5` | `[Right_Expected Loss - Year 5]` | Prior period client file (Join) | Stage 5 | Client File, Tableau Extract | PRE-COMPUTED CARRY-IN |
| `Expected Loss - Year 6` | `[Right_Expected Loss - Year 6]` | Prior period client file (Join) | Stage 5 | Client File, Tableau Extract | PRE-COMPUTED CARRY-IN |
| `Expected Loss - Year 7` | `[Right_Expected Loss - Year 7]` | Prior period client file (Join) | Stage 5 | Client File, Tableau Extract | PRE-COMPUTED CARRY-IN |
| `Vintage Expected Losses` | `[Right_Vintage Expected Losses]` | Prior period client file (Join) | Stage 5 | Client File, Tableau Extract | **PRE-COMPUTED CARRY-IN.** Aggregated expected loss for the vintage cohort. |
| `Vintage Adjustment` (current run) | `[Right_Vintage Adjustment]` | Prior period client file (Join) | Stage 5 | Client File, Tableau Extract | **CRITICAL: PRE-COMPUTED CARRY-IN.** The ±5% cap formula (shown above) was applied in the prior run. Current run reads the already-capped value as a static join result. |
| `PP Vintage Adjustment` | `[Right_PP Vintage Adjustment]` | Prior period client file (Join) | Stage 5 | Client File | **PRE-COMPUTED CARRY-IN.** Prior period's vintage adjustment value — used for ±5% cap comparison in next run. |
| `Vintage Adjusted Expected Losses` | `[Right_Vintage Adjusted Expected Losses]` | Prior period client file (Join) | Stage 5 | Client File, Tableau Extract | **PRE-COMPUTED CARRY-IN.** Formula in prior run: `[Vintage Expected Losses]*[Vintage Adjustment]`. |
| `Decision FICO Grade` | `IF ([Original Credit Score]=[NR] or IsEmpty([Original Credit Score])) then "NR" elseIF [Original Credit Score]>[A+] then "A+" elseIF [Original Credit Score]>[A] then "A" elseIF [Original Credit Score]>[B] then "B" elseIF [Original Credit Score]>[C] then "C" elseIF [Original Credit Score]>[D] then "D" else "E" endif` | `Original Credit Score` (TransUnion macro), TextInput thresholds (`NR`,`A+`,`A`,`B`,`C`,`D`) | Stage 6 | Client File, Tableau Extract | **XML equivalent of conceptual "Risk Score."** See correction note below. Thresholds from TextInput tools — configurable. "NR" = No Rating |
| `Average Interest Rates` | Summarize `Avg` of `Interest Rate` grouped by `Loan Subgroup`, `Term Grouping`, `Decision FICO Grade`, `Vehicle Age at Origination`, `Origination Quarter` — output field name `Avg_Interest Rate` renamed to `Average Interest Rates` via Select | `Interest Rate` (all peer group records) | Stage 6 | — (intermediate; deselected by tool 998) | Peer group average rate. Not a direct source field — computed as Summarize aggregation. |
| `Rate Differential (Pre)` | `abs([Average Interest Rates]-[Interest Rate])` | `Average Interest Rates`, `Interest Rate` | Stage 6 | — (intermediate; deselected) | Absolute value spread used for outlier detection phase 1 |
| `Outlier?` | Phase 1: `0` (all records); Phase 2: `1` (outliers only) | `Rate Differential (Pre)`, threshold | Stage 6 | Client File | Two-step formula: first marks all 0, then overrides outliers to 1 |
| `Include in Fair Lending?` | Phase 1: `1` (all records); Phase 2: `0` (outlier override) | `Outlier?` flag | Stage 6 | Client File | Inverse of `Outlier?`; `1` = included in fair lending analysis |
| `Rate Differential` | `[Average Interest Rates]-[Interest Rate]` | `Average Interest Rates`, `Interest Rate` | Stage 6 | Client File, Tableau Extract | Signed spread (positive = above peer average). `Average Interest Rates` is deselected after this calculation (Select tool 998). |
| `Predicted Ethnicity` | BISG-style max-probability assignment from Zip Code Ethnicity Index lookup | Zip code field, `Zip Code Ethnicity Index.csv` | Stage 6 | Client File, Tableau Extract | Proxy ethnicity method — assigns max-probability demographic category from zip distribution. Categories: White/Black/Asian/American Indian/Multi Race/Hispanic/Exclude From Model |
| `Predicted Gender` | TransUnion Mask_FICO Only_v2 macro output | TransUnion data (masked) | Stage 6 | Client File, Tableau Extract | Null/empty coerced to "Exclude From Model" |
| `Credit Rating` | `IF [Form 5300 Schedule B Account Num] in ("NV0023","NV0001","NV0021","NV0033","NV0003","NV0035") then null() else [Credit Rating] endif` then `if [Credit Rating] in ("N/A","N/R","NR") then null() else [Credit Rating] endif` | `Form 5300 Schedule B Account Num`, `Credit Rating` | Stage 4 | Securities Output | Two-step cleanup: nulls out specific account numbers, then nulls out NR-equivalent labels |
| `No Loss Rate?` | `"Yes"` | N/A — hardcoded | Stage 4 | Client File | Static sentinel flag indicating no client-supplied loss rate |

---

### 3.2 LIN-04 Priority Fields — Key Derived Fields with Full Lineage

#### Decision FICO Grade (XML Equivalent of Conceptual "Risk Score")

**Correction notice:** Doc 6 references a field named `Risk_Score` described as a composite numeric formula. **This field does not exist in the XML.** The XML equivalent is `Decision FICO Grade` — a categorical string field (values: NR / A+ / A / B / C / D / E) produced by an IF/ELSEIF grading formula in Stage 6.

- **Source:** `Original Credit Score` (Double) — originates from TransUnion credit bureau data, loaded via `TransUnion Mask_FICO Only_v2.yxmc` macro (Source 4). All other TransUnion fields are masked; only this score passes into the main workflow.
- **Stage:** 6 (Fair Lending / Compliance Masking)
- **Formula:** `IF ([Original Credit Score]=[NR] or IsEmpty([Original Credit Score])) then "NR" elseIF [Original Credit Score]>[A+] then "A+" elseIF [Original Credit Score]>[A] then "A" elseIF [Original Credit Score]>[B] then "B" elseIF [Original Credit Score]>[C] then "C" elseIF [Original Credit Score]>[D] then "D" else "E" endif`
- **Threshold inputs:** `[NR]`, `[A+]`, `[A]`, `[B]`, `[C]`, `[D]` are TextInput tool values — configurable without modifying the workflow formula
- **Output files:** Client File, Tableau Extract
- **Also used as:** One of the 5 GroupBy dimensions in the `Average Interest Rates` Summarize aggregation (along with `Loan Subgroup`, `Term Grouping`, `Vehicle Age at Origination`, `Origination Quarter`)

---

#### Net Charge Off Amount

**Formula discrepancy with Doc 6:** Doc 6 describes the formula as `[Charge Off Amount] - [Recovery Amount]`. The current active XML formula is a **conditional** that uses `Charge Offs` (a separate field), not simple subtraction.

- **Source:** `Charge Offs` field — CU-uploaded charge-off file (Source 2). Distinct from `Charge Off Amount`.
- **Supporting source:** `Max_Report Date` — a Summarize aggregation of the maximum `Report Date` in the dataset, used as the conditional gate.
- **Stage:** 4 (Calculations and Enrichment)
- **Active formula:** `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif`
- **Inactive formula (commented out):** `[Charge Off Amount]-[Recovery Amount]` — this was the prior version documented in older docs
- **Output files:** Client File, Tableau Extract

---

#### Vintage Adjusted Expected Losses

**Key insight:** This field is NOT recalculated in the current workflow run. It is a static value carried in from the prior period client file.

- **Source chain:** Prior period client file (`[PeerNo]_[prev date]_CLIENT_FILE.yxdb`) → Stage 5 Join → `[Right_Vintage Adjusted Expected Losses]` → current period records
- **Prior-run formula (for historical reference):** `[Vintage Expected Losses] * [Vintage Adjustment]`
  - Where `Vintage Expected Losses` was itself a carry-in from the period before that
  - And `Vintage Adjustment` had the ±5% cap formula applied: `if [Vintage Adjustment] > [PP Vintage Adjustment] then min([Vintage Adjustment],[PP Vintage Adjustment]+([PP Vintage Adjustment]*(.05))) elseif [Vintage Adjustment] < [PP Vintage Adjustment] then max([Vintage Adjustment],[PP Vintage Adjustment]-([PP Vintage Adjustment]*(.05))) else [Vintage Adjustment] endif`
- **Stage:** 5 (Static Pool / Vintage Cohort Construction) — carry-in only
- **Output files:** Client File, Tableau Extract
- **Implication for analysts:** If this value looks wrong, the root cause is in a prior period's workflow run, not the current run.

---

#### Probability of Default

- **Source 1:** `CallReportDataShort.yxdb` — call report data appended with PD, Total Assets, Net Worth, ALLL (quarterly enrichment). UNC path: `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb`
- **Source 2:** `0000_20170125_PROBABILITY OF DEFAULT.xlsx` — static PD lookup table. UNC path: `\\10.2.7.56\Shared\PortfolioAnalysis\02_TTA_Files\05_Other\0000_20170125_PROBABILITY OF DEFAULT.xlsx`
- **Stage:** 4 (Calculations and Enrichment) — null-coalesce applied after join
- **Formula:** `IIF(IsEmpty([Probability of Default]),0,[Probability of Default])`
- **Output files:** Client File, Call Report (appended back to `CallReportDataShort.yxdb`)
- **Interpretation note:** A value of 0 does NOT mean zero default risk. It means no PD data was available for this record at processing time (no matching join record). This is a data coverage gap, not a risk signal.

---

#### Rate Differential

**Important:** `Average Interest Rates` is NOT a source field from CU-uploaded data. It is computed as a Summarize aggregation within Stage 6 before the `Rate Differential` formula runs.

- **Source:** `Interest Rate` (Double) — CU-uploaded loan portfolio file (Source 1)
- **Intermediate computation — Average Interest Rates:**
  1. Summarize tool: `Avg` of `Interest Rate`, grouped by `Loan Subgroup`, `Term Grouping`, `Decision FICO Grade`, `Vehicle Age at Origination`, `Origination Quarter` → output field: `Avg_Interest Rate`
  2. Select tool: rename `Right_Avg_Interest Rate` → `Average Interest Rates` (joined back to individual records)
- **Stage:** 6 (Fair Lending / Compliance Masking)
- **Formulas:**
  - `Rate Differential (Pre)` = `abs([Average Interest Rates]-[Interest Rate])` — used for outlier detection
  - `Rate Differential` = `[Average Interest Rates]-[Interest Rate]` — signed value for fair lending analysis (positive = above peer average)
- **Note:** Both `Average Interest Rates` and `Rate Differential (Pre)` are deselected after use (Select tool 998) and do not appear in output files
- **Output files:** `Rate Differential` → Client File, Tableau Extract

---

## Part 4: Output Field Mapping

**All 5 output file paths confirmed from XML `FormulaField` and file path extraction.**

---

### 4.1 Client File

**Path:** `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\01_CLIENT_FILES\[PeerNo]_[YYYYMMDD]_CLIENT_FILE.yxdb`
**Format:** Alteryx binary (.yxdb)
**Output tool:** DbFileOutput (direct — no macro wrapper)
**Content:** All processed loan records with calculated fields from Stages 1–6. The primary downstream artifact — feeds Tableau Extract (4.2), and is also the prior period client file used in next-period Stage 5 joins.

| Field | Source Stage | Notes |
|-------|-------------|-------|
| All Source 1 loan portfolio fields | Stage 1 | Pass-through from CU-uploaded loan file |
| `Loan Type`, `Loan Description` | Stage 3 | Coalesced from charge-off join |
| `LTV`, `Current LTV`, `Original LTV` | Stage 2 | Passed through from Append RE Values macro; null-coalesced to 0 |
| `Days Past Due` | Stage 2 | Passed through from CU source; null-coalesced to 0 |
| `Net Charge Off Amount`, `Gross Charge Off Amount` | Stage 4 | Calculated from Source 2 charge-off data |
| `Years until Charge off`, `Days from Origination` | Stage 4 | Date arithmetic from Origination + Charge Off dates |
| `Origination Quarter`, `Vintage Year` | Stage 4 | Derived from Origination Date |
| `Rounded Term`, `Term Grouping` | Stage 4 | Term normalization and bucketing |
| `Vehicle Age at Origination`, `Model Year` | Stage 4 | Auto loan fields; Null for non-auto |
| `Probability of Default` | Stage 4 | Join from CallReportDataShort + PD lookup; 0 if no match |
| `Charged off past 36 Months?`, `Originated Past 5 Years?` | Stage 4 | Date-relative boolean flags |
| `Average Annual Loss Rate` | Stage 4 | Static 0 (placeholder) |
| `Charge Off % by FICO_Vintage_Group`, `Charge Off % by Vintage_Group` | Stage 4 | Summarize-based ratio fields |
| `Year 0`–`Year 6` | Stage 5 | Cohort day-range boolean flags |
| `Expected Loss - Year 1`–`Year 7` | Stage 5 | PRE-COMPUTED CARRY-IN from prior period |
| `Vintage Expected Losses`, `Vintage Adjustment`, `PP Vintage Adjustment` | Stage 5 | PRE-COMPUTED CARRY-IN from prior period |
| `Vintage Adjusted Expected Losses` | Stage 5 | PRE-COMPUTED CARRY-IN from prior period |
| `Vintage Adjustment Flag` | Stage 5 | PRE-COMPUTED CARRY-IN; categorical label |
| `Decision FICO Grade` | Stage 6 | Credit grade from TransUnion score + TextInput thresholds |
| `Rate Differential` | Stage 6 | Signed spread vs. peer group average |
| `Include in Fair Lending?`, `Outlier?` | Stage 6 | Two-phase outlier elimination flags |
| `Predicted Ethnicity`, `Predicted Gender` | Stage 6 | Demographic proxy fields (fair lending compliance) |
| `No Loss Rate?` | Stage 4 | Static "Yes" sentinel |

---

### 4.2 Tableau Extract (via Tableau New Macro 1055)

**Path:** `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\02_TDE\[PeerNo]_[YYYYMMDD]_CLIENT_FILE.hyper`
**Format:** Tableau Hyper (.hyper) — migrated from legacy .tde format
**Output tool:** Tableau New Macro 1055 (wraps Tableau publishing logic)
**Content:** Dashboard-optimized subset of Client File fields for Tableau workbook consumption.

**Format migration note:** The folder is still named `02_TDE` (legacy name from the `.tde` era), but the actual output file format is `.hyper`. This is a known naming inconsistency — do not interpret folder name as indicating `.tde` format.

| Field | Source Stage | Notes |
|-------|-------------|-------|
| All Client File fields (subset) | Stages 1–6 | Dashboard-relevant fields from Client File; exact Select field list requires Tableau Macro 1055 XML inspection (Phase 6) |
| Key analytical fields confirmed present: `Net Charge Off Amount`, `Years until Charge off`, `Decision FICO Grade`, `Vintage Adjusted Expected Losses`, `Rate Differential`, `Predicted Ethnicity`, `Origination Quarter`, `Vintage Year` | Stages 4–6 | Confirmed from Stage 7 documentation and plan interfaces block |

---

### 4.3 Dropped Records (via Tableau New Macro 1056)

**Path:** `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\06_DROP_RECORDS\[PeerNo]_19000101_DROPPED RECORDS.yxdb`
**Format:** Alteryx binary (.yxdb)
**Output tool:** Tableau New Macro 1056
**Content:** Records excluded from the main processing stream. These are loans that failed filter conditions during preprocessing and were separated from the main analytical dataset.

**Note on path construction:** The `OutputFilePath_Dropped` field is computed in Stage 4 as a formula: `'\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\06_DROP_RECORDS\'+[PeerNo]+"_"+"19000101_DROPPED RECORDS"+'.yxdb'`. The output tool path is overridden at runtime using this field.

| Field | Source Stage | Notes |
|-------|-------------|-------|
| Dropped record identifier fields | Stage 1–2 | Loan identifiers sufficient to trace back to source file |
| Drop reason / filter condition fields | Stage 2 | Reason why record was excluded; specific field names require macro XML inspection (Phase 6) |

---

### 4.4 Securities Output (via Tableau New Macro 1057)

**Path:** `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\14_SECURITIES\[PeerNo]_19000101_SECURITIES.yxdb`
**Format:** Alteryx binary (.yxdb)
**Output tool:** Tableau New Macro 1057
**Content:** Output from the Securities/Call Report processing stream — a separate data flow from the main loan processing stream.

**Source stream:** `SecuritiesTmp.yxdb` (staging file at `\\10.2.7.56\Shared\PortfolioAnalysis\99_References\SecuritiesTmp.yxdb`) — populated from `0000_19001231_SECURITIES.yxdb` (TTA internal securities reference file).

| Field | Source Stage | Notes |
|-------|-------------|-------|
| Securities data fields | Source 1.5 / Stage 4 | Fields from `0000_19001231_SECURITIES.yxdb` reference file; exact field list requires Phase 6 inspection of securities processing sub-stream |
| `Probability of Default` (securities-side) | Stage 4 | Join-appended PD for securities records |
| `Total Assets`, `Net Worth`, `ALLL` | Stage 4 | Appended from call report data (XML annotation: "Adding 3 fields from the call report data each quarter") |

---

### 4.5 Call Report / Regulatory Append

**Path:** `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb`
**Format:** Alteryx binary (.yxdb)
**Output tool:** DbFileOutput (direct)
**Content:** Enriched call report data — the original `CallReportDataShort.yxdb` supplemented with 3 appended fields from the current processing run.

**Note:** This output overwrites (or appends to) the same file that was used as a reference input (Section 1.5). This is a read-then-write pattern — the workflow reads the call report for PD enrichment, then appends current-period results back.

| Field | Source Stage | Notes |
|-------|-------------|-------|
| Existing call report fields (pass-through) | Input | All fields from `CallReportDataShort.yxdb` input |
| `Probability of Default` (appended) | Stage 4 | Per-quarter PD value appended for current period |
| `Total Assets` (appended) | Stage 4 | Current period total assets |
| `Net Worth` (appended) | Stage 4 | Current period net worth |
| `ALLL` (appended) | Stage 4 | Allowance for Loan and Lease Losses |

---

### Executive Summary Output (Open Question)

**Status:** Not confirmed as a distinct output file path in the XML.

The `PortfolioComposerTable` tool (1 instance, ToolID 954) generates an HTML-formatted summary table with these fields: `Project Name`, `Credit Union`, `PeerNo`, `Project Date`, `Timestamp`, `Username`, `PeerGroupName`, `Vintage Adjustment Flag`, `Count`. Output field: `Table` (type: `V_WString`).

The destination of this HTML table is not confirmed from the main XML — it may represent the "Executive Summary" output referenced in project requirements, or it may feed an email notification workflow (XML contains annotation "Email functionality" in proximity to this tool). The tool receives a downstream connection but the final output tool receiving the `Table` field is not visible from the current XML extraction.

**This does not block LIN-03 completion.** The 5 confirmed output paths above satisfy the requirement. This open question is flagged for Phase 6 investigation.

---

## Part 5: End-to-End Traceability Examples

**These examples demonstrate the primary use case: given an output field, trace it back to its source without opening the XML. Use Part 3 for formula detail and Part 4 for output file confirmation.**

---

### Example 1: Tracing "Net Charge Off Amount" to Source

**Question:** Where does `Net Charge Off Amount` in the Client File come from?

**Trace:**

| Step | Location | What Happens |
|------|----------|--------------|
| 1 | Source 2: CU-uploaded charge-off file | `Charge Offs` field originates in the credit union's charge-off data file (note: this is a distinct field from `Charge Off Amount`) |
| 2 | Source 2: CU-uploaded charge-off file | `Charge Off Amount` also originates here — it is a separate field used for other calculations but not the active `Net Charge Off Amount` formula |
| 3 | Stage 1: JSON Entry Point | Charge-off file routed via `FileGroupNum` from JSON metadata → DynamicInput → `ChargeOffTmp.yxdb` staging file |
| 4 | Stage 3: Data Matching and Consolidation | `ChargeOffTmp.yxdb` joined to loan portfolio records on loan identifier. `Charge Offs` appended to each matched loan record. |
| 5 | Stage 4: Calculations and Enrichment | Summarize tool computes `Max_Report Date` — the maximum reporting date in the dataset — to serve as a conditional gate |
| 6 | Stage 4: Calculations and Enrichment | Formula applied: `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif`. When `Max_Report Date` is populated (normal case), the field carries its existing value. When empty (first period or fresh record), falls back to `[Charge Offs]`. |
| 7 | Stage 7: Output Preparation and Publication | Record set written to Client File and Tableau Extract via DbFileOutput and Macro 1055 respectively |
| Final | Output: Client File + Tableau Extract | `Net Charge Off Amount` appears in `[PeerNo]_[YYYYMMDD]_CLIENT_FILE.yxdb` and `[PeerNo]_[YYYYMMDD]_CLIENT_FILE.hyper` |

**Answer:** `Net Charge Off Amount` in the Client File originates from the `Charge Offs` field in the CU-uploaded charge-off file (Source 2), transformed by a conditional formula at Stage 4 that uses `Max_Report Date` as a gate.

**Doc 6 discrepancy:** Older documentation describes the formula as `[Charge Off Amount] - [Recovery Amount]`. This formula exists in the XML as a commented-out (inactive) alternative. The currently active formula is the conditional shown above and does not use `Recovery Amount`.

**Cross-reference:** See Part 3 → `Net Charge Off Amount` entry for full formula detail.

---

### Example 2: Tracing "Decision FICO Grade" to Source

**Question:** Where does `Decision FICO Grade` in the Client File come from?

**Trace:**

| Step | Location | What Happens |
|------|----------|--------------|
| 1 | Source 4: TransUnion credit bureau | `Original Credit Score` (Double) — the borrower's credit score at origination — originates from TransUnion bureau data |
| 2 | Source 4: `TransUnion Mask_FICO Only_v2.yxmc` macro | Macro loads TransUnion data and **masks all fields except `Original Credit Score`**. Only the credit score passes into the main workflow stream (privacy/compliance masking). |
| 3 | Stage 2: PreProcess / Field Standardization | `Original Credit Score` enters the main processing stream. Numeric null-coalesce applied: `IIF(IsEmpty([_CurrentField_]),0,[_CurrentField_])` |
| 4 | Stage 6: Fair Lending / Compliance Masking | Formula assigned: `IF ([Original Credit Score]=[NR] or IsEmpty([Original Credit Score])) then "NR" elseIF [Original Credit Score]>[A+] then "A+" elseIF [Original Credit Score]>[A] then "A" elseIF [Original Credit Score]>[B] then "B" elseIF [Original Credit Score]>[C] then "C" elseIF [Original Credit Score]>[D] then "D" else "E" endif`. Threshold values `[NR]`, `[A+]`, `[A]`, `[B]`, `[C]`, `[D]` come from TextInput tools. |
| 5 | Stage 6: Fair Lending | `Decision FICO Grade` is also used as one of the 5 GroupBy dimensions in the `Average Interest Rates` Summarize aggregation (fair lending peer group computation) |
| 6 | Stage 7: Output Preparation and Publication | Record set written to Client File and Tableau Extract |
| Final | Output: Client File + Tableau Extract | `Decision FICO Grade` appears in `[PeerNo]_[YYYYMMDD]_CLIENT_FILE.yxdb` and `[PeerNo]_[YYYYMMDD]_CLIENT_FILE.hyper` |

**Answer:** `Decision FICO Grade` in the Client File originates from `Original Credit Score` (TransUnion bureau data via Source 4 macro), transformed by a multi-tier IF/ELSEIF grading formula at Stage 6 that uses configurable TextInput thresholds.

**Correction note:** `Decision FICO Grade` is the XML equivalent of the conceptual "Risk_Score" described in Doc 6. A numeric `Risk_Score` field with a composite formula does **not** exist in the XML. All references to `Risk_Score` in prior documentation should be understood as referring to `Decision FICO Grade`.

**Cross-reference:** See Part 3 → `Decision FICO Grade` and the LIN-04 Priority Fields subsection for full detail.

---

### Example 3: Tracing "Vintage Adjusted Expected Losses" to Source

**Question:** Where does `Vintage Adjusted Expected Losses` in the Client File come from?

**Trace:**

| Step | Location | What Happens |
|------|----------|--------------|
| 1 | Prior period workflow run | `Vintage Adjusted Expected Losses` was **computed in a prior workflow run**, not the current run. The computation in that prior run was: `[Vintage Expected Losses] * [Vintage Adjustment]` |
| 2 | Prior period run — Vintage Adjustment computation | In that prior run, `Vintage Adjustment` was itself computed from: `[Avg_Charge Off % by FICO_Vintage_Group] / [Avg_Base Charge Off Rate]`, then capped by the ±5% formula against the previous period's adjustment |
| 3 | Prior period run — Stage 7: Output | The result was written to the prior period's Client File: `[PeerNo]_[prev date]_CLIENT_FILE.yxdb` |
| 4 | Current run — Stage 5: Static Pool / Vintage Cohort Construction | Current run reads the prior period Client File via a Join tool. The join carries in `[Right_Vintage Adjusted Expected Losses]`. |
| 5 | Current run — Stage 5: Formula tool | Formula: `[Right_Vintage Adjusted Expected Losses]` — a direct pass-through of the joined value. No recalculation. |
| 6 | Current run — Stage 7: Output | Record set (with carried-in value) written to current period Client File |
| Final | Output: Client File + Tableau Extract | `Vintage Adjusted Expected Losses` appears in `[PeerNo]_[YYYYMMDD]_CLIENT_FILE.yxdb` and `[PeerNo]_[YYYYMMDD]_CLIENT_FILE.hyper` |

**Answer:** `Vintage Adjusted Expected Losses` in the current period Client File is a **pre-computed carry-in** from the prior period Client File. It was calculated in a previous run as `[Vintage Expected Losses] * [Vintage Adjustment]` (with the ±5% cap applied at that time) and is read as a static Join value in the current run. The current run does not recalculate this field.

**Implication for data issues:** If this value appears incorrect, the root cause lies in a prior workflow run. Debugging requires examining the prior period's Client File or re-running the prior period.

**Cross-reference:** See Part 3 → `Vintage Adjusted Expected Losses` and the LIN-04 Priority Fields subsection.

---

### Example 4: Tracing "Probability of Default" to Source (Tableau Dashboard → Source)

**Question:** A Tableau dashboard shows `Probability of Default` for a credit union. Where does this value come from?

**Trace:**

| Step | Location | What Happens |
|------|----------|--------------|
| 1 | Source 1.5: `0000_20170125_PROBABILITY OF DEFAULT.xlsx` | Static PD lookup table maintained by TTA. Contains PD rates by loan category. UNC: `\\10.2.7.56\Shared\PortfolioAnalysis\02_TTA_Files\05_Other\0000_20170125_PROBABILITY OF DEFAULT.xlsx` |
| 2 | Source 1.5: `CallReportDataShort.yxdb` | Quarterly call report data with enriched PD values already appended from previous runs. UNC: `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb` |
| 3 | Stage 4: Calculations and Enrichment | Join tool matches loan records to PD data from sources above |
| 4 | Stage 4: Formula tool | Null-coalesce applied: `IIF(IsEmpty([Probability of Default]),0,[Probability of Default])`. Records with no PD join match receive a value of 0. |
| 5 | Stage 7: Output | Written to Client File (for Tableau Extract) and also appended back to `CallReportDataShort.yxdb` (Call Report output) |
| 6 | Tableau Extract: Macro 1055 | Client File field set (including `Probability of Default`) written to `.hyper` file at `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\02_TDE\[PeerNo]_[YYYYMMDD]_CLIENT_FILE.hyper` |
| Final | Output: Tableau Extract | `Probability of Default` consumed by Tableau workbook from the `.hyper` extract |

**Answer:** `Probability of Default` in the Tableau dashboard originates from either the static PD lookup table (`0000_20170125_PROBABILITY OF DEFAULT.xlsx`) or the call report data (`CallReportDataShort.yxdb`), enriched at Stage 4 via a join and null-coalesced to 0 when no match exists. It reaches Tableau via the `.hyper` extract file produced by Macro 1055.

**Interpretation note:** A `Probability of Default` of 0 in the dashboard indicates **no PD data was available** for that loan record at processing time — it is a data coverage gap, not a risk assessment of zero default probability.

**Cross-reference:** See Part 3 → `Probability of Default` and the LIN-04 Priority Fields subsection. See Part 4 → Section 4.2 for Tableau Extract output details.

---

## Document Completeness Checklist

Use this checklist to verify the lineage map covers all phase requirements:

- [ ] LIN-01: Can trace any output field to a source system — See Part 5 examples + Part 3 cross-references
- [ ] LIN-02: 7 processing stages documented with field-level transformations — See Part 2 (Stages 1–7)
- [ ] LIN-03: Output file mapping for all 5 output types — See Part 4 (Sections 4.1–4.5)
- [ ] LIN-04: Derived fields with formulas — See Part 3 (all 40+ fields) + LIN-04 Priority Fields subsection (5 fields with expanded source → formula → output chains)

**Known open questions (to be resolved in Phase 6 — Macro Inventory):**

- **LTV field:** `LTV`, `Current LTV`, `Original LTV` are confirmed pass-through fields from CU-uploaded source files, null-coalesced in PreProcess. Internal computation formula (if any) lives inside `Append RE Values.yxmc` macro — requires Phase 6 macro XML inspection.
- **Delinquency_Rate / Charge_Off_Rate:** Not found as `FormulaField` targets in the main XML scan. `Days Past Due` is the record-level delinquency field (Source 1 pass-through). If a `Delinquency_Rate` aggregate exists, it is likely a Summarize tool aggregation inside a macro or a downstream Tableau calculated field.
- **Tableau Extract exact field list:** The specific fields selected into the `.hyper` file via Macro 1055 require inspection of the Tableau macro XML (Phase 6).
- **Dropped Records field list:** The specific identifier and reason fields in the Dropped Records output require inspection of Macro 1056 XML (Phase 6).
- **Executive Summary output:** `PortfolioComposerTable` tool (ToolID 954) output destination unconfirmed. May feed email notification or represent the informal "Executive Summary" concept from project requirements. Requires Phase 6 inspection of the tool's downstream connection.
- **Fair Lending output scope:** Which output files receive `Predicted Ethnicity` and `Predicted Gender` beyond the Client File — requires confirmation from Macro 1055 field selection list.
