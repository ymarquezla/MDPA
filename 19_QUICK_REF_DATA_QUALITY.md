# Quick Reference: Data Quality & Validation Rules

**Fast reference for data validation rules, acceptable ranges, and quality checks**

---

## Data Quality Rule Checklist

### Before Submission

- [ ] All required files present (Loan Portfolio, Charge-Offs, RE Values, Credit Bureau)
- [ ] File formats match specification (CSV, Excel, YXDB, etc.)
- [ ] Column names match expected names exactly (case-sensitive)
- [ ] Data types correct (dates as dates, numbers as numbers, text as text)
- [ ] No duplicate records in source files
- [ ] Date fields formatted as YYYY-MM-DD or standard Excel date
- [ ] Currency fields are numeric (no $ or , characters)
- [ ] No extra whitespace in text fields (TRIM data)

---

## Field-Level Validation Rules

### Loan Portfolio Fields

| Field | Required? | Valid Range | Notes |
|---|---|---|---|
| `Loan_ID` | YES | Any text | Must be unique within file |
| `Member_ID` | YES | Any text | Links to member record |
| `Loan_Type` | YES | Auto, Home, Personal, Credit Card, Line, Securities | Controlled vocabulary |
| `Origination_Date` | YES | <= Current_Date | Cannot be in future |
| `Maturity_Date` | YES | > Origination_Date | Maturity after origination |
| `Original_Amount` | YES | > $0, <= $10M | Reasonable loan size |
| `Current_Balance` | YES | 0 to Original_Amount | Cannot exceed original |
| `Interest_Rate` | YES | 0% - 30% | Must be reasonable |
| `Payment_Frequency` | YES | Monthly, Quarterly, Annual | Standard frequencies |
| `Payment_Status` | YES | Current, 30DPD, 60DPD, 90DPD+, Charged-Off, Paid-Off | Controlled values |
| `Days_Past_Due` | NO | 0 - 3650 (10 years) | Consistent with Payment_Status |
| `Collateral_Type` | NO | Real Estate, Auto, Securities, Cash, Unsecured | Type of collateral |
| `Collateral_Value` | NO | > $0 if present | Must be positive if provided |
| `LTV_Ratio` | NO | 0% - 300% | Higher = more risk |
| `Credit_Score` | NO | 300 - 850 | FICO range |
| `DTI_Ratio` | NO | 0% - 500% | Debt-to-income |

### Charge-Off & Recovery Fields

| Field | Required? | Valid Range | Notes |
|---|---|---|---|
| `Charge_Off_Date` | NO | If present: <= Current_Date | Must be historical |
| `Charge_Off_Amount` | NO | $0 - Original_Loan_Amount | Cannot exceed loan |
| `Recovery_Amount` | NO | $0 - Charge_Off_Amount | Cannot exceed charge-off |
| `Recovery_Date` | NO | >= Charge_Off_Date | Recovery after charge-off |
| `Principal_Recovered` | NO | $0 - Charge_Off_Amount | Cannot exceed |
| `Interest_Recovered` | NO | $0 - Any amount | Can be any amount |

### Real Estate Collateral Fields

| Field | Required? | Valid Range | Notes |
|---|---|---|---|
| `Property_Address` | NO | Any text | Should be complete address |
| `Appraised_Value` | NO | > $0 if present | Cannot be zero |
| `Appraisal_Date` | NO | If present: <= Current_Date | Cannot be future |
| `Market_Value_Trend` | NO | Up, Down, Stable | Assessment of trend |

**⚠️ Stale Appraisals:** If appraisal > 1 year old, flag for refresh

### Credit Bureau Fields

| Field | Required? | Valid Range | Notes |
|---|---|---|---|
| `Credit_Score` | NO | 300 - 850 | FICO score |
| `Score_Trend` | NO | Improving, Declining, Stable | Trajectory of score |
| `Public_Records_Count` | NO | 0 - 100+ | Bankruptcies, liens, judgments |
| `Active_Accounts` | NO | 0 - 100+ | Number of credit lines |
| `Total_Revolving_Balance` | NO | $0 - Any amount | Credit card balances |

**⚠️ Stale Credit Data:** If data > 2 weeks old, flag for refresh (TransUnion lag is normal)

---

## Cross-Field Validation Rules

