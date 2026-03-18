# Phase 2: Gap Analysis — Prioritization and Report - Research

**Researched:** 2026-03-18
**Domain:** Gap analysis triage, remediation planning, technical documentation synthesis
**Confidence:** HIGH

---

## Summary

Phase 2 takes 41 raw findings from GAP_ANALYSIS.md — produced by Phase 1 — and adds two things: (1) a priority tier (critical / medium / low) assigned to each finding, and (2) a remediation list that an engineer can act on without re-reading source documents. This is a documentation-transformation phase, not a discovery phase. All input material exists; the work is analysis, classification, and writing.

The 41 findings break into three types: 11 undocumented logic entries (GAP-01), 20 broken or at-risk dependency entries (GAP-02), and 10 incomplete or contradictory doc entries (GAP-03). Each type requires a different prioritization lens. GAP-02 items (especially the 16 hard-path macro entries and the CReW library dependency) dominate the critical tier because they are runtime blockers — the workflow will literally fail without remediation. GAP-01 and GAP-03 items grade lower but vary based on whether they affect a blocking path, a regulated process (Fair Lending), or a calculation currently used in production.

The output artifact is an enhanced version of GAP_ANALYSIS.md. The file already has the correct document structure (Executive Summary, GAP-01 table, GAP-02 table, GAP-03 table, appendices). The Phase 2 task is to add a priority column to each table, add a Prioritized Findings Summary section, and add a Remediation List section — then verify Appendix B (Coverage Matrix) is complete. A new separate file (REPORT.md) would create a version-split problem; in-place enhancement is the correct choice.

**Primary recommendation:** Enhance GAP_ANALYSIS.md in-place. Add a Priority column to each gap table. Add two new sections after the existing tables: a Prioritized Summary (counts by tier per gap type) and a Remediation List (one action item per finding, sorted critical → medium → low, with enough context that an engineer needs no other doc).

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAP-04 | Analyst can see a prioritized remediation list (critical / medium / low gaps) | Prioritization framework below maps all 41 findings to tiers; remediation list format defined in Architecture Patterns section |
</phase_requirements>

---

## Standard Stack

This phase produces a documentation artifact, not code. There are no libraries to install.

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Markdown (GFM) | — | Document format for GAP_ANALYSIS.md | Already the project's doc format; renders in GitHub, Confluence import, and all editors |
| GAP_ANALYSIS.md | Phase 1 output | Source material to enhance | Single source of truth, 41 findings already structured |

### Supporting
| Concept | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| DREAD / CVSS-inspired criticality rubric | — | Severity classification framework | Assigning critical/medium/low based on blast radius and urgency |
| Remediation action format | — | Structured fix description | Each remediation item: ID, tier, owner hint, action, acceptance criterion |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Enhance GAP_ANALYSIS.md in-place | Create new REPORT.md | New file creates doc-split: two files describe the same gap set. Consumers don't know which to read. In-place is strictly better unless the Phase 1 file needs to stay read-only. |
| Plain priority column in existing tables | Separate prioritized-findings table | Separate table duplicates all 41 rows. Column addition is lower maintenance and keeps findings in one place. |
| Manual priority assignment | Algorithmic scoring | 41 findings is small enough that manual review with a clear rubric produces more defensible tiers than a formula. |

---

## Architecture Patterns

### Recommended File Structure After Phase 2

```
GAP_ANALYSIS.md (enhanced in-place)
├── Header block (unchanged)
├── Executive Summary (add priority counts)
├── GAP-01 table (add Priority column)
├── GAP-02 table (add Priority column)
├── GAP-03 table (add Priority column)
├── [NEW] ## Prioritized Findings Summary
│   └── counts by tier × gap type, plain-English interpretation
├── [NEW] ## Remediation List
│   ├── Critical items (with full context per item)
│   ├── Medium items
│   └── Low items
├── Appendix A: XML Extraction Summary (unchanged)
└── Appendix B: Coverage Matrix (complete if empty)
```

### Pattern 1: Priority Column Addition

