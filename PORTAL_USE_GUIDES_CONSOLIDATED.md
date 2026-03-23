# Portal Use Guides - Consolidated Reference

**Purpose:** Consolidated reference guide to all 6 portal documentation sources used for MDPA knowledge transfer

**Created:** 2026-03-23
**Status:** Ready for team reference during knowledge transfer (Weeks 1-6)
**Audience:** Sprintendo team members, domain experts, new hires

---

## Document Overview

This consolidated guide provides structured access to the 6 portal documentation sources that form the foundation of the MDPA knowledge transfer program. Instead of navigating multiple PDFs, team members can reference key sections here while the full PDFs remain available for detailed study.

| Portal Document | Pages | Focus Area | Knowledge Transfer Sessions |
|-----------------|-------|-----------|---------------------------|
| Fair Lending User Guide | ~80 | BISG algorithm, ethnicity prediction, fair lending compliance | 2A (Fair Lending Deep Dive) |
| CECL User Guide | 159 | CECL methodologies, formulas, calculation logic | 2B, 3A, 3B, 4A, 4B |
| CECL Model Certification | ~40 | MountainView validation, model assurance, regulatory compliance | 4C (Data Quality) |
| Portal Updates Q3 2023 | ~30 | System changes (Aug-Sept 2023), feature releases | 1A (Q3 2023 System Changes) |
| Advanced Benchmarking Guide | ~60 | Peer benchmarking tools, HMDA, Metro analysis | 5A (Dashboard Ecosystem) |
| TTAData Vision v2022.1 Release Notes | ~25 | System enhancements, breaking changes, fixes | 1A, throughout |

---

## Part 1: Fair Lending User Guide

**Source:** PORTAL_FAIR_LENDING_USER_GUIDE.pdf
**Knowledge Transfer Session:** 2A - Fair Lending Analysis Deep Dive (120 min)
**Primary Audience:** Venkat (TPA), Bhavani (BI), Preeti (QA), Yomar (PM)

### Overview

The Fair Lending component uses CFPB-approved BISG (Bayesian Improved Surname Geocoding) methodology to predict borrower ethnicity and gender, enabling fair lending compliance analysis and regulatory reporting.

### BISG Algorithm - 5-Step Process

**Step 1: Surname Prediction**
- Analyzes borrower surname against database of surnames with known ethnic distributions
- Produces: Probability distribution across ethnic categories
- Example: Surname "Garcia" → Likely Hispanic (80%), White (15%), Other (5%)

**Step 2: Metro Area Mapping**
- Maps borrower address to metro statistical area (MSA)
- Uses geographic granularity for census data alignment
- Handles: Urban, suburban, rural classifications

**Step 3: Census Data Lookup**
- Retrieves demographic distribution for metro area from U.S. Census
- Uses: Decennial census or latest American Community Survey (ACS)
- Data elements: Ethnic distribution by geography

**Step 4: Bayesian Calculation**
- Combines surname probability + geographic distribution using Bayes' theorem
- Formula: P(Ethnicity | Surname, Geography) = P(Ethnicity, Geography) × P(Surname | Ethnicity) / P(Surname)
- Output: Updated probability for each ethnicity category

**Step 5: Geographic Adjustment**
- Applies final adjustment based on metro-level demographics
- Produces final: Predicted Ethnicity (4 categories), Confidence Score

### Output Fields

**Primary Outputs:**
- **Predicted_Ethnicity:** Category assignment (Hispanic, Non-Hispanic White, Non-Hispanic Black, Non-Hispanic Asian, Other)
- **Ethnicity_Confidence:** Score (0-100) indicating prediction confidence
- **Predicted_Gender:** Male, Female, or Unknown
- **Gender_Confidence:** Score (0-100) indicating prediction confidence

**Secondary Outputs:**
- **Ethnicity_Probability_Distribution:** Percentages for each category (adds to 100%)
- **Alternative_Ethnicities:** Next-most-likely categories and their probabilities
- **Algorithm_Notes:** Flags for ambiguous cases, missing data, etc.

### Fair Lending Dashboards (9 Total)

**Rate Variance Analysis (3 dashboards):**
1. **Approval Rate by Ethnicity** - Compares approval rates across protected classes
2. **Interest Rate by Ethnicity** - Identifies pricing disparities
3. **Loan Amount by Ethnicity** - Detects discrimination in loan sizing

**Charge-Off Analysis (3 dashboards):**
4. **Charge-Off Rate by Ethnicity** - Performance comparison across groups
5. **Delinquency Trend by Ethnicity** - Early warning for risky segments
6. **Loss Recovery by Ethnicity** - Collections performance variance

**Redlining & Geographic Analysis (3 dashboards):**
7. **Approval Rate by Metro Area** - Geographic disparities
8. **Portfolio Concentration by Ethnicity** - Market penetration analysis
9. **Fair Lending Compliance Report** - Regulatory summary

### Regulatory Framework

**Applicable Laws:**
- **ECOA (Equal Credit Opportunity Act):** Prohibits discrimination based on protected class (race, color, religion, national origin, sex, marital status, age)
- **FHA (Fair Housing Act):** Covers real estate lending; overlaps with ECOA
- **Dodd-Frank Act, Section 1071:** Fair lending data collection and reporting

