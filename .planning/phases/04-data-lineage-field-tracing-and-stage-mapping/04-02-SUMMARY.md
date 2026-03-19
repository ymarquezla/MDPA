---
phase: 04-data-lineage-field-tracing-and-stage-mapping
plan: 02
subsystem: documentation
tags: [alteryx, data-lineage, xml-analysis, stage-mapping, field-transformation, mdpa]

# Dependency graph
requires:
  - phase: 04-data-lineage-field-tracing-and-stage-mapping
    plan: 01
    provides: DATA_LINEAGE.md skeleton with Part 1 complete and Part 2 stubs
provides:
  - DATA_LINEAGE.md Part 2 fully populated: 7 stage sections with tool-type summaries and field transformation tables
  - Verbatim XML formula documentation for all 15 Stage 4 derived fields
  - Year 0-6 boolean flag day-range boundaries confirmed from XML FormulaField
  - Vintage Adjustment chain documented as PRE-COMPUTED CARRY-IN (prior period Join, not current-run formula)
  - Decision FICO Grade formula quoted verbatim from XML
  - Average Interest Rates computation chain documented (Summarize Avg → Select rename → Stage 6 use)
  - All 5 Stage 7 output paths confirmed
  - PortfolioComposerTable tool purpose identified (run-summary table with project metadata) but output destination flagged as open question
affects:
  - 04-03-PLAN (Output Field Mapping + Traceability — writes into Parts 3-5 of DATA_LINEAGE.md)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "XML FormulaField verbatim extraction: HTML entities decoded (&gt; → >, &lt; → <, &amp; → &, &quot; → \") for documentation"
    - "Summarize tool aggregation pattern: Interest Rate Avg grouped by 5 dimensions → renamed via Select → consumed by Stage 6 Rate Differential formula"
    - "Two-step outlier elimination pattern: Formula sets Outlier?=0 for all, then second Formula sets Outlier?=1 for outliers; Include in Fair Lending? inverts this"

key-files:
  created: []
  modified:
    - DATA_LINEAGE.md — Part 2 fully populated (177 lines inserted, 22 stub lines replaced); 7 stage sections with transformation tables

key-decisions:
  - "Vintage Adjustment documented as PRE-COMPUTED CARRY-IN from prior period Join — the ±5% cap formula is confirmed present in XML FormulaField but was applied in a prior run; current run reads it as [Right_Vintage Adjustment] static value"
  - "Average Interest Rates is NOT a direct source field — it is computed as Summarize Avg of Interest Rate (grouped by 5 dimensions), then renamed from Avg_Interest Rate to Average Interest Rates via Select tool Join (field: Right_Avg_Interest Rate → Average Interest Rates)"
  - "PortfolioComposerTable (tool 954) confirmed as project run-summary table (Project Name, Credit Union, PeerNo, Project Date, Timestamp, Username, PeerGroupName, Vintage Adjustment Flag, Count) — output destination still unconfirmed; flagged as open question"
  - "LTV and Delinquency_Rate confirmed absent from both FormulaField scan and SummarizeField configurations — not computed in main workflow at record or aggregate level; LTV passes through from Append RE Values macro (Phase 6 required); no Delinquency_Rate aggregate found"
  - "Charge Off % by FICO_Vintage_Group documented in Stage 4 — computed via Summarize + Formula pattern feeding into Vintage Adjustment calculation chain"

# Metrics
duration: 4min
completed: 2026-03-19
---

# Phase 4 Plan 02: Processing Stage Transformations Summary

