# Securities Collateral in MDPA - Data Capture & Valuation Guide

**Comprehensive Reference for Securities-Backed Loan Processing**

**Version:** 1.0
**Last Updated:** 2026-03-18
**Purpose:** Document how securities collateral data is captured, valued, refreshed, and processed through the MDPA workflow
**Audience:** Data engineers, credit analysts, risk managers, compliance teams

---

## Executive Summary

Securities collateral refers to stocks, bonds, mutual funds, and other investment securities pledged as collateral for credit union loans (typically margin loans, securities-backed lines of credit, or other investment-linked lending products). Unlike auto or real estate collateral with periodic appraisals, securities require **daily market valuation** based on real-time or near-real-time pricing.

This guide explains:
- Types of securities used as collateral
- Data fields required to track securities
- Valuation methodology and pricing sources
- Risk considerations and volatility factors
- How securities flow through the 7-stage MDPA workflow
- Dashboard analytics for securities-backed loans
- Special handling requirements and refresh cycles

---

## Part 1: Types of Securities Collateral

### Equity Securities (Stocks)

| Security Type | Description | Typical Loan Use | Valuation Source | Volatility |
|---|---|---|---|---|
| **Individual Stocks** | Common stock in publicly traded companies (IBM, Apple, etc.) | Margin loans, stock-backed LOC | Daily market close price | High (varies by company/sector) |
| **Mutual Funds** | Pooled investment fund holding basket of securities | Investment loan collateral | Daily NAV (Net Asset Value) | Medium (depends on holdings) |
| **ETFs** (Exchange-Traded Funds) | Index-tracking or sector funds traded like stocks | Securities-backed line of credit | Daily market close price | Medium-High |
| **REITs** (Real Estate Investment Trusts) | Real estate-focused investment vehicles | Real estate exposure without owning property | Daily market close price | Medium |

### Fixed Income Securities (Bonds)

| Security Type | Description | Typical Loan Use | Valuation Source | Volatility |
|---|---|---|---|---|
| **Government Bonds** | US Treasury bonds, municipal bonds | Conservative collateral for secured loans | Daily market price / yield curves | Low (stable, interest-rate sensitive) |
| **Corporate Bonds** | Bonds issued by corporations | Higher-yield collateral | Daily market price / bond pricing services | Medium (credit risk + interest rates) |
| **Bond Funds** | Mutual funds holding basket of bonds | Bond portfolio collateral | Daily NAV | Low-Medium |

### Other Investment Securities

| Security Type | Description | Typical Loan Use | Valuation Source | Volatility |
|---|---|---|---|---|
| **Options Contracts** | Derivative contracts on underlying securities | Advanced margin lending | Real-time market data | Very High |
| **Commodities** | Gold, futures contracts, etc. | Commodity-backed loans (rare in CUs) | Commodity exchange prices | Very High |
| **Cryptocurrency** | Digital assets (Bitcoin, Ethereum) | Emerging; rare in traditional CUs | Cryptocurrency exchange prices | Extremely High |

---

## Part 2: Securities Collateral Data Fields

### Core Securities Collateral Table Structure

For a comprehensive loan portfolio that includes securities collateral, the data model would include:

```
SECURITIES_COLLATERAL Table:
├─ Security_ID (Primary Key) - Unique identifier for each security
├─ Loan_ID (Foreign Key) - Links to LOAN table
├─ Member_ID (Foreign Key) - Borrower who owns the securities
├─ Security_Type (Dimension) - Stock, Bond, Mutual Fund, ETF, etc.
├─ Ticker_Symbol (Dimension) - Trading symbol (e.g., AAPL, MSFT, TLT)
├─ Security_Name (Dimension) - Full name of security
├─ CUSIP (Dimension) - Committee on Uniform Security Identification Procedures code
├─ ISIN (Dimension) - International Securities Identification Number
│
├─ Quantity_Held (Measure) - Number of shares/units of security held as collateral
├─ Unit_Cost_Basis (Measure) - Original cost per share/unit at purchase
├─ Total_Cost_Basis (Measure) - Total original investment (Quantity × Unit_Cost_Basis)
│
├─ Valuation_Date (Dimension) - As-of date for current valuation
├─ Current_Unit_Price (Measure) - Current market price per share/unit
├─ Current_Market_Value (Measure) - Current total value (Quantity × Current_Unit_Price)
├─ Prior_Day_Price (Measure) - Previous close price (for change calculation)
├─ Prior_Day_Market_Value (Measure) - Previous day total value
├─ Price_Change_Dollar (Measure) - Current price - Prior price per unit
├─ Price_Change_Percent (Measure) - (Current price - Prior price) / Prior price × 100
├─ YTD_Price_Change_Percent (Measure) - Year-to-date return %
│
├─ Pricing_Source (Dimension) - Where price came from (Bloomberg, Yahoo Finance, Broker API, etc.)
├─ Pricing_Update_Time (Timestamp) - When the price was last updated (hour/minute)
├─ Pricing_Lag_Hours (Measure) - How old the price is (real-time = 0, end-of-day = 24)
│
├─ Sector (Dimension) - Stock sector (Technology, Healthcare, Finance, etc.)
├─ Asset_Class (Dimension) - Equity, Fixed Income, Commodity, Alternative
├─ Risk_Rating (Dimension) - Credit rating (AAA, BB, etc.) for bonds; volatility for stocks
├─ Liquidity_Rating (Dimension) - How easily security can be sold (Highly Liquid, Liquid, Illiquid)
│
├─ Haircut_Percent (Measure) - Risk discount applied to market value for lending (e.g., 20% haircut = 80% of MV available)
├─ Collateral_Value_Net (Measure) - Market value after applying haircut (Current_Market_Value × (1 - Haircut_Percent))
├─ Loan_Amount_Supported (Measure) - Maximum loan amount this security can support
├─ Excess_Collateral (Measure) - If Collateral_Value_Net > Loan Amount, the cushion
├─ Collateral_Shortfall (Measure) - If Collateral_Value_Net < Loan Amount, the gap (negative = problem)
│
└─ Monitoring Fields
   ├─ Volatility_30Day (Measure) - 30-day price volatility %
   ├─ Volatility_90Day (Measure) - 90-day price volatility %
   ├─ Historical_Low_52Week (Measure) - Lowest price in last 52 weeks
   ├─ Historical_High_52Week (Measure) - Highest price in last 52 weeks
   ├─ Price_vs_52Week_Low (Percent) - How far current price is above the 52-week low
   ├─ Days_Since_Major_Drop (Count) - Days since price dropped >10% in single day
   └─ Risk_Alert_Flag (String) - Y/N - Flag if security price has dropped significantly
```