**What:** Add a `Priority` column as the last column of each gap table. Values: `Critical`, `Medium`, `Low`.

**When to use:** Every row in GAP-01, GAP-02, GAP-03 tables.

**Example:**

```markdown
| Gap ID | Location in XML | Finding | Doc Coverage | Priority |
|--------|----------------|---------|--------------|----------|
| G01-001 | ToolContainer "Fair Lending Analysis" | Fair Lending ethnicity prediction pipeline | Not covered in any doc | Critical |
| G01-002 | Formula tool — Vintage Adjustment Flag | ±5% dampening cap formula | Absent from all 14 docs | Medium |
```

### Pattern 2: Remediation List Item Format

**What:** One structured action per finding. Every item must be self-contained — engineer must not need to open source documents.

**When to use:** All 41 findings, sorted critical → medium → low within each tier.

**Template:**

```markdown
### REM-001 [Critical] — Resolve hard-path macro dependencies (G02-001 through G02-016)
**Gap type:** Broken dependency — hard-coded machine-specific temp paths
**Impact:** Workflow fails to open or run on any machine except original developer's workstation
**Action:** Extract all 15 embedded macros from the .yxmd package and relocate to a shared UNC path
  or re-embed with relative paths. Macros affected:
  - Union Subset Prior Period.yxmc
  - Generate Unique ID.yxmc
  - Dropped Records Prep.yxmc
  - [... full list]
**Acceptance criterion:** Workflow opens and runs without macro path errors on a second workstation
**Owner hint:** Alteryx developer with access to original .yxmd and target server
```

**Key rule:** The action must name the specific files, paths, and acceptance conditions. Generic language ("fix the paths") fails the "engineer can act without re-reading source docs" criterion.

### Pattern 3: Prioritized Findings Summary Table

**What:** A cross-tab of tier vs. gap type for executive consumption.

**Example:**

```markdown
## Prioritized Findings Summary

| Priority | GAP-01 (Logic) | GAP-02 (Dependencies) | GAP-03 (Coverage) | Total |
|----------|---------------|-----------------------|--------------------|-------|
| Critical | 2             | 18                    | 2                  | 22    |
| Medium   | 5             | 2                     | 6                  | 13    |
| Low      | 4             | 0                     | 2                  | 6     |
| **Total**| **11**        | **20**                | **10**             | **41**|

**Interpretation:** 18 of 20 dependency gaps are Critical — the workflow cannot be redeployed until
macro paths are resolved. The 2 non-critical dependency items (G02-018 client-specific CSV path,
G02-019 read-before-write pattern) are environmental and require investigation rather than
immediate remediation.
```

### Anti-Patterns to Avoid

- **Grouping all 16 hard-path macros as 16 separate Critical remediations:** They share one root cause (embedded temp paths). Group them into one remediation item (REM-001) that lists all affected files. Splitting them inflates the list and makes it harder to act on.
- **Priority without rationale:** Assigning "Critical" without explaining what breaks. Every tier assignment needs a one-line justification visible in the table or remediation item.
- **Vague remediation actions:** "Update the documentation" is not actionable. Every action must name the document, section, and the specific change required.
- **Ignoring the audience split:** The report is read by both engineers (who need file names and paths) and business stakeholders (who need plain-language impact). The Remediation List serves engineers; the Executive Summary and Prioritized Summary serve stakeholders. Keep them separate.
- **Producing a separate REPORT.md:** This creates two documents describing the same 41 findings. Future updates go to one; the other becomes stale. Enhancement in-place is the correct pattern.

---

## Prioritization Framework

This section is the core intellectual content of Phase 2. It defines how each of the 41 findings maps to a tier.

### Critical Criteria (workflow blockers or regulated-process failures)

A finding is **Critical** if any of the following is true:

1. **Runtime blocker:** The workflow will fail to open, run, or produce output without remediation
2. **Regulated process undocumented:** The undocumented logic affects a legally regulated process (Fair Lending, for example)
3. **Active formula contradiction:** A documented formula differs from the XML active formula — the running workflow produces different output than stakeholders believe
4. **Silent failure risk:** A dependency can fail silently (no error raised) and produce corrupted output

