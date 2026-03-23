# Decision Log Template

**Purpose:** Capture design decisions made during knowledge transfer sessions, including rationale, alternatives considered, and team sign-off.

**Instructions:**
- Create one decision log per significant decision made during a session
- Complete immediately after discussion while SME perspective is fresh
- Decision logs become the "product playbook" - institutional memory for why MDPA works the way it does
- File naming: `DECISION_LOG_[SessionID]_[DecisionNumber].md` (e.g., `DECISION_LOG_1A_001.md`)
- Archive all decision logs at end of Week 6 into `DECISION_LOGS_ARCHIVE.md`

---

## Template

```markdown
# Decision Log [Session ID].[Decision #]

**Date:** [Session Date - YYYY-MM-DD]
**Session:** [1A, 1B, 2A, 2B, etc.]
**Decision Owner:** [Name of team member making the decision]
**SME Validator:** [Name of domain expert validating the decision]
**Status:** [Pending SME Review / Approved / Implemented / Archived]

---

## Decision Statement

**Title:** [Short title of the decision]

**What decision was made?**
[1-2 sentence description of the decision]

**Why is this decision important?**
[What problem does this decision solve? What would happen if the wrong decision was made?]

---

## Portal Documentation Reference

**Portal Source Document:** [Name of portal PDF, page number if applicable]

**Relevant Excerpt:**
> [Quote from portal document that informed this decision]

**How does portal content relate to this decision?**
[Does the portal document clarify the decision? Contradict it? Provide additional context?]

---

## MDPA Current State

**Current MDPA Documentation:** [Which MDPA doc covers this? Doc 1, 2, 6, etc., or "Not documented"]

**Current MDPA Text:**
> [Quote from MDPA doc, if it exists]

**Gap Identified:**
[What was missing or unclear in MDPA docs? Why did we need a session to clarify?]

---

## Decision Details

### The Problem (Context)
[What situation or question prompted this decision?]

**Key Facts:**
- [Fact 1]
- [Fact 2]
- [Fact 3]

**Stakeholders Affected:**
- [Team member 1]: [Their role/impact]
- [Team member 2]: [Their role/impact]

### Alternatives Considered

#### Option A: [Description]
**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Effort:** [Hours/Days]
**Risk:** [High/Medium/Low]

#### Option B: [Description]
**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Effort:** [Hours/Days]
**Risk:** [High/Medium/Low]

#### Option C: [Description]
**Pros:**
- [Pro 1]

**Cons:**
- [Con 1]

**Effort:** [Hours/Days]
**Risk:** [High/Medium/Low]

### The Decision

**Chosen Option:** [A / B / C]

**Why This Option?**
[1-2 paragraphs explaining the rationale]

**Key Reasoning:**
- [Reason 1]
- [Reason 2]
- [Reason 3]

**Trade-offs Accepted:**
[What are we giving up by choosing this option?]

**Assumptions Made:**
- [Assumption 1]
- [Assumption 2]

---

## Implementation Plan

### Who Does What?
| Team Member | Task | Deadline | Done? |
|-------------|------|----------|-------|
| [Name] | [Task] | [Date] | [ ] |
| [Name] | [Task] | [Date] | [ ] |

### Key Milestones
- [ ] [Milestone 1] - [Date]
- [ ] [Milestone 2] - [Date]

### Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

## Documentation & Knowledge Transfer

### What Gets Documented?
- [ ] Update MDPA Doc [#] Section [Name]
- [ ] Update [Specific Document/Page]
- [ ] Add to [FAQ/Glossary/Quick Ref]
- [ ] Create new runbook: [Title]

### What Gets Trained?
- [ ] Session attendees understand decision
- [ ] [Team member] trained on implementation
- [ ] [Team member] trained on troubleshooting

### Questions to Answer for Team
1. **Q: When would we need to revisit this decision?**
   A: [Answer]

2. **Q: What if this assumption changes?**
   A: [Answer]

3. **Q: How would a new team member learn this?**
   A: [Answer - point to docs/training]

---

## Sign-Off

### SME Validation
**SME Name:** [Name]
**Validation Date:** [Date]
**Feedback:** [Any SME comments or refinements]
**Approved:** [ ] Yes [ ] No

*If No, explain issues and decision will be revisited*

### Team Sign-Off
**Attendees Who Approve:**
- [ ] [Name] - [Role]
- [ ] [Name] - [Role]
- [ ] [Name] - [Role]

**Any dissenting opinions?** [Explain if team member has concerns]

---

## Related Decisions

**This decision connects to:**
- Decision Log [Session].[#]: [Title]
- Decision Log [Session].[#]: [Title]

**This decision may impact:**
- [Other area that depends on this decision]

---

## Archive Notes (Completed Decisions Only)

**Final Implementation Date:** [When was this decision fully implemented?]

**Lessons Learned:**
[In retrospect, what did we learn from making and implementing this decision?]

**How Often Is This Decision Referenced?**
[How often does the team need to understand this decision? Weekly? Monthly? During onboarding only?]

**Should This Be In Training?**
[ ] Yes - critical to team understanding
[ ] Somewhat - nice-to-have background
[ ] No - too specific, addressed in docs

```