---

## Part 3: Securities Valuation Methodology

### Pricing Sources & Refresh Frequency

| Pricing Source | Security Types | Update Frequency | Lag Time | Cost | Typical Use |
|---|---|---|---|---|---|
| **Real-Time Market Data (Bloomberg, Reuters)** | Stocks, Bonds, ETFs, Options | Tick-by-tick / Real-time | <1 minute | Expensive ($$$) | High-value margin accounts, daily monitoring |
| **Broker API (E*Trade, Charles Schwab, Fidelity)** | Stocks, Mutual Funds, ETFs | Daily (market close) | 15-30 min after close | Moderate ($$) | Brokerage-connected lending |
| **End-of-Day Pricing Services (Yahoo Finance, IEX Cloud)** | Stocks, ETFs, Mutual Funds | Daily (1 update/day at market close) | 1-4 hours after close | Low ($) | Batch processing, daily workflows |
| **Credit Bureau / Financial Data Aggregator** | Various (depends on aggregator) | Daily or real-time | Depends on aggregator | Varies | Multi-asset portfolio aggregation |
| **Manual Entry / Periodic Appraisal** | Any (when automated not available) | Monthly or quarterly | Manual lag | Low | Older systems, illiquid securities |
| **Custodian/Depository Statement** | All (custodian holds securities) | Daily (account statements) | 1 day | Included in custody fees | Authoritative valuation source |
| **Fund Company (NAV)** | Mutual Funds, Target Date Funds | Daily (published at close) | 1 day | Low/Free | Mutual fund collateral |
| **Commodity Exchange** | Commodities, Futures | Real-time | <1 min | Moderate | Commodity collateral |

### Valuation Formula & Haircut Application

**Base Valuation:**
```
Current_Market_Value = Quantity_Held × Current_Unit_Price

Example:
  Security: 100 shares of AAPL @ $180/share
  Current_Market_Value = 100 × $180 = $18,000
```

**Haircut (Risk Discount):**
```
Haircut_Percent varies by:
  ├─ Security type (stocks haircut > bonds haircut)
  ├─ Volatility (high volatility = higher haircut)
  ├─ Liquidity (illiquid = higher haircut)
  ├─ Credit quality (lower credit = higher haircut)
  └─ Concentration risk (large single-security positions = higher haircut)

Typical Haircuts:
  ├─ Blue-chip stocks (Apple, Microsoft): 15-25%
  ├─ Mid-cap stocks: 25-35%
  ├─ Small-cap / volatile stocks: 35-50%
  ├─ Investment-grade bonds: 2-5%
  ├─ High-yield bonds: 10-20%
  ├─ Mutual funds (diversified): 10-20%
  ├─ Illiquid / thinly-traded: 40-60%
  └─ Highly volatile / speculative: 50-75%

Collateral Value After Haircut:
  Collateral_Value_Net = Current_Market_Value × (1 - Haircut_Percent)

Example:
  Current_Market_Value = $18,000 (100 shares @ $180)
  Haircut_Percent = 20% (Blue-chip stock)
  Collateral_Value_Net = $18,000 × (1 - 0.20) = $18,000 × 0.80 = $14,400

This means:
  ├─ The borrower can borrow up to $14,400 against the $18,000 of AAPL stock
  ├─ The $3,600 difference is the "haircut" / risk buffer
  └─ If AAPL falls, haircut absorbs some loss before loan becomes undercollateralized
```

### Loan-to-Value (LTV) Calculation for Securities

```
Securities_LTV = (Loan_Amount / Collateral_Value_Net) × 100

Where:
  Loan_Amount = Current outstanding loan balance
  Collateral_Value_Net = Security market value after haircut

Example:
  Loan_Amount = $12,000
  Collateral_Value_Net = $14,400 (from example above)
  Securities_LTV = ($12,000 / $14,400) × 100 = 83.3%

Interpretation:
  ├─ LTV 83.3% = Loan is well-collateralized
  ├─ Borrower has 16.7% equity cushion
  ├─ If securities fall 16.7% or more, loan becomes underwater (LTV > 100%)
  └─ Triggers margin call or forced liquidation
```

### Daily Monitoring & Mark-to-Market

Unlike real estate (appraised annually) or auto (priced quarterly), securities must be **marked to market daily**:

