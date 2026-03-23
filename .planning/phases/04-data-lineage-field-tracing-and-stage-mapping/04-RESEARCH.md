# Phase 4: Data Lineage — Field Tracing and Stage Mapping - Research

**Researched:** 2026-03-19
**Domain:** Alteryx workflow data lineage — field-level tracing from 4 source systems through 7 processing stages to 5 output types
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LIN-01 | Analyst can trace any output field back to its source field across all 4 input systems | XML FormulaField expressions confirm derivation chains; field renames via Select tools are traceable from XML; source file paths confirmed |
| LIN-02 | Analyst can see the transformation applied at each of the 7 processing stages for every key field | Stage annotations extracted from XML TextBox tools; ToolContainer groupings define stage boundaries; 60 Formula tools + 67 Select tools carry the transformation logic |
| LIN-03 | Analyst can see which output files each field appears in | 5 output paths confirmed from XML (Client Files, Tableau Extract, Dropped Records, Call Report, Securities); output content differs by macro invocation pattern |
| LIN-04 | Lineage map covers all calculated/derived fields with formulas | 50+ FormulaField expressions extracted directly from XML — confirmed formulas for Net Charge Off Amount, Vintage Adjustment cap, Decision FICO Grade, Year 0–6 flags, Expected Loss Years 1–7, Rate Differential, all key derived fields |
</phase_requirements>

---

## Summary

Phase 4 constructs a structured data lineage map for the MDPA Alteryx workflow. The deliverable is a single Markdown file (`LINEAGE_MAP.md`) that traces every key field from its origin system through all workflow transformations to its final output destination. The work is purely analytical — read the XML, read the existing docs, reconcile the two, and produce an authoritative structured artifact.

The existing `6_FIELD_MAPPING_AND_DATA_LINEAGE.md` and `13_OUTPUT_TO_DASHBOARD_LINEAGE.md` documents provide a partial lineage baseline, but Phase 1 established that these docs contain significant inaccuracies: the `Risk_Score` field described in doc 6 does not exist in the XML (the workflow uses `Decision FICO Grade` instead), the `Net Charge Off Amount` formula contradicts the active XML formula, and several key calculated fields (Vintage Adjustment flag, Rate Differential, Predicted Ethnicity chain, static pool cohort fields) are entirely undocumented. The lineage map must use the XML as ground truth, correcting all doc inaccuracies.

The workflow's actual field names differ substantially from the conceptual names used in the docs. XML-confirmed field names include: `Report_Date`, `PeerNo`, `Loan Type`, `Loan Group`, `Loan Subgroup`, `Allowance Group`, `Net Charge Off Amount`, `Gross Charge Off Amount`, `Years until Charge off`, `Days from Origination`, `Year 0` through `Year 6`, `Expected Loss - Year 1` through `Expected Loss - Year 7`, `Vintage Expected Losses`, `Vintage Adjustment`, `Vintage Adjusted Expected Losses`, `Vintage Adjustment Flag`, `PP Vintage Adjustment`, `Decision FICO Grade`, `Origination Quarter`, `Term Grouping`, `Rate Differential`, `Include in Fair Lending?`, `Probability of Default`, `Charged off past 36 Months?`, `Vintage Year`.

**Primary recommendation:** Extract the full lineage map from the XML directly using the bash/Python extraction patterns established in Phase 1. Treat the existing doc 6 and doc 13 as a starting-point cross-reference only — do not carry over their field names or formulas without XML verification.

---

## Standard Stack

### Core

| Component | Version/Tool | Purpose | Why Standard |
|-----------|-------------|---------|--------------|
| Python xml.etree.ElementTree | stdlib | Parse .yxmd XML to extract field-level derivation chains, Select tool renames, Formula expressions, Join keys | Already verified to work on this 49K-line file in Phase 1 |
| Bash grep/sed/awk | system | Extract FormulaField expressions, field names, file paths for targeted lookups | Fast, no dependencies, extraction patterns proven in Phase 1 |
| Markdown writer | Any | Produce LINEAGE_MAP.md | Output format is plain Markdown, consistent with all other phase deliverables |

### Supporting

| Component | Purpose | When to Use |
|-----------|---------|-------------|
| Python csv | Produce machine-readable field inventory table alongside Markdown | Only if planner wants a structured CSV supplement for tooling |
| Python lxml | XPath-based extraction of Select tool field rename pairs | If ElementTree proves too verbose for attribute traversal in Select tools |

### No Installation Required

All work is read-only analysis on files already in the repo. No build tools needed beyond Python stdlib.

---

## Architecture Patterns

### Recommended Project Structure

```
MDPA/
└── LINEAGE_MAP.md              # Phase 4 deliverable — the lineage map artifact
```

Supporting scripts (if written during execution):
```
MDPA/.planning/phases/04-data-lineage-field-tracing-and-stage-mapping/
└── scratch/                    # Optional: extraction scripts, working tables
```

### Pattern 1: Stage-Boundary-First Lineage Construction

**What:** Identify the 7 stage boundaries first using ToolContainer annotations and TextBox labels, then assign each tool to a stage, then trace field transformations within and across stage boundaries.

