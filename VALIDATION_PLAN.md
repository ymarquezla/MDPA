# MDPA Documentation Validation Plan

**Duration:** 4 Weeks (Mon 3/24 - Fri 4/18/2026)
**Subject Matter Experts:** John Wagner, Chris Lindsay
**Session Format:** Two 1-hour sessions per SME per week
**Weekly Schedule:** Monday & Wednesday (1 hr each SME)
**Total Available Hours:** 16 hours (2 hrs/week × 2 SMEs × 4 weeks)

---

## End-to-End MDPA Process Flow (The 7 W's)

**Complete process from customer file submission through dashboard delivery**

### WHO

| Role | Responsibility | Timing |
|---|---|---|
| **Credit Union Client** | Submits source data files (portfolio, charge-offs, RE valuations) | Daily/weekly uploads |
| **Alteryx Scheduler** | Triggers automated workflow execution | Per schedule (typically nightly) |
| **MDPA Workflow** | Processes data through 7-stage pipeline | Runtime: ~2.5 hours |
| **Loan Analytics Team** | Monitors execution, reviews QA reports, distributes outputs | Post-execution |
| **Business Users** | Accesses client files, QA reports, Tableau dashboards | Immediately after completion |
| **Compliance/Audit** | Reviews archive files and audit trail | Monthly/as-needed |

---

### WHAT

**The Complete Process Breakdown**

#### Stage 1: DATA INGESTION & VALIDATION
**What Happens:**
- Client source files retrieved from designated locations
- File format validation (CSV/Excel format correct?)
- Field structure validation (all expected columns present?)
- Row count verification (compare to previous period ±10%)
- Data type validation (dates are dates, currency is numeric, etc.)

**Key Files:**
- Input: Loan Portfolio Master, Charge-Off Data, RE Valuations, Credit Bureau data
- Output: Validated dataset, error log

**Macros Involved:** Contingent File Input (8x), CReW_EnsureFields (8x)

---

#### Stage 2: DATA CLEANSING & STANDARDIZATION
**What Happens:**
- Whitespace trimming from text fields
- Date format standardization (all → YYYY-MM-DD)
- Currency format standardization (remove $, commas → decimal)
- Text casing standardization
- NULL/empty value handling
- Remove special characters where appropriate
- Remove duplicate records (if any)

**Quality Gate:** >99% of records pass cleansing rules

**Macros Involved:** Cleanse.yxmc (2x), 2020_Date_Converter.yxmc (5x)

---

#### Stage 3: DATA ENRICHMENT & CALCULATIONS
**What Happens:**
- Calculate loan age (TODAY - Origination_Date)
- Calculate months to maturity
- Calculate payment history score (from delinquency status)
- Calculate risk score (composite of credit score, DTI, age)
- Append TransUnion credit bureau data
- Calculate LTV ratio (Current_Balance / Collateral_Value)
- Generate unique loan identifiers
- Append calculated flags (recovery status, at-risk indicators)

**Quality Gate:** All calculations complete; no null values in required fields

**Macros Involved:** 2020_Date_Converter (5x), Generate Unique ID (1x), CReW_EnsureFields (8x)

---

#### Stage 4: DATA MATCHING & CONSOLIDATION
**What Happens:**
- Match charge-off records to active portfolio (by Loan_ID, fallback to Member_ID)
- Append charge-off and recovery details to portfolio records
- Match real estate valuations to collateral properties
- Consolidate prior period data for comparison
- Handle unmatched records (exception queue)
- Aggregate multiple source records into single loan record
- Union current period + prior period data

**Quality Gate:** >98% match rate; exceptions logged for manual review

**Macros Involved:**
- Append Charge Offs and Matching (1x) - Most Complex
- Append RE Values (1x)
- Union Subset Prior Period (1x)
- Preliminary Client File Match (1x)

---

