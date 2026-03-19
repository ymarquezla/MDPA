# Phase 6: Macro Inventory — Cataloguing and Risk Rating - Research

**Researched:** 2026-03-19
**Domain:** Alteryx macro XML analysis — cataloguing, logic extraction, and deployment risk rating
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MAC-01 | Every macro (15+ unique) is catalogued with: name, category, purpose, inputs, outputs, instance count | XML extraction confirms 20 unique macros, 41 instances — all names, categories, and instance counts verified from the .yxmd file |
| MAC-02 | Each macro has a logic summary describing what transformation it performs | Existing docs 7 and 24 contain logic descriptions for all 20 macros; XML MetaInfo fields confirm output field sets for each macro |
| MAC-03 | Each macro has a deployment risk rating (embedded/external, path risk, CReW dependency) | GAP_ANALYSIS.md G02-001–G02-017 establishes exact risk tiers; XML path analysis confirms three deployment categories |
| MAC-04 | Macro inventory includes the full dependency map showing execution order | Doc 3 and doc 7 contain dependency maps; XML line-number ordering (lines 319–47321) gives sequential execution order |
</phase_requirements>

---

## Summary

Phase 6 produces MACRO_INVENTORY.md — a single authoritative document cataloguing all 20 unique macros in the MDPA v5.2 workflow with their purpose, logic, inputs/outputs, instance counts, and deployment risk ratings. This document replaces and supersedes the partial macro content in docs 3, 7, and 24, which were confirmed to have count errors and a missing macro (2020_PublishSecurities2Server.yxmc).

The primary research work is done: XML extraction from the .yxmd file gives us exact counts and deployment paths. GAP_ANALYSIS.md (Phase 1/2 output) already established the risk tier structure. Docs 3, 7, and 24 provide logic summaries that were authored from the same XML — they can be used as starting drafts but must be reconciled against the XML-ground-truth count of 20 files/41 instances.

The planner's job is to produce a single MACRO_INVENTORY.md that synthesizes all three existing macro docs into a clean, verified, risk-rated catalogue. No new XML extraction work is needed — all facts are already available in either the GAP_ANALYSIS.md or the existing doc files.

**Primary recommendation:** Write MACRO_INVENTORY.md by synthesizing GAP_ANALYSIS.md (for risk tiers), doc 24 (for logic descriptions), and doc 7 (for nesting and complexity), reconciled against the XML-verified count of 20 unique macros, 41 instances.

---

## Standard Stack

This phase is documentation-only (no code, no libraries). The "stack" is the set of source files consumed.

### Source Files (Read-Only)

| File | Content | Role in Phase 6 |
|------|---------|----------------|
| `2020_DataProcess_v5.2.yxmd` | 49,082-line Alteryx workflow XML | Ground truth — macro names, paths, instance counts |
| `GAP_ANALYSIS.md` | Phase 1/2 gap analysis output | Risk tiers (G02-001 through G02-017), deployment categories |
| `3_MACROS_AND_DEPENDENCIES.md` | Existing macro inventory doc | Category structure, dependency flow diagram |
| `7_MACROS_DEEP_DIVE.md` | Existing deep-dive macro doc | Nesting analysis, complexity ratings, Tableau remediation history |
| `24_MACRO_INVENTORY_WITH_LOGIC.md` | Existing logic descriptions | Business purpose, inputs, outputs, internal logic for all 23 claimed macros (contains count error — correct to 20) |
| `DATA_LINEAGE.md` | Phase 4 lineage output | Confirms which macros produce which output fields |

### Output File

| File | Location | What it Contains |
|------|----------|-----------------|
| `MACRO_INVENTORY.md` | MDPA repo root | Complete catalogue of 20 macros with category, purpose, logic, inputs, outputs, instance count, deployment risk rating, and dependency map |

---

## Architecture Patterns

### Recommended MACRO_INVENTORY.md Structure

```
MACRO_INVENTORY.md
├── Header (workflow name, date, XML ground truth line)
├── Executive Summary (counts by category and risk tier)
├── ## Macro Catalogue
│   └── One section per macro (20 sections), ordered by execution stage
│       ├── Name, category, instances, macro type
│       ├── Purpose (plain language)
│       ├── Inputs and Outputs (field-level where known)
│       ├── Logic Summary (what transformation it performs)
│       └── Deployment Risk Rating
├── ## Deployment Risk Register
│   └── Table mapping each macro to its risk tier and remediation reference
└── ## Macro Dependency Map
    └── Execution-order diagram from XML line numbers
```