**When to use:** Always. Stages are the organizing principle for LIN-02. Without clear stage assignments, field transformations cannot be attributed to the right stage.

**Stage boundaries confirmed from XML annotations:**

| Stage | Label from XML | Key Containers / Annotations |
|-------|---------------|------------------------------|
| Stage 1 | Data Input / JSON Entry Point | "This will be the entry point to the API..." — JSONParse, DynamicInput blocks for Loan Files, Charge Off Files |
| Stage 2 | PreProcess / Field Standardization | "PreProcess_Iterative macro" annotation; MultiFieldFormula bulk standardization; Contingent File Input (8 instances) |
| Stage 3 | Data Matching & Consolidation | "Append Charge Offs and Matching", "Append RE Values", "Union Subset Prior Period (347)", "Only Prior Period (346)" |
| Stage 4 | Calculations & Enrichment | Formula tools: Net Charge Off Amount, Years until Charge off, Days from Origination, Year 0-6, Vintage fields, Decision FICO Grade, Rate Differential, Charged off past 36 Months?, Vintage Year |
| Stage 5 | Static Pool / Vintage Cohort | "Get the number of years to include for static pool and years until charge off"; Expected Loss Year 1-7 population |
| Stage 6 | Fair Lending / Compliance Masking | Fair Lending ToolContainer (Predicted Ethnicity, Rate Differential, Include in Fair Lending?, Decision FICO Grade); TransUnion Mask_FICO Only_v2 |
| Stage 7 | Output Preparation & Publication | "Generate a distinct output file path..." annotation; Tableau New Macro 1055/1056/1057 (Hyper); Client File output; Dropped Records output; Securities output; Call Report append |

**Note:** The 7 stages used in the docs (doc 6 lists stages 1-5 only) do not fully align with actual XML container groupings. The lineage map should define stages based on XML structure, not doc descriptions.

### Pattern 2: Field Tracing via Select Tool Rename Chains

**What:** Alteryx Select tools (67 instances) are the primary mechanism for field renaming. To trace a field that appears in an output under a different name than its source, every Select tool that touches that field must be examined.

**When to use:** For any field where the source name and output name differ, or where a field disappears (excluded by a Select tool).

**Extraction approach:**
```bash
# Extract all Select tool field configurations (rename pairs)
grep -B5 -A20 'Plugin="AlteryxBasePluginsGui.AlteryxSelect.AlteryxSelect"' \
  /home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd | \
  grep -E 'field=|rename='
```

**Known rename pattern from doc 6 (needs XML verification):** `Member_First_Name + Member_Last_Name → "LastName, FirstName"` via `Last Name Comma First Name Cleaner_v2.yxmc`.

### Pattern 3: Formula Chain Documentation

**What:** For each calculated/derived field, the lineage entry documents the complete derivation: input fields → formula expression → output field name → which stage produces it.

**When to use:** Required for all LIN-04 fields (Risk_Score equivalent, LTV, Delinquency_Rate, Charge_Off_Rate, and all other derived fields).

**Confirmed formulas extracted from XML (use these verbatim in the lineage map):**