### Medium Criteria (important but not blocking)

A finding is **Medium** if:

1. A doc omission means engineers troubleshooting a production issue cannot find the relevant logic
2. A count or inventory discrepancy in docs causes wrong assumptions during maintenance
3. A dependency is environmental (requires investigation to confirm impact)

### Low Criteria (completeness gaps with no operational risk)

A finding is **Low** if:

1. A field or tool type is absent from docs but is not on any critical processing path
2. A Tableau glossary gap — affects dashboard consumers' understanding but not production operation
3. Development-time artifacts in production (e.g., BrowseV2 tools) — non-impacting but should be noted

### Applied Tiers for All 41 Findings

#### GAP-01: Undocumented Logic

| Gap ID | Finding Summary | Tier | Rationale |
|--------|----------------|------|-----------|
| G01-001 | Fair Lending ethnicity prediction pipeline | **Critical** | Legally regulated process (Fair Lending compliance). Undocumented logic in a compliance-critical module is a regulatory documentation risk. |
| G01-002 | Vintage Adjustment ±5% dampening cap | **Medium** | Active production formula undocumented. Engineers troubleshooting vintage adjustment outputs cannot find this logic. |
| G01-003 | Call Report read-before-write + default probability enrichment | **Medium** | Undocumented module added 2022 — any engineer re-deploying the workflow will not know this module exists or that CallReportDataShort.yxdb is also an input. |
| G01-004 | Static Pool / Vintage Year cohort construction | **Critical** | Core allowance model methodology. The cohort construction algorithm is the foundation of the Expected Loss Year 1–7 fields that drive the client-facing dashboard. Undocumented methodology = unverifiable model. |
| G01-005 | MultiFieldFormula bulk standardization (10 instances) | **Low** | Tool type unknown to doc readers, but these are bulk normalization passes with no unique business logic. Low troubleshooting risk. |
| G01-006 | JSON parsing and dynamic file routing pipeline | **Medium** | The multi-client routing mechanism is undocumented. Any engineer adding a new client institution needs to understand this pipeline. Troubleshooting routing failures requires this knowledge. |
| G01-007 | Participation Loans Historical Master processing | **Medium** | Participation loan handling post-ingestion is undocumented. Affects completeness of understanding for a distinct loan category. |
| G01-008 | `Charged off past 36 Months?` and `Originated Past 5 Years?` flags | **Medium** | Missing from Field Mapping doc and Glossary. Engineers extending the workflow would not know these flags exist or how they are computed. |
| G01-009 | `2020_PublishSecurities2Server.yxmc` macro absent from all docs | **Medium** | Undocumented publishing macro for securities output. Affects completeness of macro inventory (feeds Phase 6 work). Not a runtime blocker in itself. |
| G01-010 | Unique, Sample, BrowseV2, DynamicSelect tools (8 instances) | **Low** | Minor tool types. BrowseV2 in production is a cleanup concern, not a functional gap. Sample tools are likely test artifacts. |
| G01-011 | PortfolioComposerTable tool undocumented | **Low** | Doc 5 covers the email output accurately; the table composition tool is an implementation detail. Low operational risk. |

#### GAP-02: Broken or At-Risk Dependencies

