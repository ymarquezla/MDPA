# Week 1 Session Outlines - Ready-to-Execute Materials

**Preparation Status:** Ready for SME execution
**Target Audience:** Sprintendo team + domain experts
**Format:** Detailed talking points, presentation outline, materials checklist
**Dates:** March 31 - April 4, 2026

---

## Session 1A: Q3 2023 System Changes & Updates Orientation

**Duration:** 90 minutes
**SME Lead:** John Wagner (Product Owner) or domain expert
**Attendees:** Entire Sprintendo team (Venkat, Bhavani, Preeti, Yomar, Mwafaq)
**Objective:** Bring team up to speed on critical system changes released Aug-Sept 2023 that are not yet documented in MDPA workflow materials
**Reference Materials:**
- PORTAL_UPDATES_Q3_2023.pdf (primary)
- PORTAL_TTADATA_VISION_V2022.1_RELEASE_NOTES.pdf (supplementary)
- MDPA current docs for comparison

### Pre-Session Preparation (SME - 30 min)
- [ ] Print/share PORTAL_UPDATES_Q3_2023.pdf with session link
- [ ] Prepare before/after comparison slides (old procedure vs. new procedure)
- [ ] Identify which Q3 2023 changes impact MDPA workflow directly
- [ ] Note any breaking changes vs. additive features

### Session Structure (90 min)

#### Part 1: Context & Timeline (15 min)
**Talking Points:**
- MDPA documentation finalized March 18, 2026
- Portal released Q3 2023 updates (August-September 2023 - actual 7-month gap)
- **Why this matters:** Team has been trained on outdated procedures; risk of operational errors
- Current status: Are Q3 2023 changes deployed in production? Partial? Pending?

**Key Message:** "We're synchronizing team knowledge with what's actually running in production today."

#### Part 2: Change #1 - PD Null Credit Score Handling (15 min)
**Portal Source:** PORTAL_UPDATES_Q3_2023.pdf, Section "PD Null Credit Score" (Aug 30, 2023)

**Talking Points:**
- **Before:** Null/empty credit scores caused exceptions; workflow errors
- **After:** Null/empty credit scores now treated as "0" score
- **Impact on MDPA:** Affects Probability of Default (PD) calculation methodology
- **Team responsibility:**
  - Data validation must check for nulls
  - QA must verify null handling in test cases
  - Troubleshooting: if PD reserve looks wrong, check credit score nulls

**Slide Outline:**
```
NULL CREDIT SCORE HANDLING (Q3 2023 Change)
┌─────────────────┬──────────────────────┬─────────────────┐
│ Scenario        │ Before (Aug 2023)    │ After (Aug 2023)│
├─────────────────┼──────────────────────┼─────────────────┤
│ Null score      │ Exception/Error      │ Treated as "0"  │
│ Impact on PD    │ Workflow stopped     │ PD calculated   │
│ Affected MDPA   │ All PD-based methods │ All PD-based    │
├─────────────────┴──────────────────────┴─────────────────┤
│ Why: Regulatory requirement - all borrowers must have     │
│ a PD; default score of 0 represents worst credit quality │
└──────────────────────────────────────────────────────────┘
```

**Team Discussion (5 min):**
- Q: Who validates credit score inputs? (Answer: Preeti/QA)
- Q: Which MDPA macros touch credit score data? (Answer: PD methodology macro)
- Action Item: Add null credit score check to QA procedures

#### Part 3: Change #2 - Gross vs. Net Charge-Offs (15 min)
**Portal Source:** PORTAL_UPDATES_Q3_2023.pdf, Section "Gross vs. Net Charge-Offs" (July 2022)

**Talking Points:**
- **Before:** Charge-off amounts were NET (after recoveries applied)
- **After:** Charge-off amounts are GROSS (before recoveries)
- **Recovery handling:** Now managed via separate "Recovery Factor" parameter
- **Impact on MDPA:** Vintage expected loss calculations use gross charge-off rates
- **Critical risk:** Team using net charge-offs when system expects gross = wrong reserve

**Slide Outline:**
```
CHARGE-OFF DATA: GROSS VS. NET (Q3 2023 Change)
───────────────────────────────────────────────
BEFORE (Outdated):
  Charge-off = $5,000 (net of $1,000 recovery)
  Reserve calculation uses $5,000

AFTER (Current):
  Charge-off = $6,000 (gross, before recovery)
  Recovery Factor = 1.0 - ($1,000 / $6,000) = 0.833
  Reserve calculation uses $6,000 × Loss_Rate × Recovery_Factor
```

