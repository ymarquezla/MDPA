# MDPA Gap Analysis Report — Phase 1: Documentation Audit

**Generated:** 2026-03-18
**Workflow:** 2020_DataProcess_v5.2.yxmd (49,082 lines XML)
**Docs Audited:** 14 files (1_MDPA_PROCESS_DOCUMENTATION.md through 14_SECURITIES_COLLATERAL_GUIDE.md)
**Phase:** 1 of 9 — Audit only (no severity ratings; see Phase 2 for prioritization)
**Ground truth:** XML file is authoritative. Doc claims are treated as hypotheses verified against XML.

---

## Executive Summary

| Gap Type | Count |
|----------|-------|
| GAP-01: Undocumented Logic | 11 |
| GAP-02: Broken/At-Risk Dependencies | 20 |
| GAP-03: Incomplete/Contradictory Coverage | 10 |
| **Total** | **41** |

---

## GAP-01: Undocumented Workflow Logic

| Gap ID | Location in XML | Finding | Doc Coverage |
|--------|----------------|---------|--------------|
| G01-001 | ToolContainer "Fair Lending Analysis" — tools grouped around `Ethnic & Gender ID.yxmc` macro + Formula/Filter tools using `Rate Differential`, `Average Interest Rates`, `Include in Fair Lending?` | Fair Lending ethnicity prediction pipeline: computes `Predicted Ethnicity` (6 categories: White, Black, Asian, American Indian, Multi Race, Hispanic), `Predicted Gender`, `Ethnicity Confidence`, and `Predicted Description` from a zip-code demographic lookup file (`\Consulting_Client_Files\2020\0000_OTHER\Alan\Fair Lending Files\Zip Code Ethnicity Index.csv`). Runs two-phase outlier elimination comparing `Rate Differential` against `Average Interest Rates`. Computes `Include in Fair Lending?` flag. Assigns `Decision FICO Grade` (A+/A/B/C/D/E) tiers based on original credit score thresholds. The Zip Code Ethnicity Index CSV is at a client-specific consulting path from a 2020 Dover engagement. | Doc 4 mentions "Fair Lending Files" only as a data source type. No doc describes the ethnicity prediction algorithm, the two-phase outlier elimination, the `Decision FICO Grade` tiers, or the `Include in Fair Lending?` flag logic. Not covered in any of the 14 docs. |
| G01-002 | Formula tool — `Vintage Adjustment Flag` field; MultiRowFormula tool — `Vintage Adjustment` cap calculation | Vintage Adjustment ±5% cap formula: `if [Vintage Adjustment] > [PP Vintage Adjustment] then min([Vintage Adjustment], [PP Vintage Adjustment] + ([PP Vintage Adjustment] * 0.05)) elseif [Vintage Adjustment] < [PP Vintage Adjustment] then max([Vintage Adjustment], [PP Vintage Adjustment] - ([PP Vintage Adjustment] * 0.05)) else [Vintage Adjustment] endif`. Result is categorized into 6 flag values: "First Value", "Prior +5%", "Prior -5%", "Actual Increase", "Actual Decrease", "Same". This dampening logic prevents vintage adjustment values from changing more than ±5% between prior period and current period. | No doc describes the ±5% dampening cap, its business rationale, or the 6 `Vintage Adjustment Flag` values. `Vintage Adjustment` is mentioned in docs as an output field but the formula capping it to ±5% of the prior period value is absent from all 14 docs. |
| G01-003 | TextBox annotation + `DbFileInput` and `DbFileOutput` tools referencing `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb` | Call Report / Securities Default Probability logic: annotation text reads "brings in default probabilities on securities" added 2022-12-09 by DPrice. The `CallReportDataShort.yxdb` file appears at the same UNC path as both an input (`DbFileInput`) and an output (`DbFileOutput`) in the XML — the workflow reads existing call report data, enriches it with default probability logic, and writes back to the same file. This read-before-write pattern at a shared network path is a potential ordering dependency. | Not described as a processing step in any doc. Doc 4 lists `CallReportDataShort.yxdb` as an output file only; the fact that it is also read as an input is not documented. The "default probabilities on securities" enrichment logic added in December 2022 is entirely absent from all 14 docs. |
| G01-004 | Formula tools generating `Year 0` through `Year 6` boolean fields + `Vintage Year` field + `Expected Loss - Year 1` through `Expected Loss - Year 7` fields — grouped inside ToolContainer for static pool cohort construction | Static Pool / Vintage Year cohort construction: the workflow generates a `Vintage Year` field (origination year extracted from origination date), then computes Year 0 through Year 6 boolean flags based on days from origination bucketed into annual cohorts. From these cohorts it derives `Expected Loss - Year 1` through `Expected Loss - Year 7` fields representing expected loss curves by loan age. This is the core static pool methodology underlying the allowance model. | Doc 12 (Tableau Dashboard Glossary) references `Vintage Year` as a Tableau dimension and mentions expected loss fields as dashboard metrics. No doc describes the cohort construction algorithm, how Year 0–Year 6 boolean flags are derived from origination dates, or how the Expected Loss Year 1–7 progression is computed. The static pool methodology as a workflow processing step is not described in any of the 14 docs. |
| G01-005 | `Plugin="AlteryxBasePluginsGui.MultiFieldFormula.MultiFieldFormula"` — 10 instances across the workflow at various tool IDs | MultiFieldFormula tools (10 instances): these tools apply a single formula expression across multiple fields simultaneously (e.g., `UPPERCASE([_CurrentField_])` applied to all string fields, or empty-string-to-null conversion applied to all numeric fields). They are used for bulk field standardization passes — converting field types, normalizing case, and replacing empty strings with null values across entire record schemas at once. The `_CurrentField_` variable references the active field in the multi-field loop. | Not mentioned as a tool type in any of the 14 docs. Doc 1 and doc 2 describe the workflow tool inventory but enumerate Formula, Select, Filter, and Join tools without mentioning `MultiFieldFormula` at all. The existence of 10 MultiFieldFormula instances performing bulk standardization is entirely absent from doc coverage. |
| G01-006 | `Plugin="AlteryxBasePluginsGui.JSONParse.JSONParse"` tool + `Plugin="AlteryxBasePluginsGui.RegEx.RegEx"` tools + Filter tools → `FileGroupNum`, `Info`, `RowNum`, `Header` fields → `Plugin="AlteryxBasePluginsGui.DynamicInput.DynamicInput"` tools (4 instances) | JSON parsing and dynamic file routing entry point: the workflow receives a portal JSON payload as input, uses `JSONParse` to decompose it into key-value pairs, then applies `RegEx` and `Filter` tools to extract `FileGroupNum` (numeric routing key), `Info` (metadata string), `RowNum` (row identifier), and `Header` (column header mapping). These four derived fields drive `DynamicInput` tools that select and load different client file groups based on the parsed `FileGroupNum`. This is the mechanism by which a single workflow handles multiple client institutions per run. | Doc 2 (Workflow Architecture) mentions that the workflow "accepts JSON configuration" and "routes files dynamically" but does not describe the `JSONParse` → `RegEx` → `Filter` pipeline, the four derived routing fields, or how `DynamicInput` tools consume them. The mechanics of multi-client file routing are not described in any doc. |
| G01-007 | `DbFileInput` tool reading `02_TTA_Files\06_Participations\0000_MASTER_PARTICIPATIONS.yxdb` + TextBox annotation "Participation Loans Historical Master" | Participation Loans Historical Master: the workflow reads `0000_MASTER_PARTICIPATIONS.yxdb` from the participations subdirectory. The TextBox annotation identifies this as "Participation Loans Historical Master." This dataset contains historical records for loans that the institution has purchased a participating interest in (rather than originated directly). The workflow logic for how participation loan records are matched, merged, or distinguished from originated loans downstream is not visible in docs. | Doc 4 lists `0000_MASTER_PARTICIPATIONS.yxdb` in the data sources table as a source file for participation loan data. No doc describes how participation loan records are processed after ingestion — specifically how they are matched against the main loan stream, what fields are used for joining, whether they follow a different calculation path, or how they contribute to the final output. |
| G01-008 | Formula tools — `Charged off past 36 Months?` and `Originated Past 5 Years?` field expressions — present in XML Formula tool configurations | Calculated flag fields absent from documentation: `Charged off past 36 Months?` is a boolean formula field (true if the loan had a charge-off event within the 36 months preceding the report date). `Originated Past 5 Years?` is a boolean formula field (true if origination date is within 5 years of report date). Both are computed from date arithmetic in Formula tools. These flags are used downstream for filtering and segmentation in the static pool and historical analysis logic. | Neither `Charged off past 36 Months?` nor `Originated Past 5 Years?` appear in doc 6 (Field Mapping and Data Lineage) or doc 9 (Business Data Glossary). Doc 6 defines 200+ fields but omits these two boolean calculated fields. Doc 9's glossary covers core business terms but does not define either flag's business meaning or calculation rule. Not covered in any of the 14 docs. |
| G01-009 | `EngineSettings Macro="D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-..._externals\1\2020_PublishSecurities2Server.yxmc"` — stored in `_externals\1\` subdirectory, not the standard `Macros\` directory | `2020_PublishSecurities2Server.yxmc` macro — present in XML at `_externals\1\` path but absent from both macro documentation files. This macro publishes the securities output file to the server at `03_Results\14_SECURITIES\[PEERID]_19000101_SECURITIES.yxdb`. The `_externals\1\` path pattern indicates this macro was packaged as an external add-on, not embedded alongside the other custom macros. It handles a distinct output stream (securities collateral data) separate from the main client file publication macros (`2020_Publish2Server.yxmc` and `2020_PublishDropped2Server.yxmc`). | Doc 3 (Macros and Dependencies) lists the macro inventory and omits `2020_PublishSecurities2Server.yxmc` entirely. Doc 7 (Macros Deep Dive) provides a 23-macro count and detailed descriptions but also omits this macro. Doc 14 (Securities Collateral Guide) describes the securities output but does not mention the publishing macro responsible for writing it. Absent from all 14 docs. |
| G01-010 | `Plugin="AlteryxBasePluginsGui.Unique.Unique"` — 2 instances + `Plugin="AlteryxBasePluginsGui.Sample.Sample"` — 2 instances + `Plugin="AlteryxBasePluginsGui.BrowseV2.BrowseV2"` — 2 instances + `Plugin="AlteryxBasePluginsGui.DynamicSelect.DynamicSelect"` — 2 instances | Additional tool types with no doc coverage: (a) `Unique` tools (2 instances) — de-duplicate records on key fields; (b) `Sample` tools (2 instances) — extract row samples, likely for validation or testing subsets; (c) `BrowseV2` tools (2 instances) — data preview tools embedded in the workflow (typically left in production workflows from development); (d) `DynamicSelect` tools (2 instances) — select fields dynamically based on runtime field lists rather than a static field list. None of these tool types are mentioned in the workflow architecture docs. | Not mentioned in doc 1 (Process Documentation), doc 2 (Workflow Architecture), or any other doc. The tool inventory in docs does not enumerate these 4 tool types (8 instances total). The presence of `BrowseV2` tools in production is especially notable — they are development-time inspection tools that add overhead but do not affect data output. |
| G01-011 | `Plugin="AlteryxBasePluginsGui.PortfolioComposerTable.PortfolioComposerTable"` — 1 instance (Tool ID confirmed in XML) | PortfolioComposerTable tool: this Alteryx tool assembles a portfolio-level summary table combining multiple loan pool metrics into a formatted tabular output. Its specific field inputs, aggregation logic, and output schema are not visible in the docs. The tool exists alongside `PortfolioEmail` (1 instance, documented in doc 5) but while the email notification tool is covered, the table composition tool that feeds it is not described. | Doc 5 (Alerts and Notifications) documents the `PortfolioEmail` tool and the email alert workflow accurately. However, doc 5 does not describe the `PortfolioComposerTable` tool that constructs the table content sent in those alerts. The mechanism by which portfolio metrics are assembled into the email table body is not covered in any doc. |

---

## GAP-02: Broken or At-Risk Dependencies

| Gap ID | Dependency | Risk Type | Details |
|--------|------------|-----------|---------|
| G02-001 | Union Subset Prior Period.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Union Subset Prior Period.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-002 | Generate Unique ID.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Generate Unique ID.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-003 | Dropped Records Prep.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Dropped Records Prep.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-004 | Last Name Comma First Name Cleaner_v2.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Last Name Comma First Name Cleaner_v2.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-005 | Preliminary Client File Match.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Preliminary Client File Match.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-006 | 2020_Date_Converter.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\2020_Date_Converter.yxmc. 5 instances in the workflow. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-007 | Append Charge Offs and Matching.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Append Charge Offs and Matching.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-008 | Append RE Values.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Append RE Values.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-009 | Auto Value Append.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Auto Value Append.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-010 | TransUnion Mask_FICO Only_v2.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\TransUnion Mask_FICO Only_v2.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-011 | 2020_Publish2Server.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\2020_Publish2Server.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-012 | 2020_PublishDropped2Server.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\2020_PublishDropped2Server.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-013 | PreProcess_Iterative.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\PreProcess_Iterative.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-014 | Only Prior Period.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Only Prior Period.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-015 | Contingent File Input.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Contingent File Input.yxmc. 8 instances in the workflow. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. |
| G02-016 | 2020_PublishSecurities2Server.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-..._externals\1\2020_PublishSecurities2Server.yxmc. Stored in _externals\1\ subdirectory, not the standard Macros\ folder — indicates externally packaged add-on, not a natively embedded macro. Higher deployment risk than standard embedded macros. |
| G02-017 | CReW library (CReW_EnsureFields.yxmc x8, CReW_ParallelBlockUntilDone.yxmc x1, Cleanse.yxmc x2, Ethnic and Gender ID.yxmc x1 = 4 files, 12 instances) | external-library | No path prefix in XML — resolved from Alteryx Server macro search path. Requires CReW Runner library to be installed and registered on the execution server. If CReW is not installed, all 12 macro instances will fail at runtime. Other external macros (Tableau New Macro x1, Tableau New Macro Dropped x1, Tableau New Macro Securities x1) also have no path prefix. |
| G02-018 | Zip Code Ethnicity Index.csv | client-specific-path | Path: \Consulting_Client_Files\2020\0000_OTHER\Alan\Fair Lending Files\Zip Code Ethnicity Index.csv. References a 2020 consulting client directory (Alan/Dover 2019). This file may not exist in all production environments or for all institutions. If absent, the Fair Lending analysis block will fail silently or produce null predictions. |
| G02-019 | CallReportDataShort.yxdb | read-before-write | Path: \\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb. File appears as both a DbFileInput (read at workflow start) and a DbFileOutput (written by workflow). If both operations occur in the same run, the initial read may see stale or incomplete data depending on execution order. Docs describe this file as an output only; the read is undocumented. |
| G02-020 | Email tool SMTP configuration | deployment-blocker | XML shows SMTPServerName as an empty element. Email tool relies on Alteryx Data Connection Manager (DCM) connection ID 28b7a82a-6561-4456-b42d-e5fa3babd296. If this DCM connection is not configured on the execution server, email alerts will fail silently at runtime with no error output. No fallback is defined in the workflow. |

---

## GAP-03: Incomplete, Ambiguous, or Contradictory Documentation

| Gap ID | Document | Section | Issue Type | Details |
|--------|----------|---------|------------|---------|
| G03-001 | 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | Stage 2 Calculations / Net Charge Off Amount | contradiction | Doc states formula: [Charge Off Amount] - [Recovery Amount]. XML active formula: if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif. The commented-out formula in the XML matches the doc, but the active formula is a conditional that substitutes [Charge Offs] when Max_Report Date is empty — different logic, different field names. |
| G03-002 | 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | Risk Scoring | contradiction | Doc describes a Risk_Score field calculated from DTI_Ratio, Credit_Score, and Age_of_Loan_Days as a composite numeric score. No field named Risk_Score appears in the XML. The XML uses Decision FICO Grade (letter grades A+/A/B/C/D/E) derived from Original Credit Score thresholds — a fundamentally different risk representation (categorical grades, not a composite numeric score). |
| G03-003 | 7_MACROS_DEEP_DIVE.md | Macro Count Summary | count-discrepancy | Doc 7 claims 23 unique macros / 42 total instances. XML has 20 unique macro file names across 41 instances. The count difference arises from: (1) 2020_PublishSecurities2Server.yxmc is present in XML but absent from both doc 3 and doc 7; (2) Macro="False" is a boolean attribute on non-macro XML elements that was likely miscounted as a macro reference. Doc 3 claims "15+" — also not exact. |
| G03-004 | 3_MACROS_AND_DEPENDENCIES.md | Macro Inventory table | missing | 2020_PublishSecurities2Server.yxmc is present in the XML (1 instance, path: _externals\1\ subdirectory) but is completely absent from the doc 3 macro inventory table. Also absent from doc 7 macro inventory. This macro publishes securities data to the server and represents a distinct publishing output type not reflected in the macro documentation. |
| G03-005 | 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | Derived Fields | missing | Vintage Adjusted Expected Losses = [Vintage Expected Losses] * [Vintage Adjustment] is an explicit formula in the XML that does not appear in any doc. Related: the Vintage Adjustment cap formula (plus/minus 5% dampening relative to PP Vintage Adjustment) and its six flag values (First Value, Actual Increase, Prior +5%, Prior -5%, Actual Decrease, Same) are completely undescribed. |
| G03-006 | 2_WORKFLOW_ARCHITECTURE.md | Input Processing | ambiguous | Doc 2 describes the JSON input processing as "portal API calls routed to appropriate files" without describing the mechanics. XML shows a specific pipeline: JSONParse tool parses the input JSON, RegEx and Filter tools extract FileGroupNum / Info / RowNum / Header fields, then DynamicInput tools use FileGroupNum to route to specific institution files. The doc's description is too general to be actionable for troubleshooting. |
| G03-007 | 4_DATA_SOURCES_AND_LOCATIONS.md | Output Files | ambiguous | Doc 4 lists 5 output types (Client Files, Tableau Extracts, Dropped Records, Regulatory Data, Intermediate/Working Files) but describes CallReportDataShort.yxdb only as an output. The XML shows it is also a DbFileInput (read at start of the securities module). The doc's omission of the read creates an incomplete picture of the file's role — it is both input and output. |
| G03-008 | 5_ALERTS_AND_NOTIFICATIONS.md | Email Alert Trigger Conditions | missing | Doc 5 documents the PortfolioEmail tool and its recipients list but does not describe the PortfolioComposerTable tool that assembles the table body sent in the email. The mechanism by which portfolio metrics are aggregated and formatted into the email content is undocumented — the table composition logic is only visible in XML. |
| G03-009 | 9_BUSINESS_DATA_GLOSSARY.md | Calculated Flag Fields | missing | The glossary defines core loan fields and business terms but omits two calculated boolean flag fields confirmed in XML: "Charged off past 36 Months?" (true if charge-off within 36 months of report date) and "Originated Past 5 Years?" (true if origination date within 5 years of report date). These flags are used for downstream segmentation and filtering but have no glossary entry or formula description in any of the 14 docs. |
| G03-010 | 12_TABLEAU_DASHBOARD_GLOSSARY.md | Vintage Year / Expected Loss fields | ambiguous | Doc 12 references Vintage Year as a Tableau dimension and Expected Loss Year 1–7 fields as dashboard metrics, but does not describe how Year 0–Year 6 boolean cohort flags are computed from origination dates, nor the formula chain from boolean flags to Expected Loss Year values. Tableau consumers have metric names without the underlying derivation logic. |

---

## Appendix A: XML Extraction Summary

**Source:** 2020_DataProcess_v5.2.yxmd (49,082 lines XML)
**Extraction date:** 2026-03-18
**Total nodes:** 412 | **Total connections:** 335

### Tool Inventory (extracted from XML)

| Tool Type | Count | Notes |
|-----------|-------|-------|
| Select | 67 | Field selection and renaming |
| Formula | 60 | Calculated field expressions |
| TextBox | 35 | Workflow annotations and documentation blocks |
| Filter | 27 | Row-level filtering and branching |
| ToolContainer | 25 | Logical grouping of processing stages |
| Summarize | 24 | Aggregation and grouping |
| Union | 24 | Record set merging |
| Join | 21 | Field-level record matching |
| AppendFields | 11 | Cross-join / cartesian append |
| TextInput | 11 | Inline static data entry |
| MultiFieldFormula | 10 | Bulk formula applied across multiple fields |
| Sort | 8 | Record ordering |
| CrossTab | 6 | Pivot / cross-tabulation |
| DbFileInput | 5 | Binary .yxdb file reads |
| 2020_Date_Converter macro | 5 | Date conversion (embedded macro, 5 instances) |
| DynamicInput | 4 | Runtime file routing based on FileGroupNum |
| DynamicRename | 4 | Runtime field renaming |
| MultiRowFormula | 4 | Calculations referencing adjacent rows |
| RegEx | 2 | Pattern matching and extraction |
| Unique | 2 | Record de-duplication |
| Sample | 2 | Row sampling (likely validation/testing subsets) |
| BrowseV2 | 2 | Development-time data preview (present in production) |
| DynamicSelect | 2 | Runtime field selection |
| JSONParse | 1 | Parses portal JSON input payload |
| GenerateRows | 1 | Generates row sequences |
| FindReplace | 1 | Value substitution |
| RecordID | 1 | Sequential row identifier |
| PortfolioComposerTable | 1 | Assembles portfolio summary table for email |
| PortfolioEmail | 1 | Email alert delivery |

### Macro Summary (20 unique files, 41 instances)

#### Temp-Path Embedded Macros (D:\Users\vnekkanti\AppData\Local\Temp\...\Macros\)

| Macro File | Instances |
|-----------|-----------|
| Contingent File Input.yxmc | 8 |
| 2020_Date_Converter.yxmc | 5 |
| Union Subset Prior Period.yxmc | 1 |
| Generate Unique ID.yxmc | 1 |
| Dropped Records Prep.yxmc | 1 |
| Last Name Comma First Name Cleaner_v2.yxmc | 1 |
| Preliminary Client File Match.yxmc | 1 |
| Append Charge Offs and Matching.yxmc | 1 |
| Append RE Values.yxmc | 1 |
| Auto Value Append.yxmc | 1 |
| TransUnion Mask_FICO Only_v2.yxmc | 1 |
| 2020_Publish2Server.yxmc | 1 |
| 2020_PublishDropped2Server.yxmc | 1 |
| PreProcess_Iterative.yxmc | 1 |
| Only Prior Period.yxmc | 1 |

**Subtotal:** 15 files, 26 instances

#### External Add-On Macro (_externals\1\ subdirectory)

| Macro File | Instances |
|-----------|-----------|
| 2020_PublishSecurities2Server.yxmc | 1 |

**Subtotal:** 1 file, 1 instance

#### External Library Macros (no path prefix — requires CReW library + Tableau macros on server)

| Macro File | Instances |
|-----------|-----------|
| CReW_EnsureFields.yxmc | 8 |
| Ethnic and Gender ID.yxmc | 1 |
| Cleanse.yxmc | 2 |
| CReW_ParallelBlockUntilDone.yxmc | 1 |
| Tableau New Macro.yxmc | 1 |
| Tableau New Macro Dropped.yxmc | 1 |
| Tableau New Macro Securities.yxmc | 1 |

**Subtotal:** 7 files (4 CReW + 3 Tableau), 15 instances — **Note:** 4 CReW files are the primary external-library risk (G02-017); Tableau macros are separate dependency.

**Grand total:** 20 unique macro files, 41 instances (1 Macro="False" boolean attribute was miscounted as instance in doc 7, giving their erroneous 42 count)

## Appendix B: Coverage Matrix

<!-- Populated by Plan 02 -->