| Gap ID | Finding Summary | Tier | Rationale |
|--------|----------------|------|-----------|
| G02-001 through G02-015 | 15 hard-path embedded macros (temp paths) | **Critical** | Hard runtime failure on any non-original machine. Blocks all redeployment. This is the single highest-severity cluster in the entire gap set. |
| G02-016 | `2020_PublishSecurities2Server.yxmc` in `_externals\1\` | **Critical** | Same failure class as G02-001–015 (hard path, non-transferable), with the additional risk of being in a non-standard subdirectory. |
| G02-017 | CReW library macros (12 instances) + Tableau macros (3) | **Critical** | Requires CReW library installed on execution server. No path prefix means Alteryx resolves from server search path. If CReW is absent, 12 instances fail. Affects 8 `CReW_EnsureFields` instances (likely schema validation throughout the workflow) and the `CReW_ParallelBlockUntilDone` coordination macro. |
| G02-018 | Zip Code Ethnicity Index.csv — client-specific path | **Medium** | Client-specific consulting path from a 2020 engagement. Environmental — may or may not exist on current production server. Requires verification. If absent, Fair Lending module fails or produces null predictions. |
| G02-019 | CallReportDataShort.yxdb read-before-write | **Medium** | Ordering dependency that could produce stale-read on same-run scenarios. Requires investigation to confirm if the read and write happen in the same execution context. |
| G02-020 | Email tool SMTP / DCM connection not configured | **Critical** | Silent failure — email alerts will not send, with no error output. The DCM connection ID must be configured on the execution server. This is an invisible failure mode. |

#### GAP-03: Incomplete, Ambiguous, or Contradictory Documentation

| Gap ID | Finding Summary | Tier | Rationale |
|--------|----------------|------|-----------|
| G03-001 | Net Charge Off Amount formula contradiction | **Critical** | Active XML formula differs from documented formula. Stakeholders believe the workflow computes `[Charge Off Amount] - [Recovery Amount]`; it actually runs a conditional that substitutes `[Charge Offs]` when `Max_Report Date` is empty. This is an active output discrepancy, not a cosmetic doc gap. |
| G03-002 | Risk_Score field does not exist; Decision FICO Grade is the actual field | **Critical** | Documented field `Risk_Score` (numeric composite) does not exist in XML. Actual field is `Decision FICO Grade` (categorical A+–E letter grades). Any downstream consumer or analyst relying on `Risk_Score` documentation is looking at the wrong field with the wrong data type and wrong interpretation. |
| G03-003 | Macro count discrepancy (doc claims 23/42; XML has 20/41) | **Medium** | Incorrect inventory creates false confidence. Engineers planning a macro migration would start with wrong counts. |
| G03-004 | `2020_PublishSecurities2Server.yxmc` absent from macro inventory | **Medium** | Macro inventory in docs is incomplete. Securities publishing path is undocumented. Affects Phase 6 macro cataloguing. |
| G03-005 | `Vintage Adjusted Expected Losses` formula and Vintage Adjustment cap absent | **Medium** | Derived field formula missing from lineage doc. Engineers tracing Expected Loss output cannot verify the calculation chain. |
| G03-006 | JSON input processing described too abstractly in doc 2 | **Medium** | Troubleshooting multi-client routing failures requires the specific pipeline detail (JSONParse → RegEx → Filter → DynamicInput). Current doc is non-actionable for that use case. |
| G03-007 | CallReportDataShort.yxdb described as output-only; is also an input | **Medium** | Incomplete picture of file role. Engineers modifying the securities module will not know about the input read. |
| G03-008 | PortfolioComposerTable mechanism undocumented in doc 5 | **Low** | Email output is documented. The table composition detail is an implementation gap with low operational risk. |
| G03-009 | Boolean flag fields absent from glossary | **Low** | Completeness gap. Fields are not on a critical path; glossary consumers can infer from field names. |
| G03-010 | Tableau glossary references Expected Loss fields without derivation logic | **Low** | Dashboard consumers have metric names without formulas. Useful to document but does not affect production operation. |

### Tier Summary

| Priority | GAP-01 | GAP-02 | GAP-03 | Total |
|----------|--------|--------|--------|-------|
| Critical | 2      | 18     | 2      | **22** |
| Medium   | 5      | 2      | 6      | **13** |
| Low      | 4      | 0      | 2      | **6** |
| **Total**| **11** | **20** | **10** | **41** |

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Priority scoring | Custom scoring algorithm | Manual rubric with documented criteria | 41 findings is small; a rubric is more auditable and defensible than a formula |
| Remediation tracking | External ticket system | Markdown list in the report | Phase scope is documentation only; no tooling integration required |
| Cross-referencing | Separate cross-reference index | Gap IDs as anchors within the single file | GFM anchor links (e.g., `#g02-001`) provide navigation without a separate file |

