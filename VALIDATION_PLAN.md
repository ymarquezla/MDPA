# MDPA Documentation Validation Plan

**Duration:** 4 Weeks (Mon 3/24 - Fri 4/18/2026)
**Subject Matter Experts:** John Wagner, Chris Lindsay
**Session Format:** Two 1-hour sessions per SME per week
**Weekly Schedule:** Monday & Wednesday (1 hr each SME)
**Total Available Hours:** 16 hours (2 hrs/week × 2 SMEs × 4 weeks)

---

## Week 1: Foundation & Architecture Review

**Objective:** Validate high-level workflow design, process flow accuracy, and overall architecture

**Topics:** MDPA purpose, 7-stage workflow, architecture overview, basic metrics

---

### Session 1A: Monday 3/24 - John Wagner (1 hour)
**Topic: MDPA Purpose, Scope & Overall Architecture**

**Pre-Session Prep:** (15 min)
- Read: 1_MDPA_PROCESS_DOCUMENTATION.md (Overview section)

**Discussion Topics:** (45 min)
1. MDPA mission & scope (15 min)
   - Purpose statement accurate?
   - Intended use cases clear?
   - Scope boundaries correct?

2. 7-stage processing pipeline (20 min)
   - Stage names & sequence correct?
   - Any missing stages?
   - Stage purposes align with documentation?

3. High-level questions (10 min)
   - Any inaccuracies so far?
   - Anything unclear?

**Deliverables:**
- Notes on accuracy/gaps
- List of clarifications needed

---

### Session 1B: Wednesday 3/27 - Chris Lindsay (1 hour)
**Topic: Workflow Architecture Deep Dive**

**Pre-Session Prep:** (15 min)
- Read: 2_WORKFLOW_ARCHITECTURE.md
- Review John's notes from 3/24

**Discussion Topics:** (45 min)
1. Tool inventory validation (15 min)
   - 300+ tools breakdown accurate?
   - Tool distribution realistic?
   - Any major categories missing?

2. Data flow & connections (20 min)
   - Does data flow through stages correctly?
   - Sequence of transformations logical?
   - Any missing connections?

3. Clarifications & sign-off (10 min)
   - Architecture validated ✓?
   - Corrections needed?

**Deliverables:**
- Architecture validation sign-off
- Corrections/amendments list

---

## Week 2: Data Sources & Input Fields

**Objective:** Validate data sources, input fields, and data transformation accuracy

**Topics:** Input sources, field inventory, 7-stage transformations, field mapping

---

### Session 2A: Monday 3/31 - John Wagner (1 hour)
**Topic: Input Data Sources & Field Inventory**

**Pre-Session Prep:** (15 min)
- Read: 4_DATA_SOURCES_AND_LOCATIONS.md

**Discussion Topics:** (45 min)
1. Input data sources review (15 min)
   - All 4 primary sources documented?
   - Source system connections correct?
   - File paths/locations accurate?

2. Field inventory validation (20 min)
   - Required fields documented?
   - Data types correct?
   - Field purposes match actual usage?

3. Data quality baseline (10 min)
   - Known issues documented?
   - Data refresh cycles accurate?

**Deliverables:**
- Input source validation notes
- Field inventory corrections (if needed)

---

### Session 2B: Wednesday 4/3 - Chris Lindsay (1 hour)
**Topic: Field Transformations & 7-Stage Pipeline**

**Pre-Session Prep:** (15 min)
- Read: 6_FIELD_MAPPING_AND_DATA_LINEAGE.md (first half)
- Review John's input source notes

**Discussion Topics:** (45 min)
1. 7-stage transformation sequence (20 min)
   - Cleanse → Enrich → Consolidate → Comply → Output correct?
   - Field additions at each stage accurate?
   - Transformation logic sound?

2. Output field mappings (15 min)
   - Client deliverable fields correct?
   - QA report fields accurate?
   - Tableau fields complete?

3. Sign-off & gaps (10 min)
   - Data transformation validated ✓?
   - Any missing transformations?

**Deliverables:**
- Field mapping validation sign-off
- Transformation accuracy confirmation

---

## Week 3: Macros & Dependencies