```
Daily Process:
  1. 3:00 PM (ET) Market Close
     └─ Stock exchanges close; final prices set for day

  2. 3:30 PM - 5:00 PM: Price Downloads
     └─ Pricing service (Yahoo, Broker API, Bloomberg) publishes end-of-day prices
     └─ Credit union downloads latest prices for all securities collateral

  3. Overnight: Recalculation
     └─ New Current_Unit_Price loaded into SECURITIES_COLLATERAL table
     └─ Current_Market_Value recalculated: Qty × New_Price
     └─ Collateral_Value_Net recalculated: Market Value × (1 - Haircut)
     └─ Securities_LTV recalculated: Loan / Net_Collateral_Value × 100
     └─ Price_Change calculated: New_Price - Prior_Price

  4. Morning: Alerts Triggered
     └─ LTV > 100% (underwater) → Margin Call Alert
     └─ LTV > 90% (warning) → Risk Flag
     └─ Price dropped >20% in single day → Investigation Alert
     └─ New securities added to watchlist

  5. Borrower Notification
     └─ Email with daily collateral status
     └─ Margin call details if LTV breached threshold
     └─ Time to respond (typically 2-5 business days)
```

---

## Part 4: Securities Collateral Through MDPA Workflow Stages

### Stage 1: Ingestion

**Data Sources:**
```
Primary Sources:
├─ Broker API / Custodian Account Statement
│  └─ Holdings (ticker, quantity, security name)
│  └─ End-of-day prices
│  └─ Account summary
│
├─ Loan Origination System (LOS)
│  └─ Loan amount
│  └─ Security pledged as collateral (ticker/CUSIP)
│  └─ Haircut policy applied
│
├─ Pricing Service (Yahoo Finance, IEX, etc.)
│  └─ Current unit prices for all securities
│  └─ Historical prices
│  └─ Dividend/distribution data
│
└─ Risk Management System
   └─ Haircut policies by security type/volatility
   └─ Monitoring thresholds (LTV limits)
   └─ Margin call policies
```

**Data Loaded:**
```
LOAN Record (from LOS):
├─ Loan_ID
├─ Member_ID
├─ Loan_Type = "Securities-Backed LOC" (or similar)
├─ Loan_Amount = $12,000
├─ Collateral_Type = "Securities"
├─ Current_Balance = $12,000
└─ Related via FK to SECURITIES_COLLATERAL

SECURITIES_COLLATERAL Records (from Broker/Pricing Service):
├─ Security_ID = [auto-generated]
├─ Loan_ID = [reference to loan]
├─ Ticker_Symbol = "AAPL"
├─ Quantity_Held = 100
├─ Valuation_Date = 2026-03-18
├─ Current_Unit_Price = $180.50
├─ Current_Market_Value = $18,050
├─ Pricing_Source = "Yahoo Finance API"
├─ Pricing_Update_Time = "16:05 ET"
└─ Haircut_Percent = 0.20 (20% from policy)
```

### Stage 2: Cleansing

**Validation Rules for Securities:**

```
Field Validations:
├─ Ticker_Symbol: NOT NULL, EXISTS in master security list, valid format
│  └─ REJECT if ticker invalid or not recognized
│
├─ Quantity_Held: > 0, numeric, NOT NULL
│  └─ REJECT if Qty = 0 or negative
│
├─ Current_Unit_Price: > 0, numeric, NOT NULL, reasonable range for security
│  └─ WARNING if price seems extreme (e.g., stock up 500% in 1 day)
│  └─ REJECT if price = 0 or nonsensical
│
├─ Pricing_Source: Recognized source (Bloomberg, Yahoo, Broker, etc.)
│  └─ REJECT if pricing source unrecognized
│
├─ Pricing_Lag: Check staleness
│  └─ WARNING if pricing > 24 hours old
│  └─ REJECT if pricing > 72 hours old (stale data)
│
├─ Haircut_Percent: 0-100%, policy-appropriate for security type
│  └─ REJECT if haircut > 100% or negative
│  └─ WARNING if haircut seems low for volatile security
│
├─ Loan Amount vs. Collateral Value:
│  └─ WARNING if Securities_LTV > 90% (approaching margin call threshold)
│  └─ ALERT if Securities_LTV > 100% (underwater, immediate action needed)
│
└─ Data Consistency:
   ├─ Loan amount must match loan record
   ├─ Member_ID must be consistent
   ├─ Security_Type must be in valid list
   └─ All FK references must exist
```

**Data Quality Flags:**
```
Data_Quality_Flag values:
├─ 'Y' = All validations passed; record is reliable
├─ 'W' = Warning (e.g., high LTV, stale pricing); record usable but flagged
└─ 'N' = Reject; validation failed; record excluded from processing
```

### Stage 3: Enrichment

**Calculations & Derived Fields:**

