# MDPA Alteryx Workflow Documentation

**Comprehensive Documentation Suite for MDPA v5.2 Data Processing Workflow**

---

## Overview

This repository contains complete technical documentation for the **MDPA (Monthly Data Process Assessment)** Alteryx workflow used for loan portfolio analysis, regulatory compliance, and peer group benchmarking at credit union institutions.

**Workflow Version:** 5.2
**Documentation Version:** 1.0
**Last Updated:** 2026-03-17
**Workflow File:** `2020_DataProcess_v5.2.yxmd`

---

## Documentation Structure

### Core Documentation Files

#### 1. **1_MDPA_PROCESS_DOCUMENTATION.md** (START HERE)
Main overview of the entire MDPA workflow.
- High-level process flow
- Workflow architecture summary (300+ tools)
- Key data elements and fields
- Tool usage breakdown
- Core processing stages

**Read this first** to understand the workflow at a high level.

---

#### 2. **2_WORKFLOW_ARCHITECTURE.md**
Detailed architectural documentation with visual flow diagrams.
- Processing pipeline stages
- Tool configuration details
- Data transformation logic
- Performance considerations
- System integration points

**Read this** to understand how tools connect and data flows through the system.

---

#### 3. **3_MACROS_AND_DEPENDENCIES.md**
Complete inventory of all macros used in the workflow.
- All 15+ macros documented with purpose
- Macro categories (transformation, cleansing, output, etc.)
- Embedded vs. external macro distinction
- CReW (Alteryx community) library dependencies
- Dependency risk assessment

**Read this** to understand what macros are used and where they're located.

---

#### 4. **4_DATA_SOURCES_AND_LOCATIONS.md**
Catalog of all input data sources and output file locations.
- Primary data sources (loan portfolio, charge-offs, RE valuations, credit bureau)
- File locations and naming conventions
- Data refresh schedules and SLAs
- Source system connections
- File delivery locations

**Read this** to understand where data comes from and where outputs go.

---

#### 5. **5_ALERTS_AND_NOTIFICATIONS.md**
Documentation of automated alerts and completion notifications.
- Alerts triggered during processing
- Error alerts and escalation procedures
- Completion notifications (email, system)
- Alert routing and recipients
- Notification templates

**Read this** to understand when and how you'll be notified about workflow status.

---

#### 6. **6_FIELD_MAPPING_AND_DATA_LINEAGE.md**
Complete field tracking from source to output.
- Field inventory by source system
- Data transformation chain (7 stages)
- Data lineage diagram
- Calculation chains and dependencies
- Output field mappings
- Quality metrics and validation rules

**Read this** to understand:
- What fields exist at each stage
- How fields transform through the workflow
- Which fields appear in which outputs
- Data quality rules

---

#### 7. **9_BUSINESS_DATA_GLOSSARY.md**
Comprehensive business reference for all data elements.
- Input data glossary (4 sources: Loan Portfolio, Charge-Off/Recovery, Real Estate, Credit Bureau)
- Output data glossary (5 deliverables: Client File, QA Report, Tableau, Archive, Executive Summary)
- 100+ data fields with business context
- Calculated fields with formulas
- Data quality standards and validation rules
- Cross-references to related documentation

**Read this** to understand:
- What each data field means in business terms
- Valid values and acceptable ranges
- How fields are used in outputs
- Data governance and quality requirements

---

#### 8. **10_LOGICAL_DATA_MODEL.md**
Conceptual entity-relationship model independent of technology.
- Core business entities (LOAN, CHARGE_OFF_RECOVERY, PROPERTY_COLLATERAL, CREDIT_BUREAU_PROFILE)
- Entity relationships and cardinality
- Business rules and constraints
- Data flow through processing stages
- Entity lifecycle and state transitions
- Data governance and ownership

**Read this** to understand:
- What business entities and concepts exist
- How they relate to each other
- Business rules governing the data
- Data flow through the 7 processing stages

---

#### 9. **11_PHYSICAL_DATA_MODEL.md**
Technical database schema design and implementation details.
- Production table structures (LOAN, CHARGE_OFF_RECOVERY, PROPERTY_COLLATERAL, CREDIT_BUREAU_PROFILE)
- Staging and archive tables
- Column definitions with data types and constraints
- Indexes and query optimization
- Stored procedures and ETL logic
- Data retention and archival strategy
- Calculated columns and aggregate views

**Read this** to understand:
- How data is physically stored in databases
- Table structures and relationships
- Data types and constraints
- Query performance optimization
- ETL load procedures

---

