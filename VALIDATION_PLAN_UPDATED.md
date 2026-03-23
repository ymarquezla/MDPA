# MDPA Knowledge Transfer & Validation Plan (UPDATED)
## Integrated with Portal Documentation Analysis

**Duration:** 6 Weeks (FIRM DEADLINE - Hard stop 2026-05-31)
**Update Date:** 2026-03-23 (Portal content integration)
**Primary Objective:** Knowledge transfer from domain experts to Sprintendo team for product takeover
**Secondary Objective:** Validate MDPA documentation accuracy + integrate portal content gaps
**Subject Matter Experts (Knowledge Sources):** John Wagner, Chris Lindsay
**Sprintendo Team (Knowledge Recipients):** Venkat (TPA), Bhavani (BI), Preeti (QA), Yomar (PM), Mwafaq (SM)

---

## Critical Changes From Original Plan

**Original Plan:** 2 generic sessions/week × 6 weeks = 12 sessions
**Updated Plan:** 2-3 focused sessions/week × 6 weeks = 14 detailed sessions

**Major Additions:**
- System Changes Orientation (Week 1) - Q3 2023 updates from portal
- Fair Lending Deep Dive (Week 2) - CRITICAL undocumented feature
- CECL Methodology Deep Dive (Weeks 3-4) - 159 pages of formulas from portal

**Portal Content Integration:**
- All sessions reference applicable portal documents
- Decision logs capture "why" behind design decisions (not in MDPA docs)
- Role-specific runbooks created from portal content

---

## Detailed 14-Session Schedule

### WEEK 1: System Changes & Architecture (4 hours SME time)

**Session 1A: Q3 2023 System Changes & Updates Orientation** ⭐ CRITICAL
- **Duration:** 90 minutes
- **Date:** Week of 2026-03-31 (TBD based on SME availability)
- **Attendees:** Entire Sprintendo team (Venkat, Bhavani, Preeti, Mwafaq, Yomar)
- **Location:** TBD - Video conference or in-person
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - PORTAL_UPDATES_Q3_2023.pdf
  - PORTAL_TTADATA_VISION_V2022.1_RELEASE_NOTES.pdf
  - PORTAL_CONTENT_GAPS.md (System Changes section)

**Content Outline:**
1. **PD Null Credit Score Handling (Aug 30, 2023)** (20 min)
   - Previous: Null/empty → exception, no PD assigned
   - New: Null/empty → treated as "0" credit score
   - Impact: Affects reserve calculations for portfolios with incomplete credit data
   - Team Discussion: How does this affect our current loan files?

2. **Gross vs. Net Charge-Offs (July 2022)** (20 min)
   - Previous: Net charge-offs (charge-offs minus recoveries)
   - New: Gross charge-offs; recovery managed via Recovery Factor parameter
   - Impact: BREAKING CHANGE - affects reserve methodology
   - Team Discussion: Are we currently using gross or net? Need verification.

3. **Vintage Loss Rate Averaging (July 2022)** (15 min)
   - Previous: Excluded years with zero charge-offs
   - New: Includes zero charge-off years (more conservative)
   - Example: (0.02 + 0.08 + 0)/3 = 0.033 vs. old (0.02 + 0.08)/2 = 0.05
   - Impact: Smaller portfolio segments affected; more conservative reserves

4. **Dashboard Reorganization (Aug 28-31, 2023)** (15 min)
   - Renamed dashboards (PD_CECL → PD Visual Model)
   - Reordered to prioritize user inputs
   - Vintage Pooling dashboard: Added historical loss rate table
   - Impact: UI/navigation changes, no calculation impact

5. **Weighted Scenarios for Vintage (New Feature)** (10 min)
   - New columns: Weighted Expected Losses (Vintage), Weighted Scenario Adjustment
   - Now applies stress scenarios to Vintage method (not just PD)
   - Impact: Enhanced modeling capabilities

6. **MountainView Model Validation** (5 min)
   - Independent validator: MountainView Risk & Analytics
   - Status: Started Sept 2023, target completion EOY 2023
   - Action Item: Verify current status; recertification may be needed