| Output Field | Formula (from XML) | Input Fields | Stage |
|---|---|---|---|
| `Net Charge Off Amount` | `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif` | `Max_Report Date`, `Net Charge Off Amount` (prior), `Charge Offs` | Stage 4 |
| `Gross Charge Off Amount` | `[Charge Off Amount]` | `Charge Off Amount` | Stage 4 |
| `Years until Charge off` | `if [Charge Off Amount] > 0 then max(min(7, floor(DateTimeDiff([Charge Off Date],[Origination Date],"days")/365)),0) else Null() endif` | `Charge Off Amount`, `Charge Off Date`, `Origination Date` | Stage 4 |
| `Days from Origination` | `abs(DateTimeDiff([Origination Date],[Charge Off Date],"day"))` | `Origination Date`, `Charge Off Date` | Stage 4 |
| `Year 0` | `If ([Days from Origination]) < 366 then 1 else 0 endif` | `Days from Origination` | Stage 5 |
| `Year 1` | `If ([Days from Origination]) < 731 and ([Days from Origination]) > 365 then 1 else 0 endif` | `Days from Origination` | Stage 5 |
| `Year 2` through `Year 6` | Same pattern with day ranges 730-1095, 1095-1460, 1460-1825, 1825-2190, 2190-2555 | `Days from Origination` | Stage 5 |
| `Expected Loss - Year 1` through `Year 7` | `[Right_Expected Loss - Year N]` (joined from prior period client file or static pool table) | Join right-side fields from prior period | Stage 5 |
| `Vintage Expected Losses` | `[Right_Vintage Expected Losses]` (joined from prior period data) | Join right-side | Stage 5 |
| `Vintage Adjustment` | `[Right_Vintage Adjustment]` (joined from prior period data) | Join right-side | Stage 5 |
| `Vintage Adjusted Expected Losses` | `[Right_Vintage Adjusted Expected Losses]` | Join right-side | Stage 5 |
| `PP Vintage Adjustment` | `[Right_PP Vintage Adjustment]` | Join right-side | Stage 5 |
| `Vintage Adjustment Flag` | `[Right_Vintage Adjustment Flag]` (carries pre-computed: "First Value"/"Prior +5%"/"Prior -5%"/"Actual Increase"/"Actual Decrease"/"Same") | Join right-side | Stage 5 |
| `Probability of Default` | `IIF(IsEmpty([Probability of Default]),0,[Probability of Default])` | `Probability of Default` (from securities/call report join) | Stage 4 |
| `Decision FICO Grade` | `IF ([Original Credit Score]=[NR] or IsEmpty([Original Credit Score])) then "NR" elseIF [Original Credit Score]>[A+] then "A+" elseIF [Original Credit Score]>[A] then "A" elseIF [Original Credit Score]>[B] then "B" elseIF [Original Credit Score]>[C] then "C" elseIF [Original Credit Score]>[D] then "D" else "E" endif` | `Original Credit Score`, TextInput thresholds (`[NR]`,`[A+]`,`[A]`,`[B]`,`[C]`,`[D]`) | Stage 6 |
| `Origination Quarter` | `Left([Origination Date],4)+' Q'+IIF(Substring([Origination Date],5,2) IN ('01','02','03'),'1',...)`  | `Origination Date` | Stage 4 |
| `Term Grouping` | `if [Term] <= ToNumber(Right([Term1],2)) then [Term1] elseif ...` | `Term`, TextInput thresholds `[Term1]`–`[Term5]` | Stage 4 |
| `Vehicle Age at Origination` | `datetimeyear([Origination Date]) - tonumber([Model Year])` | `Origination Date`, `Model Year` | Stage 4 |
| `Rate Differential` | `[Average Interest Rates] - [Interest Rate]` | `Average Interest Rates` (Summarize aggregation), `Interest Rate` | Stage 6 |
| `Include in Fair Lending?` | `0` (outlier excluded) or `1` (included) based on two-phase outlier elimination | `Rate Differential`, `Outlier?` flag | Stage 6 |
| `Charged off past 36 Months?` | `if DateTimeDiff([Report_Date],[Charge Off Date],'months') < 36 then 1 else 0 endif` | `Report_Date`, `Charge Off Date` | Stage 4 |
| `Vintage Year` | `datetimeyear([Origination Date])` | `Origination Date` | Stage 4 |
| `OutputFilePath_Dropped` | `'\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\06_DROP_RECORDS\' + [PeerNo] + "_" + "19000101_DROPPED RECORDS" + '.yxdb'` | `PeerNo` | Stage 7 |

**Note:** The `Vintage Adjustment Flag` values ("First Value", "Prior +5%", "Prior -5%", "Actual Increase", "Actual Decrease", "Same") are computed in a prior workflow run and carried into the current run via the prior period client file join. The ±5% dampening cap formula is NOT applied in the current period's Formula tools — it was applied to create the value that is now being passed through as a static read from the prior period file.

### Pattern 4: Source System → Intermediate File → Stage Mapping

**What:** The 4 source systems don't feed directly into the main processing stream — they go through intermediate staging files (`LoanFileTmp.yxdb`, `ImpairedLoanTmp.yxdb`, `ChargeOffTmp.yxdb`, `SecuritiesTmp.yxdb`) and are then read by DynamicInput tools. The lineage map must trace this two-step input path.

**Confirmed intermediate file paths (from XML):**
```
\\10.2.7.56\Shared\PortfolioAnalysis\99_References\LoanFileTmp.yxdb        — Loan Portfolio staging
\\10.2.7.56\Shared\PortfolioAnalysis\99_References\ImpairedLoanTmp.yxdb   — Impaired loans subset
\\10.2.7.56\Shared\PortfolioAnalysis\99_References\ChargeOffTmp.yxdb      — Charge-Off/Recovery staging
\\10.2.7.56\Shared\PortfolioAnalysis\99_References\SecuritiesTmp.yxdb     — Securities/Call Report staging
```

**The DynamicInput routing mechanism (confirmed from XML):** JSON input is parsed by `JSONParse` → `RegEx` + `Filter` extract `FileGroupNum`, `Info`, `RowNum`, `Header` → `DynamicInput` tools use `FileGroupNum` to route to institution-specific files uploaded by the credit union. This is the entry point for Loan Portfolio and Charge-Off source data.

### Anti-Patterns to Avoid

