# Missing Securities Collateral - Scenarios & Impact Analysis

**Comprehensive Guide to Handling Missing, Delayed, or Rejected Securities**

**Version:** 1.0
**Last Updated:** 2026-03-18
**Purpose:** Document what happens when securities collateral is missing, delayed, or fails validation through the MDPA workflow and operational systems
**Audience:** Credit officers, risk managers, compliance, operations, collections

---

## Executive Summary

When a securities-backed loan is approved but the borrower fails to deliver the pledged securities collateral (or if securities data is missing from the workflow), it creates a **critical operational and risk issue** that must be managed immediately.

This guide covers:
- What constitutes "missing securities"
- When missing securities are detected (workflow stages)
- Immediate actions required
- Risk escalation and notifications
- Impact on loan status and compliance
- Collections and resolution procedures
- Documentation and audit trail

---

## Part 1: Types of "Missing Securities" Scenarios

### Scenario A: Borrower Failed to Pledge Securities (Operational Delay)

**Timeline:**
```
Day 0: Loan Approved
  └─ Loan terms approved with $50K loan secured by $65K in AAPL stock
  └─ Loan documents signed
  └─ Proceeds NOT yet funded

Day 1-5: Securities Transfer Pending
  └─ Borrower notified: "Deliver securities to custodian by Day 5"
  └─ Custodian account ready to receive securities
  └─ Securities NOT yet received

Day 6: DEADLINE MISSED
  └─ Securities NOT received by deadline
  └─ Loan proceeds CANNOT be funded
  └─ Status: COLLATERAL DEFICIENCY

Day 6-10: Collection Efforts
  └─ Credit officer contacts borrower: "Why weren't securities sent?"
  └─ Borrower may say:
     ├─ "I forgot / was busy"
     ├─ "My broker said the transfer would take longer"
     ├─ "I changed my mind - I want to use different collateral"
     ├─ "I don't have access to those securities anymore"
     └─ "I need the money urgently, can you fund without collateral?"

Day 11+: Resolution or Cancellation
  └─ IF securities arrive: Loan funded
  └─ IF securities don't arrive: Loan cancelled or restructured
```

### Scenario B: Securities Data Missing from MDPA Input

**Timeline:**
```
Monthly MDPA Processing:

Stage 1: Ingestion
  └─ Loan_ID 12345 loaded: Loan_Type = "Securities-Backed LOC"
  └─ Loan_Amount = $50,000
  └─ Collateral_Type = "Securities"
  └─ But: NO securities records in SECURITIES_COLLATERAL input file
     (Should have: Ticker, Quantity, Current_Price for pledged securities)

Stage 2: Cleansing & Validation
  └─ ALERT TRIGGERED: "Loan 12345 missing securities collateral data"
  └─ Validation Rule: IF Collateral_Type = "Securities" THEN Securities data required
  └─ Result: VALIDATION FAILED
  └─ Data_Quality_Flag = 'N' (REJECT)

Stage 5: Compliance
  └─ Loan excluded from normal portfolio reporting
  └─ Risk calculation SKIPPED (can't calculate LTV without collateral value)
  └─ Margin call status UNKNOWN
  └─ Concentration risk UNKNOWN

Stage 6: QA Report Alert
  └─ "1 loan with missing securities collateral data"
  └─ Exception Count increments
  └─ Email to Risk Team: "Investigate loan 12345 - no collateral data received"

RESULT: Loan flagged as EXCEPTION; operations team must investigate
```

### Scenario C: Pricing Data Not Received (Valuation Impossible)

**Timeline:**
```
Daily Securities Pricing Update:

Situation: AAPL is supposed to be valued at market close
  └─ System sends request to Yahoo Finance API
  └─ API returns ERROR: "No data available"
  └─ OR: Request times out

For All Loans Collateralized by AAPL:
  └─ Current_Unit_Price = NULL (missing)
  └─ Current_Market_Value = CANNOT CALCULATE
  └─ Collateral_Value_Net = CANNOT CALCULATE
  └─ Securities_LTV = CANNOT CALCULATE

Stage 2: Cleansing
  └─ ALERT: "Missing pricing data for AAPL (security_id 999)"
  └─ Validation Rule: IF Pricing_Update_Time > 24 hours → WARNING
  └─ IF Pricing_Update_Time > 48 hours → REJECT
  └─ Data_Quality_Flag = 'W' (WARNING) or 'N' (REJECT)

RESULT:
├─ If WARNING (1-2 days old): Record usable but flagged; risk team monitors
├─ If REJECT (>2 days old): Record excluded; LTV cannot be calculated
└─ If pricing stale/missing:
   ├─ Margin call status UNKNOWN
   ├─ Loan may be at risk but we don't know
   └─ Email to Risk Team: "AAPL pricing missing >24 hours - investigate"
```