**Session Deliverable:**
- ✅ Team consensus on which changes are already deployed
- ✅ Identification of gaps in current workflow vs. portal updates
- ✅ Decision Log: "Why were these changes made?" (capture from SMEs)
- ✅ Action items for Docs 1, 2, 6, 16 updates

---

**Session 1B: MDPA Process Overview & Macro Architecture**
- **Duration:** 90 minutes
- **Date:** Week of 2026-03-31
- **Attendees:** Venkat (TPA), Yomar (PM), Mwafaq (SM)
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - MDPA Docs 1-2 (Process, Architecture)
  - MDPA Doc 3 (Macros)
  - MDPA Doc 24 (Macro Inventory)

**Content Outline:**
1. **End-to-End MDPA Workflow Overview** (30 min)
   - 7-stage pipeline (ingestion, cleansing, enrichment, calculations, aggregation, output, publication)
   - Critical data flows and checkpoints
   - Where Fair Lending and CECL calculations fit

2. **Macro Dependencies & Execution Order** (30 min)
   - 20 unique macros, 41 instances
   - Hard-coded path issues (REM-001 to REM-015 from GAP_ANALYSIS)
   - Execution sequence and dependencies
   - CReW library requirements

3. **Month-End Processing Timeline** (20 min)
   - Scheduling, triggering, monitoring
   - Error handling and retry procedures
   - Output publication & distribution

4. **Critical Decision Points & Error Handling** (10 min)
   - Data quality gates
   - Calculation validations
   - Where to intervene if issues arise

**Session Deliverable:**
- ✅ Venkat understands full workflow sequence
- ✅ Yomar & Mwafaq understand month-end orchestration
- ✅ Decision Log: "Why is this execution order critical?"

---

### WEEK 2: Undocumented Features & CECL Overview (5 hours SME time)

**Session 2A: Fair Lending Analysis Deep Dive** ⭐⭐ CRITICAL UNDOCUMENTED FEATURE
- **Duration:** 120 minutes
- **Date:** Week of 2026-04-07
- **Attendees:** Venkat (TPA), Bhavani (BI), Preeti (QA), Yomar (PM)
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - PORTAL_FAIR_LENDING_USER_GUIDE.pdf
  - MDPA Doc 14 (Securities Collateral Guide)
  - GAP_ANALYSIS.md (G01-001)

**Content Outline:**
1. **Fair Lending Regulatory Framework** (15 min)
   - ECOA, FHA, CRA compliance requirements
   - Disparate treatment, disparate impact, redlining concepts
   - Why Fair Lending analysis matters to MDPA

2. **BISG Ethnicity Prediction Algorithm** (30 min)
   - Bayesian Improved Surname Geocoding (CFPB-approved)
   - 5-step process: surname → metro → census → Bayesian → final probability
   - Confidence scoring methodology
   - "Exclude From Model" logic for unpredictable names

3. **Fair Lending Dashboards & Outputs** (30 min)
   - Rate Profile dashboard (compare rates by ethnicity/credit tier)
   - Charge-off analysis by ethnicity
   - Redlining geographic analysis (zip code mapping)
   - Rate variance detection (bps thresholds)
   - Dealer-level analysis (indirect auto loans)

4. **Data Governance & Compliance** (30 min)
   - Data quality requirements (name, zip code, FICO, rates)
   - Sample adequacy rules (minimum loan count by ethnicity)
   - Documentation requirements for audit trail
   - When to escalate findings to compliance

5. **Integration with MDPA Outputs** (15 min)
   - How Fair Lending analysis feeds into monthly reporting
   - Connection to loan-level details
   - Regulatory reporting implications

**Session Deliverable:**
- ✅ Fair Lending Technical Runbook (Bhavani + Venkat to co-author post-session)
- ✅ Walkthrough of BISG algorithm with example data
- ✅ Fair Lending dashboard navigation guide
- ✅ Decision Log: "Why BISG? What are its limitations?"
- ✅ Preeti creates test cases for Fair Lending validation

---