**Regulatory Examination Focus:**
- CFPB fair lending exams use dashboard outcomes to identify patterns of discrimination
- Automated systems (like BISG) are subject to fairness audits
- Confidence thresholds and prediction accuracy are validated

### Key Implementation Notes

**Data Requirements:**
- Borrower name (first + last)
- Borrower address (street, city, state, ZIP)
- Loan approval decision
- Loan terms (rate, amount, type)

**Quality Controls:**
- Names with < 50% confidence excluded from trend analysis (flagged as "unclassified")
- Geographic mismatches (address in one state, metro in another) trigger manual review
- Missing data (partial names, addresses) handled via "Unknown" category

**When to Escalate:**
- Statistically significant disparities (p < 0.05) in any dashboard
- Unexplained rate variance (e.g., approved rate 85% vs. 60% between groups)
- Pattern of disparities across multiple dashboards (multi-variable discrimination)
- Outlier loans (e.g., approved with rate 2% below market for specific ethnicity)

### Session 2A Deliverable

**Fair Lending Technical Runbook** should document:
- BISG algorithm walkthrough with test data
- Dashboard navigation and metric interpretation
- When to escalate and regulatory contact procedures
- Monthly fair lending monitoring checklist
- CFPB examination preparation steps

---

## Part 2: CECL User Guide

**Source:** PORTAL_CECL_USER_GUIDE.pdf (159 pages)
**Knowledge Transfer Sessions:** 2B, 3A, 3B, 4A, 4B
**Primary Audience:** Bhavani (BI), Preeti (QA), Venkat (TPA)

### Overview

CECL (Current Expected Credit Losses) is a forward-looking methodology for calculating loan loss reserves. MDPA implements 4 CECL methods, each appropriate for different portfolio types and risk profiles.

### 4 CECL Methodologies

#### Methodology 1: Vintage Method (Historical Loss Pooling)

**When to Use:**
- Portfolios with 5+ years of historical loss data
- Relatively stable loan products (consistent origination/maturity)
- Sufficient loan volume for statistical reliability (>100 loans per vintage)

**Calculation Steps:**
1. **Group loans by origination year** (vintage)
2. **Calculate historical loss rate for each vintage:**
   - Loss Rate Year N = (Total Charge-Offs in Year N) / (Average Portfolio Balance in Year N)
   - Example: $50K charge-offs / $2.5M avg balance = 2.0% loss rate

3. **[Q3 2023 UPDATE] Average all years in lookback (including zero-loss years):**
   - Old method: Average only years with losses → May overstate losses
   - New method: Average ALL years → More conservative, statistically accurate
   - Example: (2.0% + 8.0% + 0.0%) / 3 = 3.3% (vs. old (2.0% + 8.0%) / 2 = 5.0%)

4. **Construct expected loss curve:**
   - Plot Year 1-7 expected losses based on historical performance
   - Example Year 1 loss = 3.3% × 1.0, Year 2 loss = 3.3% × 1.2, Year 3 = 3.3% × 1.5, etc.
   - Curve reflects that newer loans typically have lower loss rates

5. **Apply pro-rata allocation by month-of-origin:**
   - Loans from Q1 2023 assigned Year 1 loss rates
   - Loans from Q2 2022 assigned Year 2 loss rates
   - Distribution: Spreads loss rate over life of loan

6. **Calculate reserve:**
   - Reserve = Loan Balance × Loss Rate × (1 - Recovery Factor)
   - Recovery Factor = 1 - (Recovery Amount / Gross Charge-Off Amount)
   - [Q3 2023 UPDATE] Charge-offs are GROSS (not net); recovery applied separately

**Advantages:**
- Uses actual historical loss data (most relevant)
- Captures portfolio-specific risk
- Aligns with common credit union underwriting

**Disadvantages:**
- Requires 5+ years of history
- Assumes past performance predicts future (may not hold in economic shifts)
- Not sensitive to current credit quality changes

#### Methodology 2: Vintage Q Method (Adjusted Vintage)

**When to Use:**
- Vintage method baseline, with expected economic/credit condition changes
- Portfolio management wants to adjust for qualitative factors

**Calculation Steps:**
1. **Start with Vintage Expected Loss (from Methodology 1)**
2. **Identify qualitative adjustment factors:**
   - Economic conditions (recession, growth, stable)
   - Credit trend changes (tightened standards, loosened standards)
   - Management changes (new underwriting staff, system upgrades)
   - Portfolio composition changes (shift from auto to mortgage)

3. **Estimate adjustment range:**
   - Conservative case: +25% adjustment (expect worse losses than history)
   - Base case: 0% adjustment (history repeats)
   - Optimistic case: -10% adjustment (expect better than history)

4. **Apply adjustment:**
   - Adjusted Reserve = Vintage Reserve × (1 + Qualitative Adjustment)
   - Example: Vintage Reserve $5M × (1 + 0.15) = $5.75M [15% upward adjustment]

**Advantages:**
- Uses historical loss data foundation
- Incorporates forward-looking adjustments
- Balanced between data-driven and judgment-based

**Disadvantages:**
- Qualitative adjustment is subjective
- Difficult to defend to regulators (requires strong documentation)
- Still dependent on historical patterns

#### Methodology 3: PD Method (Probability of Default)

**When to Use:**
- Portfolios with robust credit score/FICO data
- Larger institutions with sophisticated risk models
- When credit quality changes significantly (tightened/loosened underwriting)