### Scenario D: Securities Pledged but Not Yet Received at Custodian

**Timeline:**
```
Day 0: Loan Documents Signed
  └─ Securities-backed LOC approved
  └─ Borrower agrees to pledge AAPL shares
  └─ LOC is ready to be funded

Day 1-3: Transfer in Progress
  └─ Borrower initiates transfer from their broker
  └─ Transfer takes 3-5 business days (standard settlement)
  └─ Securities NOT YET at credit union's custodian

Day 4: MDPA Workflow Runs
  └─ Custodian reports: Securities NOT RECEIVED (still in transit)
  └─ Workflow input shows: AAPL shares = NOT RECEIVED
  └─ OR: Record shows: Securities_Received_Flag = 'N'

Stage 1: Ingestion
  └─ Loan_ID = 12345, Collateral_Type = "Securities"
  └─ Securities_Received = 'N' (NOT YET RECEIVED)
  └─ Current_Market_Value = $0 or NULL (not yet in custody)

Stage 2: Validation
  └─ CRITICAL ALERT: "Securities-backed loan with $0 collateral received"
  └─ Validation Rule: IF Collateral_Type = "Securities" AND Securities_Received = 'N'
                     → REJECT and ESCALATE
  └─ Data_Quality_Flag = 'N' (REJECT)

Stage 3-5: Exception Processing
  └─ Loan excluded from portfolio (missing collateral)
  └─ ALERT GENERATED: "Loan 12345 - securities collateral in transit"
  └─ Risk Team Notification: "Action required - monitor transfer status"

RESULT: Loan held in PENDING status until securities received and confirmed
```

---

## Part 2: Detection & Workflow Response

### Where Missing Securities Are Detected

```
┌─ AUTOMATED DETECTION (MDPA Workflow) ────────────────────────┐
│                                                                │
│ Stage 1: Ingestion                                             │
│  └─ Missing SECURITIES_COLLATERAL records                      │
│     └─ Loan has Collateral_Type="Securities" but NO rows       │
│        in SECURITIES_COLLATERAL table for that loan_id         │
│                                                                │
│ Stage 2: Cleansing                                             │
│  ├─ Validation Rule 1: Required Securities Data                │
│  │  └─ IF Collateral_Type = "Securities"                       │
│  │     AND Securities records = NULL/EMPTY                     │
│  │     → DATA_QUALITY_FLAG = 'N' (REJECT)                      │
│  │                                                             │
│  ├─ Validation Rule 2: Stale Pricing Data                      │
│  │  └─ IF Pricing_Update_Time > 48 hours                       │
│  │     → DATA_QUALITY_FLAG = 'N' (REJECT)                      │
│  │                                                             │
│  └─ Validation Rule 3: Securities in Custody                   │
│     └─ IF Securities_Received_Flag = 'N'                       │
│        AND Days_Since_Approval > 5                             │
│        → DATA_QUALITY_FLAG = 'N' (REJECT) + ESCALATE           │
│                                                                │
│ Stage 5: Compliance                                            │
│  └─ Loan excluded from LTV calculations                        │
│  └─ Loan excluded from margin call monitoring                  │
│  └─ Exception count increments                                 │
│  └─ Risk report includes: "X loans with missing collateral"    │
│                                                                │
│ Stage 6: Output Preparation                                    │
│  └─ QA Report: Exception Count section                         │
│     ├─ Missing collateral count                                │
│     ├─ Loan IDs affected                                       │
│     ├─ Days outstanding (how long missing)                     │
│     └─ Action Required (Yes)                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌─ MANUAL/OPERATIONAL DETECTION ───────────────────────────────┐
│                                                                │
│ Custodian Reconciliation (Daily)                               │
│  └─ Credit union receives: Account statement from custodian    │
│  └─ Shows: Which securities actually held in custody           │
│  └─ Detects: Discrepancy if securities NOT received           │
│  └─ Action: Notify loan servicer of missing collateral        │
│                                                                │
│ Loan Origination System (LOS) Review                           │
│  └─ Credit officer checks: Has collateral been received?      │
│  └─ LOS field: Securities_In_Custody_Date                      │
│  └─ If NULL/blank after deadline → ESCALATE                   │
│                                                                │
│ Borrower Communication Failure                                 │
│  └─ Borrower fails to confirm: "Securities transferred"       │
│  └─ Loan servicer emails: "Collateral status?"                │
│  └─ If no response after 2 days → ESCALATE                    │
│                                                                │
│ Loan Funding Gate                                              │
│  └─ Before funding loan proceeds:                              │
│  └─ System checks: Securities_Received_Confirmed = 'Y'        │
│  └─ If NOT: Loan funding is BLOCKED                            │
│  └─ Email sent: "Cannot fund - waiting for collateral"        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Immediate Actions & Escalation

### Stage 2: Validation Fails - Immediate Response

**What Happens Automatically:**
```
Step 1: Validation Rule Triggers
  ├─ IF Loan.Collateral_Type = "Securities"
  ├─ AND SECURITIES_COLLATERAL records = 0 (or NULL values)
  └─ THEN: Data_Quality_Flag = 'N' (REJECT)

