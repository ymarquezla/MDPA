# MDPA Data Process Documentation

**Version:** 5.2 (2020-05-20 onwards)
**Format:** Alteryx Workflow (.yxmd)
**Last Updated:** 2026-03-11

---

## Overview

The MDPA (Monthly Data Process Assessment) is a comprehensive data transformation and consolidation workflow built in Alteryx Designer. It processes loan portfolio data from multiple sources, performs complex data reconciliation, and generates analytical outputs for regulatory compliance and peer group analysis.

---

## Workflow Architecture

### High-Level Flow
```
Input Data Sources → Data Transformation → Field Mapping →
Data Reconciliation → Calculations → Output Generation
```

### Tool Summary (300+ tools)

| Tool Type | Count | Purpose |
|-----------|-------|---------|
| **Select (Field Selection)** | 67 | Selecting/projecting specific data fields |
| **Formula (Calculations)** | 60 | Creating calculated fields and transformations |
| **TextBox (Documentation)** | 35 | Inline workflow documentation and notes |
| **Filter** | 27 | Filtering records based on conditions |
| **Summarize (Aggregation)** | 24 | Rolling up data by groups (SUM, AVG, COUNT, etc.) |
| **Union (Combining Data)** | 24 | Combining multiple data sources |
| **Join** | 21 | Matching and merging data from multiple tables |
| **TextInput (Reference Data)** | 11 | Static reference tables (lookup values) |
| **AppendFields** | 11 | Adding calculated fields to output |
| **Sort** | 8 | Ordering data by key fields |
| **CrossTab (Pivot)** | 6 | Converting row data to column format |
| **Database Input/Output** | 5-4 | Reading/writing to database tables |
| **Other Tools** | 25+ | MultiRowFormula, DynamicRename, Regex, Email alerts, etc. |

---

## Key Data Elements

### Core Fields Processed

**Loan Portfolio Fields:**
- `Report_Date` - Monthly reporting date
- `PeerNo` - Peer institution identifier
- `Loan Type` - Classification of loan product
- `Loan Group` - Broader loan categorization
- `Loan Subgroup` - Detailed loan classification
- `Allowance Group` - Loan loss allowance classification
- `LoanAllowanceGroup` - Allowance calculation group

**Peer Analysis Fields:**
- `PeerGroupName` - Name of peer comparison group
- `PeerGroupCode` - Peer group identifier code
- `PeerGroupLoanGroup` - Peer loan group mapping
- `LookupName` - Reference lookup key

**Data Quality Indicators:**
- Previous Period Data (prior month comparison)
- Current Period Data (current month values)
- Field reconciliation mappings

---

## Process Flow Details

### 1. **Data Input Stage**
- JSON input parameter configuration
- Database connections to source systems
- Text-based reference data imports
- Dynamic input parameter handling

### 2. **Data Transformation & Cleaning**
- Field selection and projection
- Data type conversions
- Text parsing and regex transformations
- Missing value handling
- Field renaming and standardization

### 3. **Data Reconciliation**
- **Union Operations (24 instances):**
  - "Union Subset Prior Period (347)" - Combines prior and current period data
  - Reconciles differences between loan data and impairment data

- **Join Operations (21 instances):**
  - Matches loan records to peer groups
  - Correlates allowance groups with loan classifications
  - Merges reference lookup tables

### 4. **Calculation & Analysis**
- Formula tools (60 instances) perform:
  - Loan loss allowance calculations
  - Ratio and percentage calculations
  - Peer comparison metrics
  - Field prioritization logic (loan file data prioritized over impairment file data - noted 2020-05-20)

### 5. **Aggregation**
- Summarize tools (24 instances) group data by:
  - Report Date
  - Peer Group
  - Loan Type/Group/Subgroup
  - Allowance Group
  - Generates SUM, AVG, COUNT, MIN, MAX metrics

### 6. **Output Generation**
- Database outputs to analytical tables
- Email notifications on process completion
- Portfolio Composer table outputs
- Flat file exports for reporting

---

## Data Flow Highlights

### Critical Transformations

**Field Prioritization Logic (Tool 746 - Formula)**
- Prioritizes loan file data fields over impairment file data fields
- Ensures data consistency when conflicts exist
- Implementation date: 2020-05-20

**Prior Period Reconciliation (Tool 347 - Union)**
- Combines current month and prior month subsets
- Maintains historical comparison capability
- Enables month-over-month analysis

**Peer Group Mapping**
- Maps individual loans to peer group classifications
- Uses LookupName, LoanAllowanceGroup, LoanSubgroup keys
- Generates PeerGroupCode and PeerGroupLoanGroup correlations

---

## Process Characteristics

### Strengths
✅ Comprehensive data validation through multiple filter stages
✅ Flexible peer group mapping and reconciliation
✅ Automated monthly processing with documented change history
✅ Multiple aggregation levels for detailed analysis
✅ Built-in error handling and data quality checks

### Complexity Areas
⚠️ 300+ tools make workflow difficult to maintain
⚠️ Multiple Union operations (24) suggest potential redundancy
⚠️ High number of Formula tools (60) indicates complex calculations
⚠️ Minimal inline documentation despite 35 TextBox annotations

---

## Monthly Execution

**Typical Process Steps:**
1. Load current month loan and impairment data from source databases
2. Apply field transformations and data quality validations
3. Reconcile with prior month data
4. Map to peer groups using reference tables
5. Calculate loan loss allowances and key metrics
6. Aggregate by loan group, peer group, and time period
7. Load results to analytical database
8. Send completion notification via email
9. Generate Portfolio Composer output tables

**Estimated Processing Time:** Unknown (varies by data volume)
**Schedule:** Monthly (date TBD based on month-end close)
**Frequency:** Once per month after financial month-end

---

## Automation Opportunities

Based on the workflow structure, the following could be automated:

1. **Scheduling:** Set monthly execution 3 business days after month-end
2. **Source Data Refresh:** Automated pull from database systems
3. **Error Handling:** Automated retry logic and failure notifications
4. **Output Distribution:** Automated email alerts and report generation
5. **Audit Logging:** Track process execution, record counts, error details
6. **Data Validation:** Pre/post-process data quality checks

---

## Related Documentation

- **Workflow Version:** 2020_DataProcess_v5.2.yxmd
- **Last Modified:** [Check Git commit history]
- **Dependencies:** Alteryx Designer 2024.2+
- **Database Requirements:** [To be documented]
- **Access Requirements:** [To be documented]

---

## Next Steps for Implementation Research

1. **Document data sources** - Which systems provide input data?
2. **Map file locations** - Where are monthly data files stored?
3. **Identify scheduling constraints** - What time should loads run?
4. **Define success criteria** - Record counts, validation rules?
5. **Plan error handling** - What happens if data validation fails?
6. **Resource requirements** - Hardware, credentials, network access?

