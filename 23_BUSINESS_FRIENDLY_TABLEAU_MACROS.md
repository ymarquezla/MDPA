# What Do These Macros Do? (Business-Friendly Explanation)

**For Non-Technical Stakeholders**

**Version:** 1.0
**Last Updated:** 2026-03-18
**Audience:** Business users, loan managers, executives, non-technical team members

---

## In Simple Terms

Think of these macros as **three delivery trucks** that take processed loan data and deliver it to your **Tableau dashboards** so you can view reports and make decisions.

---

## The Three Active Macros (What You See)

### **1. Tableau New Macro**
**What it does:** Delivers your **main loan portfolio data** to the dashboard

**In everyday terms:**
- The workflow processes all your loans and calculates important information
- This macro takes that processed data and **delivers it to your dashboard**
- You see: Portfolio balance, delinquency rates, risk scores, credit scores
- **Bottom line:** This is what gives you the main portfolio dashboard

**What you see on the dashboard:**
- Total loans and balances
- Delinquency breakdown (how many loans are behind on payments)
- Risk ratings for each loan
- Credit scores
- Performance trends

---

### **2. Tableau New Macro Dropped**
**What it does:** Delivers **loans that had problems** to a separate dashboard

**In everyday terms:**
- Not all loans process perfectly—some have missing data or fail quality checks
- This macro takes those "problem loans" and **sends them to a quality report**
- You see: What went wrong and why

**What you see on the dashboard:**
- Loans missing credit scores or valuations
- Loans with data quality issues
- Loans that couldn't be fully processed
- Why each loan was excluded

**Why it matters:**
- Helps you know which data needs to be fixed in source systems
- Quality assurance and audit trail

---

### **3. Tableau New Macro Securities**
**What it does:** Delivers **securities collateral data** to a separate dashboard

**In everyday terms:**
- Some loans are backed by stocks, bonds, and other securities (not just cars or real estate)
- This macro takes that securities portfolio data and **sends it to your securities dashboard**
- You see: Which borrowers pledged what securities, current values, risk alerts

**What you see on the dashboard:**
- Securities holdings (stocks, bonds, mutual funds, ETFs)
- Current market values
- Margin call alerts (when collateral value drops too low)
- Concentration risk (if too much collateral is in one security)

**Why it matters:**
- Daily monitoring of securities-backed loans
- Automatic alerts when borrower needs to add more collateral
- Risk management for volatile portfolio

---

## The Old Macros (Why They're Disabled)

### Why We Changed
In March 2026, we upgraded our software, and the old system for delivering data to Tableau **stopped working**. It's like a delivery truck breaking down.

**Old delivery system (no longer works):**
- 2020_Publish2Server.yxmc
- 2020_PublishDropped2Server.yxmc
- 2020_PublishSecurities2Server.yxmc

**What happened:**
- The software company changed how they handle data delivery
- The old trucks became incompatible
- We had to switch to new trucks

**New delivery system (works now):**
- Tableau New Macro (Macro 1055)
- Tableau New Macro Dropped (Macro 1056)
- Tableau New Macro Securities (Macro 1057)

---

## What Actually Happens (The Big Picture)

```
STEP 1: Data Submission
You upload monthly loan data → Workflow processes it

STEP 2: Processing
Workflow calculates:
  • Risk scores
  • Delinquency status
  • Credit classifications
  • Securities valuations
  • Quality flags

STEP 3: Publishing (What These Macros Do)
Three macros deliver the results:
  ✓ Main Data → Dashboard (what you report on)
  ✓ Problem Loans → QA Dashboard (what needs fixing)
  ✓ Securities → Securities Dashboard (daily monitoring)

STEP 4: You See Results
Open Tableau dashboards and see:
  • Portfolio performance
  • Risk assessment
  • Quality issues
  • Securities monitoring
```

---

## Why This Matters to You

### **Portfolio Management**
- See your entire loan portfolio at a glance
- Know delinquency and charge-off rates
- Understand credit quality and risk

### **Quality Assurance**
- Know which loans have data problems
- Understand what data needs to be fixed
- Track completeness of your records

### **Securities Management**
- Monitor collateral values daily
- Get alerts when margin calls needed
- Avoid unexpected losses

### **Decision Making**
- Data-driven insights for lending decisions
- Risk monitoring and management
- Performance benchmarking

---

## Common Questions

### Q: What if one of these macros fails?
**A:** Your dashboards won't update for that month. You won't see latest data. The team would be alerted and would investigate the source data.

### Q: How often do these run?
**A:** Once a month, automatically. You submit data → Workflow runs → Dashboards update within a few hours.

### Q: Can we change what data shows up?
**A:** Yes! The macro definitions can be customized to include different fields, but the basic flow (calculate → deliver → display) stays the same.

### Q: What if our securities data is missing one month?
**A:** The Securities macro handles it gracefully—dashboards still update for main portfolio and dropped records. Securities dashboard just won't show that month.

### Q: Do I need to know the technical details?
**A:** No! You just need to know:
1. Data gets processed
2. Three macros deliver results to three different dashboards
3. You review the dashboards for insights
4. You fix any data quality issues that show up

---

## The Simple Version (30 seconds)

**These three macros are like mail carriers:**
- **Macro 1:** Delivers main portfolio data → Main dashboard
- **Macro 2:** Delivers problem loans → Quality report dashboard
- **Macro 3:** Delivers securities data → Securities dashboard

**Why changed in March 2026:**
- Old delivery system broke when software upgraded
- Switched to new system that works with current software
- Same job, better delivery truck

**What you notice:** Nothing! Same dashboards, same insights—just working better now.

---

## Questions or Concerns?

If you have questions about what you see in the dashboards, or want to know more about the data, reach out to the analytics team. They can explain:
- What each metric means
- Why certain loans show up in the dropped list
- How to interpret risk scores and delinquency rates
- Securities monitoring and margin calls

---

**Remember:** These macros are just the delivery system. The important thing is the **insights you get from the dashboards**—loan performance, risk, quality, and portfolio health.

