# MDPA Macros & Dependencies Analysis

**Document Version:** 1.0
**Last Updated:** 2026-03-11
**Based On:** Detailed XML analysis of 2020_DataProcess_v5.2.yxmd

---

## Executive Summary

**The workflow DOES call macros** - approximately **25-30 macro instances** across **15+ unique macros**:
- **NO external workflows** called (.yxmd files)
- **BUT 25-30 MACROS** are invoked throughout processing
- Macros handle specialized tasks (data transformation, formatting, validation)
- Some macros are embedded, others are external dependencies

---

## Macro Inventory

### Macro Count & Usage

**Total Macro Tool Instances:** ~25-30 (scattered throughout 300+ tools)
**Unique Macro Files:** 15+
**Macro Tools as % of Workflow:** ~8-10% of all tools

### Macro Categories

#### Category 1: Data Transformation Macros (Most Critical)

| Macro Name | Purpose | Instances | Status |
|---|---|---|---|
| **2020_Date_Converter.yxmc** | Date formatting/conversion | 3+ | Embedded |
| **Union Subset Prior Period.yxmc** | Combines current + prior period data | 1 | Embedded |
| **PreProcess_Iterative.yxmc** | Data preprocessing iterations | 1 | Embedded |
| **Only Prior Period.yxmc** | Filters to prior period only | 1 | Embedded |
| **Generate Unique ID.yxmc** | Creates unique loan identifiers | 1 | Embedded |
| **2020_Publish2Server.yxmc** | Publishes results to server | 1 | Embedded |
| **2020_PublishDropped2Server.yxmc** | Publishes dropped records to server | 1 | Embedded |

#### Category 2: Data Cleansing & Formatting Macros

| Macro Name | Purpose | Instances | Status |
|---|---|---|---|
| **Cleanse.yxmc** | General data cleansing | 2+ | Embedded |
| **Last Name Comma First Name Cleaner_v2.yxmc** | Formats borrower names | 1 | Embedded |
| **Ethnic & Gender ID.yxmc** | Identifies/decodes ethnicity/gender | 1 | Embedded |

#### Category 3: Loan-Specific Processing Macros

| Macro Name | Purpose | Instances | Status |
|---|---|---|---|
| **Append Charge Offs and Matching.yxmc** | Matches and appends charge-off records | 1 | Embedded |
| **Append RE Values.yxmc** | Appends real estate valuation data | 1 | Embedded |
| **Auto Value Append.yxmc** | Auto-appends calculated values | 1 | Embedded |
| **Preliminary Client File Match.yxmc** | Pre-processing match logic | 1 | Embedded |
| **Dropped Records Prep.yxmc** | Prepares dropped records for output | 1 | Embedded |
| **TransUnion Mask_FICO Only_v2.yxmc** | Masks PII in credit score data | 1 | Embedded |

#### Category 4: Output/Reporting Macros

| Macro Name | Purpose | Instances | Status |
|---|---|---|---|
| **Tableau New Macro.yxmc** | Prepares data for Tableau dashboard | 1 | Embedded |
| **Tableau New Macro Dropped.yxmc** | Tableau format for dropped records | 1 | Embedded |
| **Tableau New Macro Securities.yxmc** | Tableau format for securities data | 1 | Embedded |

#### Category 5: Input/Reference Macros

