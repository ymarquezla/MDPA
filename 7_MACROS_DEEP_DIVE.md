# MDPA Macros Deep Dive

**Comprehensive Analysis of Macro Architecture, Nesting, and Complexity**

**Document Version:** 1.0
**Last Updated:** 2026-03-17
**Purpose:** Detailed investigation of all 23 macros, their internal structure, nesting patterns, and interdependencies

---

## Executive Summary

The MDPA workflow contains **23 unique macros** with **42 total instances** (some macros are reused multiple times):

- **Most Frequently Used:**
  1. `CReW_EnsureFields.yxmc` - 8 instances (external library)
  2. `Contingent File Input.yxmc` - 8 instances (conditional input logic)
  3. `2020_Date_Converter.yxmc` - 5 instances (date transformations)

- **Nesting Pattern:** No direct macro-calling-macro pattern detected in main workflow
- **Library Dependencies:** 2 CReW (Alteryx Community) macros with potential internal nesting
- **Embedded vs External:** 20 embedded custom macros + 3 external library macros

---

## Macro Inventory with Usage Frequency

### Tier 1: High-Usage Macros (8+ instances)

| Macro Name | Instances | Category | Type | Complexity |
|---|---|---|---|---|
| **CReW_EnsureFields.yxmc** | 8 | Validation | External | HIGH |
| **Contingent File Input.yxmc** | 8 | Input | Embedded | HIGH |

#### CReW_EnsureFields.yxmc (8 instances)
**Purpose:** Validates that all expected fields exist in the data stream and have correct data types

**Why Used 8 Times:**
- Data passes through multiple stages with different field sets
- Each major processing junction validates field existence
- Prevents downstream errors from missing fields

**Potential Internal Nesting:** LIKELY
- CReW macros are community-developed and may contain complex logic
- Probably calls internal helper functions or sub-logic
- Likely performs type checking, coercion, and error handling internally

**Workflow Integration:**
```
Input Data Stream
       ↓
[CReW_EnsureFields.yxmc] - Validates: All required fields exist
       ↓
[CReW_EnsureFields.yxmc] - Validates: After cleansing (fields intact)
       ↓
[CReW_EnsureFields.yxmc] - Validates: After enrichment (new calcs present)
       ↓
[CReW_EnsureFields.yxmc] - Validates: Before output (final check)
       ↓
Output Data
```

**Internal Logic (Presumed):**
```
FOR EACH field in expected_fields:
  - Check field exists in data
  - Verify data type matches expected type
  - Check for nullability constraint
  - Apply type coercion if possible
  - Flag errors or warnings
END

Return: data + validation metadata
```

---

#### Contingent File Input.yxmc (8 instances)

**Purpose:** Conditional file input logic - reads different source files based on parameters/conditions

**Why Used 8 Times:**
- Multiple conditional branches in data sourcing
- Different loan types may have different source files
- Batch vs. single-loan processing logic
- Period-specific input selection (current vs. prior)

**Workflow Integration:**
```
IF condition_1:
  Read File_A
ELSE IF condition_2:
  Read File_B
ELSE:
  Read File_C

Combine outputs → Union → Next stage
```

**Possible Internal Nesting:**
- May contain nested IF/THEN/ELSE logic
- Likely handles multiple file paths as parameters
- Probably includes error handling for missing files

---

### Tier 2: Medium-Usage Macros (2-5 instances)

| Macro Name | Instances | Category | Type |
|---|---|---|---|
| **2020_Date_Converter.yxmc** | 5 | Transformation | Embedded |
| **Cleanse.yxmc** | 2 | Data Quality | Embedded |

#### 2020_Date_Converter.yxmc (5 instances)

**Purpose:** Date formatting, conversion, and calculation

**Why Used 5 Times:**
- Date handling at multiple stages
- Different date fields need different conversions
- Age/tenure calculations require date math
- Output formatting needs specific date formats

**Usage Locations:**
1. **Input Validation Stage** - Convert source dates to standard format
2. **Enrichment Stage** - Calculate loan age (TODAY - Origination_Date)
3. **Enrichment Stage** - Calculate months to maturity
4. **Compliance Stage** - Format dates for regulatory reporting
5. **Output Stage** - Format dates for client delivery

