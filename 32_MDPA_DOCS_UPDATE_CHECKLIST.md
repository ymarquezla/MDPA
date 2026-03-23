# MDPA Documentation Update Checklist - Q3 2023 Changes Integration

**Purpose:** Identify all MDPA documentation files that require updates to reflect Q3 2023 system changes (Aug-Sept 2023).

**Deadline:** 2026-05-31 (before knowledge transfer completion)

**Status:** Ready for Phase 2 (Weeks 2-4 of knowledge transfer)

---

## Overview

The MDPA documentation was finalized as of **March 18, 2026**, but the underlying system (TTAData portal) released critical updates in **August-September 2023**. This checklist identifies which MDPA documents need updating to reflect production system behavior.

**Total Documents Affected:** 6 primary + 3 supporting
**Estimated Update Effort:** 15-20 hours spread across weeks 2-4
**Owner:** Yomar (PM) + Bhavani (BI) + Preeti (QA)

---

## Q3 2023 System Changes Reference

| Change ID | Change Name | Portal Source | Session Coverage | Priority |
|-----------|-------------|----------------|------------------|----------|
| C01 | PD Null Credit Score Handling | PORTAL_UPDATES_Q3_2023.pdf | Session 1A, 3B | CRITICAL |
| C02 | Gross vs. Net Charge-Offs | PORTAL_UPDATES_Q3_2023.pdf | Session 1A, 3A | CRITICAL |
| C03 | Vintage Loss Rate Averaging | PORTAL_UPDATES_Q3_2023.pdf | Session 1A, 3A | CRITICAL |
| C04 | Weighted Scenarios (Vintage) | PORTAL_UPDATES_Q3_2023.pdf | Session 1A, 4A | HIGH |
| C05 | LGD Cap (Superior Mortgages) | PORTAL_UPDATES_Q3_2023.pdf | Session 1A, 3B | MEDIUM |
| C06 | Dashboard Reorganization | PORTAL_UPDATES_Q3_2023.pdf | Session 5A | MEDIUM |

---

## Document Update Matrix

### Priority 1: CRITICAL - Update by Week 2

#### [1] Document: **1_MDPA_PROCESS_DOCUMENTATION.md**

**Current Status:** Last updated March 18, 2026 (outdated re: system behavior)

**Sections Requiring Update:**

##### Section: "Data Sources & Requirements" (Current: Page ~5)
**Change ID:** C01, C02, C03
**Current Text:** [Likely describes what fields are needed without Q3 2023 changes]
**Update Required:**
- [ ] Add note about credit score null handling (C01)
  - Insert: "**PD Methodology (Q3 2023 Update):** Null or empty credit scores are treated as score = '0' (representing no credit history). This ensures all borrowers receive a PD assignment without workflow exceptions."
  - Reference: PORTAL_UPDATES_Q3_2023.pdf, "PD Null Credit Score Handling"

- [ ] Clarify charge-off data requirement (C02)
  - Change: "Loan charge-off amounts from source system"
  - To: "Loan charge-off amounts (GROSS, before recovery deductions) from source system. Recovery factors are applied separately via configuration parameters. [Q3 2023 Change: Prior system used net charge-off amounts; system was updated to use gross amounts.]"
  - Reference: PORTAL_UPDATES_Q3_2023.pdf, "Gross vs. Net Charge-Offs"

##### Section: "CECL Calculation Overview" (Current: Page ~8-9)
**Change ID:** C03, C04, C05
**Current Text:** [Describes Vintage methodology without noting loss-rate averaging change]
**Update Required:**
- [ ] Add Q3 2023 change to vintage loss rate calculation
  - Insert subsection: "**Vintage Loss Rate Calculation (Q3 2023 Update)**"
  - Text: "Historical loss rate is calculated as average charge-off rate across all years in the lookback period, **including years with zero charge-offs**. This is more conservative than prior method (which excluded zero years). Example: If years 1-3 had loss rates of 2%, 8%, and 0%, the average is (2+8+0)/3 = 3.3% (vs. prior method (2+8)/2 = 5%)."
  - Reference: PORTAL_UPDATES_Q3_2023.pdf, "Vintage Loss Rate Averaging"