**Session 2B: CECL Methodologies Overview & Framework**
- **Duration:** 90 minutes
- **Date:** Week of 2026-04-07
- **Attendees:** Bhavani (BI), Preeti (QA), Yomar (PM)
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - PORTAL_CECL_USER_GUIDE.pdf (Chapters 1-2)
  - MDPA Docs 9-11 (Glossary, Logical Model, Physical Model)

**Content Outline:**
1. **CECL Methodologies Comparison** (45 min)
   - Vintage: Historical loss pooling (when to use, requirements)
   - Vintage Q: Vintage + qualitative adjustments (when to use)
   - PD: Probability of Default (when to use, industry tables)
   - WARM: Call Report-based (when to use, for whom)
   - Decision framework: Which method for which portfolio segment?

2. **Management's Role in CECL** (20 min)
   - Methodology selection responsibility
   - Parameter ownership (Recovery Factor, Qualitative Adjustment, LTV Assumptions)
   - Scenario likelihood assignment
   - Audit trail & documentation requirements

3. **Dashboard Structure Overview** (15 min)
   - Parameter Assignments dashboard
   - Weighted Expected Losses dashboard
   - CECL Summary dashboard
   - Peer Group to Allowance Group reconciliation

4. **Portal Guide as Reference** (10 min)
   - How to use PORTAL_CECL_USER_GUIDE.pdf
   - Where to find formulas, examples, FAQ
   - Updating MDPA Docs 9-11 with portal content

**Session Deliverable:**
- ✅ CECL Methodology Decision Tree (Bhavani to create)
- ✅ Parameter Assignment Runbook
- ✅ Decision Log: "Why these four methods? What's the trade-off?"

---

### WEEK 3: CECL Calculations Deep Dive - Vintage & PD (5 hours SME time)

**Session 3A: Vintage Expected Loss Curves & Calculation**
- **Duration:** 120 minutes
- **Date:** Week of 2026-04-14
- **Attendees:** Bhavani (BI), Preeti (QA), Venkat (TPA)
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - PORTAL_CECL_USER_GUIDE.pdf (Chapter 3 - Vintage section)
  - MDPA Doc 6 (Field Mapping)
  - GAP_ANALYSIS.md (G01-004)

**Content Outline:**
1. **Historical Loss Rate Pooling** (30 min)
   - Step 1 formula: Loss Rate = Charge-offs by [Allowance Group, Origination Year, Years Until Charge-Off] ÷ Original Balances
   - Data filtering rules (report dates 2023+, vintage 2013+, exclude incomplete years)
   - Grouping dimensions and why they matter

2. **Average Charge-Off Rate Calculation** (20 min)
   - Step 2: Simple average of historical loss rates by [Years Until Charge-Off] segment
   - Example walkthrough: Year 1-7 rates from actual portfolio data
   - Pro-rata allocation for partially-aged loans (June 30 origination at March 31 report)

3. **Expected Loss Curves (Year 1-7)** (20 min)
   - Step 3 formula: Expected Losses = Average Loss Rate × Original Balance
   - Vintage Expected Losses = Sum(Year 1-7)
   - Why 7 years? Rationale (loan life, revolving patterns, real estate appreciation)

4. **Vintage Adjustment (Credit Quality)** (30 min)
   - Scope: Originated past 5 years + charge-offs past 36 months
   - Risk tier adjustment by FICO Grade (A+/A/B/C/D/E)
   - Control logic: Riskier tiers can't show better adjustment than lower-risk tiers
   - Result: Vintage Adjustment Flag (First Value, Prior ±5%, Actual Increase/Decrease, Same)

5. **Calculation Verification & Testing** (20 min)
   - How to manually validate Vintage Expected Losses
   - Common calculation errors to watch for
   - Testing with sample datasets

**Session Deliverable:**
- ✅ Vintage Calculation Walkthrough Document (step-by-step with example)
- ✅ Vintage Expected Losses Validation Checklist (Preeti)
- ✅ Test dataset with known results (for Preeti QA validation)
- ✅ Decision Log: "Why pro-rata allocation? Why 7 years?"

---

