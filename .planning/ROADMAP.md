# Roadmap: MDPA Workflow Analysis

## Overview

This project produces four structured analysis artifacts for the MDPA Alteryx workflow v5.2: a gap analysis report, a data lineage map, a macro inventory, and a validation test suite. Each deliverable is authored in Markdown (repo source of truth) and then published to the Trellance Confluence TREL space for stakeholder visibility. Phases follow the natural delivery order — gap analysis first (foundation for everything), lineage and macros next (the two independent deep-dives), and validation last (depends on both lineage and macro knowledge).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Gap Analysis — Documentation Audit** - Identify undocumented logic, broken dependencies, and doc-vs-XML contradictions
- [ ] **Phase 2: Gap Analysis — Prioritization and Report** - Triage findings into critical/medium/low and produce the final gap report
- [ ] **Phase 3: Gap Analysis — Confluence Publication** - Publish finalized gap report to TREL space under MDPA parent page
- [ ] **Phase 4: Data Lineage — Field Tracing and Stage Mapping** - Trace every key field from all 4 sources through 7 stages to all 5 output types
- [ ] **Phase 5: Data Lineage — Confluence Publication** - Publish finalized lineage map to TREL space under MDPA parent page
- [ ] **Phase 6: Macro Inventory — Cataloguing and Risk Rating** - Catalogue all 15+ macros with purpose, logic, inputs/outputs, and deployment risk
- [ ] **Phase 7: Macro Inventory — Confluence Publication** - Publish finalized macro inventory to TREL space under MDPA parent page
- [ ] **Phase 8: Validation Test Suite — Rules Authoring** - Author testable assertions covering all 14+ validation checks, boundary conditions, and stage organization
- [ ] **Phase 9: Validation Test Suite — Confluence Publication** - Publish finalized validation suite to TREL space under MDPA parent page

## Phase Details

### Phase 1: Gap Analysis — Documentation Audit
**Goal**: Analysts have a complete list of what the 14 existing docs miss, contradict, or leave ambiguous relative to the workflow XML
**Depends on**: Nothing (first phase)
**Requirements**: GAP-01, GAP-02, GAP-03
**Success Criteria** (what must be TRUE):
  1. Analyst can read a list of workflow behaviors and logic present in the .yxmd XML that are not described in any of the 14 existing docs
  2. Analyst can see every broken or at-risk dependency flagged with its risk type (hard path, CReW library, missing macro, deployment blocker)
  3. Analyst can see every doc section that is incomplete, ambiguous, or directly contradicts the workflow XML
**Plans**: TBD

### Phase 2: Gap Analysis — Prioritization and Report
**Goal**: Gap findings are triaged by severity and assembled into a single readable report
**Depends on**: Phase 1
**Requirements**: GAP-04
**Success Criteria** (what must be TRUE):
  1. Analyst can see every gap from Phase 1 assigned to exactly one priority tier (critical, medium, or low)
  2. Analyst can read the complete gap analysis report as a single coherent Markdown document in the repo
  3. The report includes a remediation list that an engineer could act on without needing to re-read the source docs
**Plans**: TBD

### Phase 3: Gap Analysis — Confluence Publication
**Goal**: The gap report is live and readable in Confluence under the MDPA parent page
**Depends on**: Phase 2
**Requirements**: GAP-05
**Success Criteria** (what must be TRUE):
  1. A Confluence page titled "Gap Analysis Report" exists under MDPA parent page ID 4244045841 in the TREL space
  2. The page content matches the finalized Markdown report from Phase 2 (no stale or partial content)
  3. A stakeholder with Confluence access can read the full gap report without accessing the repo
**Plans**: TBD

### Phase 4: Data Lineage — Field Tracing and Stage Mapping
**Goal**: Every key field in the workflow is fully traced from its source system through all transformations to its output destination
**Depends on**: Phase 1
**Requirements**: LIN-01, LIN-02, LIN-03, LIN-04
**Success Criteria** (what must be TRUE):
  1. Analyst can pick any output field in the Client File, QA Report, Tableau Extract, Archive, or Executive Summary and trace it back to its source field in one of the 4 input systems
  2. Analyst can see what transformation (filter, join, formula, aggregation) is applied at each of the 7 processing stages for every key field
  3. All calculated/derived fields (Risk_Score, LTV, Delinquency_Rate, Charge_Off_Rate, and equivalents) are documented with their full formulas and lineage paths
  4. The lineage map exists as a structured Markdown artifact in the repo