```
1. Price Change Analysis:
   ├─ Price_Change_Dollar = Current_Unit_Price - Prior_Day_Price
   ├─ Price_Change_Percent = (Current_Unit_Price - Prior_Day_Price) / Prior_Day_Price × 100
   ├─ YTD_Price_Change = (Current_Unit_Price - Year_Start_Price) / Year_Start_Price × 100
   └─ 52Week_High / Low = Highest/lowest price in past 52 weeks

   Example:
     Prior_Day_Price = $175.00
     Current_Unit_Price = $180.50
     Price_Change_Dollar = $180.50 - $175.00 = $5.50
     Price_Change_Percent = ($5.50 / $175.00) × 100 = 3.14% daily gain

2. Collateral Value with Haircut:
   ├─ Collateral_Value_Net = Current_Market_Value × (1 - Haircut_Percent)
   └─ Example:
       Current_Market_Value = 100 × $180.50 = $18,050
       Haircut_Percent = 20%
       Collateral_Value_Net = $18,050 × 0.80 = $14,440

3. LTV and Margin Calculations:
   ├─ Securities_LTV = (Loan_Amount / Collateral_Value_Net) × 100
   ├─ Equity_Cushion = Collateral_Value_Net - Loan_Amount
   ├─ Equity_Cushion_Percent = (Equity_Cushion / Collateral_Value_Net) × 100
   ├─ Margin_Call_Triggered = IF (LTV > Threshold) THEN 'Y' ELSE 'N'
   └─ Days_Until_Margin_Call = Calculate based on price decline rate

   Example:
     Loan_Amount = $12,000
     Collateral_Value_Net = $14,440
     Securities_LTV = ($12,000 / $14,440) × 100 = 83.1%
     Equity_Cushion = $14,440 - $12,000 = $2,440
     Equity_Cushion_Percent = ($2,440 / $14,440) × 100 = 16.9%
     Margin_Call_Triggered = 'N' (LTV 83.1% < 100% threshold)

4. Risk Classification:
   ├─ Security_Risk_Level = Based on volatility, credit rating, liquidity
   │  ├─ Low Risk: Blue-chip stocks (AAPL, MSFT), Investment-grade bonds
   │  ├─ Medium Risk: Mid-cap stocks, Corporate bonds
   │  └─ High Risk: Penny stocks, High-yield bonds, Options
   │
   ├─ Portfolio_Concentration_Risk = IF (Single_Security > 50% of collateral) THEN 'High' ELSE 'Low'
   │  └─ Measures if borrower has "all eggs in one basket"
   │
   └─ Volatility_Risk = Based on 30-day, 90-day price volatility
       ├─ Low: < 10% volatility
       ├─ Medium: 10-30% volatility
       └─ High: > 30% volatility

5. Expected Loss Calculation:
   ├─ Loss_Given_Default = Loan_Amount - Collateral_Value_Net
   │  (If LTV > 100%, this is the uncovered amount)
   │
   ├─ Probability_of_Default = Based on borrower credit score + security volatility
   │
   └─ Expected_Loss = Loss_Given_Default × Probability_of_Default
       (Used in loan loss reserve calculations)

6. Stress Test Calculation:
   ├─ Stressed_Collateral_Value = Current_Market_Value × (1 - Stress_Haircut)
   │  WHERE Stress_Haircut = Base_Haircut + Volatility_Stressor + Market_Stressor
   │
   ├─ Stressed_Securities_LTV = (Loan_Amount / Stressed_Collateral_Value) × 100
   │
   └─ Example (30% market decline):
       Current_Market_Value = $18,050
       Base_Haircut = 20%
       Market_Decline_Stressor = 30%
       Stress_Haircut = 20% + 30% = 50%
       Stressed_Collateral_Value = $18,050 × (1 - 0.50) = $9,025
       Stressed_Securities_LTV = ($12,000 / $9,025) = 132.9% (UNDERWATER!)
```

### Stage 4: Consolidation

**Joining Securities to Loan Record:**

```
LOAN (enriched with securities collateral):
├─ Loan_ID = [reference to loan]
├─ Member_ID = [borrower]
├─ Loan_Type = "Securities-Backed LOC"
├─ Loan_Amount = $12,000
├─ Current_Balance = $12,000
│
├─ SECURITIES_COLLATERAL_1 (AAPL: 100 shares):
│  ├─ Collateral_Value_Net = $14,440
│  ├─ Securities_LTV = 83.1%
│  └─ Margin_Call = 'N'
│
└─ SECURITIES_COLLATERAL_2 (MSFT: 50 shares):
   ├─ Collateral_Value_Net = $9,800
   ├─ Securities_LTV = 83.1%
   └─ Margin_Call = 'N'

Total Collateral for Loan = $14,440 + $9,800 = $24,240
Portfolio_LTV = ($12,000 / $24,240) × 100 = 49.5% (well-collateralized)
```

### Stage 5: Compliance

**Regulatory & Risk Calculations:**

```
1. Concentration Risk Analysis:
   ├─ Total portfolio value (all members' securities)
   ├─ By security (% of total in each ticker)
   │  └─ Example: AAPL = 5.2% of total portfolio (concentration risk)
   ├─ By member (% of total in each borrower's account)
   │  └─ Example: Member_ID 12345 = 8.1% of total (single-obligor risk)
   └─ Alerts: AAPL concentration > 10%? → Regulatory flag

2. Margin Call Monitoring:
   ├─ COUNT of loans with LTV > 100% (underwater, immediate margin call)
   ├─ COUNT of loans with LTV 90-100% (warning, monitor closely)
   ├─ COUNT of loans with LTV 80-90% (normal, acceptable)
   ├─ COUNT of loans with LTV < 80% (very safe, excess collateral)
   └─ Generate daily margin call list

3. Loss Given Default (LGD):
   ├─ For each securities-backed loan:
   │  └─ LGD = MAX(0, Loan_Amount - Collateral_Value_Net)
   │           (How much would be lost if borrower defaults & forced liquidation)
   │
   └─ Portfolio LGD = SUM(LGD) for all securities-backed loans
       (Total loss exposure if all borrowers default)

4. Loan Loss Provision:
   ├─ Expected Loss = LGD × Probability_of_Default
   ├─ Sum across portfolio for total provision needed
   └─ Compare to Allowance_for_Loan_Losses (ALL) entered on Introduction tab

5. Stress Test Impact:
   ├─ Apply market stressor (e.g., 20% market decline)
   ├─ Recalculate Stressed_LTV for all loans
   ├─ COUNT how many would breach margin call threshold
   ├─ Estimate liquidation losses if stress scenario realized
   └─ Impact on net worth = Total stressed losses
```

