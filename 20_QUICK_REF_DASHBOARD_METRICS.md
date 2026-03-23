# Quick Reference: Dashboard Metrics & Interpretation

**Fast reference for understanding and interpreting dashboard KPIs and metrics**

---

## Key Metrics at a Glance

### Portfolio Health Metrics

| Metric | Definition | Good Target | Caution Zone | Action Zone |
|---|---|---|---|---|
| **Delinquency Rate** | % of loans past due | < 2% | 2-3% | > 3% |
| **Charge-Off Rate** | Annualized % of charge-offs | < 0.5% | 0.5-1% | > 1% |
| **Average LTV** | Loan-to-value ratio | < 80% | 80-100% | > 100% |
| **Average Credit Score** | Mean FICO of portfolio | > 700 | 650-700 | < 650 |
| **Average DTI** | Debt-to-income ratio | < 35% | 35-45% | > 45% |
| **Recovery Rate** | % of charge-offs recovered | > 70% | 50-70% | < 50% |

### Risk Metrics

| Metric | Definition | Low Risk | Medium Risk | High Risk |
|---|---|---|---|---|
| **Concentration Risk** | % of portfolio in single borrower | < 1% | 1-2% | > 2% |
| **Industry Concentration** | % of portfolio in single industry | < 5% | 5-10% | > 10% |
| **Liquidity Coverage** | Days of operating expenses covered | > 90 days | 60-90 | < 60 |
| **Capital Cushion** | Actual vs. required capital | > 20% | 10-20% | < 10% |

### Profitability Metrics

| Metric | Definition | Target | How to Use |
|---|---|---|---|
| **Net Interest Margin** | Interest income - cost of funds | 2-3% | Assess lending profitability |
| **Spread** | Loan rate - cost of funds | 1-2% | Monitor pricing competitiveness |
| **Yield** | Interest income ÷ avg balance | 4-6% | Compare to risk (higher risk = higher yield) |
| **Cost of Funds** | Cost of deposits/borrowing | 0.5-1.5% | Benchmark against market rates |

---

## Understanding Dashboard Tabs

### Introduction Tab
**Purpose:** Configure portfolio analysis parameters (FICO tiers, industry classifications)

**Key Controls:**
- FICO Tier Bins: Define credit score breakpoints
- Industry Classifications: Map borrower industries
- Report Date: Select analysis month

**What to Check:**
- Are FICO tiers aligned with your credit policy?
- Are all industries represented?
- Is correct month selected?

---

### Portfolio Health Landing Page
**Purpose:** Overview of entire loan portfolio status

**Key Charts:**
- Total loan count and balance
- Delinquency breakdown (Current/30DPD/60DPD/90DPD+)
- Charge-off summary (amount and count)
- Average metrics (Credit Score, DTI, LTV)

**How to Interpret:**
- **Delinquency increasing?** Investigate what changed (credit scores, rates, economic conditions)
- **Charge-offs spiking?** Look for common characteristics (vintage, product type, dealer)
- **Average LTV rising?** Real estate values may be declining or portfolio aging
- **Credit scores declining?** Portfolio may be seasoning naturally, or external stress

---

### Delinquency Dashboard
**Purpose:** Detailed delinquency analysis and trend monitoring

**Key Metrics:**
- Delinquency rate by FICO tier
- 30DPD, 60DPD, 90DPD+ counts and percentages
- Days delinquent distribution
- Delinquency trends (month-over-month)

**How to Use:**
- Track if delinquency concentrates in lower credit tiers (expected)
- Monitor trend: increasing or decreasing?
- Identify specific FICO tier with elevated delinquency for investigation
- Compare current vs. 12-month average

---

### Risk Dashboard
**Purpose:** Portfolio risk assessment and concentration monitoring

**Key Metrics:**
- Risk score distribution
- Borrower concentration (top borrowers)
- Industry concentration
- Loan size distribution

**How to Use:**
- Is concentration risk within policy? (typically < 5% per borrower)
- Which industries are concentrated? (real estate, manufacturing, etc.)
- Are large loans appropriately priced for risk?
- Compare current concentrations to historical levels

---

### Credit Score Migration Dashboard
**Purpose:** Track changes in credit scores across portfolio

**Key Analytics:**
- Migration matrix: Where scores moved (up/down)
- % improving vs. declining
- Tier movement (Prime → Near-Prime → Subprime)
- Score change distribution

**How to Use:**
- Are scores improving or declining on average?
- Large migrations down may signal stress
- Track if migration is due to economic conditions or portfolio changes
- Use for risk trending

---

### Charge-Off & Recovery Analysis
**Purpose:** Loss management and recovery effectiveness

**Key Metrics:**
- Charge-off rate (annualized)
- Recovery rate (% recovered)
- Average recovery $ amount
- Recovery timeline (months to recovery)

**How to Use:**
- Is charge-off rate within policy target?
- Are recoveries meeting targets? (typically 70%+)
- How long does recovery take? (trend over time)
- Identify if specific products/vintages have higher write-offs

---

### Static Pooling (Vintage Analysis)
**Purpose:** Performance analysis by loan cohort (origination year/quarter)

**Key Metrics:**
- Delinquency by vintage
- Charge-off by vintage
- Average life (months to payoff or charge-off)
- Cumulative losses by vintage

