# Quick Reference: Loan Lifecycle & Status Progression

**Fast reference for understanding loan status transitions and lifecycle events**

---

## Complete Loan Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      LOAN CREATION                              │
│  Status: CREATED                                                │
│  • Application submitted                                        │
│  • Underwriting in progress                                     │
│  • Awaiting credit decision                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
    ┌─────────────┐                 ┌──────────────┐
    │ APPROVED    │                 │ DECLINED/    │
    │             │                 │ WITHDRAWN    │
    │ • Approved  │                 │              │
    │ • Awaiting  │                 │ (End path)   │
    │   funding   │                 └──────────────┘
    └─────────────┘
         │
         ▼
    ┌─────────────────┐
    │ ACTIVE / FUNDED │
    │ (REPAYMENT)     │
    │ • Loan funded   │
    │ • Payments due  │
    └────┬────────────┘
         │
    ┌────┴─────────────────────────────┐
    │                                  │
    ▼ (Payments on schedule)    ▼ (Payments missed)
┌──────────────┐             ┌──────────────────┐
│ CURRENT      │             │ DELINQUENT       │
│              │             │                  │
│ • 0 DPD      │             │ • 1-30 DPD       │
│ • Good       │             │ • 31-60 DPD      │
│   standing   │             │ • 61-90 DPD      │
│              │             │ • 90+ DPD        │
└────┬─────────┘             │                  │
     │                       └────┬─────────────┘
     │                            │
     │         ┌──────────────────┤
     │         │                  │
     │         ▼                  ▼
     │    ┌─────────────┐    ┌──────────────┐
     │    │ RECOVERED   │    │ CHARGED OFF  │
     │    │ (cure)      │    │ (180+ DPD)   │
     │    │ Return to   │    │              │
     │    │ CURRENT     │    │ • Written off │
     │    └─────┬───────┘    │ • Loss taken  │
     │          │            └─────┬────────┘
     │          │                  │
     │          │                  ▼
     │          │            ┌──────────────┐
     │          │            │ RECOVERY     │
     │          │            │              │
     │          │            │ • Payments   │
     │          │            │   received   │
     │          │            │ • Collected  │
     │          │            └──────────────┘
     │          │
     └──────────┴────────────────┐
                                 ▼
                          ┌────────────────┐
                          │ PAID OFF / END │
                          │                │
                          │ • Loan closed  │
                          │ • Fully repaid │
                          └────────────────┘