**Team Discussion (5 min):**
- Q: Where do we get charge-off data from? (Answer: Source system A, B, C)
- Q: How do we know if it's gross or net? (Answer: Check source system docs)
- Action Item: Verify all MDPA data sources are providing GROSS charge-offs

#### Part 4: Change #3 - Vintage Loss Rate Averaging (10 min)
**Portal Source:** PORTAL_UPDATES_Q3_2023.pdf, Section "Vintage Loss Rate Averaging" (July 2022)

**Talking Points:**
- **Before:** Only years with charge-offs counted (e.g., 2 years with data → average of 2)
- **After:** All years in lookback period included, even years with zero charge-offs (more conservative)
- **Impact:** Results in lower average loss rate (more conservative reserve)
- **Example impact:**
  - Old: (0.02 + 0.08) / 2 = 5.0%
  - New: (0.02 + 0.08 + 0.00) / 3 = 3.3%
  - Effect: Reserve decreases (less conservative)

**Slide Outline:**
```
VINTAGE LOSS RATE AVERAGING (Q3 2023 Change)
──────────────────────────────────────────────
Old Method (Outdated):
  Year 1: 2.0% charge-off rate
  Year 2: 8.0% charge-off rate
  Year 3: NO DATA (year omitted from average)
  Average = (2.0 + 8.0) / 2 = 5.0%

New Method (Current):
  Year 1: 2.0% charge-off rate
  Year 2: 8.0% charge-off rate
  Year 3: 0.0% charge-off rate (included!)
  Average = (2.0 + 8.0 + 0.0) / 3 = 3.3%

Impact: Reserve decreases because we're averaging in a low year.
```

**Team Discussion (5 min):**
- Q: Could this affect our reserve validation? (Answer: Yes - expected loss curves should show ~3.3% not 5%)
- Action Item: Update QA test cases to reflect new averaging method

#### Part 5: Change #4 - Weighted Scenarios & New Columns (10 min)
**Portal Source:** PORTAL_UPDATES_Q3_2023.pdf, Section "Weighted Scenarios for Vintage" (New Feature)

**Talking Points:**
- **New Feature:** Dashboard now shows "Weighted Expected Losses (Vintage)" and "Weighted Scenario Adjustment" columns
- **Purpose:** Apply PD stress scenarios to Vintage methodology (previously PD-method only)
- **What it does:** Takes Vintage expected loss, applies stress scenario, shows impact
- **Team impact:** New dashboard columns; documentation in dashboard glossary needs update

**Slide Outline:**
```
WEIGHTED SCENARIOS FOR VINTAGE (New Q3 2023 Feature)
──────────────────────────────────────────────────────
Vintage Expected Loss = 3.3% (from loss rate averaging)
PD Stress Scenario (e.g., "Recession") = 1.5x multiplier
Weighted Expected Loss = 3.3% × 1.5 = 4.95%

Dashboard Impact:
  New Column 1: Weighted Expected Losses (Vintage)
  New Column 2: Weighted Scenario Adjustment
```

**Team Discussion (5 min):**
- Q: Do our dashboards show these new columns? (Answer: Yes, if portal version is current)
- Action Item: Update Tableau dashboard glossary (Doc 12) with new columns

#### Part 6: Change #5 - Loss Given Default (LGD) Superior Mortgages (10 min)
**Portal Source:** PORTAL_UPDATES_Q3_2023.pdf, Section "Loss Given Default Superior Mortgages" (Bug Fix)

**Talking Points:**
- **Issue:** LGD reserve in stress scenarios was overstated (could exceed current balance)
- **Fix:** Reserve capped at current balance (prevents unrealistic high stress reserves)
- **Impact:** More realistic stress scenario reserves
- **Team impact:** Minimal - automatic in calculation, but good to know why reserves don't exceed balance

**Slide Outline:**
```
LGD CAP: SUPERIOR MORTGAGES (Q3 2023 Bug Fix)
───────────────────────────────────────────────
Problem (Outdated):
  Current Balance: $100,000
  LGD Calculation in Recession Stress: $150,000 (overstated!)

Solution (Current):
  Current Balance: $100,000
  LGD Calculation in Recession Stress: $150,000 (before cap)
  Capped Reserve = MIN($150,000, $100,000) = $100,000
```