### Stage 6: Output Preparation

**Formatting for Outputs:**

```
CLIENT FILE (Excel):
├─ Summary: Total portfolio value, count of securities, composition
├─ By Loan:
│  ├─ Loan_ID
│  ├─ Loan_Amount
│  ├─ Collateral_Value_Net
│  ├─ LTV
│  ├─ Securities held (list of tickers & quantities)
│  └─ Margin Call status
│
└─ By Security (Holdings List):
   ├─ Ticker
   ├─ Security_Name
   ├─ Quantity
   ├─ Current_Price
   ├─ Current_Market_Value
   ├─ Price_Change ($, %)
   └─ Haircut_Applied

QA REPORT (Excel):
├─ Data Quality Metrics:
│  ├─ Records with stale pricing (>24 hours old)
│  ├─ Records with validation warnings
│  ├─ Pricing source breakdown (% from each source)
│  └─ Processing time
│
├─ Portfolio Metrics:
│  ├─ Total securities portfolio value
│  ├─ Composition by asset class (Equity, Fixed Income, etc.)
│  ├─ Composition by sector (Tech, Finance, Healthcare, etc.)
│  ├─ Concentration: Top 10 holdings % of total
│  ├─ Top 10 borrowers % of total exposure
│  └─ Volatility analysis (portfolio average volatility)
│
├─ Risk Metrics:
│  ├─ Margin Calls: Count with LTV > 100% (immediate action)
│  ├─ Warnings: Count with LTV > 90%
│  ├─ Average portfolio LTV
│  ├─ Concentration risks
│  ├─ Single-day price changes > 20%
│  └─ Expected loss (total LGD in portfolio)
│
└─ Charts:
   ├─ LTV distribution (histogram)
   ├─ Portfolio composition pie chart
   ├─ Top 10 holdings bar chart
   └─ Daily price change alert list

TABLEAU EXTRACT:
├─ Dimension: Ticker, Security_Name, CUSIP, Asset_Class, Sector
├─ Dimension: Loan_ID, Member_ID, Loan_Type
├─ Dimension: Margin_Call_Status (Yes/No/Warning)
├─ Measure: Quantity_Held, Current_Unit_Price, Current_Market_Value
├─ Measure: Collateral_Value_Net, Securities_LTV
├─ Measure: Price_Change_Percent, YTD_Return
├─ Measure: Volatility_30Day, Volatility_90Day
├─ Measure: Portfolio_Weight_Percent
└─ Timestamp: Valuation_Date, Pricing_Update_Time
```

### Stage 7: Delivery

**Loading to Tableau:**

```
Tableau Data Source Configuration:
├─ Connection to Tableau Extract (.hyper file)
│
├─ Available Dimensions:
│  ├─ Security: Ticker, Asset_Class, Sector, Risk_Rating, Liquidity
│  ├─ Loan: Loan_Type, Loan_Group (if securities are one group)
│  └─ Time: Valuation_Date, Month, Quarter, Year
│
├─ Available Measures:
│  ├─ Collateral: Total_Market_Value, Collateral_Value_Net, LTV
│  ├─ Performance: Price_Change, YTD_Return, Volatility
│  ├─ Risk: Haircut, Margin_Call_Count, Expected_Loss
│  └─ Concentration: Portfolio_Weight, Holdings_Count
│
└─ Calculated Fields (created in Tableau):
   ├─ LTV_Category = IF LTV > 100 THEN "Margin Call" ELSE IF > 90 THEN "Warning" ELSE "OK"
   ├─ Risk_Level = IF Volatility > 30% THEN "High" ELSE IF > 10% THEN "Medium" ELSE "Low"
   ├─ Days_to_Margin_Call = Estimate based on current volatility & LTV
   └─ Stress_Test_LTV = LTV under 20% market decline scenario
```

---

## Part 5: Securities-Specific Dashboard Objects

### Dashboard 1: Securities Portfolio Overview

```
Tab: Securities_Portfolio_Dashboard

Objects:

1. Portfolio Summary (KPI Cards):
   ├─ Total Securities Value (Sum)
   ├─ Number of Holdings (Count of unique tickers)
   ├─ Margin Calls (Count with LTV > 100%)
   ├─ Average Portfolio LTV
   ├─ YTD Portfolio Return %
   └─ Daily Price Change % (weighted average)

2. Portfolio Composition (Pie Chart):
   ├─ By Asset Class: Equity, Fixed Income, Other
   ├─ By Sector: Tech, Finance, Healthcare, Energy, etc.
   └─ By Concentration: Top 5 holdings % vs. Rest

3. LTV Distribution (Histogram):
   ├─ X-axis: LTV % (0%, 20%, 40%, 60%, 80%, 100%, 120%+)
   ├─ Y-axis: Count of loans or value
   ├─ Color code:
   │  ├─ Green: LTV < 80% (safe)
   │  ├─ Yellow: LTV 80-100% (normal)
   │  ├─ Red: LTV > 100% (margin call)
   └─ INTERPRETATION: Shows collateral cushion distribution

4. Top 10 Holdings (Table):
   ├─ Ticker, Security_Name
   ├─ Quantity, Current_Price, Market_Value
   ├─ Portfolio_Weight % (value as % of total)
   ├─ YTD_Return %
   ├─ Daily_Change ($, %)
   └─ Risk_Rating, Liquidity

   INTERPRETATION: Identifies concentration risk

5. Sector Exposure (Horizontal Bar):
   ├─ Each bar = one sector (Tech, Finance, etc.)
   ├─ Bar length = % of portfolio in that sector
   ├─ Hover: Show count of holdings, volatility
   └─ INTERPRETATION: Shows sector concentration

6. Daily Price Performance (Tree Map or Heat Map):
   ├─ Each rectangle = one security
   ├─ Rectangle size = value of holding
   ├─ Color = daily price change (green = up, red = down)
   ├─ Intensity = magnitude of change
   └─ INTERPRETATION: Identifies which holdings moved most today
```