```

---

## Status Definitions & Durations

### CREATED
**Duration:** Days to approval (typically < 30 days)

**Definition:** Application received, underwriting underway

**What Happens:**
- Credit analysis completed
- Collateral valuation ordered
- Underwriting decision made
- If approved → move to APPROVED
- If denied → move to DECLINED

**Actions:** None required (internal processing)

---

### APPROVED
**Duration:** Days to funding (typically < 30 days)

**Definition:** Application approved, awaiting funding

**What Happens:**
- Credit committee approval obtained
- Loan documents prepared
- Borrower signs documents
- Funds transferred from institution to borrower
- Once funded → move to ACTIVE

**Actions:** Monitor for funding delays; follow up if > 30 days

---

### ACTIVE / CURRENT
**Duration:** Length of loan term (typically 3-10 years)

**Definition:** Loan funded, payments being made on schedule

**What Happens:**
- Monthly payments received (on or before due date)
- Loan balance decreases with each payment
- Interest accrual continues
- Collateral monitored for impairment

**Ending Conditions:**
- Payment missed (30+ days) → move to 30DPD
- Loan fully repaid ahead of schedule → move to PAID_OFF
- Maturity date reached → move to PAID_OFF

**Actions:** Monitor for payment issues; escalate if payment is 10+ days late

---

### 30 DAYS PAST DUE (30DPD)
**Duration:** 1-30 days past due

**Definition:** First payment cycle missed (payment 1-30 days late)

**What Happens:**
- First notice sent to borrower
- Arrears accumulating
- Interest still accruing
- Collections contact begins

**Ending Conditions:**
- Payment received + brought current → return to CURRENT
- Payment not received within 30 days → move to 60DPD
- 30 days pass → move to 60DPD

**Actions:** Contact borrower, determine reason for delinquency, arrange payment

---

### 60 DAYS PAST DUE (60DPD)
**Duration:** 31-60 days past due

**Definition:** Two or more payment cycles missed

**What Happens:**
- Second notice sent (formal demand)
- Collections intensified
- Interest continues accruing
- Loan reported to credit bureaus as delinquent

**Ending Conditions:**
- Payment received + brought current → return to CURRENT
- Payment not received within 30 more days → move to 90DPD+
- 60 days pass → move to 90DPD+

**Actions:** Formal collection demand sent; consider legal review

---

### 90+ DAYS PAST DUE (90DPD+)
**Duration:** 61+ days past due

**Definition:** Three or more payment cycles missed

**What Happens:**
- Third notice sent (formal demand + potential legal threat)
- Collections heavily escalated
- Legal review initiated
- Loan may be moved to CHARGED_OFF if policy allows
- Collateral repossession may be initiated

**Ending Conditions:**
- Payment received + brought current → return to CURRENT
- No payment received → move to CHARGED_OFF (typically at 180 DPD)
- Legal action initiated → move to CHARGED_OFF

**Actions:** Legal review; initiate repossession if needed; prepare charge-off

---

### CHARGED OFF
**Duration:** Until recovery or write-off complete (months to years)

**Definition:** Loan written off as uncollectible loss

**What Happens:**
- Loan removed from active portfolio
- Full amount (or portion) taken as loss
- Written off on financial statements
- Recovery efforts continue
- May be sold to collections agency

**Ending Conditions:**
- Partial recovery received → move to RECOVERY
- Borrower offers settlement → move to RECOVERY
- After recovery period (2+ years), move to RECOVERY complete

**Actions:** Initiate recovery procedures; report to regulatory authorities

---

### RECOVERY
**Duration:** 2+ years after charge-off

**Definition:** Collections and recovery efforts ongoing post-charge-off

**What Happens:**
- Payments received toward charge-off amount
- Recovery tracked separately from active portfolio
- Funds applied to principal first, then interest

**Ending Conditions:**
- Full recovery achieved → move to RECOVERY_COMPLETE
- Recovery period expires (2+ years) → move to RECOVERY_COMPLETE
- Settlement reached → move to RECOVERY_COMPLETE

**Actions:** Continue collection efforts; accept partial settlements if beneficial

---

### PAID OFF / COMPLETE
**Duration:** Loan closed

**Definition:** Loan fully repaid or recovery process complete

**What Happens:**
- Loan is closed
- Promissory note marked as satisfied
- Collateral released
- Loan archived (historical reference only)

**Ending Conditions:** None—final state

**Actions:** Archive loan records; generate payoff documents

---

## Status Transition Rules

### Automatic Transitions (Trigger-Based)

| Trigger | From Status | To Status | Days |
|---|---|---|---|
| Payment received on time | CURRENT | CURRENT | Monthly |
| Payment 1-30 days late | CURRENT | 30DPD | Auto @ day 31 |
| Payment 31-60 days late | 30DPD | 60DPD | Auto @ day 61 |
| Payment 61-90 days late | 60DPD | 90DPD+ | Auto @ day 91 |
| Payment 180+ days late | 90DPD+ | CHARGED_OFF | Auto @ day 181 |
| Loan fully repaid | Any Active | PAID_OFF | When balance = $0 |
| Recovery period expires | CHARGED_OFF | RECOVERY_COMPLETE | Auto @ 24-30 months |

### Manual Transitions (Discretionary)

| Action | From Status | To Status | Authority |
|---|---|---|---|
| Skip payment plan | 30DPD | CURRENT | Collections Officer |
| Loan modification | CURRENT/DPD | CURRENT | Loan Officer |
| Settlement accepted | 90DPD+/CO | RECOVERY | Collections Manager |
| Loan repurchased | Any | PAID_OFF | Executive |
| Refinance | CURRENT | PAID_OFF → New Loan | Loan Officer |

---

## Common Scenarios & Resolution

### Scenario 1: Borrower Makes Single Late Payment
```
Loan was CURRENT → Payment missed → Becomes 30DPD
→ Borrower calls, explains temporary hardship
→ Collections works with borrower to catch up
→ Within 30 days, borrower makes payment + makes up missed payment
→ Status returns to CURRENT (cured)
```

**Key Point:** Even one missed payment triggers DELINQUENT status, but can be cured if remedied within 30 days.

---

### Scenario 2: Borrower Defaults on Securities-Backed Loan
```
Loan CURRENT, LTV = 85%
→ Securities price drops 20%
→ New LTV = 100% (margin call threshold)
→ Borrower notified of margin call
→ Borrower fails to respond or add funds
→ Loan moves to DELINQUENT (by definition: LTV > 100%)
```

**Key Point:** Securities loans can move to delinquent due to collateral value drop, even if payments are current.

---

### Scenario 3: Loan Modification
```
Loan CURRENT but borrower requests help
→ Loan officer negotiates modification (rate reduction, term extension)
→ Existing loan PAID_OFF at par
→ New loan created with modified terms
→ Borrower begins payments on new loan
```

**Key Point:** Modifications reset the loan clock; new loan treated as ACTIVE at origination.

---

### Scenario 4: Charge-Off & Partial Recovery
```
Loan reaches 90DPD+ → Moved to CHARGED_OFF
→ Written off as $50,000 loss
→ Recovery team contacts borrower
→ Borrower offers $30,000 settlement
→ Loan moves to RECOVERY status
→ Settlement accepted, $30,000 received
→ Remaining $20,000 written off
→ After recovery period, marked RECOVERY_COMPLETE
```

**Key Point:** Recovery can reduce loss impact; partial recoveries are common.

---

## Data Quality Checks for Status Tracking

| Check | Expected | Red Flag |
|---|---|---|
| **Status + DPD alignment** | If 30DPD, then Days_Past_Due 1-30 | DPD and status don't match |
| **Status progression** | CURRENT → 30DPD → 60DPD → 90DPD → CHARGED_OFF | Out-of-order progression |
| **Timeline realism** | Days_Past_Due increases each month (or cured) | Days_Past_Due decreases without payment |
| **Charge-off date** | Charge_Off_Date > Origination_Date | Charged off before originated |
| **Recovery logic** | Recovery_Amount <= Charge_Off_Amount | Recovery exceeds charge-off |
| **Date sequence** | Origination < Maturity < Current Date | Dates out of sequence |

---

## Quick Diagnostic Checklist

**Loan Status Health:**
- [ ] Status values are one of: CREATED, APPROVED, ACTIVE, CURRENT, 30DPD, 60DPD, 90DPD+, CHARGED_OFF, RECOVERY, PAID_OFF
- [ ] Days_Past_Due is consistent with status (0 if CURRENT, 1-30 if 30DPD, etc.)
- [ ] Status transitions follow logical progression (no backwards jumps)
- [ ] Charge-off date is after origination date
- [ ] Recovery amount doesn't exceed charge-off amount
- [ ] No loans stuck in old status (CREATED/APPROVED for > 90 days)
- [ ] Delinquent loans aging as expected (showing natural progression)
- [ ] Paid-off loans are truly repaid (balance = 0)

**Portfolio Flow:**
- [ ] Is status distribution reasonable? (Most should be CURRENT/ACTIVE)
- [ ] Are delinquency trends consistent with economic conditions?
- [ ] Are charge-offs concentrated in older vintages?
- [ ] Are recoveries on track with historical patterns?
- [ ] Is any status group unusually large/small?

---

**See Also:** 6_FIELD_MAPPING_AND_DATA_LINEAGE.md for Payment_Status field details