**Calculation Steps:**

1. **Determine Probability of Default (PD) for each borrower:**
   - PD Table: Credit Score → Default Probability mapping
   - Example: FICO 750 → PD = 0.8%, FICO 650 → PD = 3.5%, FICO 550 → PD = 10%
   - [Q3 2023 UPDATE] Null credit scores assigned PD = score 0 (highest risk, ~15%)

2. **Calculate Loss Given Default (LGD):**
   - LGD = 1 - (Collateral Recovery Value / Loan Balance)
   - Collateral hierarchy:
     - First mortgage: Collateral priority, lower LGD
     - Junior mortgage: Subordinated, higher LGD
     - Unsecured: No collateral, LGD ≈ 100%
   - [Q3 2023 UPDATE] LGD capped at current loan balance (prevents unrealistic stress reserves)

3. **Calculate Expected Loss (EL):**
   - EL = Loan Balance × PD × LGD
   - Example: $100K loan, PD=3%, LGD=40% → EL = $100K × 0.03 × 0.40 = $1,200

4. **Apply forecast period:**
   - CECL is forward-looking over remaining loan life
   - PD × LGD applied to each period's expected balance
   - Total reserve = Sum of period ELs

**Advantages:**
- Current credit quality reflected (responsive to score changes)
- Forward-looking over loan life
- Sophisticated, defensible to regulators

**Disadvantages:**
- Requires credit score/FICO data (not all borrowers have scores)
- More complex calculation
- Depends on accuracy of PD tables and LGD assumptions

#### Methodology 4: WARM Method (Call Report Method)

**When to Use:**
- Small portfolios with minimal credit data
- Regulatory call report used as primary source
- Simplest, most conservative approach

**Calculation Steps:**

1. **Classify loans using WARM categories:**
   - WARM = Weighted Average Risk Measurement (Call Report classification)
   - Categories: Pass, Special Mention, Substandard, Doubtful, Loss
   - Each category assigned fixed loss rate (regulatory guidance)

2. **Apply fixed loss rates by classification:**
   - Pass: 0.5% loss rate
   - Special Mention: 5% loss rate
   - Substandard: 20% loss rate
   - Doubtful: 50% loss rate
   - Loss: 100% loss rate (written off)

3. **Calculate reserve:**
   - Reserve = Loan Balance × Classification-Specific Loss Rate
   - Example: $100K "Special Mention" → $100K × 5% = $5,000

**Advantages:**
- Simplest method
- Uses call report data (already maintained)
- Most conservative (higher loss rates)
- Easiest to explain to regulators

**Disadvantages:**
- Fixed loss rates may not reflect portfolio
- Not sensitive to credit score improvements
- Can overstate reserve for prime portfolio

### Methodology Selection Guide

**Decision Tree:**

```
Is this the largest credit union in peer group?
  YES → Does portfolio have strong FICO distribution?
    YES → Use PD Method (most sophisticated)
    NO  → Use Vintage Q Method (less credit-dependent)
  NO  → Check portfolio complexity
    Complex (5+ loan types) → Use Vintage Q Method
    Simple (2-3 types) → Use WARM Method (simplest)
```

**Regulatory Considerations:**
- CECL is reasonable (defensible to CFPB/OCC examiners)
- Document methodology selection rationale
- Annual review: Can change method, but document why
- Stress testing: Apply all methods to understand sensitivity

### Expected Loss Curves & Vintage Adjustment

**Expected Loss Curve Structure:**

```
Year of Loan Life:  1      2      3      4      5      6      7
Base Loss Rate:     3.3%   3.3%   3.3%   3.3%   3.3%   3.3%   3.3%
Vintage Multiplier: 1.0x   1.2x   1.5x   1.8x   2.0x   1.8x   1.5x
Adjusted Loss Rate: 3.3%   4.0%   5.0%   5.9%   6.6%   5.9%   5.0%
```

**Interpretation:**
- Year 1 loan has 3.3% expected loss
- Year 3 loan (mid-life) has highest loss rate (5.0%)
- Curve reflects that mid-life loans are riskier (longer time to default)

**Cohort Construction Example:**
- Loans originated Q1 2020 → Year 3 loans as of Q1 2023
- Apply Year 3 multiplier (1.5x) → 3.3% × 1.5 = 5.0% loss rate
- Distribution: If 10K loans in cohort, expected loss = $5.0M (assuming $1M avg balance)

### Pro-Rata Allocation Logic

**Purpose:** Distributes annual expected loss across month-of-origin

**Example (Q1 2023 Loans, Annual Loss Rate = 3.3%):**
- January 2023 loans: ~33% of Q1 volume → Allocated 33% of Q1 loss
- February 2023 loans: ~33% of Q1 volume → Allocated 33% of Q1 loss
- March 2023 loans: ~34% of Q1 volume → Allocated 34% of Q1 loss

**Effect:** Month-of-origin impacts expected loss (earlier months have slightly more loss if curve slopes up)

### Scenario Weighting

**Purpose:** Apply stress scenarios to expected loss methodologies

**Scenarios Available:**
- **Base Case:** PD × LGD as calculated (1.0x multiplier)
- **Recession Scenario:** Economic downturn assumption (1.5x multiplier → 50% higher losses)
- **Growth Scenario:** Economic expansion assumption (0.8x multiplier → 20% lower losses)

