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

#### 11. **13_OUTPUT_TO_DASHBOARD_LINEAGE.md**
Complete data lineage from Alteryx workflow outputs to Tableau dashboard visualizations.
- Data flow from 5 output file types (Tableau Extract, Client File, QA Report, Archive, Executive Summary)
- Field lineage mappings (input → stage → output → dashboard)
- Calculated metrics lineage with formulas (Risk_Score, LTV, Delinquency_Rate, Charge_Off_Rate)
- Data download tabs lineage (RE Value, Auto Value, Credit Score)
- Dashboard object lineage with detailed data sources
- Impact analysis examples (data quality changes, collateral updates, charge-off spikes)
- Troubleshooting guide using lineage for problem resolution
- Monthly refresh cycle and data freshness tracking

**Read this** to understand:
- How data flows from the workflow into dashboards
- Which fields feed which charts
- How calculations cascade through stages
- How to troubleshoot data discrepancies
- Impact of upstream changes on dashboard metrics

---

#### 12. **14_SECURITIES_COLLATERAL_GUIDE.md**
Comprehensive reference for securities collateral data capture, valuation, and processing.
- Types of securities (stocks, bonds, mutual funds, ETFs, REITs, commodities)
- Securities collateral data fields (ticker, quantity, pricing, haircut, LTV)
- Valuation methodology and pricing sources (real-time, end-of-day, broker API, custodian)
- Haircut application by security type and risk level
- Daily mark-to-market and price change monitoring
- Securities collateral through 7-stage MDPA workflow:
  * Stage 1: Ingestion from brokers and pricing services
  * Stage 2: Validation (pricing staleness, data quality, LTV thresholds)
  * Stage 3: Enrichment (price changes, LTV calculation, margin call detection)
  * Stage 4: Consolidation (joining securities to loan records)
  * Stage 5: Compliance (concentration risk, stress testing)
  * Stage 6: Output prep (client files, QA reports, Tableau extract)
  * Stage 7: Delivery (dashboard loading and alerts)
- Securities-specific dashboard objects:
  * Portfolio overview, composition, LTV distribution
  * Margin call monitoring and alerts
  * Performance analytics and sector analysis
- Risk monitoring and automatic alerts (margin calls, concentration, volatility, stress tests)
- Best practices for pricing, risk monitoring, data management
- Troubleshooting guide (pricing discrepancies, double-counting, haircut updates)

**Read this** to understand:
- How securities-backed loans differ from auto/RE in valuation
- Daily pricing requirements and sources
- Margin call mechanics and thresholds
- How securities flow through MDPA processing
- Risk dashboards specific to securities collateral
- Regulatory and risk monitoring for securities portfolios

---

#### 13. **15_MISSING_SECURITIES_SCENARIOS.md**
Edge case documentation for missing or delayed securities collateral data.
- 4 types of missing securities scenarios
- Workflow detection points and validation responses
- Immediate actions and escalation procedures
- Impact on loan status progression
- Compliance and regulatory implications
- Step-by-step collections procedures with timelines
- Dashboard and reporting implications
- Prevention best practices and early warning signals

**Read this** to understand:
- What happens when securities data is missing or late
- How to detect and respond to collateral gaps
- Regulatory requirements for missing collateral
- Collections procedures for securities-backed loans

---

#### 14. **16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md** ⭐ FOR SME VALIDATION & CLIENT SUPPORT
Comprehensive end-to-end troubleshooting guide for the 7-stage MDPA workflow.
- 7-stage pipeline walkthrough with detailed problem solving
- 28 specific issues organized by workflow stage
- How to pinpoint problems (detection methods and tools)
- Step-by-step resolution with specific workflow/macro references
- Common scenarios and quick fixes
- Escalation guide with escalation paths
- Data quality checks and diagnostic checklists

**Read this** to understand:
- How to troubleshoot any MDPA issue systematically
- Which workflow tools to examine for specific problems
- How to communicate issues to technical teams
- When and how to escalate

---

#### 15. **17_QUICK_REF_COLLATERAL_VALUATION.md** ⭐ FOR INTERNAL TEAMS
Fast reference for collateral valuation and LTV calculations.
- Collateral types and update frequencies
- LTV calculation and interpretation (by collateral type)
- Real estate, auto, and securities collateral specifics
- Haircut application by security type
- Quick diagnostic checklist

**Read this** for quick lookups on collateral questions.

---

#### 16. **18_QUICK_REF_DELINQUENCY_RISK.md** ⭐ FOR INTERNAL TEAMS
Fast reference for loan status, delinquency, and risk classification.
- Loan status hierarchy and definitions
- Delinquency status transitions and triggers
- Risk score calculation with examples
- Credit score interpretation
- Delinquency and charge-off rate targets
- Quick status lookup guide

**Read this** for quick lookups on delinquency and risk questions.

---

#### 17. **19_QUICK_REF_DATA_QUALITY.md** ⭐ FOR INTERNAL TEAMS
Fast reference for data validation rules and quality gates.
- Field-level validation rules by source
- Valid ranges for each data element
- Cross-field validation rules
- Data quality issues and resolutions
- Quality gate thresholds
- Data quality checklist

**Read this** for quick lookups on data quality and validation.

---

#### 18. **20_QUICK_REF_DASHBOARD_METRICS.md** ⭐ FOR INTERNAL TEAMS
Fast reference for understanding and interpreting dashboard KPIs.
- Key metrics and targets by portfolio type
- Portfolio health metrics and risk metrics
- Dashboard tab purposes and usage
- Metric formulas and calculation examples
- Common questions and interpretation guides
- Diagnostic checklist for validation

**Read this** for quick lookups on metric interpretation and dashboard usage.

---

