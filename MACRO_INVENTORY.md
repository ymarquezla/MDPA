# MDPA Macro Inventory — v5.2

**Generated:** 2026-03-19
**Workflow:** 2020_DataProcess_v5.2.yxmd (49,082 lines XML)
**Source docs:** 3_MACROS_AND_DEPENDENCIES.md, 7_MACROS_DEEP_DIVE.md, 24_MACRO_INVENTORY_WITH_LOGIC.md
**Ground truth:** XML extraction verified 2026-03-19 — 20 unique macro files, 41 instances
**Correction:** GAP G03-003/REM-016 — doc 7 erroneously claimed 23 unique macros / 42 instances; correct count is 20 / 41
**Phase:** 6 of 9 — Macro Inventory: Cataloguing and Risk Rating

---

## Executive Summary

**Counts by Category**

| Category | Unique Macros | Total Instances |
|----------|---------------|-----------------|
| Input / Data Loading | 1 | 8 |
| Data Union / Period Selection | 2 | 2 |
| Preprocessing / Iteration | 1 | 1 |
| Validation / Field Assurance | 2 | 9 |
| Date Transformation | 1 | 5 |
| Data Cleansing | 2 | 3 |
| Data Enrichment | 3 | 3 |
| Demographic / Compliance | 2 | 2 |
| Matching / Preparation | 3 | 3 |
| Output / Publishing (Active) | 3 | 3 |
| Output / Publishing (Disabled) | 3 | 3 |
| **Total** | **20** | **41** |

**Counts by Deployment Risk Tier**

| Risk Tier | Macros | Description |
|-----------|--------|-------------|
| Tier A — Temp-Path Embedded | 15 | Hard-coded D:\Users\vnekkanti\... temp paths; fail on any other machine (GAP G02-001–G02-015, REM-001) |
| Tier B — External Add-On | 1 | _externals\1\ non-standard path; also currently DISABLED (GAP G02-016, REM-002) |
| Tier C — External Library | 7 | No path prefix; resolved from Alteryx Server macro search path; requires CReW Runner + Tableau connector (GAP G02-017, REM-003) |
| **Total** | **20** | **Every macro carries CRITICAL deployment risk** |

Every macro in the workflow carries CRITICAL deployment risk. The 15 Tier A macros reference a machine-specific temp path (`D:\Users\vnekkanti\AppData\Local\Temp\...`) that will not exist on any other machine. The 1 Tier B macro uses a non-standard `_externals\1\` path. The 7 Tier C macros require external software (CReW Runner library or Tableau Connector) to be installed and registered on the execution server. See ## Deployment Risk Register for the remediation references.

---

## Macro Catalogue

### 1. Contingent File Input.yxmc

| Property | Value |
|----------|-------|
| **Category** | Input / Data Loading |
| **Instances** | 8 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Reads client loan files from a dynamic input path, loading records only if the file exists at the specified path (contingent = skip gracefully if absent).

**Inputs:** Dynamic file path (resolved from FileGroupNum routing key), raw loan record fields per CU file schema.

**Outputs:** Loan record rows with all source fields intact, routed into the main processing stream.

**Logic Summary:** Accepts a file path parameter at runtime. Checks whether the target file exists before attempting to open it — if absent, the macro outputs zero rows rather than throwing an error. This contingent-load pattern allows the workflow to process multiple client institutions in a single run where some file groups may be empty or not yet delivered. Eight instances handle the eight distinct institution file groups routed by the JSON parsing entry point.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Contingent File Input.yxmc`. Relocate to `\\10.2.7.56\Shared\Prod\Macros\MDPA\` per REM-001.

---

### 2. Union Subset Prior Period.yxmc

| Property | Value |
|----------|-------|
| **Category** | Data Union / Period Selection |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Merges current-period loan records with a prior-period loan subset to enable period-over-period comparisons throughout the workflow.

**Inputs:** Current period loan records; prior period loan records (joined on loan identifier).

**Outputs:** Combined record set with both current and prior period fields available for comparison.

**Logic Summary:** Unions the current-period input stream with a filtered subset of prior-period records. The prior period subset is filtered before union to include only the records needed for Vintage Adjustment and charge-off comparison logic. Output fields include `Right_` prefixed copies of prior-period values (e.g., `Right_Vintage Adjustment`) that are consumed downstream by MultiRowFormula and Formula tools.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Union Subset Prior Period.yxmc`. Relocate per REM-001.