**Session 3B: Probability of Default (PD) Methodology**
- **Duration:** 120 minutes
- **Date:** Week of 2026-04-14
- **Attendees:** Bhavani (BI), Preeti (QA), Venkat (TPA)
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - PORTAL_CECL_USER_GUIDE.pdf (Chapter 3 - PD section)
  - PORTAL_UPDATES_Q3_2023.pdf (PD null credit score change)
  - MDPA Doc 6 (Field Mapping)

**Content Outline:**
1. **PD Calculation Basics** (20 min)
   - Formula: PD = Gross Charge-Offs ÷ Number of Originations
   - Industry PD tables by: Peer Group + Original FICO Tier + Months on Book
   - FICO Tiers: Below 300, 300-600, 601-660, 661-720, 721-780, 781+
   - Months on Book: Months from origination to report date

2. **Null Credit Score Handling (Q3 2023 Change)** (20 min)
   - Previous logic: Exception, no PD assigned
   - New logic: Treat as "0" credit score
   - Impact on reserve calculations
   - Validation dashboard for identifying affected loans
   - Improvement opportunity: Better credit score collection

3. **Loss Given Default (LGD) Formula** (30 min)
   - LGD = MAX(0, MIN(Current Balance, -(Collateral Value - Superior Mortgages - Current Balance)))
   - Collateral valuation adjustments:
     - Auto/Secured: 90% × (wholesale value OR LTV estimate) - $1,000
     - Real Estate: 90% × (property value OR LTV estimate) - ($10,000 + 6% commission)
     - Share-secured: Current balance + available credit
   - Superior mortgage hierarchy (senior claims take priority)

4. **Industry-Specific PD Adjustments** (15 min)
   - Indirect Auto Loans: +9% to base auto PD
   - Business Loans: SBA data source, reduced by ~75% (credit unions more conservative)
   - Past Due >59 days OR TDR: PD = 100% (collateral-dependent)

5. **PD vs. Vintage Trade-offs** (15 min)
   - When PD is better choice (no loss experience, inconsistent charge-offs)
   - When Vintage is better choice (homogenous portfolio, adequate history)
   - Methodology switching considerations

6. **Validation & Testing** (20 min)
   - How to verify PD calculations
   - Collateral hierarchy testing
   - Superior mortgage logic validation

**Session Deliverable:**
- ✅ PD Calculation Walkthrough (step-by-step with examples)
- ✅ LGD Collateral Valuation Guide (Venkat-specific for collateral tracking)
- ✅ Industry Adjustment Reference Table
- ✅ PD Validation Test Suite (Preeti)
- ✅ Decision Log: "Why different PD for indirect auto? Why reduce SBA rates?"

---

### WEEK 4: Scenarios, Parameters & Quality Assurance (5 hours SME time)

**Session 4A: Weighted Scenarios & Forecast Period Methodology**
- **Duration:** 90 minutes
- **Date:** Week of 2026-04-21
- **Attendees:** Bhavani (BI), Preeti (QA)
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - PORTAL_CECL_USER_GUIDE.pdf (Chapter 4 - Scenario Weighting)
  - TTAData v2022.1 Release Notes (Weighted Scenarios for Vintage)

**Content Outline:**
1. **Weighted Expected Losses Dashboard Structure** (15 min)
   - Up to 5 scenarios: Scenario 1 (No Economic Change base), Scenarios 2-5 (Forecast)
   - Likelihood % assignment (must total 100%)
   - Stressor inputs: Unemployment, Real Estate, Auto

2. **Stressor Application & Calculation** (30 min)
   - Unemployment Stressor: 1-point increase = 100 bps to PD (conservative assumption)
   - Real Estate Stressor: % decrease to real estate collateral values
   - Auto Stressor: % decrease to auto values
   - Formula: Stress-Adjusted PD × Stress-Adjusted LGD = Scenario Loss

3. **Forecast Period vs. Reversion Period** (20 min)
   - Forecast Period: Weighted by Scenario 2-5 likelihoods
   - Reversion Period: Weighted by "No Economic Change" likelihood
   - Example: 20% Scenario 2 + 80% No Change = 20% loan life in forecast, revert to historical
   - Why this matters: longer horizons for real estate, shorter for autos