### Dashboard 2: Margin Call Monitoring

```
Tab: Margin_Call_Monitoring

Objects:

1. Margin Call Alerts (KPI):
   ├─ Critical (LTV > 100%): Red card with count
   ├─ Warning (LTV 90-100%): Yellow card with count
   ├─ Normal (LTV < 90%): Green card with count
   └─ ACTION: Critical alerts trigger immediate notifications

2. Margin Call List (Data Table):
   ├─ Loan_ID, Member_ID, Member_Name
   ├─ Loan_Amount, Collateral_Value_Net
   ├─ Current_LTV, LTV_Status
   ├─ Days_Overdue_Since_Call (if applicable)
   ├─ Securities_Held (summary list)
   ├─ Action_Required (Liquidate, Deposit Additional Collateral, etc.)
   └─ USAGE: Priority list for collections team

3. LTV Trend (Line Chart):
   ├─ X-axis: Date (daily for past 60 days)
   ├─ Y-axis: LTV percentage
   ├─ One line per loan (or top loans if too many)
   ├─ Reference lines: 80% (warning), 100% (margin call)
   └─ INTERPRETATION: Shows which loans are trending toward margin call

4. Price Decline Risk (Scatter Plot):
   ├─ X-axis: Current LTV
   ├─ Y-axis: Volatility (30-day %)
   ├─ Each point = one loan
   ├─ Color: Red = high risk (high LTV + high volatility)
   ├─ Bubble size = loan amount
   └─ INTERPRETATION: High volatility + high LTV = highest margin call risk

5. Stress Test Impact (Bar Chart):
   ├─ Scenario: 20% market decline
   ├─ Y-axis: Count of loans
   ├─ Bars for LTV ranges:
   │  ├─ LTV < 100% currently (green bar)
   │  └─ LTV > 100% under stress scenario (red bar)
   └─ INTERPRETATION: How many loans would breach margin call in downturn?

6. Member Notification (Filter + Action):
   ├─ Filter by Loan_ID or Member_ID
   ├─ View current status, collateral details
   ├─ Action: "Generate Margin Call Notice" → auto-format demand letter
   └─ USAGE: Compliance & collection workflow
```

### Dashboard 3: Securities Performance & Analytics

```
Tab: Securities_Performance_Analytics

Objects:

1. Performance Summary (Cards):
   ├─ Portfolio YTD Return %
   ├─ Portfolio 6-Month Return %
   ├─ Best-Performing Holding (ticker + return %)
   ├─ Worst-Performing Holding (ticker + return %)
   ├─ Volatility 30-Day Average %
   └─ Sharpe Ratio (risk-adjusted return metric)

2. Sector Performance (Sector Comparison):
   ├─ Table:
   │  ├─ Sector, Count of Holdings, Total Value
   │  ├─ YTD_Return %, 6Mo_Return %, Daily_Change %
   │  ├─ Avg_Volatility %, Avg_LTV
   │  └─ ACTION: Identify outperforming/underperforming sectors

3. Holdings Performance Ranking (Sorted Table):
   ├─ Ticker, Asset_Class, Quantity, Current_Price
   ├─ Market_Value, Portfolio_Weight %
   ├─ YTD_Return %, 6Mo_Return %, 1Yr_Return %
   ├─ Volatility_30Day %, Sharpe_Ratio
   ├─ Dividend_Yield % (for stocks)
   ├─ 52Week_High/Low
   └─ USAGE: Performance analysis, rebalancing decisions

4. Return Distribution (Histogram):
   ├─ X-axis: YTD Return % (-50% to +100%+)
   ├─ Y-axis: Count of holdings
   ├─ Shows: Wide range of returns across holdings
   └─ INTERPRETATION: Portfolio diversification effect

5. Volatility Comparison (Scatter):
   ├─ X-axis: 30-day Volatility %
   ├─ Y-axis: YTD Return %
   ├─ Each point = one security
   ├─ Quadrants:
   │  ├─ Upper-left: Low volatility, high return (IDEAL)
   │  ├─ Upper-right: High volatility, high return (RISKY)
   │  ├─ Lower-left: Low volatility, low return (CONSERVATIVE)
   │  └─ Lower-right: High volatility, low return (AVOID)
   └─ INTERPRETATION: Risk/reward profile of holdings

6. Correlation Matrix (Heatmap) - Optional:
   ├─ Shows correlation between major holdings
   ├─ Green = positive correlation (move together)
   ├─ Red = negative correlation (hedge each other)
   └─ INTERPRETATION: Portfolio diversification; hedging effectiveness
```

---