**Key insight:** This phase is a documentation writing task dressed up as an analytical task. The intellectual work is the triage framework (defined above). The execution work is applying it to 41 rows and writing 41 remediation items. Do not over-engineer.

---

## Common Pitfalls

### Pitfall 1: Treating G02-001 through G02-015 as 15 separate critical items
**What goes wrong:** The remediation list becomes 15 near-identical entries that all say "fix the path." Engineers see the repetition and stop reading.
**Why it happens:** One-to-one mapping from gap table rows to remediation items.
**How to avoid:** Group all 15 hard-path embedded macros as a single remediation item (REM-001). List the 15 macro file names inside the item. One root cause → one fix → one acceptance criterion.
**Warning signs:** Remediation list has more than 25–28 items.

### Pitfall 2: Missing the two Critical GAP-03 items
**What goes wrong:** GAP-03 is labeled "Documentation Coverage" and seems lower stakes. Researcher/planner skips past G03-001 (Net Charge Off formula contradiction) and G03-002 (Risk_Score field does not exist).
**Why it happens:** GAP-03 looks like a doc quality problem, not a production problem.
**How to avoid:** G03-001 and G03-002 are not doc style issues — they describe active output discrepancies where what stakeholders believe the workflow produces differs from what it actually produces. These must be Critical.
**Warning signs:** All GAP-03 items are Medium or Low.

### Pitfall 3: Vague remediation actions
**What goes wrong:** Items say "update documentation" or "fix path." Engineers cannot act on these.
**Why it happens:** Researcher assumes engineer will re-read source docs.
**How to avoid:** Every remediation item must name the specific document (e.g., `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`, Section "Stage 2 Calculations"), the section, the current incorrect text, and the correct replacement text or action.
**Warning signs:** Any remediation item shorter than 3 lines.

### Pitfall 4: Creating a new REPORT.md file
**What goes wrong:** Two files exist: GAP_ANALYSIS.md (Phase 1, no priorities) and REPORT.md (Phase 2, with priorities). Confluence publisher (Phase 3) must decide which to use. Future analysts find both files and don't know which is current.
**Why it happens:** It feels cleaner to create a fresh artifact.
**How to avoid:** Enhance GAP_ANALYSIS.md in-place. The file's header already says "Phase 1 of 9 — Audit only (no severity ratings; see Phase 2 for prioritization)" — update this header to reflect Phase 2 completion, add the columns and sections, done.
**Warning signs:** A new file is created at `MDPA/REPORT.md` or `MDPA/GAP_REPORT.md`.

### Pitfall 5: Incomplete Appendix B
**What goes wrong:** Appendix B (Coverage Matrix) has a placeholder comment `<!-- Populated by Plan 02 -->` from Phase 1. If it is left empty after Phase 2, the report is structurally incomplete.
**Why it happens:** Appendix B is at the bottom of the file and easy to overlook.
**How to avoid:** The coverage matrix should be a table of all 14 source docs vs. the 3 gap types, showing which docs contributed which findings. This can be constructed from the Gap ID table data.
**Warning signs:** Appendix B still contains the HTML comment after Phase 2 closes.

---

## Code Examples

### Remediation List: Critical Tier Example