**[Q3 2023 NEW] Weighted Scenarios for Vintage:**
- Previously: Scenarios only applied to PD method
- Now: Dashboard shows weighted scenario losses for Vintage method too
- Calculation: Vintage Expected Loss × Scenario Multiplier

**Example:**
- Vintage Expected Loss: $5M
- Recession scenario (1.5x): $5M × 1.5 = $7.5M
- Growth scenario (0.8x): $5M × 0.8 = $4M
- Dashboard shows all three for comparison/stress testing

### Unfunded Commitment Treatment

**Definition:** Unused portion of credit lines and commitments

**By Methodology:**

**Vintage Method:**
- ACL for unfunded = Expected loss rate × Unfunded amount × Coverage period
- Coverage period = Estimated time before withdrawal (typically 3-5 years)
- Example: $10M unfunded × 3.3% loss rate × 3-year coverage = $990K ACL

**PD Method:**
- ACL for unfunded = Unfunded amount × PD × LGD × (Probability of Drawing × Coverage Period)
- More refined: accounts for likelihood of drawdown
- Example: $10M × 2% PD × 50% LGD × (30% draw rate × 3 years) = $90K ACL

**WARM Method:**
- Fixed percentage of unfunded (regulatory guidance)
- Typically 2-5% of unfunded amount
- Example: $10M × 3% = $300K ACL

### Loss Given Default - Collateral Valuation

**Hierarchy of Collateral:**

```
1. Primary Mortgage (1st lien position)
   - Priority: Highest
   - LTV (Loan-to-Value): Typically 50-80%
   - LGD: Low (20-30%)

2. Home Equity Line/2nd Mortgage
   - Priority: Second
   - LTV: Typically 80-100% of equity
   - LGD: Higher (40-60%)

3. Vehicle/Auto Loan
   - Priority: Highest (if titled)
   - LTV: Typically 60-80%
   - LGD: Moderate (30-50%)

4. Personal Loan/Unsecured
   - Priority: None
   - LTV: N/A
   - LGD: Highest (70-100%)
```

**LGD Calculation Example:**

```
Loan Balance: $100,000
Collateral Type: Home (primary mortgage)
Appraised Value: $300,000
Loan-to-Value: $100K / $300K = 33%
Recovery Value (conservative): $300K × 80% = $240K
Haircut for 2nd mortgages: -$50K (assumed junior lien)
Net Recovery: $240K - $50K = $190K
LGD: 1 - ($190K / $100K) = 1 - 1.9 = -0.9 (capped at 0%)
Interpretation: Expected recovery EXCEEDS loan balance (low risk)
```

**[Q3 2023 UPDATE] Superior Mortgages LGD Cap:**
- LGD reserve capped at current loan balance
- Prevents reserves from exceeding principal in stress scenarios
- Example: If LGD calculation = $150K on $100K loan, reserve = MIN($150K, $100K) = $100K

### Session 2B-4B Deliverables

**Methodology Decision Tree** → Decision Log 2B.001
**Vintage Walkthrough with Test Data** → Deliverable from 3A
**PD Calculation Validation Suite** → Deliverable from 3B
**Scenario Adjustment Decision Log** → Decision Log 4A.001
**Unfunded Commitment Treatment Guide** → Deliverable from 4B

---

## Part 3: CECL Model Certification

**Source:** PORTAL_CECL_MODEL_CERTIFICATION.pdf (~40 pages)
**Knowledge Transfer Session:** 4C - Data Quality & QA Procedures (90 min)
**Primary Audience:** Preeti (QA), Venkat (TPA), Yomar (PM)

### Overview

Model certification documents are regulatory requirements proving that CECL calculations are accurate, reasonable, and defensible. MountainView validation is the formal certification process used by the credit union's regulator.

### Model Validation Framework

**Three Pillars of Validation:**

**1. Model Governance**
- CECL model owner identified (typically CRO or Chief Risk Officer)
- Model development process documented
- Change control procedures in place
- Regular review schedule (annually minimum)

**2. Model Performance Testing**
- Backtesting: Compare actual loss experience vs. predicted losses
- Sensitivity testing: How much does reserve change with 1% interest rate change?
- Stress testing: Portfolio impact under recession/growth scenarios
- Benchmarking: Reserve levels vs. peer institutions

**3. Model Documentation**
- Methodology clearly described
- Data sources and assumptions documented
- Validation results recorded
- Any limitations noted

### MountainView Validation

**What is MountainView?**
- Third-party validation service used by FFIEC-regulated institutions
- Reviews CECL model for reasonableness, compliance, and defensibility
- Produces certification report (required for regulatory exams)

**MountainView Review Process:**

1. **Model Submission**
   - Submit: MDPA workflow, macro code (if accessible), test data samples
   - Include: Methodology documentation, data sources, assumptions
   - Timeline: 4-6 weeks for comprehensive review

2. **Testing & Validation**
   - MountainView tests model logic against methodologies
   - Replicates calculations from sample data
   - Verifies data quality controls
   - Checks for errors or inconsistencies

3. **Findings & Recommendations**
   - MountainView issues findings if issues found
   - Recommendations for improvements
   - Risk areas highlighted

4. **Certification**
   - If all findings addressed: Certification issued
   - Valid for 12 months (annual recertification required)
   - Certificate presented to regulators during exams