- **Trusting doc 6 field names without XML verification:** `Risk_Score` does not exist in the XML. The conceptual `LTV` field named in the docs may differ from the actual XML field name. Always confirm field names against XML `FormulaField field=` attributes and Select tool configurations.
- **Treating doc 6 stage definitions as authoritative:** Doc 6 lists 5 stages (Ingestion, Enrichment, Matching, Compliance, Output). The actual XML has more nuanced boundaries. Stages in the lineage map should reflect actual ToolContainer groupings.
- **Flattening the Vintage Adjustment chain:** The Vintage Adjustment cap formula and flag values are carried in from the prior period file as pre-computed values, not recalculated each run. Documenting them as "current-run formulas" would be wrong.
- **Omitting the Securities/Call Report lineage stream:** This is a separate input stream (`0000_19001231_SECURITIES.yxdb` + `CallReportDataShort.yxdb`) that feeds into the `SecuritiesTmp.yxdb` staging file and eventually into the Tableau Securities output (macro 1057). It must appear as a distinct lineage path in the map.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Extracting formula expressions with output field names | Custom XML parser | `grep -oP 'FormulaField expression="[^"]+" field="[^"]+"'` | Already verified — returns all 50+ formulas with field names in one command |
| Enumerating input fields per source | Attempting to read source system schemas | Read `6_FIELD_MAPPING_AND_DATA_LINEAGE.md` Source sections + cross-check XML input file names | Source schemas are already documented (with caveats for accuracy); XML file paths confirm source identity |
| Identifying output field sets | Tracing every Select tool | Use the 5 output file paths as anchors and work backwards from the tools that write to them | Output destinations are clear; the challenge is the upstream chain, not the destination |
| Tracking field renames | Building a full rename graph | Focus on the final output field names first, then trace their origin | Full rename tracking for all 300+ fields is out of scope; key fields are the priority |
| Mapping all 300 tools to stages | Exhaustive tool-by-tool assignment | Use ToolContainer boundaries + TextBox annotations to assign bulk tool ranges to stages | 25 ToolContainers group most tools; stage assignment is a coarse-grained operation |

**Key insight:** The lineage map is a documentation artifact, not a code analysis tool. It needs to be accurate enough that an analyst can answer "where does this field come from?" — it does not need to be a machine-readable dependency graph. Depth over breadth: 20 key fields traced accurately beats 200 fields traced superficially.

---

## Common Pitfalls

### Pitfall 1: Risk_Score Does Not Exist in the XML
**What goes wrong:** Implementer writes a lineage entry for `Risk_Score` based on doc 6's formula (`(100-Credit_Score/10) * (DTI_Ratio/100) * (Age_of_Loan_Days/365)`) without verifying in XML. The field doesn't exist.
**Why it happens:** Doc 6 describes `Risk_Score` as a key derived field. This was a GAP-03 finding from Phase 1 — the field in the XML is `Decision FICO Grade` (categorical A+/A/B/C/D/E), not a numeric composite score.
**How to avoid:** The lineage map must document `Decision FICO Grade` with its actual XML formula and note that it is the XML's equivalent of the conceptual "risk score" field in the docs. Do not create a lineage entry for `Risk_Score`.
**Warning signs:** Any lineage entry that references DTI_Ratio, Credit_Score, and Age_of_Loan_Days in the same formula expression is likely wrong.

### Pitfall 2: Net Charge Off Amount Formula Contradiction
**What goes wrong:** Implementer uses the doc 6 formula `[Charge Off Amount] - [Recovery Amount]` for `Net Charge Off Amount`. The XML active formula is different: `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif` (a conditional that uses `[Charge Offs]` when `Max_Report Date` is empty).
**Why it happens:** The simple subtraction formula exists in the XML but as a commented-out expression — the active formula replaced it. Doc 6 was apparently written against the old formula.
**How to avoid:** Quote the XML formula verbatim. Note the discrepancy with doc 6 in a comment. Use the active (non-commented) formula as the canonical definition.

### Pitfall 3: Vintage Adjustment Cap — Pre-Computed vs. Current-Run
**What goes wrong:** Implementer documents the Vintage Adjustment cap formula (`if [VA]>[PP VA] then min([VA],[PP VA]+([PP VA]*0.05))...`) as a current-run calculation, when it is actually carried in as a pre-computed value from the prior period client file.
**Why it happens:** Phase 1 research found the ±5% cap formula in the XML, but it appears in an older/prior-period context. The current Formula tools read `[Right_Vintage Adjustment]` and `[Right_Vintage Adjustment Flag]` from a Join (pulling from prior period data), not from a live formula.
**How to avoid:** When writing the Vintage Adjustment lineage entry, trace it as: "Source: Prior period client file (joined from [PeerNo]_[Date]_CLIENT_FILE.yxdb via Join tool) → carried through as static value in current period → output to Tableau Extract." The cap formula belongs in a historical note, not as the current transformation.
**Warning signs:** If you're trying to show a Vintage Adjustment cap formula under Stage 4 or 5, you're probably documenting the wrong period.

### Pitfall 4: Conflating LTV from Doc 6 with Actual XML Field
**What goes wrong:** Doc 6 lists `LTV_Ratio` as a source field from Loan Portfolio and `Market_LTV` as a calculated field. The actual XML may use different names or may compute LTV differently.
**Why it happens:** Doc 6 uses conceptual field names that don't always match XML attribute names.
**How to avoid:** Search the XML for `LTV` variants before writing any lineage entry:
```bash
grep -i 'LTV\|loan.*to.*value' /home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd | head -20
```
Confirm actual field name before documenting. If not found, flag as "conceptual field not confirmed in XML."