4. **Weighted Scenario Adjustment** (15 min)
   - Formula: (PD Expected Losses - Expected Net Losses) / Current Balance
   - New feature (July 2022): Now applies to Vintage methodology too (not just PD)
   - Management override capability

5. **Scenario Reasonableness Testing** (10 min)
   - How to validate scenario assumptions
   - Economic data sources (unemployment, real estate indices from Metro Reports)
   - Documentation requirements for audit trail

**Session Deliverable:**
- ✅ Scenario Weighting Decision Log (Bhavani to document assumptions)
- ✅ Forecast Period Calculation Guide
- ✅ Stressor Testing Procedures (Preeti)
- ✅ Decision Log: "Why these stressor magnitudes? Where do we get economic data?"

---

**Session 4B: Unfunded Commitments, LTV Assumptions & Special Cases**
- **Duration:** 90 minutes
- **Date:** Week of 2026-04-21
- **Attendees:** Bhavani (BI), Preeti (QA), Venkat (TPA)
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - PORTAL_CECL_USER_GUIDE.pdf (Chapter 5 - Unfunded Commitments)
  - GAP_ANALYSIS.md (LTV & collateral gaps)

**Content Outline:**
1. **Unfunded Commitments Treatment** (25 min)
   - Vintage: Original balance includes total available credit (intrinsic)
   - PD: Unfunded Reserve = Available Credit × CCF × PD × LGD
   - WARM: Call Report unfunded + credit equivalent amounts
   - On vs. off-balance-sheet liability distinction
   - CECL requirement: Must record unless unconditionally cancellable

2. **LTV Assumptions & Collateral Valuation** (25 min)
   - Real Estate LTV Estimate (used when no property values uploaded)
   - Auto LTV Estimate (used when no vehicle values uploaded)
   - Fallback logic (when to use estimates vs. actual valuations)
   - Historical LTV ranges by product (reference data)

3. **Minimum Reserve Floor** (15 min)
   - Optional parameter: Loan segment level floor
   - Applied as: Max(calculated reserve, current balance × minimum %)
   - PD methodology: .0005 (.05%) minimum auto-included
   - When is minimum reserve needed?

4. **Qualitative Adjustments** (15 min)
   - Optional parameter: Decimal format (e.g., 0.05 for 5% adjustment)
   - Qualifying factors:
     - Changes in lending policies/procedures
     - Changes in staff experience/depth
     - Changes in loan review system
     - External factors deemed relevant by management
   - Documentation requirements for audit

5. **Loss Given Default Superior Mortgages Cap** (10 min)
   - Bug fix (July 2022): Reserve capped at current balance (prevents overstatement)
   - When does this matter? (stress scenarios for subordinate positions)
   - Testing for superior mortgage logic

**Session Deliverable:**
- ✅ Unfunded Commitment Treatment Decision Log
- ✅ LTV Assumption Reference Guide (by product)
- ✅ Qualitative Adjustment Documentation Template
- ✅ Superior Mortgage Test Cases (Preeti)
- ✅ Decision Log: "When are qualitative adjustments appropriate?"

---

**Session 4C: Data Quality & QA Procedures (Updated for Q3 2023)**
- **Duration:** 90 minutes
- **Date:** Week of 2026-04-21
- **Attendees:** Preeti (QA), Venkat (TPA), Yomar (PM)
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - MDPA Doc 19 (Data Quality)
  - PORTAL_CECL_USER_GUIDE.pdf (Loan-level data requirements)
  - PORTAL_UPDATES_Q3_2023.pdf (Null credit score change)

**Content Outline:**
1. **Loan-Level Data Requirements** (20 min)
   - Unique ID, Current & Original Balance
   - Origination & Maturity Date, Credit Score
   - Charge-off Date & Amount, Loan Status
   - Days Past Due, TDR Flag
   - Collateral Values (optional; LTV fallback)

