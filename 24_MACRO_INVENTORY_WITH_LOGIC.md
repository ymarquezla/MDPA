# MDPA Macro Inventory with Business Descriptions & Logic

**Comprehensive Reference for All 23 Macros: Purpose, Data, and Logic**

**Version:** 1.0
**Last Updated:** 2026-03-18
**Audience:** Developers, Data Engineers, Business Analysts, Technical Architects

---

## Overview

This document provides a complete inventory of all **23 unique macros** used in the MDPA v5.2 workflow, with:
- Business purpose and context
- Input data and sources
- Output data and destinations
- Internal logic and processing steps
- Complexity and dependencies

**Note:** 42 total macro instances are used throughout the workflow; 23 are unique macros.

---

## Macro Nesting & Dependency Analysis Summary

### Nesting Patterns

| Macro | Internal Nesting | Nesting Type | Complexity |
|-------|-----------------|--------------|-----------|
| **CReW_EnsureFields** | ✅ LIKELY | Field validation loop + type coercion | VERY HIGH |
| **CReW_ParallelBlockUntilDone** | ✅ DEFINITELY | Multi-stream synchronization + timeout logic | VERY HIGH |
| **Contingent File Input** | ✅ YES | IF/THEN/ELSE conditional logic | HIGH |
| **PreProcess_Iterative** | ✅ YES | WHILE loop with max iterations | HIGH |
| **Append Charge Offs and Matching** | ✅ YES | Nested JOINs + aggregation logic | VERY HIGH |
| **Preliminary Client File Match** | ✅ YES | LEFT JOIN + error handling | HIGH |
| **Auto Value Append** | ✅ YES | Lookup logic + calculation loop | MEDIUM-HIGH |
| **2020_Date_Converter** | ✅ YES | Pattern detection + conversion logic | MEDIUM-HIGH |
| **Append RE Values** | ✅ YES | Lookup + appending logic | MEDIUM |
| **Dropped Records Prep** | ✅ YES | Categorization + filtering logic | MEDIUM |
| **All Output/Publishing Macros (1055-1057)** | ✅ YES | Sample + Filter + SDK tool + Block Until Done | HIGH |
| **Other ID/Formatting Macros** | ✅ YES | Conditional formatting + validation | MEDIUM |