### Pitfall 5: Missing Securities and Fair Lending Lineage Streams
**What goes wrong:** Lineage map covers the main loan portfolio stream but omits the two parallel processing streams: (1) Securities/Call Report data → `SecuritiesTmp.yxdb` → Tableau Securities Extract, and (2) Fair Lending analysis → `Predicted Ethnicity`/`Rate Differential`/`Include in Fair Lending?` fields → (unknown output destination).
**Why it happens:** These are documented as minor sideshows but they represent real output data and must be traceable per LIN-01.
**How to avoid:** Explicitly include two sub-sections in the lineage map: "Securities/Call Report Lineage Stream" and "Fair Lending Supplementary Fields." For Fair Lending, trace what inputs flow into the Fair Lending ToolContainer and what comes out.

### Pitfall 6: Stage Count Mismatch with Requirements
**What goes wrong:** The requirements mention "7 processing stages" but doc 6 only defines 5. The lineage map must cover 7 stages per the LIN-02 requirement.
**Why it happens:** Phase 1 research and XML ToolContainer analysis shows more stages than doc 6 describes.
**How to avoid:** Define 7 stages using the XML ToolContainer structure as the primary authority, not doc 6. The stage structure in this research document is the recommended framing.

---

## Code Examples

Verified extraction patterns for the implementer:

### Extracting All Formula Expressions with Their Output Field Names
```bash
# Source: Direct XML inspection of 2020_DataProcess_v5.2.yxmd (verified Phase 1)
grep -oP 'FormulaField expression="[^"]+" field="[^"]+"' \
  /home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd
```

### Extracting All Output File Paths (Confirmed from XML)
```bash
# Source: Direct XML inspection — returns 22 distinct paths
grep -oP '\\\\[^<"]+\.(yxdb|xlsx|csv|tde|hyper|yxmd)' \
  /home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd | sort -u
```

### Extracting ToolContainer Annotations (Stage Labels)
```bash
# Source: Direct XML inspection — returns all 35 TextBox + container annotations
grep -oP '(?<=<Text>)[^<]+' /home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd \
  | grep -v '^[[:space:]]*$'
```

### Searching for Specific Field Names in XML
```bash
# Use for any field needing confirmation before writing lineage entry
grep -n 'LTV\|Delinquency\|Charge_Off_Rate\|Risk_Score' \
  /home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd
```

### Python: Extract All Select Tool Rename Pairs
```python
# Source: Python stdlib xml.etree.ElementTree — for complete rename tracing
import xml.etree.ElementTree as ET

tree = ET.parse('/home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd')
root = tree.getroot()

for node in root.iter('Node'):
    gui = node.find('GuiSettings')
    if gui is not None and 'Select' in gui.get('Plugin', ''):
        tool_id = node.get('ToolID')
        select_fields = node.findall('.//SelectField')
        for sf in select_fields:
            name = sf.get('field', '')
            rename = sf.get('rename', '')
            selected = sf.get('selected', 'True')
            if rename and rename != name:
                print(f"Tool {tool_id}: '{name}' → '{rename}' (selected: {selected})")
```

---

## Known Field Inventory — Confirmed from XML

The following fields are confirmed to exist in the XML (used in FormulaField expressions or as named outputs):

### Input Source Fields (Confirmed from XML File References)

**Source 1: Loan Portfolio (via DynamicInput from CU-uploaded files)**
- `Loan Type`, `Loan Group`, `Loan Subgroup`, `Allowance Group`, `LoanAllowanceGroup`
- `Report Date`, `PeerNo`, `Origination Date`, `Charge Off Date`
- `Interest Rate`, `Original Credit Score`, `Term`, `Model Year`
- `Loan Description`, `PeerGroupName`

**Source 2: Charge-Off/Recovery (via DynamicInput from CU-uploaded files)**
- `Charge Off Amount`, `Charge Off Date`, `Recovery Amount`, `Recovery Date`
- `Charge Offs` (distinct from `Charge Off Amount` — used in Net Charge Off conditional)

**Source 3: Real Estate Valuations (via Append RE Values macro)**
- Appended via `Append RE Values.yxmc` — specific fields not confirmed from FormulaField scan; macro inputs TBD via macro XML inspection in Phase 6

**Source 4: TransUnion Credit Bureau (via TransUnion Mask_FICO Only_v2 macro)**
- `Original Credit Score` (confirmed — used in Decision FICO Grade formula)
- Additional TransUnion fields masked by macro — specifics in macro XML

**Reference/Supplementary Sources (TTA internal files)**
- `0000_19001231_SECURITIES.yxdb` — securities data
- `CallReportDataShort.yxdb` — call report data; provides `Probability of Default`, `Total Assets`, `Net Worth`, `ALLL` (annotation confirmed: "Adding 3 fields from the call report data each quarter")
- `0000_20170125_PROBABILITY OF DEFAULT.xlsx` — PD lookup table
- `0000_MASTER_PARTICIPATIONS.yxdb` — participation loans master
- `NAICS PD_20190731.xlsx` — NAICS-based PD reference
- `CO Data SBA - Excel Version.xlsx` — SBA charge-off reference data
- `0000_19000101_CURRENT RE MODEL.xlsx` — real estate model parameters
- `Zip Code Ethnicity Index.csv` — Fair Lending demographic lookup