#### Stage 5: COMPLIANCE & PII MASKING
**What Happens:**
- Apply regulatory filters (exclude loans not subject to disclosure)
- Mask PII (member names, SSN, addresses) using standardized formats
- Mask credit scores (FICO Only masking applied)
- Create compliance flags (CRA reporting status, Fair Lending flags)
- Validate against regulatory requirements
- Create audit trail (user, timestamp, action)
- Generate compliance exception report

**Quality Gate:** 100% of client-facing records have PII masked; 100% regulatory filters applied

**Macros Involved:**
- TransUnion Mask_FICO Only_v2 (1x)
- Ethnic & Gender ID (1x)

---

#### Stage 6: OUTPUT PREPARATION & FORMATTING
**What Happens:**
- Format for CLIENT DELIVERABLE (select specific fields, Excel format, name formatting)
- Format for QA REPORT (aggregate metrics, summary tables, quality scores)
- Format for TABLEAU EXTRACT (denormalize to star schema, calculate aggregates)
- Format for ARCHIVE (compress with metadata, checksums, data dictionary)
- Format for SUMMARY METRICS (calculate KPIs for executive dashboard)
- Apply final validation rules
- Generate processing log
- Calculate data quality score

**Quality Gate:** >99% data quality score; all outputs validated

**Macros Involved:**
- Tableau New Macro (1x)
- Tableau New Macro Dropped (1x)
- Tableau New Macro Securities (1x)
- Last Name Comma First Name Cleaner_v2 (1x)
- Dropped Records Prep (1x)
- Auto Value Append (1x)

---

#### Stage 7: DELIVERY & PUBLICATION
**What Happens:**
- Publish CLIENT FILE to designated delivery location (SFTP, share drive, etc.)
- Publish QA REPORT to internal team
- Publish TABLEAU EXTRACT to analytics server (dashboard refresh triggered)
- Archive all files (inputs, processing log, outputs) with checksums
- Generate completion notification (email alerts)
- Send alerts if any exceptions/errors
- Update audit trail

**Quality Gate:** All outputs successfully delivered; confirmation received

**Macros Involved:**
- 2020_Publish2Server (1x)
- 2020_PublishDropped2Server (1x)
- 2020_PublishSecurities2Server (1x)
- CReW_ParallelBlockUntilDone (1x) - Synchronization

---

### WHEN

| Step | Timing | Frequency | SLA |
|---|---|---|---|
| **Client submits files** | Daily/weekly schedule | Recurring | EOD previous day |
| **Workflow triggered** | Nightly (10 PM) or per schedule | Automated | Consistent time |
| **Stage 1-3 Complete** | First 30-45 minutes | Per run | < 45 min target |
| **Stage 4-5 Complete** | Next 45-60 minutes | Per run | < 60 min target |
| **Stage 6-7 Complete** | Final 15-30 minutes | Per run | < 30 min target |
| **All outputs delivered** | 2.5 hours from start | Per run | < 2.5 hours total |
| **Client accesses files** | Morning (can start immediately) | Daily | Same-day delivery |
| **Tableau dashboard updates** | Automatic upon file delivery | Daily | Real-time refresh |
| **Monthly archive stored** | Post-execution last day of month | Monthly | 5+ years retention |

---

### WHERE

| Component | Location | Storage Type | Access |
|---|---|---|---|
| **Input Files** | `/data/mdpa/input/` | Shared drive or SFTP | Credit Union uploads |
| **Processing Workflow** | Alteryx Server Gallery | Alteryx Platform | Scheduled execution |
| **Processing Logs** | `/logs/mdpa/` | Server disk | QA team access |
| **Client Deliverable** | `/delivery/client_files/` | SFTP or secure share | Client downloads |
| **QA Reports** | `/reports/qa/` | Shared drive | Internal team only |
| **Tableau Extract** | Tableau Server (MDPA data source) | Tableau Platform | Dashboard consumers |
| **Archive Files** | `/archive/mdpa/YYYY-MM/` | Compressed backup | Compliance access |
| **Audit Trail** | Database log tables | SQL database | Compliance review |

---

