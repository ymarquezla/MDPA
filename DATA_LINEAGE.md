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