### Calculated/Derived Fields (Confirmed from XML FormulaField attributes)

| Field Name | Source Fields | Formula Source | Stage |
|---|---|---|---|
| `Net Charge Off Amount` | `Max_Report Date`, `Net Charge Off Amount` (prior), `Charge Offs` | XML active formula (conditional) | Stage 4 |
| `Gross Charge Off Amount` | `Charge Off Amount` | Direct pass-through | Stage 4 |
| `Years until Charge off` | `Charge Off Amount`, `Charge Off Date`, `Origination Date` | DateTimeDiff / floor / min(7,...) | Stage 4 |
| `Days from Origination` | `Origination Date`, `Charge Off Date` | abs(DateTimeDiff) | Stage 4 |
| `Year 0` through `Year 6` | `Days from Origination` | Day-range boolean flags | Stage 5 |
| `Origination Quarter` | `Origination Date` | Year + quarter substring formula | Stage 4 |
| `Vintage Year` | `Origination Date` | `datetimeyear([Origination Date])` | Stage 4 |
| `Term Grouping` | `Term`, TextInput thresholds | Range bucketing | Stage 4 |
| `Rounded Term` | `Term` | `round([Term],12)` | Stage 4 |
| `Vehicle Age at Origination` | `Origination Date`, `Model Year` | `datetimeyear - tonumber(Model Year)` | Stage 4 |
| `Probability of Default` | `Probability of Default` (from join) | `IIF(IsEmpty(...),0,...)` null-coalesce | Stage 4 |
| `Decision FICO Grade` | `Original Credit Score`, threshold TextInput | Grade thresholds (A+/A/B/C/D/E/NR) | Stage 6 |
| `Rate Differential (Pre)` | `Average Interest Rates`, `Interest Rate` | `abs([Average Interest Rates]-[Interest Rate])` | Stage 6 |
| `Rate Differential` | `Average Interest Rates`, `Interest Rate` | `[Average Interest Rates]-[Interest Rate]` | Stage 6 |
| `Include in Fair Lending?` | `Outlier?` flag | Two-phase outlier elimination | Stage 6 |
| `Charged off past 36 Months?` | `Report_Date`, `Charge Off Date` | `DateTimeDiff < 36 months` | Stage 4 |
| `Report Date` | `Report Date`, `ReportingPeriodDate` | `if isempty([Report Date]) then [ReportingPeriodDate] else [Report Date] endif` | Stage 1/2 |
| `Loan Type` | `Right_Loan Type`, `Loan Type` | Coalesce: right-side join value takes priority | Stage 3 |
| `OutputFilePath_Dropped` | `PeerNo` | String construction with hardcoded path prefix | Stage 7 |
| `Expected Loss - Year 1` through `Year 7` | Join right-side from prior period | `[Right_Expected Loss - Year N]` | Stage 5 |
| `Vintage Adjustment` | Join right-side | `[Right_Vintage Adjustment]` | Stage 5 |
| `Vintage Adjusted Expected Losses` | Join right-side | `[Right_Vintage Adjusted Expected Losses]` | Stage 5 |
| `PP Vintage Adjustment` | Join right-side | `[Right_PP Vintage Adjustment]` | Stage 5 |
| `Vintage Adjustment Flag` | Join right-side | `[Right_Vintage Adjustment Flag]` | Stage 5 |
| `Average Annual Loss Rate` | (static default) | `0` — static zero when no loss rate data | Stage 4 |

### Output Destinations (Confirmed from XML File Paths)

| Output Type | File Path Pattern | Format | Macro |
|---|---|---|---|
| Client File | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\01_CLIENT_FILES\[PeerNo]_[YYYYMMDD]_CLIENT_FILE.yxdb` | Alteryx binary | N/A (direct DbFileOutput) |
| Tableau Extract (Client) | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\02_TDE\[PeerNo]_[YYYYMMDD]_CLIENT_FILE.tde` (legacy path in XML; actual output now .hyper via Macro 1055) | Hyper (post-remediation) | Tableau New Macro (1055) |
| Dropped Records | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\06_DROP_RECORDS\[PeerNo]_19000101_DROPPED RECORDS.yxdb` | Alteryx binary | Tableau New Macro Dropped (1056) |
| Securities Output | `\\10.2.7.56\Shared\PortfolioAnalysis\03_Results\14_SECURITIES\[PeerNo]_19000101_SECURITIES.yxdb` | Alteryx binary | Tableau New Macro Securities (1057) |
| Call Report / Regulatory | `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb` | Alteryx binary | N/A (direct DbFileOutput) |

**Executive Summary** output type: Listed in project requirements but not confirmed as a distinct file path in XML. This may be an informal name for the QA/summary aggregations or may be produced by the PortfolioComposerTable tool (1 instance in XML). The planner should search for this output type during execution.

---

## Lineage Map Document Structure

The LINEAGE_MAP.md deliverable should follow this structure to satisfy all four LIN requirements:

```markdown
# MDPA Data Lineage Map