| Rule | Check | Action if Fails |
|---|---|---|
| **Loan Age** | Origination_Date <= Current_Date | Reject record, flag source |
| **Maturity > Origination** | Maturity_Date > Origination_Date | Reject record, notify source |
| **Balance <= Original** | Current_Balance <= Original_Amount | Investigate, may be data error |
| **Status Consistency** | Days_Past_Due matches Payment_Status | Reconcile or use status as truth |
| **Charge-Off Completeness** | If Charge_Off_Date, then Charge_Off_Amount > 0 | Require both or neither |
| **Recovery <= Charge-Off** | Recovery_Amount <= Charge_Off_Amount | Flag for investigation |
| **LTV Calculation** | LTV = (Balance/Collateral)*100 (approx) | Verify calculation logic |
| **Appraisal Currency** | If Real Estate loan, should have Appraised_Value | Assign NULL flag, note in report |

---

## Data Quality Issues & Actions

### Issue: NULL in Required Field

**Example:** Credit_Score is NULL

**Action:**
1. Check if credit bureau data was submitted
2. Check if member exists in TransUnion
3. Options:
   - Get credit score from alternate source
   - Use sector average as proxy (temporary)
   - Flag as data quality issue for reporting
4. Do NOT reject the loan unless absolutely required

### Issue: Value Out of Range

**Example:** Interest_Rate = 45%

**Action:**
1. Verify value in source system
2. Check if unit is wrong (45 basis points vs 45%?)
3. If value is correct, escalate to data owner
4. May be valid edge case (high-risk portfolio)
5. Document in QA report

### Issue: Inconsistent Data

**Example:** Status = "Current" but Days_Past_Due = 60

**Action:**
1. Use Payment_Status as authoritative (trust status, not DPD)
2. Recalculate Days_Past_Due from last payment date
3. Investigate which field is correct
4. Document discrepancy in QA report

### Issue: Duplicate Records

**Example:** Loan_ID appears twice in portfolio file

**Action:**
1. Contact source system
2. Remove duplicates at source
3. Re-export and resubmit
4. Check if it's a system error or intentional (unlikely)

### Issue: Stale Enrichment Data

**Example:** Appraisal from 12 months ago, credit score from 4 weeks ago

**Action:**
1. Appraisal > 1 year: Flag for refresh, may want to request new appraisal
2. Credit Score 2-4 weeks old: Normal (TransUnion lag), proceed with caution
3. Pricing > 1 week old (securities): Use as fallback, mark as stale
4. Document staleness in QA report

---

## Quality Gates & Thresholds

### Data Acceptability Levels

| Metric | Acceptable | Warning | Reject |
|---|---|---|---|
| **% Records with NULL in required field** | < 1% | 1-5% | > 5% |
| **% Values out of range** | < 0.5% | 0.5-2% | > 2% |
| **% Stale data (RE appraisals)** | < 10% | 10-20% | > 20% |
| **% Stale data (Credit scores)** | < 30% | 30-50% (normal lag) | N/A (TransUnion lag) |
| **% Duplicate records** | 0% | > 0%, contact source | > 0.1% |
| **Data completeness** | > 98% | 95-98% | < 95% |

---

## QA Report Sections

The automated QA report will include:

1. **Data Completeness**
   - Total records submitted
   - Records successfully processed
   - Records rejected and why

2. **Field-Level Quality**
   - % NULL by field (highlights missing data)
   - % Out-of-range by field
   - Top validation failures

3. **Cross-Field Issues**
   - Inconsistencies (e.g., Status ≠ Days_Past_Due)
   - Duplicate records
   - Mismatched enrichment data

4. **Data Staleness**
   - Appraisal age distribution
   - Credit score age distribution
   - Collateral pricing age

5. **Recommendations**
   - Action items to improve data
   - Fields to prioritize for cleanup
   - Timing for data refreshes

---

## Quick Diagnostic Checklist

- [ ] Are required fields non-NULL?
- [ ] Are values within reasonable ranges?
- [ ] Are dates in correct format?
- [ ] Are currency values numeric?
- [ ] Are text fields trimmed (no extra spaces)?
- [ ] Are duplicate records present?
- [ ] Is enrichment data current (< 1 month)?
- [ ] Are cross-field validations consistent?
- [ ] Is record count reasonable for institution?
- [ ] Do error/reject counts align with historical patterns?

---

## Who to Contact for Data Issues

| Issue Type | Contact | Action |
|---|---|---|
| **Source system data quality** | Source System Owner | Correct data at source, re-export |
| **File format/delivery** | Data Administrator | Verify format, resubmit |
| **Validation rule questions** | Data Architect | Discuss threshold appropriateness |
| **Missing enrichment data** | Data Owner (RE/Credit/etc) | Request re-export/refresh |
| **Data interpretation** | Analytics Lead | Understand acceptable levels |

---

**See Also:** 6_FIELD_MAPPING_AND_DATA_LINEAGE.md for detailed field definitions