2. **CECL-Specific Data Quality Gates** (25 min)
   - Charge-off date & amount accuracy (gross vs. net)
   - Collateral value completeness (real estate, auto, share-secured)
   - Credit score missing data (null handling per Q3 2023 change)
   - Origination date accuracy (for vintage cohort placement)
   - Term/Maturity consistency

3. **Validation Rules & Error Handling** (20 min)
   - Row count reasonableness checks
   - Balance total reconciliation
   - Charge-off period lookback (2013+ vintage, past 36 months CO)
   - Missing data flags and thresholds

4. **Month-End Processing & Validation Sequence** (15 min)
   - Data ingestion validation (format, completeness)
   - Calculation validation (check for anomalies post-CECL)
   - Output validation (reserve reasonableness, peer group reconciliation)
   - Publication sign-off

5. **Q3 2023 Changes Impact on QA** (10 min)
   - Null credit score as "0" validation
   - Gross vs. net charge-off verification
   - Weighted scenarios test cases

**Session Deliverable:**
- ✅ Updated QA Runbook (incorporating Q3 2023 changes)
- ✅ CECL Data Quality Validation Suite (test cases)
- ✅ Month-End QA Checklist
- ✅ Null Credit Score Test Dataset (specific for PD validation)
- ✅ Gross vs. Net Charge-Off Verification Procedure

---

### WEEK 5: Integration, Reporting & Operations (2.5 hours SME time)

**Session 5A: Dashboard Ecosystem & Tableau Integration**
- **Duration:** 90 minutes
- **Date:** Week of 2026-04-28
- **Attendees:** Bhavani (BI), Yomar (PM)
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - MDPA Docs 12-13 (Tableau Glossary, Output Lineage)
  - PORTAL_UPDATES_Q3_2023.pdf (Dashboard reorganization)
  - MDPA Doc 8 (README with dashboard navigation)

**Content Outline:**
1. **Tableau Dashboard Glossary Review** (25 min)
   - 23+ tabs and their purposes
   - Metric definitions (how calculated, when updated)
   - Dashboard refresh cycles
   - User access & permissions

2. **Output-to-Dashboard Lineage** (20 min)
   - How MDPA workflow outputs feed Tableau
   - Data source architecture
   - Refresh timing & dependencies
   - Troubleshooting data staleness

3. **CECL Summary Dashboard Navigation** (20 min)
   - Post-Q3 2023 reorganization walkthrough
   - Parameter Assignments positioning
   - Method selection workflow
   - Reserve adequacy checks

4. **Peer Group to Allowance Group Reconciliation** (15 min)
   - New dashboard (post-Q3 2023)
   - Why reconciliation is needed
   - How to interpret variances
   - Escalation procedures

5. **Dashboard Change Management** (10 min)
   - How to handle future updates
   - Testing new dashboards before production
   - Communication with stakeholders

**Session Deliverable:**
- ✅ Updated Dashboard Navigation Guide (Bhavani)
- ✅ Metric Definition Reference (tied to MDPA calculations)
- ✅ Dashboard Refresh Dependency Map
- ✅ Reconciliation Procedure (Allowance Group vs. Peer Group)

---

**Session 5B: Month-End Execution & Troubleshooting (Updated for Q3 2023)**
- **Duration:** 120 minutes
- **Date:** Week of 2026-04-28
- **Attendees:** Venkat (TPA), Preeti (QA), Mwafaq (SM), Yomar (PM)
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - MDPA Doc 16 (Troubleshooting Guide)
  - PORTAL_CONTENT_GAPS.md (Section on Q3 2023 changes)
  - Month-end checklist (to be created from this session)

**Content Outline:**
1. **Month-End Execution Checklist** (30 min)
   - Pre-execution: Data availability, parameter verification
   - Execution: Workflow triggering, monitoring, error handling
   - Post-execution: Output validation, dashboard refresh confirmation
   - Sign-off and escalation procedures

2. **Common Issues & Resolution Steps** (40 min)
   - Data quality issues (missing credit scores, charge-off timing)
   - PD null credit score handling (new Q3 2023 issue)
   - Gross vs. net charge-off discrepancies (new Q3 2023 issue)
   - Charge-off amount validation failures
   - Vintage adjustment flag interpretation
   - Loss Given Default cap at current balance (new Q3 2023 issue)
   - Reserve reasonableness outliers
   - Dashboard refresh failures