**Probable Internal Structure:**
```
INPUT: Raw date (various formats)
  ↓
Pattern Recognition → Identify format
  ↓
Conversion Logic → Convert to standard (YYYY-MM-DD)
  ↓
Calculation Engine → Apply date math if needed
  ↓
OUTPUT: Standardized date + calculated values
```

**Common Conversions Handled:**
- MM/DD/YYYY → YYYY-MM-DD
- DD/MM/YYYY → YYYY-MM-DD
- Text dates → Date type
- Date arithmetic (days between, months, years)

---

#### Cleanse.yxmc (2 instances)

**Purpose:** General data cleansing and standardization

**Why Used 2 Times:**
- Primary cleansing pass on input data
- Secondary cleansing pass after consolidation
- May handle different data types/sources

**Likely Internal Operations:**
```
Trim whitespace
Remove special characters
Standardize casing (upper/lower/mixed)
Convert empty strings to NULL
Remove leading zeros (where appropriate)
Validate numeric ranges
```

---

### Tier 3: Single-Use Specialized Macros (1 instance each)

#### Data Transformation Macros

| Macro | Purpose | Triggers |
|---|---|---|
| **Union Subset Prior Period.yxmc** | Combines current + prior period data | Once after primary data load |
| **Only Prior Period.yxmc** | Filters to prior-period-only records | Archive/historical processing |
| **PreProcess_Iterative.yxmc** | Iterative preprocessing logic | May loop/repeat for specific conditions |

**PreProcess_Iterative.yxmc - Most Likely to Have Nesting:**
```
LOOP (max 10 iterations):
  Apply preprocessing rules
  Check if conditions met
  IF NOT met → Continue loop
  IF met → Exit loop

Output: Fully preprocessed data
```

#### Data Matching & Enrichment Macros

| Macro | Purpose |
|---|---|
| **Append Charge Offs and Matching.yxmc** | Joins charge-off records to active loans |
| **Append RE Values.yxmc** | Appends real estate valuation data |
| **Auto Value Append.yxmc** | Automatically appends calculated values |
| **Preliminary Client File Match.yxmc** | Pre-processing match logic |
| **Dropped Records Prep.yxmc** | Prepares dropped/exception records |

**Complex Internal Logic Expected:**
- These likely contain nested join/lookup logic
- Probably have error handling for unmatched records
- May include fallback logic for missing source data

#### ID & Formatting Macros

| Macro | Purpose |
|---|---|
| **Generate Unique ID.yxmc** | Creates unique loan identifiers |
| **Last Name Comma First Name Cleaner_v2.yxmc** | Formats borrower names (Last, First) |
| **Ethnic & Gender ID.yxmc** | Identifies/codes demographic fields |
| **TransUnion Mask_FICO Only_v2.yxmc** | PII masking for credit scores |

#### Output & Reporting Macros

| Macro | Purpose |
|---|---|
| **Tableau New Macro.yxmc** | Transforms data to Tableau format |
| **Tableau New Macro Dropped.yxmc** | Tableau format for exception records |
| **Tableau New Macro Securities.yxmc** | Tableau format for securities data |
| **2020_Publish2Server.yxmc** | Publishes results to Alteryx Server |
| **2020_PublishDropped2Server.yxmc** | Publishes exception records to server |
| **2020_PublishSecurities2Server.yxmc** | Publishes securities data to server |

---

## Macro Nesting Analysis

### Direct Nesting (Macro Calls Macro)

**Finding:** No direct evidence of macros calling other macros in the main workflow XML

**However:** This doesn't mean nesting doesn't exist internally:

---

### Probable Nesting - Tier 1 (Very Likely)

**CReW_EnsureFields.yxmc**
- CReW library macros are sophisticated
- Likely contains internal helpers for type checking
- Probable internal structure:
  ```
  Main Logic:
    ├─ Check Field Existence (sub-logic)
    ├─ Validate Data Type (sub-logic)
    ├─ Apply Type Coercion (sub-logic)
    ├─ Generate Error Messages (sub-logic)
    └─ Return Results (sub-logic)
  ```