### CECL Model Assurance Requirements

**Regulatory Expectations:**

**ALLL (Allowance for Loan and Lease Losses) Policy:**
- Credit union must have written CECL policy
- Policy documents methodology selection rationale
- Includes governance and change control

**Documentation Requirements:**
- CECL calculation models documented (Excel, Alteryx, SQL)
- Data sources and extraction logic documented
- Assumptions (PD tables, LGD estimates, forecast period) documented
- Rationale for methodology choice documented

**Data Quality Requirements:**
- Loan data: Complete and accurate as of reporting date
- Historical loss data: Audited or verified for several years
- Collateral data: Regularly updated appraisals (within 3 years)
- Credit scores: Current (within 90 days for PD method)

**Testing & Validation Requirements:**
- Monthly results reviewed for reasonableness (prior month comparison)
- Annual backtesting: Compare predicted vs. actual losses
- Stress testing: CCAR scenarios or internal scenarios
- Change documentation: When methodology changes, rationale documented

**Governance Requirements:**
- Model risk committee (or equivalent) reviews results monthly
- Changes require committee approval
- Independent review of model (not by model developer)
- Board oversight (at least quarterly reporting)

### Regulatory Compliance Checkpoints

**CFPB Fair Lending Exam Focus:**
- Does model inadvertently discriminate? (Fair lending analysis required)
- Are loss assumptions consistent across protected classes?
- Are outlier loans properly identified and reviewed?

**OCC/Federal Reserve Exam Focus:**
- Is CECL reasonable and defensible?
- Are assumptions documented and justified?
- Does model comply with ASC 326 (accounting standard)?
- Are stress scenarios appropriate?

**State Regulator Exam Focus:**
- State-specific capital requirements (CECL reserve impacts capital)
- Dividend restrictions (if reserve drops, may impact dividend capacity)
- Loan loss reserve adequacy (reserve as % of portfolio)

### Session 4C Deliverable

**Updated QA Runbook for Q3 2023 Changes** should document:
- New null credit score validation (C01)
- Gross vs. net charge-off verification (C02)
- Loss rate averaging inclusion of zero-loss years (C03)
- Weighted scenario output validation (C04)
- LGD cap verification (C05)
- MountainView recertification process
- Monthly model reasonableness review checklist

---

## Part 4: Portal Updates Q3 2023

**Source:** PORTAL_UPDATES_Q3_2023.pdf (~30 pages)
**Knowledge Transfer Session:** 1A - Q3 2023 System Changes & Updates Orientation (90 min)
**Also Covered In:** 3A, 3B, 4A, 4B, 4C, 5A
**Primary Audience:** Entire Sprintendo team

### Overview

Critical system updates released August-September 2023 that changed how MDPA calculates reserves, handles data, and displays results. 7-month gap between system release and MDPA documentation completion creates operational risk.

### Change Summary

| Change ID | Change Name | Release Date | Priority | Impact |
|-----------|------------|--------------|----------|--------|
| C01 | PD Null Credit Score Handling | Aug 30, 2023 | CRITICAL | All PD-based methods |
| C02 | Gross vs. Net Charge-Offs | July 2022 | CRITICAL | Vintage, Vintage Q, WARM methods |
| C03 | Vintage Loss Rate Averaging | July 2022 | CRITICAL | Vintage, Vintage Q methods |
| C04 | Weighted Scenarios (Vintage) | New Q3 2023 | HIGH | Dashboard output, scenario analysis |
| C05 | LGD Cap (Superior Mortgages) | Q3 2023 | MEDIUM | PD method stress scenarios |
| C06 | Dashboard Reorganization | Aug 28-31, 2023 | MEDIUM | Client navigation, user training |

### Detailed Changes

**[See WEEK_1_SESSION_OUTLINES.md for detailed talking points on each change (C01-C06)]**

### Deployment Status Check

**Questions to Answer:**

1. **Is the Sept 2023 version deployed in production?**
   - Answer: Check system version tag or release notes
   - Impact: Team procedures must match deployed version

2. **Are all 6 changes implemented or partial?**
   - Some changes may be phased
   - Check deployment schedule from portal updates documentation

3. **Are there any known issues or limitations?**
   - Portal updates may include bug fixes in later patches
   - Check for v2022.1.1, v2022.1.2 patches released after initial Q3 2023 release

4. **Do MDPA macros correctly implement all changes?**
   - Requires technical validation
   - Session 3B (PD Methodology) validates null credit score handling
   - Session 3A (Vintage) validates loss rate averaging

### Session 1A Deliverable

**Updated MDPA Procedures & Checklist** should document:
- Which Q3 2023 changes are operationally relevant (all 6)
- Team member responsibility for each change (per WEEK_1_SESSION_OUTLINES.md)
- Deployment status (when deployed, any rollback procedures)
- Month-end execution updates (how to verify changes are working)

---

## Part 5: Advanced Benchmarking Guide

**Source:** PORTAL_ADVANCED_BENCHMARKING_GUIDE.pdf (~60 pages)
**Knowledge Transfer Session:** 5A - Dashboard Ecosystem & Tableau Integration (90 min)
**Primary Audience:** Bhavani (BI), Yomar (PM)

### Overview

Benchmarking tools compare credit union's performance against peer group, enabling competitive analysis, strategic planning, and regulatory compliance assessment.

### Peer Group Benchmarking