**Team Discussion (3 min):**
- Q: Should reserves ever exceed the current balance? (Answer: No - that would be impossible)
- Action Item: Add this to troubleshooting guide (if reserves look too high, check this cap)

#### Part 7: Dashboard Reorganization (5 min)
**Portal Source:** PORTAL_UPDATES_Q3_2023.pdf, Section "Dashboard Reorganization" (Aug 28-31, 2023)

**Talking Points:**
- **Change:** Renamed "[Probability of Default_CECL]" → "[PD Visual Model]"
- **Reorganization:** Dashboard tabs reordered to prioritize user inputs (parameters, assumptions) before outputs
- **Team impact:** Documentation (Tableau glossary) needs renaming; client training may be needed

**Slide Outline:**
```
DASHBOARD REORGANIZATION (Aug 2023)
────────────────────────────────────
Old Tab Name: [Probability of Default_CECL]
New Tab Name: [PD Visual Model]

Tab Order Change: User Inputs First → Outputs Second
  Before: Output dashboards listed first
  After: Parameter/assumption dashboards (CECL Parameters, Assumptions)
         listed first for transparency
```

#### Part 8: System Changes Impact Summary (5 min)
**Slide Outline:**
```
Q3 2023 CHANGES: TEAM IMPACT SUMMARY
─────────────────────────────────────
┌──────────────────────────┬─────────────────────────────────┐
│ Change                   │ Team Owner & Action             │
├──────────────────────────┼─────────────────────────────────┤
│ PD Null Credit Score     │ Preeti (QA): Add null check     │
│ Gross vs. Net Charge-Off │ Venkat (TPA): Verify data src   │
│ Vintage Loss Averaging   │ Bhavani (BI): Update QA tests   │
│ Weighted Scenarios       │ Bhavani (BI): Update glossary   │
│ LGD Cap Fix              │ Preeti (QA): Add to troubleshoot│
│ Dashboard Reorganization │ Yomar (PM): Client comms        │
└──────────────────────────┴─────────────────────────────────┘
```

### Post-Session Deliverables
- [ ] **Decision Log 1A:** "Why MDPA procedures were updated for Q3 2023 system changes; which changes are most critical to operations"
- [ ] **Updated Checklist:** MDPA_DOCS_UPDATE_CHECKLIST.md with specific changes for each doc
- [ ] **Team Assignments:** Each team member knows their role in operationalizing changes

### Success Criteria for Session 1A
- [ ] Team understands all 6 Q3 2023 changes
- [ ] Each team member can explain their part in the change
- [ ] Action items assigned and documented
- [ ] Alignment on which changes are already deployed vs. pending

---

## Session 1B: MDPA Process Overview & Macro Architecture

**Duration:** 90 minutes
**SME Lead:** John Wagner or Chris Lindsay (Technical Architecture Owner)
**Attendees:** Venkat (TPA), Yomar (PM), Mwafaq (Scrum Master)
**Objective:** Deep dive into MDPA workflow stages, macro dependencies, and critical decision points for new team ownership
**Reference Materials:**
- 1_MDPA_PROCESS_DOCUMENTATION.md (primary)
- 2_WORKFLOW_ARCHITECTURE.md (primary)
- 3_MACROS_AND_DEPENDENCIES.md (reference)
- 7_MACROS_DEEP_DIVE.md (detailed reference)

### Pre-Session Preparation (SME - 45 min)
- [ ] Prepare workflow diagram (7 stages with macro callouts)
- [ ] Prepare dependency matrix (macro A calls macro B calls macro C)
- [ ] Prepare timeline diagram (when each stage runs, sequential vs. parallel)
- [ ] Identify critical decision points (where workflow branches based on data conditions)

### Session Structure (90 min)

#### Part 1: MDPA Mission & Workflow Overview (10 min)
**Talking Points:**
- **Purpose:** Monthly loan portfolio analysis for credit unions - regulatory compliance, peer group benchmarking, reserve calculation
- **Frequency:** Monthly execution (when? - specific date in month)
- **Output:** 23+ Tableau dashboards + data exports
- **Team responsibility:** Month-end execution, error handling, client support