**Generated:** [date]
**Workflow:** 2020_DataProcess_v5.2.yxmd
**Ground truth:** XML file is authoritative. Doc field names and formulas verified against XML.

## Part 1: Source Systems and Input Fields

### Source 1: Loan Portfolio (ERP / DynamicInput)
| Field Name | XML Name | Type | Notes |
...

### Source 2: Charge-Off/Recovery
...

### Source 3: Real Estate Valuations
...

### Source 4: TransUnion Credit Bureau
...

### Reference/Supplementary Sources (TTA Internal)
...

## Part 2: Processing Stage Transformations

### Stage 1: Data Input and JSON Routing
**Entry point:** JSON_Input → JSONParse → RegEx/Filter → DynamicInput
**Fields entering:** FileGroupNum, Info, RowNum, Header (routing metadata)
**Transformations:** [describe]

### Stage 2: PreProcess and Field Standardization
...

### Stage 3: Data Matching and Consolidation
...

### Stage 4: Calculations and Enrichment
...

### Stage 5: Static Pool and Vintage Cohort Construction
...

### Stage 6: Fair Lending Analysis and Compliance Masking
...

### Stage 7: Output Preparation and Publication
...

## Part 3: Calculated/Derived Field Formulas (LIN-04)

| Field | Formula | Input Fields | Stage | Note |
...

## Part 4: Output Field Mapping (LIN-03)

### Client File: Fields Present
### Tableau Extract: Fields Present
### Dropped Records: Fields Present
### Securities Output: Fields Present
### Call Report / Regulatory: Fields Present

## Part 5: End-to-End Traceability Examples (LIN-01)

### Example 1: Tracing "Net Charge Off Amount" to source
### Example 2: Tracing "Decision FICO Grade" to source
### Example 3: Tracing "Vintage Adjusted Expected Losses" to source
### Example 4: Tracing a Tableau dashboard metric back to source
```

---

## State of the Art

| Old Approach (Doc 6) | Verified Approach (Phase 4) | Impact |
|---|---|---|
| `Risk_Score` = composite numeric formula | `Decision FICO Grade` = categorical A+/A/B/C/D/E from credit score thresholds | Any report referencing Risk_Score is using a non-existent field name |
| `Net Charge Off Amount = [Charge Off Amount] - [Recovery Amount]` | `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif` | The active formula is conditional, not a simple subtraction |
| 5-stage processing model | 7-stage model based on ToolContainer XML structure | Stage 6 (Fair Lending) and Stage 7 (Output) are missing from doc 6 |
| Vintage Adjustment cap as a current-run formula | Vintage Adjustment carried from prior period client file via Join | The cap logic is historical, not recalculated each run |
| LTV documented as simple ratio | LTV presence in XML unconfirmed — must verify field name | May use a different field name or not exist under that name |

**Deprecated/outdated:**
- `Risk_Score` field: Does not exist in XML. Replaced by `Decision FICO Grade` categorical field.
- Net Charge Off Amount simple subtraction formula: Replaced by conditional formula in XML (commented-out old formula remains but is inactive).
- Tableau TDE output format: Replaced by Hyper format via Tableau Output macros 1055/1056/1057 in March 2026 remediation.

---

## Open Questions

1. **What are the actual output fields in each of the 5 output files?**
   - What we know: The 5 output file paths are confirmed from XML. The Client File contains processed loan records with all calculated fields (per doc 2).
   - What's unclear: The exact field list written to each output — this requires tracing what Select tools are applied before each output tool to determine which fields are included vs. excluded.
   - Recommendation: Run Python XML extraction targeting the output tools and the Select tools immediately upstream of them.

2. **Does `LTV` (or equivalent) appear in the XML, and under what field name?**
   - What we know: Doc 6 lists `LTV_Ratio` as a source field and `Market_LTV` as a derived field. The XML FormulaField scan returned no LTV entries.
   - What's unclear: Whether LTV is computed under a different name, computed inside a macro (e.g., `Append RE Values.yxmc`), or simply absent.
   - Recommendation: `grep -i 'LTV\|loan.*to.*value\|collateral' /home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd | head -30` before writing any LTV lineage entry.

3. **What does the `Delinquency_Rate` and `Charge_Off_Rate` look like in the XML?**
   - What we know: These are requirement LIN-04 targets. Neither name appeared in the FormulaField scan. The workflow tracks `Days_Past_Due` equivalent fields and charge-off amounts.
   - What's unclear: Whether these rates are aggregated by Summarize tools (in which case they are stage-level outputs, not record-level fields) or computed as field-level formulas.
   - Recommendation: Search XML for `Delinquency`, `Charge_Off_Rate`, `DPD`, and review Summarize tool configurations.

4. **What is the complete field set output to the Tableau Extract vs. the Client File?**
   - What we know: The workflow produces separate output paths for the Tableau Extract and the Client File. The Tableau New Macro (1055) receives data from one processing stream; the Client File has a separate output.
   - What's unclear: Whether these two outputs share the same field set or differ — if they differ, which fields are added/removed for each.
   - Recommendation: Trace the connection paths leading into the Tableau macro tool (ToolID 1055) vs. the DbFileOutput tool for Client Files.

5. **What fields does the Fair Lending analysis produce, and where do they go?**
   - What we know: Fair Lending produces `Predicted Ethnicity`, `Predicted Gender`, `Rate Differential`, `Include in Fair Lending?`, `Decision FICO Grade`. These fields are computed in Stage 6.
   - What's unclear: Which output files (if any) receive the Fair Lending fields. They may be written to a separate Fair Lending report or included in the Client File under certain conditions.
   - Recommendation: Trace the output connections from the Fair Lending ToolContainer.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — this phase produces a document, not executable code |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Validation Map

Since Phase 4 produces a Markdown document, validation is completeness-based:

| Req ID | Behavior | Validation Method | Automated? |
|--------|----------|-------------------|-----------|
| LIN-01 | LINEAGE_MAP.md allows tracing any output field to its source | Human reviewer picks 3 output fields and traces each to a source system using only the doc | Manual |
| LIN-02 | Transformation at each of 7 stages documented for key fields | Completeness check: does the doc contain a section for each of 7 stages with field-level transformation entries? | Semi-automated: `grep -c "### Stage" LINEAGE_MAP.md` >= 7 |
| LIN-03 | Each field shows which output files it appears in | Spot check: pick 5 key fields and verify each has an "Outputs" column or section | Manual |
| LIN-04 | All derived fields have formulas | Completeness check: do the LIN-04 target fields (Risk_Score equivalent, LTV, Delinquency_Rate, Charge_Off_Rate) each have a formula entry? | Manual + `grep -c "Decision FICO Grade\|Net Charge Off\|Vintage Adjusted\|Probability of Default" LINEAGE_MAP.md` >= 4 |

### Automated Completeness Checks

```bash
# Check Stage coverage (expect >= 7)
grep -c "^### Stage" /home/mabushanab/claude-agents/MDPA/LINEAGE_MAP.md

