# Quick Reference: Collateral Valuation & LTV

**Fast reference for collateral value calculations and LTV ratios**

---

## Collateral Types Overview

| Type | Source | Update Frequency | Haircut Applied? | LTV Threshold |
|---|---|---|---|---|
| **Real Estate** | Appraisal system | Quarterly/Annual | No | < 80% normal |
| **Auto** | Market pricing | Monthly | 10-15% | < 100% normal |
| **Securities** | Daily pricing | Daily | Yes, by type | < 100% margin call |
| **Cash/CD** | Par value | N/A | No | 100% (1:1) |

---

## LTV Calculation

**Formula:** LTV% = (Loan_Amount / Collateral_Value) × 100

### Interpretation

- **LTV < 50%** = Excellent coverage, low risk
- **LTV 50-80%** = Good coverage, moderate risk
- **LTV 80-100%** = At market value, higher risk
- **LTV > 100%** = Underwater, requires action:
  - Auto/RE: Consider forced sale or additional collateral
  - Securities: Margin call—borrower must add funds or reduce position

### Troubleshooting LTV Issues

| Problem | Cause | Fix |
|---|---|---|
| LTV is NULL | Collateral_Value is NULL | Get missing appraisal/pricing |
| LTV negative | Loan_Amount > Collateral_Value incorrectly | Verify collateral value in source |
| LTV > 500% | Collateral value is near zero | Review collateral data quality |
| LTV stays same month-to-month | Collateral not being updated | Confirm pricing/appraisal refresh |

---

## Real Estate Collateral

**Data Required:**
- Property address or ID
- Appraised value
- Appraisal date
- Market trend (up/down/stable)

**Issues to Watch:**
1. Missing appraisals → New loan? Use contract price temporarily
2. Stale appraisals (>1 year) → May need refresh
3. Market downturn → Appraisals may lag market

---

## Auto Collateral

**Data Required:**
- Vehicle VIN or make/model/year
- Mileage
- Market value estimate
- 10-15% haircut for depreciation

**Issues to Watch:**
1. Rapid depreciation → LTV increases over time
2. Total loss claims → Collateral value drops to $0
3. Vehicle not yet titled → Can't use as collateral

---

## Securities Collateral

**Data Required:**
- Ticker, CUSIP, or ISIN
- Current unit price
- Quantity
- Haircut percentage (type-dependent)

**Haircut by Security Type:**
- Blue-chip stocks: 15-25%
- Mid-cap stocks: 25-35%
- Small-cap stocks: 35-50%
- Investment-grade bonds: 2-5%
- High-yield bonds: 10-20%
- Mutual funds: 20-35%
- ETFs: 15-25%
- REITs: 25-40%
- Commodities: 40-60%
- Illiquid securities: 40-60%

**Formula:** Collateral_Value = (Price × Quantity) × (1 - Haircut%)

**Issues to Watch:**
1. Price staleness → Use previous close if today's unavailable
2. Volatility → 30-day vol should be monitored
3. Concentration risk → No single security > 10% of portfolio
4. Delisting/bankruptcy → Immediate value to $0

---

## Quick Diagnostic Checklist

- [ ] Is Collateral_Value > 0 and not NULL?
- [ ] Is collateral type recognized (RE/Auto/Securities/Cash)?
- [ ] Is pricing/appraisal current (within 1 month)?
- [ ] Is LTV calculated correctly?
- [ ] Do high-LTV loans (>100%) have action plan?
- [ ] Are appraisals refreshed on schedule?
- [ ] Are securities prices daily-updated?

---

**See Also:** 14_SECURITIES_COLLATERAL_GUIDE.md for detailed securities handling