#### 10. **12_TABLEAU_DASHBOARD_GLOSSARY.md**
Client-facing reference for all dashboard objects and metrics.
- 23+ dashboard tabs documented (Introduction, Landing Pages, Risk, Migration, Downloads, etc.)
- Every dashboard object, chart, table, filter, and KPI defined
- Business context and use cases for each metric
- Input parameters and stress-testing scenarios
- Profitability analysis and dealer performance
- Static pool (vintage) analysis
- Complete metric dictionary with targets

**Read this** to understand:
- What each dashboard tab shows and why
- How to use filters and parameters
- What each metric means in business terms
- How to interpret charts and tables
- Typical performance targets and thresholds

---

## Quick Start Guide

### For Different User Roles

#### **Loan Analyst/End User**
Read in this order:
1. 1_MDPA_PROCESS_DOCUMENTATION.md - Understand what the workflow does
2. 12_TABLEAU_DASHBOARD_GLOSSARY.md - Learn all dashboard objects and metrics
3. 4_DATA_SOURCES_AND_LOCATIONS.md - Know where to find outputs
4. 5_ALERTS_AND_NOTIFICATIONS.md - Know when outputs are ready
5. 9_BUSINESS_DATA_GLOSSARY.md - Reference data field definitions

#### **Operations/Support**
Read in this order:
1. 2_WORKFLOW_ARCHITECTURE.md - Understand the technical flow
2. 3_MACROS_AND_DEPENDENCIES.md - Know what dependencies exist
3. 5_ALERTS_AND_NOTIFICATIONS.md - Know error handling
4. 6_FIELD_MAPPING_AND_DATA_LINEAGE.md - Understand quality rules

#### **Developer/Data Engineer**
Read in this order:
1. 1_MDPA_PROCESS_DOCUMENTATION.md - Understand purpose
2. 2_WORKFLOW_ARCHITECTURE.md - Understand technical design
3. 10_LOGICAL_DATA_MODEL.md - Understand conceptual entities and relationships
4. 11_PHYSICAL_DATA_MODEL.md - Understand database implementation
5. 3_MACROS_AND_DEPENDENCIES.md - Understand external dependencies
6. 6_FIELD_MAPPING_AND_DATA_LINEAGE.md - Understand calculations
7. 4_DATA_SOURCES_AND_LOCATIONS.md - Understand integrations

#### **Loan Analytics Team**
Read in this order:
1. All 7 files in order
2. Focus on 6_FIELD_MAPPING_AND_DATA_LINEAGE.md for reporting
3. Focus on 5_ALERTS_AND_NOTIFICATIONS.md for operations

---

## Key Statistics

### Workflow Complexity
- **Total Tools:** 300+
- **Macro Instances:** 42 total across 23 unique macros
- **Most Frequent Macros:** CReW_EnsureFields (8x), Contingent File Input (8x), 2020_Date_Converter (5x)
- **Data Sources:** 4 primary systems
- **Processing Stages:** 7 major stages
- **Output Files:** 5+ types

### Data Processing
- **Typical Cycle Time:** ~2.5 hours (150 minutes)
- **Records Processed:** 10,000-50,000+ loans per run
- **Data Quality Rules:** 14+ validation rules
- **Output Destinations:** Server galleries, Excel files, Tableau extracts, archives

### Data Flows
- **Input Sources:** Loan portfolio (10K-50K), charge-offs (1K-5K), properties (3K-10K), credit bureau (8K-40K)
- **Transformation Stages:** Ingestion → Cleansing → Enrichment → Consolidation → Compliance → Output Prep → Delivery
- **Output Types:** Client files, QA reports, Tableau extracts, archives, executive summaries

### Documentation Coverage
- **Total Documents:** 12 comprehensive files (1,200+ pages)
- **Data Fields Documented:** 100+ fields across all inputs and outputs
- **Calculated Metrics:** 10+ derived metrics with formulas
- **Entities Defined:** 4 core business entities with full data model
- **Dashboard Tabs Documented:** 23+ Tableau dashboards with complete glossary
- **Dashboard Objects:** 150+ individual charts, tables, filters, and KPIs

---

## Common Workflows

### Running the MDPA Process

1. **Verify Input Data**
   - Loan portfolio file ready in source location
   - Charge-off data available
   - Real estate valuations current
   - Credit bureau data received

2. **Trigger Workflow**
   - Schedule automated run OR
   - Manually execute from Alteryx Server

3. **Monitor Progress**
   - Check alerts for errors (see 5_ALERTS_AND_NOTIFICATIONS.md)
   - Monitor cycle completion
   - Verify output data quality