### WHY

| Business Driver | Impact | Success Measure |
|---|---|---|
| **Regulatory Compliance** | CRA reporting, Fair Lending analysis, capital adequacy | 100% regulatory data accuracy |
| **Member Service** | Accurate loan tracking, transparent communication | <0.1% data discrepancy with member statements |
| **Risk Management** | Early delinquency detection, loss prediction | >95% delinquency rate accuracy |
| **Portfolio Valuation** | Balance sheet reporting, financial accuracy | Reconcile to GL within $0.01 |
| **Collection Effectiveness** | Identify charge-offs, track recoveries | >20% recovery success rate |
| **Operational Visibility** | Daily dashboard of portfolio health | <2.5 hour delivery SLA |
| **Compliance Documentation** | Audit trail, data lineage, governance | Zero missing audit records |

---

### WHICH

**Which Data Sources Are Used At Each Stage**

| Stage | Input Sources | Data Used |
|---|---|---|
| **1. Ingestion** | Portfolio, Charge-Off, RE, Credit Bureau | All raw files |
| **2. Cleansing** | All sources | Raw data fields |
| **3. Enrichment** | Portfolio + Credit Bureau | Scores, DTI, dates |
| **4. Consolidation** | Charge-Off + RE + Portfolio | Matching keys, detail data |
| **5. Compliance** | Portfolio + Names/Addresses | PII, regulatory status |
| **6. Output Prep** | Consolidated enriched data | Selected fields per deliverable |
| **7. Delivery** | Final outputs + logs | All processed/archived data |

---

### HOW

**Detailed Step-by-Step Workflow**

**Pre-Execution:**
```
1. Client prepares source files (Portfolio Master, Charge-Offs, RE Valuations)
2. Client uploads to designated SFTP/share location
3. Files validated for format (CSV/Excel)
4. Scheduler detects files (or manual trigger)
```

**Execution Phase:**
```
STAGE 1 (0:00-0:20): INGESTION & VALIDATION
├─ Read portfolio file
├─ Read charge-off file
├─ Read RE valuation file
├─ Read credit bureau file
├─ Validate schemas
├─ Check for duplicates
└─ Create consolidated staging table

STAGE 2 (0:20-0:35): CLEANSING & STANDARDIZATION
├─ Trim whitespace
├─ Standardize date formats
├─ Standardize currency formats
├─ Handle nulls
├─ Remove special characters
└─ Quality check (99%+ pass)

STAGE 3 (0:35-0:50): ENRICHMENT & CALCULATIONS
├─ Calculate Age_of_Loan_Days
├─ Calculate Months_to_Maturity
├─ Calculate Risk_Score
├─ Append credit bureau data
├─ Calculate LTV_Ratio
├─ Generate unique IDs
└─ Quality check (no null calcs)

STAGE 4 (0:50-1:35): MATCHING & CONSOLIDATION
├─ Match charge-offs to portfolio
│  ├─ Primary: Loan_ID
│  ├─ Fallback: Member_ID + Loan_Type
│  └─ Fallback: Loan_Amount + Date (fuzzy)
├─ Append real estate valuations
├─ Consolidate prior period
├─ Union current + prior
├─ Handle exceptions
└─ Quality check (98%+ match rate)

STAGE 5 (1:35-1:50): COMPLIANCE & MASKING
├─ Apply regulatory filters
├─ Mask member names
├─ Mask SSNs
├─ Mask addresses
├─ Mask FICO scores
├─ Create audit trail
└─ Quality check (100% compliance)

STAGE 6 (1:50-2:15): OUTPUT PREPARATION
├─ CLIENT FILE
│  ├─ Select fields (Loan_ID, Balance, Status, Risk_Level)
│  ├─ Apply name formatting
│  └─ Round to 2 decimals
├─ QA REPORT
│  ├─ Aggregate by loan_type, status
│  ├─ Calculate summary metrics
│  └─ Generate charts
├─ TABLEAU EXTRACT
│  ├─ Denormalize to star schema
│  ├─ Create dimensions
│  └─ Pre-aggregate for performance
├─ ARCHIVE
│  └─ Compress inputs + logs + outputs
└─ SUMMARY METRICS
   └─ Calculate 15+ KPIs for board

STAGE 7 (2:15-2:30): DELIVERY & PUBLICATION
├─ Publish CLIENT FILE to SFTP
├─ Publish QA REPORT to share
├─ Publish TABLEAU EXTRACT to server
├─ Archive all files with checksums
├─ Send completion notification
└─ Update audit trail
```