# Check key derived fields are present
FIELDS=("Decision FICO Grade" "Net Charge Off Amount" "Vintage Adjusted Expected Losses" "Rate Differential" "Charged off past 36 Months")
DOC="/home/mabushanab/claude-agents/MDPA/LINEAGE_MAP.md"
for field in "${FIELDS[@]}"; do
  if ! grep -q "$field" "$DOC"; then echo "MISSING: $field"; fi
done
echo "Check complete."

# Check all 4 source systems documented
grep -c "Source 1\|Source 2\|Source 3\|Source 4" /home/mabushanab/claude-agents/MDPA/LINEAGE_MAP.md
```

### Wave 0 Gaps

None — this phase requires no test framework setup. Validation is document completeness checks using bash/grep.

---

## Sources

### Primary (HIGH confidence — directly extracted from XML)

- `/home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd` — All FormulaField expressions, field names, file paths, ToolContainer annotations, and tool counts confirmed from direct XML extraction during research
- `/home/mabushanab/claude-agents/MDPA/.planning/phases/01-gap-analysis-documentation-audit/01-RESEARCH.md` — Phase 1 research findings: confirmed XML field names, macro inventory, known formula contradictions with docs

### Secondary (MEDIUM confidence — doc content, partially verified against XML)

- `/home/mabushanab/claude-agents/MDPA/6_FIELD_MAPPING_AND_DATA_LINEAGE.md` — Provides source system field inventory starting point; several formulas contradict XML (flagged in this document)
- `/home/mabushanab/claude-agents/MDPA/13_OUTPUT_TO_DASHBOARD_LINEAGE.md` — Output-to-dashboard mapping; useful for LIN-03 but not verified against current XML output paths
- `/home/mabushanab/claude-agents/MDPA/2_WORKFLOW_ARCHITECTURE.md` — Stage definitions and output file paths; largely consistent with XML
- `/home/mabushanab/claude-agents/MDPA/1_MDPA_PROCESS_DOCUMENTATION.md` — Process flow stages and tool counts; counts verified as accurate

### Tertiary (LOW confidence — inferred or uncorroborated)

- Doc 6 formulas not yet verified: LTV formula, Delinquency_Rate formula, Charge_Off_Rate formula — flagged as unconfirmed in Open Questions above

---

## Metadata

**Confidence breakdown:**
- Known field names and formulas (confirmed from XML): HIGH — FormulaField extraction run during research
- Stage structure (7 stages): HIGH — based on ToolContainer annotations and TextBox labels from XML
- Source system input fields: MEDIUM — XML input file paths confirmed; individual field names per source require Select/DynamicInput tracing during execution
- Output field sets per output type: MEDIUM — output file paths confirmed; exact field lists require Select tool tracing upstream of each output
- LTV, Delinquency_Rate, Charge_Off_Rate: LOW — not found in FormulaField scan; presence and formula unconfirmed

**Research date:** 2026-03-19
**Valid until:** Stable — XML file is read-only; findings remain valid until the workflow is modified