---

## Example Filled-Out Decision Log

```markdown
# Decision Log 1A.001

**Date:** 2026-03-31
**Session:** 1A - Q3 2023 System Changes
**Decision Owner:** Preeti (QA Team)
**SME Validator:** John Wagner (Product Owner)
**Status:** Approved

---

## Decision Statement

**Title:** How MDPA Should Handle Null Credit Scores in PD Methodology

**What decision was made?**
Null or empty credit scores are now treated as credit score = "0" in PD calculations, rather than triggering workflow exceptions or skipping the loan record.

**Why is this decision important?**
This change ensures that all borrowers have a PD assigned, even those with missing credit history. It prevents workflow failures during month-end execution and ensures reserve calculations include all portfolio loans. Using "0" as default score reflects worst-case credit quality assumption (most conservative).

---

## Portal Documentation Reference

**Portal Source Document:** PORTAL_UPDATES_Q3_2023.pdf, Section "PD Null Credit Score Handling", Page 3

**Relevant Excerpt:**
> "Effective August 30, 2023, null or empty credit scores in borrower records are now treated as credit score = '0' (representing no credit history, highest risk segment). This ensures all borrowers receive a Probability of Default assignment, eliminating workflow exceptions for incomplete credit data."

**How does portal content relate to this decision?**
Portal documentation explicitly states the new behavior as of Aug 30, 2023. This decision formalizes how MDPA operationalizes this system change for team procedures and QA testing.

---

## MDPA Current State

**Current MDPA Documentation:**
- Doc 6 (Field Mapping & Data Lineage) - mentions credit score field but no null handling
- Doc 16 (Troubleshooting Guide) - no section on null credit scores
- Not documented in macro specifications

**Current MDPA Text:**
> "Credit_Score field is extracted from source system. Used in PD methodology to determine Probability of Default bucket."

**Gap Identified:**
MDPA docs do not specify what happens when Credit_Score is null/empty. Team has no procedure for this scenario. System now handles it automatically (treats as "0"), but team procedures were not updated.

---

## Decision Details

### The Problem (Context)

**Question:** When a borrower record has no credit score (null/empty field), how should MDPA calculate their Probability of Default?

**Context:**
- ~2-5% of borrower records typically have missing credit score data
- Prior system behavior: Null credit score caused workflow exception, loan skipped from reserve calculation
- New system behavior (Aug 2023): Null credit score treated as "0" score
- MDPA procedures not updated to reflect this change
- Team doesn't know how to test or validate this scenario

**Key Facts:**
- Regulatory expectation: All borrowers must have a PD assignment
- Credit score "0" represents worst-case assumption (no credit history = highest risk)
- ~50-200 loans per month affected by this change
- This impacts reserve calculations (affects total allowance amount)

**Stakeholders Affected:**
- Preeti (QA): Must add null credit score validation to test cases and QA runbook
- Venkat (TPA): Must understand where nulls come from in source data (data quality)
- Bhavani (BI): Must verify PD calculation macro correctly applies "0" score
- Yomar (PM): Must communicate this to clients if their portfolio has significant null rates

### Alternatives Considered

#### Option A: Treat Null as "0" (Chosen)
**Pros:**
- No workflow exceptions (process completes successfully)
- Ensures all borrowers get a PD assignment (regulatory compliant)
- "0" score is most conservative assumption (appropriate for unknown credit history)
- Aligns with new system behavior (Aug 2023)
- Simplest for operations team

**Cons:**
- May overstate risk for borrowers with missing (but good) credit history
- Requires QA test data with null scores
- May cause some client questions if many nulls in their portfolio

**Effort:** 1 hour (update QA test cases)
**Risk:** Low (system already doing this automatically)

#### Option B: Skip Loans with Null Credit Scores
**Pros:**
- Avoids assuming worst-case for unknown data
- Simpler QA (no null handling required)

**Cons:**
- Violates regulatory requirement (not all borrowers get PD)
- Understates total reserve (missing loans)
- Workflow incomplete
- Goes against system design

**Effort:** 2 hours (requires custom macro logic)
**Risk:** High (not aligned with system design)

#### Option C: Use Average Credit Score as Fallback
**Pros:**
- Might be more realistic than assuming "0"

**Cons:**
- Adds complexity to macro logic
- Still "making up" data (not based on actual borrower)
- System doesn't support this
- Harder to explain to regulators

**Effort:** 3 hours
**Risk:** High (inconsistent with system design)

### The Decision

**Chosen Option:** A - Treat Null as "0"

**Why This Option?**

The system was explicitly changed (Aug 30, 2023) to treat null credit scores as "0". This design choice reflects a regulatory expectation that all borrowers must have a PD assignment, and when actual credit history is missing, the most conservative approach (treating as "0" = worst credit quality) is appropriate.

From a practical perspective, this means:
- MDPA workflow continues without exceptions
- Team can complete month-end processing on schedule
- Total reserve includes all loans (no one falls through the cracks)
- Regulatory expectation is met (every borrower has a PD)

This is not a decision we're making; it's a decision the system already made. Our role is to operationalize it in MDPA procedures and QA testing.

**Key Reasoning:**
- Aligns with system design (no fighting the platform)
- Meets regulatory requirement (all borrowers get PD)
- Most conservative approach (appropriate for missing data)
- Simplest operationally (no custom logic needed)

**Trade-offs Accepted:**
- We accept that ~50-200 borrowers per month will have "worst case" PD assignments instead of actual credit data
- We accept that this will be a client question ("Why is this borrower's risk so high?") - answer: "Because we don't have credit data, we use worst-case assumption"

**Assumptions Made:**
- Null credit scores are genuinely missing (not "0" already in system)
- System is correctly applying the "0" treatment (we should validate this in QA)
- Null rate remains <5% of portfolio (if higher, may need to investigate data quality)

---

## Implementation Plan

### Who Does What?
| Team Member | Task | Deadline | Done? |
|-------------|------|----------|-------|
| Preeti | Add null credit score test case to QA suite | 2026-04-04 | [ ] |
| Preeti | Add null validation rule to month-end checklist | 2026-04-04 | [ ] |
| Venkat | Verify source system is providing nulls (vs. all "0") | 2026-04-04 | [ ] |
| Bhavani | Confirm PD macro correctly applies "0" treatment | 2026-04-04 | [ ] |
| Yomar | Prepare client FAQ: "Why do some borrowers have high risk?" | 2026-04-11 | [ ] |

### Key Milestones
- [ ] QA Test Case with null scenarios created - 2026-04-04
- [ ] Validation confirmed in test environment - 2026-04-04
- [ ] Null handling procedure documented in runbook - 2026-04-11

### Success Criteria
- [ ] MDPA processes loans with null credit scores without exceptions
- [ ] QA test case passes with null credit scores (score treated as "0")
- [ ] Month-end report shows ~2-5% of loans with "0" credit score PD
- [ ] Team can explain decision to clients
- [ ] Troubleshooting guide includes null credit score scenarios

---

## Documentation & Knowledge Transfer

### What Gets Documented?
- [ ] Update Doc 16 (Troubleshooting Guide) - Add "Null Credit Score" troubleshooting section
- [ ] Update Doc 6 (Field Mapping) - Add "Credit Score Null Handling" note
- [ ] Add to 22_FAQ_COMMON_QUESTIONS.md - Client FAQ on null credit scores
- [ ] Create QA runbook section: "Null Credit Score Validation"

### What Gets Trained?
- [ ] Preeti (QA) trained on null test scenarios - Session 1A
- [ ] Venkat (TPA) trained on null data quality checks - Session 1A
- [ ] All team members understand decision rationale - Session 1A closure

### Questions to Answer for Team
1. **Q: When would we need to revisit this decision?**
   A: If null credit score rate exceeds 5% of portfolio (indicates data quality issue) or if regulatory guidance changes.

2. **Q: What if source system changes and stops sending nulls?**
   A: Update validation rule; no borrowers will have "0" scores (unless they actually have credit score of 0).

3. **Q: How would a new team member learn this?**
   A: Read Doc 16 Troubleshooting section + QA runbook + this decision log.

---

## Sign-Off

### SME Validation
**SME Name:** John Wagner (Product Owner)
**Validation Date:** 2026-03-31
**Feedback:** "This is correct - the system change was intentional to ensure regulatory compliance. Preeti's implementation plan covers everything needed. Approved."
**Approved:** [X] Yes [ ] No

### Team Sign-Off
**Attendees Who Approve:**
- [X] Preeti (QA) - Will implement in QA
- [X] Venkat (TPA) - Understands data impact
- [X] Bhavani (BI) - Verified macro behavior
- [X] Yomar (PM) - Will communicate to clients
- [X] Mwafaq (Scrum Master) - Approved for implementation

**Any dissenting opinions?** None - all team members align on decision.

---

## Related Decisions

**This decision connects to:**
- Decision Log 1A.003: How MDPA handles data quality exceptions (related: what if source data has > 5% nulls?)

**This decision may impact:**
- PD Methodology Deep Dive (Session 3B) - need to cover null handling in detail
- Dashboard output - if many nulls, "0" score borrowers will be visible in PD risk buckets

---

## Archive Notes

**Final Implementation Date:** 2026-04-04

**Lessons Learned:**
System changes (like the Aug 2023 null credit score handling) must be actively monitored and operationalized in downstream workflows. A 7-month gap between system change and team training/documentation creates risk. Consider setting up change-tracking process.

**How Often Is This Decision Referenced?**
Monthly during QA execution + new hire training

**Should This Be In Training?**
[X] Yes - critical to QA and operations understanding
[ ] Somewhat - nice-to-have background
[ ] No - too specific, addressed in docs

```