**Post-Execution:**
```
1. Business users download client file
2. QA team reviews report
3. Dashboards refresh automatically
4. Compliance archives files
5. Alerts sent if any errors
6. Monthly process repeats
```

---

### Validation Focus Points

**Week 1 Validation:** Confirm Stages 1-3 sequence and logic
**Week 2 Validation:** Confirm Stages 4-5 data matching and compliance
**Week 3 Validation:** Confirm output formatting (Stages 6-7)
**Week 4 Validation:** Confirm overall end-to-end flow accuracy

---

## Week 1: Foundation & Architecture Review

**Objective:** Validate high-level workflow design, process flow accuracy, and overall architecture

**Topics:** MDPA purpose, 7-stage workflow, architecture overview, basic metrics

---

### WK1-1: Monday 3/24 - John Wagner (1 hour)
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

### WK1-2: Wednesday 3/27 - Chris Lindsay (1 hour)
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

### WK2-1: Monday 3/31 - John Wagner (1 hour)
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

### WK2-2: Wednesday 4/3 - Chris Lindsay (1 hour)
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

### WK3-1: Monday 4/7 - John Wagner (1 hour)
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

### WK3-2: Wednesday 4/10 - Chris Lindsay (1 hour)
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

### WK4-1: Monday 4/14 - John Wagner (1 hour)
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

### WK4-2: Wednesday 4/17 - Chris Lindsay (1 hour)
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
- **WK1-1 (Mon 3/24, John, 1 hr):** MDPA purpose, 7-stage workflow
- **WK1-2 (Wed 3/27, Chris, 1 hr):** Architecture details, tool inventory

### Week 2 (Mar 31 - Apr 3)
- **WK2-1 (Mon 3/31, John, 1 hr):** Input sources, field inventory
- **WK2-2 (Wed 4/3, Chris, 1 hr):** Field transformations, 7-stage mappings

### Week 3 (Apr 7-10)
- **WK3-1 (Mon 4/7, John, 1 hr):** Macro inventory, usage frequency
- **WK3-2 (Wed 4/10, Chris, 1 hr):** Macro nesting, complexity ranking

### Week 4 (Apr 14-17)
- **WK4-1 (Mon 4/14, John, 1 hr):** Validation rules, quality gates
- **WK4-2 (Wed 4/17, Chris, 1 hr):** Error handling, alerts, final sign-off

---

## Documentation Validation Checklist

### WK1-1 & WK1-2: Foundation ✓
- [ ] MDPA purpose & scope validated
- [ ] 7-stage workflow verified
- [ ] 300+ tools breakdown confirmed
- [ ] Data flow sequence approved
- [ ] No critical gaps identified
- [ ] Architecture sign-off obtained

### WK2-1 & WK2-2: Data ✓
- [ ] All 4 input data sources confirmed
- [ ] Field inventory complete & accurate
- [ ] 7-stage transformation chain validated
- [ ] Output field mappings correct
- [ ] Data quality baseline established
- [ ] Field mapping sign-off obtained

### WK3-1 & WK3-2: Macros ✓
- [ ] 23 unique macros identified & documented
- [ ] Macro usage frequency accurate
- [ ] Macro nesting analysis validated
- [ ] Macro complexity ranking confirmed
- [ ] Dependencies identified
- [ ] Macro sign-off obtained

### WK4-1 & WK4-2: QA & Sign-Off ✓
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