---

### 3. PreProcess_Iterative.yxmc

| Property | Value |
|----------|-------|
| **Category** | Preprocessing / Iteration |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Applies iterative preprocessing passes across all incoming loan records to standardize field formats before validation gates are applied.

**Inputs:** Raw loan record stream (post-union, pre-validation).

**Outputs:** Standardized loan records with field types normalized and empty strings converted to nulls.

**Logic Summary:** Runs multiple preprocessing iterations over the input stream. Each iteration applies a standardization pass — type conversions, null normalization, and case normalization across all string fields. The iterative approach allows the macro to handle variable field schemas from different client institutions without requiring a fixed schema at entry. Output is a clean, consistently typed record stream ready for CReW field validation.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\PreProcess_Iterative.yxmc`. Relocate per REM-001.

---

### 4. CReW_EnsureFields.yxmc

| Property | Value |
|----------|-------|
| **Category** | Validation / Field Assurance |
| **Instances** | 8 |
| **Macro Type** | External-Library |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | CReW-dependency |
| **Status** | Active |

**Purpose:** Validates that all required fields are present and non-null in the record stream before downstream tools consume them, halting the workflow if mandatory fields are missing.

**Inputs:** Loan record stream; configuration list of required field names.

**Outputs:** Validated loan record stream (pass-through if all fields present); workflow error if required field is absent.

**Logic Summary:** Checks that each field in its required-fields configuration exists and is non-empty in every input record. If a required field is missing or null across all rows, the macro raises a workflow error and stops execution. This gate pattern prevents silent data corruption from propagating through the pipeline. Eight instances are placed at key transition points in the workflow to validate different field subsets at each stage. Internal logic is inferred from CReW community documentation — direct .yxmc XML was not inspected.

**Deployment Notes:** No path prefix in XML — resolved from Alteryx Server macro search path. Requires CReW Runner library installed and registered on execution server. See REM-003.

---

### 5. CReW_ParallelBlockUntilDone.yxmc

| Property | Value |
|----------|-------|
| **Category** | Validation / Flow Control |
| **Instances** | 1 |
| **Macro Type** | External-Library |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | CReW-dependency |
| **Status** | Active |

**Purpose:** Synchronizes parallel workflow branches, blocking downstream execution until all upstream parallel branches have completed.

**Inputs:** Multiple parallel input streams from upstream tool branches.

**Outputs:** Synchronized output — execution continues only after all inputs have delivered their final row.

**Logic Summary:** Acts as a join point for parallel workflow branches. Holds output until every connected upstream branch signals completion. This prevents race conditions where a downstream tool might begin processing before all upstream branches have finished writing. Internal logic is inferred from CReW community documentation — direct .yxmc XML was not inspected. Likely uses Alteryx's block-until-done mechanism internally.

**Deployment Notes:** No path prefix in XML — requires CReW Runner library installed and registered on execution server. See REM-003.

---

### 6. Generate Unique ID.yxmc

| Property | Value |
|----------|-------|
| **Category** | Matching / Preparation |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Generates a stable unique identifier for each loan record to support deduplication, joining, and traceability across processing stages.

**Inputs:** Loan record stream with key business fields (loan number, institution ID, origination date).

**Outputs:** All input fields plus a new unique ID field appended to each record.

**Logic Summary:** Derives a unique identifier from a combination of loan-level key fields using a deterministic formula (likely concatenation or hash of loan number and institution identifiers). The generated ID is stable across runs for the same loan record, enabling joins to prior-period data and deduplication checks. Downstream tools use this ID as the primary join key for the charge-off append and client file match steps.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Generate Unique ID.yxmc`. Relocate per REM-001.

---

### 7. Dropped Records Prep.yxmc

| Property | Value |
|----------|-------|
| **Category** | Matching / Preparation |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Prepares records that failed validation or matching to be routed to the dropped records output stream with enriched failure metadata.

**Inputs:** Records rejected by upstream validation or matching steps; reason codes from the rejecting tool.

**Outputs:** Dropped record stream with failure reason, source institution, and original field values preserved.