Step 2: Record Excluded from Processing
  ├─ Loan record marked as EXCEPTION
  ├─ Skipped in downstream calculations
  ├─ NOT included in:
  │  ├─ LTV calculations
  │  ├─ Margin call monitoring
  │  ├─ Risk assessments
  │  └─ Portfolio aggregates
  └─ Result: Loan effectively "invisible" to portfolio analytics

Step 3: Alert Generated
  ├─ ALERT_TYPE = "MISSING_COLLATERAL"
  ├─ SEVERITY = "HIGH" (must be resolved)
  ├─ TO = Risk Team, Operations Team
  ├─ MESSAGE = "Loan 12345: Securities collateral data missing"
  ├─ ACTION_REQUIRED = "Y"
  ├─ DAYS_OUTSTANDING = [calculated]
  └─ LINK = "Review loan details / contact borrower"

Step 4: Exception Tracked
  ├─ Exception_Count increments in QA Report
  ├─ Exception_List in Stage 6 output
  ├─ Dashboard flag: Loan status = "EXCEPTION - MISSING COLLATERAL"
  └─ Escalated to: Compliance, Risk, Operations managers

Step 5: Daily Monitoring
  ├─ Every MDPA cycle checks: Has collateral arrived?
  ├─ If still missing: Alert repeats
  ├─ DAYS_OUTSTANDING increments each cycle
  └─ After X days: CRITICAL escalation to management
```

### Stage 6: QA Report Alert Details

**QA Report Output:**
```
SECTION: DATA QUALITY & EXCEPTIONS

Exception Count: 3
┌──────────────────────────────────────────────────────────────┐
│ EXCEPTION DETAIL: Missing Securities Collateral              │
├──────────────────────────────────────────────────────────────┤
│ Loan_ID       | Member_ID | Loan_Type           | Days Outstanding
│ 12345         | 54321     | Securities-Backed   | 7 days
│ 12346         | 54322     | Securities-Backed   | 3 days
│ 12347         | 54323     | Securities-Backed   | 1 day
├──────────────────────────────────────────────────────────────┤
│ ACTION REQUIRED: Contact borrowers - obtain collateral       │
│ SEVERITY: HIGH - Loans cannot be funded without collateral  │
│ RECOMMENDATION: Follow up within 24 hours                    │
└──────────────────────────────────────────────────────────────┘

SECTION: DATA QUALITY SCORE

Current Data_Quality_Score: 96.2%
Breakdown:
├─ Records with valid collateral: 9,997 (99.97%)
├─ Records with missing collateral: 3 (0.03%) ← PROBLEMS
└─ Overall completeness: 99.7%

Note: Missing collateral records excluded from LTV and risk calculations
```

### Email Alert Template

**Automatic Email Sent to Risk/Operations Team:**
```
SUBJECT: ⚠️ CRITICAL - Missing Securities Collateral - Action Required

TO: risk-team@creditunion.org, operations@creditunion.org
FROM: MDPA_Workflow_Alerts@creditunion.org
DATE: [Processing Date]
URGENCY: HIGH

────────────────────────────────────────────────────────────────

ALERT: Missing Securities Collateral Data Detected

NUMBER OF AFFECTED LOANS: 3

AFFECTED LOANS:
┌─────────────────────────────────────────────────────────────┐
│ Loan_ID | Member Name        | Amount | Days Since Approval │
├─────────────────────────────────────────────────────────────┤
│ 12345   | John Smith         | $50,000| 7 days             │
│ 12346   | Jane Doe           | $75,000| 3 days             │
│ 12347   | ABC Corporation    | $100,00| 1 day              │
└─────────────────────────────────────────────────────────────┘