**Objective:** Validate macro inventory, usage frequency, and macro nesting analysis

**Topics:** Macro documentation, macro usage patterns, nesting analysis, complexity ranking

---

### Session 3A: Monday 4/7 - John Wagner (1 hour)
**Topic: Macro Inventory & Usage Frequency**

**Pre-Session Prep:** (15 min)
- Read: 3_MACROS_AND_DEPENDENCIES.md (macro inventory section)

**Discussion Topics:** (45 min)
1. Macro inventory completeness (15 min)
   - All 23 unique macros documented?
   - Macro categories correct?
   - Embedded vs. external distinction accurate?

2. High-usage macros validation (20 min)
   - CReW_EnsureFields (8 instances) - correct?
   - Contingent File Input (8 instances) - accurate?
   - 2020_Date_Converter (5 instances) - complete?

3. Missing/incorrect macros (10 min)
   - Any macros not documented?
   - Any incorrect counts?

**Deliverables:**
- Macro inventory validation notes
- Usage frequency corrections (if any)

---

### Session 3B: Wednesday 4/10 - Chris Lindsay (1 hour)
**Topic: Macro Nesting & Complexity Analysis**

**Pre-Session Prep:** (15 min)
- Read: 7_MACROS_DEEP_DIVE.md (Nesting Analysis section)
- Review John's macro inventory notes

**Discussion Topics:** (45 min)
1. Macro nesting investigation (20 min)
   - Do any macros call other macros?
   - HIGH confidence nesting candidates validated?
     - CReW_EnsureFields
     - PreProcess_Iterative
     - Append Charge Offs and Matching

2. Macro complexity & dependencies (15 min)
   - Complexity tiers accurate?
   - Dependencies identified correctly?
   - Any hidden dependencies?

3. Performance & optimization (10 min)
   - Bottleneck candidates identified?
   - Testing strategy appropriate?

**Deliverables:**
- Macro nesting analysis validation
- Complexity ranking sign-off

---

## Week 4: Quality Validation & Sign-Off

**Objective:** Validate quality gates, error handling, alerts, and obtain final sign-off

**Topics:** Validation rules, error handling, alerts/notifications, final review

---

### Session 4A: Monday 4/14 - John Wagner (1 hour)
**Topic: Validation Rules & Quality Gates**

**Pre-Session Prep:** (15 min)
- Read: 6_FIELD_MAPPING_AND_DATA_LINEAGE.md (Quality Metrics section)

**Discussion Topics:** (45 min)
1. Data validation rules (15 min)
   - Field-level validation rules appropriate?
   - Numeric range checks sufficient?
   - Date format validation complete?

2. Quality gates by stage (20 min)
   - Input validation adequate?
   - Processing validation sufficient?
   - Output validation complete?

3. Thresholds & acceptability (10 min)
   - Acceptable error rates defined?
   - Quality thresholds appropriate?

**Deliverables:**
- Validation rules approval
- Quality gates sign-off
- Threshold recommendations

---

### Session 4B: Wednesday 4/17 - Chris Lindsay (1 hour)
**Topic: Error Handling, Alerts & Final Sign-Off**

**Pre-Session Prep:** (15 min)
- Read: 5_ALERTS_AND_NOTIFICATIONS.md
- Review all previous session notes
- Review John's validation rules notes

**Discussion Topics:** (45 min)
1. Error handling & recovery (15 min)
   - 4 error categories documented?
   - Recovery procedures appropriate?
   - Escalation paths clear?

2. Alerts & notifications (15 min)
   - Alert triggers complete?
   - Notification recipients correct?
   - Alert timing appropriate?

3. Final validation & sign-off (15 min)
   - Overall documentation accuracy validated ✓?
   - All major gaps closed?
   - Ready for team distribution?
   - **Formal SME sign-off**

**Deliverables:**
- Error handling & alerts approval
- Final validation report
- **Formal sign-off signature**

---

## Session Structure (Each 1-Hour Session)

### Pre-Session (15 min - before meeting)
- Read assigned documentation section
- Prepare questions/concerns
- Review relevant notes from previous sessions

### During Session (45 min)
- **Discussion Topics:** 2-3 focused topics
  - ~15-20 min per topic
  - Q&A and feedback
  - Accuracy assessment
  - Gap identification