**How to Use:**
- Identify which vintages are performing well vs. poorly
- Newer vintages shouldn't show as much loss (too new)
- Older vintages should have stabilized delinquency/charge-off
- Use to benchmark new loan volume expectations

---

### Profitability Analysis
**Purpose:** Revenue, margin, and profitability assessment

**Key Metrics:**
- Total interest income
- Cost of funds
- Net interest margin
- Spread
- Yield by product

**How to Use:**
- Is margin sufficient to cover risk and operating costs?
- How does profitability compare by product?
- Are rates competitive while maintaining margin?
- Monitor if cost of funds rising (impacts margin)

---

### Data Downloads
**Purpose:** Export detailed loan-level data for further analysis

**Available Downloads:**
- Real Estate Values: Collateral valuation details
- Auto Values: Vehicle collateral data
- Credit Scores: FICO details
- Loan List: Full loan-level data

**How to Use:**
- Download for external analysis or reporting
- Verify data completeness
- Use for portfolio stress testing or modeling

---

## Metric Formulas

### Delinquency Rate
```
Delinquency_Rate% = (Delinquent_Loans / Total_Loans) × 100

Example:
- Total loans: 10,000
- Delinquent: 150
- Delinquency_Rate = (150 / 10,000) × 100 = 1.5%
```

### Charge-Off Rate (Annualized)
```
Charge_Off_Rate% = (Charge_Off_Amount / Beginning_Balance) × 12

Example:
- Beginning balance: $100M
- Charge-offs this month: $50,000
- Monthly rate = $50K / $100M = 0.05%
- Annual rate = 0.05% × 12 = 0.6%
```

### Average LTV
```
Average_LTV = SUM(Current_Balance) / SUM(Collateral_Value) × 100

Example:
- Total balances: $80M
- Total collateral: $100M
- Average LTV = 80M / 100M = 80%
```

### Recovery Rate
```
Recovery_Rate% = SUM(Recovered) / SUM(Charged_Off) × 100

Example:
- Total charged-off: $10M
- Total recovered: $7M
- Recovery_Rate = 7M / 10M = 70%
```

---

## Common Questions & Answers

### "Delinquency went from 1.2% to 1.8% - is this a problem?"

**Quick Answer:** It depends on your target and trend:
- **Target 1.5%?** You're now above target → Investigation needed
- **Historical average 2%?** You're still below average → OK
- **Check trend:** Is it rising monthly? (concerning) Or one-time jump? (may be timing)

**Action:** Analyze what changed:
- Did credit scores decline?
- Did unemployment rate spike?
- Did specific product type deteriorate?
- Is this seasonal variation?

### "Our charge-off rate is 0.8% - is that acceptable?"

**Quick Answer:** Depends on portfolio type:
- **Prime portfolio (CS > 740):** 0.8% is ELEVATED (target < 0.2%)
- **Near-Prime (CS 670-740):** 0.8% is OK (target < 0.5%)
- **Subprime (CS < 670):** 0.8% is EXCELLENT (target < 1.5%)

**Action:**
- Drill down by credit tier
- Identify if concentrated in lower tiers (expected) or spread (concerning)
- Compare to historical performance

### "Average LTV is 92% - should we reduce lending?"

**Quick Answer:** Not necessarily—context matters:
- **For Real Estate:** 92% is high (target < 80%) but acceptable if property values stable
- **For Auto:** 92% is concerning (typical depreciation will push over 100%)
- **For Securities:** 92% is good (below margin call threshold of 100%)

**Action:**
- Check collateral type distribution
- Review appraisal/pricing currency
- Assess if property values are appreciating or depreciating
- Consider requiring higher down payments on new loans

### "Why did our recovery rate drop from 75% to 60%?"

**Quick Answer:** Either fewer recoveries or more charge-offs (or both):
- **Check 1:** Did charge-off volume increase? (more losses = same $ recovery = lower %)
- **Check 2:** Did recovery $ decline? (less active recovery effort)
- **Check 3:** Are older charge-offs (more recoverable) being replaced by newer ones (less recoverable)?

**Action:**
- Compare absolute recovery $ (vs. percentage)
- Review collections/recovery process
- Check if specific charge-off cohorts aren't recovering as expected

---

## Dashboard Diagnostic Checklist

**During SME Validation:**
- [ ] Are all loan counts reasonable? (match source system)
- [ ] Are delinquency rates aligned with historical trends?
- [ ] Do charge-offs match what you expect?
- [ ] Do credit score distributions look normal?
- [ ] Is data refresh timestamp current?
- [ ] Are calculated fields reasonable? (no NULLs or outliers)
- [ ] Do key metrics match your manual calculations?
- [ ] Are filtered views (by FICO tier, product, etc.) accurate?

**During Client Review:**
- [ ] Are metrics presented in context? (vs. targets, vs. history)
- [ ] Have trends been explained? (why did X change?)
- [ ] Are outliers called out? (unusual metrics highlighted)
- [ ] Is data completeness noted? (any data quality issues)
- [ ] Are recommendations provided? (what to do about findings)

---

**See Also:**
- 12_TABLEAU_DASHBOARD_GLOSSARY.md - Detailed dashboard documentation
- 13_OUTPUT_TO_DASHBOARD_LINEAGE.md - Data flow to dashboards