**Peer Group Definition:**
- Credit unions grouped by asset size, field of membership, geographic region
- MDPA peer group: Typically 20-50 similar institutions
- Data source: Call Reports, HMDA, peer group studies

**Common Benchmarking Metrics:**

**Profitability:**
- Net Interest Margin (NIM): Interest income as % of assets
- Return on Assets (ROA): Net income / average assets
- Return on Equity (ROE): Net income / average equity
- Efficiency Ratio: Operating expenses / operating income

**Credit Quality:**
- Non-performing Loans (NPL) ratio: NPL / total loans
- Net charge-offs: Actual losses / average loans
- Provision for losses: Reserve / average loans
- Coverage ratio: Reserve / NPLs

**Fair Lending Compliance:**
- Approval rate by ethnicity (comparable to peer)
- Interest rate spread by ethnicity
- Loan amount by ethnicity
- Geographic concentration analysis

**Capital & Liquidity:**
- Capital adequacy ratio: Capital / risk-weighted assets
- Liquid assets ratio: Liquid assets / total assets
- Loan-to-deposit ratio: Loans / deposits

### HMDA & Metro Report Analysis

**HMDA (Home Mortgage Disclosure Act) Data:**
- Publicly available mortgage lending data
- Includes: Approval rates, denial rates, loan amounts, applicant demographics
- Used for: Fair lending analysis, market penetration assessment

**Metro Area Reporting:**
- Breaks down lending by geographic metro area
- Shows: Market share in each metro, competitive positioning
- Used for: Strategic expansion decisions, market analysis

**Analysis Techniques:**
- Approval rate disparity analysis (are minorities approved at lower rate?)
- Pricing analysis (are minorities charged higher rates?)
- Loan amount analysis (are loan sizes comparable?)
- Geographic concentration (are minorities underserved?)

### Benchmarking Dashboards in MDPA

**Dashboard 1: Peer Comparison**
- Metric: Credit union vs. peer average vs. peer median
- Example: NPL ratio 3.2% vs. peer avg 2.8% vs. peer median 2.5% (BELOW median = good)
- Trend: 12-month trend showing improvement/deterioration

**Dashboard 2: Fair Lending Peer Comparison**
- Metric: Approval rate by ethnicity vs. peer average
- Example: Hispanic approval 82% vs. peer avg 79% (ABOVE peer = good)
- Outlier flagging: If variance > 5%, flag for investigation

**Dashboard 3: HMDA Analysis**
- Metric: Market share by metro and product type
- Example: Mortgage market share Chicago metro: 2.3% (4th largest lender)
- Trend: Market share gains/losses by metro

**Dashboard 4: Geographic Heatmap**
- Metric: Loan originations by metro area
- Color coding: Green (high penetration), yellow (medium), red (low penetration)
- Strategy use: Identifies expansion opportunities or concentration risks

### WARM Methodology (Benchmarking Context)

**WARM = Weighted Average Risk Measurement**

**Purpose:** Standardized risk classification across institutions

**Classification Categories:**

1. **Pass** - Loan performing normally, low risk
2. **Special Mention** - Potential weakness, elevated risk
3. **Substandard** - Significant weakness, higher probability of loss
4. **Doubtful** - Loss probable but not yet recognized
5. **Loss** - Loss is evident, should be charged off

**Benchmarking Use:**
- Compare % of portfolio in each category
- Example: Credit union 15% substandard vs. peer avg 8% (higher risk profile)
- Trend: Is portfolio deteriorating (more substandard) or improving (fewer substandard)?

### CECL Benchmarking

**Key Question:** Is our reserve adequate?

**Benchmarking Approaches:**

1. **Reserve as % of Loans:**
   - Credit union: 2.2% reserve / total loans
   - Peer avg: 2.0%
   - Interpretation: Credit union 10% higher reserve (more conservative)

2. **Reserve Coverage of NPLs:**
   - Coverage = Reserve / NPLs
   - Credit union: 150% (reserve covers 150% of NPLs)
   - Peer avg: 120%
   - Interpretation: Higher coverage = more conservative (good for stress scenarios)

3. **Vintage Loss Curve Validation:**
   - Compare credit union's loss curve to peer curves
   - Example: Peer average Year 3 loss = 5%, credit union 5.2% (slight difference, reasonable)

### Session 5A Deliverable

**Updated Dashboard Navigation Guide** should document:
- All 23+ dashboard tabs with purpose and primary users
- Fair Lending tabs and when to investigate disparities
- CECL tabs and reserve validation procedures
- Peer benchmarking tabs and interpretation
- Q3 2023 dashboard changes (new columns, tab reordering)

---

## Part 6: TTAData Vision v2022.1 Release Notes

**Source:** PORTAL_TTADATA_VISION_V2022.1_RELEASE_NOTES.pdf (~25 pages)
**Knowledge Transfer Session:** Throughout (referenced in 1A, architecture discussions)
**Primary Audience:** Bhavani (BI), Venkat (TPA)

### Overview

TTAData is the underlying platform that powers MDPA. Release v2022.1 included system enhancements, breaking changes, and fixes that affect workflow stability and calculation accuracy.

### Release Information

**Release Date:** Nov 2023 (retrospective documentation)
**Scope:** Major version release (v2022.1)
**Impact Level:** High (multiple breaking changes)
**Migration Path:** Automated upgrade with testing required