**Slide Outline:**
```
MDPA MONTHLY WORKFLOW: 7 STAGES
──────────────────────────────────────────────
Stage 1: Data Extraction      (Extract loan & collateral data)
Stage 2: Data Transformation  (Clean, validate, enrich)
Stage 3: CECL Calculation     (Fair Lending, Vintage/PD/WARM)
Stage 4: Scenario Modeling    (Apply stress scenarios)
Stage 5: Aggregation          (Pool-level summaries)
Stage 6: Dashboard Output     (Tableau refresh)
Stage 7: Validation & Delivery (QA sign-off, client delivery)
```

**Key Message:** "Each stage has owner, error handling, and rollback procedures."

#### Part 2: Stage 1 - Data Extraction (12 min)
**Reference:** MDPA_PROCESS_DOCUMENTATION.md, Section "Stage 1"

**Talking Points:**
- **What:** Extract loan portfolio data from 3 source systems (System A, B, C)
- **Macros involved:** Extract_Loans, Extract_Collateral, Extract_Transactions
- **Data volume:** ~50K-100K loans per portfolio
- **Error handling:** What happens if a source system is down?
- **Owner:** Venkat (TPA) - data quality responsibility

**Slide Outline:**
```
STAGE 1: DATA EXTRACTION
────────────────────────────
Source Systems (Parallel Extract):
  ├─ System A: Loan Master File
  │   └─ Extract_Loans macro → 40K loans
  ├─ System B: Collateral Registry
  │   └─ Extract_Collateral macro → 45K collateral records
  └─ System C: Transaction History
      └─ Extract_Transactions macro → 200K transactions

Timeline: 10 minutes (parallel), runs at 8:00 AM on month-end date
Error Handling:
  - If System A down: Hold and retry (5 attempts, 10-min intervals)
  - If System B down: Use last-month collateral as fallback
  - If System C down: Use historical transaction cache
```

**Team Discussion (5 min):**
- Q: Who monitors extraction health? (Answer: Venkat + monitoring dashboard)
- Q: What's the SLA if a system is slow? (Answer: Must complete by 1 PM for pipeline to finish by 5 PM)
- Action Item: Document extraction timeouts and fallback procedures

#### Part 3: Stage 2 - Data Transformation (15 min)
**Reference:** MDPA_PROCESS_DOCUMENTATION.md, Section "Stage 2"

**Talking Points:**
- **What:** Validate, clean, enrich extracted data before calculation
- **Macros involved:** Validate_Loans, Clean_Collateral, Enrich_Demographics
- **Key validations:** Loan amounts, rates, collateral values, customer demographics
- **Output:** Cleaned dataset ready for CECL calculation
- **Owner:** Preeti (QA) - validation rules responsibility

**Slide Outline:**
```
STAGE 2: DATA TRANSFORMATION
─────────────────────────────────
┌─────────────────────────────────────────────────────┐
│ Validate_Loans (Duration: 3 min)                    │
│ ├─ Check loan amount > 0                            │
│ ├─ Check rate between 0-25%                         │
│ ├─ Check origination date valid                     │
│ └─ Reject records failing validation → Error Report │
├─────────────────────────────────────────────────────┤
│ Clean_Collateral (Duration: 2 min)                  │
│ ├─ Standardize collateral types (MORTGAGE, VEHICLE) │
│ ├─ Validate LTV >= 0 and <= 150%                    │
│ ├─ Apply collateral value floor (min $1,000)        │
│ └─ Map to valuation hierarchy                       │
├─────────────────────────────────────────────────────┤
│ Enrich_Demographics (Duration: 2 min)               │
│ ├─ BISG algorithm: predict ethnicity/gender        │
│ ├─ Assign credit score buckets                      │
│ ├─ Add Q3 2023 null credit score handling           │
│ └─ Flag missing demographics                        │
└─────────────────────────────────────────────────────┘
Total: 7 minutes (sequential)
```

**Key Q3 2023 Impact:**
- Null credit score handling now applied in Enrich_Demographics
- Gross charge-off validation (verify no net adjustments)
- Fair Lending data validation (demographics required for BISG)

**Team Discussion (5 min):**
- Q: What % of loans typically fail validation? (Answer: <2%; >5% triggers escalation)
- Q: What does Preeti do if validation fails? (Answer: Log errors, notify team, may rollback)
- Action Item: Create validation runbook with thresholds and escalation

