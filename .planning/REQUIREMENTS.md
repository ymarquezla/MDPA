# Requirements: MDPA Workflow Analysis

**Defined:** 2026-03-18
**Core Value:** A complete, verified understanding of what the MDPA workflow actually does — from raw inputs to final dashboard — so the team can maintain, troubleshoot, and eventually migrate it with confidence.

---

## v1 Requirements

### Gap Analysis

- [x] **GAP-01**: Analyst can read a gap analysis report identifying undocumented logic in the workflow that is not covered by the 14 existing docs
- [x] **GAP-02**: Analyst can see a list of broken or at-risk dependencies (macro paths, CReW library, deployment blockers)
- [x] **GAP-03**: Analyst can see coverage gaps — areas where documentation exists but is incomplete, ambiguous, or contradicts the workflow XML
- [x] **GAP-04**: Analyst can see a prioritized remediation list (critical / medium / low gaps)
- [ ] **GAP-05**: Gap report is published to Confluence TREL space under MDPA parent page

### Data Lineage

- [ ] **LIN-01**: Analyst can trace any output field back to its source field across all 4 input systems
- [ ] **LIN-02**: Analyst can see the transformation applied at each of the 7 processing stages for every key field
- [ ] **LIN-03**: Analyst can see which output files (Client File, QA Report, Tableau Extract, Archive, Executive Summary) each field appears in
- [ ] **LIN-04**: Lineage map covers all calculated/derived fields (Risk_Score, LTV, Delinquency_Rate, Charge_Off_Rate, etc.) with formulas
- [ ] **LIN-05**: Lineage map is published to Confluence TREL space under MDPA parent page

### Macro Inventory

- [ ] **MAC-01**: Every macro (15+ unique) is catalogued with: name, category, purpose, inputs, outputs, instance count
- [ ] **MAC-02**: Each macro has a logic summary describing what transformation it performs
- [ ] **MAC-03**: Each macro has a deployment risk rating (embedded/external, path risk, CReW dependency)
- [ ] **MAC-04**: Macro inventory includes the full dependency map showing execution order
- [ ] **MAC-05**: Macro inventory is published to Confluence TREL space under MDPA parent page

### Validation Test Suite

- [ ] **VAL-01**: Analyst can find a set of data quality rules expressed as testable assertions (e.g. "LTV must be > 0 when collateral exists")
- [ ] **VAL-02**: Rules cover all 14+ documented validation checks in `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`
- [ ] **VAL-03**: Rules include boundary conditions for key calculated fields (LTV, Risk_Score, charge-off rates)
- [ ] **VAL-04**: Rules are organized by processing stage so they can be applied incrementally
- [ ] **VAL-05**: Validation suite is published to Confluence TREL space under MDPA parent page

---

## v2 Requirements

### Migration Readiness

- **MIG-01**: Analyst can see a migration feasibility assessment for porting the workflow to Python/SQL
- **MIG-02**: Each macro has a suggested modern equivalent (Pandas, dbt, etc.)
- **MIG-03**: Estimated effort to recreate each processing stage outside of Alteryx

### Automation Assessment

- **AUTO-01**: Analyst can see a recommended scheduling strategy for monthly runs
- **AUTO-02**: Retry/error handling recommendations documented per stage

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Rewriting workflow in Python/SQL | Analysis-only milestone; migration is v2 |
| Modifying the .yxmd file | Read-only analysis |
| Connecting to live source systems | No system access assumed |
| Building new Tableau dashboards | Dashboard analysis only, no new development |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GAP-01 | Phase 1 — Gap Analysis: Documentation Audit | Complete |
| GAP-02 | Phase 1 — Gap Analysis: Documentation Audit | Complete |
| GAP-03 | Phase 1 — Gap Analysis: Documentation Audit | Complete |
| GAP-04 | Phase 2 — Gap Analysis: Prioritization and Report | Complete |
| GAP-05 | Phase 3 — Gap Analysis: Confluence Publication | Pending |
| LIN-01 | Phase 4 — Data Lineage: Field Tracing and Stage Mapping | Pending |
| LIN-02 | Phase 4 — Data Lineage: Field Tracing and Stage Mapping | Pending |
| LIN-03 | Phase 4 — Data Lineage: Field Tracing and Stage Mapping | Pending |
| LIN-04 | Phase 4 — Data Lineage: Field Tracing and Stage Mapping | Pending |
| LIN-05 | Phase 5 — Data Lineage: Confluence Publication | Pending |
| MAC-01 | Phase 6 — Macro Inventory: Cataloguing and Risk Rating | Pending |
| MAC-02 | Phase 6 — Macro Inventory: Cataloguing and Risk Rating | Pending |
| MAC-03 | Phase 6 — Macro Inventory: Cataloguing and Risk Rating | Pending |
| MAC-04 | Phase 6 — Macro Inventory: Cataloguing and Risk Rating | Pending |
| MAC-05 | Phase 7 — Macro Inventory: Confluence Publication | Pending |
| VAL-01 | Phase 8 — Validation Test Suite: Rules Authoring | Pending |
| VAL-02 | Phase 8 — Validation Test Suite: Rules Authoring | Pending |
| VAL-03 | Phase 8 — Validation Test Suite: Rules Authoring | Pending |
| VAL-04 | Phase 8 — Validation Test Suite: Rules Authoring | Pending |
| VAL-05 | Phase 9 — Validation Test Suite: Confluence Publication | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 — traceability updated after roadmap creation (9-phase structure)*