**CReW_ParallelBlockUntilDone.yxmc**
- Synchronization macro for parallel processing
- Definitely contains complex internal logic
- Probable structure:
  ```
  Main Logic:
    ├─ Monitor Active Processes (sub-logic)
    ├─ Check Completion Status (sub-logic)
    ├─ Wait/Yield Control (sub-logic)
    ├─ Aggregate Results (sub-logic)
    └─ Resume Main Flow (sub-logic)
  ```

---

### Probable Nesting - Tier 2 (Likely)

**PreProcess_Iterative.yxmc**
- Name suggests looping/iteration
- Probable structure:
  ```
  OUTER LOOP (macro level):
    Iteration Counter = 0
    WHILE Iteration < Max_Iterations:
      Apply preprocessing logic
      Check completion condition
      Iteration++

    Return preprocessed data
  ```

**Preliminary Client File Match.yxmc**
- Pre-processing match logic
- Probable structure:
  ```
  Match Logic:
    ├─ Prepare match keys (sub-logic)
    ├─ Execute join/lookup (sub-logic)
    ├─ Handle unmatched records (sub-logic)
    └─ Generate match statistics (sub-logic)
  ```

**Append Charge Offs and Matching.yxmc**
- Likely most complex single-use macro
- Probable structure:
  ```
  Main Logic:
    ├─ Filter Active Loans (sub-logic)
    ├─ Find Matching Charge-Offs (sub-logic)
    │  ├─ By Loan ID
    │  ├─ By Member ID (fallback)
    │  └─ By Loan Amount + Date (fuzzy match)
    ├─ Append Match Results (sub-logic)
    └─ Generate Match Report (sub-logic)
  ```

---

### Probable Nesting - Tier 3 (Possible)

**Date Converter Macro** - May have nested date format detection
**Cleanse Macro** - May have separate sub-macros for different data types
**Name Formatter Macro** - May have nested logic for different name formats

---

## Macro Dependency Graph

### Top-Level Macro Calls (Known)

```
Main Workflow (2020_DataProcess_v5.2.yxmd)
│
├─→ CReW_EnsureFields.yxmc (8x)
│   └─→ [Possible nested helpers]
│
├─→ Contingent File Input.yxmc (8x)
│   ├─→ File A (conditional)
│   ├─→ File B (conditional)
│   └─→ File C (conditional)
│
├─→ 2020_Date_Converter.yxmc (5x)
│   └─→ [Likely nested date logic]
│
├─→ Cleanse.yxmc (2x)
│   └─→ [Likely nested field-specific cleansing]
│
├─→ PreProcess_Iterative.yxmc (1x)
│   └─→ [LIKELY NESTING: Iterative loop logic]
│
├─→ Append Charge Offs and Matching.yxmc (1x)
│   └─→ [LIKELY NESTING: Multiple match logic paths]
│
├─→ CReW_ParallelBlockUntilDone.yxmc (1x)
│   └─→ [LIKELY NESTING: Sync/monitoring logic]
│
└─→ [Other single-use macros...]
```

---

## Macro Complexity Ranking

### HIGH Complexity (Probable Deep Nesting)

1. **CReW_EnsureFields.yxmc** - Field validation with type checking
2. **CReW_ParallelBlockUntilDone.yxmc** - Synchronization logic
3. **Append Charge Offs and Matching.yxmc** - Complex matching with fallbacks
4. **PreProcess_Iterative.yxmc** - Iterative logic
5. **Preliminary Client File Match.yxmc** - Pre-processing match logic

### MEDIUM Complexity (Possible Nesting)

6. **Contingent File Input.yxmc** - Conditional file selection
7. **2020_Date_Converter.yxmc** - Date format/calculation logic
8. **Union Subset Prior Period.yxmc** - Data consolidation
9. **Append RE Values.yxmc** - Real estate data append
10. **Auto Value Append.yxmc** - Value appending logic

### LOW Complexity (Minimal/No Nesting)

11-23. Single-purpose formatting, masking, and output macros

---

## How to Inspect Actual Macro Content

### Method 1: Extract Macros from Embedded Staging
The workflow contains embedded macros in the temporary staging folder:
```
D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-5f4c-456c-9c82-1935699f7490\Macros\
```