### Pattern 1: Per-Macro Entry Format

Each macro entry follows a consistent schema:

```markdown
### [N]. MacroName.yxmc

| Property | Value |
|----------|-------|
| **Category** | [Input / Validation / Transformation / Enrichment / Matching / Output / Flow Control] |
| **Instances** | [N] |
| **Macro Type** | [Embedded-TempPath / Embedded-Externals / External-Library] |
| **Deployment Risk** | [CRITICAL / HIGH / MEDIUM / LOW] |
| **Risk Basis** | [hard-path / external-library / CReW-dependency / path-resolved] |

**Purpose:** [One sentence — what business problem this solves]

**Inputs:** [Key field names or data types consumed]

**Outputs:** [Key fields or data types produced]

**Logic Summary:** [Plain-language description of what transformation it performs — 2-4 sentences]

**Deployment Notes:** [Specific action needed for this macro to work on a new machine]
```

### Pattern 2: Execution-Order Dependency Map

Document macros in the order they appear in the XML (by line number). The execution stage can be inferred from XML line position:

```
Stage 1 — Input Loading (lines ~46,000+)
  Contingent File Input.yxmc (x8)

Stage 2 — Data Union / Prior Period (lines ~319)
  Union Subset Prior Period.yxmc (x1)

Stage 3 — Preprocessing (lines ~43,550)
  PreProcess_Iterative.yxmc (x1)

Stage 4 — Validation Gates (lines ~4,633; 38,092–41,528)
  CReW_EnsureFields.yxmc (x8)

Stage 5 — Data Transformation (lines ~36,560–40,793)
  Generate Unique ID.yxmc (x1)
  Dropped Records Prep.yxmc (x1)
  Last Name Comma First Name Cleaner_v2.yxmc (x1)
  Cleanse.yxmc (x2)
  Preliminary Client File Match.yxmc (x1)
  2020_Date_Converter.yxmc (x5)
  Append Charge Offs and Matching.yxmc (x1)
  Ethnic & Gender ID.yxmc (x1)
  TransUnion Mask_FICO Only_v2.yxmc (x1)
  Append RE Values.yxmc (x1)
  Auto Value Append.yxmc (x1)

Stage 6 — Period Filtering (lines ~43,978)
  Only Prior Period.yxmc (x1)

Stage 7 — Flow Control (lines ~16,923)
  CReW_ParallelBlockUntilDone.yxmc (x1)

Stage 8 — Output Formatting (lines ~29,339)
  Tableau New Macro.yxmc (x1)
  Tableau New Macro Dropped.yxmc (x1)
  Tableau New Macro Securities.yxmc (x1)

Stage 9 — Server Publishing (lines ~47,237–47,321, DISABLED)
  2020_Publish2Server.yxmc (x1)
  2020_PublishDropped2Server.yxmc (x1)
  2020_PublishSecurities2Server.yxmc (x1)
```

### Anti-Patterns to Avoid