3. **Troubleshooting Decision Tree** (20 min)
   - Flow chart for identifying root cause
   - When to escalate to SME (vs. fixing locally)
   - Documentation for audit trail

4. **Q3 2023 Changes Impact on Month-End** (20 min)
   - PD null credit score new validation rules
   - Gross vs. net charge-off reconciliation
   - Weighted scenario testing
   - Vintage loss rate averaging verification

5. **Team Communication & Escalation** (10 min)
   - How to report issues to John Wagner / Chris Lindsay
   - Client communication templates
   - Regulatory reporting implications

**Session Deliverable:**
- ✅ Month-End Operational Runbook (step-by-step procedures)
- ✅ Troubleshooting Decision Tree (Venkat & Preeti)
- ✅ Common Issues Resolution Guide
- ✅ Escalation Contact List & Procedures
- ✅ Q3 2023 Changes Addendum to Troubleshooting Guide

---

### WEEK 6: Knowledge Handoff & Independence Validation (1.5 hours SME time)

**Session 6A: Decision Log Review & Product History**
- **Duration:** 90 minutes
- **Date:** Week of 2026-05-05
- **Attendees:** Entire Sprintendo team (Venkat, Bhavani, Preeti, Mwafaq, Yomar)
- **SME Lead:** John Wagner or Chris Lindsay
- **Reference Materials:**
  - All Decision Logs created in Sessions 1A-5B
  - MDPA Docs 1-24 (complete reference)

**Content Outline:**
1. **Decision Log Review** (60 min)
   - Why Fair Lending uses BISG methodology (not alternative methods)
   - Why CECL has 4 methodologies (Vintage, Vintage Q, PD, WARM)
   - Why 7-year lookback for Vintage (not 10 or 5)
   - Why gross charge-offs (not net) - policy shift July 2022
   - Why Q3 2023 changes were made (null credit score, weighted scenarios)
   - Trade-offs considered and rejected (capture alternative approaches SMEs explored)

2. **Product History Context** (20 min)
   - How MDPA evolved (previous versions, why current design)
   - Regulatory drivers (CECL adoption, fair lending focus)
   - Client feedback integration
   - Future roadmap (if any)

3. **Complete Product Playbook Draft** (10 min)
   - Review of draft created from Sessions 1-5
   - Gaps to fill post-handoff
   - Schedule for finalization

**Session Deliverable:**
- ✅ Complete Decision Log (compiled from all sessions)
- ✅ Product Playbook Draft (for team reference post-handoff)
- ✅ Historical Context Document (why decisions were made)
- ✅ Alternative Approaches Considered (capture rejected options)

---

**Session 6B: Independence Validation & Certification**
- **Duration:** 120 minutes
- **Date:** Week of 2026-05-05
- **Attendees:** Entire Sprintendo team (Venkat, Bhavani, Preeti, Mwafaq, Yomar)
- **SME Lead:** John Wagner or Chris Lindsay (as observers/evaluators)
- **Format:** Hands-on exercises, scenario-based troubleshooting, Q&A

**Content Outline:**
1. **Role-Specific Independence Testing** (60 min)
   - **Venkat (TPA):** Architecture walkthrough, macro dependencies, workflow orchestration
     - Exercise: Explain month-end execution flow without notes
     - Exercise: Troubleshoot a macro path error independently
   - **Bhavani (BI):** CECL methodology, dashboard integration, scenario weighting
     - Exercise: Select methodology for hypothetical portfolio segment
     - Exercise: Explain Weighted Expected Losses calculation
   - **Preeti (QA):** Data quality validation, test case development, troubleshooting
     - Exercise: Create test cases for null credit score handling
     - Exercise: Identify data quality issues in sample dataset
   - **Yomar (PM):** Portfolio overview, stakeholder communication, roadmap
     - Exercise: Explain product to hypothetical client
     - Exercise: Respond to executive sponsor question about Q3 2023 changes
   - **Mwafaq (SM):** Coordination, timeline management, decision documentation
     - Exercise: Create action items from a scenario-based meeting