#### 19. **21_QUICK_REF_LOAN_LIFECYCLE.md** ⭐ FOR INTERNAL TEAMS
Fast reference for loan lifecycle and status progression.
- Complete loan lifecycle flow diagram
- Status definitions and durations
- Automatic vs. manual status transitions
- Common scenarios and resolution paths
- Data quality checks for status tracking
- Diagnostic checklist

**Read this** for quick lookups on loan status and lifecycle events.

---

#### 20. **22_FAQ_COMMON_QUESTIONS.md** ⭐ FOR SME VALIDATION & CLIENT SUPPORT
Frequently asked questions with complete answers.
- Data & Processing (6 questions)
- Portfolio Metrics (5 questions)
- Troubleshooting (4 questions)
- Securities & Collateral (3 questions)
- Dashboard & Reporting (3 questions)
- Compliance & Regulatory (3 questions)
- 23 total Q&As with cross-references to detailed documentation

**Read this** to prepare for SME validation sessions or client presentations.

---

#### 21. **23_BUSINESS_FRIENDLY_TABLEAU_MACROS.md** ⭐ FOR NON-TECHNICAL STAKEHOLDERS
Simple, non-technical explanation of the Tableau macros and what they do.
- Everyday analogies (delivery trucks, mail carriers)
- Three active macros explained in business terms
- Why old macros were disabled (software upgrade)
- Big picture workflow overview
- Why this matters to stakeholders (portfolio management, quality assurance, risk monitoring)
- Common business questions and answers
- 30-second summary for quick sharing

**Read this** to explain macro functions to business users, loan managers, and executives who don't need technical details.

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
- **Total Documents:** 20 comprehensive files (1,600+ pages)
- **Data Fields Documented:** 100+ fields across all inputs and outputs
- **Calculated Metrics:** 10+ derived metrics with formulas
- **Entities Defined:** 4 core business entities with full data model
- **Dashboard Tabs Documented:** 23+ Tableau dashboards with complete glossary
- **Dashboard Objects:** 150+ individual charts, tables, filters, and KPIs
- **Troubleshooting Issues:** 28 specific issues with step-by-step solutions
- **FAQ Questions:** 23 common questions with complete answers
- **Quick Reference Guides:** 5 topic-specific quick lookup guides

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

See **16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md** for:
- Complete 7-stage pipeline troubleshooting
- 28 specific issues with detection and resolution
- Step-by-step resolution with workflow/macro references
- Quick escalation guide

See **22_FAQ_COMMON_QUESTIONS.md** for:
- 23 common Q&As
- Quick answers to typical questions
- References to detailed documentation

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

| Document | Version | Last Updated | Status | Pages |
|---|---|---|---|---|
| 8_README.md | 1.1 | 2026-03-18 | Current | 8 |
| 1_MDPA_PROCESS_DOCUMENTATION.md | 1.0 | 2026-03-11 | Current | 25 |
| 2_WORKFLOW_ARCHITECTURE.md | 1.0 | 2026-03-11 | Current | 35 |
| 3_MACROS_AND_DEPENDENCIES.md | 1.0 | 2026-03-11 | Current | 20 |
| 4_DATA_SOURCES_AND_LOCATIONS.md | 1.0 | 2026-03-11 | Current | 15 |
| 5_ALERTS_AND_NOTIFICATIONS.md | 1.0 | 2026-03-17 | Current | 18 |
| 6_FIELD_MAPPING_AND_DATA_LINEAGE.md | 1.0 | 2026-03-17 | Current | 45 |
| 7_MACROS_DEEP_DIVE.md | 1.0 | 2026-03-17 | Current | 30 |
| 9_BUSINESS_DATA_GLOSSARY.md | 1.0 | 2026-03-17 | Current | 55 |
| 10_LOGICAL_DATA_MODEL.md | 1.0 | 2026-03-18 | Current | 65 |
| 11_PHYSICAL_DATA_MODEL.md | 1.0 | 2026-03-18 | Current | 80 |
| 12_TABLEAU_DASHBOARD_GLOSSARY.md | 1.0 | 2026-03-18 | Current | 110 |
| 13_OUTPUT_TO_DASHBOARD_LINEAGE.md | 1.0 | 2026-03-18 | Current | 95 |
| 14_SECURITIES_COLLATERAL_GUIDE.md | 1.0 | 2026-03-18 | Current | 75 |
| 15_MISSING_SECURITIES_SCENARIOS.md | 1.0 | 2026-03-18 | Current | 45 |
| 16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md | 1.0 | 2026-03-18 | **NEW** | 120 |
| 17_QUICK_REF_COLLATERAL_VALUATION.md | 1.0 | 2026-03-18 | **NEW** | 12 |
| 18_QUICK_REF_DELINQUENCY_RISK.md | 1.0 | 2026-03-18 | **NEW** | 15 |
| 19_QUICK_REF_DATA_QUALITY.md | 1.0 | 2026-03-18 | **NEW** | 20 |
| 20_QUICK_REF_DASHBOARD_METRICS.md | 1.0 | 2026-03-18 | **NEW** | 18 |
| 21_QUICK_REF_LOAN_LIFECYCLE.md | 1.0 | 2026-03-18 | **NEW** | 22 |
| 22_FAQ_COMMON_QUESTIONS.md | 1.0 | 2026-03-18 | **NEW** | 85 |
| **TOTAL** | | | | **928 pages** |

---

## Navigation Tips

- **Start with 8_README.md** (this file) to understand the documentation structure
- **Use the table above** to find specific documents by topic
- **Follow the "Read this" guidance** for your role
- **Cross-reference documents** when you need detailed information on a specific topic

---

**Last Updated:** 2026-03-18
**Repository:** MDPA Alteryx Workflow Documentation
**Maintained by:** Loan Analytics Team
**Total Pages:** 928 (20 comprehensive documents)