ISSUE:
  └─ Loan approved as "Securities-Backed" but no securities pledged
  └─ Loan proceeds CANNOT be funded without collateral
  └─ Loan is in PENDING status - waiting for collateral delivery

WORKFLOW STATUS:
  ├─ Validation: FAILED (missing required collateral data)
  ├─ LTV Calculation: SKIPPED (no collateral to value)
  ├─ Portfolio Reporting: EXCLUDED (exception status)
  └─ Risk Monitoring: NOT ACTIVE (can't assess collateral risk)

REQUIRED ACTIONS:
  1. Contact borrower immediately
  2. Confirm expected delivery date of securities
  3. Verify transfer is in progress
  4. If transfer cancelled: Contact credit officer to restructure loan
  5. Update Loan_Origination_System with collateral status
  6. Confirm securities in custody by [DATE]

IF UNRESOLVED AFTER 10 DAYS:
  └─ Loan may be CANCELLED per loan agreement
  └─ Escalate to Loan Committee for decision

────────────────────────────────────────────────────────────────
Report generated: [DATE/TIME]
Processing cycle: [Month/Year]
Next check: [DATE]
```

---

## Part 4: Impact on Loan Status & Processing

### Loan Status Progression When Securities Are Missing

```
NORMAL FLOW (Collateral Received):
  └─ APPROVED → PENDING_COLLATERAL → COLLATERAL_RECEIVED → FUNDED → ACTIVE

MISSING COLLATERAL FLOW:
  └─ APPROVED → PENDING_COLLATERAL → [BLOCKED] ← COLLATERAL MISSING!
       ↓
       ├─ Day 1-5: STATUS = "PENDING_COLLATERAL_DELIVERY"
       │  └─ Loan servicer contacts borrower
       │  └─ Monitor transfer progress
       │  └─ Loan documents may need updating if different collateral needed
       │
       ├─ Day 6-10: STATUS = "COLLATERAL_OVERDUE" (Yellow flag)
       │  └─ Operations escalates to credit officer
       │  └─ Second notice sent to borrower
       │  └─ Risk team alerted
       │  └─ May begin discussing alternatives:
       │     ├─ Different collateral (house, car, etc.)
       │     ├─ Unsecured loan with higher rate
       │     ├─ Loan cancellation
       │     └─ Restructure with available securities
       │
       └─ Day 11+: STATUS = "COLLATERAL_FAILURE" (Red flag)
          └─ DECISION REQUIRED:
             ├─ OPTION A: Borrower delivers collateral → Proceed to FUNDED
             ├─ OPTION B: Borrower provides alternative collateral → Amend loan docs
             ├─ OPTION C: Convert to unsecured loan → Adjust terms & rate
             ├─ OPTION D: Borrower pays down / eliminates loan demand
             └─ OPTION E: CANCEL LOAN → Reverse approval, return application fee
```

### Impact on Loan Processing by Stage

```
┌─────────────────────────────────────────────────────────────┐
│ NORMAL LOAN (with collateral) vs MISSING COLLATERAL         │
├─────────────────────────────────────────────────────────────┤
│ STAGE          │ NORMAL                │ MISSING             │
├─────────────────────────────────────────────────────────────┤
│ Stage 1        │ Securities loaded     │ Securities = NULL   │
│ Ingestion      │ Quantity, Price, etc. │ Missing all fields  │
├─────────────────────────────────────────────────────────────┤
│ Stage 2        │ Validation PASSES     │ Validation FAILS    │
│ Cleansing      │ All checks OK         │ Required data       │
│                │                       │ missing - REJECTED  │
├─────────────────────────────────────────────────────────────┤
│ Stage 3        │ LTV calculated        │ LTV = N/A           │
│ Enrichment     │ Risk_Score calculated │ (can't calculate)   │
│                │ Margin call status OK │ Margin status = UNK │
├─────────────────────────────────────────────────────────────┤
│ Stage 4        │ Consolidated with     │ Excluded from join  │
│ Consolidation  │ loan record           │ Exception status    │
├─────────────────────────────────────────────────────────────┤
│ Stage 5        │ Included in portfolio  │ Excluded from       │
│ Compliance     │ aggregates            │ aggregates          │
│                │ Margin call monitored │ No monitoring       │
│                │ Concentration risk    │ Not calculated      │
│                │ calculated            │                     │
├─────────────────────────────────────────────────────────────┤
│ Stage 6        │ Normal output          │ Exception listed    │
│ Output Prep    │ Client file includes   │ QA Report flag:     │
│                │ loan details          │ "Missing collateral"│
│                │                       │ Excluded from       │
│                │                       │ client report       │
├─────────────────────────────────────────────────────────────┤
│ Stage 7        │ Tableau shows loan     │ Tableau shows ALERT │
│ Delivery       │ LTV, margin status OK  │ "Exception - TBD"   │
│                │ Included in portfolio  │ Not included in     │
│                │ analytics             │ portfolio analytics │
├─────────────────────────────────────────────────────────────┤
│ RESULT         │ Loan is funded        │ Loan is BLOCKED     │
│                │ Portfolio risk is     │ Portfolio risk TBD  │
│                │ monitored daily       │ Cannot be monitored │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 5: Compliance & Regulatory Implications

### Regulatory Issues When Securities Not Pledged

```
1. CONSUMER PROTECTION (TILA/RESPA)
   ├─ If loan promised as "secured" but not secured
   ├─ May violate Truth in Lending Act disclosures
   ├─ Must disclose: "Loan is UNSECURED" if collateral missing
   └─ ACTION: Borrower must consent to unsecured status or terms change

2. COLLATERAL CONTROL (RISK MANAGEMENT)
   ├─ Loan agreement requires: "Securities pledged as collateral"
   ├─ If not pledged: Loan is NOT secured as documented
   ├─ Bank has UNSECURED exposure (higher risk than approved)
   ├─ May violate internal lending standards
   └─ ACTION: Update loan status; request additional collateral or reduce amount

3. LOSS RESERVE ADEQUACY (GAAP/IFRS)
   ├─ Unsecured loan: Higher expected loss than secured
   ├─ May require HIGHER loan loss reserve
   ├─ Impact: Balance sheet loss reserve changes
   ├─ May impact: Net income, capital ratio, regulatory capital
   └─ ACTION: Accounting review; adjust reserve if needed

4. REGULATORY CAPITAL (FDIC/OCC RULES)
   ├─ Secured loan: Lower risk weight
   ├─ Unsecured loan: Higher risk weight
   ├─ May affect: Risk-weighted assets (RWA), capital ratio compliance
   ├─ If capital ratio drops below minimum: REGULATORY ISSUE
   └─ ACTION: Notify regulators if material; adjust lending limits

5. AUDIT & EXAMINATION FINDINGS
   ├─ Regulators may cite: "Collateral control deficiency"
   ├─ Issue: "Loan approved with specific collateral but collateral not obtained"
   ├─ Questions:
   │  ├─ How did this pass loan committee approval?
   │  ├─ What's the follow-up procedure?
   │  ├─ How long before resolution?
   │  └─ Is this a pattern or isolated incident?
   └─ ACTION: Strengthen approval workflow; require collateral confirmation before funding

6. CONSUMER COMPLAINT RISK
   ├─ Borrower may complain: "You told me it was a secured loan"
   ├─ If rates/terms different for unsecured: Borrower may dispute
   ├─ CFPB complaint possible
   └─ ACTION: Ensure clear communication about loan status change

7. LOAN LOSS PROVISION (IF DEFAULT)
   ├─ If loan unsecured and borrower defaults:
   ├─ Recovery rate = ~25% (vs. 70%+ for securities-backed)
   ├─ Loss = 75% of balance (vs. 30% for secured)
   ├─ May have inadequate reserves if assumed secured
   └─ ACTION: Strengthen collection efforts; may require charge-off
```

---

## Part 6: Collections & Resolution Procedures

### Step-by-Step Resolution Process

```
TIMELINE OF MISSING COLLATERAL RESOLUTION

DAY 1 (Collateral Not Received by Deadline):
  ├─ Loan servicer notes: Securities_Received_Date = NULL
  ├─ System generates: Automated alert to credit officer
  ├─ Credit Officer Action:
  │  └─ Email borrower: "Status of collateral transfer?"
  │     Include:
  │     ├─ "We're ready to fund your loan"
  │     ├─ "Please confirm securities transfer status"
  │     └─ "Need confirmation by [DATE] to proceed"
  │
  └─ Loan Status: "PENDING_COLLATERAL_DELIVERY"

DAY 3 (No Response from Borrower):
  ├─ Credit officer calls borrower (voice contact)
  ├─ Conversation topics:
  │  ├─ "Where is the securities transfer?"
  │  ├─ "Is there a problem with your broker?"
  │  ├─ "Do you still want to move forward with this loan?"
  │  └─ "Do you have an alternative collateral?"
  │
  ├─ Possible Borrower Responses:
  │  ├─ "It's coming - broker said 5-7 business days" → Wait 2 more days
  │  ├─ "I need to liquidate some positions first" → Set new deadline
  │  ├─ "Can I use a different stock instead?" → Initiate amendment
  │  ├─ "I'd prefer to do unsecured loan" → Recalculate terms/rate
  │  ├─ "I changed my mind" → LOAN CANCELLATION
  │  └─ "No response / unreachable" → ESCALATE
  │
  └─ Loan Status: "PENDING_COLLATERAL_CONFIRMATION"

DAY 7 (Collateral Still Missing):
  ├─ MDPA workflow runs - still no securities data
  ├─ QA Report flags: "Loan 12345 - 7 days without collateral"
  ├─ Credit officer escalates to Loan Committee / Manager
  ├─ Email to management:
  │  └─ "Cannot fund loan - collateral not received after 7 days"
  │  └─ "Recommend: Contact borrower to determine intent"
  │  └─ "Possible outcomes: Fund unsecured / Restructure / Cancel"
  │
  ├─ Management Decision:
  │  ├─ A) EXTEND DEADLINE: "Give borrower 3 more days"
  │  ├─ B) RESTRUCTURE: "Fund as unsecured; adjust terms"
  │  ├─ C) ALTERNATIVE: "Accept different collateral (house, car)"
  │  └─ D) CANCEL: "Loan cancelled - borrower must reapply"
  │
  └─ Loan Status: "ESCALATED_TO_MANAGEMENT"

DAY 10 (Final Decision):
  ├─ IF Decision = A (Extend):
  │  └─ Set final deadline; one more extension
  │     └─ Loan Status: "FINAL_DEADLINE: Day 13"
  │
  ├─ IF Decision = B (Restructure - Unsecured):
  │  ├─ Rate increases (higher risk) → Borrower must approve
  │  ├─ Terms may change (shorter maturity, higher payment)
  │  ├─ New loan documents sent for signature
  │  ├─ Once signed: Loan can be FUNDED as unsecured
  │  └─ Loan Status: "READY_TO_FUND_UNSECURED"
  │
  ├─ IF Decision = C (Alternative Collateral):
  │  ├─ Borrower identifies new collateral (home equity, car, etc.)
  │  ├─ Appraisal/valuation obtained
  │  ├─ New loan documents prepared
  │  ├─ Once approved: Loan can be FUNDED
  │  └─ Loan Status: "COLLATERAL_PENDING_ALTERNATIVE"
  │
  └─ IF Decision = D (Cancel):
     ├─ Loan approval rescinded
     ├─ Loan cancellation notice sent to borrower
     ├─ Loan system marks: "CANCELLED - Collateral not provided"
     ├─ Application fee may be: Retained (cost) or Refunded (courtesy)
     └─ Loan Status: "CANCELLED"

DAY 13 (Final Deadline Passes):
  ├─ IF collateral still missing and no alternative:
  │  └─ AUTOMATIC CANCELLATION
  │     ├─ Loan cancelled per terms
  │     ├─ Borrower notified
  │     ├─ Application fee handled per policy
  │     └─ Loan removed from pending pipeline
  │
  ├─ IF collateral arrives:
  │  ├─ Securities received & confirmed in custody
  │  ├─ MDPA workflow can now process normally
  │  ├─ LTV calculated: Should be acceptable
  │  └─ Loan Status: "APPROVED_READY_TO_FUND"
  │
  └─ IF alternative collateral approved:
     └─ Loan Status: "APPROVED_READY_TO_FUND"

FUNDING DAY:
  ├─ Once collateral confirmed OR alternative approved:
  ├─ Credit union approves final funding
  ├─ Loan proceeds sent to borrower
  ├─ Loan moves to ACTIVE status
  └─ MDPA monitoring begins
     ├─ Daily LTV monitoring (if securities)
     ├─ Monthly delinquency reporting
     └─ Risk metrics tracked monthly
```

---

## Part 7: Dashboard & Reporting When Collateral Missing

### Dashboard Alert Display

```
LOAN EXCEPTION DASHBOARD

┌────────────────────────────────────────────────────────────────┐
│ ⚠️ EXCEPTIONS: 3 LOANS WITH ISSUES                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ MISSING COLLATERAL (3 loans)                                   │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Loan_ID | Member Name      | Amount | Days Pending   │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ 12345   | John Smith       | $50K   | 7 days ⚠️      │  │
│ │ 12346   | Jane Doe         | $75K   | 3 days         │  │
│ │ 12347   | ABC Corp         | $100K  | 1 day          │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ ACTIONS NEEDED:                                                │
│  ✓ Contact borrowers - confirm collateral delivery ETA        │
│  ✓ If >7 days: Escalate to management for decision            │
│  ✓ If >10 days: Prepare cancellation notice (if needed)       │
│                                                                 │
│ IMPACT ON PORTFOLIO:                                           │
│  • These loans NOT included in portfolio analytics             │
│  • Total excluded balance: $225,000                            │
│  • Represents 0.5% of total portfolio                          │
│  • Will be included once collateral received or restructured   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

LOAN DETAIL VIEW (Loan 12345)

Loan Status: ⚠️ PENDING COLLATERAL

General Information:
  ├─ Loan_ID: 12345
  ├─ Loan_Type: Securities-Backed LOC
  ├─ Amount: $50,000
  ├─ Approval_Date: 2026-03-10
  └─ Intended_Collateral: 500 shares AAPL + 200 shares MSFT

Collateral Status:
  ├─ Required_Collateral_Value: $65,000
  ├─ Actual_Collateral_Value: $0 (NOT RECEIVED)
  ├─ Collateral_Received_Status: ❌ NO
  ├─ Collateral_Expected_Date: 2026-03-18
  ├─ Days_Since_Approval: 7 days
  ├─ Days_Overdue: 2 days (past expected delivery)
  └─ Expected_LTV_When_Received: 76.9% (acceptable)

Actions to Take:
  [ ] Contact borrower re: collateral delivery status
  [ ] Update expected delivery date
  [ ] If delivery cancelled: Select alternative
      ○ Different securities collateral
      ○ Real estate collateral
      ○ Convert to unsecured loan
      ○ Cancel loan
  [ ] Document all contact attempts
  [ ] Escalate to manager on Day 10 if still pending

Notes:
  "Securities in transit from member's broker. Expected to arrive
   by 2026-03-18. Loan servicer will confirm upon receipt.
   Member contact: john.smith@email.com / 555-1234"
```

### QA Report Section

```
SECTION 7: PENDING LOANS & EXCEPTIONS

Loans Pending Collateral Delivery:
┌──────────────────────────────────────────────────────────────┐
│ Loan_ID | Type              | Amount | Approved | Days Pending
├──────────────────────────────────────────────────────────────┤
│ 12345   | Securities-Backed | $50K   | 3/10/26  | 7 days
│ 12346   | Securities-Backed | $75K   | 3/14/26  | 3 days
│ 12347   | Securities-Backed | $100K  | 3/17/26  | 1 day
├──────────────────────────────────────────────────────────────┤
│ TOTAL PENDING VALUE: $225,000 (0.5% of portfolio)            │
│ ACTION REQUIRED: Contact borrowers within 24 hours           │
│ DEADLINE: Resolve or escalate within 10 days of approval    │
└──────────────────────────────────────────────────────────────┘

Recommended Actions by Days Pending:
  • 1-5 days: Monitor, routine follow-up OK
  • 6-7 days: Escalate to manager for decision point
  • 8+ days: Escalate to Loan Committee; prepare cancellation
  • 10+ days: CANCELLATION DEADLINE (if no resolution)

Impact on Reporting:
  ✗ These loans NOT included in:
    ├─ Portfolio balance figures
    ├─ LTV analysis
    ├─ Risk metrics
    ├─ Margin call monitoring
    └─ Client deliverable reports

  ✓ These loans ARE included in:
    ├─ Exception tracking
    ├─ Pipeline reporting (unfunded commitments)
    └─ Risk dashboard alerts
```

---

## Part 8: Prevention Best Practices

### How to Prevent Missing Collateral Issues

```
BEFORE LOAN APPROVAL:
├─ CLEAR EXPECTATIONS
│  └─ Borrower must sign: "Collateral Pledge Agreement"
│     including:
│     ├─ Specific securities (ticker, quantity)
│     ├─ Expected delivery date (not later than X days)
│     ├─ Consequences if not delivered
│     └─ Automatic cancellation clause if not received by deadline
│
├─ SET COLLATERAL DELIVERY DEADLINE
│  └─ Standard: 5 business days after approval
│  └─ Document in loan file
│  └─ Communicate to borrower clearly
│
└─ REQUIRE CUSTODIAN CONFIRMATION
   └─ Before funding: Custodian must send confirmation email
      "Securities received and are now in custody"

AT LOAN APPROVAL:
├─ DOCUMENT COLLATERAL SPECIFICS
│  └─ Loan origination system records:
│     ├─ Exact ticker symbols
│     ├─ Exact quantity of each security
│     ├─ Expected current value
│     ├─ Expected haircut
│     └─ Expected LTV when received
│
└─ SET CALENDAR REMINDERS
   ├─ Day 1: Acknowledge with borrower "We received your application"
   ├─ Day 3: "Reminder: Send securities by Day 5"
   ├─ Day 5: "Collateral confirmation needed today"
   ├─ Day 6: If missing, "Where is your collateral?" (call)
   └─ Day 10: "Loan will be cancelled if not received"

DAILY PROCESS:
├─ CUSTODIAN RECONCILIATION
│  └─ Each morning: Receive list of securities in custody
│  └─ Match to: Expected pledged collateral
│  └─ Alert on: Any discrepancies
│
└─ FUNDING GATE CHECKLIST
   ├─ Before funding ANY securities-backed loan:
   ├─ ☑ Collateral received at custodian?
   ├─ ☑ Collateral quantity matches loan docs?
   ├─ ☑ LTV acceptable (< 100% for margin loans)?
   ├─ ☑ Pricing current & valid?
   ├─ ☑ Haircut policy applied correctly?
   └─ ☑ If ALL checks pass: Loan can be FUNDED

AUDIT & CONTROLS:
├─ MONTHLY AUDIT
│  └─ Verify: No funded loans without collateral in custody
│  └─ Verify: All custodian holdings match loan records
│
├─ EXCEPTION TRACKING
│  └─ Track: All pending collateral situations
│  └─ Report: To audit & management monthly
│
└─ PROCESS TESTING
   └─ Quarterly: Test what happens if collateral not received
      └─ Verify: Automatic alerts work
      └─ Verify: System blocks funding appropriately
```

---

## Part 9: Summary - What Happens If Securities NOT Sent

```
BOTTOM LINE:

1. WORKFLOW IMPACT:
   └─ Loan is REJECTED at Stage 2 Validation
   └─ Data_Quality_Flag = 'N' (record excluded)
   └─ Loan not processed through normal stages
   └─ LTV cannot be calculated (no collateral value)

2. OPERATIONAL IMPACT:
   └─ Loan CANNOT be funded
   └─ Loan remains in "PENDING_COLLATERAL" status
   └─ Credit officer must contact borrower immediately
   └─ Collateral deadline: 5-10 business days

3. RISK IMPACT:
   └─ Loan is effectively UNSECURED until collateral received
   └─ No daily margin call monitoring
   └─ Unknown loss severity
   └─ May require higher loan loss reserve

4. REPORTING IMPACT:
   └─ Exception count increases in QA Report
   └─ Loan excluded from portfolio analytics
   └─ Dashboard shows "ALERT - Missing Collateral"
   └─ Not included in client deliverable reports

5. TIMELINE TO RESOLUTION:
   ├─ Days 1-5: Routine follow-up
   ├─ Days 6-7: Escalation to manager
   ├─ Days 8-10: Loan Committee decision
   ├─ After Day 10: CANCELLATION (if no resolution)
   └─ OR: RESTRUCTURED (unsecured or alternative collateral)

6. LONG-TERM IMPACT:
   └─ If eventually received: Loan processes normally
   └─ If not received: Loan is cancelled or restructured
   └─ If restructured as unsecured: Higher interest rate, different terms
   └─ If cancelled: Application fee retained, borrower must reapply

BOTTOM BOTTOM LINE:
  → Securities MUST arrive within 5-10 days or loan is cancelled
  → System won't let loan be funded without collateral confirmed
  → Borrower must take action or lose the loan approval
  → Credit union has clear escalation path to resolve situation
```

---

## Cross-Reference to Related Documentation

- **Securities Collateral Guide:** See [14_SECURITIES_COLLATERAL_GUIDE.md](14_SECURITIES_COLLATERAL_GUIDE.md)
- **Workflow Stages:** See [1_MDPA_PROCESS_DOCUMENTATION.md](1_MDPA_PROCESS_DOCUMENTATION.md)
- **Validation Rules:** See [5_ALERTS_AND_NOTIFICATIONS.md](5_ALERTS_AND_NOTIFICATIONS.md)
- **Data Quality Standards:** See [9_BUSINESS_DATA_GLOSSARY.md](9_BUSINESS_DATA_GLOSSARY.md)
- **Dashboard Alerts:** See [12_TABLEAU_DASHBOARD_GLOSSARY.md](12_TABLEAU_DASHBOARD_GLOSSARY.md)

---

**Document Version:** 1.0 | **Last Updated:** 2026-03-18 | **Next Review:** 2026-04-18
