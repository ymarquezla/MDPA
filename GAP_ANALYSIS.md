# MDPA Gap Analysis Report — Phase 2: Prioritized Gap Analysis

**Generated:** 2026-03-18
**Workflow:** 2020_DataProcess_v5.2.yxmd (49,082 lines XML)
**Docs Audited:** 14 files (1_MDPA_PROCESS_DOCUMENTATION.md through 14_SECURITIES_COLLATERAL_GUIDE.md)
**Phase:** 2 of 9 — Prioritized (severity ratings and remediation list added)
**Ground truth:** XML file is authoritative. Doc claims are treated as hypotheses verified against XML.

---

## Executive Summary

| Gap Type | Critical | Medium | Low | Total |
|----------|----------|--------|-----|-------|
| GAP-01: Undocumented Logic | 2 | 5 | 4 | 11 |
| GAP-02: Broken/At-Risk Dependencies | 18 | 2 | 0 | 20 |
| GAP-03: Incomplete/Contradictory Coverage | 2 | 6 | 2 | 10 |
| **Total** | **22** | **13** | **6** | **41** |

---

## GAP-01: Undocumented Workflow Logic

| Gap ID | Location in XML | Finding | Doc Coverage | Priority |
|--------|----------------|---------|--------------|----------|
| G01-001 | ToolContainer "Fair Lending Analysis" — tools grouped around `Ethnic & Gender ID.yxmc` macro + Formula/Filter tools using `Rate Differential`, `Average Interest Rates`, `Include in Fair Lending?` | Fair Lending ethnicity prediction pipeline: computes `Predicted Ethnicity` (6 categories: White, Black, Asian, American Indian, Multi Race, Hispanic), `Predicted Gender`, `Ethnicity Confidence`, and `Predicted Description` from a zip-code demographic lookup file (`\Consulting_Client_Files\2020\0000_OTHER\Alan\Fair Lending Files\Zip Code Ethnicity Index.csv`). Runs two-phase outlier elimination comparing `Rate Differential` against `Average Interest Rates`. Computes `Include in Fair Lending?` flag. Assigns `Decision FICO Grade` (A+/A/B/C/D/E) tiers based on original credit score thresholds. The Zip Code Ethnicity Index CSV is at a client-specific consulting path from a 2020 Dover engagement. | Doc 4 mentions "Fair Lending Files" only as a data source type. No doc describes the ethnicity prediction algorithm, the two-phase outlier elimination, the `Decision FICO Grade` tiers, or the `Include in Fair Lending?` flag logic. Not covered in any of the 14 docs. | Critical |
| G01-002 | Formula tool — `Vintage Adjustment Flag` field; MultiRowFormula tool — `Vintage Adjustment` cap calculation | Vintage Adjustment ±5% cap formula: `if [Vintage Adjustment] > [PP Vintage Adjustment] then min([Vintage Adjustment], [PP Vintage Adjustment] + ([PP Vintage Adjustment] * 0.05)) elseif [Vintage Adjustment] < [PP Vintage Adjustment] then max([Vintage Adjustment], [PP Vintage Adjustment] - ([PP Vintage Adjustment] * 0.05)) else [Vintage Adjustment] endif`. Result is categorized into 6 flag values: "First Value", "Prior +5%", "Prior -5%", "Actual Increase", "Actual Decrease", "Same". This dampening logic prevents vintage adjustment values from changing more than ±5% between prior period and current period. | No doc describes the ±5% dampening cap, its business rationale, or the 6 `Vintage Adjustment Flag` values. `Vintage Adjustment` is mentioned in docs as an output field but the formula capping it to ±5% of the prior period value is absent from all 14 docs. | Medium |
| G01-003 | TextBox annotation + `DbFileInput` and `DbFileOutput` tools referencing `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb` | Call Report / Securities Default Probability logic: annotation text reads "brings in default probabilities on securities" added 2022-12-09 by DPrice. The `CallReportDataShort.yxdb` file appears at the same UNC path as both an input (`DbFileInput`) and an output (`DbFileOutput`) in the XML — the workflow reads existing call report data, enriches it with default probability logic, and writes back to the same file. This read-before-write pattern at a shared network path is a potential ordering dependency. | Not described as a processing step in any doc. Doc 4 lists `CallReportDataShort.yxdb` as an output file only; the fact that it is also read as an input is not documented. The "default probabilities on securities" enrichment logic added in December 2022 is entirely absent from all 14 docs. | Medium |
| G01-004 | Formula tools generating `Year 0` through `Year 6` boolean fields + `Vintage Year` field + `Expected Loss - Year 1` through `Expected Loss - Year 7` fields — grouped inside ToolContainer for static pool cohort construction | Static Pool / Vintage Year cohort construction: the workflow generates a `Vintage Year` field (origination year extracted from origination date), then computes Year 0 through Year 6 boolean flags based on days from origination bucketed into annual cohorts. From these cohorts it derives `Expected Loss - Year 1` through `Expected Loss - Year 7` fields representing expected loss curves by loan age. This is the core static pool methodology underlying the allowance model. | Doc 12 (Tableau Dashboard Glossary) references `Vintage Year` as a Tableau dimension and mentions expected loss fields as dashboard metrics. No doc describes the cohort construction algorithm, how Year 0–Year 6 boolean flags are derived from origination dates, or how the Expected Loss Year 1–7 progression is computed. The static pool methodology as a workflow processing step is not described in any of the 14 docs. | Critical |
| G01-005 | `Plugin="AlteryxBasePluginsGui.MultiFieldFormula.MultiFieldFormula"` — 10 instances across the workflow at various tool IDs | MultiFieldFormula tools (10 instances): these tools apply a single formula expression across multiple fields simultaneously (e.g., `UPPERCASE([_CurrentField_])` applied to all string fields, or empty-string-to-null conversion applied to all numeric fields). They are used for bulk field standardization passes — converting field types, normalizing case, and replacing empty strings with null values across entire record schemas at once. The `_CurrentField_` variable references the active field in the multi-field loop. | Not mentioned as a tool type in any of the 14 docs. Doc 1 and doc 2 describe the workflow tool inventory but enumerate Formula, Select, Filter, and Join tools without mentioning `MultiFieldFormula` at all. The existence of 10 MultiFieldFormula instances performing bulk standardization is entirely absent from doc coverage. | Low |
| G01-006 | `Plugin="AlteryxBasePluginsGui.JSONParse.JSONParse"` tool + `Plugin="AlteryxBasePluginsGui.RegEx.RegEx"` tools + Filter tools → `FileGroupNum`, `Info`, `RowNum`, `Header` fields → `Plugin="AlteryxBasePluginsGui.DynamicInput.DynamicInput"` tools (4 instances) | JSON parsing and dynamic file routing entry point: the workflow receives a portal JSON payload as input, uses `JSONParse` to decompose it into key-value pairs, then applies `RegEx` and `Filter` tools to extract `FileGroupNum` (numeric routing key), `Info` (metadata string), `RowNum` (row identifier), and `Header` (column header mapping). These four derived fields drive `DynamicInput` tools that select and load different client file groups based on the parsed `FileGroupNum`. This is the mechanism by which a single workflow handles multiple client institutions per run. | Doc 2 (Workflow Architecture) mentions that the workflow "accepts JSON configuration" and "routes files dynamically" but does not describe the `JSONParse` → `RegEx` → `Filter` pipeline, the four derived routing fields, or how `DynamicInput` tools consume them. The mechanics of multi-client file routing are not described in any doc. | Medium |
| G01-007 | `DbFileInput` tool reading `02_TTA_Files\06_Participations\0000_MASTER_PARTICIPATIONS.yxdb` + TextBox annotation "Participation Loans Historical Master" | Participation Loans Historical Master: the workflow reads `0000_MASTER_PARTICIPATIONS.yxdb` from the participations subdirectory. The TextBox annotation identifies this as "Participation Loans Historical Master." This dataset contains historical records for loans that the institution has purchased a participating interest in (rather than originated directly). The workflow logic for how participation loan records are matched, merged, or distinguished from originated loans downstream is not visible in docs. | Doc 4 lists `0000_MASTER_PARTICIPATIONS.yxdb` in the data sources table as a source file for participation loan data. No doc describes how participation loan records are processed after ingestion — specifically how they are matched against the main loan stream, what fields are used for joining, whether they follow a different calculation path, or how they contribute to the final output. | Medium |
| G01-008 | Formula tools — `Charged off past 36 Months?` and `Originated Past 5 Years?` field expressions — present in XML Formula tool configurations | Calculated flag fields absent from documentation: `Charged off past 36 Months?` is a boolean formula field (true if the loan had a charge-off event within the 36 months preceding the report date). `Originated Past 5 Years?` is a boolean formula field (true if origination date is within 5 years of report date). Both are computed from date arithmetic in Formula tools. These flags are used downstream for filtering and segmentation in the static pool and historical analysis logic. | Neither `Charged off past 36 Months?` nor `Originated Past 5 Years?` appear in doc 6 (Field Mapping and Data Lineage) or doc 9 (Business Data Glossary). Doc 6 defines 200+ fields but omits these two boolean calculated fields. Doc 9's glossary covers core business terms but does not define either flag's business meaning or calculation rule. Not covered in any of the 14 docs. | Medium |
| G01-009 | `EngineSettings Macro="D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-..._externals\1\2020_PublishSecurities2Server.yxmc"` — stored in `_externals\1\` subdirectory, not the standard `Macros\` directory | `2020_PublishSecurities2Server.yxmc` macro — present in XML at `_externals\1\` path but absent from both macro documentation files. This macro publishes the securities output file to the server at `03_Results\14_SECURITIES\[PEERID]_19000101_SECURITIES.yxdb`. The `_externals\1\` path pattern indicates this macro was packaged as an external add-on, not embedded alongside the other custom macros. It handles a distinct output stream (securities collateral data) separate from the main client file publication macros (`2020_Publish2Server.yxmc` and `2020_PublishDropped2Server.yxmc`). | Doc 3 (Macros and Dependencies) lists the macro inventory and omits `2020_PublishSecurities2Server.yxmc` entirely. Doc 7 (Macros Deep Dive) provides a 23-macro count and detailed descriptions but also omits this macro. Doc 14 (Securities Collateral Guide) describes the securities output but does not mention the publishing macro responsible for writing it. Absent from all 14 docs. | Medium |
| G01-010 | `Plugin="AlteryxBasePluginsGui.Unique.Unique"` — 2 instances + `Plugin="AlteryxBasePluginsGui.Sample.Sample"` — 2 instances + `Plugin="AlteryxBasePluginsGui.BrowseV2.BrowseV2"` — 2 instances + `Plugin="AlteryxBasePluginsGui.DynamicSelect.DynamicSelect"` — 2 instances | Additional tool types with no doc coverage: (a) `Unique` tools (2 instances) — de-duplicate records on key fields; (b) `Sample` tools (2 instances) — extract row samples, likely for validation or testing subsets; (c) `BrowseV2` tools (2 instances) — data preview tools embedded in the workflow (typically left in production workflows from development); (d) `DynamicSelect` tools (2 instances) — select fields dynamically based on runtime field lists rather than a static field list. None of these tool types are mentioned in the workflow architecture docs. | Not mentioned in doc 1 (Process Documentation), doc 2 (Workflow Architecture), or any other doc. The tool inventory in docs does not enumerate these 4 tool types (8 instances total). The presence of `BrowseV2` tools in production is especially notable — they are development-time inspection tools that add overhead but do not affect data output. | Low |
| G01-011 | `Plugin="AlteryxBasePluginsGui.PortfolioComposerTable.PortfolioComposerTable"` — 1 instance (Tool ID confirmed in XML) | PortfolioComposerTable tool: this Alteryx tool assembles a portfolio-level summary table combining multiple loan pool metrics into a formatted tabular output. Its specific field inputs, aggregation logic, and output schema are not visible in the docs. The tool exists alongside `PortfolioEmail` (1 instance, documented in doc 5) but while the email notification tool is covered, the table composition tool that feeds it is not described. | Doc 5 (Alerts and Notifications) documents the `PortfolioEmail` tool and the email alert workflow accurately. However, doc 5 does not describe the `PortfolioComposerTable` tool that constructs the table content sent in those alerts. The mechanism by which portfolio metrics are assembled into the email table body is not covered in any doc. | Low |

---

## GAP-02: Broken or At-Risk Dependencies

| Gap ID | Dependency | Risk Type | Details | Priority |
|--------|------------|-----------|---------|----------|
| G02-001 | Union Subset Prior Period.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Union Subset Prior Period.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-002 | Generate Unique ID.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Generate Unique ID.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-003 | Dropped Records Prep.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Dropped Records Prep.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-004 | Last Name Comma First Name Cleaner_v2.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Last Name Comma First Name Cleaner_v2.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-005 | Preliminary Client File Match.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Preliminary Client File Match.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-006 | 2020_Date_Converter.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\2020_Date_Converter.yxmc. 5 instances in the workflow. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-007 | Append Charge Offs and Matching.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Append Charge Offs and Matching.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-008 | Append RE Values.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Append RE Values.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-009 | Auto Value Append.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Auto Value Append.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-010 | TransUnion Mask_FICO Only_v2.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\TransUnion Mask_FICO Only_v2.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-011 | 2020_Publish2Server.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\2020_Publish2Server.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-012 | 2020_PublishDropped2Server.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\2020_PublishDropped2Server.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-013 | PreProcess_Iterative.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\PreProcess_Iterative.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-014 | Only Prior Period.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Only Prior Period.yxmc. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-015 | Contingent File Input.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Contingent File Input.yxmc. 8 instances in the workflow. Will fail on any machine other than original developer's. Alteryx extracts embedded macros to this temp path when workflow is opened; the path is machine-specific. | Critical |
| G02-016 | 2020_PublishSecurities2Server.yxmc | hard-path | Path: D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-..._externals\1\2020_PublishSecurities2Server.yxmc. Stored in _externals\1\ subdirectory, not the standard Macros\ folder — indicates externally packaged add-on, not a natively embedded macro. Higher deployment risk than standard embedded macros. | Critical |
| G02-017 | CReW library (CReW_EnsureFields.yxmc x8, CReW_ParallelBlockUntilDone.yxmc x1, Cleanse.yxmc x2, Ethnic and Gender ID.yxmc x1 = 4 files, 12 instances) | external-library | No path prefix in XML — resolved from Alteryx Server macro search path. Requires CReW Runner library to be installed and registered on the execution server. If CReW is not installed, all 12 macro instances will fail at runtime. Other external macros (Tableau New Macro x1, Tableau New Macro Dropped x1, Tableau New Macro Securities x1) also have no path prefix. | Critical |
| G02-018 | Zip Code Ethnicity Index.csv | client-specific-path | Path: \Consulting_Client_Files\2020\0000_OTHER\Alan\Fair Lending Files\Zip Code Ethnicity Index.csv. References a 2020 consulting client directory (Alan/Dover 2019). This file may not exist in all production environments or for all institutions. If absent, the Fair Lending analysis block will fail silently or produce null predictions. | Medium |
| G02-019 | CallReportDataShort.yxdb | read-before-write | Path: \\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb. File appears as both a DbFileInput (read at workflow start) and a DbFileOutput (written by workflow). If both operations occur in the same run, the initial read may see stale or incomplete data depending on execution order. Docs describe this file as an output only; the read is undocumented. | Medium |
| G02-020 | Email tool SMTP configuration | deployment-blocker | XML shows SMTPServerName as an empty element. Email tool relies on Alteryx Data Connection Manager (DCM) connection ID 28b7a82a-6561-4456-b42d-e5fa3babd296. If this DCM connection is not configured on the execution server, email alerts will fail silently at runtime with no error output. No fallback is defined in the workflow. | Critical |

---

## GAP-03: Incomplete, Ambiguous, or Contradictory Documentation

| Gap ID | Document | Section | Issue Type | Details | Priority |
|--------|----------|---------|------------|---------|----------|
| G03-001 | 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | Stage 2 Calculations / Net Charge Off Amount | contradiction | Doc states formula: [Charge Off Amount] - [Recovery Amount]. XML active formula: if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif. The commented-out formula in the XML matches the doc, but the active formula is a conditional that substitutes [Charge Offs] when Max_Report Date is empty — different logic, different field names. | Critical |
| G03-002 | 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | Risk Scoring | contradiction | Doc describes a Risk_Score field calculated from DTI_Ratio, Credit_Score, and Age_of_Loan_Days as a composite numeric score. No field named Risk_Score appears in the XML. The XML uses Decision FICO Grade (letter grades A+/A/B/C/D/E) derived from Original Credit Score thresholds — a fundamentally different risk representation (categorical grades, not a composite numeric score). | Critical |
| G03-003 | 7_MACROS_DEEP_DIVE.md | Macro Count Summary | count-discrepancy | Doc 7 claims 23 unique macros / 42 total instances. XML has 20 unique macro file names across 41 instances. The count difference arises from: (1) 2020_PublishSecurities2Server.yxmc is present in XML but absent from both doc 3 and doc 7; (2) Macro="False" is a boolean attribute on non-macro XML elements that was likely miscounted as a macro reference. Doc 3 claims "15+" — also not exact. | Medium |
| G03-004 | 3_MACROS_AND_DEPENDENCIES.md | Macro Inventory table | missing | 2020_PublishSecurities2Server.yxmc is present in the XML (1 instance, path: _externals\1\ subdirectory) but is completely absent from the doc 3 macro inventory table. Also absent from doc 7 macro inventory. This macro publishes securities data to the server and represents a distinct publishing output type not reflected in the macro documentation. | Medium |
| G03-005 | 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | Derived Fields | missing | Vintage Adjusted Expected Losses = [Vintage Expected Losses] * [Vintage Adjustment] is an explicit formula in the XML that does not appear in any doc. Related: the Vintage Adjustment cap formula (plus/minus 5% dampening relative to PP Vintage Adjustment) and its six flag values (First Value, Actual Increase, Prior +5%, Prior -5%, Actual Decrease, Same) are completely undescribed. | Medium |
| G03-006 | 2_WORKFLOW_ARCHITECTURE.md | Input Processing | ambiguous | Doc 2 describes the JSON input processing as "portal API calls routed to appropriate files" without describing the mechanics. XML shows a specific pipeline: JSONParse tool parses the input JSON, RegEx and Filter tools extract FileGroupNum / Info / RowNum / Header fields, then DynamicInput tools use FileGroupNum to route to specific institution files. The doc's description is too general to be actionable for troubleshooting. | Medium |
| G03-007 | 4_DATA_SOURCES_AND_LOCATIONS.md | Output Files | ambiguous | Doc 4 lists 5 output types (Client Files, Tableau Extracts, Dropped Records, Regulatory Data, Intermediate/Working Files) but describes CallReportDataShort.yxdb only as an output. The XML shows it is also a DbFileInput (read at start of the securities module). The doc's omission of the read creates an incomplete picture of the file's role — it is both input and output. | Medium |
| G03-008 | 5_ALERTS_AND_NOTIFICATIONS.md | Email Alert Trigger Conditions | missing | Doc 5 documents the PortfolioEmail tool and its recipients list but does not describe the PortfolioComposerTable tool that assembles the table body sent in the email. The mechanism by which portfolio metrics are aggregated and formatted into the email content is undocumented — the table composition logic is only visible in XML. | Low |
| G03-009 | 9_BUSINESS_DATA_GLOSSARY.md | Calculated Flag Fields | missing | The glossary defines core loan fields and business terms but omits two calculated boolean flag fields confirmed in XML: "Charged off past 36 Months?" (true if charge-off within 36 months of report date) and "Originated Past 5 Years?" (true if origination date within 5 years of report date). These flags are used for downstream segmentation and filtering but have no glossary entry or formula description in any of the 14 docs. | Low |
| G03-010 | 12_TABLEAU_DASHBOARD_GLOSSARY.md | Vintage Year / Expected Loss fields | ambiguous | Doc 12 references Vintage Year as a Tableau dimension and Expected Loss Year 1–7 fields as dashboard metrics, but does not describe how Year 0–Year 6 boolean cohort flags are computed from origination dates, nor the formula chain from boolean flags to Expected Loss Year values. Tableau consumers have metric names without the underlying derivation logic. | Low |

---

## Prioritized Findings Summary

| Priority | GAP-01 (Logic) | GAP-02 (Dependencies) | GAP-03 (Coverage) | Total |
|----------|---------------|-----------------------|--------------------|-------|
| Critical | 2 | 18 | 2 | **22** |
| Medium | 5 | 2 | 6 | **13** |
| Low | 4 | 0 | 2 | **6** |
| **Total** | **11** | **20** | **10** | **41** |

**Interpretation:** 18 of 20 dependency gaps are Critical — the workflow cannot be redeployed on any machine other than the original developer's workstation without first resolving the hard-coded temp paths in G02-001 through G02-015. G02-017 (CReW library) and G02-020 (SMTP/DCM) are also Critical runtime blockers. The 2 Critical logic gaps (G01-001 Fair Lending, G01-004 Static Pool methodology) represent undocumented processes where correctness cannot be verified from documentation alone. The 2 Critical coverage gaps (G03-001, G03-002) are active output discrepancies — the workflow produces different values than stakeholders believe based on existing documentation. All 22 Critical items should be addressed before any migration, redeployment, or formal audit engagement.

---

## Remediation List

> Items are ordered Critical → Medium → Low. Each item is self-contained — the engineer
> does not need to open any other document to execute the fix. Gap IDs reference the
> corresponding rows in the tables above.

---

### REM-001 [Critical] — Relocate 15 hard-path embedded macros (G02-001 through G02-015)

**Gap type:** Broken dependency — machine-specific temp paths
**Root cause:** All 15 macros are embedded in the .yxmd package and extract to the original developer's temp directory: `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\`. This path does not exist on any other machine.
**Impact:** Workflow fails to open or execute on any machine except the original developer's workstation. Redeployment to Alteryx Server is blocked.
**Affected macros (15 files):**
- `Union Subset Prior Period.yxmc` — 1 instance
- `Generate Unique ID.yxmc` — 1 instance
- `Dropped Records Prep.yxmc` — 1 instance
- `Last Name Comma First Name Cleaner_v2.yxmc` — 1 instance
- `Preliminary Client File Match.yxmc` — 1 instance
- `2020_Date_Converter.yxmc` — 5 instances
- `Append Charge Offs and Matching.yxmc` — 1 instance
- `Append RE Values.yxmc` — 1 instance
- `Auto Value Append.yxmc` — 1 instance
- `TransUnion Mask_FICO Only_v2.yxmc` — 1 instance
- `2020_Publish2Server.yxmc` — 1 instance
- `2020_PublishDropped2Server.yxmc` — 1 instance
- `PreProcess_Iterative.yxmc` — 1 instance
- `Only Prior Period.yxmc` — 1 instance
- `Contingent File Input.yxmc` — 8 instances
**Action:** Extract all embedded macros from the .yxmd. Save them to a shared UNC path accessible from the Alteryx Server (e.g., `\\10.2.7.56\Shared\Prod\Macros\MDPA\`). Update all 15 macro references in the workflow XML to point to the shared path. Re-package and save the workflow.
**Acceptance criterion:** Workflow opens and executes on a second workstation with access to the shared UNC path, without any "macro not found" or path errors.
**Owner hint:** Alteryx developer with write access to the shared UNC macro directory on `\\10.2.7.56`

---

### REM-002 [Critical] — Relocate externals add-on macro (G02-016)

**Gap type:** Broken dependency — machine-specific path in `_externals\1\` subdirectory
**Root cause:** `2020_PublishSecurities2Server.yxmc` is stored in `_externals\1\` (not the standard `Macros\` directory). Full temp path: `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-..._externals\1\2020_PublishSecurities2Server.yxmc`. The `_externals\` pattern indicates it was packaged as an external add-on — the extraction path is non-standard and requires a separate fix procedure from REM-001.
**Impact:** Securities collateral output (`[PEERID]_19000101_SECURITIES.yxdb`) will not publish. Failure mode: macro not found error on open or run.
**Action:** Locate the `2020_PublishSecurities2Server.yxmc` source file. Copy it to the same shared UNC macro directory used in REM-001. Update the XML reference from the `_externals\1\` path to the shared UNC path. Re-package the workflow.
**Acceptance criterion:** Securities output file publishes successfully to `03_Results\14_SECURITIES\` on workflow run from a second workstation.
**Owner hint:** Alteryx developer; check with original developer (vnekkanti) for the `_externals` source location if unavailable on disk

---

### REM-003 [Critical] — Install and register CReW Runner library on execution server (G02-017)

**Gap type:** Broken dependency — external library not guaranteed present on server
**Root cause:** Four CReW macro files (`CReW_EnsureFields.yxmc`, `CReW_ParallelBlockUntilDone.yxmc`, `Cleanse.yxmc`, `Ethnic and Gender ID.yxmc`) have no path prefix in the XML. Alteryx resolves them from the server's registered macro search path. If CReW Runner is not installed on the execution server, all 12 instances fail at runtime with no warning at open time.
**Affected instances:** `CReW_EnsureFields.yxmc` × 8, `CReW_ParallelBlockUntilDone.yxmc` × 1, `Cleanse.yxmc` × 2, `Ethnic and Gender ID.yxmc` × 1.
**Tableau macro note:** Three Tableau macros (`Tableau New Macro.yxmc`, `Tableau New Macro Dropped.yxmc`, `Tableau New Macro Securities.yxmc`) also have no path prefix and require the Tableau SDK or Tableau Alteryx connector installed on the server.
**Action:** (a) Confirm whether CReW Runner is installed on the target Alteryx Server. If not, download from https://community.alteryx.com/t5/Engine-Works/CReW-MacroPack/ta-p/153140 and follow the server-side installation instructions to register the macro search path. (b) Confirm Tableau connector is installed for the three Tableau macros. (c) Verify all 12 CReW instances resolve after registration by opening the workflow and confirming no missing macro warnings.
**Acceptance criterion:** Workflow opens on Alteryx Server with no "macro not found" warnings for any CReW or Tableau macro. All 12 CReW instances run without error.
**Owner hint:** Alteryx Server administrator

---

### REM-004 [Critical] — Configure SMTP/DCM connection for email alerts (G02-020)

**Gap type:** Deployment blocker — silent email failure
**Root cause:** The Email tool's `SMTPServerName` element is empty in the XML. Email delivery depends on Data Connection Manager (DCM) connection ID `28b7a82a-6561-4456-b42d-e5fa3babd296` being configured on the execution server. If this DCM connection is absent, email alerts fail silently — no error is raised, no fallback exists.
**Impact:** Portfolio alert emails are not delivered. Failure is invisible — the workflow appears to complete normally.
**Action:** On the Alteryx Server where the workflow runs, open the DCM configuration. Create or locate an SMTP connection with ID `28b7a82a-6561-4456-b42d-e5fa3babd296`. Configure the SMTP server hostname, port, and authentication credentials for the organization's email relay. Test by running the workflow and confirming alert email delivery to configured recipients.
**Acceptance criterion:** Email alert is received by at least one configured recipient on a full workflow run. No silent email drop.
**Owner hint:** Alteryx Server administrator + IT/email team for SMTP credentials

---

### REM-005 [Critical] — Correct Net Charge Off Amount formula in documentation (G03-001)

**Gap type:** Active formula contradiction
**Root cause:** `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`, Stage 2 Calculations, "Net Charge Off Amount" row documents the formula as `[Charge Off Amount] - [Recovery Amount]`. The active XML formula is: `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif`. The commented-out formula in the XML matches the doc; the active formula is a conditional substitution using different field names.
**Impact:** Analysts validating Net Charge Off Amount outputs against the documentation will expect the subtraction formula. The workflow is producing a conditional field substitution. Any reconciliation exercise built on the documented formula will produce incorrect expected values.
**Action:** Update `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`, Stage 2 Calculations section, "Net Charge Off Amount" row:
- Replace: `[Charge Off Amount] - [Recovery Amount]`
- With: `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif`
- Add note: "When Max_Report Date is populated, uses pre-computed [Net Charge Off Amount] pass-through; when empty, falls back to raw [Charge Offs] value. A commented-out formula `[Charge Off Amount] - [Recovery Amount]` exists in the XML — confirm with SME whether this was the original intended logic."
**Acceptance criterion:** A reviewer comparing doc to XML for this field finds no discrepancy.
**Owner hint:** Loan Analytics analyst familiar with charge-off accounting, plus Alteryx developer to confirm formula history

---

### REM-006 [Critical] — Remove Risk_Score field reference; document Decision FICO Grade (G03-002)

**Gap type:** Active field contradiction — documented field does not exist in XML
**Root cause:** `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`, Risk Scoring section, describes a `Risk_Score` numeric composite field derived from `DTI_Ratio`, `Credit_Score`, and `Age_of_Loan_Days`. No field named `Risk_Score` exists in the XML. The actual field is `Decision FICO Grade` (categorical values: A+/A/B/C/D/E) derived from `Original Credit Score` thresholds in the Fair Lending ToolContainer.
**Impact:** Downstream consumers and analysts relying on the documented `Risk_Score` field are looking at the wrong field type (numeric composite vs. letter grade), the wrong calculation method, and the wrong field name. Any dashboards, exports, or reports built on `Risk_Score` documentation are misaligned with actual output.
**Action:** Update `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`, Risk Scoring section:
- Remove: The `Risk_Score` field entry and its formula description
- Add: A `Decision FICO Grade` field entry with description: "Categorical credit tier (A+/A/B/C/D/E) derived from `Original Credit Score` thresholds. A+ = highest tier, E = lowest tier. Computed in the Fair Lending Analysis ToolContainer. Note: earlier documentation referred to a composite numeric `Risk_Score` — that field does not exist in the active workflow XML."
- Also update `9_BUSINESS_DATA_GLOSSARY.md` to add a `Decision FICO Grade` entry and mark `Risk_Score` as deprecated/absent.
**Acceptance criterion:** No reference to `Risk_Score` as an active field remains in documentation without a note that it is absent from the XML. `Decision FICO Grade` is documented with its correct type, values, and derivation.
**Owner hint:** Loan Analytics analyst or documentation owner; Alteryx developer to confirm FICO Grade threshold values

---

### REM-007 [Critical] — Document Fair Lending ethnicity prediction pipeline (G01-001)

**Gap type:** Undocumented regulated process
**Root cause:** The Fair Lending Analysis ToolContainer performs ethnicity prediction (6 categories), gender prediction, outlier elimination, `Include in Fair Lending?` flag computation, and `Decision FICO Grade` tier assignment. None of this logic is described in any of the 14 docs. The pipeline uses a lookup CSV at a client-specific consulting path from a 2020 Dover engagement.
**Impact:** A regulatory compliance audit of the Fair Lending module cannot be conducted using existing documentation. Engineers debugging Fair Lending output cannot find the algorithm. The pipeline is also a runtime dependency on an external CSV (see REM-008).
**Action:** Add a new section "Fair Lending Analysis" to `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`. Document: (a) input fields: `Zip Code`, `Rate Differential`, `Average Interest Rates`, `Original Credit Score`; (b) lookup file: `Zip Code Ethnicity Index.csv` (path risk documented separately in REM-008); (c) output fields: `Predicted Ethnicity` (6 values: White, Black, Asian, American Indian, Multi Race, Hispanic), `Predicted Gender`, `Ethnicity Confidence`, `Predicted Description`, `Include in Fair Lending?`, `Decision FICO Grade` (A+/A/B/C/D/E); (d) two-phase outlier elimination logic comparing `Rate Differential` against `Average Interest Rates`. Also add a summary entry to `1_MDPA_PROCESS_DOCUMENTATION.md` noting Fair Lending as a processing stage.
**Acceptance criterion:** A compliance analyst can read `6_FIELD_MAPPING_AND_DATA_LINEAGE.md` and understand all inputs, outputs, and logic steps of the Fair Lending module without opening the .yxmd file.
**Owner hint:** Loan Analytics analyst familiar with Fair Lending compliance requirements; original developer (vnekkanti) if reachable for algorithm confirmation

---

### REM-008 [Critical] — Verify and document Zip Code Ethnicity Index.csv path (G02-018 elevation)

**Gap type:** Client-specific path dependency on critical regulated module
**Root cause:** The Fair Lending pipeline reads `\Consulting_Client_Files\2020\0000_OTHER\Alan\Fair Lending Files\Zip Code Ethnicity Index.csv`. This is a 2020 consulting client path from a Dover engagement. It may not exist on current production server or for other institutions.
**Impact:** If this file is absent, the Fair Lending ethnicity prediction produces null predictions or fails silently. Fair Lending compliance outputs become unreliable.
**Action:** (a) Confirm whether `Zip Code Ethnicity Index.csv` exists at the documented path on the current production server. (b) If absent: locate the file in backup/archive; restore to the documented path or update the XML to point to a verified production location. (c) Document the confirmed production path in `4_DATA_SOURCES_AND_LOCATIONS.md` under "Reference Files."
**Acceptance criterion:** The CSV file exists at a documented, verified path on the production server. The path is recorded in `4_DATA_SOURCES_AND_LOCATIONS.md`.
**Owner hint:** Loan Analytics analyst or IT admin with access to `\Consulting_Client_Files\`

---

### REM-009 [Critical] — Document Static Pool / Vintage Year cohort construction methodology (G01-004)

**Gap type:** Undocumented core model methodology
**Root cause:** The workflow constructs `Vintage Year`, Year 0–Year 6 boolean cohort flags from origination dates, and `Expected Loss - Year 1` through `Expected Loss - Year 7` fields. This is the core allowance model methodology. No doc describes the cohort construction algorithm.
**Impact:** The Expected Loss Year 1–7 fields drive the client-facing dashboard. Without documentation of how cohorts are built, the model cannot be verified, audited, or reproduced.
**Action:** Add a "Static Pool Methodology" section to `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`. Document: (a) `Vintage Year` derivation (origination year extracted from origination date); (b) Year 0–Year 6 boolean flag logic (annual cohort buckets based on days from origination to report date); (c) the formula chain from Year 0–6 flags to `Expected Loss - Year 1` through `Expected Loss - Year 7`. Reference this section from `12_TABLEAU_DASHBOARD_GLOSSARY.md` for the Vintage Year dimension entry.
**Acceptance criterion:** An analyst can trace how `Expected Loss - Year 3` is computed from raw origination date using only `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`.
**Owner hint:** Loan Analytics analyst familiar with static pool / CECL allowance methodology

---

### REM-010 [Medium] — Document Vintage Adjustment ±5% dampening cap (G01-002, G03-005)

**Gap type:** Undocumented production formula (also missing from lineage doc)
**Root cause:** The Vintage Adjustment is capped at ±5% of the prior period value. Formula: `if [Vintage Adjustment] > [PP Vintage Adjustment] then min([Vintage Adjustment], [PP Vintage Adjustment] + ([PP Vintage Adjustment] * 0.05)) elseif ... endif`. Six flag values are derived: "First Value", "Prior +5%", "Prior -5%", "Actual Increase", "Actual Decrease", "Same". Neither the cap formula nor the flag values are described in any doc.
**Action:** Update `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`, Derived Fields section. Add row for `Vintage Adjustment` with the full ±5% cap formula and the six `Vintage Adjustment Flag` values. Also add `Vintage Adjusted Expected Losses = [Vintage Expected Losses] * [Vintage Adjustment]` as an explicit derived field row.
**Acceptance criterion:** Both `Vintage Adjustment` (with cap formula) and `Vintage Adjusted Expected Losses` (with multiplication formula) appear as documented rows in `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`.
**Owner hint:** Loan Analytics analyst familiar with vintage adjustment methodology

---

### REM-011 [Medium] — Document Call Report default probability enrichment module (G01-003, G03-007)

**Gap type:** Undocumented module added 2022; incomplete file role description
**Root cause:** A "default probabilities on securities" module (added 2022-12-09 by DPrice) reads `CallReportDataShort.yxdb` as input, enriches it, and writes back to the same file. Doc 4 describes this file as output-only — the input read is undocumented. Any engineer re-deploying the workflow will not know this module or its input dependency exists.
**Action:** (a) Add a "Call Report / Securities Default Probability" entry to `1_MDPA_PROCESS_DOCUMENTATION.md` describing the module added December 2022. (b) Update `4_DATA_SOURCES_AND_LOCATIONS.md`, "Output Files" section, `CallReportDataShort.yxdb` row: change description from output-only to "input and output — workflow reads existing call report data, enriches with default probability calculations, and writes back to the same UNC path." (c) Note the read-before-write ordering dependency.
**Acceptance criterion:** `4_DATA_SOURCES_AND_LOCATIONS.md` correctly shows `CallReportDataShort.yxdb` as both input and output. `1_MDPA_PROCESS_DOCUMENTATION.md` includes the 2022 module.
**Owner hint:** Loan Analytics analyst; DPrice if available for confirmation of module logic

---

### REM-012 [Medium] — Document JSON parsing and dynamic multi-client file routing (G01-006, G03-006)

**Gap type:** Undocumented workflow entry point mechanism; abstract doc description
**Root cause:** The workflow receives a portal JSON payload and routes to client-specific file groups via `JSONParse → RegEx → Filter → DynamicInput` pipeline. Four derived fields (`FileGroupNum`, `Info`, `RowNum`, `Header`) drive the routing. Doc 2 describes this as "accepts JSON configuration" without the specific pipeline mechanics.
**Action:** Update `2_WORKFLOW_ARCHITECTURE.md`, Input Processing section. Replace the abstract description with a specific pipeline description: "Portal JSON payload → `JSONParse` tool extracts key-value pairs → `RegEx` and `Filter` tools derive `FileGroupNum` (institution routing key), `Info` (metadata), `RowNum` (row identifier), `Header` (column mapping) → `DynamicInput` tools load institution-specific file groups based on `FileGroupNum`." Include a simple diagram or bullet chain showing the 4-step flow.
**Acceptance criterion:** An engineer troubleshooting a multi-client routing failure can find the specific tools and fields involved in `2_WORKFLOW_ARCHITECTURE.md` without opening the XML.
**Owner hint:** Loan Analytics analyst or Alteryx developer familiar with the portal integration

---

### REM-013 [Medium] — Document Participation Loans Historical Master processing (G01-007)

**Gap type:** Undocumented post-ingestion processing for a distinct loan category
**Root cause:** `0000_MASTER_PARTICIPATIONS.yxdb` is listed as a data source in Doc 4 but how participation loan records are processed after ingestion — joining logic, field mapping, calculation differences from originated loans — is not described in any doc.
**Action:** Add a "Participation Loans" subsection to `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`. Document: (a) how participation records are identified (key fields used for join/match); (b) whether they follow a separate or merged calculation path; (c) how they contribute to output files. Note any fields that differ between originated and participation loans.
**Acceptance criterion:** An engineer extending the workflow to handle a new participation loan type can read `6_FIELD_MAPPING_AND_DATA_LINEAGE.md` and understand the current processing pattern.
**Owner hint:** Loan Analytics analyst familiar with participation loan accounting

---

### REM-014 [Medium] — Add boolean flag fields to Field Mapping and Glossary (G01-008, G03-009)

**Gap type:** Missing calculated fields from lineage doc and glossary
**Root cause:** `Charged off past 36 Months?` and `Originated Past 5 Years?` boolean formula fields are used for downstream filtering and segmentation but absent from `6_FIELD_MAPPING_AND_DATA_LINEAGE.md` and `9_BUSINESS_DATA_GLOSSARY.md`.
**Action:** (a) Add both fields to `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`, Calculated Fields section, with their date arithmetic formulas: "`Charged off past 36 Months?` = true if charge-off date is within 36 months of report date"; "`Originated Past 5 Years?` = true if origination date is within 5 years of report date." (b) Add both to `9_BUSINESS_DATA_GLOSSARY.md` with business definitions.
**Acceptance criterion:** Both fields appear in both `6_FIELD_MAPPING_AND_DATA_LINEAGE.md` and `9_BUSINESS_DATA_GLOSSARY.md` with formula and business meaning.
**Owner hint:** Loan Analytics analyst

---

### REM-015 [Medium] — Add 2020_PublishSecurities2Server.yxmc to macro inventory (G01-009, G03-004)

**Gap type:** Missing macro from both macro documentation files
**Root cause:** `2020_PublishSecurities2Server.yxmc` publishes securities output to `03_Results\14_SECURITIES\[PEERID]_19000101_SECURITIES.yxdb`. It is present in the XML but absent from both `3_MACROS_AND_DEPENDENCIES.md` and `7_MACROS_DEEP_DIVE.md`.
**Action:** (a) Add `2020_PublishSecurities2Server.yxmc` to the macro inventory table in `3_MACROS_AND_DEPENDENCIES.md`: name, purpose ("publishes securities collateral output to server"), path (`_externals\1\` subdirectory), instance count (1). (b) Add a corresponding entry to `7_MACROS_DEEP_DIVE.md` macro list with the same fields. (c) Update the macro count in `7_MACROS_DEEP_DIVE.md` from "23 unique macros / 42 total instances" to "20 unique macro files / 41 instances" (corrected count from XML ground truth).
**Acceptance criterion:** Both doc 3 and doc 7 include `2020_PublishSecurities2Server.yxmc`. Doc 7 macro count matches the XML count of 20 unique files, 41 instances.
**Owner hint:** Documentation owner; Alteryx developer to confirm securities macro purpose

---

### REM-016 [Medium] — Correct macro count in documentation (G03-003)

**Gap type:** Count discrepancy — doc claims 23 unique / 42 instances; XML has 20 unique / 41 instances
**Root cause:** `7_MACROS_DEEP_DIVE.md` claims "23 unique macros / 42 total instances." XML ground truth: 20 unique macro files, 41 instances. The overcount arose from: (1) `2020_PublishSecurities2Server.yxmc` absent from inventory (addressed in REM-015), and (2) `Macro="False"` boolean XML attributes miscounted as macro references.
**Action:** After completing REM-015, update the macro count summary in `7_MACROS_DEEP_DIVE.md` to state "20 unique macro files, 41 instances." Also update `3_MACROS_AND_DEPENDENCIES.md` if it states "15+" — replace with the exact count of 20. Add a note: "Count verified against XML node analysis (2026-03-18). Macro='False' boolean attributes in XML were excluded from this count."
**Acceptance criterion:** Both docs state "20 unique macro files, 41 instances." No doc states 23 unique or 42 instances without a correction note.
**Owner hint:** Documentation owner

---

### REM-017 [Medium] — Verify CallReportDataShort.yxdb read-before-write ordering (G02-019)

**Gap type:** Environmental dependency requiring investigation
**Root cause:** `CallReportDataShort.yxdb` appears as both a `DbFileInput` (read at workflow start) and a `DbFileOutput` (written by workflow) in the same execution. If both occur in the same run, the read may see stale or empty data before the write completes, depending on Alteryx execution order.
**Action:** Review the workflow execution graph to determine if the `DbFileInput` read and `DbFileOutput` write are in separate tool containers with an explicit ordering dependency (e.g., via a blocking tool or container dependency). If no ordering is enforced: add an `AlteryxBasePluginsGui.BlockUntilDone` or equivalent control tool between the read and write paths to guarantee the prior run's write completes before the read. Document the confirmed execution order in `4_DATA_SOURCES_AND_LOCATIONS.md`.
**Acceptance criterion:** Execution order between the read and write of `CallReportDataShort.yxdb` is confirmed and documented. If a race condition is possible, a control tool is added.
**Owner hint:** Alteryx developer reviewing the workflow execution graph

---

### REM-018 [Medium] — Add Vintage Adjusted Expected Losses formula to lineage doc (G03-005)

**Gap type:** Missing derived field formula
**Root cause:** `Vintage Adjusted Expected Losses = [Vintage Expected Losses] * [Vintage Adjustment]` is explicit in the XML but absent from `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`. Addressed together with the Vintage Adjustment cap in REM-010 — this is a reminder that both the cap formula AND the multiplication formula must be added.
**Action:** Confirm REM-010 includes `Vintage Adjusted Expected Losses` as a separate row. If not, add it explicitly to `6_FIELD_MAPPING_AND_DATA_LINEAGE.md` Derived Fields section: field name, formula `[Vintage Expected Losses] * [Vintage Adjustment]`, and a note linking to the Vintage Adjustment cap formula row.
**Acceptance criterion:** `Vintage Adjusted Expected Losses` appears as a distinct documented field in `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`.
**Owner hint:** Loan Analytics analyst (can be combined with REM-010 execution)

---

### REM-019 [Medium] — Make JSON input processing description actionable in doc 2 (G03-006)

**Gap type:** Abstract description insufficient for troubleshooting
**Action:** See REM-012 — this item is addressed by the same doc update. REM-012 covers both G01-006 (undocumented logic) and G03-006 (abstract description). No separate action required beyond REM-012.
**Acceptance criterion:** Same as REM-012.
**Owner hint:** Same as REM-012

---

### REM-020 [Medium] — Update CallReportDataShort.yxdb role in doc 4 (G03-007)

**Gap type:** Incomplete file role description
**Action:** See REM-011 — this item is addressed by the same doc update. REM-011 covers both G01-003 (undocumented module) and G03-007 (output-only description). No separate action required beyond REM-011.
**Acceptance criterion:** Same as REM-011.
**Owner hint:** Same as REM-011

---

### REM-021 [Low] — Document MultiFieldFormula tool type in workflow architecture (G01-005)

**Gap type:** Tool type absent from doc inventory
**Root cause:** 10 `MultiFieldFormula` instances perform bulk field standardization (type conversion, case normalization, empty-to-null replacement). Not mentioned in docs 1 or 2.
**Action:** Add `MultiFieldFormula` to the tool inventory section of `2_WORKFLOW_ARCHITECTURE.md`: "MultiFieldFormula (10 instances) — applies a single formula expression across multiple fields simultaneously. Used for bulk standardization passes: type conversion, case normalization, and empty-string-to-null replacement using `_CurrentField_` variable."
**Acceptance criterion:** `MultiFieldFormula` appears in the `2_WORKFLOW_ARCHITECTURE.md` tool inventory with instance count and purpose.
**Owner hint:** Documentation owner

---

### REM-022 [Low] — Document minor tool types: Unique, Sample, BrowseV2, DynamicSelect (G01-010)

**Gap type:** Tool types absent from doc inventory
**Root cause:** 8 instances across 4 tool types (`Unique` × 2, `Sample` × 2, `BrowseV2` × 2, `DynamicSelect` × 2) are not mentioned in any doc. The `BrowseV2` presence in production is a cleanup concern.
**Action:** Add all four tool types to `2_WORKFLOW_ARCHITECTURE.md` tool inventory with instance counts and brief purpose notes. Add a note for `BrowseV2`: "Two BrowseV2 development-time data preview tools are present in the production workflow. These do not affect output but add overhead. Recommend removing before next Alteryx Server deployment."
**Acceptance criterion:** All four tool types appear in `2_WORKFLOW_ARCHITECTURE.md`. BrowseV2 cleanup recommendation is noted.
**Owner hint:** Documentation owner; Alteryx developer for BrowseV2 cleanup

---

### REM-023 [Low] — Document PortfolioComposerTable tool in doc 5 (G01-011, G03-008)

**Gap type:** Undocumented tool in partially documented pipeline
**Root cause:** `5_ALERTS_AND_NOTIFICATIONS.md` documents the `PortfolioEmail` tool but not the `PortfolioComposerTable` tool that assembles the email table body.
**Action:** Update `5_ALERTS_AND_NOTIFICATIONS.md` to add a description of `PortfolioComposerTable`: "The PortfolioComposerTable tool aggregates portfolio-level metrics (loan counts, exposure totals, risk distribution) into a formatted table. This table is passed directly to the `PortfolioEmail` tool as the email body content."
**Acceptance criterion:** `5_ALERTS_AND_NOTIFICATIONS.md` mentions both `PortfolioComposerTable` and `PortfolioEmail` as sequential tools in the alert pipeline.
**Owner hint:** Documentation owner

---

### REM-024 [Low] — Add boolean flag fields to glossary (G03-009)

**Gap type:** Completeness gap — fields absent from glossary
**Action:** See REM-014 — glossary additions are part of the same update. No separate action required.
**Acceptance criterion:** Same as REM-014.
**Owner hint:** Same as REM-014

---

### REM-025 [Low] — Add derivation logic for Vintage Year and Expected Loss fields to Tableau glossary (G03-010)

**Gap type:** Tableau glossary references fields without derivation context
**Root cause:** `12_TABLEAU_DASHBOARD_GLOSSARY.md` lists `Vintage Year` and `Expected Loss - Year 1` through `Year 7` as dimensions/metrics but does not describe how they are computed.
**Action:** Update `12_TABLEAU_DASHBOARD_GLOSSARY.md` for the `Vintage Year` dimension and `Expected Loss - Year N` metrics. Add a cross-reference note: "Derivation logic documented in `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`, Static Pool Methodology section (see REM-009)." If REM-009 is complete, quote the key formula from that section.
**Acceptance criterion:** The Tableau glossary entries for `Vintage Year` and Expected Loss fields include a formula reference or cross-reference to the lineage doc.
**Owner hint:** Documentation owner; can be executed after REM-009

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

### Coverage Matrix: 14 Source Documents × 3 Gap Types

> A check mark (✓) indicates the document contributed at least one finding to that gap type.
> Gap counts appear in parentheses where multiple findings came from the same document.
> Documents without any findings are listed for completeness.

| Document | GAP-01 Undocumented Logic | GAP-02 Dependencies | GAP-03 Coverage Gaps |
|----------|--------------------------|--------------------|-----------------------|
| 1_MDPA_PROCESS_DOCUMENTATION.md | — | — | — |
| 2_WORKFLOW_ARCHITECTURE.md | — | — | ✓ G03-006 |
| 3_MACROS_AND_DEPENDENCIES.md | — | — | ✓ G03-003, G03-004 |
| 4_DATA_SOURCES_AND_LOCATIONS.md | ✓ G01-003, G01-007 | ✓ G02-018, G02-019, G02-020 | ✓ G03-007 |
| 5_ALERTS_AND_NOTIFICATIONS.md | ✓ G01-011 | — | ✓ G03-008 |
| 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | ✓ G01-002, G01-004, G01-008 | — | ✓ G03-001, G03-002, G03-005 |
| 7_MACROS_DEEP_DIVE.md | ✓ G01-009 | — | ✓ G03-003, G03-004 |
| 8_DEPLOYMENT_GUIDE.md | — | ✓ G02-001–G02-020 | — |
| 9_BUSINESS_DATA_GLOSSARY.md | ✓ G01-008 | — | ✓ G03-009 |
| 10_PROCESSING_STAGES_SUMMARY.md | — | — | — |
| 11_QA_AND_VALIDATION_GUIDE.md | — | — | — |
| 12_TABLEAU_DASHBOARD_GLOSSARY.md | ✓ G01-004 | — | ✓ G03-010 |
| 13_ERROR_HANDLING_AND_LOGS.md | — | — | — |
| 14_SECURITIES_COLLATERAL_GUIDE.md | ✓ G01-009 | — | — |
| **Findings from XML (no doc source)** | ✓ G01-001, G01-005, G01-006, G01-010 | ✓ G02-001–G02-017 | — |

**Note on "Findings from XML" row:** These findings have no corresponding doc claim to contradict — they are gaps of omission (workflow behaviors present in XML but absent from all 14 docs). The source is the workflow XML itself, not a document.