**Key Finding:** No **direct macro-calling-macro** pattern in main workflow (macros don't invoke other macros). All nesting is **internal** within individual macros.

### External System Dependencies

| System | Macros Dependent | Purpose | Criticality |
|--------|------------------|---------|------------|
| **Tableau Server** | Macro 1055, 1056, 1057 | Hyper extract publishing | CRITICAL |
| **DCM (Data Connection Manager)** | Macro 1055, 1056, 1057 | Authentication for Tableau | CRITICAL |
| **JTodd Service Account** | Macro 1055, 1056, 1057 | Credential sharing for publishing | CRITICAL |
| **Auto Pricing API/Database** | Auto Value Append | Current vehicle valuations | HIGH |
| **CReW Library** | CReW_EnsureFields, CReW_ParallelBlockUntilDone | Validation & synchronization | HIGH |
| **Credit Bureau Data Feed** | Multiple macros | Credit scores, demographics | HIGH |
| **Real Estate Valuation Service** | Append RE Values | Property appraisals | MEDIUM-HIGH |
| **Securities Pricing Feed** | Tableau Securities Macro (1057) | Daily market prices | MEDIUM |
| **Network File Shares** | Contingent File Input, all input macros | Source file access | HIGH |
| **Database (CReW_DB or similar)** | Enrichment macros | Reference tables, prior period | HIGH |

---

## Table of Contents

1. [Input & Data Loading Macros](#input--data-loading-macros)
2. [Data Quality & Validation Macros](#data-quality--validation-macros)
3. [Transformation & Enrichment Macros](#transformation--enrichment-macros)
4. [Consolidation & Matching Macros](#consolidation--matching-macros)
5. [Output & Publishing Macros](#output--publishing-macros)
6. [ID & Formatting Macros](#id--formatting-macros)
7. [Reference & Support Macros](#reference--support-macros)

---

## INPUT & DATA LOADING MACROS

### 1. **Contingent File Input.yxmc**

**Business Purpose:**
Conditionally loads data files based on parameters (which file to read, what data to load)

**Category:** Input/Data Loading
**Instances Used:** 8 times throughout workflow
**Complexity:** HIGH

**Input Data:**
- Condition parameters (file path, date range, loan type filters)
- File location pointers
- Control flags (load current vs. prior period, batch vs. single record)

**Output Data:**
- Loan portfolio records OR
- Charge-off records OR
- Real estate valuation records OR
- Credit bureau records
- Depends on which condition/parameter was triggered

**Internal Logic:**
```
IF condition_1 (current period = true):
  Read File_A (current month loan file)
ELSE IF condition_2 (batch processing = true):
  Read File_B (batch input file)
ELSE IF condition_3 (prior period = true):
  Read File_C (previous month's data)
ELSE IF condition_4 (single loan lookup):
  Read File_D (specific loan record)

UNION all paths
Validate record count > 0
Flag if empty
Output combined dataset
```

**Use Cases:**
- Load loan data for first run (condition 1)
- Load batch additions mid-month (condition 2)
- Load prior period comparisons (condition 3)
- Load individual loan lookups (condition 4)

**Dependencies:**
- **External Systems:** Network file shares (for multiple data sources)
- **File Requirements:** File paths must be accessible; file formats must match expected schema
- **Configuration:** Condition parameters must be correctly set during workflow execution
- **Related Macros:** None (provides data to downstream macros)
- **Critical:** Used 8 times for conditional data loading — major impact point

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** IF/THEN/ELSE conditional logic with multiple branches + UNION operation
- **Complexity:** HIGH (complex branching logic handling 4+ conditional paths)
- **See Also:** [7_MACROS_DEEP_DIVE.md - Contingent File Input Analysis](#) for detailed conditional flow

---

## DATA QUALITY & VALIDATION MACROS

### 2. **CReW_EnsureFields.yxmc** (External Library)

**Business Purpose:**
Validates that all required fields exist in the data stream and have correct data types

**Category:** Data Quality/Validation
**Instances Used:** 8 times (at major processing junctions)
**Complexity:** VERY HIGH
**Type:** External (Alteryx Community Library)

**Input Data:**
- Raw data stream (any format, any fields)
- Field specification list (required fields, expected types)
- Validation rules (nullability, ranges, etc.)

**Output Data:**
- Same data stream with validation metadata
- Error flags for missing/invalid fields
- Type-coerced values
- Quality metrics

**Internal Logic:**
```
FOR EACH field in REQUIRED_FIELDS_LIST:
  IF field NOT in data stream:
    Flag as ERROR: "Field missing"
  ELSE:
    Validate data type matches expected type
    IF type mismatch:
      Attempt type coercion
      IF coercion fails:
        Flag as ERROR: "Cannot coerce [value] to [type]"
    END

    Check nullability constraint
    IF field is NOT NULL and should be NULL:
      Flag as WARNING
    IF field is NULL and should NOT be NULL:
      Flag as ERROR
  END
END

Return: data + validation_metadata
```

**Use Cases:**
1. **After Ingestion:** Verify all source fields loaded correctly
2. **After Cleansing:** Verify fields still intact after transformations
3. **After Enrichment:** Verify new calculated fields exist and correct type
4. **Before Output:** Final verification before delivery

**Dependencies:**
- **External Systems:** CReW Library (Alteryx Community)
- **Data Requirements:** Field specification list must be accurate; data must be in Alteryx format
- **Related Macros:** None (standalone validation)
- **Impact:** Used at 8 workflow junctions — failure here blocks all downstream processing

**Nesting:**
- ✅ **Internal Nesting: LIKELY**
- **Type:** FOR loop over required fields list + conditional type checking + coercion logic
- **Complexity:** VERY HIGH (performs complex validation, type checking, error handling internally)
- **See Also:** [7_MACROS_DEEP_DIVE.md - CReW_EnsureFields Analysis](#) for detailed internal structure

---

### 3. **CReW_ParallelBlockUntilDone.yxmc** (External Library)

**Business Purpose:**
Synchronizes parallel processing streams (waits for all parallel jobs to complete before proceeding)

**Category:** Data Quality/Synchronization
**Instances Used:** As needed for parallel processing
**Complexity:** VERY HIGH
**Type:** External (Alteryx Community Library)

**Input Data:**
- Multiple parallel data streams (from different processing branches)
- Synchronization signals

**Output Data:**
- Combined/consolidated data from all parallel streams
- Success/failure status for each stream

**Internal Logic:**
```
WHEN parallel_stream_1 reaches BlockUntilDone:
  Flag as "WAITING"
WHEN parallel_stream_2 reaches BlockUntilDone:
  Flag as "WAITING"
WHEN parallel_stream_3 reaches BlockUntilDone:
  Flag as "WAITING"

WHILE ANY stream is "WAITING":
  Monitor stream status
  Sleep/yield CPU
END

WHEN ALL streams complete:
  Aggregate results
  Consolidate metadata
  Resume downstream processing
```

**Use Cases:**
- Consolidate multiple enrichment streams (credit scores, RE values, charge-offs)
- Ensure all data arrives before next stage
- Prevent race conditions in parallel processing

**Dependencies:**
- **External Systems:** CReW Library (Alteryx Community)
- **Configuration:** All parallel branches must use BlockUntilDone; timeout must be configured appropriately
- **Related Macros:** Works with any macros that output parallel streams (common in enrichment stage)
- **Critical:** Essential for parallel data consolidation — ensures all enrichment streams complete

**Nesting:**
- ✅ **Internal Nesting: DEFINITELY**
- **Type:** Multi-stream synchronization with WHILE loop logic + status monitoring + timeout handling
- **Complexity:** VERY HIGH (complex multi-threaded synchronization, exception handling)
- **See Also:** [7_MACROS_DEEP_DIVE.md - CReW_ParallelBlockUntilDone Analysis](#) for internal architecture

---

## TRANSFORMATION & ENRICHMENT MACROS

### 4. **2020_Date_Converter.yxmc**

**Business Purpose:**
Converts date fields to standard format (YYYY-MM-DD) for calculations and comparisons

**Category:** Transformation/Enrichment
**Instances Used:** 5 times
**Complexity:** MEDIUM-HIGH

**Input Data:**
- Date fields in various formats:
  - MM/DD/YYYY (US format)
  - DD/MM/YYYY (European format)
  - YYYY-MM-DD (ISO format)
  - Text strings that might be dates
  - NULL/empty values

**Output Data:**
- Standardized dates (YYYY-MM-DD format)
- Date validity flags (valid/invalid)
- Converted date fields ready for calculations

**Internal Logic:**
```
FOR EACH date_field:
  IF value is NULL:
    Flag as NULL, keep NULL
  ELSE:
    Detect current format (by pattern matching)
    IF format is MM/DD/YYYY:
      Reorder to YYYY-MM-DD
    ELSE IF format is DD/MM/YYYY:
      Reorder to YYYY-MM-DD
    ELSE IF format is YYYY-MM-DD:
      Keep as-is
    ELSE IF value looks like text date:
      Parse text (e.g., "March 15, 2020" → 2020-03-15)
    ELSE:
      Flag as ERROR: "Cannot parse date"
    END

    Validate date is realistic (not in future, etc.)
  END
END

Return: standardized_dates + validation_flags
```

**Use Cases:**
- Convert origination dates for loan age calculation
- Convert maturity dates for time-to-payoff calculation
- Convert appraisal dates for staleness checking
- Convert charge-off dates for recovery timeline

**Dependencies:**
- **Data Format:** Input dates must be recognizable as dates; handles MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, text formats
- **Related Macros:** Works with other enrichment macros requiring standardized date fields
- **Impact:** Used 5 times for date normalization across workflow stages

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** FOR loop with pattern detection + IF/THEN/ELSE conversion logic
- **Complexity:** MEDIUM-HIGH (pattern matching for date formats, format-specific conversion)
- **See Also:** [7_MACROS_DEEP_DIVE.md - 2020_Date_Converter Analysis](#)

---

### 5. **PreProcess_Iterative.yxmc**

**Business Purpose:**
Applies preprocessing logic iteratively until a convergence condition is met (e.g., all data cleansed, or max iterations reached)

**Category:** Transformation/Enrichment
**Instances Used:** As needed for iterative processing
**Complexity:** HIGH

**Input Data:**
- Raw or partially processed data
- Convergence parameters (max iterations, exit condition)

**Output Data:**
- Preprocessed data meeting convergence criteria
- Iteration count metadata
- Completion status

**Internal Logic:**
```
iteration_count = 0
exit_condition_met = FALSE

WHILE (iteration_count < MAX_ITERATIONS AND NOT exit_condition_met):
  Apply preprocessing logic:
    - Clean outliers
    - Fill missing values
    - Validate ranges
    - Apply business rules

  Check exit condition:
    IF all_records_clean AND all_validations_pass:
      exit_condition_met = TRUE
    ELSE:
      iteration_count++

  IF iteration_count >= MAX_ITERATIONS:
    Log warning: "Max iterations reached"
    exit_condition_met = TRUE (exit anyway)
END

Return: preprocessed_data + iteration_metadata
```

**Use Cases:**
- Iteratively clean and validate data until perfect
- Handle multi-pass validation logic
- Recursive data enrichment

**Dependencies:**
- **Configuration:** Exit condition must be clearly defined; max iterations must be set (typically 5-10)
- **Related Macros:** Works with data cleansing and validation macros
- **Impact:** Ensures data convergence before output stages

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** WHILE loop with iteration counter + exit condition checking
- **Complexity:** HIGH (recursive/iterative logic with loop break conditions)
- **See Also:** [7_MACROS_DEEP_DIVE.md - PreProcess_Iterative Analysis](#)

---

### 6. **Auto Value Append.yxmc**

**Business Purpose:**
Appends auto collateral valuation data and calculates auto-specific metrics (depreciation, LTV, etc.)

**Category:** Enrichment
**Instances Used:** Multiple times
**Complexity:** MEDIUM

**Input Data:**
- Auto loan records with:
  - Vehicle VIN or make/model/year
  - Original loan amount
  - Current loan balance
  - Original LTV
- Current auto market valuation data

**Output Data:**
- Same loan records with appended:
  - Current auto value (market price)
  - Depreciation amount
  - New LTV (balance / current value)
  - LTV change from origination
  - Depreciation rate (annual %)
  - Auto risk flags

**Internal Logic:**
```
FOR EACH auto_loan:
  Get VIN or make/model/year

  Lookup current market value:
    Query: SELECT price FROM auto_pricing WHERE vin = [vin]
    IF no match:
      Use Kelly Blue Book API or fallback estimate

  Calculate metrics:
    depreciation_amount = original_price - current_value
    new_ltv = (current_balance / current_value) × 100
    ltv_change = new_ltv - original_ltv
    annual_depreciation = (depreciation_amount / years_elapsed) / original_price × 100

    Set risk flags:
      IF new_ltv > 100%:
        flag_underwater = TRUE
      IF new_ltv > 150%:
        flag_severe_underwater = TRUE
      IF annual_depreciation > 30%:
        flag_rapid_depreciation = TRUE

  APPEND to output:
    current_auto_value
    depreciation_amount
    new_ltv
    ltv_change
    annual_depreciation_rate
    [all risk flags]
END

Return: loans_with_auto_enrichment
```

**Use Cases:**
- Assess collateral adequacy for auto loans
- Monitor depreciation risk
- Identify underwater auto loans
- Calculate LTV-based margins

**Dependencies:**
- **External Systems:** Auto pricing database/API (e.g., Kelly Blue Book, pricing feed)
- **Data Requirements:** VIN decoder or make/model/year mapping table required
- **Timing:** Valuation must be current (monthly minimum for auto depreciation accuracy)
- **Related Macros:** Works with loan records from Contingent File Input; output feeds to consolidation stage
- **Critical:** No auto loan collateral risk assessment without this macro

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** FOR loop over auto loans + lookup logic + calculation loop for risk metrics
- **Complexity:** MEDIUM-HIGH (lookup operations, multi-step calculations, risk flagging)

---

## CONSOLIDATION & MATCHING MACROS

### 7. **Preliminary Client File Match.yxmc**

**Business Purpose:**
Pre-processing match logic for client files - joins loan records to prior period data for comparison

**Category:** Consolidation/Matching
**Instances Used:** Multiple times
**Complexity:** HIGH

**Input Data:**
- Current period loan records (with all enrichment)
- Prior period loan records (from archive)
- Match keys: Loan_ID, Member_ID

**Output Data:**
- Matched records combining current + prior period data
- Unmatched records flagged
- Match statistics (match rate, unmatched count)

**Internal Logic:**
```
Prepare match keys:
  Standardize loan IDs (remove spaces, padding)
  Create composite key: Loan_ID + Member_ID

Execute join:
  LEFT JOIN current_period ON (current_key = prior_key)

Handle unmatched records:
    Records only in current (new loans):
      Flag as "NEW_LOAN"
      Set prior_period_fields = NULL
    Records only in prior (paid off loans):
      Flag as "PAID_OFF"
      Exclude from output or separate stream

Generate match statistics:
  Total current records: [count]
  Successfully matched: [count]
  New loans (unmatched): [count]
  Paid off (prior only): [count]
  Match rate: [%]

Return: matched_records + match_stats
```

**Use Cases:**
- Link current to prior month for trending
- Identify new loan originations
- Identify loans paid off
- Calculate month-over-month changes

**Dependencies:**
- **Data Requirements:** Prior period data must be available and correctly archived
- **Configuration:** Match keys must be consistent between periods; loan IDs must not change
- **Related Macros:** Follows data loading/enrichment stages; feeds to output preparation
- **Critical:** Required for month-over-month trending and new loan identification

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** LEFT JOIN logic + FOR loop for statistics generation + error handling
- **Complexity:** HIGH (join logic, unmatched record handling, statistics aggregation)

---

### 8. **Append Charge Offs and Matching.yxmc**

**Business Purpose:**
Joins charge-off and recovery data to loan records, creating complete loss history

**Category:** Consolidation/Matching
**Instances Used:** Multiple times
**Complexity:** VERY HIGH

**Input Data:**
- Loan records (current status)
- Charge-off records (loans written off, with dates and amounts)
- Recovery records (payments toward charge-offs)
- Match keys: Loan_ID

**Output Data:**
- Loan records with appended:
  - Charge-off flag (Y/N)
  - Charge-off date
  - Charge-off amount
  - Total recovery to date
  - Recovery status (recovering/recovered/no recovery)
  - Net loss (charge-off minus recovery)
  - Loss rate (loss / original amount)

**Internal Logic:**
```
LEFT JOIN loans TO charge_offs ON Loan_ID

FOR EACH loan:
  IF matched to charge_off:
    charge_off_flag = Y
    charge_off_date = [value]
    charge_off_amount = [value]

    LEFT JOIN to recovery_records ON Loan_ID
    aggregate recoveries:
      total_recovery = SUM(recovery_amounts) WHERE Loan_ID matches
      last_recovery_date = MAX(recovery_date)

    Calculate derived fields:
      net_loss = charge_off_amount - total_recovery
      loss_rate = (net_loss / original_loan_amount) × 100
      months_since_charge_off = months(charge_off_date, current_date)
      recovery_rate = (total_recovery / charge_off_amount) × 100

      Set recovery status:
        IF total_recovery >= charge_off_amount:
          recovery_status = "FULLY_RECOVERED"
        ELSE IF total_recovery > 0 AND months_since_charge_off < 12:
          recovery_status = "ACTIVELY_RECOVERING"
        ELSE IF total_recovery = 0:
          recovery_status = "NO_RECOVERY_ACTIVITY"
        ELSE:
          recovery_status = "PARTIALLY_RECOVERED"

  ELSE (not charged off):
    charge_off_flag = N
    All charge_off fields = NULL
    recovery_status = "ACTIVE"
END

Return: loans_with_charge_off_data
```

**Use Cases:**
- Track loan status from active → charged-off → recovered
- Calculate loss reserves
- Monitor recovery effectiveness
- Assess portfolio risk quality

**Dependencies:**
- **Data Requirements:** Charge-off and recovery records must be accurate and complete
- **Configuration:** Match keys must correctly link charge-offs to original loans
- **Validation:** Timing must be correct (recoveries cannot precede charge-offs)
- **Related Macros:** Consumes matched loan data; feeds to output preparation and Tableau publishing
- **Critical:** Essential for loss calculation, recovery tracking, and credit quality analysis

**Nesting:**
- ✅ **Internal Nesting: YES (COMPLEX)**
- **Type:** Nested LEFT JOINs (loans → charge_offs, then → recovery records) + nested FOR loops for calculations
- **Complexity:** VERY HIGH (multi-step joins, nested aggregations, conditional recovery status logic)
- **See Also:** [7_MACROS_DEEP_DIVE.md - Append Charge Offs Analysis](#) for detailed join patterns

---

### 9. **Dropped Records Prep.yxmc**

**Business Purpose:**
Prepares exception/dropped records for QA reporting (records that failed validation or were excluded)

**Category:** Consolidation/Exception Handling
**Instances Used:** Multiple times
**Complexity:** MEDIUM

**Input Data:**
- Records flagged as dropped during processing
- Drop reason codes (missing field, failed validation, etc.)
- Processing stage where dropped

**Output Data:**
- Dropped records formatted for QA report
- Drop reasons documented
- Summary statistics (total dropped by reason)

**Internal Logic:**
```
Filter to dropped_records (flag = "DROPPED")

Categorize drop reasons:
  Assign drop_category based on drop_code:
    "MISSING_CREDIT_SCORE" → "MISSING_ENRICHMENT_DATA"
    "MISSING_APPRAISAL" → "MISSING_ENRICHMENT_DATA"
    "INVALID_DATE_RANGE" → "DATA_VALIDATION_FAILURE"
    "LTV_OUT_OF_RANGE" → "DATA_VALIDATION_FAILURE"
    etc.

Append context information:
  Stage where dropped
  Drop reason explanation
  Recommended fix
  Data owner to contact

Generate summary statistics:
  Total dropped: [count]
  By category: [counts]
  By processing stage: [counts]
  By data owner: [counts]
  Trend vs. prior month

Return: dropped_records_with_metadata + summary_stats
```

**Use Cases:**
- QA reporting on data quality
- Identifying systematic data issues
- Escalation to source system owners
- Audit trail of excluded records

**Dependencies:**
- **Data Requirements:** Drop flags must be set during earlier validation stages
- **Configuration:** Drop codes must be standardized across workflow
- **External Systems:** Contact information for data owners required for escalation
- **Related Macros:** Consumes flagged records from earlier stages; output to Tableau QA dashboard
- **Impact:** Enables data quality monitoring and systematic issue escalation

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** Filter logic + categorization loop + statistics aggregation
- **Complexity:** MEDIUM (filtering, conditional categorization, summary calculations)

---

## OUTPUT & PUBLISHING MACROS

### 10. **Tableau New Macro.yxmc** (Active - Macro 1055)

**Business Purpose:**
Publishes processed client file (main portfolio) data to Tableau Server as Hyper extract

**Category:** Output/Publishing
**Status:** ✅ ACTIVE (as of March 18, 2026)
**Complexity:** HIGH
**Format:** Hyper (.hyper)

**Input Data:**
- Fully processed and enriched loan records
- All calculated fields (risk scores, LTV, delinquency flags, etc.)
- Client file format specification

**Output Data:**
- Tableau Hyper extract on Tableau Server
- Refresh notification
- Success/failure status

**Internal Logic:**
```
Input: processed_loan_records

Append control fields:
  project_name = [client name from parameter]
  refresh_date = TODAY()
  extract_version = "v5.2_Hyper"

Connect to DCM credential:
  credential_name = "Tableau Integration — Zevs Token"
  auth_type = "Personal Access Token"

Output to Tableau:
  tableau_server = "tableau.twentytwentyanalytics.com"
  format = "Hyper" (.hyper)
  action = "Overwrite"
  target_datasource = "[CLIENT_NAME]_Portfolio"

Publish:
  IF publish_success:
    Log: "Published [record_count] records"
    Send notification: "Tableau refresh complete"
  ELSE:
    Log: "FAILED: [error_message]"
    Alert ops team
END

Block until publish completes (Block Until Done tool)

Return: success_status
```

**Use Cases:**
- Update Tableau dashboards with latest portfolio data
- Enable real-time reporting for business users
- Support loan portfolio analysis and decision-making

**Dependencies:**
- **External Systems:** Tableau Server (tableau.twentytwentyanalytics.com), DCM (Data Connection Manager)
- **Authentication:** DCM credential "Tableau Integration — Zevs Token" must be configured and shared with JTodd service account
- **Network:** Tableau Server must be accessible; network connectivity required
- **Configuration:** Data must be validated before publishing (field types, record format)
- **Related Macros:** Receives output from all upstream enrichment/consolidation macros

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** Sample tool (optional gating) + Append Fields + Tableau Output SDK tool + Block Until Done
- **Complexity:** HIGH (multiple tool coordination, SDK configuration, synchronization)
- **Critical:** Delivers main portfolio data to business users; failure breaks reporting

**Known Issues:**
- Non-fatal errors if Tableau Server connectivity issues
- May timeout if large datasets (>100k records)

---

### 11. **Tableau New Macro Dropped.yxmc** (Active - Macro 1056)

**Business Purpose:**
Publishes QA report data (dropped/exception records) to Tableau Server

**Category:** Output/Publishing
**Status:** ✅ ACTIVE (as of March 18, 2026)
**Complexity:** HIGH
**Format:** Hyper (.hyper)

**Input Data:**
- Dropped/exception records with drop reasons
- QA summary statistics

**Output Data:**
- Tableau Hyper extract on Tableau Server (QA data source)
- Refresh notification

**Internal Logic:**
Same as Tableau New Macro (1055), except:
- Input source: dropped_records instead of portfolio
- Target datasource: "[CLIENT_NAME]_DroppedRecords"
- Expected record count typically much lower
- Used for exception reporting, not primary analysis

**Dependencies:**
- **External Systems:** Tableau Server, DCM
- **Authentication:** Same as Macro 1055 (Tableau Integration — Zevs Token)
- **Related Macros:** Receives output from Dropped Records Prep macro

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** Same as Tableau New Macro (1055) - Sample + Append Fields + SDK tool + Block Until Done
- **Complexity:** HIGH (same tool coordination as main macro)

**Use Cases:**
- QA reporting on data quality issues
- Tracking data completeness
- Escalation tracking

---

### 12. **Tableau New Macro Securities.yxmc** (Active - Macro 1057)

**Business Purpose:**
Publishes securities collateral portfolio data to Tableau Server

**Category:** Output/Publishing
**Status:** ✅ ACTIVE (as of March 18, 2026)
**Complexity:** HIGH
**Format:** Hyper (.hyper)
**Special Handling:** Filter gating for empty data

**Input Data:**
- Securities-backed loan records
- Securities holdings (ticker, quantity, current price)
- LTV calculations
- Margin call flags

**Output Data:**
- Tableau Hyper extract on Tableau Server (securities data source)
- Margin call alerts

**Internal Logic:**
```
Input: securities_data

CHECK IF securities_data is empty:
  IF record_count = 0:
    [Filter blocks further processing]
    Return: "No securities data for this period"
  ELSE:
    Continue to processing
END

Append control fields:
  project_name = [client name]
  refresh_date = TODAY()
  pricing_source = [source: Bloomberg, broker API, etc.]
  pricing_freshness = hours_since_last_price

Identify margin calls:
  FOR EACH security:
    ltv_percent = (loan_amount / (security_value × (1-haircut))) × 100
    IF ltv_percent >= 100%:
      margin_call_flag = Y
      Alert: "Borrower [ID] margin call threshold breached"
  END

Connect to DCM and publish:
  [Same as Tableau New Macro 1055]
  target_datasource = "[CLIENT_NAME]_Securities"

Return: success_status + margin_call_alerts
```

**Use Cases:**
- Daily monitoring of securities-backed loans
- Margin call detection and alert
- Risk assessment for securities portfolio
- Volatility monitoring

**Dependencies:**
- **External Systems:** Tableau Server, DCM, Securities pricing feed (Bloomberg, broker API, etc.)
- **Authentication:** Tableau Integration — Zevs Token (same as other publishing macros)
- **Data Requirements:** Securities pricing data must be daily; haircuts must be configured by security type
- **Configuration:** Margin call thresholds must be defined per security/collateral type
- **Related Macros:** Receives output from securities enrichment stage; critical for daily monitoring

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** Sample → Filter (gating for empty data) + Append Fields + SDK tool + Block Until Done + margin call logic
- **Complexity:** HIGH (filter gating to prevent batch invocation with 0 records, margin call calculation loop)
- **Special:** Filter gating mechanism prevents macro invocation when 0 securities records exist

**Known Issues:**
- Non-fatal '#1' error when securities data is empty (expected behavior, filter prevents processing)
- Requires timely pricing updates for accurate LTV calculation (daily refresh needed)

---

### 13. **2020_Publish2Server.yxmc** (Disabled - Legacy)

**Business Purpose:**
(LEGACY) Published main portfolio data to Tableau using TDE format

**Status:** ⚠️ DISABLED as of March 18, 2026
**Reason:** Alteryx Designer 2024.2 removed TDE support
**Replacement:** Tableau New Macro (1055)

**Historical Note:**
- Used "Publish to Tableau Server" connector v1.08.1
- Generated .tde (Tableau Data Extract) files
- Embedded credentials (no DCM)
- **NO LONGER COMPATIBLE** with Designer 2024.2+

---

### 14. **2020_PublishDropped2Server.yxmc** (Disabled - Legacy)

**Status:** ⚠️ DISABLED as of March 18, 2026
**Reason:** TDE format no longer supported
**Replacement:** Tableau New Macro Dropped (1056)

---

### 15. **2020_PublishSecurities2Server.yxmc** (Disabled - Legacy)

**Status:** ⚠️ DISABLED as of March 18, 2026
**Reason:** TDE format no longer supported
**Replacement:** Tableau New Macro Securities (1057)

---

## ID & FORMATTING MACROS

### 16. **Generate Unique ID.yxmc**

**Business Purpose:**
Creates unique loan identifiers when loans don't have system IDs

**Category:** ID Generation
**Complexity:** MEDIUM

**Input Data:**
- Loan records (may lack unique IDs)
- Borrower info (name, SSN, date of birth)
- Origination date
- Loan amount

**Output Data:**
- Unique ID for each record (composite key if needed)
- ID validity flag

**Internal Logic:**
```
FOR EACH loan_record:
  IF loan_id is provided and unique:
    Use existing loan_id
  ELSE IF ssn + origination_date is unique:
    Generate ID = HASH(ssn + origination_date)
  ELSE IF borrower_name + loan_amount + date is unique:
    Generate ID = HASH(borrower_name + loan_amount + date)
  ELSE:
    Flag as "NO_UNIQUE_IDENTIFIER_POSSIBLE"

  Verify uniqueness against all prior IDs
END

Return: records_with_unique_ids
```

**Use Cases:**
- Create keys for loans missing system identifiers
- Link records across periods
- Support deduplication

**Dependencies:**
- **Data Requirements:** SSN, origination date, or borrower name fields must be available
- **Related Macros:** Works with input data from Contingent File Input
- **Impact:** Essential for loans without system-assigned IDs

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** FOR loop with IF/THEN/ELSE logic for ID generation + HASH function calls
- **Complexity:** MEDIUM (conditional ID generation, hash computation)

---

### 17. **Last Name Comma First Name Cleaner_v2.yxmc**

**Business Purpose:**
Standardizes borrower name format to "Last, First" for consistency and reporting

**Category:** Data Formatting
**Complexity:** MEDIUM

**Input Data:**
- Borrower names in various formats:
  - "John Smith"
  - "Smith, John"
  - "SMITH JOHN"
  - "smith john"
  - "J. Smith"

**Output Data:**
- Standardized names: "Smith, John"
- Name quality flags

**Internal Logic:**
```
FOR EACH name_field:
  IF name is NULL:
    Skip
  ELSE:
    Detect current format (pattern matching)

    IF format is "First Last":
      Split on space: [First] = "John", [Last] = "Smith"
      Reformat: "Smith, John"
    ELSE IF format is "Last, First":
      Already correct, keep as-is
    ELSE IF format is all uppercase "FIRST LAST":
      Split and reformat with proper case
    ELSE IF format is "Last First" (no comma):
      Insert comma: "Smith, John"

    Apply proper case:
      First letter of each word = UPPERCASE
      Rest = lowercase

    Flag quality: CLEANED, NEEDS_REVIEW, or UNCLEANABLE
  END
END

Return: standardized_names + quality_flags
```

**Use Cases:**
- Consistent borrower name display in reports
- Support name-based searching
- Reduce duplicate names from formatting differences

**Dependencies:**
- **Data Requirements:** Borrower name field must be available
- **Related Macros:** Works on data from earlier loading stages; used before output
- **Impact:** Improves data quality for reporting and analysis

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** FOR loop + pattern detection (format matching) + IF/THEN/ELSE reordering logic
- **Complexity:** MEDIUM (format detection, conditional reordering, case standardization)

---

### 18. **Ethnic & Gender ID.yxmc**

**Business Purpose:**
Identifies and standardizes demographic fields (ethnicity, gender) from source data for compliance and analysis

**Category:** Data Formatting/Demographic
**Complexity:** MEDIUM

**Input Data:**
- Demographic data from loan application or source system
- Free-text or coded values
- Gender field (various formats)
- Ethnicity field (various formats)

**Output Data:**
- Standardized gender (M/F/Other, or numeric codes)
- Standardized ethnicity (standardized categories)
- Unknown flags if cannot identify

**Internal Logic:**
```
FOR EACH borrower:
  Process gender:
    IF value in ["M", "Male", "male", "MALE", "1"]:
      gender_code = "M"
    ELSE IF value in ["F", "Female", "female", "FEMALE", "2"]:
      gender_code = "F"
    ELSE IF value in ["O", "Other", "other", "3"]:
      gender_code = "O"
    ELSE IF value is NULL:
      gender_code = NULL
    ELSE:
      gender_code = NULL, flag_as_unknown = Y

  Process ethnicity:
    Map to standardized categories:
      "Caucasian", "White", "1" → "White"
      "African American", "Black", "2" → "Black/African American"
      "Hispanic", "Latino", "3" → "Hispanic/Latino"
      "Asian", "Asian American", "4" → "Asian"
      "Native American", "5" → "Native American"
      Other → "Other"

    IF no match found:
      Flag as_unknown = Y

  Flag quality:
    IF both gender and ethnicity populated: COMPLETE
    IF one missing: PARTIAL
    IF both missing: MISSING
END

Return: borrowers_with_standardized_demographics + quality_flags
```

**Use Cases:**
- ECOA (Equal Credit Opportunity Act) compliance
- Fair lending analysis
- Demographic reporting and segmentation
- Disparate impact analysis

**Dependencies:**
- **Data Requirements:** Source system demographic data must be reasonably complete
- **Configuration:** Mapping table for ethnicity standardization required
- **Compliance:** ECOA and fair lending requirements must be understood and configured
- **Related Macros:** Works on borrower data from input stages; feeds to output and analysis
- **Impact:** Critical for compliance reporting and fair lending analysis

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** FOR loop per borrower + IF/THEN/ELSE mapping for gender + IF/THEN/ELSE mapping for ethnicity
- **Complexity:** MEDIUM (multiple conditional mappings, category standardization)

---

### 19. **TransUnion Mask_FICO Only_v2.yxmc**

**Business Purpose:**
PII (Personally Identifiable Information) masking - removes/masks sensitive data while keeping credit scores for analysis

**Category:** Data Security/Formatting
**Complexity:** MEDIUM

**Input Data:**
- Credit bureau records with:
  - Credit scores (keep)
  - SSN (mask)
  - Account numbers (mask)
  - Names (mask)
  - Addresses (mask)
  - Public records (mask)

**Output Data:**
- Masked credit bureau records with:
  - Credit scores (visible)
  - Other fields masked/removed
  - Mask indicator flags

**Internal Logic:**
```
FOR EACH credit_bureau_record:
  Keep: [credit_score]

  Mask SSN:
    Original: "123-45-6789"
    Masked: "XXX-XX-6789"

  Remove account numbers:
    Set to NULL

  Mask name:
    Original: "John Smith"
    Masked: "XXXX XXXXX"

  Remove address:
    Set to NULL

  Remove public records details:
    Keep count, remove specifics

  Add metadata:
    original_record_id = hash(original_record)
    masked_flag = Y
    mask_date = TODAY()

  Flag: MASKED or UNABLE_TO_MASK
END

Return: masked_credit_records
```

**Use Cases:**
- Protect personally identifiable information
- Comply with data privacy regulations (GDPR, CCPA, etc.)
- Share credit data for analysis without exposing PII
- Audit trail for data access

**Dependencies:**
- **Compliance:** Masking rules must comply with GDPR, CCPA, and other privacy regulations
- **Configuration:** Hash function must be consistent for record linkage across periods
- **Data Governance:** Unmasked data should be stored separately and protected
- **Related Macros:** Works on credit bureau data; output used in analysis and reporting
- **Critical:** Essential for data privacy and regulatory compliance

**Nesting:**
- ✅ **Internal Nesting: YES**
- **Type:** FOR loop per record + masking logic for SSN, name, address + HASH function calls
- **Complexity:** MEDIUM (selective masking, hash computation, metadata tracking)

---

## REFERENCE & SUPPORT MACROS

### 20. **Preliminary Client File Match.yxmc** (Listed earlier in Consolidation)

*See consolidation section above*

---

### 21. **Additional Support Macros** (Not Yet Detailed)

The following macros are referenced in workflow inventory but additional details pending:

- **Vintage Calculation Support** — Handles vintage (cohort) grouping and analysis
- **Peer Group Assignment** — Assigns loans to peer groups for benchmarking
- **Allowance Calculation** — Computes loan loss allowances (ALLL)
- **Migration Analysis** — Tracks loan status transitions (credit migration, delinquency progression)

---

## Macro Usage Summary

### By Frequency

| Macro | Instances | Category | Status |
|-------|-----------|----------|--------|
| CReW_EnsureFields | 8 | Validation | ✅ Active |
| Contingent File Input | 8 | Input | ✅ Active |
| 2020_Date_Converter | 5 | Transformation | ✅ Active |
| [Other macros] | 1-3 | Various | ✅ Active |

### By Category

| Category | Count | Purpose |
|----------|-------|---------|
| Input/Loading | 1 | Read source data conditionally |
| Validation | 2 | Ensure data quality and field existence |
| Transformation | 3+ | Clean, convert, enrich data |
| Consolidation | 3+ | Join, match, combine data sources |
| Output/Publishing | 3 active, 3 disabled | Deliver to Tableau |
| ID/Formatting | 4 | Create unique IDs, standardize formats |
| Reference/Support | 3+ | Peer groups, vintage, allowances |

### By Status

| Status | Count | Notes |
|--------|-------|-------|
| ✅ ACTIVE | 20 | Current, working macros |
| ⚠️ DISABLED | 3 | Legacy TDE publish (replaced March 2026) |
| 🔍 PENDING DETAIL | 2-3 | Documented in inventory, awaiting deep dive |

---

## Macro Dependencies & Cross-References

### System-Level Requirements
1. **Alteryx Designer 2024.2+** (or compatible version)
2. **CReW Library** — For CReW_EnsureFields and CReW_ParallelBlockUntilDone (external Alteryx Community macros)
3. **File Access** — Network shares for input/output files
4. **Tableau Server** (tableau.twentytwentyanalytics.com) — For publishing macros 1055, 1056, 1057
5. **Database Access** — For enrichment lookups (credit scores, valuations, etc.)
6. **DCM (Data Connection Manager)** — For Tableau authentication via "Tableau Integration — Zevs Token"
7. **JTodd Service Account** — For credential sharing on Tableau publishing macros

### Data Dependencies by Stage

**Input Stage:**
- Source system data must arrive on time
- File paths must be accessible (Contingent File Input macro)
- File formats must match expected schema

**Enrichment Stage:**
- Credit bureau data feeds (credit scores, demographics) must be current
- Auto pricing API/database must be available for valuation lookups
- Real estate appraisal data must be current (monthly or more frequent)
- Securities pricing feed must be daily (for margin call calculations)

**Consolidation Stage:**
- Prior period archives must be accessible (for month-over-month matching)
- Charge-off and recovery records must be accurate and complete
- Match keys must be consistent across periods

**Output Stage:**
- All validation and enrichment must be complete
- Tableau Server connectivity required
- DCM credentials must be configured and shared with JTodd

### Macro Cross-Dependencies

| Primary Macro | Upstream Dependencies | Downstream Consumers |
|---------------|----------------------|-------------------|
| Contingent File Input | Network file shares | All enrichment macros |
| CReW_EnsureFields | CReW library, input data | All downstream processing |
| CReW_ParallelBlockUntilDone | Auto Value Append, Append RE Values, other enrichment | Consolidation macros |
| Preliminary Client File Match | Contingent File Input output, prior period archive | Append Charge Offs macro |
| Append Charge Offs and Matching | Preliminary Client File Match output, charge-off/recovery data | Output prep macros |
| Auto Value Append | Contingent File Input output, auto pricing API | CReW_ParallelBlockUntilDone |
| Append RE Values | Contingent File Input output, appraisal data feed | CReW_ParallelBlockUntilDone |
| Dropped Records Prep | All validation stages | Tableau New Macro Dropped (1056) |
| Tableau New Macro (1055) | Append Charge Offs output, all enriched data | Tableau Server dashboards |
| Tableau New Macro Dropped (1056) | Dropped Records Prep output | Tableau Server QA dashboard |
| Tableau New Macro Securities (1057) | Securities pricing data, securities loans | Tableau Server securities dashboard |

### No Direct Macro-Calling-Macro Pattern
⚠️ **Key Finding:** The workflow does not use macros that call other macros. Instead, each macro is:
- Invoked directly by the main workflow
- Receives output from upstream tools/macros
- Passes output to downstream tools/macros
- All complex logic is **internal** to individual macros (loops, conditionals, JOINs, etc.)

---

## Related Documentation

- **7_MACROS_DEEP_DIVE.md** — Detailed macro nesting analysis
- **3_MACROS_AND_DEPENDENCIES.md** — Complete macro inventory
- **2_WORKFLOW_ARCHITECTURE.md** — How macros fit in overall workflow
- **6_FIELD_MAPPING_AND_DATA_LINEAGE.md** — Data transformations in each macro

---

**Version:** 1.0
**Last Updated:** 2026-03-18
**Status:** DRAFT - Additional macro details to be added as research continues