- [ ] Add weighted scenarios feature note (C04)
  - Insert: "**Weighted Scenarios (Q3 2023 New Feature):** Dashboard now shows weighted expected losses that apply PD stress scenario multipliers to Vintage methodology reserves. Previously, scenario weighting was PD-method only. See Session 4A for details."

- [ ] Add LGD cap clarification (C05)
  - Insert: "**Loss Given Default Cap (Q3 2023 Update):** LGD-based reserves are capped at current loan balance, preventing stress scenario reserves from exceeding the principal amount outstanding."

**Acceptance Criteria:**
- [ ] All Q3 2023 changes clearly marked as updates with dates
- [ ] References to portal documents included
- [ ] No contradictions with portal documentation
- [ ] Visible to new readers that there are recent system changes

**Estimated Effort:** 2-3 hours
**Owner:** Yomar (PM) + Bhavani (BI)

---

#### [2] Document: **2_WORKFLOW_ARCHITECTURE.md**

**Current Status:** Last updated March 18, 2026 (may need system change notes)

**Sections Requiring Update:**

##### Section: "Stage 3: CECL Calculation" (Current: Page ~?)
**Change ID:** C01, C02, C03, C04, C05
**Current Text:** [Describes calculation flow without Q3 2023 system behavior]
**Update Required:**
- [ ] Add architecture note for null credit score handling (C01)
  - Insert diagram or note showing: Credit Score → [IS NULL?] → [YES] → Assign Score = 0 → Continue

- [ ] Add data flow note for charge-off handling (C02)
  - Clarify: Macro receives GROSS charge-offs; recovery factor configured separately; no net conversion needed

- [ ] Update vintage calculation flow (C03)
  - Show: Years 1-N → Calculate Loss Rate (including zero-loss years) → Average rate → Apply pro-rata

- [ ] Add weighted scenario branching (C04)
  - Show parallel path: After Vintage Reserve calculated → Apply scenario weighting (new)

##### Section: "Data Processing Pipeline" (Current: Page ~?)
**Change ID:** C02
**Current Text:** [May reference charge-off amounts without gross/net clarification]
**Update Required:**
- [ ] Clarify: "Input charge-off amounts are gross (before recovery). System applies Recovery Factor parameter during reserve calculation."

**Acceptance Criteria:**
- [ ] Architecture diagrams show all Q3 2023 processing paths
- [ ] Data flows are clear and don't contradict portal documentation
- [ ] No assumptions about old system behavior (net charge-offs, etc.)

**Estimated Effort:** 2-3 hours
**Owner:** Bhavani (BI)

---

#### [3] Document: **6_FIELD_MAPPING_AND_DATA_LINEAGE.md**

**Current Status:** Last updated March 18, 2026 (likely most affected by Q3 changes)

**Sections Requiring Update:**

##### Section: "Credit Score Field" (Locate & Update)
**Change ID:** C01
**Current Text:** "Credit_Score (Source: System A) - Borrower credit score, used in PD calculation"
**Update Required:**
- [ ] Expand to:
```
**Credit_Score** (Source: System A)
- Borrower credit score, used in PD calculation
- Data Type: Numeric (300-850) or NULL
- **Q3 2023 UPDATE (Aug 30, 2023):** Null or empty values are now treated as Credit_Score = 0 in PD methodology, rather than triggering workflow exception
- Validation: Check for nulls during data transformation (Stage 2); flag as data quality issue if > 5% of borrowers
- See: Session 3B (PD Methodology), Decision Log 1A.001
```

