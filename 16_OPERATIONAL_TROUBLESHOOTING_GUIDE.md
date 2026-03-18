# MDPA End-to-End Operational Troubleshooting Guide

**Comprehensive Guide for SME Validation and Troubleshooting**

**Document Version:** 1.0
**Last Updated:** 2026-03-18
**Audience:** SMEs, Operations Team, Support Staff, Client Support Teams

---

## Quick Navigation

This guide walks through the **7-stage MDPA processing pipeline** from data submission to dashboard consumption. Each section covers:
- What should happen at this stage
- How to detect problems
- Step-by-step resolution with specific workflow/macro references
- Common scenarios and fixes

**Stages:**
1. [Data Submission & File Preparation](#stage-1-data-submission--file-preparation)
2. [Ingestion & Validation](#stage-2-ingestion--validation)
3. [Cleansing & Standardization](#stage-3-cleansing--standardization)
4. [Enrichment & Calculations](#stage-4-enrichment--calculations)
5. [Consolidation & Joining](#stage-5-consolidation--joining)
6. [Compliance & Risk Assessment](#stage-6-compliance--risk-assessment)
7. [Output Preparation & Delivery](#stage-7-output-preparation--delivery)

---

## Stage 1: Data Submission & File Preparation

### What Should Happen

1. User prepares monthly data files from source systems:
   - Loan Portfolio file (from ERP)
   - Charge-Off & Recovery data (from Loss Management system)
   - Real Estate Valuation data (from Appraisal system)
   - Credit Bureau data (from TransUnion)

2. Files placed in designated network folder
3. TTA Web Portal receives data submission
4. Workflow is triggered via Alteryx Gallery API

### Detection Points

**Check these locations if data submission appears stuck:**

1. **Network file location** - Verify files exist in expected folder:
   - Check the `4_DATA_SOURCES_AND_LOCATIONS.md` document for exact paths
   - Confirm file naming conventions match expectations
   - Verify file sizes are reasonable (loan files typically 50MB-500MB)

2. **TTA Web Portal** - Check for submission receipt:
   - Log into portal
   - Verify job was created with correct submission date
   - Check submission timestamp vs. current time

### Common Issues & Resolution

#### Issue 1: Files Not Found in Source Location

**Symptoms:**
- Workflow fails immediately with "File not found" error
- Alert email mentions input data missing

**How to Pinpoint:**
1. Go to the source system (ERP, Loss Management, Appraisal, TransUnion)
2. Confirm data export was completed
3. Check file delivery to network location:
   - Loan file: Expected in `\\shared\MDPA\Input\Loans\` folder
   - Charge-off file: Expected in `\\shared\MDPA\Input\ChargeOffs\` folder
   - RE Values file: Expected in `\\shared\MDPA\Input\RealEstate\` folder
   - Credit Bureau file: Expected in `\\shared\MDPA\Input\CreditBureau\` folder

**Resolution Steps:**
1. Contact source system administrator to re-export data
2. Request file delivery to correct network folder
3. Verify file formatting matches expected structure (CSV, Excel, or fixed-width)
4. Re-trigger workflow from TTA Web Portal
5. Monitor for successful completion

**Workflow Reference:**
- Look at **Input Data Container** in workflow (first visible tools)
- Check "Directory" parameter in Input Data Container configuration
- Verify path points to correct network location

#### Issue 2: File Format Mismatch

**Symptoms:**
- Workflow fails with "Field not found" or "Data type mismatch" error
- Alert mentions field validation failure

**How to Pinpoint:**
1. Open source file and verify column headers:
   - Expected headers: `Loan_ID`, `Member_ID`, `Loan_Type`, `Origination_Date`, etc.
   - Check for extra spaces or special characters in headers
2. Sample 10 rows and verify data types match expectations

**Resolution Steps:**
1. Review source system export specification
2. Re-export data with correct field order and naming
3. If source system changed format, update workflow Input Container to match
4. Contact data architect to update `6_FIELD_MAPPING_AND_DATA_LINEAGE.md` if format permanently changed
5. Re-trigger workflow

**Workflow Reference:**
- **Input Data Container** - Defines expected column structure
- Check field list in Input Container properties
- Verify "Field Type" settings match source data

#### Issue 3: Incomplete Data Files

**Symptoms:**
- File exists but contains fewer records than expected
- Alert shows "Record count mismatch" or "No data" warning

**How to Pinpoint:**
1. Check source system for data availability:
   - Was export query filtered incorrectly?
   - Is data stale (from previous period)?
2. Compare row counts:
   - Expected loan count: 10,000-50,000+ loans
   - Expected charge-off count: 1,000-5,000 records
   - Expected RE valuations: 3,000-10,000 properties
   - Expected credit bureau records: 8,000-40,000 records

**Resolution Steps:**
1. Contact source system owner to verify data completeness
2. Re-run export with correct date range (current month)
3. Verify no filters are excluding valid records
4. Check file wasn't truncated during transfer
5. Re-trigger workflow

**Workflow Reference:**
- Look at **Summarize tool (after Input Data Container)** to see record counts
- If using `Contingent File Input.yxmc` macro, verify conditional logic isn't filtering data

#### Issue 4: Data Submission Portal Not Triggering Workflow

**Symptoms:**
- Files uploaded to network folder
- No workflow job created in Alteryx Gallery
- No alert emails received

**How to Pinpoint:**
1. Check TTA Web Portal logs for submission errors
2. Verify Gallery API connection is active
3. Check Alteryx Server status (is it running?)

**Resolution Steps:**
1. Contact TTA Portal administrator
2. Verify Alteryx Gallery API credentials are current
3. Check network connectivity between Portal and Gallery
4. Manually trigger workflow from Alteryx Gallery if needed:
   - Navigate to Gallery
   - Find workflow: `2020_DataProcess_v5.2`
   - Click "Run Workflow"
   - Provide JSON parameters (credit union ID, peer code, report date)
5. Monitor workflow execution in Gallery interface

**Workflow Reference:**
- Workflow file: `2020_DataProcess_v5.2.yxmd`
- Gallery parameter: Looks for JSON input from API call
- Check workflow logs in Alteryx Gallery for execution details

---

## Stage 2: Ingestion & Validation

### What Should Happen

1. Workflow reads all source files into memory
2. Initial validation checks:
   - File structure validation (columns exist)
   - Data type validation (dates are dates, numbers are numbers)
   - Null/empty value checks
   - Value range validation (interest rates between 0-30%, DTI ratios reasonable)
3. Cleansing macros prepare data for processing

### Detection Points

**Check these if data ingestion fails:**

1. **Alteryx Gallery workflow logs** - View execution status:
   - Go to Alteryx Gallery
   - Find `2020_DataProcess_v5.2` workflow
   - Click "View Logs" on recent run
   - Look for red X icons (failed tools)

2. **Specific tool locations to check:**
   - **Input Data Container** (first set of Input tools) - File reading
   - **CReW_EnsureFields macro** - Field validation
   - **Data Type tools** - Type conversion
   - Look for tools with red X or yellow warning icons

### Common Issues & Resolution

#### Issue 5: "Field Not Found" or Invalid Field Name

**Symptoms:**
- Workflow stops at validation stage
- Error mentions: "Field '[FieldName]' not found"
- Alert email about field validation failure

**How to Pinpoint:**
1. Check source file headers exactly as they appear:
   - Open source file in Excel/Notepad
   - Look for exact field name mentioned in error
   - Check for extra spaces, unusual characters, or case differences

2. In workflow, locate the **CReW_EnsureFields** macro:
   - This macro validates that expected fields exist
   - If field is expected but missing, source file is incomplete

**Resolution Steps:**
1. Identify which field is missing (from error message)
2. Check source system export includes that field
3. If source system changed, verify with data owner
4. Re-export source file with all required fields
5. Verify field name matches expected name EXACTLY (case-sensitive):
   - ✅ Correct: `Origination_Date` (underscores, exact case)
   - ❌ Wrong: `Origination Date` (spaces instead of underscores)
   - ❌ Wrong: `origination_date` (lowercase)

6. Re-trigger workflow

**Workflow Reference:**
- **Macro:** `CReW_EnsureFields.yxmc` (in Enrichment stage)
- **Look for:** This macro name appearing multiple times throughout workflow
- **Action:** Double-click macro, check "Required Fields" list
- If field should exist but doesn't, source file is incomplete

#### Issue 6: Data Type Conversion Failures

**Symptoms:**
- Error mentions: "Cannot convert [value] to [data type]"
- Specifically for dates: "Invalid date format"
- For numbers: "Non-numeric value in currency field"

**How to Pinpoint:**
1. Look at failed records (output preview if available)
2. Check source system for data quality issues:
   - Are date fields in unexpected format? (MM/DD/YYYY vs YYYY-MM-DD)
   - Are currency fields have dollar signs or commas?
   - Are numeric fields have text characters?

**Resolution Steps:**
1. Inspect problematic data values
2. Identify the format mismatch
3. Check if source system changed export format
4. Options to fix:
   - **Option A:** Fix source system export to standard format
   - **Option B:** Update workflow data type conversion logic
5. Common fixes:
   - Date format: Ensure all dates are in YYYY-MM-DD format
   - Currency: Remove $ and , before conversion
   - Numbers: Remove text characters, convert to numeric
6. Re-export and re-trigger workflow

**Workflow Reference:**
- Look for **Formula Tools** labeled with data type names
- Check **2020_Date_Converter.yxmc** macro for date-specific issues
- If date parsing fails, this is likely the culprit

#### Issue 7: Null or Empty Value Validation Failures

**Symptoms:**
- Error: "NULL value found in required field"
- Alert mentions: "Data quality check failed"

**How to Pinpoint:**
1. Determine which field has nulls (from error message)
2. Open source file and search for empty cells in that field
3. Count how many records have missing values

**Resolution Steps:**
1. For each required field with nulls:
   - Contact source system owner
   - Identify why data is missing
   - Determine if record should be excluded or value should be supplied
2. Options:
   - **Exclude records:** If data is irrelevant, mark for filtering
   - **Supply default values:** If field should have value, provide one
   - **Update source system:** If data entry is incomplete
3. Re-export data from source system
4. Re-trigger workflow

**Workflow Reference:**
- Look for **Filter tools** in Ingestion stage
- These filter out records with critical missing values
- Check Filter configuration to see which fields are being checked

#### Issue 8: Value Out-of-Range Validation Failures

**Symptoms:**
- Error: "Value [X] exceeds maximum allowed [Y]"
- Examples: Interest rate > 30%, DTI > 500%, dates in future

**How to Pinpoint:**
1. Identify the field and its problematic value (from error)
2. Find the validation rule in workflow
3. Common ranges:
   - Interest rates: 0-30%
   - DTI ratios: 0-500%
   - LTV ratios: 0-300%
   - Days past due: 0-3650 (10 years)

**Resolution Steps:**
1. Check if value is a data quality issue in source system:
   - Typo (999% instead of 9.99%)?
   - Wrong unit (basis points vs. percentages)?
2. Verify actual value from source system
3. If value is correct but outside range:
   - Contact data architect to review validation rules
   - May need to update workflow to allow valid edge cases
4. If value is incorrect (typo/unit error):
   - Correct in source system
   - Re-export and re-trigger workflow
5. If value is outlier but valid:
   - Document exception
   - Request workflow rule update if necessary

**Workflow Reference:**
- Look for **Filter tools** with conditions like:
  - `[Interest_Rate] > 0 AND [Interest_Rate] < 30`
  - `[DTI_Ratio] < 500`
  - `[Days_Past_Due] >= 0`
- Double-click Filter to see exact validation rules
- Modify range if needed (coordinate with data owner)

---

## Stage 3: Cleansing & Standardization

### What Should Happen

1. All data is standardized to consistent format:
   - Dates: All converted to YYYY-MM-DD
   - Currencies: All converted to decimal (no $ or ,)
   - Text: All trimmed, case normalized
   - States/Codes: Verified against valid value lists

2. Data cleansing macros run:
   - `Cleanse.yxmc` - General cleansing
   - Field trimming and case normalization
   - Valid value checking (state codes, loan types, etc.)

3. Records that cannot be cleaned are flagged or excluded

### Detection Points

**Check these if cleansing stage fails:**

1. **Workflow execution logs** - Look for failed cleansing steps
2. **Cleansing macro locations** - Find where data is being standardized
3. **Output preview** - View sample of cleaned data

### Common Issues & Resolution

#### Issue 9: Text Field Case or Whitespace Issues

**Symptoms:**
- Lookups fail (state code matching, loan type matching)
- Duplicate records appear (same data, different case)
- Error: "No matching value found"

**How to Pinpoint:**
1. Sample source data and look for inconsistencies:
   - Is text in mixed case? (`Checking` vs `CHECKING` vs `checking`)
   - Are there leading/trailing spaces? (`AL ` vs `AL`)
   - Are abbreviations inconsistent? (`CA` vs `California`)
2. Check workflow to see how data is being normalized

**Resolution Steps:**
1. In workflow, locate **Cleanse.yxmc** macro
2. Verify it includes:
   - TRIM() function to remove spaces
   - UPPER() or LOWER() to standardize case
3. If cleansing is working, check downstream lookups:
   - Are reference tables (valid states, loan types) in same case?
   - If source is lowercase but reference is uppercase, they won't match
4. Standardize either:
   - Source data case (best), OR
   - Reference table case to match source
5. Re-trigger workflow

**Workflow Reference:**
- **Macro:** `Cleanse.yxmc`
- **Look for:** Formula tools with TRIM() and UPPER() functions
- **Check:** Reference tables used for validation

#### Issue 10: Date Format Standardization Failures

**Symptoms:**
- Date calculations fail (age of loan, days past due calculations wrong)
- Error: "Cannot parse date [value]"
- Dates appear as text instead of date values

**How to Pinpoint:**
1. Check source system date formats:
   - Is it MM/DD/YYYY? (U.S. standard)
   - Is it DD/MM/YYYY? (European)
   - Is it YYYY-MM-DD? (ISO standard)
   - Are dates in text fields or date fields?
2. Compare with workflow expectations (should be YYYY-MM-DD)
3. Look at error sample - what format is shown?

**Resolution Steps:**
1. Locate **2020_Date_Converter.yxmc** macro in workflow
   - This handles date parsing
2. If dates are failing to parse:
   - Check source system format
   - Verify conversion macro handles that format
3. If conversion macro doesn't support source format:
   - Coordinate with data owner to change export format, OR
   - Update macro to handle new format
4. After fix, re-export and re-trigger

**Workflow Reference:**
- **Macro:** `2020_Date_Converter.yxmc` (specific to date handling)
- **Look for:** Where dates are being parsed/converted
- **Common issue:** If source uses MM/DD/YYYY but workflow expects YYYY-MM-DD

#### Issue 11: Valid Value Lookup Failures

**Symptoms:**
- Records rejected because value not in valid list
- Error: "Loan type '[VALUE]' not recognized"
- Alert: "X records excluded due to invalid codes"

**How to Pinpoint:**
1. Identify the field with invalid values (from error)
2. Common fields with validation:
   - Loan_Type (Auto, Home, Personal, etc.)
   - State (AL, AK, AZ, etc.)
   - Payment_Status (Current, 30DPD, 60DPD, etc.)
3. Check source data for the problematic value
4. Determine if it's a typo or a new legitimate value

**Resolution Steps:**
1. If value is typo in source system:
   - Correct in source system
   - Re-export and re-trigger
2. If value is legitimate but not in valid list:
   - Contact data owner to confirm it should be added
   - Update valid value reference table in workflow
   - Coordinate with data architect
3. If value is new loan type/product:
   - Verify it's correct from business perspective
   - Add to valid values list
   - Update downstream calculations that may need adjustment
4. Re-trigger workflow

**Workflow Reference:**
- Look for **Join or Lookup tools** in cleansing stage
- These match source values against valid value tables
- Check the reference table being used (what valid values are accepted?)

---

## Stage 4: Enrichment & Calculations

### What Should Happen

1. Enrichment data merged in:
   - Real estate collateral values from appraisal system
   - Credit scores from TransUnion
   - Charge-off and recovery information
   - Securities collateral (if applicable)

2. Calculated fields created:
   - **Risk_Score** = (100 - Credit_Score/10) × (DTI_Ratio/100) × (Age_Days/365)
   - **LTV_Ratio** = (Current_Balance / Collateral_Value) × 100
   - **Delinquency_Rate** = (Delinquent_Loans / Total_Loans) × 100
   - **Charge_Off_Rate** = (Charge_Off_Amount / Beginning_Balance) × 12
   - Loan age, days to maturity, months since charge-off, etc.

3. Enhancements applied:
   - Credit score classifications (FICO tiers)
   - Delinquency classifications (Current/DPD)
   - Collateral adequacy flags

### Detection Points

**Check these if enrichment stage fails:**

1. **Enrichment data availability** - Are RE values, credit scores, charge-offs coming through?
2. **Calculation results** - Do computed fields have reasonable values?
3. **Join/merge success** - Are enrichment data matching to loan records?

### Common Issues & Resolution

#### Issue 12: Missing Real Estate Valuation Data

**Symptoms:**
- Many loans have NULL in `Collateral_Value` field
- LTV calculations return NULL or error
- Alert: "Real estate data missing for X loans"

**How to Pinpoint:**
1. Count loans with missing RE values:
   - Filter to loans with `Loan_Type = 'Home'` (should have RE value)
   - Check how many have NULL `Collateral_Value`
2. Compare loan count to RE valuation data count
3. Check if RE data was included in submission

**Resolution Steps:**
1. Verify RE valuation file was submitted (see Stage 1)
2. If file exists, check data completeness:
   - Does it have all properties from loan file?
   - Are some properties missing valuations?
3. Check the **Join logic** in workflow:
   - How is RE data matched to loans? (by property address? property ID?)
   - Are matching fields aligned between loan and RE files?
4. If RE data incomplete:
   - Contact appraisal system owner to complete valuations
   - Request re-export with complete data
5. If join is failing:
   - Verify matching fields are present in both files
   - Check for formatting mismatches (spaces, case, etc.)
   - May need to update join logic if source system changed
6. Re-export and re-trigger

**Workflow Reference:**
- Look for **Join tool** labeled with "Real Estate" or "Collateral Value"
- Check join configuration:
  - What fields are being matched? (Address? Property ID?)
  - Is it Inner Join (excludes unmatched) or Left Join (keeps unmatched)?
- If many unmatched, join logic may need adjustment

#### Issue 13: Credit Score Data Missing or Stale

**Symptoms:**
- Many loans missing credit score
- Credit scores appear outdated (same scores as last month)
- Alert: "Credit Bureau data incomplete for X records"

**How to Pinpoint:**
1. Check last update date on credit bureau data:
   - Look at file timestamp vs. current date
   - Is it from current month or previous month?
2. Compare expected vs. received credit scores:
   - Count records with credit scores
   - Count NULL values
3. Identify pattern - are certain member types missing scores?

**Resolution Steps:**
1. Check TransUnion data submission:
   - Was credit bureau data file submitted?
   - Is it current (from this month)?
2. If file is stale (from previous month):
   - Known issue: TransUnion may lag 1-2 weeks
   - Workaround: Use previous month's scores if acceptable
   - OR request expedited refresh from TransUnion
3. If credit scores are missing for specific loans:
   - Check if those members exist in TransUnion database
   - New members or non-prime borrowers may not have scores
   - Contact TransUnion to request full export
4. If significant portion missing:
   - Escalate to data owner
   - May need to request TransUnion refresh or alternative scoring source
5. Re-trigger workflow with updated data

**Workflow Reference:**
- Look for **Union or Join tool** that brings in TransUnion data
- Check if there's a **Filter** that removes records without credit scores
- May also check **5_ALERTS_AND_NOTIFICATIONS.md** for TransUnion-specific warnings

#### Issue 14: Charge-Off Data Not Matching Loans

**Symptoms:**
- Loans show as charged-off in one place but active in another
- Charge-off amount doesn't match expected amount
- Alert: "Charge-off and portfolio data mismatch"

**How to Pinpoint:**
1. Identify discrepancy:
   - Check if loan appears in both Loan Portfolio and Charge-Off file
   - Are amounts consistent?
   - Are dates aligned?
2. Determine root cause:
   - Was charge-off processed after monthly data extract?
   - Are there timing differences between systems?
   - Did charge-off status update in source but portfolio file is stale?

**Resolution Steps:**
1. Check loan status in source systems:
   - Loan Portfolio: What status is shown?
   - Charge-Off system: Is loan listed as charged-off?
2. Reconcile discrepancies:
   - If status differs, determine which system is authoritative
   - Check transaction dates - what happened and when?
3. Fix source data if needed:
   - Update status in source system
   - Re-export both files with corrected data
4. Check workflow join logic:
   - How is charge-off data being matched to loans?
   - Is matching field correct and aligned?
   - Are there extra spaces or case differences causing mismatch?
5. Re-trigger workflow

**Workflow Reference:**
- Look for **Join tool** that combines loan portfolio with charge-offs
- Check the matching key - what field links them?
- Verify both files have the same key format (case, spaces, etc.)

#### Issue 15: Calculation Errors (Risk Score, LTV, Delinquency Rate)

**Symptoms:**
- Calculated field is NULL, negative, or unusually large
- Example: Risk_Score shows -100 or 50000
- Example: LTV shows 5000% or is negative
- Example: Delinquency rate shows >100%

**How to Pinpoint:**
1. Identify which calculation failed
2. Check the formula:
   - Risk_Score = (100 - Credit_Score/10) × (DTI_Ratio/100) × (Age_Days/365)
   - LTV = (Current_Balance / Collateral_Value) × 100
   - Delinquency_Rate = (Delinquent_Loans / Total_Loans) × 100
3. Look for input data issues:
   - Is Credit_Score a valid number? (300-850 range)
   - Is DTI_Ratio reasonable? (0-500%)
   - Is Collateral_Value > 0 and non-NULL?
   - Is Current_Balance > 0?

**Resolution Steps:**
1. **For Risk_Score errors:**
   - Check Credit_Score: If NULL or outside range, fix in enrichment stage
   - Check DTI_Ratio: If NULL or > 500%, verify in source data
   - Check loan age (Age_Days): Should be > 0, < 10000 days
   - If any input is invalid, trace back to its source and fix

2. **For LTV errors:**
   - Check Current_Balance is > 0 and not NULL
   - Check Collateral_Value is > 0 and not NULL
   - If LTV > 100%, it's valid but signals higher risk (monitor for margin calls on securities)
   - If LTV is negative, Current_Balance or Collateral_Value is negative (data quality issue)

3. **For Delinquency_Rate errors:**
   - If > 100%, more loans are delinquent than total (join/merge error)
   - Check join logic - are duplicate records being created?
   - Verify aggregation logic is correct

4. After identifying root cause:
   - Fix underlying data (credit score, DTI, collateral value)
   - Re-trigger workflow
   - Verify calculated fields are now reasonable

**Workflow Reference:**
- Look for **Formula tools** with calculation names (Risk_Score, LTV_Ratio, Delinquency_Rate)
- Double-click formula tool to see exact calculation
- Check for NULL values in calculation inputs
- Verify no division by zero (e.g., if Collateral_Value = 0, LTV will error)

#### Issue 16: Securities Collateral Missing or Incomplete

**Symptoms:**
- Securities-backed loans missing collateral value
- Margin call alerts not triggering
- Alert: "Securities pricing data not received"

**How to Pinpoint:**
1. Check if securities data was submitted:
   - Look for securities file in submission
   - Verify it matches expected format (ticker, quantity, price)
2. Identify which loans are affected:
   - Filter to loans with `Collateral_Type = 'Securities'`
   - Count how many have NULL or zero `Collateral_Value`
3. Check for pricing staleness:
   - Are prices from current date or previous date?
   - Is pricing data more than 1 day old?

**Resolution Steps:**
1. If securities file missing entirely:
   - Contact broker/custodian to submit securities collateral data
   - Verify file includes: Loan_ID, Ticker, Quantity, Current_Price, Pricing_Date
2. If file incomplete (missing pricing):
   - Escalate to securities pricing service (Bloomberg, broker API, etc.)
   - May need to use stale pricing as fallback (with alert)
   - For liquid securities, use previous day's close
3. Check for margin call scenarios:
   - If LTV > 100% on securities loan, borrower needs to be contacted
   - Workflow should flag these automatically - if not, check macro
4. See **14_SECURITIES_COLLATERAL_GUIDE.md** and **15_MISSING_SECURITIES_SCENARIOS.md** for detailed securities handling

**Workflow Reference:**
- Look for **Securities** specific macros or containers
- Check join that merges securities to loan records
- Verify pricing data is current (from today, not previous period)

---

## Stage 5: Consolidation & Joining

### What Should Happen

1. All enriched data consolidated into single comprehensive dataset
2. Multiple versions of data joined (current vs. prior period)
3. Duplicate handling:
   - If loan appears twice, prioritize current data
   - Archive old versions
4. All fields from all sources now available for downstream processing

### Detection Points

**Check these if consolidation fails:**

1. **Join success rates** - Are all expected records making it through?
2. **Duplicate detection** - Are duplicate records being created or properly handled?
3. **Field completeness** - Do consolidated records have all expected fields?

### Common Issues & Resolution

#### Issue 17: Duplicate Records Being Created

**Symptoms:**
- Record counts increase unexpectedly after consolidation stage
- Same loan appears multiple times
- Sum of balances exceeds expected total
- Alert: "X duplicate records detected"

**How to Pinpoint:**
1. Look at workflow output at consolidation stage:
   - Count total records
   - Group by Loan_ID and count
   - If any Loan_ID count > 1, duplicates exist
2. Identify cause:
   - Is one source file including duplicates?
   - Is join creating duplicates (1-to-many relationship)?
   - Are multiple versions of same loan present (old vs. new)?

**Resolution Steps:**
1. **Check source files for duplicates:**
   - Open each input file (Loan Portfolio, Charge-offs, etc.)
   - Look for Loan_ID appearing twice
   - If source has duplicates, contact source system to fix
2. **Check join logic:**
   - Look for Union tools in consolidation stage
   - Are they stacking data correctly or creating duplicates?
3. **Check for competing data versions:**
   - Is both "current" and "prior period" data present?
   - Workflow should have logic to prioritize current
4. **Resolution:**
   - If source has duplicates: Fix in source system, re-export
   - If join has duplicates: Review join logic, may need to add deduplication
   - If version mismatch: Check sort/prioritization logic
5. Re-trigger workflow

**Workflow Reference:**
- Look for **Union tools** in consolidation stage
- Check **Sort tools** that might prioritize one version over another
- Look for **Summarize or Group By** tools that might be deduplicated

#### Issue 18: Records Lost in Join

**Symptoms:**
- Record count decreases after consolidation (records disappear)
- Expected loans are missing from output
- Alert: "X records excluded" without explanation

**How to Pinpoint:**
1. Compare record counts:
   - Count in: Loan Portfolio file
   - Count out: After consolidation stage
   - Difference = lost records
2. Identify pattern - what do lost records have in common?
   - Same loan type? (All home loans? All securities?)
   - Same status? (All charged-off?)
   - Same data issue? (NULL credit score? Missing collateral?)

**Resolution Steps:**
1. **If Inner Join used (default):**
   - Only records that match in ALL files are kept
   - Missing records means they don't have matches
   - Example: Home loan without RE valuation will be excluded if RE join is Inner Join
2. **Check join configuration:**
   - Is join logic correct?
   - Should it be Inner (exact match required) or Left (keep all from left, NULL if no match)?
3. **Options to fix:**
   - **Option A:** Change join to Left Join (keeps all loans, NULLs for missing enrichment)
   - **Option B:** Provide missing data (get RE valuations, credit scores, etc.)
   - **Option C:** Filter records intentionally (if missing enrichment data is reason to exclude)
4. After deciding approach, update workflow and re-trigger

**Workflow Reference:**
- Look for **Join tools** in consolidation stage
- Right-click and check Join Type:
  - Inner Join = strict matching (may lose records)
  - Left Join = keep all left records, NULL if no match
  - Full Outer Join = keep all records, NULL where no match
- Change Join Type if needed based on business requirement

#### Issue 19: Field Mismatches Causing Join Failures

**Symptoms:**
- Join produces no output (0 records) despite both inputs having data
- Error: "Join key not found"
- Records that should match don't (e.g., loan-to-collateral join)

**How to Pinpoint:**
1. Identify which join is failing
2. Check the join key (field used to match):
   - Loan-to-RE: Should match on Property_ID or Address
   - Loan-to-ChargeOff: Should match on Loan_ID
   - Loan-to-CreditBureau: Should match on Member_ID or SSN
3. Verify both sides have matching data:
   - Do both files have the join key field?
   - Are values formatted consistently? (exact match required)
   - Examples:
     - Loan file has "CA" but RE file has "California" (won't match)
     - Loan file has "Loan123" but CO file has "Loan0123" (won't match)
     - Loan file has spaces, CO file doesn't (won't match)

**Resolution Steps:**
1. **Verify join key fields exist:**
   - Both input files must have the join key field
   - Check field names match exactly (case-sensitive)
2. **Verify data formats match:**
   - Sample data from both files
   - Compare sample join key values
   - Are they in same format? Same case? Same spacing?
3. **Fix formatting mismatches:**
   - If Property_ID is numeric in one and text in other: Convert both to same type
   - If addresses have different case/spacing: Normalize both using UPPER() and TRIM()
4. **Test join with sample data:**
   - In workflow, add preview after join
   - Manually verify matching is working
5. Re-trigger workflow

**Workflow Reference:**
- Locate the failing **Join tool**
- Click Join Configuration
- Check "Join On" fields - verify they exist in both inputs
- Check for **Formula tools before Join** that might normalize/convert join keys

---

## Stage 6: Compliance & Risk Assessment

### What Should Happen

1. Regulatory compliance checks:
   - Loan status validation
   - Concentration risk analysis
   - Stress testing scenarios
   - Capital adequacy calculations

2. Risk scoring and classification:
   - Risk_Score calculation
   - Risk tiers (Low/Medium/High)
   - Delinquency classification
   - Charge-off probability assessment

3. Alerts and flags generated:
   - Margin call alerts (securities > LTV)
   - Concentration warnings
   - Stress test failures
   - Regulatory threshold breaches

### Detection Points

**Check these if compliance stage fails:**

1. **Compliance rule violations** - Are certain loans being rejected?
2. **Alert generation** - Are expected alerts being created?
3. **Risk scoring** - Do risk scores seem reasonable?

### Common Issues & Resolution

#### Issue 20: Risk Score Classification Errors

**Symptoms:**
- Loans classified as Low risk but should be High
- Risk scores don't match manual calculations
- Alert: "Risk classification mismatch"

**How to Pinpoint:**
1. Pick sample loan and manually calculate:
   - Risk_Score = (100 - Credit_Score/10) × (DTI_Ratio/100) × (Age_Days/365)
   - Example: CS=680, DTI=40%, Age=500 days
   - = (100 - 68) × 0.4 × (500/365) = 32 × 0.4 × 1.37 = 17.5
2. Compare manual calculation to workflow output
3. If they differ, find where calculation went wrong

**Resolution Steps:**
1. **Check input values:**
   - Is Credit_Score correct? (Should be 300-850)
   - Is DTI_Ratio correct? (Should be 0-500%)
   - Is Age_Days correct? (Should be > 0)
2. **Check formula in workflow:**
   - Find **Formula tool** with Risk_Score calculation
   - Verify formula matches expected formula
   - Check for NULL handling (what if credit score is NULL?)
3. **Check classification logic:**
   - Where does risk tier (Low/Med/High) get assigned?
   - Look for thresholds: Risk_Score > 50 = High, etc.
   - Are thresholds appropriate?
4. **If formula is wrong:**
   - Contact data architect
   - Update formula in workflow
   - Re-trigger with test data
5. Re-trigger production workflow

**Workflow Reference:**
- Find **Formula tools** with "Risk" in name
- Check formula syntax and parameters
- Look for **Filter or Formula tool** that assigns risk tiers based on scores

#### Issue 21: Concentration Risk Not Being Detected

**Symptoms:**
- Single borrower or industry concentration very high
- No alert issued
- Risk dashboard doesn't show concentration warnings

**How to Pinpoint:**
1. Manually calculate concentration:
   - Group by borrower/industry
   - Sum total exposure for each
   - Calculate % of portfolio
2. Compare to workflow output:
   - Does workflow show same concentrations?
   - Are alerts being generated?
3. Check if concentration exceeds threshold:
   - Typical threshold: Any single borrower > 2-5% of portfolio
   - Industry concentration > 20-30%

**Resolution Steps:**
1. **Check concentration calculation:**
   - Is there a concentration analysis container in workflow?
   - Look for tools that group by borrower and sum exposure
2. **Check alert threshold:**
   - Is threshold set appropriately?
   - Is alert being generated at threshold?
   - Is alert being delivered to right person?
3. **If concentration is real problem:**
   - May need portfolio adjustment
   - Work with risk committee to address
4. **If calculation/alert is wrong:**
   - Verify grouping and summing logic
   - Check threshold values
   - Update workflow if needed

**Workflow Reference:**
- Look for **Summarize tools** that group by Borrower or Industry
- Check for **Filter tools** with concentration thresholds
- Look for **Send Email tools** that generate alerts (check recipients)

#### Issue 22: Margin Call Alerts Not Triggering (Securities)

**Symptoms:**
- Securities loans with LTV > 100%
- No margin call alert generated
- Borrower not notified

**How to Pinpoint:**
1. Find securities loans with high LTV:
   - Filter to Collateral_Type = 'Securities'
   - Look for LTV > 100%
2. Check if margin call threshold is breached:
   - Standard threshold: LTV ≥ 100% = margin call required
   - Check if threshold is different in your organization
3. Verify alert was generated:
   - Check alert log
   - See if email was sent
   - Verify recipient list

**Resolution Steps:**
1. **Check securities collateral data:**
   - Is pricing current (from today)?
   - If pricing is stale, that's why margin call might be missed
   - Update pricing and recalculate LTV
2. **Check LTV calculation for securities:**
   - Formula: LTV = (Loan_Amount / (Security_Value × (1-Haircut))) × 100
   - If using haircuts, ensure they're applied
3. **Check margin call trigger:**
   - Is there a threshold set? (typically LTV ≥ 100%)
   - Is condition checking working?
4. **Check alert delivery:**
   - Is alert being generated?
   - Is recipient list correct?
   - Is email service working?
5. **See detailed guide:**
   - Review **14_SECURITIES_COLLATERAL_GUIDE.md** for securities handling
   - Review **15_MISSING_SECURITIES_SCENARIOS.md** for edge cases
6. Fix and re-trigger

**Workflow Reference:**
- Look for **Securities** specific container/macro
- Check **Formula tool** for LTV calculation (verify haircut application)
- Look for **Filter tool** with LTV > 100% condition
- Check **Send Email tool** for margin call alert

#### Issue 23: Stress Testing Not Producing Expected Results

**Symptoms:**
- Stress test results don't match expected impact
- Portfolio resilience metrics seem off
- Alert: "Stress test failed" without details

**How to Pinpoint:**
1. Identify stress test scenario:
   - Rate shock (all rates up 2%)?
   - Credit migration (% default up)?
   - Collateral value shock (real estate down 20%)?
2. Manually calculate impact:
   - Apply shock to relevant field
   - Recalculate risk metrics
   - See what should happen
3. Compare to workflow output

**Resolution Steps:**
1. **Check stress test parameters:**
   - What shocks are being applied?
   - Are parameters configured correctly?
   - Look for stress test macros/containers in workflow
2. **Check which fields are affected:**
   - Interest rate shock: Should affect rates and interest income
   - Credit migration: Should affect risk scores and default likelihood
   - Collateral shock: Should affect LTV and margin calls
3. **Verify calculations:**
   - Formula for stress impact correct?
   - Are all affected fields being updated?
4. **If parameters/formulas wrong:**
   - Update stress test configuration
   - Verify with risk team
5. Re-trigger and validate

**Workflow Reference:**
- Look for containers labeled "Stress" or "Scenario"
- Check for macro with stress testing logic
- Look for Formula tools that apply shocks to fields

---

## Stage 7: Output Preparation & Delivery

### What Should Happen

1. Final datasets prepared:
   - Client file (YXDB format)
   - QA report (validation summary)
   - Tableau extract (TDE/Hyper format)
   - Archive backup
   - Executive summary

2. File formatting:
   - Proper column ordering
   - Calculated field selection
   - Summary statistics calculated

3. Files delivered:
   - Client file uploaded to secure location
   - Tableau extract loaded to server
   - QA report emailed
   - Archive stored for backup

### Detection Points

**Check these if output stage fails:**

1. **Output file generation** - Are files being created?
2. **File delivery** - Are files reaching their destinations?
3. **Tableau refresh** - Is Tableau data updating?

### Common Issues & Resolution

#### Issue 24: Output Files Not Being Generated

**Symptoms:**
- Workflow completes but no output files created
- Error: "Output file not found"
- Client file missing from delivery location

**How to Pinpoint:**
1. Check output locations:
   - Client file: Expected at `\\shared\MDPA\Output\ClientFiles\[CU_Name]_[Date].yxdb`
   - QA report: Expected at `\\shared\MDPA\Output\Reports\QA_[Date].xlsx`
   - Tableau extract: Expected at `\\shared\MDPA\Output\Tableau\[CU_Name].hyper`
   - Archive: Expected at `\\shared\MDPA\Archive\[CU_Name]_[Date].zip`
2. Check workflow logs for output tool errors
3. Look for missing final containers in workflow

**Resolution Steps:**
1. **Check output tool configuration:**
   - Find Output Data or Output File tools
   - Verify they're connected to data
   - Verify output paths are correct
2. **Check file permissions:**
   - Are output directories writable?
   - Does Alteryx service account have write permissions?
3. **Check disk space:**
   - Is output drive full?
   - Are there quota limits?
4. **Check data is flowing to output:**
   - Add preview before output tool
   - Is there data to write?
   - If no data, issue is earlier in workflow
5. **After fixing:**
   - Re-trigger workflow
   - Verify files appear in output location

**Workflow Reference:**
- Look for **Output Data** or **Output File** tools near end of workflow
- Verify their Input connectors are green (connected)
- Check configuration for:
  - File format (YXDB, TDE, etc.)
  - Output directory path
  - File naming conventions

#### Issue 25: Client File Format or Field Mismatch

**Symptoms:**
- Client receives file but fields are wrong
- File format unexpected (Excel instead of YXDB)
- Error: "Client file validation failed"

**How to Pinpoint:**
1. Open output file and inspect:
   - What format is it? (YXDB, Excel, CSV, etc.)
   - What fields are included?
   - What fields are missing?
2. Compare to expected file specification:
   - Review client contract/SLA for required fields
   - Check **6_FIELD_MAPPING_AND_DATA_LINEAGE.md** for output field mapping
3. Check field order:
   - Are fields in expected order?
   - Should Loan_ID be first? Should it be alphabetical?

**Resolution Steps:**
1. **If field list wrong:**
   - Find **Select tool** before output that defines output fields
   - Verify all required fields are selected
   - Add missing fields if needed
2. **If field order wrong:**
   - Reorder fields in **Select tool**
   - Move critical fields to beginning (Loan_ID, Member_ID, etc.)
3. **If format wrong:**
   - Check **Output Data** tool configuration
   - Change format to YXDB if currently Excel/CSV
   - Or vice versa if Excel is required
4. **Test with small dataset:**
   - Run workflow with 100 test records
   - Validate output format and fields
5. **Coordinate with client:**
   - Confirm file format requirements
   - Confirm field list and order
6. Re-trigger production workflow

**Workflow Reference:**
- Find **Select tool** before output - this controls field selection and order
- Check **Output Data tool** - this controls file format and location

#### Issue 26: Tableau Extract Not Updating

**Symptoms:**
- Tableau dashboard shows old data
- Last refresh timestamp is from previous period
- Alert: "Tableau refresh failed"

**How to Pinpoint:**
1. Check Tableau Server:
   - When was extract last refreshed?
   - Is it newer than workflow run?
2. Check if Alteryx generated new extract:
   - Did workflow complete successfully?
   - Did output file get created?
3. Check Tableau data source settings:
   - Is refresh scheduled?
   - What time is refresh set to run?
   - Has it actually run?

**Resolution Steps:**
1. **If Alteryx extract not generated:**
   - Check Stage 7 output generation (see Issue 24)
   - Verify YXDB or TDE file is being created
2. **If extract generated but Tableau not refreshing:**
   - Check Tableau Server status
   - Verify Tableau can access file location
   - Check file permissions
3. **Manually refresh Tableau extract:**
   - Log into Tableau Server
   - Find extract in question
   - Click "Refresh Now"
   - Monitor refresh progress
4. **Check refresh schedule:**
   - If no refresh scheduled, add schedule
   - Coordinate with Alteryx schedule (must run after)
   - Verify both services are running
5. **Check extract connection:**
   - Verify Tableau data source points to correct file
   - Verify file path is still valid
   - Verify file permissions allow Tableau read access
6. Re-trigger Alteryx workflow
7. Manually refresh Tableau if needed

**Workflow Reference:**
- Look for **Output tool** that creates Tableau extract
- Verify it's generating Hyper or TDE file
- Check file path matches Tableau data source connection

#### Issue 27: QA Report Not Emailed

**Symptoms:**
- Workflow completes but no QA report email received
- Alert: "Email delivery failed"
- Report generated but not sent to stakeholders

**How to Pinpoint:**
1. Check if report file was created:
   - Look for QA_[Date].xlsx in output location
   - Check file timestamp
2. Check for email send error in workflow logs
3. Verify email recipients are correct:
   - Who should receive QA report?
   - Are they in recipient list?

**Resolution Steps:**
1. **If report file not created:**
   - Check output generation (see Issue 24)
   - Verify Summarize tools are creating QA data
2. **If report created but email fails:**
   - Check **Send Email tool** in workflow
   - Verify email configuration:
     - SMTP server address
     - From address
     - To addresses
     - Subject and body
3. **Check email service:**
   - Is email server running?
   - Can Alteryx reach it?
   - Are credentials correct?
4. **Test email delivery:**
   - In Alteryx, add test **Send Email** tool
   - Send test email to known address
   - Verify it arrives
5. **Fix email configuration:**
   - Update SMTP server if changed
   - Update recipient list if needed
   - Verify credentials
6. Re-trigger workflow

**Workflow Reference:**
- Find **Send Email tool** (usually near end of workflow)
- Check configuration:
  - To: Recipients (should be list, separated by semicolons)
  - From: Sender address
  - Subject: Should be dynamic (include date, CU name)
  - Body: Should reference QA report
  - Attachment: Should reference QA file path

#### Issue 28: Archive Not Being Created

**Symptoms:**
- Backup archive missing
- Can't recover historical data
- No versioned copy of processed data

**How to Pinpoint:**
1. Check archive location:
   - Expected at: `\\shared\MDPA\Archive\[CU_Name]_[Date].zip`
2. Check if archive tool is in workflow:
   - Look for containers or tools labeled "Archive"
3. Check workflow logs for archive creation errors

**Resolution Steps:**
1. **If archive location doesn't exist:**
   - Create the archive directory
   - Grant write permissions to Alteryx service account
2. **If archive tool missing from workflow:**
   - May need to add archive step
   - Consult workflow designer
3. **If archive process is failing:**
   - Check output file exists before archiving
   - Verify archive format (ZIP, GZIP, etc.)
   - Check disk space for archive
4. **After fixing:**
   - Re-trigger workflow
   - Verify archive file appears in archive location

**Workflow Reference:**
- Look for **Archive** or **ZIP** tool
- Check it's connected to output data
- Verify output path for archive

---

#### Issue 29: Tableau Publishing Fails (TDE/DCM Authentication) ⚠️ CRITICAL

**Symptoms:**
- Workflow fails at Tableau publish stage
- Error: "Could not publish to Tableau Server"
- Error: "403 Forbidden" or "Authentication failed"
- Tableau extract not updating
- Multiple publish errors (CLIENTFILE, DROPPED, SECURITIES)

**Root Cause Analysis:**
This issue occurred March 6-18, 2026 when Alteryx Designer upgraded to v2024.2, which removed native TDE (Tableau Data Extract) support. The workflow relied on legacy "Publish to Tableau Server" connector v1.08.1 that no longer works.

Additionally, Tableau DCM (Data Connection Manager) credential was not shared with the JTodd service account used by the web application API.

**How to Pinpoint:**
1. Check Alteryx Designer version:
   - Open Designer → Help → About
   - If v2024.2 or later: This is the culprit
2. Check Tableau publish containers:
   - Look for old Container 1049 (should be disabled)
   - Check if new Tableau Output macros are active (1055, 1056, 1057)
3. Check DCM credential sharing:
   - In Alteryx Gallery Admin → Settings
   - Find "Tableau Integration — Zevs Token" credential
   - Verify it's shared with JTodd service account
4. Check workflow logs for specific errors:
   - "TDE not supported" → Designer version issue
   - "403 Unauthorized" → Credential sharing issue

**Resolution Steps:**

**Step 1: Verify New Tableau Output Macros Are Active**
1. Open workflow in Alteryx Designer
2. Locate the three output macros:
   - Tableau New Macro (1055) — CLIENTFILE
   - Tableau New Macro Dropped (1056) — DROPPED
   - Tableau New Macro Securities (1057) — SECURITIES
3. Verify they are connected and NOT disabled
4. If old Container 1049 still exists, verify it's disabled

**Step 2: Verify DCM Credential Configuration**
1. In each macro, check that Action tool is configured to:
   - ToolID: 19 (Tableau Output tool within macro)
   - Action: Update tool property
   - Property: Tableau Output tool configuration
   - FileAction: Overwrite
2. Verify DCM connection name is "Tableau Integration — Zevs Token"
3. Verify credential is using Personal Access Token (PAT) authentication

**Step 3: Share DCM Credential with Service Account**
1. Log into Alteryx Gallery as Admin
2. Navigate to: Admin → Settings → Data Connections
3. Find "Tableau Integration — Zevs Token"
4. Share with JTodd account and any other service accounts that run workflows
5. Verify "Can use credential in scheduled workflows" is checked

**Step 4: Update Designer If Needed**
1. Check if newer Alteryx Designer version available:
   - Designer → Help → Check for Updates
2. If v2024.3 or later available: Install
3. Updated version may resolve Tableau Output SDK issues

**Step 5: Verify Securities Macro Data Handling**
1. For Tableau New Macro Securities (1057):
   - Check that Block Until Done tool exists (added in remediation)
   - Verify Sample → Append Fields → Filter gating mechanism
   - This prevents errors when Securities data is empty
2. If Securities data is consistently empty:
   - Macro may produce non-fatal '#1' error
   - This is expected and can be ignored if no securities portfolio

**Step 6: Test Workflow**
1. Run workflow with test data
2. Monitor Tableau publish stage
3. Verify all three publish macros complete without errors
4. Check Tableau Server to confirm extract updated

**If Still Failing:**
1. Check that web API key matches credential configuration
2. Verify Alteryx Server can reach Tableau Server (network connectivity)
3. Check Tableau Server status page for alerts
4. Contact Tableau admin to verify extract permissions

**Workflow Reference:**
- **Old (Disabled) Container:** 1049
  - Tool 287: 2020 Publish to Tableau (CLIENTFILE)
  - Tool 369: 2020 Publish Dropped to Tableau (DROPPED)
  - Tool 929: 2020 Publish Securities to Tableau (SECURITIES)

- **New (Active) Macros:**
  - Macro 1055: Tableau New Macro (CLIENTFILE)
  - Macro 1056: Tableau New Macro Dropped (DROPPED)
  - Macro 1057: Tableau New Macro Securities (SECURITIES)
  - All use Tableau Output tool (v1.5.4) with Hyper format and DCM authentication

**Known Issues & Workarounds:**
- **Securities empty data:** Non-fatal '#1' error when 0 securities records. Normal behavior—gating mechanism prevents this from breaking workflow.
- **Email tool error:** Tool 953 (email notification) may fail if SMTP connection not configured. See Step 7 in Output Stage for email setup.

**Historical Context:**
- **Date Issue Occurred:** March 6, 2026
- **Root Cause:** Alteryx Designer 2024.2 removed native TDE support
- **Secondary Cause:** DCM credential not shared with JTodd service account
- **Remediation Date:** March 18, 2026
- **Remediation By:** Zev Butler (DevOps)
- **Test Status:** ✅ All publish macros working (when data exists)

**Related Documentation:**
- See `2_WORKFLOW_ARCHITECTURE.md` for updated output architecture
- See `5_ALERTS_AND_NOTIFICATIONS.md` for alert configuration
- See `22_FAQ_COMMON_QUESTIONS.md` for Tableau refresh troubleshooting (Question 13)

---

## Quick Escalation Guide

**Use this when you need to quickly escalate an issue:**

| Issue Category | Check First | Contact | Timeline |
|---|---|---|---|
| **Input Files Missing** | Network folder existence | Source System Admin | Immediate |
| **Data Quality** | Source system data | Data Owner | Same day |
| **Calculation Error** | Formula in workflow | Data Architect | Same day |
| **Tableau Not Updating** | Extract file, refresh schedule | Tableau Admin | 1-2 hours |
| **Email Not Sending** | SMTP configuration | IT/Email Admin | 1-2 hours |
| **File Permission Issue** | Directory permissions | System Admin | 1-2 hours |
| **Securities Data** | See guides 14 & 15 | Securities Officer | Immediate |
| **Regulatory/Compliance** | Risk score logic, thresholds | Compliance Officer | Immediate |

---

## Appendix: Where to Find More Information

- **Data sources & locations:** See `4_DATA_SOURCES_AND_LOCATIONS.md`
- **Workflow architecture:** See `2_WORKFLOW_ARCHITECTURE.md`
- **Field definitions:** See `6_FIELD_MAPPING_AND_DATA_LINEAGE.md`
- **Calculations & formulas:** See `6_FIELD_MAPPING_AND_DATA_LINEAGE.md` (Stage details)
- **Alert details:** See `5_ALERTS_AND_NOTIFICATIONS.md`
- **Securities handling:** See `14_SECURITIES_COLLATERAL_GUIDE.md` & `15_MISSING_SECURITIES_SCENARIOS.md`
- **Macro list:** See `3_MACROS_AND_DEPENDENCIES.md` & `7_MACROS_DEEP_DIVE.md`
- **Dashboard interpretation:** See `12_TABLEAU_DASHBOARD_GLOSSARY.md`

---

**Last Updated:** 2026-03-18
**Document Purpose:** End-to-end troubleshooting for SME validation and client support