| Macro Name | Purpose | Instances | Status |
|---|---|---|---|
| **Contingent File Input.yxmc** | Conditional file input logic | 2+ | Embedded |
| **Contingent_Input/** | Container folder for conditional inputs | - | Embedded |

#### Category 6: CReW (Community Powered Macros) Library

| Macro Name | Purpose | Instances | Status |
|---|---|---|---|
| **CReW_EnsureFields.yxmc** | Validates field existence & types | 6+ | External Library |
| **CReW_ParallelBlockUntilDone.yxmc** | Parallel processing synchronization | 1 | External Library |

---

## Macro Dependencies

### Embedded vs. External

**Embedded Macros** (packaged with workflow)
- Located in temporary staging folder: `D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\a6b96bdf-5f4c-456c-9c82-1935699f7490\Macros\`
- Extracted when workflow is published to Gallery
- Examples: 2020_Date_Converter, Append Charge Offs, etc.
- Risk: If not properly packaged, breaks on deployment

**External Macros** (referenced from library)
- CReW_EnsureFields.yxmc (6+ instances) — From Alteryx community library
- CReW_ParallelBlockUntilDone.yxmc — From Alteryx community library
- Cleanse.yxmc — Library macro
- Ethnic & Gender ID.yxmc — Library macro
- Risk: Depends on macro library availability in execution environment

---

## Workflow Processing with Macros

### Data Flow with Macro Integration

```
INPUT
  ↓
JSON Parameters
  ↓
Read Loan Files
  ↓
[Macro: Union Subset Prior Period] ←── Combine current + prior period
  ↓
[Macro: PreProcess_Iterative] ←── Preprocessing iterations
  ↓
[Macro: CReW_EnsureFields] ←── Validate field structure (6+ instances)
  ↓
Transform Fields
  ├─ [Macro: 2020_Date_Converter] (3+ instances) ←── Format dates
  ├─ [Macro: Generate Unique ID] ←── Create identifiers
  ├─ [Macro: Last Name Comma First Name Cleaner_v2] ←── Name formatting
  └─ [Macro: Ethnic & Gender ID] ←── Decode demographics
  ↓
Append Reference Data
  ├─ [Macro: Append Charge Offs and Matching] ←── Add charge-offs
  ├─ [Macro: Append RE Values] ←── Add RE valuations
  ├─ [Macro: Auto Value Append] ←── Auto-calculated fields
  ├─ [Macro: TransUnion Mask_FICO Only_v2] ←── Masked credit scores
  └─ [Macro: Cleanse] (2+ instances) ←── Data cleansing
  ↓
Preliminary Matching
  └─ [Macro: Preliminary Client File Match] ←── Pre-match logic
  ↓
Formula & Calculation Tools (60 instances)
  ↓
Filter & Validation
  ├─ [Macro: Dropped Records Prep] ←── Prep failed records
  └─ [Macro: Only Prior Period] ←── Filter prior-only
  ↓
Output Preparation
  ├─ [Macro: Tableau New Macro] ←── Dashboard data
  ├─ [Macro: Tableau New Macro Dropped] ←── Dropped records format
  ├─ [Macro: Tableau New Macro Securities] ←── Securities format
  ├─ [Macro: 2020_Publish2Server] ←── Publish main output
  └─ [Macro: 2020_PublishDropped2Server] ←── Publish QA output
  ↓
OUTPUT (Client Files, Tableau Extracts, QA Records)
```

---

## Macro Processing Stages

### Stage 1: Input & Data Union (1-2 macros)
- Union current and prior period data
- Conditional file inputs for flexibility
- **Tools:** Union Subset Prior Period, Contingent File Input (2x)

### Stage 2: Preprocessing (2-3 macros)
- Iterative preprocessing
- Field validation/structure checking
- **Tools:** PreProcess_Iterative, CReW_EnsureFields (multiple)

### Stage 3: Field Transformation (6-8 macros)
- Date conversion/formatting
- Name parsing and cleaning
- Demographic code decoding
- Unique ID generation
- **Tools:** 2020_Date_Converter (3x), Last Name Comma First Name Cleaner, Ethnic & Gender ID, Generate Unique ID

### Stage 4: Data Enrichment (4-5 macros)
- Append loan characteristics (charge-offs, RE values)
- Auto-calculate derived fields
- Apply PII masking to credit scores
- Data cleansing
- **Tools:** Append Charge Offs, Append RE Values, Auto Value Append, TransUnion Mask, Cleanse (2x)

### Stage 5: Matching & Validation (2-3 macros)
- Preliminary matching logic
- Dropped record preparation
- Prior period filtering
- **Tools:** Preliminary Client File Match, Dropped Records Prep, Only Prior Period

### Stage 6: Output Formatting (5-6 macros)
- Tableau-specific formatting (3 variants)
- Server publishing (2 variants)
- **Tools:** Tableau New Macro, Tableau New Macro Dropped, Tableau New Macro Securities, 2020_Publish2Server, 2020_PublishDropped2Server

### Stage 7: Flow Control (1 macro)
- Parallel processing synchronization
- **Tools:** CReW_ParallelBlockUntilDone

---

## Macro Locations & Deployment

### Problem: Mixed Macro Storage

**Embedded Location (Temporary):**
```
D:\Users\vnekkanti\AppData\Local\Temp\1\Staging\[ID]\Macros\
```
- Original developer: vnekkanti
- Path is temporary/build-time path
- Will NOT work if run from different machine/user
- **Risk:** Workflow fails if macros aren't packaged properly

**External Location (Library):**
```
CReW_EnsureFields.yxmc
CReW_ParallelBlockUntilDone.yxmc
Cleanse.yxmc
Ethnic & Gender ID.yxmc
```
- From Alteryx community/standard libraries
- Must be available in execution environment
- **Risk:** May not be installed on all Alteryx instances

### Resolution for Automation
When deploying to Alteryx Gallery/Server:
1. **Ensure all macros are properly embedded** in the .yxmd file
2. **Remove temporary paths** from macro references
3. **Verify CReW library** is installed on execution server
4. **Test on target environment** before production scheduling

---

## Critical Macros for Automation

### High Priority (Must Work)
1. **CReW_EnsureFields** (6 instances) — Used throughout workflow
   - Validates data structure
   - Must be available on execution server

2. **2020_Date_Converter** (3 instances) — Core transformation
   - Critical for data formatting
   - Ensure embedded and accessible

3. **2020_Publish2Server** & **2020_PublishDropped2Server** — Output stage
   - Required for final delivery
   - Ensure server path/credentials correct

### Medium Priority (Important)
4. **Union Subset Prior Period** — Prior period reconciliation
5. **Append Charge Offs and Matching** — Key data enrichment
6. **Tableau New Macro** (3 variants) — Dashboard data prep

### Lower Priority (Functional)
7. Data cleansing and formatting macros — Could be replaced with tools if needed
8. CReW_ParallelBlockUntilDone — Only if using parallel processing

---

## Automation Considerations

### Before Scheduling Monthly Runs:

✅ **Pre-Automation Checklist**
- [ ] Verify all macros are embedded in .yxmd (not external paths)
- [ ] Test workflow on target Alteryx Server/Gallery
- [ ] Confirm CReW library installed on server
- [ ] Validate macro paths don't reference temporary directories
- [ ] Check if server has same Alteryx version as development environment
- [ ] Test with real data to ensure all macros execute properly
- [ ] Document any missing macro dependencies discovered

⚠️ **Potential Issues**
- Temporary path macros may fail on different machines
- CReW library might not be available on Gallery
- Macro execution may be slower on server than desktop
- PII masking macro (TransUnion) needs to be validated for compliance

---

## Macro Dependency Map (Visual)

```
START
  │
  ├─→ [Union Subset Prior Period]
  │      │
  │      └─→ [PreProcess_Iterative]
  │             │
  │             └─→ [CReW_EnsureFields] ┐
  │                                      │ (6 instances total)
  ├─────────────────────────────────────┘
  │
  ├─→ [2020_Date_Converter] (3x)
  │
  ├─→ [Cleanse] (2x)
  │
  ├─→ [Append Charge Offs and Matching]
  │      │
  │      ├─→ [Append RE Values]
  │      │
  │      ├─→ [Auto Value Append]
  │      │
  │      └─→ [TransUnion Mask_FICO Only_v2]
  │
  ├─→ [Generate Unique ID]
  │
  ├─→ [Last Name Comma First Name Cleaner_v2]
  │
  ├─→ [Ethnic & Gender ID]
  │
  ├─→ [Preliminary Client File Match]
  │
  ├─→ [Dropped Records Prep]
  │
  ├─→ [Only Prior Period]
  │
  ├─→ [CReW_ParallelBlockUntilDone]
  │
  └─→ OUTPUT STAGE
         │
         ├─→ [Tableau New Macro]
         ├─→ [Tableau New Macro Dropped]
         ├─→ [Tableau New Macro Securities]
         ├─→ [2020_Publish2Server]
         └─→ [2020_PublishDropped2Server]
              │
              └─→ END
```

---

## Summary Table

| Aspect | Detail |
|--------|--------|
| **Workflow Calls Other Workflows?** | ❌ NO |
| **Workflow Calls Macros?** | ✅ YES (25-30 instances) |
| **Total Unique Macros** | 15+ |
| **Embedded Macros** | ~13 (most of them) |
| **External Library Macros** | 4 (CReW library) |
| **Macro Tools as % of Workflow** | ~8-10% |
| **Critical Macros** | CReW_EnsureFields, 2020_Date_Converter, 2020_Publish2Server |
| **Deployment Risk** | MEDIUM - Temporary paths may not work on different machines |

---

## Recommendations

### For Automation Implementation:

1. **Pre-Deployment Testing**
   - Deploy to test Alteryx Gallery instance first
   - Run complete monthly cycle with test data
   - Verify all macro execution completes successfully
   - Check output files for correctness

2. **Macro Path Resolution**
   - Contact original developer (vnekkanti) to confirm macro handling
   - Ensure .yxmd has embedded macros, not external references
   - Remove or resolve temporary staging paths

3. **Library Dependencies**
   - Confirm CReW library (4 macros) available on production Alteryx Server
   - If not available, may need to: install library OR replace with standard tools

4. **Macro Updates**
   - Consider refactoring large macros (Append Charge Offs, PreProcess_Iterative) for readability
   - Document macro purpose and inputs/outputs
   - Version control macro changes

5. **Monitoring**
   - Log macro execution times to detect performance issues
   - Alert if any macro fails or is not found
   - Track macro-specific errors separately from main workflow errors

