# Quick Reference: Delinquency & Risk Classification

**Fast reference for understanding loan status, delinquency levels, and risk scoring**

---

## Loan Status Hierarchy

```
CREATED
  ↓
APPROVED (Decision made, awaiting funding)
  ↓
ACTIVE (Funded and in repayment)
  ├─ CURRENT (Payments on time)
  ├─ 30DPD (30 Days Past Due)
  ├─ 60DPD (60 Days Past Due)
  ├─ 90DPD+ (90+ Days Past Due)
  └─ DELINQUENT (Any payment past due)
  ↓
CHARGED_OFF (Written off as loss) OR PAID_OFF (Fully repaid)
```

---

## Delinquency Status Definitions

| Status | Days Past Due | Definition | Next Action |
|---|---|---|---|
| **CURRENT** | 0 DPD | Payment made on time | Monitor, no action |
| **30DPD** | 1-30 days | Payment 1+ month late | Send reminder notice |
| **60DPD** | 31-60 days | Payment 2+ months late | Send formal demand |
| **90DPD+** | 61+ days | Payment 3+ months late | Legal review |
| **CHARGED-OFF** | 180+ DPD | Written off as loss | Recovery efforts |
| **DELINQUENT** | Any DPD | Any payment status other than CURRENT | Risk monitoring |

---

## What Triggers Status Changes

### Improvement (Positive)
- **DELINQUENT → CURRENT:** Payment made, brings account current (may take 1-2 cycles)
- **30DPD → CURRENT:** Payment made + next payment made on time
- **CHARGED-OFF → RECOVERY:** Partial recovery via payment or settlement

### Deterioration (Negative)
- **CURRENT → 30DPD:** Payment 30 days late
- **30DPD → 60DPD:** No payment for 60 days total
- **60DPD → 90DPD+:** No payment for 90 days total
- **90DPD+ → CHARGED-OFF:** No payment for 180 days (varies by regulation)

---

## Risk Score Calculation

**Formula:** Risk_Score = (100 - Credit_Score/10) × (DTI_Ratio/100) × (Age_Days/365)

### Example Calculation

**Loan Details:**
- Credit Score: 680
- DTI Ratio: 40%
- Loan Age: 500 days

**Calculation:**
- Step 1: (100 - 680/10) = (100 - 68) = 32
- Step 2: 32 × (40/100) = 32 × 0.4 = 12.8
- Step 3: 12.8 × (500/365) = 12.8 × 1.37 = 17.5
- **Result: Risk_Score = 17.5**

### Risk Tiers

| Risk Score | Risk Level | Action |
|---|---|---|
| 0-10 | LOW | No action needed |
| 10-30 | MEDIUM | Monitor quarterly |
| 30-50 | HIGH | Monitor monthly |
| > 50 | VERY HIGH | Monitor weekly + possible collection |

---

## Credit Score Interpretation (FICO)

| Range | Grade | Risk Level |
|---|---|---|
| 800+ | Excellent | Very Low |
| 740-799 | Very Good | Low |
| 670-739 | Good | Moderate |
| 580-669 | Fair | High |
| < 580 | Poor | Very High |

**Note:** Credit scores from TransUnion; may lag 1-2 weeks.

---

## Delinquency Rate Calculation

**Formula:** Delinquency_Rate% = (Delinquent_Loans / Total_Loans) × 100

### Targets by Portfolio Type

| Portfolio Type | Target Rate | Alert Threshold |
|---|---|---|
| **Prime** (CS > 740) | < 0.5% | > 1% |
| **Near-Prime** (CS 670-740) | < 1.5% | > 2.5% |
| **Subprime** (CS < 670) | < 3% | > 5% |
| **Overall** | < 2% | > 3% |

---

## Charge-Off Rate Calculation

**Formula:** Charge_Off_Rate% = (Charge_Off_Amount / Beginning_Balance) × 12

### Targets by Portfolio Type

| Portfolio Type | Target Rate | Alert Threshold |
|---|---|---|
| **Prime** | < 0.2% annualized | > 0.5% |
| **Near-Prime** | < 0.5% annualized | > 1% |
| **Subprime** | < 1.5% annualized | > 2.5% |
| **Overall** | < 0.5% annualized | > 1% |

---

## Quick Status Lookup

### "Our delinquency rate is 2.5% - is that good or bad?"

- Prime portfolio: **ALERT** (target < 0.5%)
- Near-Prime portfolio: **OK** (target < 1.5%)
- Subprime portfolio: **EXCELLENT** (target < 3%)

### "This loan's risk score is 45 - should we be concerned?"

- **Risk Score 45 = HIGH** (typical threshold 30-50)
- **Action:** Review credit profile, consider collection activity
- **Monitor:** Weekly or monthly
- **Possible triggers:**
  - Low credit score (< 620)
  - High DTI (> 45%)
  - Loan is relatively new (< 1 year)

### "Charge-offs jumped from 0.3% to 0.8% - is this concerning?"

- **Change:** +0.5% is 267% increase—significant
- **Typical threshold:** Alert when > 1% annualized
- **Current status:** At 0.8%, starting to approach threshold
- **Action needed:**
  - Analyze which loans charged off (new or seasoned?)
  - Check if related to specific product/vintage
  - May indicate deteriorating portfolio quality
  - Escalate if trend continues

---

## Quick Diagnostic Checklist

- [ ] Are status values (CURRENT, 30DPD, etc.) correct for stage?
- [ ] Are Days_Past_Due consistent with status?
- [ ] Is delinquency rate within target for portfolio type?
- [ ] Is charge-off rate within target?
- [ ] Are risk scores reasonable (0-100 range)?
- [ ] Are credit scores current (< 1 month old)?
- [ ] Are high-risk loans (Score > 50) being monitored?
- [ ] Are status transitions documented (who triggered change)?

---

**See Also:** 6_FIELD_MAPPING_AND_DATA_LINEAGE.md for detailed calculations