**Logic Summary:** Receives records that did not pass earlier validation gates or could not be matched to a client file. Appends a drop reason field and formats the record for the separate Dropped Records output file. Ensures that rejected records are captured for QA review rather than silently discarded. The output feeds the Tableau New Macro Dropped publishing step.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Dropped Records Prep.yxmc`. Relocate per REM-001.

---

### 8. Last Name Comma First Name Cleaner_v2.yxmc

| Property | Value |
|----------|-------|
| **Category** | Data Cleansing |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Standardizes borrower name fields from "Last, First" comma-separated format into separate Last Name and First Name fields for downstream demographic analysis.

**Inputs:** Borrower name field in "Last, First" format (as received from CU source files).

**Outputs:** Separate Last Name and First Name fields; original name field preserved or overwritten per configuration.

**Logic Summary:** Parses the combined name string on the comma delimiter. Trims whitespace from both segments. Handles edge cases including names with no comma (single-name records), names with multiple commas (e.g., "Smith Jr., John"), and empty name fields. Version 2 of the cleaner indicates a revised edge-case handling logic compared to the original version.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Last Name Comma First Name Cleaner_v2.yxmc`. Relocate per REM-001.

---

### 9. Cleanse.yxmc

| Property | Value |
|----------|-------|
| **Category** | Data Cleansing |
| **Instances** | 2 |
| **Macro Type** | External-Library |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | CReW-dependency |
| **Status** | Active |

**Purpose:** Applies standard Alteryx CReW data cleansing operations — whitespace trimming, null normalization, and format standardization — across all string fields in the record.

**Inputs:** Loan record stream with raw string fields from CU source files.

**Outputs:** Cleaned record stream with standardized string formatting.

**Logic Summary:** Part of the CReW community library. Applies a configurable set of cleansing operations to string fields: leading/trailing whitespace removal, consistent null vs. empty-string handling, and optional case normalization. Two instances are used at different pipeline stages to clean different field subsets. Internal logic is inferred from CReW community documentation — direct .yxmc XML was not inspected.

**Deployment Notes:** No path prefix in XML — requires CReW Runner library installed and registered on execution server. Not an embedded macro. See REM-003.

---

### 10. Preliminary Client File Match.yxmc

| Property | Value |
|----------|-------|
| **Category** | Matching / Preparation |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Performs an initial matching pass to associate incoming loan records with their correct client institution file before downstream enrichment steps.

**Inputs:** Loan records with institution identifiers; client file index with peer IDs and institution metadata.

**Outputs:** Matched records with client institution fields appended; unmatched records routed to dropped stream.

**Logic Summary:** Joins incoming loan records to the client file directory on institution identifier fields (PeerID or equivalent). Records that match are flagged as valid and passed to the main processing stream. Records that fail to match are flagged and routed to the dropped records branch. This is an early filter that prevents records from unknown or unregistered institutions from corrupting downstream aggregations.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Preliminary Client File Match.yxmc`. Relocate per REM-001.

---

### 11. 2020_Date_Converter.yxmc

| Property | Value |
|----------|-------|
| **Category** | Date Transformation |
| **Instances** | 5 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Converts date fields from CU source file formats (various text/numeric formats) into a standardized Alteryx date format for consistent date arithmetic downstream.

**Inputs:** Date fields in raw CU format (may be YYYYMMDD integer, MM/DD/YYYY string, or Excel serial number).

**Outputs:** Date fields converted to Alteryx Date type (YYYY-MM-DD).

**Logic Summary:** Detects the input date format using pattern matching (regex or conditional logic) and applies the appropriate conversion formula for each format variant. Five instances handle different date fields at different pipeline stages — origination date, charge-off date, report date, maturity date, and prior period date. Standardizing to Alteryx Date type enables consistent use of DateTimeDiff and other date functions in subsequent Formula tools.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\2020_Date_Converter.yxmc`. Relocate per REM-001.

---

### 12. Append Charge Offs and Matching.yxmc

| Property | Value |
|----------|-------|
| **Category** | Data Enrichment |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Joins historical charge-off records to active loan records, enriching each loan with its charge-off history for loss rate and static pool calculations.

**Inputs:** Active loan record stream; historical charge-off data (yxdb or CSV with loan identifiers and charge-off amounts).

**Outputs:** Enriched loan records with charge-off amount, charge-off date, net charge-off amount, and matching status fields appended.