#### Part 4: Stage 3 - CECL Calculation (20 min)
**Reference:** MDPA_PROCESS_DOCUMENTATION.md, Section "Stage 3"; CECL_USER_GUIDE.pdf (portal)

**Talking Points:**
- **What:** Calculate allowance for credit losses using 4 CECL methodologies
- **Four methods:** Vintage (historical), Vintage Q (adjusted), PD (probability of default), WARM (Call Report)
- **Selection:** Methodology depends on loan segment and portfolio characteristics
- **Macro:** Calculate_CECL_Allowance (largest, most complex macro)
- **Duration:** 15 minutes (longest stage)
- **Owner:** Bhavani (BI) - calculation logic responsibility

**Slide Outline:**
```
STAGE 3: CECL CALCULATION - 4 METHODOLOGIES
────────────────────────────────────────────────

VINTAGE METHOD (Historical Loss Pooling):
  ├─ Group loans by origination year
  ├─ Calculate historical loss rate: (Gross Charge-Offs / Avg Portfolio) × 100
  │   [Q3 2023 UPDATE: Includes zero charge-off years in average]
  ├─ Lookup expected loss curve (5-year lookback)
  ├─ Apply pro-rata allocation by month-of-origin
  └─ Calculate Reserve = Loan Balance × Loss Rate × (1 - Recovery Factor)

  Example (New Method):
    Year 1 Charge-Off Rate: 2.0%
    Year 2 Charge-Off Rate: 8.0%
    Year 3 Charge-Off Rate: 0.0%
    Average = (2.0 + 8.0 + 0.0) / 3 = 3.3%  ← [Q3 2023 change]

PD METHOD (Probability of Default):
  ├─ Use borrower credit score to look up Probability of Default table
  │   [Q3 2023 UPDATE: Null credit scores treated as "0" score]
  ├─ Calculate Loss Given Default from collateral value
  │   [Q3 2023 UPDATE: LGD capped at current balance]
  ├─ Reserve = Loan Balance × PD × LGD
  └─ Apply forecast period stress adjustment

VINTAGE Q METHOD (Adjusted Vintage):
  ├─ Start with Vintage methodology
  ├─ Apply qualitative adjustment for current portfolio conditions
  ├─ Adjustment factors: economic conditions, credit trends, management changes
  └─ Reserve = Vintage Reserve × (1 + Qualitative Adjustment)

WARM METHOD (Call Report Method):
  ├─ Use WARM classification from Call Report
  ├─ Apply fixed loss rates by classification
  ├─ Reserve = Loan Balance × Classification-Specific Loss Rate
  └─ Simplest method, least data-intensive
```

**Key Decision Point:** "Which method to use?"
```
Decision Tree:
  Is this the largest credit union in its peer group?
    YES → Use PD method (more sophisticated)
    NO  → Check portfolio complexity
      Complex (many loan types) → Use Vintage Q
      Simple (few types) → Use WARM (most conservative)
```

**Team Discussion (10 min):**
- Q: How do we decide which CECL method to use? (Answer: Portfolio characteristics + regulatory guidance)
- Q: What if a loan is missing credit score (now treated as "0")? (Answer: Marked in validation; PD recalculated with score=0)
- Q: Can we switch methods mid-year? (Answer: No - must be consistent for comparability)
- Action Item: Create methodology decision table (portfolio size/type → recommended method)

#### Part 5: Stage 4 - Scenario Modeling (10 min)
**Reference:** MDPA_PROCESS_DOCUMENTATION.md, Section "Stage 4"

**Talking Points:**
- **What:** Apply stress scenarios (Base, Recession, Growth) to expected losses
- **Scenarios:** Base case (normal conditions), Recession (-3% revenue impact), Growth (+2% revenue recovery)
- **Q3 2023 NEW:** Weighted scenarios now apply to Vintage method too (previously PD only)
- **Duration:** 3 minutes
- **Output:** Scenario-adjusted reserves for stress testing