4. **Access Results**
   - Client delivery file in designated location
   - QA reports generated
   - Tableau extracts updated
   - Archive backup created

### Troubleshooting Common Issues

See **5_ALERTS_AND_NOTIFICATIONS.md** for:
- File input errors (missing source data)
- Data quality failures (invalid values, mismatches)
- Processing failures (calculation errors)
- Delivery errors (output destination issues)

See **6_FIELD_MAPPING_AND_DATA_LINEAGE.md** for:
- Field validation rules
- Calculation verification
- Data lineage tracking

---

## External Dependencies

### Alteryx Community Libraries (CReW)
- `CReW_EnsureFields.yxmc` - Validates field existence and types
- `CReW_ParallelBlockUntilDone.yxmc` - Synchronizes parallel processing

### External Data Sources
- Loan Portfolio Master (ERP system)
- Charge-Off & Recovery System (Loss management)
- Real Estate Valuation System (Appraisal system)
- TransUnion Credit Bureau (Credit reporting)

### Output Destinations
- Excel files (client delivery)
- Tableau Server (dashboards)
- File gallery (QA reports, archives)

See **3_MACROS_AND_DEPENDENCIES.md** and **4_DATA_SOURCES_AND_LOCATIONS.md** for complete details.

---

## Data Quality & Validation

### Quality Gates
- **Input Validation:** All source fields validated for type, range, nullability
- **Processing Validation:** Calculations verified; intermediate outputs checked
- **Output Validation:** Final records validated against acceptance criteria

### Known Issues & Limitations
See **6_FIELD_MAPPING_AND_DATA_LINEAGE.md** for:
- Current data quality issues (TransUnion lag, etc.)
- Workarounds in place
- Future enhancements planned

---

## Change Management

### Adding a New Field
1. Identify source and purpose
2. Add to inventory in 6_FIELD_MAPPING_AND_DATA_LINEAGE.md
3. Add to appropriate transformation stage
4. Update output mappings
5. Add quality validation rule
6. Test with sample data

### Modifying Calculations
1. Document change in 6_FIELD_MAPPING_AND_DATA_LINEAGE.md
2. Update workflow in Alteryx
3. Test against known scenarios
4. Verify output impact
5. Update client documentation

---

## Contact & Support

For questions about:
- **Data availability:** See 4_DATA_SOURCES_AND_LOCATIONS.md
- **Processing flow:** See 2_WORKFLOW_ARCHITECTURE.md
- **Field definitions:** See 6_FIELD_MAPPING_AND_DATA_LINEAGE.md
- **Error handling:** See 5_ALERTS_AND_NOTIFICATIONS.md
- **Workflow design:** See 1_MDPA_PROCESS_DOCUMENTATION.md

---

## Document Versions

| Document | Version | Last Updated | Status |
|---|---|---|---|
| 8_README.md | 1.0 | 2026-03-18 | Current |
| 1_MDPA_PROCESS_DOCUMENTATION.md | 1.0 | 2026-03-11 | Current |
| 2_WORKFLOW_ARCHITECTURE.md | 1.0 | 2026-03-11 | Current |
| 3_MACROS_AND_DEPENDENCIES.md | 1.0 | 2026-03-11 | Current |
| 4_DATA_SOURCES_AND_LOCATIONS.md | 1.0 | 2026-03-11 | Current |
| 5_ALERTS_AND_NOTIFICATIONS.md | 1.0 | 2026-03-17 | Current |
| 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | 1.0 | 2026-03-17 | Current |
| 7_MACROS_DEEP_DIVE.md | 1.0 | 2026-03-17 | Current |
| 9_BUSINESS_DATA_GLOSSARY.md | 1.0 | 2026-03-17 | Current |
| 10_LOGICAL_DATA_MODEL.md | 1.0 | 2026-03-18 | **NEW** |
| 11_PHYSICAL_DATA_MODEL.md | 1.0 | 2026-03-18 | **NEW** |
| 12_TABLEAU_DASHBOARD_GLOSSARY.md | 1.0 | 2026-03-18 | **NEW** |

---

## Navigation Tips

- **Start with 8_README.md** (this file) to understand the documentation structure
- **Use the table above** to find specific documents by topic
- **Follow the "Read this" guidance** for your role
- **Cross-reference documents** when you need detailed information on a specific topic

---

**Last Updated:** 2026-03-17
**Repository:** MDPA Alteryx Workflow Documentation
**Maintained by:** Loan Analytics Team