**Logic Summary:** Left-joins the charge-off history dataset to the active loan stream on a loan identifier key. Records with matching charge-off history receive the charge-off fields populated; unmatched records receive nulls (indicating no charge-off event). Also derives calculated flags such as "Charged off past 36 Months?" (boolean) from the charge-off date relative to the report date. The net charge-off formula uses a conditional: if Max_Report Date is not empty, use [Net Charge Off Amount]; otherwise use [Charge Offs] (documented in GAP G03-001).

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Append Charge Offs and Matching.yxmc`. Relocate per REM-001.

---

### 13. Ethnic & Gender ID.yxmc

| Property | Value |
|----------|-------|
| **Category** | Demographic / Compliance |
| **Instances** | 1 |
| **Macro Type** | External-Library |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | CReW-dependency |
| **Status** | Active |

**Purpose:** Predicts borrower ethnicity and gender from name and geographic data for Fair Lending compliance analysis and demographic reporting.

**Inputs:** Borrower first name, last name, zip code; Zip Code Ethnicity Index CSV (at consulting-path `D:\...\Fair Lending Files\Zip Code Ethnicity Index.csv`).

**Outputs:** Predicted Ethnicity (6 categories: White, Black, Asian, American Indian, Multi Race, Hispanic), Predicted Gender, Ethnicity Confidence score, Predicted Description field.

**Logic Summary:** Cross-references borrower name patterns and zip-code demographic data from the Zip Code Ethnicity Index to predict the most likely ethnicity and gender for each borrower. Uses a two-phase process: surname frequency lookup for initial prediction, then zip-code demographic overlay to refine confidence scores. Internal logic is inferred from CReW community documentation — direct .yxmc XML was not inspected. The output feeds the Fair Lending Analysis ToolContainer (G01-001) where rate differentials are computed against Average Interest Rates.

**Deployment Notes:** No path prefix in XML — requires CReW Runner library installed and registered on execution server. Also requires Zip Code Ethnicity Index.csv at its consulting-era path (G02-018 — may not exist in all environments). See REM-003.

---

### 14. TransUnion Mask_FICO Only_v2.yxmc

| Property | Value |
|----------|-------|
| **Category** | Demographic / Compliance |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Masks or redacts sensitive TransUnion credit data fields, retaining only the FICO credit score for downstream processing while removing PII credit bureau detail.

**Inputs:** Loan records containing raw TransUnion credit fields (full credit bureau pull).

**Outputs:** Loan records with TransUnion detail fields removed or nulled, Original Credit Score (FICO) field retained.

**Logic Summary:** Selects out or overwrites all TransUnion credit detail fields except the core FICO credit score. This masking step ensures that raw credit bureau data does not persist in the workflow output files. The retained FICO score is used downstream for Decision FICO Grade assignment (A+/A/B/C/D/E tiers based on credit score thresholds, documented in G01-001). Version 2 indicates revised field selection logic compared to the original version.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\TransUnion Mask_FICO Only_v2.yxmc`. Relocate per REM-001.

---

### 15. Append RE Values.yxmc

| Property | Value |
|----------|-------|
| **Category** | Data Enrichment |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Appends real estate collateral valuation data (current property values, LTV ratios) to loan records for collateral-secured loan analysis.

**Inputs:** Loan record stream; real estate valuation dataset keyed on collateral identifier or loan number.

**Outputs:** Enriched loan records with LTV (Loan-to-Value ratio), Current LTV, and Original LTV fields appended; pass-through for non-real-estate loans.

**Logic Summary:** Left-joins real estate collateral data to the loan stream. For loans with real estate collateral, appends LTV, Current LTV, and Original LTV — all sourced as pass-through values from the CU-uploaded collateral data rather than computed within this macro (formula internals confirmed in Phase 4 lineage analysis). Non-collateralized loans receive null values for RE fields. Feeds the Tableau Extract and securities output streams.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Append RE Values.yxmc`. Relocate per REM-001.

---

### 16. Auto Value Append.yxmc

| Property | Value |
|----------|-------|
| **Category** | Data Enrichment |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Appends automated collateral valuations (likely AVM — Automated Valuation Model estimates) to loan records for vehicles or other non-real-estate collateral.

**Inputs:** Loan record stream; automated valuation dataset keyed on collateral or loan identifier.

**Outputs:** Enriched loan records with auto/AVM value fields appended; pass-through for loans without auto collateral.

**Logic Summary:** Left-joins an automated valuation dataset to the loan stream. Appends current market value estimates for collateral (likely auto or consumer collateral based on naming). Complements Append RE Values by covering the non-real-estate collateral category. The combined output of both append macros provides the full collateral value picture needed for LTV calculations and securities analysis.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Auto Value Append.yxmc`. Relocate per REM-001.