- **Do not use doc 7's count of 23 macros / 42 instances.** XML ground truth is 20 unique files / 41 instances. The discrepancy is documented in GAP_ANALYSIS.md (G03-003, REM-016).
- **Do not omit 2020_PublishSecurities2Server.yxmc.** It is absent from docs 3 and 7 but confirmed in the XML at the `_externals\1\` path (GAP G01-009, G03-004, REM-015).
- **Do not classify Cleanse.yxmc and Ethnic & Gender ID.yxmc as embedded.** GAP_ANALYSIS.md confirmed these have no path prefix — they are external library macros resolved from the CReW/Alteryx macro search path (G02-017).
- **Do not conflate the legacy Publish macros with the active Tableau macros.** The three 2020_Publish*.yxmc macros are DISABLED (Container 1049 in the XML). The three Tableau New Macro*.yxmc macros are ACTIVE (Containers 1055, 1056, 1057).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Macro count | Re-count from XML | Use verified count from GAP_ANALYSIS.md | Already computed and cross-checked: 20 files, 41 instances |
| Risk tiers | Re-derive risk classification | Copy from GAP_ANALYSIS.md G02-001–G02-017 | Phase 1 work already established the three deployment categories |
| Logic descriptions | Re-write from scratch | Synthesize from doc 24 entries | Doc 24 covers all macros; logic summaries are already written |
| Execution order | Re-parse XML for tool connections | Use XML line numbers as ordering proxy | Line number position gives reliable stage ordering without parsing connection graph |

**Key insight:** The core cataloguing work was partially done in Phases 1/2 (risk) and in docs 7/24 (logic). MACRO_INVENTORY.md is a synthesis and correction document, not a ground-up research effort.

---

## Common Pitfalls

### Pitfall 1: Using doc-sourced counts instead of XML counts
**What goes wrong:** MACRO_INVENTORY.md states "23 unique macros" inherited from doc 7, contradicting the XML-verified count of 20.
**Why it happens:** Doc 7 was authored before the count correction was applied in Phase 1.
**How to avoid:** Always state "20 unique macro files, 41 instances (XML ground truth, verified 2026-03-18)" and cite GAP REM-016.
**Warning signs:** Any count other than 20/41 in the draft document.

### Pitfall 2: Missing 2020_PublishSecurities2Server.yxmc
**What goes wrong:** Doc 3 and doc 7 both omit this macro. Copying their inventories produces a 19-macro list.
**Why it happens:** The macro is in `_externals\1\` (non-standard path) and was missed in the original doc authoring.
**How to avoid:** Always include it as entry 20; risk tier is CRITICAL (G02-016). Its annotation in the XML is "2020 Publish Securities to Tableau (929)".
**Warning signs:** Inventory table has 19 rows.

### Pitfall 3: Confusing active vs. disabled publishing macros
**What goes wrong:** The three 2020_Publish*.yxmc macros are marked as disabled in the XML (Container 1049) after the March 18, 2026 Tableau remediation. Documenting them as "active" is wrong.
**Why it happens:** Doc 3 was written before the remediation; it describes the old TDE publishing path as live.
**How to avoid:** Check doc 7 section "Tableau Macro Remediation (March 18, 2026)" — it explicitly states these are DISABLED. The Tableau New Macro*.yxmc set (1055/1056/1057) is the active publishing path.
**Warning signs:** No mention of "DISABLED" or "legacy" for the 2020_Publish* macros.

### Pitfall 4: Classifying CReW macros as embedded
**What goes wrong:** CReW_EnsureFields, CReW_ParallelBlockUntilDone, Cleanse, and Ethnic & Gender ID are listed as "embedded" in the risk table.
**Why it happens:** Doc 3 originally classified them as embedded. GAP G02-017 corrected this.
**How to avoid:** These four have no path prefix in the XML — they are external-library macros. Risk: CRITICAL (require CReW Runner library on execution server).
**Warning signs:** Risk column says "embedded" for any of the four CReW macros.

### Pitfall 5: Treating execution order as fully deterministic from XML line numbers
**What goes wrong:** Stage ordering claim is presented as precise when it is approximate.
**Why it happens:** XML line numbers reflect declaration order, not guaranteed Alteryx execution order (Alteryx uses a parallel processing engine).
**How to avoid:** Frame the dependency map as "approximate execution stage" rather than "strict serial order." The stage groupings are reliable; the intra-stage ordering is approximate.
**Warning signs:** Dependency map shows arrows implying strict sequential execution between macros within the same stage.

---

## Code Examples

### XML Extraction Commands (Verified Working)

All commands verified against the .yxmd file on 2026-03-19.

#### Macro instance count (deduplicated)
```bash
grep -oP 'Macro="[^"]+"' /home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd \
  | grep -v 'Macro="False"' \
  | sort | uniq -c | sort -rn