### Key Enhancements

**1. Database Performance Improvements**
- Query optimization: 20-30% faster data extraction
- Index improvements: Reduced lock contention
- Impact on MDPA: Stage 1 (Data Extraction) runs faster

**2. Macro Engine Enhancements**
- New functions: Additional date/time, string manipulation functions
- Error handling: Better error messages for troubleshooting
- Logging: Enhanced diagnostic logging
- Impact on MDPA: Better troubleshooting info when issues occur

**3. Calculation Engine Updates**
- Floating-point precision: Improved accuracy for very small numbers
- Rounding consistency: Standardized rounding (away from zero)
- Impact on MDPA: Reserve calculations may change slightly due to rounding precision

**4. Data Validation Framework**
- Extended validation: More fields now validated
- Custom rules: Support for business-logic validation
- Constraint checking: Enforces data relationships
- Impact on MDPA: Stage 2 (Data Transformation) has more validation options

### Breaking Changes

**Breaking Change #1: NULL Handling**
- Old behavior: NULL treated as 0 in comparisons
- New behavior: NULL treated as distinct value (NULL ≠ 0)
- MDPA Impact: Must explicitly handle NULLs (e.g., COALESCE function)
- [Related to C01: PD Null Credit Score Handling]

**Breaking Change #2: Date Arithmetic**
- Old behavior: Date - Date = number of days
- New behavior: Date - Date = explicit interval type
- MDPA Impact: Some date calculations may need recoding

**Breaking Change #3: Division by Zero**
- Old behavior: Division by zero returns error
- New behavior: Division by zero returns NULL (instead of error)
- MDPA Impact: Macros that divide by zero (e.g., loss rate = losses / 0 if no volume) now return NULL instead of stopping

### Bug Fixes

**Fix #1: Decimal Precision in Percentages**
- Issue: 2.0% + 8.0% = 10.000000000001% (rounding error)
- Fix: Rounding standardized to 4 decimal places for percentages
- MDPA Impact: Reserve totals may shift slightly

**Fix #2: Date Filtering Logic**
- Issue: Date filters including/excluding boundary dates inconsistent
- Fix: Standardized to inclusive of start date, exclusive of end date
- MDPA Impact: Vintage cohort boundaries may shift slightly

**Fix #3: Aggregation Functions with Empty Sets**
- Issue: SUM of empty set returns 0, but logically should be NULL
- Fix: SUM now returns NULL for empty sets (more statistically correct)
- MDPA Impact: Some aggregations in Stage 5 may need recoding

### Compatibility & Migration

**Backward Compatibility:**
- v2022.1 NOT backward compatible with v2021.x
- Must migrate all workflows
- Previous version support: 6 months (then deprecated)

**Migration Checklist:**
- [ ] Test all breaking changes in test environment
- [ ] Verify macro code compiles without errors
- [ ] Validate calculation results (compare to prior version)
- [ ] Review error logs for any new warnings
- [ ] Update documentation for any code changes
- [ ] User acceptance testing (UAT) before production deployment

**Testing Recommendations:**
- Run full MDPA workflow on test data
- Compare results to prior version (should be within rounding)
- Test edge cases (null values, empty datasets, boundary dates)
- Performance test: Verify execution time improvements

### Session Coverage

**Session 1A (Brief mention):** Context for Q3 2023 system changes
**Architecture discussions:** Technical notes on platform capabilities
**Macro deep dive (Session 7):** Detailed examination of how MDPA uses v2022.1 features

### Deployment Validation

**Questions to Answer:**

1. **Is v2022.1 deployed in production?**
   - Check system version tag
   - Impact: All MDPA execution uses v2022.1 behavior

2. **Have MDPA macros been updated for v2022.1?**
   - Check for breaking change compatibility
   - Especially: NULL handling, date arithmetic, division by zero

3. **Are there any known issues with v2022.1 in MDPA?**
   - Check for any patches (v2022.1.1, etc.)
   - Review error logs for warnings

---

## Navigation Guide by Role

### For Loan Analysts
**Start Here:**
- Fair Lending User Guide (Part 1): Understand fair lending dashboards and compliance requirements
- Advanced Benchmarking Guide (Part 5): Learn peer group comparisons
- CECL User Guide (Part 2): Understand reserve calculations (high-level overview)

**Key Dashboards:**
- Fair Lending Rate Analysis
- Peer Benchmarking Comparison
- CECL Reserve Adequacy

### For Operations/Support Team
**Start Here:**
- Portal Updates Q3 2023 (Part 4): Understand system changes
- CECL Model Certification (Part 3): Data quality requirements
- TTAData Release Notes (Part 6): System capabilities and known issues

**Key Procedures:**
- Q3 2023 deployment verification
- Monthly data validation checklist
- Model reasonableness review

### For Data Engineers/Developers
**Start Here:**
- TTAData Release Notes (Part 6): Platform features and breaking changes
- CECL User Guide (Part 2): Calculation methodologies for correct implementation
- Portal Updates Q3 2023 (Part 4): System changes affecting macro logic

**Key Implementation Areas:**
- NULL credit score handling
- Gross vs. net charge-off processing
- Loss rate averaging with zero-loss years
- Weighted scenario calculations

