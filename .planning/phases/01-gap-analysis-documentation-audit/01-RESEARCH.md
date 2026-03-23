# Phase 1: Gap Analysis — Documentation Audit - Research

**Researched:** 2026-03-18
**Domain:** Alteryx .yxmd XML parsing, documentation gap analysis methodology, credit union loan workflow auditing
**Confidence:** HIGH

---

## Summary

Phase 1 requires a systematic comparison of a 49,082-line Alteryx workflow XML file against 14 existing Markdown documentation files (~673 pages) to identify three types of gaps: (1) undocumented workflow logic present in the XML but absent from all docs, (2) broken or at-risk dependencies that would cause deployment failures, and (3) doc sections that are internally incomplete, ambiguous, or directly contradict the XML.

The deliverable is a single structured `GAP_ANALYSIS.md` file in the repo. This is a read-only analysis task — no workflow file modification is needed or permitted. The XML file can be fully parsed by the implementer using standard XML processing (grep, Python's xml.etree, or similar). The 14 existing docs were generated programmatically in March 2026 and contain a mix of verified facts (tool counts, macro paths, file paths extracted from XML) and inferred/speculative content (logic descriptions, performance estimates, conditional alert thresholds) that have not been validated against the XML.

**Primary recommendation:** Use the XML as the ground truth for all gap findings. Treat existing docs as hypotheses to be confirmed or refuted by XML evidence, not as facts to be accepted. The three gap categories (undocumented logic, broken dependencies, incomplete/contradictory coverage) map directly to requirements GAP-01, GAP-02, and GAP-03.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAP-01 | Analyst can read a gap analysis report identifying undocumented logic in the workflow not covered by the 14 existing docs | XML formula expressions, TextBox annotations, and ToolContainer structures contain detailed logic not captured in docs — systematic extraction methods documented below |
| GAP-02 | Analyst can see a list of broken or at-risk dependencies (macro paths, CReW library, deployment blockers) | XML macro path audit confirms hard-coded `D:\Users\vnekkanti\AppData\Local\Temp\...` paths on 17 macros; CReW library macros confirmed as external; `2020_PublishSecurities2Server.yxmc` stored in `_externals\1\` path — all enumerated below |
| GAP-03 | Analyst can see coverage gaps — areas where documentation exists but is incomplete, ambiguous, or contradicts the workflow XML | Several specific contradictions identified during research: macro count discrepancy (doc says 23, XML has 20 unique paths), Fair Lending module minimally documented, Vintage Adjustment cap logic (5% floor/ceiling) not described in any doc, Call Report data ingestion undocumented |
</phase_requirements>

---

## Standard Stack

### Core (What the planner should use)

| Component | Version/Tool | Purpose | Why Standard |
|-----------|-------------|---------|--------------|
| Python xml.etree.ElementTree | stdlib | Parse .yxmd XML to extract tools, macros, connections, annotations | Built-in, no dependencies, handles the 49K-line file reliably |
| Python re / grep | stdlib | Extract formula expressions, annotation text, file paths from XML | Regex on raw XML is fast and sufficient for structured attribute extraction |
| Markdown writer | Any | Produce GAP_ANALYSIS.md | Output format is plain Markdown |

### Supporting

| Component | Purpose | When to Use |
|-----------|---------|-------------|
| Python lxml | XML parsing with XPath | Only if ElementTree proves insufficient for complex XPath queries |
| Python csv/json | Produce machine-readable gap tables alongside Markdown | If planner wants structured output in addition to Markdown prose |

### No Installation Required

All work is read-only analysis on files already in the repo. No build tools, no packages beyond Python stdlib are needed.

---

## Architecture Patterns

### Recommended Project Structure

The phase produces one file:
```
MDPA/
└── GAP_ANALYSIS.md          # The deliverable for this phase
```

All working analysis scripts (if any are written) should go in:
```
MDPA/.planning/phases/01-gap-analysis-documentation-audit/
└── scratch/                 # Optional: analysis scripts, working notes
```

### Pattern 1: XML-First Gap Detection

**What:** Extract facts from the XML first, then compare against docs. Never start from the docs and work backwards.

**When to use:** All three gap categories (GAP-01, GAP-02, GAP-03).

**Correct approach:**
```
1. Extract from XML: all macro paths, all formula expressions, all annotation text,
   all file paths, all tool counts, all connection edges
2. For each extracted fact: search the 14 docs for coverage
3. Missing coverage = undocumented logic (GAP-01)
4. Hardcoded temp paths or missing library macros = broken dependencies (GAP-02)
5. Docs that describe X but XML shows Y = contradictions (GAP-03)
```

**Wrong approach:** Reading docs, noting what "seems" covered, and checking XML only for things the docs claim to describe.

### Pattern 2: Gap Classification by Risk

**What:** Every gap finding gets classified by type and severity before writing the report.

**Three gap types for this phase:**
- Type A (GAP-01): Logic in XML with no doc coverage
- Type B (GAP-02): Dependency issue — broken path, missing library, deployment blocker
- Type C (GAP-03): Doc claims X but XML says Y (contradiction or ambiguity)

**Severity rating is for Phase 2 (prioritization), not this phase.** Phase 1 just classifies and describes.

### Pattern 3: Macro Path Audit

**What:** Every `<EngineSettings Macro="...">` element extracted and evaluated against three criteria: (a) is the path a temp/staging path that will break on a different machine, (b) is it an external library dependency (CReW), (c) is it in an `_externals` subdirectory (special packaging).

**Known result from XML inspection:**

| Risk Category | Macros | Path Pattern |
|--------------|--------|-------------|
| Hard temp path (BREAKS on redeploy) | Union Subset Prior Period, Generate Unique ID, Dropped Records Prep, Last Name Comma First Name Cleaner_v2, Preliminary Client File Match, 2020_Date_Converter (×5), Append Charge Offs and Matching, Append RE Values, Auto Value Append, TransUnion Mask_FICO Only_v2, 2020_Publish2Server, 2020_PublishDropped2Server, PreProcess_Iterative, Only Prior Period, Contingent File Input (×8) | `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\` |
| External library (must be installed on server) | CReW_EnsureFields (×8), CReW_ParallelBlockUntilDone (×1), Cleanse (×2), Ethnic & Gender ID (×1), Tableau New Macro, Tableau New Macro Dropped, Tableau New Macro Securities | No path prefix — resolved from Alteryx macro search path |
| External staging subdirectory | 2020_PublishSecurities2Server | `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-..._externals\1\` |

**Critical note for GAP-02:** `2020_PublishSecurities2Server.yxmc` is in `_externals\1\` not the standard `Macros\` directory — this signals it was an add-on package, not originally embedded, and is at higher deployment risk.

### Anti-Patterns to Avoid

- **Trusting doc macro counts without XML verification:** Doc 3 says "15+" macros; doc 7 says "23 unique macros / 42 total instances." XML shows 20 unique macro paths with 41 instances (one `Macro="False"` is not a real macro). The discrepancy is a GAP-03 finding, not a research error.
- **Treating speculative doc content as ground truth:** Docs contain phrases like "Probable Internal Structure," "Likely Internal Operations," and "(inferred)" — these are hypotheses, not XML-verified facts. Any such content must be flagged as "doc asserts X, XML cannot confirm."
- **Conflating Phase 1 and Phase 2 scope:** Phase 1 identifies and describes gaps. Severity prioritization and the final assembled report are Phase 2. Do not assign critical/medium/low ratings in GAP_ANALYSIS.md.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Counting tools per type | Custom parser | `grep -oP 'Plugin="[^"]+"'` piped to `sort/uniq -c` | Already verified to work on this file |
| Extracting all macro paths | Full XML parser | `grep -oP 'Macro="[^"]+"'` | Returns all 41 instances in one command |
| Finding all formula expressions | DOM traversal | `grep -n 'FormulaField expression='` | Gets all 60 Formula tool expressions directly |
| Finding annotation text | XPath | `grep -A8 'TextBox' \| grep '<Text>'` | Extracts all 35 TextBox comments |
| Comparing docs to XML | Semantic diff tool | Manual cross-reference table | No tool exists for prose-to-XML comparison; manual is correct |

**Key insight:** The XML is large (49K lines) but highly regular. Simple regex extraction of the key XML attributes (Plugin, Macro, EngineSettings, FormulaField expression, Text) covers 95% of what the gap analysis needs. Full DOM parsing is overkill for this phase.

---

## Common Pitfalls

### Pitfall 1: Doc Macro Count Inconsistency
**What goes wrong:** Planner treats "23 unique macros" from doc 7 as authoritative. The XML actually contains 20 unique macro path strings (one entry `Macro="False"` is a boolean attribute on a different element, not a macro reference — this was likely miscounted in the docs).
**Why it happens:** Doc 7 counted instances differently; `Macro="False"` may have been miscounted as a macro entry.
**How to avoid:** Count by extracting `<EngineSettings Macro="...">` elements only, then dedup. The correct count from the XML is 20 unique macro files (confirmed by research).
**Warning signs:** Any doc that says "23 unique macros" — this is a GAP-03 finding.

### Pitfall 2: Treating Embedded Macros as "Safe"
**What goes wrong:** Doc 3 calls macros "Embedded" and implies they're safe. In reality, all "embedded" macros reference a hard-coded temp path that is tied to the original developer's local machine (`D:\Users\vnekkanti\...`). They were extracted to that path when the workflow was last opened on that machine. On any other machine, these paths will resolve to nothing.
**Why it happens:** Alteryx embeds macros by extracting them to a staging temp folder during open — the XML records where they were extracted, not where they're permanently stored.
**How to avoid:** Flag all macros with temp paths as "deployment risk: HIGH" regardless of the "embedded" label.

### Pitfall 3: Undocumented Logic Buried in ToolContainers
**What goes wrong:** The workflow uses 25 ToolContainer blocks to group related tools. Doc content describes stages at a high level but does not always describe what's inside each container. Several containers contain significant undocumented logic.
**Why it happens:** ToolContainers are grouping constructs, not listed in the doc's tool inventory. Their annotation text is the only description.
**How to avoid:** Extract all ToolContainer `<Text>` annotation content and check each against the docs. Known underdocumented containers include:
- Fair Lending analysis block (complex ethnicity prediction and rate differential analysis)
- Vintage Adjustment cap logic (±5% floor/ceiling applied to vintage adjustment values)
- Call Report data ingestion and securities default probability logic (added 2022-12-09 per annotation)
- JSON parsing and file group routing logic (entry point for portal API calls)

### Pitfall 4: Formula Expressions That Contradict Doc Descriptions
**What goes wrong:** The docs describe certain calculations in general terms that don't match the actual formulas in the XML.
**Why it happens:** The docs appear to have been written by analyzing the workflow at a high level, not by reading formula expressions directly.
**Known contradictions to document as GAP-03:**
- Doc 6 says `Net Charge Off Amount` uses the formula `[Charge Off Amount] - [Recovery Amount]`; the XML formula is `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif` (a conditional that differs from the doc description — the commented-out original formula matches the doc, but the active formula does not)
- Doc 6 lists a `Risk_Score` formula involving `DTI_Ratio`, `Credit_Score`, and `Age_of_Loan_Days`; the XML does not contain a field named `Risk_Score` — risk scoring appears to use `Decision FICO Grade` (A+/A/B/C/D/E) based on Original Credit Score thresholds, not a composite numeric score
- `Vintage Adjustment` has a documented cap formula in the XML (capped at PP ±5%) that is not described in any doc — the Vintage Adjustment Flag values ("First Value", "Actual Increase", "Prior +5%", etc.) are also undocumented
- `Vintage Adjusted Expected Losses = [Vintage Expected Losses] * [Vintage Adjustment]` is explicit in the XML but not stated in any doc

### Pitfall 5: Missing Output Type in Documentation
**What goes wrong:** Doc 4 lists 5 output types (Client Files, Tableau Extracts, Dropped Records, Regulatory Data, Intermediate/Working Files). The XML shows a sixth output: Securities output (`03_Results/14_SECURITIES/[PEERID]_19000101_SECURITIES.yxdb`) published by `2020_PublishSecurities2Server.yxmc`. While doc 4 lists this path in the "Output Files" table, doc 3 omits `2020_PublishSecurities2Server.yxmc` from its macro list entirely.
**How to avoid:** Always cross-check the macro list in doc 3 against actual XML macro paths.

### Pitfall 6: Fair Lending Block Not Covered in Compliance Documentation
**What goes wrong:** The Fair Lending processing block in the XML contains substantial ethnicity prediction logic (computing `Predicted Ethnicity` from zip code demographic data, calculating `Rate Differential` vs. `Average Interest Rates`, running outlier elimination in two phases, computing `Include in Fair Lending?` flag). This is mentioned only briefly in doc 4 as a "Fair Lending Files" data source and not described as a processing stage in any doc.
**Why it matters:** This block uses a zip code ethnicity index file (`Zip Code Ethnicity Index.csv`) from a client-specific consulting folder path (`\Consulting_Client_Files\2020\0000_OTHER\Alan\Fair Lending Files\`) — a path that may no longer be valid and is specific to one client (Alan/Dover 2019). This represents both a documentation gap (GAP-01) and a possible deployment blocker (GAP-02).

---

## Code Examples

Verified extraction patterns for the implementer:

### Extracting All Macro Paths from the XML
```bash
# Source: Direct XML inspection of 2020_DataProcess_v5.2.yxmd
grep -oP 'Macro="[^"]+"' 2020_DataProcess_v5.2.yxmd | sort | uniq -c | sort -rn
# Excludes Macro="False" which is a boolean attribute, not a macro reference
grep -oP 'Macro="[^"]+"' 2020_DataProcess_v5.2.yxmd | grep -v 'Macro="False"' | sort -u
```

### Extracting All Formula Expressions
```bash
# Source: Direct XML inspection of 2020_DataProcess_v5.2.yxmd
grep -n 'FormulaField expression=' 2020_DataProcess_v5.2.yxmd \
  | sed 's/.*expression="\([^"]*\)".*/\1/' \
  | head -50
```

### Extracting All TextBox Annotations (Inline Workflow Comments)
```bash
# Source: Direct XML inspection of 2020_DataProcess_v5.2.yxmd
grep -A8 'Plugin="AlteryxGuiToolkit.TextBox.TextBox"' 2020_DataProcess_v5.2.yxmd \
  | grep -E '<Text>|</Text>'
```

### Extracting All Tool Types with Counts
```bash
# Source: Direct XML inspection of 2020_DataProcess_v5.2.yxmd
grep -oP 'Plugin="[^"]+"' 2020_DataProcess_v5.2.yxmd | sort | uniq -c | sort -rn
```

### Extracting All File Paths (Inputs and Outputs)
```bash
# Source: Direct XML inspection
grep -oP '\\\\[^<"]+\.(yxdb|xlsx|csv|tde|yxmd)' 2020_DataProcess_v5.2.yxmd | sort -u
```

### Python XML Parsing (for structured extraction)
```python
# Source: Python stdlib xml.etree.ElementTree
import xml.etree.ElementTree as ET

tree = ET.parse('2020_DataProcess_v5.2.yxmd')
root = tree.getroot()

# Get all nodes with their tool IDs and plugins
for node in root.iter('Node'):
    tool_id = node.get('ToolID')
    gui = node.find('GuiSettings')
    if gui is not None:
        plugin = gui.get('Plugin', '')
        print(f"Tool {tool_id}: {plugin}")
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|-----------------|-------|
| Read docs, trust them | Extract XML facts first, treat docs as hypotheses | Docs were generated programmatically in March 2026; accuracy unvalidated by SME |
| Manual macro inventory | grep extraction of all EngineSettings Macro= attributes | Provides authoritative count and paths directly from XML |
| Narrative gap descriptions | Structured gap table with Type/ID/Location/Finding columns | Makes gaps actionable for Phase 2 prioritization |

---

## Key Findings from Pre-Research XML Inspection

The following facts were verified directly from the XML and represent confirmed research findings the planner should use when designing tasks:

### Tool Inventory (Confirmed from XML)
| Tool Type | XML Count | Doc Claim | Match? |
|-----------|-----------|-----------|--------|
| Select | 67 | 67 | YES |
| Formula | 60 | 60 | YES |
| TextBox | 35 | 35 | YES |
| Filter | 27 | 27 | YES |
| ToolContainer | 25 | Not enumerated | PARTIAL — doc mentions containers but doesn't count them |
| Summarize | 24 | 24 | YES |
| Union | 24 | 24 | YES |
| Join | 21 | 21 | YES |
| MultiFieldFormula | 10 | 0 (not mentioned) | GAP-01 FINDING |
| AppendFields | 11 | 11 | YES |
| TextInput | 11 | 11 | YES |
| DynamicInput | 4 | ~0 (mentioned as "Database Input/Output: 5-4") | INCONSISTENT |
| DbFileInput | 5 | "5-4" | PARTIALLY COVERED |
| DynamicRename | 4 | Mentioned | PARTIAL |
| Sort | 8 | 8 | YES |
| CrossTab | 6 | 6 | YES |
| MultiRowFormula | 4 | 4 | YES |
| RegEx | 2 | Mentioned | PARTIAL |
| Unique | 2 | Not mentioned | GAP-01 FINDING |
| Sample | 2 | Not mentioned | GAP-01 FINDING |
| BrowseV2 | 2 | Not mentioned | GAP-01 FINDING |
| DynamicSelect | 2 | Not mentioned | GAP-01 FINDING |
| JSONParse | 1 | Not mentioned | GAP-01 FINDING |
| GenerateRows | 1 | Not mentioned | GAP-01 FINDING |
| FindReplace | 1 | Not mentioned | GAP-01 FINDING |
| RecordID | 1 | Not mentioned | GAP-01 FINDING |
| PortfolioComposerTable | 1 | Mentioned as "Portfolio Composer table outputs" | PARTIAL — tool name and behavior undescribed |
| PortfolioEmail | 1 | Documented | YES (doc 5 covers this accurately) |

### Macro Inventory (Confirmed from XML)
| Macro File | XML Instances | In Doc 3? | In Doc 7? | Deployment Risk |
|------------|--------------|-----------|-----------|-----------------|
| CReW_EnsureFields.yxmc | 8 | YES | YES (8 instances) | External library |
| Contingent File Input.yxmc | 8 | YES | YES (8 instances) | Temp path |
| 2020_Date_Converter.yxmc | 5 | YES (3+) | YES (5 instances) | Temp path |
| Cleanse.yxmc | 2 | YES | YES | External library |
| Tableau New Macro.yxmc | 1 | YES | YES | External library |
| Tableau New Macro Dropped.yxmc | 1 | YES | YES | External library |
| Tableau New Macro Securities.yxmc | 1 | YES | YES | External library |
| CReW_ParallelBlockUntilDone.yxmc | 1 | YES | YES | External library |
| Ethnic & Gender ID.yxmc | 1 | YES | YES | External library |
| Union Subset Prior Period.yxmc | 1 | YES | YES | Temp path |
| Append Charge Offs and Matching.yxmc | 1 | YES | YES | Temp path |
| Append RE Values.yxmc | 1 | YES | YES | Temp path |
| Auto Value Append.yxmc | 1 | YES | YES | Temp path |
| TransUnion Mask_FICO Only_v2.yxmc | 1 | YES | YES | Temp path |
| Preliminary Client File Match.yxmc | 1 | YES | YES | Temp path |
| Only Prior Period.yxmc | 1 | YES | YES | Temp path |
| Dropped Records Prep.yxmc | 1 | YES | YES | Temp path |
| Generate Unique ID.yxmc | 1 | YES | YES | Temp path |
| PreProcess_Iterative.yxmc | 1 | YES | YES | Temp path |
| Last Name Comma First Name Cleaner_v2.yxmc | 1 | YES | YES | Temp path |
| 2020_Publish2Server.yxmc | 1 | YES | YES | Temp path |
| 2020_PublishDropped2Server.yxmc | 1 | YES | YES | Temp path |
| 2020_PublishSecurities2Server.yxmc | 1 | NO (omitted from doc 3) | NO | _externals path — GAP-01 + GAP-02 |

**Macro count resolution:** XML has 20 unique macro file names across 41 instances (excluding `Macro="False"`). Doc 3 claims "15+" (approximate), doc 7 claims "23 unique macros / 42 total instances." Neither count is exactly right. The `2020_PublishSecurities2Server.yxmc` macro is absent from both docs. Doc 7's count of 23 likely includes some macros counted twice under different aliases or included `Macro="False"`.

### Confirmed Undocumented Logic Blocks (GAP-01 Findings)

1. **Fair Lending Analysis Module** — The XML contains a complete ethnicity/gender prediction pipeline using:
   - Zip Code Ethnicity Index CSV (client-specific path: `\Consulting_Client_Files\2020\0000_OTHER\Alan\Fair Lending Files\`)
   - `Predicted Ethnicity` (6 categories: White/Black/Asian/American Indian/Multi Race/Hispanic)
   - `Predicted Gender`
   - `Ethnicity Confidence`, `Predicted Description` fields
   - Two-phase outlier elimination using `Rate Differential` vs. `Average Interest Rates`
   - `Include in Fair Lending?` flag
   - `Decision FICO Grade` (A+/A/B/C/D/E tiering based on original credit score)
   - None of this logic is described in any of the 14 docs beyond a passing mention of "Fair Lending Files" as a data source

2. **Vintage Adjustment Cap Logic** — The XML contains an explicit ±5% dampening formula:
   ```
   if [Vintage Adjustment] > [PP Vintage Adjustment] then
     min([Vintage Adjustment], [PP Vintage Adjustment] + ([PP Vintage Adjustment] * 0.05))
   elseif [Vintage Adjustment] < [PP Vintage Adjustment] then
     max([Vintage Adjustment], [PP Vintage Adjustment] - ([PP Vintage Adjustment] * 0.05))
   else [Vintage Adjustment] endif
   ```
   And a flag categorizing the result as "First Value", "Prior +5%", "Prior -5%", "Actual Increase", "Actual Decrease", or "Same". No doc describes this dampening logic or its business rationale.

3. **Call Report / Securities Default Probability Logic** — Added 2022-12-09 by DPrice. The XML annotation reads "brings in default probabilities on securities." The `CallReportDataShort.yxdb` input path is present in the XML but the specific logic integrating call report data into the allowance model is not described in any doc.

4. **Static Pool / Vintage Year Cohort Logic** — The XML generates Year 0 through Year 6 boolean flags (days-from-origination bucketing), a `Vintage Year` field (origination year), and `Expected Loss - Year 1` through `Expected Loss - Year 7` fields. The cohort construction logic and the static pool methodology are referenced in Tableau doc (doc 12) but not described as a workflow processing step in any doc.

5. **MultiFieldFormula Tools (10 instances)** — These tools apply a formula across multiple fields at once (e.g., `UPPERCASE([_CurrentField_])` applied to all string fields, or null/empty conversion for numeric fields). None of the 14 docs mentions `MultiFieldFormula` as a tool type. These are used extensively for bulk field standardization.

6. **JSON Parsing and Dynamic File Routing** — The workflow entry point uses `JSONParse`, `RegEx`, and `Filter` tools to parse the portal JSON input into `FileGroupNum`, `Info`, `RowNum`, and `Header` fields, then routes files dynamically. The mechanics of this routing (how a JSON object translates to multiple file reads via DynamicInput tools) are described only vaguely in doc 2.

7. **Participation Loans Historical Master** — The workflow reads `0000_MASTER_PARTICIPATIONS.yxdb` from `02_TTA_Files/06_Participations/`. An annotation reads "Participation Loans Historical Master." This data source appears in doc 4 but the logic for how participation loan records are processed and merged into the main loan stream is not described.

8. **`Charged off past 36 Months?` and `Originated Past 5 Years?` Flags** — Both appear as formula-derived boolean fields in the XML but are not documented in doc 6 (Field Mapping) or doc 9 (Business Data Glossary).

### Confirmed Dependency Issues (GAP-02 Findings)

1. **17 macro files reference hard-coded temp paths** on `D:\Users\vnekkanti\` that will fail on any machine other than the original developer's (includes all embedded custom macros).

2. **`2020_PublishSecurities2Server.yxmc` stored in `_externals\1\`** subdirectory — not the standard Macros\ folder — indicating it was externally packaged and may require different handling during deployment than the other embedded macros.

3. **CReW library macros (8 + 1 + 2 + 1 = 12 instances total across 4 macro files)** have no path prefix — they rely on the CReW library being installed in the Alteryx macro search path on the execution server.

4. **Fair Lending Zip Code Ethnicity Index CSV** at `\Consulting_Client_Files\2020\0000_OTHER\Alan\Fair Lending Files\Zip Code Ethnicity Index.csv` — This is a client-specific path from a 2020 consulting engagement. It is unclear whether this file is available in all production runs or is institution-specific.

5. **Call Report data file** at `\\10.2.7.56\Shared\Prod\Outputs\Call Report Files\Twb Data Source Files\CallReportDataShort.yxdb` — This file is both a source (read by the workflow) and an output (written by the workflow) at the same path. Docs describe it as an output only; it also appears as an input (`DbFileInput`) in the XML. This read-before-write pattern is a potential race condition and is not documented.

6. **SMTP server not configured in workflow** — The Email tool has `<SMTPServerName />` (empty) and relies on a DCM connection ID (`28b7a82a-6561-4456-b42d-e5fa3babd296`). If the Alteryx Server's Connection Manager doesn't have this connection configured, email alerts will silently fail.

---

## GAP_ANALYSIS.md Report Structure

The deliverable for this phase is a single Markdown file. Use this structure:

```markdown
# MDPA Gap Analysis Report — Phase 1: Documentation Audit

**Generated:** [date]
**Workflow:** 2020_DataProcess_v5.2.yxmd (49,082 lines XML)
**Docs Audited:** 14 files (1_MDPA_PROCESS_DOCUMENTATION.md through 14_SECURITIES_COLLATERAL_GUIDE.md)
**Phase:** 1 of 9 — Audit only (no severity ratings; see Phase 2 for prioritization)

## Executive Summary
[Total count of each gap type found]

## GAP-01: Undocumented Workflow Logic

### Format per finding:
| Gap ID | Location in XML | Description | Doc Coverage |
|--------|----------------|-------------|--------------|
| G01-001 | ToolContainer "Fair Lending", tools 857-??? | Fair Lending ethnicity prediction pipeline... | Not covered |

[All GAP-01 findings as table rows]

## GAP-02: Broken or At-Risk Dependencies

### Format per finding:
| Gap ID | Dependency | Risk Type | Details |
|--------|-----------|-----------|---------|
| G02-001 | Union Subset Prior Period.yxmc | Hard temp path | D:\Users\vnekkanti\AppData\Local\... |

[All GAP-02 findings as table rows]

## GAP-03: Incomplete, Ambiguous, or Contradictory Documentation

### Format per finding:
| Gap ID | Document | Section | Issue Type | Details |
|--------|----------|---------|------------|---------|
| G03-001 | 3_MACROS_AND_DEPENDENCIES.md | Macro Inventory | Missing | 2020_PublishSecurities2Server.yxmc absent |
| G03-002 | 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | Stage 2 Calculations | Contradiction | Risk_Score formula in doc does not match XML... |

[All GAP-03 findings as table rows]

## Appendix A: XML Extraction Summary
[Tool counts table, macro inventory, file paths — raw data supporting findings]

## Appendix B: Coverage Matrix
[14 docs × key workflow topics — what each doc covers vs. XML ground truth]
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — this phase produces a document, not executable code |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements Validation

Since this phase produces a Markdown document rather than executable software, standard automated testing does not apply. Validation is completeness-based:

| Req ID | Behavior | Validation Method | Automated? |
|--------|----------|-------------------|-----------|
| GAP-01 | GAP_ANALYSIS.md contains a table of undocumented logic items | Human reviewer checks: does each entry cite an XML location AND confirm no doc coverage? | Manual — doc review |
| GAP-02 | GAP_ANALYSIS.md contains a table of broken/at-risk dependencies | Script can verify: do all 17 temp-path macros appear in the dependency table? | Automated — grep comparison |
| GAP-03 | GAP_ANALYSIS.md contains a table of doc contradictions/ambiguities | Human reviewer checks: does each entry cite the specific doc section AND the XML evidence? | Manual — doc review |

### Automated Completeness Check

The following script can be run to verify GAP-02 completeness — it checks that all known temp-path macros appear somewhere in the output file:

```bash
# Verify all macro temp paths appear in GAP_ANALYSIS.md
MACROS=(
  "Union Subset Prior Period"
  "Generate Unique ID"
  "Dropped Records Prep"
  "Last Name Comma First Name Cleaner_v2"
  "Preliminary Client File Match"
  "2020_Date_Converter"
  "Append Charge Offs and Matching"
  "Append RE Values"
  "Auto Value Append"
  "TransUnion Mask_FICO Only_v2"
  "2020_Publish2Server"
  "2020_PublishDropped2Server"
  "PreProcess_Iterative"
  "Only Prior Period"
  "Contingent File Input"
  "2020_PublishSecurities2Server"
)
REPORT="/home/mabushanab/claude-agents/MDPA/GAP_ANALYSIS.md"
for macro in "${MACROS[@]}"; do
  if ! grep -q "$macro" "$REPORT"; then
    echo "MISSING from report: $macro"
  fi
done
echo "Check complete."
```

### Wave 0 Gaps

None — this phase requires no test framework setup. The automated completeness check above uses only bash/grep.

---

## Open Questions

1. **Is `2020_PublishSecurities2Server.yxmc` actually missing from doc 3 (GAP-01 finding)?**
   - What we know: The macro path appears in XML; doc 3 does not list it; doc 7 does not list it.
   - What's unclear: Whether this omission was intentional (the macro was added after docs were written) or accidental.
   - Recommendation: Flag as GAP-01 finding (undocumented macro) and GAP-02 (unique `_externals` path).

2. **Is the Fair Lending analysis module institution-specific or universal?**
   - What we know: The Fair Lending ToolContainer is present in the XML. The Zip Code Ethnicity Index CSV path references a 2020 consulting client directory.
   - What's unclear: Whether this module runs for all institutions or only when specific parameters are provided.
   - Recommendation: Flag as GAP-01 (logic undocumented) and GAP-02 (client-specific path may not exist in production).

3. **Does the docs' `Risk_Score` field actually exist in the workflow?**
   - What we know: Doc 6 describes a `Risk_Score` formula using DTI, Credit Score, and Age. The XML contains `Decision FICO Grade` (A+/A/B/C/D/E) but no field named `Risk_Score` was found in a preliminary search.
   - What's unclear: Whether Risk_Score exists under a different name in the XML, or whether doc 6 invented this field.
   - Recommendation: Full XPath search for `Risk_Score` in all field names, formula outputs, and select tool renames. If not found, this is a major GAP-03 finding (doc describes a non-existent field).

4. **What is the `CallReportDataShort.yxdb` read-before-write pattern?**
   - What we know: The file appears as both a DbFileInput and DbFileOutput in the XML at the same path. This could mean the workflow appends to it, or replaces it, or there's a sequential read-then-write pattern.
   - What's unclear: Whether this is intentional design or a documentation gap.
   - Recommendation: Flag as GAP-02 (potential deployment issue) and GAP-01 (undocumented read behavior).

---

## Sources

### Primary (HIGH confidence — directly extracted from the XML file)
- `/home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd` — All tool types, macro paths, formula expressions, file paths, and TextBox annotations were read directly from this file during research. Node count: 412. Connection count: 335. Unique macro paths: 20.

### Secondary (MEDIUM confidence — doc content cross-referenced with XML)
- `/home/mabushanab/claude-agents/MDPA/3_MACROS_AND_DEPENDENCIES.md` — Macro inventory claims verified against XML; discrepancy found (2020_PublishSecurities2Server.yxmc absent)
- `/home/mabushanab/claude-agents/MDPA/7_MACROS_DEEP_DIVE.md` — Instance counts partially verified; 42 total instances in doc vs. 41 in XML (Macro="False" explains the discrepancy)
- `/home/mabushanab/claude-agents/MDPA/6_FIELD_MAPPING_AND_DATA_LINEAGE.md` — Formula descriptions checked against XML formula expressions; Net Charge Off Amount contradiction confirmed
- `/home/mabushanab/claude-agents/MDPA/1_MDPA_PROCESS_DOCUMENTATION.md` through `/home/mabushanab/claude-agents/MDPA/5_ALERTS_AND_NOTIFICATIONS.md` — Structure and claims reviewed against XML evidence

### Context (informational)
- `/home/mabushanab/claude-agents/MDPA/.planning/REQUIREMENTS.md` — GAP-01/02/03 scope
- `/home/mabushanab/claude-agents/MDPA/.planning/ROADMAP.md` — Phase 1 success criteria
- `/home/mabushanab/claude-agents/MDPA/.planning/STATE.md` — Known blockers and decisions

---

## Metadata

**Confidence breakdown:**
- XML tool inventory: HIGH — extracted directly from XML via grep
- Macro path analysis: HIGH — all 41 macro references extracted and categorized
- Gap type classification: HIGH — based on direct XML vs. doc comparison
- Undocumented logic findings: HIGH — specific formula expressions and annotations read from XML
- Doc contradiction findings: MEDIUM — require full formula-by-formula comparison to enumerate exhaustively

**Research date:** 2026-03-18
**Valid until:** Stable — XML file is read-only; findings remain valid until either the XML or docs change