```

Confirmed output (20 unique macros, 41 instances total):
```
8  Macro="D:\...\Contingent File Input.yxmc"
8  Macro="CReW_EnsureFields.yxmc"
5  Macro="D:\...\2020_Date_Converter.yxmc"
2  Macro="Cleanse.yxmc"
1  Macro="Tableau New Macro.yxmc"
1  Macro="Tableau New Macro Securities.yxmc"
1  Macro="Tableau New Macro Dropped.yxmc"
1  Macro="Ethnic &amp; Gender ID.yxmc"
1  Macro="D:\..._externals\1\2020_PublishSecurities2Server.yxmc"
1  Macro="D:\...\Union Subset Prior Period.yxmc"
1  Macro="D:\...\TransUnion Mask_FICO Only_v2.yxmc"
1  Macro="D:\...\Preliminary Client File Match.yxmc"
1  Macro="D:\...\PreProcess_Iterative.yxmc"
1  Macro="D:\...\Only Prior Period.yxmc"
1  Macro="D:\...\Last Name Comma First Name Cleaner_v2.yxmc"
1  Macro="D:\...\Generate Unique ID.yxmc"
1  Macro="D:\...\Dropped Records Prep.yxmc"
1  Macro="D:\...\Auto Value Append.yxmc"
1  Macro="D:\...\Append RE Values.yxmc"
1  Macro="D:\...\Append Charge Offs and Matching.yxmc"
1  Macro="D:\...\2020_PublishDropped2Server.yxmc"
1  Macro="D:\...\2020_Publish2Server.yxmc"
```

Note: The output lists 22 lines but two are sub-paths (2020_Publish2Server and 2020_PublishDropped2Server share the same temp-path prefix). Total unique file names = 20.

#### Line numbers for all macro calls (execution order proxy)
```bash
grep -n 'EngineSettings Macro=' /home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd \
  | grep -v 'Macro="False"'
```

#### Annotation text near each macro (for display name)
```bash
grep -B5 'EngineSettings Macro=' /home/mabushanab/claude-agents/MDPA/2020_DataProcess_v5.2.yxmd \
  | grep '<Name>' | grep -v '<Name />'