```markdown
## Remediation List

> Items are ordered: Critical → Medium → Low. Each item is self-contained — the engineer
> does not need to open any other document to execute the fix.

---

### REM-001 [Critical] — Relocate 15 hard-path embedded macros (G02-001 through G02-015)

**Gap type:** Broken dependency — machine-specific temp paths
**Root cause:** All 15 macros are embedded in the .yxmd package and extract to the original
developer's temp directory (`D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-...\Macros\`).
This path does not exist on any other machine.
**Impact:** Workflow fails to open or execute on any machine except the original developer's workstation.
Redeployment to Alteryx Server is blocked.
**Affected macros (15 files):**
  - Union Subset Prior Period.yxmc (1 instance)
  - Generate Unique ID.yxmc (1 instance)
  - Dropped Records Prep.yxmc (1 instance)
  - Last Name Comma First Name Cleaner_v2.yxmc (1 instance)
  - Preliminary Client File Match.yxmc (1 instance)
  - 2020_Date_Converter.yxmc (5 instances)
  - Append Charge Offs and Matching.yxmc (1 instance)
  - Append RE Values.yxmc (1 instance)
  - Auto Value Append.yxmc (1 instance)
  - TransUnion Mask_FICO Only_v2.yxmc (1 instance)
  - 2020_Publish2Server.yxmc (1 instance)
  - 2020_PublishDropped2Server.yxmc (1 instance)
  - PreProcess_Iterative.yxmc (1 instance)
  - Only Prior Period.yxmc (1 instance)
  - Contingent File Input.yxmc (8 instances)
**Action:** Extract all embedded macros from the .yxmd. Save them to a shared UNC path accessible
from the Alteryx Server (e.g., `\\10.2.7.56\Shared\Prod\Macros\MDPA\`). Update all 15 macro
references in the workflow XML to point to the shared path. Re-package the workflow.
**Acceptance criterion:** Workflow opens and executes on a second workstation with access to the
shared UNC path, without any "macro not found" or path errors.
**Owner hint:** Alteryx developer with write access to `\\10.2.7.56\Shared\Prod\Macros\`
```

### Remediation List: Critical GAP-03 Example