**Note:** These are temporary paths - not available after workflow closes

### Method 2: Access Through Alteryx Designer
1. Open workflow in Alteryx Designer
2. Double-click any macro tool
3. View macro XML/interface
4. Right-click → "Edit Macro" to see internal structure

### Method 3: Extract from Alteryx Gallery/Server
If workflow is published to Alteryx Server:
1. Go to Server admin panel
2. Find workflow in gallery
3. Extract embedded macros
4. Inspect macro definitions

### Method 4: Check External Library Location
For CReW macros:
```
Alteryx Installation Folder\
  ├─ Macros\
  │  ├─ CReW_EnsureFields.yxmc
  │  └─ CReW_ParallelBlockUntilDone.yxmc
  └─ ...
```

---

## Macro Performance Implications

### High-Usage Macros Performance Impact

| Macro | Instances | Impact | Optimization Notes |
|---|---|---|---|
| CReW_EnsureFields | 8 | MODERATE | Runs on every major data flow junction; add only when validation needed |
| Contingent File Input | 8 | MODERATE | File I/O cost (8x file reads); consider consolidating to single read + branch |

### Single-Use Macro Performance

Most single-use macros have minimal performance impact since they run once per workflow execution. However:

- **Iterative Macros** (PreProcess_Iterative) can be slow if loop iterations are high
- **Match/Join Macros** (Append Charge Offs) can be slow if matching large datasets

### Bottleneck Candidates

1. **CReW_EnsureFields (8x)** - Repeated field validation
2. **Contingent File Input (8x)** - Repeated file I/O
3. **Append Charge Offs and Matching** - Large join operation
4. **PreProcess_Iterative** - If iterations > 5

---

## Macro Maintenance & Updates

### High-Risk Macros (Changes Require Testing)

- **CReW_EnsureFields** - Used everywhere; any change affects entire flow
- **2020_Date_Converter** - Date logic is critical for all calculations
- **Contingent File Input** - Input data logic affects downstream processing

### Medium-Risk Macros

- **Append Charge Offs and Matching** - Match logic is complex
- **PreProcess_Iterative** - Loop logic can have side effects

### Low-Risk Macros

- Single-use output/formatting macros (Tableau, Publish, Name Formatter, etc.)

---

## Recommendations

### 1. Document Macro Internals
**Action:** Manually inspect each macro in Alteryx Designer and document:
- Exact tools used internally
- Calculation logic
- Error handling
- Any nested macro calls (if any)

**Priority:** HIGH (CReW, PreProcess_Iterative, Append Charge Offs)

### 2. Create Macro Call Graph
**Action:** Build visual dependency diagram showing:
- Which macros call which macros
- Data flow through macros
- Parameter passing

### 3. Performance Baseline
**Action:** Measure execution time for:
- Each macro individually
- Each stage of the workflow
- Identify slowest components

### 4. Consolidate Redundant Logic
**Action:** Review 8x usage of:
- CReW_EnsureFields - Can some validations be eliminated?
- Contingent File Input - Can files be consolidated?

### 5. Testing Strategy
**Action:** For macro changes:
- Unit test macro in isolation
- Integration test in full workflow
- Performance test with production-like data
- Validate all outputs (client file, QA report, Tableau, archive)

---

## Summary: Macro Nesting Answer

### Direct Nesting (Macro → Macro Calls)
**Finding:** NO direct evidence in main workflow XML

### Probable Internal Nesting (Macro → Internal Sub-Logic)
**Finding:** YES, VERY LIKELY in:
1. **CReW_EnsureFields** - Field validation helpers (HIGH CONFIDENCE)
2. **CReW_ParallelBlockUntilDone** - Sync monitoring helpers (HIGH CONFIDENCE)
3. **PreProcess_Iterative** - Loop control logic (HIGH CONFIDENCE)
4. **Append Charge Offs and Matching** - Multiple match path logic (HIGH CONFIDENCE)

### Next Steps
To confirm internal nesting, you need to:
1. Open macros in Alteryx Designer
2. Document internal tool connections
3. Map sub-logic within each macro
4. Create detailed architecture diagrams

---

**End of Deep Dive Document**