---

### 17. Only Prior Period.yxmc

| Property | Value |
|----------|-------|
| **Category** | Data Union / Period Selection |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | Active |

**Purpose:** Filters the combined record stream to return only prior-period records for vintage adjustment and period-over-period comparison calculations.

**Inputs:** Combined loan record stream (current + prior period from Union Subset Prior Period).

**Outputs:** Prior-period-only record subset.

**Logic Summary:** Applies a filter on the period identifier field to pass through only records belonging to the prior reporting period. Used to isolate the prior period baseline values (PP Vintage Adjustment, PP charge-off rates, etc.) that are joined to current-period records for the ±5% vintage adjustment dampening formula (G01-002). Works in tandem with the Union Subset Prior Period macro — that macro brings the prior period in; this macro extracts it back out for the comparison calculation.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\Only Prior Period.yxmc`. Relocate per REM-001.

---

### 18. Tableau New Macro.yxmc

| Property | Value |
|----------|-------|
| **Category** | Output / Publishing (Active) |
| **Instances** | 1 |
| **Macro Type** | External-Library |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | external-library |
| **Status** | Active |

**Purpose:** Converts the main client loan output stream to Tableau Hyper format and publishes it to the Tableau Server for dashboard consumption.

**Inputs:** Final processed loan record stream (all fields, current period).

**Outputs:** Tableau Hyper extract file published to Tableau Server via DCM "Tableau Integration — Zevs Token" PAT connection.

**Logic Summary:** Converts the input record stream to the Tableau Hyper file format (.hyper) and publishes the extract to Tableau Server. This macro replaced the legacy 2020_Publish2Server.yxmc macro in March 2026 when Alteryx Designer 2024.2 dropped support for the older TDE format. Uses the Data Connection Manager (DCM) Personal Access Token (PAT) connection rather than embedded credentials. Active in Container 1055. Runtime after remediation: approximately 3:23 minutes total (vs. approximately 2.5 hours with the old TDE macros).

**Deployment Notes:** No path prefix — requires Tableau Connector installed and registered on execution server. Requires DCM connection "Tableau Integration — Zevs Token" configured on the execution server. See REM-003.

---

### 19. Tableau New Macro Dropped.yxmc

| Property | Value |
|----------|-------|
| **Category** | Output / Publishing (Active) |
| **Instances** | 1 |
| **Macro Type** | External-Library |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | external-library |
| **Status** | Active |

**Purpose:** Converts the dropped records output stream to Tableau Hyper format and publishes it to Tableau Server for QA and reconciliation reporting.

**Inputs:** Dropped record stream (records rejected from main processing stream, with drop reason fields).

**Outputs:** Tableau Hyper extract for dropped records published to Tableau Server.

**Logic Summary:** Same conversion and publish mechanism as Tableau New Macro.yxmc but operating on the dropped records branch. Replaced 2020_PublishDropped2Server.yxmc in the March 2026 remediation. Active in Container 1056. Ensures dropped records are available in Tableau for QA dashboards without requiring access to the intermediate yxdb files.

**Deployment Notes:** No path prefix — requires Tableau Connector and DCM PAT connection configured on the execution server. See REM-003. Active in Container 1056.

---

### 20. Tableau New Macro Securities.yxmc

| Property | Value |
|----------|-------|
| **Category** | Output / Publishing (Active) |
| **Instances** | 1 |
| **Macro Type** | External-Library |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | external-library |
| **Status** | Active |

**Purpose:** Converts the securities collateral output stream to Tableau Hyper format and publishes it to Tableau Server for securities portfolio analysis.

**Inputs:** Securities collateral record stream (real estate and auto collateral data with LTV fields).

**Outputs:** Tableau Hyper extract for securities data published to Tableau Server.

**Logic Summary:** Same conversion and publish mechanism as the other Tableau New Macro entries but operating on the securities data branch. Replaced 2020_PublishSecurities2Server.yxmc in the March 2026 remediation. Active in Container 1057. Handles the securities-specific output that includes RE and auto collateral valuations, LTV ratios, and default probability fields.

**Deployment Notes:** No path prefix — requires Tableau Connector and DCM PAT connection configured on the execution server. See REM-003. Active in Container 1057.

---

### 21. 2020_Publish2Server.yxmc — DISABLED

| Property | Value |
|----------|-------|
| **Category** | Output / Publishing (Disabled) |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | DISABLED — Legacy TDE publishing path, superseded by Tableau New Macro.yxmc (2026-03-18) |

**Purpose:** (Legacy) Published the main client loan output to Tableau Server in TDE format. Superseded by Tableau New Macro.yxmc.

**Inputs:** N/A — macro is disabled in Container 1049 and does not execute.

**Outputs:** N/A — disabled.

**Logic Summary:** Legacy TDE-format publishing macro. Wrote the main loan output stream to a .tde Tableau Data Extract file and published it to Tableau Server. Embedded credentials were used rather than DCM PAT. Disabled after the March 2026 remediation replaced this with the Hyper-format Tableau New Macro.yxmc. Do not re-enable — TDE format is no longer supported in Alteryx Designer 2024.2+.

**Deployment Notes:** Embedded at `D:\Users\vnekkanti\...\Macros\2020_Publish2Server.yxmc`. Even if relocated, this macro cannot run on Alteryx Designer 2024.2+ without TDE format support. For historical reference only.

---

### 22. 2020_PublishDropped2Server.yxmc — DISABLED

| Property | Value |
|----------|-------|
| **Category** | Output / Publishing (Disabled) |
| **Instances** | 1 |
| **Macro Type** | Embedded-TempPath |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | hard-path |
| **Status** | DISABLED — Legacy TDE publishing path, superseded by Tableau New Macro Dropped.yxmc (2026-03-18) |

**Purpose:** (Legacy) Published the dropped records stream to Tableau Server in TDE format. Superseded by Tableau New Macro Dropped.yxmc.

**Inputs:** N/A — macro is disabled in Container 1049 and does not execute.

**Outputs:** N/A — disabled.

**Logic Summary:** Legacy TDE-format publishing macro for the dropped records branch. Disabled during March 2026 remediation. Superseded by Tableau New Macro Dropped.yxmc (Hyper format, Container 1056). Same TDE deprecation issue as entry 21 — TDE format unsupported in Alteryx Designer 2024.2+.

**Deployment Notes:** Same as entry 21 — legacy TDE format, disabled, for historical reference only.

---

### 23. 2020_PublishSecurities2Server.yxmc — DISABLED

| Property | Value |
|----------|-------|
| **Category** | Output / Publishing (Disabled) |
| **Instances** | 1 |
| **Macro Type** | Embedded-Externals |
| **Deployment Risk** | CRITICAL |
| **Risk Basis** | nonstandard-path |
| **Status** | DISABLED — Legacy TDE publishing path, superseded by Tableau New Macro Securities.yxmc (2026-03-18) |

**Purpose:** (Legacy) Published the securities collateral stream to Tableau Server in TDE format. Superseded by Tableau New Macro Securities.yxmc.

**Inputs:** N/A — macro is disabled in Container 1049 and does not execute.

**Outputs:** N/A — disabled.

**Logic Summary:** Legacy TDE-format publishing macro for the securities output branch. In addition to the TDE deprecation issue, this macro is stored in a non-standard `_externals\1\` path rather than the standard `Macros\` directory, indicating it was packaged as an external add-on. Source file location unknown. Disabled during March 2026 remediation. Superseded by Tableau New Macro Securities.yxmc (Hyper format, Container 1057). This is the macro that was missing from docs 3 and 7 (GAP G01-009, G03-004).

**Deployment Notes:** Path `D:\Users\vnekkanti\..._externals\1\2020_PublishSecurities2Server.yxmc`. Non-standard path — source .yxmc file location unknown (REM-002). Disabled; for historical reference only.

---

## Deployment Risk Register

> This section is populated in Phase 6, Plan 02.

---

## Macro Dependency Map

> This section is populated in Phase 6, Plan 02.