**DATA_LINEAGE.md Part 2 populated with 7 fully-documented processing stages: verbatim XML formulas, tool-type inventories, field transformation tables, day-range boundaries for Year 0-6 cohort flags, and pre-computed carry-in documentation for all Vintage Adjustment chain fields**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-19T12:21:34Z
- **Completed:** 2026-03-19T12:25:51Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- `DATA_LINEAGE.md` Part 2 fully populated — replaced 22-line stub with 177 lines of documented stage content
- All 7 stage sections written with: XML annotation (exact label), tool-type list, function description, field transformation table, and fields entering/exiting
- **Stage 4**: 15 derived fields documented with verbatim XML formulas (Net Charge Off Amount active + inactive formulas, Years until Charge off, Days from Origination, Origination Quarter, Vintage Year, Rounded Term, Term Grouping, Model Year, Vehicle Age at Origination, Probability of Default, Charged off past 36 Months?, Average Annual Loss Rate = static 0, OutputFilePath_Dropped, Originated Past 5 Years?, Charge Off % fields)
- **Stage 5**: Year 0-6 boolean flags documented with exact day-range boundaries from XML FormulaField; all 13 vintage carry-in fields explicitly labeled PRE-COMPUTED CARRY-IN with ±5% cap formula quoted for reference (noting it applies to prior run, not current)
- **Stage 6**: `Average Interest Rates` computation chain fully traced — Summarize Avg of Interest Rate (5-dimension GroupBy) → renamed via Select tool (Right_Avg_Interest Rate → Average Interest Rates) → consumed by Rate Differential formula
- **Stage 7**: All 5 output destinations documented with UNC paths and tool names; PortfolioComposerTable tool identified and its field set documented; .tde→.hyper migration noted
- Open question documented: LTV aggregation and Delinquency_Rate not found in any FormulaField or SummarizeField — confirmed requires Phase 6 macro inspection

## Task Commits

1. **Task 1: Populate Part 2 — 7-Stage Processing Transformation Detail** - `6a11bce` (feat)

## Files Created/Modified

- `/home/mabushanab/claude-agents/MDPA/DATA_LINEAGE.md` — Part 2 complete: 7 stage sections with transformation tables, verbatim formulas, and open question documentation

## Decisions Made

- Ran XML extraction commands before writing: `FormulaField` grep, `SummarizeField` grep, PortfolioComposerTable inspection, Select tool rename analysis
- Documented Vintage Adjustment ±5% cap formula in full as a historical/reference note, with explicit callout that it was applied in a prior run — prevents future analyst confusion about whether the cap applies in the current run
- Documented `Average Interest Rates` computation chain precisely (Summarize Avg rename pattern) because the field name does not match the Summarize output name (`Avg_Interest Rate`), which would be confusing to future analysts
- Chose to document `Charge Off % by FICO_Vintage_Group` and `Charge Off % by Vintage_Group` under Stage 4 since they are record-level formula outputs feeding into the Vintage Adjustment calculation; Stage 5 then aggregates them via Summarize

## Deviations from Plan

None — plan executed exactly as written.

**Additional findings beyond plan scope (not deviations — enriches accuracy):**
- `Predicted Ethnicity` formula internals found in XML field metadata: BISG-style max-probability assignment across 7 demographic categories from Zip Code Ethnicity Index lookup. Documented verbatim.
- `Outlier?` field uses two-step formula pattern (set to 0 for all, then set to 1 for outliers) — this is the mechanism for the "two-phase outlier elimination" referenced in plan. Both formulas quoted.
- `PortfolioComposerTable` field inventory confirmed from XML (tool 954): generates HTML table output with project metadata fields. Output destination logged as open question (possibly email notification or Executive Summary).
- `Charge Off % by FICO_Vintage_Group` and `Charge Off % by Vintage_Group` formulas found in FormulaField scan — not listed in plan interfaces block but relevant to Stage 4 enrichment; documented.

## Issues Encountered

None.

## User Setup Required

None — documentation artifact only.

## Next Phase Readiness

- `DATA_LINEAGE.md` Parts 1 and 2 are complete
- Part 3 (Calculated/Derived Field Formulas): preview table already in place from Plan 04-01; full table pending 04-03 — all formula text is now available from this plan's XML extraction
- Part 4 (Output Field Mapping): 5 output paths confirmed; field-level mapping pending 04-03
- Part 5 (End-to-End Traceability): 4 example stubs defined; full examples pending 04-03

---
*Phase: 04-data-lineage-field-tracing-and-stage-mapping*
*Completed: 2026-03-19*
