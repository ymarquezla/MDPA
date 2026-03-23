# Portal Documentation Content Analysis Framework

**Purpose:** Map portal documents against existing MDPA documentation to identify gaps, contradictions, and validation priorities.

**Date Created:** 2026-03-23
**Status:** In Progress (waiting for PDF extraction agents)

---

## Document Mapping Strategy

### Portal Documents (Source of Truth for Client Perspective)
1. Fair Lending User Guide → Compare vs. Doc 14 (Securities/Collateral Guide) + G01-001 Fair Lending Logic gap
2. CECL User Guide → Compare vs. Docs 9-11 (Data Glossary, Logical/Physical Models)
3. CECL Model Certification → Validation requirements for knowledge transfer sessions
4. Portal Updates Q3 2023 → Recent changes not yet documented in MDPA docs
5. Advanced Benchmarking Guide → Compare vs. Doc 13 (Output to Dashboard Lineage)
6. TTAData Vision v2022.1 Release Notes → System-level changes affecting MDPA

### Existing MDPA Documentation (Current State)
- **Technical Core:** Docs 1-7 (Process, Architecture, Macros, Data Sources, Alerts, Field Mapping, Macro Deep Dive)
- **Data Models:** Docs 10-11 (Logical & Physical)
- **Client-Facing:** Docs 12-14 (Tableau Glossary, Output Lineage, Securities Guide)
- **Operational:** Docs 15-22 (Troubleshooting, Quick Refs, FAQ)
- **Analysis:** GAP_ANALYSIS.md (41 known gaps identified)

---

## Gap Analysis Categories

### Category A: Missing Content
**Definition:** Portal doc describes something not in any MDPA doc
**Impact:** MDPA docs incomplete; team lacks critical knowledge
**Example:** Fair Lending pipeline (currently gap G01-001)

### Category B: Contradictions
**Definition:** Portal says X; MDPA docs say Y (different values, formulas, or processes)
**Impact:** Team confusion during validation; docs not trustworthy
**Example:** Risk_Score contradictions (currently gap G03-002)

### Category C: Outdated Content
**Definition:** MDPA docs describe process as of March 2023; Portal Updates Q3 2023 changed it
**Impact:** Team trained on old procedure; operational failures
**Example:** TBD pending portal updates review

### Category D: Incomplete Implementation
**Definition:** Portal describes feature; workflow has partial/incomplete implementation
**Impact:** Feature doesn't work as documented; client complaints
**Example:** TBD pending extraction

### Category E: Clarification Needed
**Definition:** MDPA docs are vague; Portal docs provide client-ready clarity
**Impact:** Good for validation; may need to integrate into technical docs
**Example:** TBD pending extraction

---

## Analysis Output Template

For each identified gap:

```
## [PORTAL-GAP-###] — [Title]

**Portal Source:** [Document Name, Page #]
**Current MDPA Docs:** [Doc X, Section Y] or [No coverage]
**Gap Type:** [A/B/C/D/E from above]
**Priority:** [Critical/Medium/Low]

**Portal States:**
[What the portal doc says]

**MDPA Currently States:**
[What MDPA docs say, or "Not documented"]

**Difference:**
[Specific discrepancy]

**Impact on Knowledge Transfer:**
[Which team member needs to know this? Which session?]

**Remediation:**
[Update MDPA doc? Verify with SMEs? Change workflow?]

---
```

---

## Key Questions for Portal Content Analysis

1. **Fair Lending (Portal vs. MDPA):**
   - Does Fair Lending User Guide match current MDPA workflow?
   - Are ethnicity prediction rules, confidence thresholds, FICO grades documented?
   - Are outlier elimination rules as described in portal?

2. **CECL Allowance (Portal vs. MDPA):**
   - Does CECL User Guide match the static pool cohort construction in XML?
   - Are vintage year bands, expected loss curves, and CECL calculations as described?
   - Are any recent changes in Portal Updates Q3 2023 reflected in MDPA workflow?

3. **Data Quality & Compliance:**
   - Does Model Certification document match MDPA QA rules?
   - Are validation gates and error handling procedures described?

4. **Dashboard & Reporting:**
   - Does Advanced Benchmarking guide align with Doc 13 (Output Lineage)?
   - Are all dashboard metrics correctly documented in Doc 12 (Tableau Glossary)?

5. **System Changes:**
   - What changed in TTAData Vision v2022.1?
   - Are any MDPA macros or processes affected?

---

## Next Steps (After Extraction Complete)

1. Aggregate findings from 3 parallel extraction agents
2. Create detailed PORTAL_CONTENT_GAPS.md document
3. Update VALIDATION_PLAN.md with portal-driven priorities
4. Schedule knowledge transfer sessions with specific portal doc reviews
5. Assign SME validation tasks for contradictions/missing content