### For Business Owners/Risk Officers
**Start Here:**
- CECL User Guide (Part 2): Methodology selection and trade-offs
- CECL Model Certification (Part 3): Governance and compliance requirements
- Advanced Benchmarking Guide (Part 5): Competitive positioning

**Key Questions:**
- Is our CECL reserve reasonable and defensible?
- How does our reserve compare to peer group?
- Are we compliant with fair lending regulations?

---

## Cross-Reference: Portal Content to MDPA Docs

| Portal Source | MDPA Document | Link |
|---------------|---------------|------|
| Fair Lending User Guide | 14_SECURITIES_COLLATERAL_GUIDE.md | Fair Lending section |
| Fair Lending User Guide | 12_TABLEAU_DASHBOARD_GLOSSARY.md | Fair Lending dashboards |
| CECL User Guide | 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | CECL field definitions |
| CECL User Guide | 9_BUSINESS_DATA_GLOSSARY.md | CECL terms and concepts |
| CECL User Guide | 10_LOGICAL_DATA_MODEL.md | Entity-relationship model |
| CECL User Guide | 11_PHYSICAL_DATA_MODEL.md | Database schema for CECL |
| CECL Model Certification | 16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md | Data quality troubleshooting |
| Q3 2023 Updates | 1_MDPA_PROCESS_DOCUMENTATION.md | System changes context |
| Q3 2023 Updates | 2_WORKFLOW_ARCHITECTURE.md | Updated architecture (null handling, etc.) |
| Q3 2023 Updates | 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | Q3 2023 field updates |
| Advanced Benchmarking Guide | 12_TABLEAU_DASHBOARD_GLOSSARY.md | Benchmarking dashboards |
| Advanced Benchmarking Guide | 13_OUTPUT_TO_DASHBOARD_LINEAGE.md | Dashboard data sources |
| TTAData v2022.1 Release Notes | 2_WORKFLOW_ARCHITECTURE.md | Platform version and features |
| TTAData v2022.1 Release Notes | 3_MACROS_AND_DEPENDENCIES.md | Macro compatibility with v2022.1 |

---

## Quick Reference: Key Formulas

### CECL Reserve Calculation

**Vintage Method:**
```
Reserve = Loan Balance × Average Historical Loss Rate × (1 - Recovery Factor)
```

**PD Method:**
```
Reserve = Loan Balance × Probability of Default (PD) × Loss Given Default (LGD)
LGD = 1 - (Collateral Recovery Value / Loan Balance)
```

**Weighted Scenarios:**
```
Weighted Reserve = Base Reserve × Scenario Multiplier
Example: $5M × 1.5 (recession) = $7.5M
```

**Loss Rate (Vintage):**
```
Loss Rate Year N = Charge-Offs in Year N / Average Portfolio Balance Year N
[Q3 2023] Average = (Year1 Loss Rate + Year2 Loss Rate + ... + YearN Loss Rate) / N
[Including zero-loss years]
```

---

## Glossary of Key Terms

| Term | Definition | Portal Source |
|------|-----------|----------------|
| BISG | Bayesian Improved Surname Geocoding - methodology to predict borrower ethnicity | Fair Lending Guide |
| CECL | Current Expected Credit Losses - forward-looking reserve methodology | CECL User Guide |
| LGD | Loss Given Default - % of loan balance expected to be lost if borrower defaults | CECL User Guide |
| PD | Probability of Default - likelihood borrower will default within specified period | CECL User Guide |
| WARM | Weighted Average Risk Measurement - Call Report-based loan classification | Advanced Benchmarking |
| Vintage | Group of loans originated in same year - used for historical loss analysis | CECL User Guide |
| Weighted Scenario | [Q3 2023] Stress scenario multiplier applied to expected loss calculations | Portal Updates Q3 2023 |
| Null Credit Score | [Q3 2023] Empty/missing credit score treated as score=0 in PD calculations | Portal Updates Q3 2023 |

---

## Document Location & Access

**Portal PDFs (if access available):**
- `PORTAL_FAIR_LENDING_USER_GUIDE.pdf`
- `PORTAL_CECL_USER_GUIDE.pdf`
- `PORTAL_CECL_MODEL_CERTIFICATION.pdf`
- `PORTAL_UPDATES_Q3_2023.pdf`
- `PORTAL_ADVANCED_BENCHMARKING_GUIDE.pdf`
- `PORTAL_TTADATA_VISION_V2022.1_RELEASE_NOTES.pdf`

**Related MDPA Documents:**
- `VALIDATION_PLAN_UPDATED.md` - Knowledge transfer schedule by topic
- `WEEK_1_SESSION_OUTLINES.md` - Session 1A detailed talking points on Q3 2023
- `DECISION_LOG_TEMPLATE.md` - Template for capturing decisions during knowledge transfer
- `MDPA_DOCS_UPDATE_CHECKLIST.md` - Which MDPA docs need portal content integration

**Supporting Documents:**
- `PORTAL_CONTENT_SUMMARY.md` - Executive summary of critical findings
- `PORTAL_CONTENT_GAPS.md` - Detailed gap analysis
- `PORTAL_CONTENT_ANALYSIS_FRAMEWORK.md` - Analysis methodology

---

**Created:** 2026-03-23
**Status:** Ready for Knowledge Transfer (Weeks 1-6)
**Next Review:** 2026-06-01 (post-knowledge transfer)
**Owner:** Claude Code agent extraction + Sprintendo team validation