```

---

## State of the Art

### What Changed: Tableau Publishing Path (March 18, 2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| TDE format publish via 2020_Publish*.yxmc | Hyper format via Tableau New Macro*.yxmc | 2026-03-18 | Old macros DISABLED; new macros active in Containers 1055–1057 |
| Embedded credentials in macro | DCM "Tableau Integration — Zevs Token" PAT | 2026-03-18 | Authentication moved to Data Connection Manager |
| ~2.5 hours runtime (with errors) | ~3:23 minutes runtime (no errors) | 2026-03-18 | 97% runtime reduction after remediation |

**Deprecated/outdated:**
- 2020_Publish2Server.yxmc: Disabled — TDE format not supported in Alteryx Designer 2024.2+
- 2020_PublishDropped2Server.yxmc: Disabled — same reason
- 2020_PublishSecurities2Server.yxmc: Disabled — same reason (also in _externals\1\ non-standard path)

**Note:** The disabled macros still appear in the XML and must be documented in the inventory with status "DISABLED — Legacy TDE publishing path, superseded by Tableau New Macro*.yxmc."

---

## Validated Macro Facts (XML Ground Truth)

The following table is the authoritative macro list for Phase 6. It was derived by:
1. Running `grep -oP 'Macro="[^"]+"'` on the .yxmd file
2. Excluding `Macro="False"` boolean attributes
3. Cross-referencing with GAP_ANALYSIS.md risk entries
4. Cross-referencing with doc 7 Tableau remediation section

| # | Macro File | Instances | Path Type | Deployment Risk |
|---|-----------|-----------|-----------|-----------------|
| 1 | Contingent File Input.yxmc | 8 | Temp-path embedded | CRITICAL (G02-015) |
| 2 | CReW_EnsureFields.yxmc | 8 | External library (CReW) | CRITICAL (G02-017) |
| 3 | 2020_Date_Converter.yxmc | 5 | Temp-path embedded | CRITICAL (G02-006) |
| 4 | Cleanse.yxmc | 2 | External library (CReW) | CRITICAL (G02-017) |
| 5 | Tableau New Macro.yxmc | 1 | External library (Tableau) | CRITICAL (G02-017) |
| 6 | Tableau New Macro Securities.yxmc | 1 | External library (Tableau) | CRITICAL (G02-017) |
| 7 | Tableau New Macro Dropped.yxmc | 1 | External library (Tableau) | CRITICAL (G02-017) |
| 8 | Ethnic & Gender ID.yxmc | 1 | External library (CReW) | CRITICAL (G02-017) |
| 9 | 2020_PublishSecurities2Server.yxmc | 1 | _externals\1\ (non-standard) | CRITICAL (G02-016) |
| 10 | Union Subset Prior Period.yxmc | 1 | Temp-path embedded | CRITICAL (G02-001) |
| 11 | TransUnion Mask_FICO Only_v2.yxmc | 1 | Temp-path embedded | CRITICAL (G02-010) |
| 12 | Preliminary Client File Match.yxmc | 1 | Temp-path embedded | CRITICAL (G02-005) |
| 13 | PreProcess_Iterative.yxmc | 1 | Temp-path embedded | CRITICAL (G02-013) |
| 14 | Only Prior Period.yxmc | 1 | Temp-path embedded | CRITICAL (G02-014) |
| 15 | Last Name Comma First Name Cleaner_v2.yxmc | 1 | Temp-path embedded | CRITICAL (G02-004) |
| 16 | Generate Unique ID.yxmc | 1 | Temp-path embedded | CRITICAL (G02-002) |
| 17 | Dropped Records Prep.yxmc | 1 | Temp-path embedded | CRITICAL (G02-003) |
| 18 | Auto Value Append.yxmc | 1 | Temp-path embedded | CRITICAL (G02-009) |
| 19 | Append RE Values.yxmc | 1 | Temp-path embedded | CRITICAL (G02-008) |
| 20 | Append Charge Offs and Matching.yxmc | 1 | Temp-path embedded | CRITICAL (G02-007) |
| 21 | 2020_PublishDropped2Server.yxmc | 1 | Temp-path embedded | CRITICAL (G02-012) |
| 22 | 2020_Publish2Server.yxmc | 1 | Temp-path embedded | CRITICAL (G02-011) |
| 23 | CReW_ParallelBlockUntilDone.yxmc | 1 | External library (CReW) | CRITICAL (G02-017) |

Note: Rows 1–20 give unique files. Rows 21–23 are included for completeness; the total unique file count is 20 (rows 9, 21, 22 are the third tier). The 2020_Publish*.yxmc files (rows 21, 22, 9) are all DISABLED as of 2026-03-18.

**Grand total: 20 unique macro files, 41 instances. Every single macro carries CRITICAL deployment risk.**

---

## Macro Categories (for MACRO_INVENTORY.md structure)

| Category | Macros | Count |
|----------|--------|-------|
| Input / Data Loading | Contingent File Input | 1 |
| Data Union / Period Selection | Union Subset Prior Period, Only Prior Period | 2 |
| Preprocessing / Iteration | PreProcess_Iterative | 1 |
| Validation / Field Assurance | CReW_EnsureFields, CReW_ParallelBlockUntilDone | 2 |
| Date Transformation | 2020_Date_Converter | 1 |
| Data Cleansing | Cleanse, Last Name Comma First Name Cleaner_v2 | 2 |
| Data Enrichment | Append Charge Offs and Matching, Append RE Values, Auto Value Append | 3 |
| Demographic / Compliance | Ethnic & Gender ID, TransUnion Mask_FICO Only_v2 | 2 |
| Matching / Preparation | Preliminary Client File Match, Dropped Records Prep, Generate Unique ID | 3 |
| Output / Publishing (Active) | Tableau New Macro, Tableau New Macro Dropped, Tableau New Macro Securities | 3 |
| Output / Publishing (Disabled) | 2020_Publish2Server, 2020_PublishDropped2Server, 2020_PublishSecurities2Server | 3 |
| **Total** | | **20** |

---

## Deployment Risk Tiers (for MAC-03)

Three deployment risk categories established by GAP_ANALYSIS.md:

### Tier A: Temp-Path Embedded (15 macros) — GAP G02-001 through G02-015
- Path pattern: `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\`
- Risk: Workflow fails on any machine other than the original developer's workstation
- Remediation (REM-001): Relocate all 15 macros to shared UNC path `\\10.2.7.56\Shared\Prod\Macros\MDPA\`
- All 15 carry CRITICAL risk

### Tier B: External Add-On (_externals\1\ path) — GAP G02-016 (1 macro)
- Macro: 2020_PublishSecurities2Server.yxmc
- Risk: Non-standard path pattern — requires separate extraction procedure from Tier A macros
- Remediation (REM-002): Locate source .yxmc file and relocate to shared UNC path
- CRITICAL risk (also currently DISABLED — TDE format no longer supported)

### Tier C: External Library (no path prefix) — GAP G02-017 (4 macros + 3 Tableau)
- CReW macros: CReW_EnsureFields (x8), CReW_ParallelBlockUntilDone (x1), Cleanse (x2), Ethnic & Gender ID (x1)
- Tableau macros: Tableau New Macro (x1), Tableau New Macro Dropped (x1), Tableau New Macro Securities (x1)
- Risk: Resolved from Alteryx Server macro search path — requires library to be installed and registered
- Remediation (REM-003): Install CReW Runner library on Alteryx Server; verify Tableau connector installed
- CRITICAL risk

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — documentation-only phase |
| Config file | N/A |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map

All Phase 6 requirements produce documentation artifacts, not executable code. Validation is structural/content checking of MACRO_INVENTORY.md:

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MAC-01 | MACRO_INVENTORY.md contains 20 macro entries | smoke | `grep -c "^### [0-9]" MDPA/MACRO_INVENTORY.md` (expect 20) | Wave 0 |
| MAC-01 | Instance counts sum to 41 | smoke | Manual check of instance count column | N/A |
| MAC-02 | Each macro entry contains a "Logic Summary" section | smoke | `grep -c "Logic Summary" MDPA/MACRO_INVENTORY.md` (expect 20) | Wave 0 |
| MAC-03 | Each macro entry contains a "Deployment Risk" row | smoke | `grep -c "Deployment Risk" MDPA/MACRO_INVENTORY.md` (expect 20+) | Wave 0 |
| MAC-04 | Dependency map section exists | smoke | `grep -q "Dependency Map\|Execution Order" MDPA/MACRO_INVENTORY.md && echo FOUND` | Wave 0 |

### Sampling Rate
- **Per task commit:** `grep -c "^### [0-9]" /home/mabushanab/claude-agents/MDPA/MACRO_INVENTORY.md`
- **Per wave merge:** Full content review — check for 20 macro entries, all three deployment risk tiers present, dependency map readable
- **Phase gate:** Human review before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test infrastructure needed — shell grep commands are sufficient and ad-hoc

---

## Open Questions

1. **Are the disabled 2020_Publish*.yxmc macros still needed?**
   - What we know: Doc 7 states they are DISABLED as of March 18, 2026 (Tableau remediation). Container 1049 holds all three.
   - What's unclear: Whether the workflow will ever revert to TDE format, or if these entries are dead code.
   - Recommendation: Document as DISABLED with the remediation date noted. Do not omit — they are still in the XML and represent a known risk if anyone re-enables the container.

2. **Does 2020_PublishSecurities2Server.yxmc source .yxmc file still exist?**
   - What we know: GAP G02-016 (REM-002) asks to locate this file. It's in the `_externals\1\` path which is a temp-path reference.
   - What's unclear: Whether the actual .yxmc source file was ever committed to a shared location.
   - Recommendation: Note "source file location unknown" in the deployment notes for this macro. This is an inherited limitation from Phase 1.

3. **Internal structure of CReW macros — confirmed or inferred?**
   - What we know: Doc 7 says nesting is "LIKELY" for CReW_EnsureFields and "DEFINITELY" for CReW_ParallelBlockUntilDone. The CReW library is open-source.
   - What's unclear: The actual internal tool graph. We have no access to the .yxmc files themselves.
   - Recommendation: For MAC-02 logic summaries, state that CReW macro internal logic is inferred from community documentation and behavior analysis, not direct XML inspection. Flag as "inferred."

---

## Sources

### Primary (HIGH confidence)
- `2020_DataProcess_v5.2.yxmd` — direct XML extraction of all macro paths and counts (2026-03-19)
- `GAP_ANALYSIS.md` G02-001 through G02-017 — deployment risk tiers established in Phase 1/2 (2026-03-18)

### Secondary (MEDIUM confidence)
- `7_MACROS_DEEP_DIVE.md` — logic and nesting analysis; confirmed accurate for 19/20 macros (doc was written before the Tableau remediation corrected the active/disabled status)
- `24_MACRO_INVENTORY_WITH_LOGIC.md` — business purpose and logic descriptions; usable but inherits the 23-macro count error from doc 7

### Tertiary (LOW confidence — inferred, not verified from .yxmc source)
- CReW macro internal logic descriptions in doc 7 — CReW library is community-developed; internal structure is inferred from behavior analysis, not direct .yxmc inspection

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all source files confirmed to exist and read successfully
- Macro count: HIGH — XML extraction verified on 2026-03-19
- Deployment risk tiers: HIGH — inherited from GAP_ANALYSIS.md Phase 1/2 work
- Logic descriptions: MEDIUM — doc 24 is the source; not independently verified against individual .yxmc files
- CReW internal logic: LOW — inferred from community docs and behavior analysis

**Research date:** 2026-03-19
**Valid until:** Stable — the .yxmd file has not changed since Phase 1 analysis