**Plans**: TBD

### Phase 5: Data Lineage — Confluence Publication
**Goal**: The data lineage map is live and navigable in Confluence under the MDPA parent page
**Depends on**: Phase 4
**Requirements**: LIN-05
**Success Criteria** (what must be TRUE):
  1. A Confluence page titled "Data Lineage Map" exists under MDPA parent page ID 4244045841 in the TREL space
  2. The page content matches the finalized lineage map from Phase 4
  3. A stakeholder with Confluence access can trace a field end-to-end using only the Confluence page
**Plans**: TBD

### Phase 6: Macro Inventory — Cataloguing and Risk Rating
**Goal**: Every macro in the workflow is fully catalogued with its purpose, logic, dependency chain, and deployment risk
**Depends on**: Phase 1
**Requirements**: MAC-01, MAC-02, MAC-03, MAC-04
**Success Criteria** (what must be TRUE):
  1. Analyst can look up any of the 15+ macros by name and find its category, purpose, inputs, outputs, and instance count
  2. Each macro entry includes a plain-language logic summary describing what transformation it performs
  3. Each macro has a deployment risk rating (embedded/external, path risk, CReW dependency) that an engineer could act on
  4. The full macro dependency map showing execution order is documented and readable in the repo
**Plans**: TBD

### Phase 7: Macro Inventory — Confluence Publication
**Goal**: The macro inventory is live and searchable in Confluence under the MDPA parent page
**Depends on**: Phase 6
**Requirements**: MAC-05
**Success Criteria** (what must be TRUE):
  1. A Confluence page titled "Macro Inventory" exists under MDPA parent page ID 4244045841 in the TREL space
  2. The page content matches the finalized macro inventory from Phase 6
  3. A stakeholder with Confluence access can look up any macro and find its risk rating without accessing the repo
**Plans**: TBD

### Phase 8: Validation Test Suite — Rules Authoring
**Goal**: A complete set of testable assertions covers all documented validation logic, boundary conditions, and processing stages
**Depends on**: Phase 4, Phase 6
**Requirements**: VAL-01, VAL-02, VAL-03, VAL-04
**Success Criteria** (what must be TRUE):
  1. Analyst can find a testable assertion (e.g., "LTV must be > 0 when collateral exists") for every significant business rule in the workflow
  2. All 14+ validation checks documented in 6_FIELD_MAPPING_AND_DATA_LINEAGE.md appear as discrete, verifiable rules in the suite
  3. Boundary conditions for all key calculated fields (LTV, Risk_Score, charge-off rates, and equivalents) are explicitly defined as assertions
  4. Rules are organized by processing stage so they can be applied one stage at a time during a workflow run
**Plans**: TBD

### Phase 9: Validation Test Suite — Confluence Publication
**Goal**: The validation test suite is live and usable in Confluence under the MDPA parent page
**Depends on**: Phase 8
**Requirements**: VAL-05
**Success Criteria** (what must be TRUE):
  1. A Confluence page titled "Validation Test Suite" exists under MDPA parent page ID 4244045841 in the TREL space
  2. The page content matches the finalized validation suite from Phase 8
  3. A stakeholder with Confluence access can locate the test rules for any processing stage without accessing the repo
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute with the following dependencies:
1 → 2 → 3 (Gap Analysis stream)
1 → 4 → 5 (Lineage stream, starts after Phase 1)
1 → 6 → 7 (Macro stream, starts after Phase 1)
4 + 6 → 8 → 9 (Validation stream, requires both lineage and macro complete)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Gap Analysis — Documentation Audit | 0/TBD | Not started | - |
| 2. Gap Analysis — Prioritization and Report | 0/TBD | Not started | - |
| 3. Gap Analysis — Confluence Publication | 0/TBD | Not started | - |
| 4. Data Lineage — Field Tracing and Stage Mapping | 0/TBD | Not started | - |
| 5. Data Lineage — Confluence Publication | 0/TBD | Not started | - |
| 6. Macro Inventory — Cataloguing and Risk Rating | 0/TBD | Not started | - |
| 7. Macro Inventory — Confluence Publication | 0/TBD | Not started | - |
| 8. Validation Test Suite — Rules Authoring | 0/TBD | Not started | - |
| 9. Validation Test Suite — Confluence Publication | 0/TBD | Not started | - |