- **Wrap-up:** (5-10 min)
  - Summarize findings
  - Document notes
  - Confirm next session focus

### After Session (async)
- Update validation checklist
- Share session notes with other reviewer
- Document corrections needed
- Prepare for next session

---

## Weekly Session Schedule

### Week 1 (Mar 24-27)
- **Mon 3/24, 1 hr (John):** MDPA purpose, 7-stage workflow
- **Wed 3/27, 1 hr (Chris):** Architecture details, tool inventory

### Week 2 (Mar 31 - Apr 3)
- **Mon 3/31, 1 hr (John):** Input sources, field inventory
- **Wed 4/3, 1 hr (Chris):** Field transformations, 7-stage mappings

### Week 3 (Apr 7-10)
- **Mon 4/7, 1 hr (John):** Macro inventory, usage frequency
- **Wed 4/10, 1 hr (Chris):** Macro nesting, complexity ranking

### Week 4 (Apr 14-17)
- **Mon 4/14, 1 hr (John):** Validation rules, quality gates
- **Wed 4/17, 1 hr (Chris):** Error handling, alerts, final sign-off

---

## Documentation Validation Checklist

### Session 1A & 1B: Foundation ✓
- [ ] MDPA purpose & scope validated
- [ ] 7-stage workflow verified
- [ ] 300+ tools breakdown confirmed
- [ ] Data flow sequence approved
- [ ] No critical gaps identified
- [ ] Architecture sign-off obtained

### Session 2A & 2B: Data ✓
- [ ] All 4 input data sources confirmed
- [ ] Field inventory complete & accurate
- [ ] 7-stage transformation chain validated
- [ ] Output field mappings correct
- [ ] Data quality baseline established
- [ ] Field mapping sign-off obtained

### Session 3A & 3B: Macros ✓
- [ ] 23 unique macros identified & documented
- [ ] Macro usage frequency accurate
- [ ] Macro nesting analysis validated
- [ ] Macro complexity ranking confirmed
- [ ] Dependencies identified
- [ ] Macro sign-off obtained

### Session 4A & 4B: QA & Sign-Off ✓
- [ ] Validation rules complete
- [ ] Quality gates appropriate
- [ ] Error handling documented
- [ ] Alert/notification system understood
- [ ] Overall accuracy ≥ 90%
- [ ] **Both SME formal sign-offs obtained** ✓

---

## Success Criteria

✅ **Validation Complete When:**
1. All 8 sessions completed (4 weeks × 2 sessions/week)
2. All 7 documentation sections reviewed by both SMEs
3. Accuracy confidence ≥ 90% (across all sections)
4. All identified corrections completed
5. No critical gaps remaining
6. **Both SME formal sign-offs obtained**
7. Final validation report documented

---

## Communication Between Sessions

**John → Chris Handoff (Mon evening):**
- John's session notes shared
- Key findings/corrections highlighted
- Chris reads relevant docs + John's notes before Wed session

**Chris → John Handoff (Wed evening):**
- Chris's session notes shared
- Validation sign-offs documented
- John reviews before next Mon session

---

## Post-Validation (Week 5+)

**Immediate (Apr 21):**
- Compile all corrections
- Update GitHub documentation
- Create "Validated" release tag
- Share final report with Loan Analytics team

**Ongoing:**
- Schedule quarterly review sessions
- Update docs as workflow evolves
- Maintain macro inventory
- Track any new macros/changes

---

## Key Contacts & Schedule

| Name | Role | Session Days | Session Times |
|---|---|---|---|
| John Wagner | SME #1 | Mon, Mon, Mon, Mon | 1 hour each |
| Chris Lindsay | SME #2 | Wed, Wed, Wed, Wed | 1 hour each |

**Validation Period:** March 24 - April 18, 2026
**Total Sessions:** 8 (2 per week × 4 weeks)
**Total Hours:** 16 (1 hr × 2 SMEs × 8 sessions)

---

**Document prepared for:** Yomar Marquez
**Validation reviewers:** John Wagner, Chris Lindsay
**Status:** Ready to schedule
**Last updated:** 2026-03-17

---