## Part 6: Risk Monitoring & Alerts

### Automatic Alerts Triggered During MDPA Processing

```
During Stage 2 (Cleansing) - Data Quality Alerts:
├─ Stale Pricing Alert
│  └─ IF Pricing_Update_Time > 24 hours old
│     → FLAG: "Pricing data > 24 hours old; use with caution"
│
├─ Extreme Price Change Alert
│  └─ IF Price_Change_Percent > 50% OR < -50%
│     → INVESTIGATE: "Security price moved >50% in single day"
│
└─ Data Missing Alert
   └─ IF Current_Unit_Price = NULL OR Quantity_Held = NULL
      → REJECT: "Missing critical pricing data"

During Stage 3 (Enrichment) - Risk Alerts:
├─ Margin Call Alert - CRITICAL
│  └─ IF Securities_LTV > 100%
│     → IMMEDIATE: Contact borrower, demand additional collateral
│     → Email to Collections Team
│     → Generate formal demand letter
│
├─ Margin Call Warning Alert
│  └─ IF Securities_LTV > 90% AND < 100%
│     → MONITOR: Flag for close monitoring
│     → Email to Risk Team
│     → Set 2-day follow-up to check prices
│
├─ Concentration Risk Alert
│  └─ IF Single_Security > 50% of collateral
│     → WARNING: "Portfolio not diversified; high single-name risk"
│     → Email to Risk & Compliance
│
├─ High Volatility Alert
│  └─ IF Volatility_30Day > 50%
│     → CAUTION: "High-volatility security collateral"
│     → Flag for closer monitoring
│
└─ Liquidity Risk Alert
   └─ IF Liquidity_Rating = "Illiquid"
      → WARNING: "Cannot quickly liquidate this collateral"
      → Consider higher haircut

During Stage 5 (Compliance) - Portfolio Alerts:
├─ Sector Concentration
│  └─ IF Any_Sector > 40% of portfolio
│     → WARNING: "Over-concentrated in one sector"
│
├─ Member Concentration
│  └─ IF Any_Member > 20% of portfolio
│     → COMPLIANCE: Single-obligor concentration limit
│
└─ Market Stress Impact
   └─ IF Stressed_LTV > 100% for any loan
      → STRESS TEST ALERT: "Loan would be underwater in market downturn"
      → Estimate loss severity
```

### Example Alert Flow

```
Scenario: Apple (AAPL) stock price drops 25% in single day

STAGE 2 ALERT:
  └─ Price Change Alert: "AAPL declined $45 (25%) in single day"
     └─ Flag as anomaly; investigate if pricing error

STAGE 3 ALERT:
  └─ Securities_LTV: Before $180 → After $135
  ├─ Loan Account: Securities_LTV rises from 83% to 111%
  ├─ Margin Call Alert: LTV > 100% TRIGGERED
  │  └─ Email to Collections: "Margin call required on Loan #12345"
  │  └─ Member: "Your collateral has fallen below required level.
  │             Please deposit additional funds or securities within 2 business days"
  │
  ├─ Portfolio Alert: Total portfolio down 8% (if AAPL is 32% of holdings)
  │  └─ Email to Risk Team: "Daily portfolio loss: -$XXXX"
  │
  └─ Stress Test Alert: If portfolio continues to decline 25% more,
                        additional 7 loans would breach margin call

STAGE 5 ALERT:
  └─ Portfolio Summary: "Margin Call count: 1 (vs. 0 yesterday)"
     └─ Include in daily risk report to management

STAGE 6 OUTPUT:
  └─ QA Report highlights:
     ├─ "Margin Calls: 1 (high priority - requires immediate action)"
     ├─ "Largest daily move: AAPL -25%"
     ├─ "Portfolio volatility: 18% (elevated)"
     └─ "Recommendation: Monitor closely; consider haircut adjustment"

BORROWER NOTIFICATION:
  └─ Email/Letter: "Margin Call Notice - Account #12345"
     ├─ Current collateral value: $14,400
     ├─ Current loan balance: $12,000
     ├─ Required collateral (100% of loan): $15,000
     ├─ Shortfall: $600
     ├─ Action Required: Deposit $600+ in collateral OR pay down loan
     ├─ Deadline: 2 business days (by March 20, 2026)
     └─ Consequences: Forced liquidation if not resolved
```

---

## Part 7: Best Practices for Securities Collateral Management

### Pricing & Valuation

```
DO:
├─ Use real-time or end-of-day pricing from established sources (Yahoo, Broker API, Bloomberg)
├─ Update prices daily, ideally before calculating daily LTV
├─ Maintain history of all price points for trend analysis
├─ Document pricing source and timestamp for audit trail
├─ Use consistent pricing methodology across all loans
├─ Apply haircuts per policy, consistently by security type
├─ Validate pricing against multiple sources to catch errors
└─ Alert on stale pricing (>24 hours) automatically

DON'T:
├─ Use outdated/stale pricing (>48 hours old) without flags
├─ Apply inconsistent or ad-hoc haircuts
├─ Ignore price movements > 20% in single day
├─ Forget to document assumptions (haircuts, stress factors)
├─ Allow one employee to set prices without audit trail
└─ Update haircuts without documented policy & approval
```

### Risk Monitoring