**Slide Outline:**
```
STAGE 4: SCENARIO MODELING
──────────────────────────────
Base Case Reserve (CECL): $5,000,000

Apply Scenario Multipliers:
  ├─ RECESSION: 1.5x multiplier
  │   └─ Scenario Reserve = $5,000,000 × 1.5 = $7,500,000
  │       [Interpretation: In recession, expect 50% more losses]
  ├─ GROWTH: 0.8x multiplier
  │   └─ Scenario Reserve = $5,000,000 × 0.8 = $4,000,000
  │       [Interpretation: In growth period, losses decrease]
  └─ BASE: 1.0x multiplier
      └─ Scenario Reserve = $5,000,000 × 1.0 = $5,000,000

[NEW Q3 2023]: Weighted Scenarios (Vintage methodology)
  Weighted Loss = Vintage Loss × Weighted Scenario Factor
  Dashboard shows both scenario-specific and weighted-average results
```

**Team Discussion (5 min):**
- Q: Why do we need scenarios? (Answer: Regulatory requirement for stress testing)
- Q: Are scenario multipliers fixed or configurable? (Answer: Quarterly review; configured as parameters)
- Action Item: Document scenario parameter management process

#### Part 6: Stage 5 - Aggregation (8 min)
**Reference:** MDPA_PROCESS_DOCUMENTATION.md, Section "Stage 5"

**Talking Points:**
- **What:** Roll up loan-level reserves to portfolio, segment, and cohort levels
- **Aggregations:** Total portfolio reserve, by loan type, by vintage, by collateral type
- **Macro:** Aggregate_By_Segments (parallel aggregation)
- **Duration:** 2 minutes
- **Output:** Portfolio-level metrics for dashboards

**Slide Outline:**
```
STAGE 5: AGGREGATION
──────────────────────
Loan-Level Reserves → Portfolio-Level Summaries

├─ Total Portfolio Reserve: Sum all loan reserves
├─ By Loan Type: Mortgage, Auto, Personal
├─ By Vintage: Grouped by origination year
├─ By Collateral: Secured, Unsecured
└─ By Geographic Region: State, Metro Area

Result: Portfolio summary table (7 rows × 30+ metric columns)
```

**Team Discussion (3 min):**
- Q: What if aggregated reserve doesn't match sum of loans? (Answer: Rounding; documented tolerance ±$500)

#### Part 7: Stage 6 - Dashboard Output (8 min)
**Reference:** 12_TABLEAU_DASHBOARD_GLOSSARY.md

**Talking Points:**
- **What:** Refresh Tableau dashboards with month's calculations
- **Dashboards:** 23+ tabs covering CECL, Fair Lending, Benchmarking, Scenarios
- **Data connection:** SQL Server connection from Alteryx → Tableau data refresh
- **Duration:** 5 minutes
- **Error handling:** If refresh fails, alert BI team (Bhavani)

**Slide Outline:**
```
STAGE 6: DASHBOARD OUTPUT
────────────────────────────
Alteryx Output Tables:
  ├─ tbl_CECL_Allowance (loan-level reserves)
  ├─ tbl_Fair_Lending (ethnicity/gender predictions)
  ├─ tbl_Scenarios (scenario-adjusted reserves)
  ├─ tbl_Portfolio_Summary (aggregates)
  └─ tbl_Peer_Benchmarking (peer group comparisons)
         ↓
    SQL Server Database
         ↓
    Tableau Refresh (5 minutes)
         ↓
    23+ Dashboards Updated
```

**Team Discussion (3 min):**
- Q: Who monitors dashboard refresh? (Answer: Bhavani; failure alert goes to her)
- Action Item: Document dashboard refresh health check procedure

#### Part 8: Stage 7 - Validation & Delivery (7 min)
**Reference:** 16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md

**Talking Points:**
- **What:** QA sign-off on results before delivery to client
- **Checks:**
  - Reserve total within expected range (±10% of prior month)
  - All dashboards loaded successfully
  - No data anomalies or missing segments
- **Owner:** Preeti (QA) + Yomar (PM) for client delivery
- **Duration:** Until sign-off (typically 1 hour)

**Slide Outline:**
```
STAGE 7: VALIDATION & DELIVERY
────────────────────────────────
QA Checklist:
  ✓ Run data quality report (automated)
  ✓ Verify reserve totals against expectations
  ✓ Spot-check loan-level calculations (sample 10)
  ✓ Dashboard reconciliation (all tabs load)
  ✓ Peer benchmarking data present
  ✓ No nulls in critical fields

If All Checks Pass:
  → Yomar (PM) notifies client
  → Dashboards available for access
  → Process complete

If Any Check Fails:
  → Escalate to Venkat (TPA) or SME
  → Troubleshooting (see Stage 7 guide)
  → May require workflow restart
```

