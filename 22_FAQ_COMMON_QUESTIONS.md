# MDPA FAQ: Common Questions & Answers

**Frequently Asked Questions for SME Validation and Client Support**

**Document Version:** 1.0
**Last Updated:** 2026-03-18
**Purpose:** Quick answers to common questions during validation and deployment

---

## Table of Contents

- [Data & Processing](#data--processing)
- [Portfolio Metrics](#portfolio-metrics)
- [Troubleshooting](#troubleshooting)
- [Securities & Collateral](#securities--collateral)
- [Dashboard & Reporting](#dashboard--reporting)
- [Compliance & Regulatory](#compliance--regulatory)

---

## Data & Processing

### Q1: How often does the MDPA workflow run?

**A:** The workflow is **designed for monthly execution**, typically:
- **Timing:** Last business day of the month or first business day of next month
- **Duration:** ~2.5 hours (150 minutes) for typical portfolio (10K-50K loans)
- **Frequency:** Once per month, scheduled or on-demand

**Details:**
- Can be triggered manually from TTA Web Portal anytime
- Input data must be complete for designated month
- Output available same day after completion

**Reference:** See `2_WORKFLOW_ARCHITECTURE.md` for execution model

---

### Q2: What data sources does MDPA require?

**A:** Four primary data sources must be submitted each month:

1. **Loan Portfolio Master** (from your ERP system)
   - All active and historical loan records
   - Portfolio balances, interest rates, payment status
   - Collateral information (type and value)

2. **Charge-Off & Recovery Data** (from Loss Management system)
   - Loans that were charged-off
   - Recovery amounts and dates
   - Principal/interest breakdown

3. **Real Estate Valuation Data** (from Appraisal system)
   - Current appraised values for RE-collateralized loans
   - Appraisal dates and valuer information
   - Market trends

4. **Credit Bureau Data** (from TransUnion)
   - Current FICO credit scores
   - Credit score trends
   - Public records and account status

**Details:**
- All files must be submitted together for complete processing
- Missing files cause workflow to skip related enrichment
- See submission checklist before each run

**Reference:** See `4_DATA_SOURCES_AND_LOCATIONS.md` for file format and locations

---

### Q3: What happens if data is missing or late?

**A:** Workflow handles missing data gracefully:

**Scenario 1: File is Missing Entirely**
- Workflow will fail at input stage
- Alert email sent to support team
- No output generated until all files provided

**Scenario 2: File Exists But is Incomplete**
- Workflow continues with available data
- Records missing enrichment get NULL values
- QA report flags missing data
- Example: Home loans without appraisals will have NULL Collateral_Value

**Scenario 3: Data is Stale (> 1 Month Old)**
- Workflow processes it but flags as stale in QA report
- Example: Last month's credit scores used (TransUnion lag is normal)
- Use most recent available rather than skipping

**Best Practice:**
- Verify all files ready BEFORE submitting
- If any file delayed: Wait or submit with NULL values and document in QA report

**Reference:** See `5_ALERTS_AND_NOTIFICATIONS.md` for alert details

---

### Q4: What is "Days_Past_Due" and how is it calculated?

**A:** Days_Past_Due is the **number of days a payment is overdue** (late past the due date).

**Calculation:**
- If payment due on 3/15 and made on 3/18: Days_Past_Due = 3
- If payment due on 3/15 and not yet made on 3/31: Days_Past_Due = 16
- If payment received on or before due date: Days_Past_Due = 0

**Used To Determine Status:**
- Days_Past_Due 0 = CURRENT (on-time)
- Days_Past_Due 1-30 = 30DPD (one month late)
- Days_Past_Due 31-60 = 60DPD (two months late)
- Days_Past_Due 61-90 = 90DPD+ (three months late)
- Days_Past_Due 180+ = CHARGED_OFF (written off)

**In Workflow:**
- Calculated from Origination_Date and current date
- May also come from source system if provided
- Validated against Payment_Status for consistency

**Reference:** See `21_QUICK_REF_LOAN_LIFECYCLE.md` for status transitions

---

### Q5: How are calculations like Risk_Score and LTV performed?

**A:** Standardized formulas are applied to every loan:

**Risk_Score Calculation:**
```
Risk_Score = (100 - Credit_Score/10) × (DTI_Ratio/100) × (Age_Days/365)

Example:
- Credit_Score: 680
- DTI_Ratio: 40%
- Loan_Age: 500 days
= (100 - 68) × 0.4 × (500/365)
= 32 × 0.4 × 1.37
= 17.5 (MEDIUM risk)
```

**LTV Ratio Calculation:**
```
LTV% = (Current_Balance / Collateral_Value) × 100

Example:
- Current_Balance: $80,000
- Collateral_Value: $100,000
= (80,000 / 100,000) × 100
= 80% (Good collateral coverage)
```

**Delinquency_Rate Calculation:**
```
Delinquency_Rate% = (Delinquent_Loans / Total_Loans) × 100

Example:
- Total Loans: 10,000
- Delinquent (any DPD): 150
= (150 / 10,000) × 100
= 1.5% (Good—below 2% target)
```

**All Calculations:**
- Applied in Enrichment stage of workflow
- Documented in workflow tools (Formula tools)
- Can be manually verified with sample data

**Reference:** See `6_FIELD_MAPPING_AND_DATA_LINEAGE.md` for all formulas and details

---

### Q6: What is "Vintage" and why does it matter?

**A:** **Vintage** = the origination cohort (when the loan was originated).

**Why It Matters:**
- Loans from different origination years perform differently
- Newer loans (recent vintage): High current/low charge-off (too new to default)
- Seasoned loans (3+ years): Stabilized delinquency/charge-off
- Old loans (7+ years): Many paid off, some very delinquent

**Examples:**
- **2023 Originations (New Vintage):** Expected delinquency ~0.5%, charge-off ~0%
- **2020 Originations (3-year Vintage):** Expected delinquency ~1.5%, charge-off ~0.3%
- **2015 Originations (8-year Vintage):** Expected delinquency ~0.8%, charge-off ~1%

**In Dashboards:**
- Static Pooling (Vintage) tab shows performance by origination year
- Use to benchmark expected performance and identify vintage-specific issues
- Understand performance curve: how do loans perform over time?

**Reference:** See `12_TABLEAU_DASHBOARD_GLOSSARY.md` (Static Pooling section)

---

## Portfolio Metrics

### Q7: Is a delinquency rate of 2.5% acceptable?

**A:** **It depends on your portfolio composition.** Context is critical:

**Prime Portfolio (Credit Score > 740):**
- Target: < 0.5%
- Current 2.5%: **ALERT** — significantly above target
- Action: Investigate cause (economic stress, loan modification issues, etc.)

**Near-Prime Portfolio (Credit Score 670-740):**
- Target: < 1.5%
- Current 2.5%: **ACCEPTABLE** — slightly above but within range
- Action: Monitor trend; investigate if increasing

**Subprime Portfolio (Credit Score < 670):**
- Target: < 3%
- Current 2.5%: **EXCELLENT** — below target
- Action: No immediate action; continue monitoring

**Overall Portfolio (Mixed):**
- Target: < 2%
- Current 2.5%: **CAUTION** — above target, needs review
- Action: Segment by credit tier and investigate concentrated area

**The Key:** Always segment by credit tier (FICO grade) before drawing conclusions. A 2.5% delinquency rate in subprime is good news; in prime it's bad news.

**Reference:** See `18_QUICK_REF_DELINQUENCY_RISK.md` for thresholds by tier

---

### Q8: What does "LTV > 100%" mean and is it a problem?

**A:** **LTV > 100% = loan balance exceeds collateral value** (borrower is underwater).

**What It Means:**
```
LTV = (Loan_Balance / Collateral_Value) × 100

Example:
- Loan Balance: $100,000
- Collateral Value: $80,000
- LTV = 125% (Underwater!)
```

**By Collateral Type:**

**Real Estate (typically < 80% safe):**
- LTV 80-100%: Market value (risky but can work)
- LTV > 100%: Underwater—borrower can walk away
- **Problem:** Limited loss mitigation if default occurs
- **Risk:** High-risk scenario

**Auto (typically < 100% safe):**
- LTV 100-120%: Common in market (auto depreciates fast)
- LTV > 120%: Concerning—negative equity
- **Problem:** Borrower has incentive to default
- **Risk:** Moderate to high

**Securities (LTV > 100% triggers margin call):**
- LTV 100%+: **Automatic margin call required**
- **Action:** Borrower must add funds or sell securities immediately
- **Risk:** Immediate action needed

**What To Do:**
- For RE: Monitor closely; accelerate collection if delinquency occurs
- For Auto: Accept as normal in market; price appropriately
- For Securities: **Trigger immediate margin call procedures**
- Consider requiring additional collateral or loan paydown

**Reference:** See `17_QUICK_REF_COLLATERAL_VALUATION.md` for LTV details

---

### Q9: What should our charge-off rate be?

**A:** Target charge-off rates vary significantly by portfolio:

| Portfolio Type | Target Rate | Acceptable Range |
|---|---|---|
| **Prime** (CS > 740) | 0.2% annualized | 0.1-0.5% |
| **Near-Prime** (CS 670-740) | 0.5% annualized | 0.3-0.8% |
| **Subprime** (CS < 670) | 1.5% annualized | 1.0-2.5% |
| **Auto Loans** | 0.3-0.8% annualized | 0.2-1.5% |
| **Home Equity** | 0.1-0.2% annualized | 0.05-0.5% |
| **Overall Blended** | 0.5% annualized | 0.3-0.8% |

**Why It Varies:**
- Credit quality differences (prime vs. subprime)
- Product differences (auto depreciates; home appreciates)
- Economic conditions (rates, unemployment)
- Portfolio age (new vs. seasoned)

**How To Calculate:**
```
Charge_Off_Rate% = (Total_Charge_Off_Amount / Beginning_Balance) × 12
```

**What To Watch:**
- **Increasing trend?** Investigate (weaker credit, economic downturn, collection issues)
- **By vintage?** Old loans should have higher rates (more seasoned)
- **By product?** Compare auto vs. home vs. personal
- **By credit tier?** Subprime should be higher than prime

**Reference:** See `18_QUICK_REF_DELINQUENCY_RISK.md` for calculation and interpretation

---

### Q10: How is Net Interest Margin (NIM) calculated and what's a healthy rate?

**A:** **NIM = Interest Income - Cost of Funds** (expressed as % of average earning assets).

**Simplified Calculation:**
```
Gross Interest Yield: 5% (what borrowers pay)
Cost of Funds: 2% (what you pay depositors)
NIM = 5% - 2% = 3%
```

**Healthy Ranges:**
- Traditional Credit Unions: 2.5-3.5%
- Competitive Environment: 2.0-3.0%
- Online Lenders: 1.5-2.5% (lower cost structure)

**Factors Affecting NIM:**
- **Interest Rate Environment:** Low rates compress margins
- **Competition:** More competitors = lower margins
- **Cost of Funds:** If deposits are expensive, margins compress
- **Loan Pricing:** Higher rates = higher yield = wider margins
- **Risk Mix:** If more prime lending, margins may compress; subprime typically higher

**In Dashboard:**
- Interest Margins tab shows NIM by product
- Profitability Calculator shows margin components
- Use to assess competitiveness and pricing strategy

**What To Do:**
- If NIM declining: Review lending rates vs. market
- If NIM too wide: May lose customers to competitors
- If NIM too narrow: Insufficient to cover costs
- Benchmark against peers

**Reference:** See `20_QUICK_REF_DASHBOARD_METRICS.md` for metric details

---

## Troubleshooting

### Q11: Workflow says "File Not Found" - what do I do?

**A:** Step-by-step troubleshooting:

**Step 1: Verify Files Exist**
- Check the shared network folder where files should be
- Open file explorer and navigate to:
  - `\\shared\MDPA\Input\Loans\` (for loan file)
  - `\\shared\MDPA\Input\ChargeOffs\` (for charge-off file)
  - `\\shared\MDPA\Input\RealEstate\` (for RE values)
  - `\\shared\MDPA\Input\CreditBureau\` (for credit bureau data)
- Are files actually there? Are they recent?

**Step 2: Verify File Format**
- Right-click file → Properties
- Is file size reasonable? (not 0 KB or tiny)
- Is file extension correct? (.xlsx, .csv, etc.)
- Can you open the file manually?

**Step 3: Verify File Names Match**
- Check exact file name in folder
- Check file name configured in workflow matches
- Example: Workflow expects "Loans_202603.csv" but file is "Loans_03_2026.csv"

**Step 4: If File is Missing**
- Contact source system owner (ERP, Loss Management, etc.)
- Request re-export and file delivery to correct location
- Check if data export is running on schedule
- Verify file transfer completed successfully

**Step 5: Retry Workflow**
- Re-trigger workflow from TTA Portal
- Monitor for same error or successful completion

**If Still Failing:**
- Check network folder permissions (do you have read access?)
- Verify Alteryx service account has access to folder
- Contact IT/system administrator for access issues

**Reference:** See `16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md` (Issue 1) for detailed steps

---

### Q12: Data looks right but dashboard shows wrong numbers - why?

**A:** This is usually a **data lineage issue**—data might be correct but calculation is wrong.

**Diagnostic Steps:**

**Step 1: Compare Source vs. Output**
- Export loan-level data from dashboard download tab
- Download same data from workflow output file
- Are individual loan values the same?
- If YES: Issue is aggregation/calculation. If NO: Issue is data quality.

**Step 2: If Values Match at Record Level**
- Issue is likely in aggregation (SUM, COUNT, etc.)
- Check dashboard filter settings
- Are you looking at filtered data? (one product type, one FICO tier?)
- Recreate metric manually:
  - Sum all loan balances = Total Portfolio Balance
  - Count delinquent loans = Delinquency count
  - Divide count/total = Delinquency rate
- Does manual calculation match dashboard?

**Step 3: If Values Don't Match at Record Level**
- Data quality issue in earlier workflow stages
- Check which field is wrong (balance? status? risk score?)
- Trace back to where field is calculated
- Verify formula is correct for that field
- Check input data for that field

**Step 4: Check Data Freshness**
- When was dashboard last refreshed? (check timestamp)
- When was workflow last run? (check output file date)
- If dashboard is old data, refresh it from Tableau Server

**Step 5: Escalate to Data Team**
- Document exactly which field is wrong
- Provide example loan IDs with discrepancies
- Share screenshot or data export showing difference
- Alert data architect to investigate

**Reference:** See `13_OUTPUT_TO_DASHBOARD_LINEAGE.md` for field tracing

---

### Q13: Tableau dashboard won't refresh - what's wrong?

**A:** Most common reasons and fixes:

**Reason 1: Extract File Not Updated**
- Workflow may not have completed or failed
- **Check:** Did workflow run successfully? (check logs)
- **Fix:** Manually re-run workflow, wait for completion
- **Verify:** Check output file timestamp in shared folder

**Reason 2: Tableau Refresh Schedule Not Running**
- Scheduled refresh may be paused or misconfigured
- **Check:** Log into Tableau Server → Check refresh schedules
- **Fix:** If paused, resume schedule. If wrong time, update.
- **Verify:** Refresh manually by clicking "Refresh Now" in data source

**Reason 3: File Permissions Issue**
- Tableau can't access the extract file
- **Check:** Is file accessible? Can you open it manually?
- **Fix:** Grant Tableau service account read permissions to file location
- **Contact:** System administrator for permission issues

**Reason 4: Data Source Connection Broken**
- File path may have changed or network folder is unavailable
- **Check:** In Tableau Server, check data source connection settings
- **Fix:** Update file path if location changed
- **Verify:** Test connection in Tableau

**Quick Fixes (in order):**
1. Manually refresh extract in Tableau Server (1-5 minutes)
2. Re-run Alteryx workflow (2-3 hours)
3. Check file is in correct location and readable
4. Contact Tableau admin if manual refresh fails

**Reference:** See `16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md` (Issue 26) for detailed troubleshooting

---

### Q14: A specific loan is showing wrong data - how do I investigate?

**A:** Step-by-step investigation for data discrepancies:

**Step 1: Identify the Problem**
- Get the Loan_ID from dashboard or client report
- What field is wrong? (balance, status, credit score, risk score?)
- What is showing vs. what should show?
- **Document:** Loan_ID, field name, current value, expected value

**Step 2: Check Source System**
- Log into source system (ERP, Loss Management, etc.)
- Look up same Loan_ID
- What does source show for that field?
- If source is wrong: **Problem is upstream** (source data issue)
- If source is correct: **Problem is in workflow** (calculation or mapping)

**Step 3: If Source is Wrong**
- Contact source system owner
- Request data correction in source
- Request re-export of that loan/data
- After correction, re-trigger workflow

**Step 4: If Source is Correct**
- Get workflow output file (from Stage 7)
- Open file and search for Loan_ID
- What value does workflow output show?
- If workflow output wrong: **Problem is in workflow logic**
- If workflow output correct: **Problem is in dashboard display**

**Step 5: If Workflow Output is Wrong**
- Which stage is the calculation? (Enrichment, Consolidation, etc.)
- Check that workflow stage for the formula/logic
- Verify formula inputs are correct
- Examples:
  - Risk_Score wrong → Check Risk_Score formula and inputs (Credit_Score, DTI, Age)
  - LTV wrong → Check LTV formula and inputs (Balance, Collateral_Value)
  - Status wrong → Check join logic that determines status

**Step 6: If Dashboard Shows Wrong Value**
- Issue is likely filter or visualization formula
- Check dashboard filter settings (is loan being filtered?)
- Check calculated field in dashboard (how is it computed?)
- Contact dashboard developer/Tableau admin

**Escalation Path:**
- Data quality issue → Data architect
- Workflow calculation issue → Workflow developer
- Dashboard display issue → Tableau admin
- Source system issue → Source system owner

**Reference:** See `16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md` for detailed issue-by-issue guide

---

## Securities & Collateral

### Q15: What does "margin call" mean for securities-backed loans?

**A:** A **margin call** is an urgent request for the borrower to **add cash or sell securities** when collateral value drops.

**Trigger:**
- When Loan-to-Value (LTV) ratio exceeds 100%
- **Formula:** LTV = (Loan_Amount / Collateral_Value) × 100

**Example:**
```
Borrower pledges:
- 100 shares of ABC stock
- Current price: $100/share
- Total value: $10,000

Borrows: $8,000 (80% LTV)
Margin Call Threshold: 100% LTV = $8,000 max

Stock price drops to $70:
- New collateral value: $7,000
- LTV now: ($8,000 / $7,000) × 100 = 114%
→ MARGIN CALL TRIGGERED

Borrower must:
- Add $1,000 cash (brings value to $8,000 / 80% LTV), OR
- Sell 30 shares (reduces loan need to $7,000, brings back to 100%)
```

**Automatic Alert:**
- Workflow detects LTV > 100% automatically
- Triggers email alert to borrower
- Must be resolved within 24-48 hours (per policy)

**Risk to Institution:**
- If borrower doesn't respond, collateral value may drop further
- If liquidate at current price, may incur losses
- Rapid price drops create urgent situation

**What To Do:**
- Monitor margin call alerts daily
- Contact borrower immediately upon alert
- Agree on resolution (add funds or sell position)
- Document resolution in loan file
- Escalate if borrower unresponsive (48+ hours)

**Reference:** See `14_SECURITIES_COLLATERAL_GUIDE.md` for detailed securities handling

---

### Q16: Why is the securities collateral value different from what I see in the brokerage account?

**A:** Several reasons for discrepancies:

**Reason 1: Pricing Staleness**
- Dashboard uses end-of-day price from yesterday
- Brokerage shows real-time price (updated continuously)
- **Normal:** Price differences of 0-5% are expected
- **Fix:** Dashboard updates at end of business day

**Reason 2: Haircut Applied**
- MDPA workflow applies haircut to market value
- Actual pledged value = Market Price × (1 - Haircut%)
- Brokerage doesn't show haircut—just market value
- **Example:**
  - Market value: $10,000
  - Haircut: 20% (for stock volatility)
  - MDPA shows: $8,000 (net pledgeable value)
  - Brokerage shows: $10,000
- **This is correct**—haircut reflects actual lending limit

**Reason 3: Valuation Method Difference**
- Brokerage may use bid/ask midpoint
- MDPA may use closing price
- Differences of 0.1-1% are normal

**Reason 4: Timing of Data Extract**
- MDPA processes data once monthly
- Brokerage updates continuously
- If price changed after monthly MDPA run, discrepancy exists
- **Fix:** Wait for next MDPA run or request manual refresh

**What To Do:**
- For small differences (< 2%): Normal, no action needed
- For large differences (> 5%): Investigate
  1. Check pricing source (Bloomberg, broker API, etc.)
  2. Verify collateral list matches between systems
  3. Check if transactions occurred (buys/sells) after MDPA run
  4. Request manual re-valuation if needed

**Reference:** See `14_SECURITIES_COLLATERAL_GUIDE.md` (Valuation section)

---

### Q17: What happens if securities data doesn't arrive in time?

**A:** Workflow has built-in handling for missing securities data:

**If Securities File Completely Missing:**
- Workflow detects missing file at input stage
- Continues processing other data (auto, RE, etc.)
- Securities-backed loans will have NULL collateral values
- QA report flags securities data as missing
- Output includes loans with incomplete collateral information

**If Securities File Incomplete (some loans missing):**
- Workflow processes available securities data
- Loans with missing pricing will have:
  - Previous month's price (if available), OR
  - NULL collateral value
- Margin call alerts won't trigger (can't calculate LTV)
- QA report shows which loans missing pricing

**Workarounds While Awaiting Data:**
1. **Use Previous Month's Pricing:** If acceptable, use prior period's prices (note as stale in report)
2. **Manual Pricing:** Request borrower provide pricing confirmation
3. **Broker Confirmation:** Contact broker for emergency pricing
4. **Hold Delivery:** Wait for securities data before delivering to client (if critical)

**Impact on Client Reporting:**
- QA report documents missing data
- Client dashboard will show NULL values for affected loans
- Alerts explain data gaps
- Credibility depends on transparency about data gaps

**Prevention:**
- Request securities data earlier in month (before deadline)
- Have backup pricing source (Yahoo Finance, broker API)
- Set earlier deadline for securities data submission

**Reference:** See `15_MISSING_SECURITIES_SCENARIOS.md` for detailed scenarios

---

## Dashboard & Reporting

### Q18: What does the "Introduction" tab do?

**A:** The **Introduction tab configures the entire dashboard experience**.

**Key Controls:**
1. **FICO Tier Configuration**
   - Define credit score ranges for tiers
   - Example: Prime >740, Near-Prime 670-740, Subprime <670
   - Changes here affect ALL other tabs
   - Must match your credit policy

2. **Industry Classification** (if applicable)
   - Map industry codes to categories
   - Example: Retail, Manufacturing, Healthcare, etc.
   - Used for concentration analysis

3. **Report Date Selection**
   - Choose which month to analyze
   - Usually set to current month
   - Filters all dashboard data to selected month

**Why It Matters:**
- If FICO tier definitions are wrong, entire dashboard analysis is wrong
- If report date is wrong month, you're analyzing stale data
- Correct configuration is **critical** for valid analysis

**Common Mistakes:**
- Leaving FICO tiers at default (may not match your policy)
- Selecting wrong report date
- Not updating FICO tiers when policy changes

**Before Validation:**
- **Verify** FICO tier definitions match your credit policy
- **Confirm** industry classifications (if applicable)
- **Check** report date is intended month
- If wrong, correct settings and refresh dashboard

**Reference:** See `12_TABLEAU_DASHBOARD_GLOSSARY.md` (Introduction tab section)

---

### Q19: How do I interpret the "Static Pooling" (Vintage) analysis?

**A:** Static Pooling shows **how loans perform by origination year** (vintage).

**What It Shows:**
- Delinquency rates by vintage (year loan was originated)
- Charge-off rates by vintage
- Average loan age and life for each vintage
- Cumulative losses by vintage

**How To Read It:**

```
Example:
2023 Originations (New):      0.2% delinquency,  0.0% charge-off
  → Expected—too new to default

2020 Originations (3 years):   1.2% delinquency,  0.3% charge-off
  → Expected—seasoned, some defaults occurring

2015 Originations (8 years):   0.8% delinquency,  0.8% charge-off
  → Good—many paid off, survivors stable

2010 Originations (13+ years): 0.5% delinquency,  1.2% charge-off
  → Mature—few left, mostly paid off
```

**What It Tells You:**
1. **Performance Curve:** How do loans perform over time?
2. **Portfolio Quality:** Are newer vintages starting stronger?
3. **Loss Expectations:** When do most defaults occur? (usually 2-3 years in)
4. **Portfolio Seasoning:** Is portfolio aging or getting younger?

**Using It for Validation:**
- **Expected:** Newer vintages (< 1 year) should have near-zero delinquency
- **Expected:** 3-5 year old vintages should have peak delinquency/charge-offs
- **Expected:** Old vintages (7+ years) should be lower (survivors stable)
- **Anomaly:** If 8-year vintage has zero charge-offs, question data quality

**Using It for Benchmarking:**
- Compare current vintage performance to historical baselines
- Use to set expectations for new originations
- Identify if credit standards improving/declining

**Example Question:**
"How should our 2024 originations (6 months in) perform?"
- **Answer:** Look at 2023 originations at same age and project forward
- If 2023 vintage at 6 months showed 0.1% delinquency, expect same for 2024

**Reference:** See `12_TABLEAU_DASHBOARD_GLOSSARY.md` (Static Pooling section)

---

### Q20: How should I present MDPA findings to the board?

**A:** Key points to include in executive summary:

**Structure:**
1. **Portfolio Overview** (2-3 slides)
   - Total loans and balance
   - Breakdown by product (auto, home, personal, etc.)
   - Breakdown by credit tier (prime, near-prime, subprime)

2. **Financial Health** (2-3 slides)
   - Delinquency rate (with target comparison)
   - Charge-off rate (with trend)
   - Net interest margin
   - Capital adequacy

3. **Risk Assessment** (2-3 slides)
   - Credit score distribution
   - Concentration risks (top borrowers, industries)
   - Collateral coverage (LTV analysis)
   - Risk scoring distribution

4. **Trends & Comparison** (2-3 slides)
   - Month-over-month changes
   - Year-over-year comparison
   - Vintage analysis (performance by origination year)
   - Peer benchmarking (if available)

5. **Key Findings & Recommendations** (1-2 slides)
   - Top 3 positive findings
   - Top 3 areas of concern
   - Recommended actions/monitoring

**Tone:**
- Use **context**—don't just state metrics, explain what they mean
- Compare to **targets**—is delinquency "good" relative to goal?
- Highlight **trends**—is situation improving or deteriorating?
- Provide **context**—is this normal for this portfolio/economic time?

**Avoid:**
- Too much data (use summary, not detail tables)
- Jargon without explanation (explain "LTV" and why it matters)
- Isolation—don't present metrics without comparison

**Reference:** See `20_QUICK_REF_DASHBOARD_METRICS.md` for metric interpretation

---

## Compliance & Regulatory

### Q21: What regulatory metrics must be monitored?

**A:** Key regulatory metrics depend on your institution type and regulators:

**For Credit Unions (NCUA Oversight):**
1. **Capital Adequacy**
   - Leverage Ratio (≥ 4%)
   - Risk-Based Capital (≥ 8%)
   - Equity Ratio (≥ 4%)

2. **Asset Quality**
   - Delinquency Ratios (30/60/90 DPD)
   - Net Charge-Offs (< 1% annually)
   - Loan Loss Reserve Adequacy

3. **Liquidity**
   - Loan-to-Share Ratio (typically 70-80%)
   - Liquid Assets Ratio (≥ 15%)

4. **Compliance**
   - Fair Lending metrics (disparate impact analysis)
   - Loan Pricing Analysis (by protected characteristics)
   - Concentration Risk Limits (single borrower, industry)

**For Bank Holding Companies (Federal Reserve):**
- Add stress testing requirements
- Add interest rate risk monitoring
- Add operational risk metrics

**MDPA Supports These Through:**
- Delinquency rate reporting (Asset Quality)
- Concentration analysis (Concentration Risk)
- Risk scoring (Credit Risk Assessment)
- Charge-off tracking (Loan Loss Reserve adequacy)

**Required Documentation:**
- Monthly metrics reports (MDPA dashboards)
- Trend analysis (comparing month-to-month)
- Exception reporting (loans exceeding limits)
- Management decisions (actions taken on exceptions)

**When To Escalate:**
- Delinquency > 3% (potential asset quality issue)
- Concentration > 5% (concentration risk limit)
- Charge-off rate > 1% annualized (rising losses)
- Capital ratios < regulatory minimum

**Reference:** Contact your compliance officer or regulator for specific requirements

---

### Q22: How do we ensure MDPA data complies with TILA/ECOA regulations?

**A:** MDPA supports compliance monitoring through:

**TILA Compliance:**
- Verifies interest rates are disclosed and applied correctly
- Checks APR calculations
- Monitors for pricing errors
- Flags loans with rate changes requiring disclosure

**ECOA Compliance:**
- Tracks loan pricing by protected characteristics (age, race, gender, national origin)
- Identifies disparate impact (pricing differences by protected class)
- Monitors credit approvals by demographics
- Generates disparate impact analysis

**MDPA Features for Compliance:**
1. **Field Availability:** All credit metrics captured for analysis
2. **Demographic Mapping:** Borrower characteristics available
3. **Pricing Analysis:** Interest rates and APRs tracked
4. **Trend Reports:** Month-to-month compliance monitoring
5. **Alert Triggers:** Automatic flagging of compliance issues

**Using MDPA for Fair Lending Analysis:**
- Export borrower demographics from dashboard
- Compare pricing/approval rates by protected characteristic
- Calculate disparate impact ratios (typically use 80% rule)
- Document analysis in compliance file

**Good Practices:**
- Quarterly compliance reviews using MDPA data
- Regular fair lending testing
- Board reporting on ECOA/TILA metrics
- Documentation of findings and remediation

**Important Notes:**
- MDPA supports compliance monitoring but isn't substitute for formal compliance audit
- Partner with compliance officer for interpretation
- Maintain audit trail of all compliance analysis

**Reference:** Contact Legal/Compliance department for detailed requirements

---

### Q23: How do we validate that MDPA output is accurate?

**A:** SME validation is the final quality gate before production use. Steps:

**Phase 1: Data Quality Validation (Before Processing)**
- [ ] Verify all input files received
- [ ] Check file formats match specification
- [ ] Spot-check source data (100-200 sample records)
- [ ] Verify no obvious source system errors

**Phase 2: Process Validation (After Workflow Completes)**
- [ ] Check QA report for data quality issues
- [ ] Spot-check calculated fields (Risk_Score, LTV, etc.)
- [ ] Verify record counts match expectations
- [ ] Check for unexpected NULLs or outliers

**Phase 3: Metric Validation (Against Baselines)**
- [ ] Delinquency rate: Within historical range?
- [ ] Charge-off rate: Within expectations?
- [ ] Credit score distribution: Expected shape?
- [ ] Concentration metrics: No surprises?

**Phase 4: Dashboard Validation**
- [ ] Verify dashboard metrics match output files
- [ ] Check filters work correctly
- [ ] Validate sample calculations manually
- [ ] Confirm data freshness timestamp

**Phase 5: Client Validation (Final Sign-Off)**
- [ ] Client reviews key metrics
- [ ] Client compares to their expectations
- [ ] Client signs off on accuracy
- [ ] Document any discrepancies found

**Tools for Validation:**
- QA Report (automated quality check)
- Loan-level export (verify sample records)
- Dashboard downloads (compare calculated metrics)
- Source system comparison (spot-check against original)

**Common Issues Found During Validation:**
1. Missing enrichment data (RE values, credit scores)
2. Calculation errors (formula wrong or inputs incorrect)
3. Data quality issues (duplicates, out-of-range values)
4. Dashboard filter issues (showing filtered vs. total data)

**If Issue Found:**
- Document specific example (loan ID, field, issue)
- Determine root cause (source data vs. workflow logic)
- Fix issue in workflow or source system
- Re-run workflow with corrected data
- Re-validate corrected output

**Reference:** See `16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md` for issue-by-issue resolution

---

## Additional Resources

- **8_README.md** - Documentation index and quick start guide
- **4_DATA_SOURCES_AND_LOCATIONS.md** - Data source specifications and file locations
- **16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md** - Detailed 7-stage troubleshooting guide
- **Quick Reference Guides** - 17-21_QUICK_REF_*.md for specific topics
- **14_SECURITIES_COLLATERAL_GUIDE.md** - Securities handling and margin calls
- **15_MISSING_SECURITIES_SCENARIOS.md** - Edge cases and exception handling
- **6_FIELD_MAPPING_AND_DATA_LINEAGE.md** - Complete field documentation and formulas

---

**Last Updated:** 2026-03-18
**Document Purpose:** FAQ for SME validation, client support, and troubleshooting
**Feedback:** Contact data architect with questions or suggested additions