```
DO:
├─ Monitor LTV daily for all securities-backed loans
├─ Set automatic alerts for margin calls (LTV > 100%)
├─ Set warnings for near-margin-call (LTV > 90%)
├─ Track concentration by individual security (top holdings)
├─ Track concentration by member (single-obligor risk)
├─ Monitor sector exposure
├─ Calculate stress test impact (20% market decline)
├─ Maintain margin call policy & enforce consistently
├─ Document all margin calls & borrower responses
└─ Review policies quarterly with Risk & Compliance teams

DON'T:
├─ Ignore loans approaching margin call threshold
├─ Allow unlimited concentration in single security
├─ Miss margin call deadlines
├─ Apply different standards to different borrowers
├─ Assume securities can always be liquidated quickly
├─ Forget about volatility (high volatility = high risk)
└─ Neglect to stress-test portfolio in adverse scenarios
```

### Data Management

```
DO:
├─ Maintain complete audit trail of all pricing updates
├─ Back up securities data daily
├─ Validate data completeness (no NULL key fields)
├─ Reconcile broker statements to internal records weekly
├─ Document all calculation methodologies
├─ Archive historical pricing for trend analysis
├─ Maintain master security list with CUSIP/ISIN codes
└─ Test disaster recovery procedures quarterly

DON'T:
├─ Allow manual overrides of system prices without documentation
├─ Lose historical pricing data
├─ Mix different pricing sources without clear rules
├─ Approve loans without documented collateral valuation
├─ Skip reconciliation steps
└─ Store pricing data in uncontrolled places (Excel, emails)
```

---

## Part 8: Troubleshooting Common Securities Collateral Issues

### Issue 1: Loan Shows as Margin Call but Borrower Disagrees on Price

**Scenario:** System shows AAPL @ $180, margin call triggered. Borrower says broker shows $185.

```
DIAGNOSIS:
├─ Timing issue: Broker shows real-time; system shows end-of-day?
├─ Source issue: Different pricing sources may show different prices
├─ Lag issue: System updated 24 hours ago; price has moved since
└─ Error issue: Data entry error or pricing feed malfunction?

RESOLUTION STEPS:
1. Check Pricing_Source in system
   └─ Compare to borrower's broker statement
2. Check Pricing_Update_Time
   └─ Ensure data not stale
3. Verify current real-time price on multiple sources
   └─ Yahoo Finance, Bloomberg, broker directly
4. If system stale: Update pricing immediately
5. If system correct: Explain to borrower
   └─ "System uses end-of-day close (3:00 PM ET) = $180.
      Your broker may show intraday or current quote = $185.
      System snapshot is official for margin call purposes."
6. Document the discrepancy & resolution
```

### Issue 2: Securities-Backed Loan Appears in Both Loan Portfolio and Securities Portfolio

**Scenario:** Same loan_ID appears in MDPA LOAN table AND SECURITIES_COLLATERAL table. Is it double-counted?

```
ANSWER: NO - This is correct!

EXPLANATION:
├─ LOAN table: Represents the loan itself
│  └─ Loan_ID, Member_ID, Loan_Amount, Current_Balance, Payment_Status
│
└─ SECURITIES_COLLATERAL table: Represents the collateral securing the loan
   └─ Security details, pricing, LTV, margin call status

ONE-TO-MANY RELATIONSHIP:
├─ One LOAN can be secured by ONE OR MORE securities
│  Example: Member has $12K loan secured by:
│  ├─ 100 shares of AAPL ($14,440 value)
│  └─ 50 shares of MSFT ($9,800 value)
│
└─ SECURITIES_COLLATERAL has TWO rows for this loan
   ├─ Row 1: AAPL data
   └─ Row 2: MSFT data

IN DASHBOARD:
├─ LOAN level: Show $12K loan, $24,240 total collateral, LTV 49.5%
├─ SECURITIES level: Show AAPL details, MSFT details separately
└─ NOT double-counting: Two different entities with different purposes
```

### Issue 3: Haircut Changed but Dashboard Not Reflecting It

**Scenario:** Haircut policy updated from 20% to 25% for blue-chip stocks. Dashboard still shows old 20% haircuts.

```
ROOT CAUSE:
├─ New haircut policy not loaded into SECURITIES_COLLATERAL table
├─ Dashboard using cached Tableau Extract (not refreshed since update)
└─ Calculation in Stage 3 (Enrichment) not re-run with new haircuts

RESOLUTION:
1. Verify new policy is loaded in system
   └─ Check HAIRCUT_POLICY table has new 25% for "Blue-Chip"

2. Re-run MDPA workflow Stages 3-7
   └─ Stage 3 will recalculate:
      ├─ Collateral_Value_Net = Market_Value × (1 - 0.25)  [new 25% haircut]
      ├─ Securities_LTV = Loan / New_Net_Value
      └─ Updated values fed to outputs

3. Refresh Tableau Extract
   └─ Tableau Server > Extract > Refresh Now

4. Verify in dashboard
   └─ Collateral values should be lower (25% haircut > 20%)
   └─ LTVs should be higher (less net collateral)
```

---

## Conclusion

Securities collateral requires **daily monitoring and dynamic valuation**, unlike auto or real estate collateral with periodic reviews. The MDPA workflow automates this through:

1. **Daily price updates** from pricing services
2. **Automatic LTV recalculation** each processing cycle
3. **Real-time margin call alerts** when thresholds breached
4. **Dashboard visibility** into collateral position, trends, and risk

Proper securities collateral management requires:
- Accurate, timely pricing data
- Consistent haircut application
- Daily LTV monitoring
- Rapid response to margin call situations
- Comprehensive audit trail and documentation

---

**Document Version:** 1.0 | **Last Updated:** 2026-03-18 | **Next Review:** 2026-04-18