##### Section: "Charge-Off Amount Field" (Locate & Update)
**Change ID:** C02, C03
**Current Text:** "ChargeOff_Amount (Source: System B) - Amount of loan charge-off"
**Update Required:**
- [ ] Expand to:
```
**ChargeOff_Amount** (Source: System B)
- Loan charge-off amount
- Data Type: Numeric (currency)
- **Q3 2023 UPDATE (July 2022):** This field now contains GROSS charge-off amounts (before recovery deductions), not net amounts
- Recovery handling: Recoveries are applied via separate Recovery_Factor parameter during reserve calculation
- Calculation Impact: Vintage loss rate includes this gross amount; loss rate averaging (new Q3 2023) includes zero-loss years
- Example: If ChargeOff_Amount = $6,000 and recovery is $1,000, system calculates: Reserve = Loan × Loss_Rate × (1 - $1,000/$6,000)
- See: Session 1A (Q3 2023 Changes), Session 3A (Vintage Calculation)
```

##### Section: "Scenario Multiplier Field" (Locate or Create)
**Change ID:** C04
**Current Text:** [Likely doesn't exist if this is new feature]
**Update Required:**
- [ ] Add new field entry (if not present):
```
**Scenario_Weight** (Source: Configuration / Derived)
- **NEW FIELD (Q3 2023):** Weighted scenario multiplier applied to Vintage methodology reserves
- Data Type: Numeric (decimal, 0.8-1.5 typical)
- Purpose: Applies stress scenario assumptions to Vintage-based reserves
- Example: Vintage Reserve × Scenario_Weight = Weighted Expected Loss
- Available Scenarios: Base (1.0x), Recession (1.5x), Growth (0.8x)
- See: Session 4A (Scenario Weighting), Dashboard updates
```

##### Section: "LGD Amount Field" (Locate & Update)
**Change ID:** C05
**Current Text:** "LGD_Amount (derived) - Loss Given Default reserve amount"
**Update Required:**
- [ ] Add Q3 2023 change note:
```
**Q3 2023 UPDATE (Cap Applied):** LGD amounts are now capped at the current Loan_Balance, preventing stress scenario reserves from exceeding the principal amount. This ensures realistic reserve amounts.
- Example: If full LGD calculation produces $120,000 reserve on a $100,000 loan, the capped reserve = $100,000
- See: Session 3B (PD Methodology - LGD Calculation)
```

**Acceptance Criteria:**
- [ ] All Q3 2023 affected fields have "Q3 2023 UPDATE" notation
- [ ] Field descriptions match portal documentation (CECL User Guide)
- [ ] Calculation examples are provided
- [ ] Cross-references to sessions where field is covered

**Estimated Effort:** 3-4 hours
**Owner:** Bhavani (BI) + Preeti (QA)

---

### Priority 2: HIGH - Update by Week 3

#### [4] Document: **12_TABLEAU_DASHBOARD_GLOSSARY.md**

**Current Status:** Last updated March 18, 2026 (may not include new Q3 2023 columns)

**Sections Requiring Update:**

##### Section: "Dashboard Tabs" (Current: Page ~?)
**Change ID:** C06
**Current Text:** [Lists tab names; likely includes old names]
**Update Required:**
- [ ] Find and rename tab entry:
  - Old: "[Probability of Default_CECL]"
  - New: "[PD Visual Model]"
  - Note: "Renamed Aug 28, 2023 to clarify purpose as visual model for PD assumptions"

##### Section: "New Columns (Q3 2023)" (Create New Subsection)
**Change ID:** C04
**Current Text:** [Doesn't exist]
**Update Required:**
- [ ] Add new subsection under relevant dashboard(s):
```
### Weighted Scenario Columns (Added Aug 2023)

**Weighted Expected Losses (Vintage)**
- Definition: Vintage-method expected loss reserve adjusted for current stress scenario assumptions
- Calculation: Vintage Expected Loss × Weighted Scenario Multiplier
- Example: If Vintage Loss = $5M and scenario weight = 1.5x (recession), then Weighted Loss = $7.5M
- Dashboard Tab: [CECL Allowance], [Scenario Analysis]
- Related Session: 4A (Scenario Weighting)

**Weighted Scenario Adjustment**
- Definition: Factor showing how much the scenario multiplier is affecting the vintage reserve
- Calculation: (Weighted Loss - Vintage Loss) / Vintage Loss
- Example: If adjustment = 0.50, the scenario is increasing reserve by 50%
- Dashboard Tab: [CECL Allowance], [Scenario Analysis]
- Related Session: 4A (Scenario Weighting)
```

**Acceptance Criteria:**
- [ ] Old tab names corrected to new names
- [ ] New Q3 2023 columns documented with definitions
- [ ] Examples provided for new columns
- [ ] Links to sessions explaining the columns

**Estimated Effort:** 1-2 hours
**Owner:** Bhavani (BI)

---

#### [5] Document: **9_BUSINESS_DATA_GLOSSARY.md**

**Current Status:** Last updated March 18, 2026

**Sections Requiring Update:**

##### Section: "CECL-Related Terms" (Locate & Update)
**Change ID:** C01, C02, C03, C04, C05
**Current Text:** [Define CECL terms without Q3 2023 context]
**Update Required:**
- [ ] Update "Probability of Default" definition:
  - Add: "[Q3 2023 Update] Null credit scores are assigned PD based on score = 0 (no credit history assumption)"
  - Cross-ref: Session 3B

- [ ] Update "Loss Rate" / "Vintage Loss Rate" definition:
  - Add: "[Q3 2023 Update] Calculated by averaging all years in lookback period, including years with zero charge-offs"
  - Example: "2%, 8%, 0% average to 3.3% (vs. old method 5%)"
  - Cross-ref: Session 3A

- [ ] Add "Recovery Factor" definition (may not exist):
  - "Amount or percentage of charge-offs recovered. Applied during reserve calculation. [Q3 2023 Context: Now separately applied to gross charge-off amounts, not pre-applied in source data]"
  - Cross-ref: Session 1A

- [ ] Add "Weighted Expected Loss" definition (new Q3 2023):
  - "Expected loss reserve adjusted for scenario weighting. [Q3 2023 New Feature] Applied to Vintage methodology"
  - Cross-ref: Session 4A

- [ ] Add "Loss Given Default Cap" note (new Q3 2023):
  - "[Q3 2023 Update] LGD reserves are capped at current loan balance"

**Acceptance Criteria:**
- [ ] All terms used in new dashboard columns are defined
- [ ] Q3 2023 updates are clearly marked
- [ ] Consistent with portal documentation definitions
- [ ] Examples provided where helpful

**Estimated Effort:** 1-2 hours
**Owner:** Yomar (PM)

---

### Priority 3: MEDIUM - Update by Week 4

#### [6] Document: **16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md**

**Current Status:** Last updated March 18, 2026 (7-stage troubleshooting, 28 issues)

**Sections Requiring Update:**

##### Add New Troubleshooting Issues (Q3 2023 Related)

**Change ID:** C01
**New Issue:** "Issue #TBD: Loans with Null Credit Scores Show High PD Risk"
```
## Issue: Loans with Null Credit Scores Have Unexpectedly High PD Risk

**Symptom:**
- Some borrowers show PD risk = [worst risk level]
- Client questions: "Why is this borrower so risky?"
- Pattern: Affects ~2-5% of portfolio

**Root Cause:**
- [Q3 2023 System Change] Null or empty credit scores are treated as Credit_Score = 0
- Score of 0 maps to highest risk bucket in PD table
- This is intentional: Unknown credit history = highest risk assumption

**Resolution:**
1. Verify that affected loans actually have null credit score in source system
2. Check data quality report for % of nulls (should be < 5%)
3. If > 5%, escalate to data quality team
4. Document in client communications: "Loans without credit history are assigned highest risk (PD) per regulatory guidance"

**Prevention:**
- Include credit score validation in Stage 2 (Data Transformation)
- Flag portfolios with > 5% null credit scores for escalation
- See: Session 1A, Decision Log 1A.001
```

**Change ID:** C02
**New Issue:** "Issue #TBD: Charge-Off Rate Seems Lower Than Expected"
```
## Issue: Vintage Loss Rate (Charge-Off Rate) Is Lower Than Prior Month

**Symptom:**
- Vintage loss rate = 3.3%, prior month was 5%
- This affects reserve calculations (lower reserves)
- Not a data error

**Root Cause:**
- [Q3 2023 System Change] Vintage loss rate averaging now includes years with zero charge-offs
- Example: Prior method averaged only years with losses: (2% + 8%) / 2 = 5%
- New method includes zero years: (2% + 8% + 0%) / 3 = 3.3%
- This is more statistically accurate and intentional

**Resolution:**
1. Verify calculation includes all lookback years (e.g., 5-year history = 5 years in average, even if one year has zero losses)
2. This is expected behavior - no action needed
3. May reduce reserves vs. prior periods; document in client communications

**Prevention:**
- Educate team that vintage loss rate may fluctuate based on zero-loss years in lookback
- Update QA test cases to accept calculated rates (don't hardcode expectations)
- See: Session 1A, Session 3A
```

**Change ID:** C02
**New Issue:** "Issue #TBD: Charge-Off Amounts Not Matching Source System Exactly"
```
## Issue: Charge-Off Amounts in MDPA Don't Match Source System

**Symptom:**
- MDPA shows ChargeOff_Amount = $6,000
- Source system shows $5,000 (net of recovery)
- Numbers don't reconcile

**Root Cause:**
- [Q3 2023 System Change] MDPA now uses GROSS charge-off amounts (before recovery deductions)
- Source system shows $6,000 gross, but displays $5,000 net in some reports
- Recovery ($1,000) is applied separately in MDPA, not deducted from charge-off amount

**Resolution:**
1. Verify you're looking at GROSS amount in source system (not net)
2. Check source system documentation for gross vs. net column
3. Confirm Recovery Factor parameter is set correctly
4. Verify reserve calculation: Reserve = Loan × Loss_Rate × (1 - Recovery_Factor)

**Prevention:**
- Document source system mapping: Which column has gross charge-offs?
- Verify monthly that charge-off data is gross, not net
- Include charge-off audit in QA procedures
- See: Session 1A, Session 3A
```

**Change ID:** C04
**New Issue:** "Issue #TBD: Weighted Expected Loss Doesn't Match Vintage Loss"
```
## Issue: Dashboard Shows Different Values for "Vintage Loss" vs. "Weighted Expected Loss"

**Symptom:**
- Column "Expected Loss (Vintage)" = $5,000,000
- Column "Weighted Expected Losses (Vintage)" = $7,500,000
- They don't match; client is confused

**Root Cause:**
- [Q3 2023 New Feature] Weighted Expected Loss applies scenario multiplier to Vintage method
- They should be different if scenario ≠ 1.0x
- Example: Vintage Loss × 1.5x (recession) = Weighted Loss × 1.5

**Resolution:**
1. Check current scenario setting (Base 1.0x, Recession 1.5x, or Growth 0.8x)
2. Calculate expected multiplier: Weighted Loss / Vintage Loss = scenario multiplier
3. If multiplier ≠ scenario setting, investigate macro logic
4. Explanation: "Weighted loss shows impact of current stress scenario; Vintage shows base case"

**Prevention:**
- Document in client communications what weighted scenario means
- Add column definition in dashboard: "Vintage Loss × Current Scenario Multiplier"
- QA test: Weighted Loss ÷ Vintage Loss should = scenario multiplier (within rounding)
- See: Session 4A
```

**Change ID:** C05
**New Issue:** "Issue #TBD: LGD Reserve Capped at Loan Balance"
```
## Issue: Expected Loss Greater Than Loan Balance (Unrealistic)

**Symptom:**
- Loan balance = $100,000
- Expected loss reserve = $150,000 (seems impossible)
- Client is concerned

**Root Cause:**
- [Q3 2023 Bug Fix] LGD reserves in stress scenarios were overstated
- Reserve is now capped at current loan balance (can't lose more than you lent)
- What you see: Reserve = MIN(calculated_LGD, loan_balance)
- The "real" calculation may have been higher, but capped for realism

**Resolution:**
1. This is expected behavior (good control)
2. Check loan balance: Reserve should be ≤ Loan Balance
3. If Reserve > Loan Balance, escalate to BI team (Bhavani) - indicates macro issue
4. In stress scenarios, expect reserves closer to loan balance

**Prevention:**
- QA validation: Assert Reserve ≤ Loan Balance for all LGD-based reserves
- Document in glossary: "LGD reserves capped at current balance"
- Explain to clients: "Our stress scenarios are realistic - reserve never exceeds principal"
- See: Session 3B
```

**Change ID:** C06
**New Issue:** "Issue #TBD: Can't Find Dashboard Tab (Name Changed)"
```
## Issue: Client Says Dashboard Tab "[Probability of Default_CECL]" Doesn't Exist

**Symptom:**
- Looking for "[Probability of Default_CECL]" tab
- Tab doesn't exist or has different name
- User confusion

**Root Cause:**
- [Q3 2023 Dashboard Update] Tab was renamed from "[Probability of Default_CECL]" to "[PD Visual Model]" (Aug 2023)
- Older documentation or client training may reference old name

**Resolution:**
1. Look for "[PD Visual Model]" tab instead
2. Update any internal dashboards/documentation to use new name
3. Notify clients of tab name change

**Prevention:**
- Update all internal documentation (Tableau glossary, client guides) with new tab names
- Provide client communication: "Dashboard tabs reorganized Aug 2023 for improved navigation"
- See: Session 5A (Dashboard Ecosystem)
```

**Acceptance Criteria:**
- [ ] Each new troubleshooting issue has clear symptom, root cause, and resolution
- [ ] Q3 2023 context is explained in plain language
- [ ] Cross-references to relevant sessions included
- [ ] Prevention steps included for operational team

**Estimated Effort:** 2-3 hours
**Owner:** Preeti (QA) + Yomar (PM)

---

### Priority 4: SUPPORTING DOCUMENTS - Update as Needed

#### [7] Document: **3_MACROS_AND_DEPENDENCIES.md**
**Change ID:** C01, C02, C03, C04, C05
**Update Required:**
- [ ] If macro names or logic changed, update macro descriptions
- [ ] Add notes about which macros implement Q3 2023 changes (C01-C05)
- [ ] Document any new macros (if weighted scenarios added new one)
**Estimated Effort:** 1 hour
**Owner:** Bhavani (BI)

#### [8] Document: **7_MACROS_DEEP_DIVE.md**
**Change ID:** C01, C02, C03, C04, C05
**Update Required:**
- [ ] If any macro deep dives are affected by Q3 2023 changes, update explanations
- [ ] Add new section for weighted scenarios macro (if applicable)
- [ ] Update CECL calculation macros to explain new logic
**Estimated Effort:** 2-3 hours
**Owner:** Bhavani (BI)

#### [9] Document: **22_FAQ_COMMON_QUESTIONS.md**
**Change ID:** C01-C06 (all)
**Update Required:**
- [ ] Add FAQ entries for common Q3 2023 questions
  - "Why do some borrowers have high risk even though their credit score is good?" → Answer about null handling
  - "Why is the reserve different from last month?" → Answer about loss rate averaging
  - "What are the new weighted scenario columns?" → Answer about C04
  - "Why can't a reserve exceed the loan balance?" → Answer about LGD cap
  - "Why did the dashboard tab name change?" → Answer about C06
- [ ] Link to detailed documentation/sessions
**Estimated Effort:** 1-2 hours
**Owner:** Yomar (PM)

---

## Update Workflow

### Phase 1: Assessment (Week 2 - April 7-11)
- [ ] Yomar (PM) reviews all documents to assess Q3 2023 impact
- [ ] Team identifies which sections need updates (use this checklist)
- [ ] Assign owners to each document update task

### Phase 2: Content Updates (Weeks 2-3 - April 7-18)
- [ ] Document owners update their assigned sections
- [ ] Use decision logs from sessions to inform writing
- [ ] Include references to portal documentation and sessions

### Phase 3: Validation (Week 3 - April 14-18)
- [ ] SMEs review updated sections for accuracy
- [ ] Cross-check against portal documentation (CECL Guide, Portal Updates, etc.)
- [ ] Preeti (QA) validates that troubleshooting issues are complete and correct

### Phase 4: Integration (Week 4 - April 21-25)
- [ ] Merge all updated documents into master versions
- [ ] Update document index (PROJECT.md) if any structure changed
- [ ] Create final consolidated "Q3 2023 Updates" summary document

---

## Validation Checklist

For each document update, verify:

- [ ] **Accuracy:** Updated information matches portal documentation
- [ ] **Consistency:** No contradictions with other documents
- [ ] **Completeness:** All Q3 2023 changes referenced in the document are addressed
- [ ] **Clarity:** New/updated content is understandable to target audience
- [ ] **References:** Cross-references to sessions, decision logs, and portal docs are correct
- [ ] **Examples:** Include examples where helpful for understanding
- [ ] **Format:** Maintains existing document style and structure
- [ ] **SME Sign-Off:** Updated content approved by relevant SME

---

## Success Criteria

**Documentation Update Complete When:**
- ✅ All 6 primary documents (1, 2, 6, 12, 9, 16) updated with Q3 2023 content
- ✅ All 3 supporting documents (3, 7, 22) updated as needed
- ✅ All updates SME-reviewed and approved
- ✅ Portal document references included in MDPA docs
- ✅ No contradictions with portal documentation
- ✅ Team can use updated docs for month-end operations
- ✅ New hires can learn from updated docs without confusion about system behavior

---

## Estimated Effort Summary

| Document | Priority | Effort (hours) | Owner | Status |
|----------|----------|----------------|-------|--------|
| 1_MDPA_PROCESS_DOCUMENTATION.md | CRITICAL | 2-3 | Yomar/Bhavani | Pending |
| 2_WORKFLOW_ARCHITECTURE.md | CRITICAL | 2-3 | Bhavani | Pending |
| 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | CRITICAL | 3-4 | Bhavani/Preeti | Pending |
| 12_TABLEAU_DASHBOARD_GLOSSARY.md | HIGH | 1-2 | Bhavani | Pending |
| 9_BUSINESS_DATA_GLOSSARY.md | HIGH | 1-2 | Yomar | Pending |
| 16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md | HIGH | 2-3 | Preeti/Yomar | Pending |
| 3_MACROS_AND_DEPENDENCIES.md | SUPPORTING | 1 | Bhavani | Pending |
| 7_MACROS_DEEP_DIVE.md | SUPPORTING | 2-3 | Bhavani | Pending |
| 22_FAQ_COMMON_QUESTIONS.md | SUPPORTING | 1-2 | Yomar | Pending |
| **TOTAL** | | **15-23** | Team | **In Progress** |

---

## Document Status Tracking

Use this section to track completion:

```
Week 2 (April 7-11):
- [ ] Doc 1 updated and SME approved
- [ ] Doc 2 updated and SME approved
- [ ] Doc 6 section 1 updated (Credit Score)

Week 3 (April 14-18):
- [ ] Doc 6 remaining sections updated and SME approved
- [ ] Doc 12 updated (new columns documented)
- [ ] Doc 9 updated (new terms defined)
- [ ] Doc 3 updated (macro notes added)

Week 4 (April 21-25):
- [ ] Doc 16 updated (new troubleshooting issues added)
- [ ] Doc 7 updated (macro deep dives)
- [ ] Doc 22 updated (FAQ additions)
- [ ] All documents consolidated and final review

Final (Before Week 6):
- [ ] All documents SME approved
- [ ] Portal documentation cross-references verified
- [ ] No contradictions identified
- [ ] Ready for team use in operations
```

---

**Prepared by:** Claude Code agent (Portal Content Analysis)
**Date:** 2026-03-23
**Deadline for Completion:** 2026-05-31
**Knowledge Transfer Sessions Covering Updates:** 1A, 1B, 2A-4C (all 14 sessions reference Q3 2023 changes)