**Team Discussion (3 min):**
- Q: What's the acceptance criteria for "reserve within range"? (Answer: ±10% of prior month; documented exceptions)
- Action Item: Create QA sign-off checklist form

#### Part 9: Critical Decision Points (10 min)
**Talking Points:**
- **Decision #1 (Stage 3):** Which CECL methodology to use
  - Owner: Product team + business stakeholder
  - Impact: High (affects all subsequent calculations)
  - Change frequency: Quarterly review minimum

- **Decision #2 (Stage 4):** Scenario parameters (multipliers)
  - Owner: Risk management team
  - Impact: High (affects stress testing outcomes)
  - Change frequency: Quarterly

- **Decision #3 (Stage 2):** Collateral valuation assumptions
  - Owner: Portfolio management team
  - Impact: High (affects LGD and Vintage Q adjustments)
  - Change frequency: Annual or per market conditions

- **Decision #4 (All Stages):** Error escalation thresholds
  - Owner: Operations team
  - Impact: Medium (affects timeliness but not accuracy)
  - Change frequency: As needed

**Slide Outline:**
```
CRITICAL DECISIONS IN MDPA WORKFLOW
────────────────────────────────────
┌─────────────────────────┬──────────────┬──────────────────┐
│ Decision Point          │ Owner        │ Sign-Off Required│
├─────────────────────────┼──────────────┼──────────────────┤
│ CECL Methodology Choice │ PM + Risk    │ Yes (quarterly)  │
│ Scenario Parameters     │ Risk Mgmt    │ Yes (quarterly)  │
│ Collateral Assumptions  │ Portfolio    │ Yes (annual)     │
│ Error Thresholds        │ Operations   │ Yes (ad-hoc)     │
└─────────────────────────┴──────────────┴──────────────────┘
```

### Post-Session Deliverables
- [ ] **Decision Log 1B:** "Why each stage exists; critical decision points and who owns them"
- [ ] **Workflow Dependency Diagram:** Visual showing macro dependencies and calling sequence
- [ ] **Stage Owners Matrix:** Who is responsible for each stage, escalation contacts

### Success Criteria for Session 1B
- [ ] Attendees (Venkat, Yomar, Mwafaq) understand 7-stage workflow
- [ ] Each attendee can name their stage ownership and dependencies
- [ ] Decision points are clear and documented
- [ ] Escalation procedures are understood

---

## Session 1 Materials Checklist

### Before Week 1 Starts
- [ ] Share PORTAL_UPDATES_Q3_2023.pdf with team (link or attachment)
- [ ] Share VALIDATION_PLAN_UPDATED.md with attendees
- [ ] Confirm calendar invites for both sessions
- [ ] Prepare SME presentation materials (slides, diagrams)

### Session 1A Materials
- [ ] Q3 2023 system changes slide deck (from guidance above)
- [ ] Before/after comparison for each change
- [ ] Dependency impact matrix (which macros affected by each change)
- [ ] Decision log template (available for immediate use)

### Session 1B Materials
- [ ] 7-stage workflow diagram (Visio or graphic)
- [ ] Macro dependency graph (which macro calls which)
- [ ] Stage timeline (when each stage runs, duration, parallel vs. sequential)
- [ ] Decision point flowchart

### Post-Session Templates (Ready for Sessions 1A & 1B)
- [ ] DECISION_LOG_TEMPLATE.md (to be distributed before sessions start)

---

## Success Metrics for Week 1

**Session 1A Success:**
- ✅ Team can explain all 6 Q3 2023 changes
- ✅ Each team member knows their operational responsibility for at least one change
- ✅ Impact on MDPA workflow is documented
- ✅ Action items assigned and confirmed

**Session 1B Success:**
- ✅ Venkat, Yomar, Mwafaq understand complete workflow
- ✅ Each stage owner identified
- ✅ Macro dependencies are clear
- ✅ Decision escalation paths documented

**Overall Week 1 Outcome:**
- ✅ Team synchronized with Q3 2023 system state
- ✅ Workflow ownership assigned
- ✅ Ready for Week 2 deep dives (Fair Lending, CECL methodologies)

---

**Prepared by:** Claude Code agent
**Date:** 2026-03-23
**Status:** Ready for SME execution