2. **Scenario-Based Troubleshooting** (30 min)
   - Scenario 1: Charge-off data doesn't reconcile to expected range
   - Scenario 2: Fair Lending rate variance flag appears
   - Scenario 3: Dashboard doesn't refresh after month-end run
   - Scenario 4: Credit union questions why reserve increased with lower charge-offs
   - Exercise: Team works through scenarios, identifies root causes, escalation paths

3. **Collective Knowledge Test** (15 min)
   - Team quiz on key formulas, methodologies, decision points
   - Portal guide reference check (can they find answers?)
   - Fair Lending algorithm walkthrough
   - CECL calculation verification

4. **Knowledge Transfer Sign-Off** (15 min)
   - Each team member states their confidence level (1-10) on independence
   - SME assessment of readiness
   - Identify any remaining gaps for post-handoff study
   - Discussion of ongoing support from SMEs (post-May 31)

**Session Deliverable:**
- ✅ Independence Certification (team signed off by SMEs)
- ✅ Remaining Knowledge Gaps (if any) for self-study
- ✅ Post-Handoff Support Plan (How to reach SMEs after 5/31?)
- ✅ Competency Assessment Report
- ✅ Knowledge Transfer Completion Certificate

---

## Knowledge Transfer Artifacts & Deliverables

**Produced During Sessions (Team Deliverables):**
1. Decision Logs (all sessions)
2. Fair Lending Technical Runbook (Session 2A)
3. CECL Methodology Decision Tree (Session 2B)
4. Vintage Calculation Walkthrough (Session 3A)
5. PD Calculation Walkthrough (Session 3B)
6. Scenario Weighting Decision Log (Session 4A)
7. Updated QA Runbook (Session 4C)
8. Dashboard Navigation Guide (Session 5A)
9. Month-End Operational Runbook (Session 5B)
10. Product Playbook (Sessions 6A-6B)

**Pre-Session Preparation (Provide to SMEs):**
- PORTAL_CONTENT_GAPS.md (context for session topics)
- WEEK_1_SESSION_OUTLINES.md (detailed content)
- DECISION_LOG_TEMPLATE.md (how to document decisions)

**Post-Session Archive (Add to GitHub):**
- Decision Log (complete)
- All runbooks and guides
- Test cases and validation procedures
- Session notes (if recording)

---

## Success Criteria - Updated

✅ **Knowledge Transfer Complete When:**
- [ ] Fair Lending algorithm walkthrough documented and validated by team
- [ ] CECL calculation formulas verified against portal guide for all 4 methodologies
- [ ] All Q3 2023 system changes operationalized in workflows
- [ ] Each team member explains their module independently (pass certification)
- [ ] Month-end procedures executed successfully with new team leadership
- [ ] SMEs confirm team ready for independent operations
- [ ] MDPA Docs 1, 2, 6, 16 updated with Q3 2023 changes and portal content
- [ ] GitHub repository updated with all artifacts and decision logs

---

## Timeline & Deadlines

**Firm Deadline:** May 31, 2026 (9 weeks from portal integration date 2026-03-23)

**Critical Milestones:**
- **Week 1 (03/31-04/04):** System changes orientation + architecture (foundational)
- **Week 2 (04/07-04/11):** Fair Lending + CECL overview (frameworks established)
- **Weeks 3-4 (04/14-04/25):** Deep dives on Vintage, PD, scenarios, QA (technical mastery)
- **Week 5 (04/28-05/02):** Integration & operations (practical readiness)
- **Week 6 (05/05-05/09):** Decision review & independence validation (certification)
- **May 31:** Sprintendo takes full ownership; post-handoff support plan in place

---

**Plan Status:** ✅ Ready for execution
**Portal Content Integration:** ✅ Complete (all gaps identified)
**Team Assignments:** ✅ Complete (roles clear)
**Next Action:** Schedule Week 1 sessions (coordinate with SME availability)