---

## Decision Log Workflow During Knowledge Transfer

### Session Execution
1. **During session:** Take notes on key decisions being made
2. **Immediately after session:** Complete decision log template while discussion is fresh
3. **Share with SME:** Have SME review and validate before moving on
4. **Circulate to team:** Share approved decision log with attendees for reference

### Weekly Review
- At end of each week, review all decision logs created that week
- Identify common themes (e.g., "We've made 3 decisions about data quality")
- Look for contradictions or missing pieces

### Week 6 Review
- Session 6A is dedicated to reviewing all 14+ decision logs
- Team discusses whether decisions are still valid
- Identify which decisions should go into permanent training/documentation
- Archive all decision logs with lessons learned

### Post-Transfer Archive
- File all decision logs in `DECISION_LOGS_ARCHIVE.md`
- This becomes the "product playbook" - why MDPA is designed the way it is
- Future team members and maintainers can understand the history

---

## Decision Log Categories

Use these categories to organize decision logs when archiving:

1. **CECL Methodology Decisions** (Sessions 2B, 3A, 3B)
   - Which methodology to use
   - How to calculate expected loss
   - When to use qualitative adjustments

2. **Fair Lending Decisions** (Session 2A)
   - BISG algorithm implementation
   - Ethnicity prediction handling
   - Regulatory compliance requirements

3. **Data Quality Decisions** (Sessions 1A, 4C)
   - Null handling (credit scores, collateral, etc.)
   - Validation thresholds
   - Error escalation procedures

4. **Scenario & Stress Testing Decisions** (Session 4A)
   - Scenario parameters and multipliers
   - Forecast period logic
   - When scenarios apply (which methodologies)

5. **Operations & Execution Decisions** (Sessions 1B, 5B)
   - Month-end timeline and dependencies
   - Error escalation and rollback procedures
   - Who owns each stage

6. **Dashboard & Reporting Decisions** (Session 5A)
   - Dashboard organization and naming
   - Metric calculations and definitions
   - Peer benchmarking approach

---

**Template Version:** 1.0
**Created:** 2026-03-23
**Status:** Ready for use in Week 1 sessions