```markdown
### REM-005 [Critical] — Correct Net Charge Off Amount formula in documentation (G03-001)

**Gap type:** Active formula contradiction
**Root cause:** Doc 6, Section "Stage 2 Calculations" documents the formula as:
  `[Charge Off Amount] - [Recovery Amount]`
  The active formula in the XML is:
  `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif`
  The commented-out XML formula matches the doc; the active formula is different and uses
  different field names.
**Impact:** Stakeholders and analysts using the documentation to interpret or validate Net
Charge Off Amount outputs will expect the subtraction formula. The workflow is actually producing
a conditional field substitution. Any reconciliation exercise based on the documented formula
will produce incorrect expected values.
**Action:** Update `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`, Section "Stage 2 Calculations",
row for "Net Charge Off Amount":
  - Replace formula: `[Charge Off Amount] - [Recovery Amount]`
  - With active formula: `if !IsEmpty([Max_Report Date]) then [Net Charge Off Amount] else [Charge Offs] endif`
  - Add note: "When Max_Report Date is populated, uses pre-computed [Net Charge Off Amount];
    otherwise falls back to raw [Charge Offs] value."
  - Flag for SME review: confirm whether the commented-out subtraction formula was the intended
    logic and was superseded.
**Acceptance criterion:** Doc 6 formula matches the active XML formula. A reviewer comparing
doc to XML finds no discrepancy in this row.
**Owner hint:** Loan Analytics analyst familiar with charge-off accounting + Alteryx developer
to confirm the formula history
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual review (no automated test runner — pure documentation artifact) |
| Config file | None |
| Quick run command | Human review of GAP_ANALYSIS.md against the checklist below |
| Full suite command | Same — single checklist |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAP-04 | Every gap row has exactly one Priority value (Critical/Medium/Low) | Manual | `grep -c "| Critical\|| Medium\|| Low" GAP_ANALYSIS.md` — verify count equals 41 | ❌ Wave 0 |
| GAP-04 | Remediation List exists and contains items for all 41 gaps | Manual | `grep -c "### REM-" GAP_ANALYSIS.md` — verify REM count covers all findings | ❌ Wave 0 |
| GAP-04 | No gap row has an empty Priority cell | Manual | Scan table columns for blank Priority values | ❌ Wave 0 |
| GAP-04 | Prioritized Findings Summary totals match 41 | Manual | Sum rows in summary table = 41 | ❌ Wave 0 |
| GAP-04 | Appendix B Coverage Matrix is populated (no HTML placeholder comment) | Manual | `grep -c "Populated by Plan" GAP_ANALYSIS.md` — must be 0 | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** Run the grep checks above to verify structural completeness
- **Per wave merge:** Full human review: every gap row has a priority, every remediation item has an action and acceptance criterion
- **Phase gate:** All 5 checks pass before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] No test scripts needed — all verification is via grep count checks on GAP_ANALYSIS.md
- [ ] Verification commands above can be run as one-liners; no test file creation required

*(Verification is structural, not behavioral — counting rows and sections is sufficient to confirm GAP-04 is met)*

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Severity scoring with numeric DREAD scores | Qualitative tiers (Critical/Medium/Low) with documented criteria | Industry shift ~2015 | Qualitative tiers are faster, more understandable to stakeholders, and equally actionable for small finding sets (<50 items) |
| Separate remediation tracker (spreadsheet/Jira) | Inline Markdown remediation list in the report itself | Common in documentation-first projects | Keeps the entire gap picture in one artifact; reduces drift between doc and tracker |
| One remediation item per gap table row | Grouped remediation items by root cause | Best practice for dependency clusters | Prevents action list from becoming 41 nearly-identical items |

---

## Open Questions

1. **Should Appendix B (Coverage Matrix) show per-document coverage or per-finding coverage?**
   - What we know: Appendix B has a placeholder comment. No format was defined in Phase 1.
   - What's unclear: Whether the matrix should be 14 docs × 3 gap types (showing which docs have findings) or 41 findings × 14 docs (showing which doc each finding came from).
   - Recommendation: Use the simpler format — 14 docs × 3 gap types. A 41-row matrix is harder to read and provides less actionable insight for the Phase 3 Confluence publisher.

2. **Are the G02-001–G02-015 grouping and G02-016 separate or together in the remediation list?**
   - What we know: G02-001–G02-015 are all temp-path embedded macros. G02-016 is `2020_PublishSecurities2Server.yxmc` in `_externals\1\`, a different subdirectory pattern.
   - What's unclear: Whether the fix for G02-016 is the same as for G02-001–G02-015 or requires a different approach.
   - Recommendation: Keep them as two separate remediation items — REM-001 (15 embedded macros) and REM-002 (the _externals macro). Same root cause category, but different file location and different fix procedure.

3. **Who is the intended owner for each remediation item?**
   - What we know: The STATE.md notes the original developer (vnekkanti) may be unreachable.
   - What's unclear: Whether to assign owner names or use role hints (e.g., "Alteryx developer").
   - Recommendation: Use role hints only (e.g., "Alteryx developer," "Loan Analytics analyst," "Alteryx Server admin"). Do not assign personal names — the original developer being unreachable is a known blocker.

---

## Sources

### Primary (HIGH confidence)
- GAP_ANALYSIS.md — all 41 Phase 1 findings read directly; tiers derived from content analysis
- REQUIREMENTS.md — GAP-04 requirement definition and success criteria read directly
- ROADMAP.md — Phase 2 scope, success criteria, and dependency chain read directly
- STATE.md — project decisions, blockers, and accumulated context read directly

### Secondary (MEDIUM confidence)
- Industry practice for gap analysis triage frameworks — qualitative tier approach (Critical/Medium/Low) is the de-facto standard for documentation gap assessments in technical projects; DREAD/CVSS-inspired rubrics adapted for documentation context

### Tertiary (LOW confidence — no external sources needed)
- No external sources required. This phase transforms already-collected findings; external research is not needed for triage criteria when the findings are fully in-hand.

---

## Metadata

**Confidence breakdown:**
- Prioritization tiers: HIGH — all 41 findings read directly; tiers derived from explicit criteria applied to concrete evidence in GAP_ANALYSIS.md
- Remediation format: HIGH — format is grounded in the success criterion "engineer can act without re-reading source docs" from ROADMAP.md
- Architecture (in-place vs. new file): HIGH — in-place enhancement is clearly better given the Phase 3 Confluence publication dependency and the existing file structure
- Appendix B format: MEDIUM — format was left undefined in Phase 1; recommendation is defensible but not locked

**Research date:** 2026-03-18
**Valid until:** Stable indefinitely — this research depends on the Phase 1 findings, which are complete and will not change
