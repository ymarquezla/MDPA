# MDPA Project

**Monthly Data Process Assessment (MDPA) - Alteryx v5.2 Workflow Documentation**

**Project Location:** `/home/ymarquez/Projects/MDPA/`
**GitHub Repository:** https://github.com/ymarquezla/MDPA.git
**Last Updated:** 2026-03-18

---

## Project Overview

Comprehensive technical and operational documentation suite for the MDPA (Monthly Data Process Assessment) Alteryx workflow used for loan portfolio analysis, regulatory compliance, and peer group benchmarking at credit union institutions.

**Status:** ✅ Documentation Complete + Portal Content Integrated - Ready for Knowledge Transfer

**Total Documentation:** 29 files (20 internal + 6 portal sources + 3 analysis docs), 1000+ pages
**Portal Content Integrated:** 2026-03-23 (Fair Lending, CECL, System Changes, Benchmarking guides)

---

## Project Structure

### Core Technical Documentation (9 files)
1. **1_MDPA_PROCESS_DOCUMENTATION.md** - Workflow overview
2. **2_WORKFLOW_ARCHITECTURE.md** - Technical architecture
3. **3_MACROS_AND_DEPENDENCIES.md** - Macro inventory
4. **4_DATA_SOURCES_AND_LOCATIONS.md** - Data source specifications
5. **5_ALERTS_AND_NOTIFICATIONS.md** - Alert documentation
6. **6_FIELD_MAPPING_AND_DATA_LINEAGE.md** - Field tracking
7. **7_MACROS_DEEP_DIVE.md** - Macro deep dive
8. **9_BUSINESS_DATA_GLOSSARY.md** - Business data reference
9. **8_README.md** - Master index and quick start guide

### Data Models (2 files)
10. **10_LOGICAL_DATA_MODEL.md** - Entity-relationship model
11. **11_PHYSICAL_DATA_MODEL.md** - Database schema design

### Client-Facing Documentation (3 files)
12. **12_TABLEAU_DASHBOARD_GLOSSARY.md** - Dashboard reference (23+ tabs)
13. **13_OUTPUT_TO_DASHBOARD_LINEAGE.md** - Output to dashboard data flow
14. **14_SECURITIES_COLLATERAL_GUIDE.md** - Securities handling guide

### Operational & Support Documentation (6 files)
15. **15_MISSING_SECURITIES_SCENARIOS.md** - Missing collateral scenarios
16. **16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md** - 7-stage troubleshooting (28 issues)
17. **17_QUICK_REF_COLLATERAL_VALUATION.md** - Quick reference
18. **18_QUICK_REF_DELINQUENCY_RISK.md** - Quick reference
19. **19_QUICK_REF_DATA_QUALITY.md** - Quick reference
20. **20_QUICK_REF_DASHBOARD_METRICS.md** - Quick reference
21. **21_QUICK_REF_LOAN_LIFECYCLE.md** - Quick reference
22. **22_FAQ_COMMON_QUESTIONS.md** - 23 Q&As for validation/client support

### Portal Content & Knowledge Transfer Artifacts (6 files + analysis docs)
**Portal Source Documents (Client-Facing Guides - External References):**
- **PORTAL_FAIR_LENDING_USER_GUIDE.pdf** - BISG ethnicity prediction, fair lending analysis, regulatory compliance
- **PORTAL_CECL_USER_GUIDE.pdf** - 159 pages: CECL methodologies, calculations, formulas, scenario weighting
- **PORTAL_CECL_MODEL_CERTIFICATION.pdf** - MountainView validation, model assurance, regulatory compliance
- **PORTAL_UPDATES_Q3_2023.pdf** - System changes: PD null credit scores, gross vs. net charge-offs, weighted scenarios
- **PORTAL_ADVANCED_BENCHMARKING_GUIDE.pdf** - Benchmarking tools, HMDA, Metro reports, WARM methodology
- **PORTAL_TTADATA_VISION_V2022.1_RELEASE_NOTES.pdf** - System enhancements, breaking changes, calculation fixes

**Knowledge Transfer Analysis & Planning (Internal Project Documents):**
23. **PORTAL_CONTENT_ANALYSIS_FRAMEWORK.md** - Methodology for portal doc comparative analysis
24. **PORTAL_CONTENT_GAPS.md** - Detailed gap analysis (14 sections), validation priorities, 14-session plan
25. **PORTAL_CONTENT_SUMMARY.md** - Executive summary, critical findings, next actions
26. **VALIDATION_PLAN_UPDATED.md** - Detailed 6-week knowledge transfer schedule (14 sessions)
27. **WEEK_1_SESSION_OUTLINES.md** - Ready-to-execute Session 1A & 1B materials
28. **DECISION_LOG_TEMPLATE.md** - Template for capturing design decisions during knowledge transfer
29. **MDPA_DOCS_UPDATE_CHECKLIST.md** - List of MDPA docs needing Q3 2023 changes

---

## Key Deliverables

### For SME Validation
- ✅ **16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md** - Comprehensive troubleshooting with step-by-step solutions
- ✅ **22_FAQ_COMMON_QUESTIONS.md** - 23 prepared Q&A responses
- ✅ **12_TABLEAU_DASHBOARD_GLOSSARY.md** - Dashboard documentation
- ✅ **8_README.md** - Master index with role-based reading guides

### For Client Support
- ✅ **22_FAQ_COMMON_QUESTIONS.md** - Client-ready Q&A
- ✅ **12_TABLEAU_DASHBOARD_GLOSSARY.md** - Client-facing dashboard reference
- ✅ **14_SECURITIES_COLLATERAL_GUIDE.md** - Securities collateral reference
- ✅ **20_QUICK_REF_DASHBOARD_METRICS.md** - Metric interpretation

### For Internal Teams
- ✅ **17-21_QUICK_REF_*.md** - 5 quick reference guides (87 pages)
- ✅ **16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md** - Operational troubleshooting
- ✅ **All technical documentation** - Complete technical reference

---

## Next Steps

### For Validation & Deployment
1. **SME Validation Sessions:** Use FAQ and troubleshooting guide
2. **Client Presentations:** Use dashboard glossary and quick references
3. **Database Setup:** Follow physical data model (11_PHYSICAL_DATA_MODEL.md)
4. **Workflow Execution:** Follow architecture and troubleshooting guides
5. **Dashboard Deployment:** Use Tableau glossary and lineage documentation

### For Operations
1. Monthly workflow execution and monitoring
2. Reference troubleshooting guide for issues
3. Use quick reference guides for team lookup
4. Track using FAQ for common questions

---

## GitHub Integration

**Repository:** https://github.com/ymarquezla/MDPA.git

**Recent Commits:**
- `863470f` - Add SME validation & client support documentation (7 files)
- `bfc15b3` - Add comprehensive securities collateral data guide
- `78f3bc4` - Add comprehensive output-to-dashboard lineage documentation
- `5814153` - Add comprehensive Tableau dashboard glossary
- `d03bb72` - Add comprehensive data models: logical and physical data architecture

**All files are version-controlled in GitHub.** Local changes can be committed and pushed.

---

## Quick Start by Role

### Loan Analyst
1. Start with **8_README.md**
2. Read **12_TABLEAU_DASHBOARD_GLOSSARY.md** for dashboard details
3. Reference **22_FAQ_COMMON_QUESTIONS.md** for questions
4. Use **20_QUICK_REF_DASHBOARD_METRICS.md** for metric interpretation

### Operations/Support
1. Start with **16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md** for issues
2. Reference **22_FAQ_COMMON_QUESTIONS.md** for common questions
3. Use **17-21_QUICK_REF_*.md** guides for team lookups
4. Consult **2_WORKFLOW_ARCHITECTURE.md** for technical context

### Data Engineer/Developer
1. Start with **1_MDPA_PROCESS_DOCUMENTATION.md**
2. Review **10_LOGICAL_DATA_MODEL.md** and **11_PHYSICAL_DATA_MODEL.md**
3. Read **2_WORKFLOW_ARCHITECTURE.md** for technical flow
4. Reference **6_FIELD_MAPPING_AND_DATA_LINEAGE.md** for calculations

### Client/Stakeholder
1. Review **12_TABLEAU_DASHBOARD_GLOSSARY.md** for dashboard reference
2. Check **22_FAQ_COMMON_QUESTIONS.md** for common questions
3. Reference **20_QUICK_REF_DASHBOARD_METRICS.md** for metric interpretation
4. Consult **14_SECURITIES_COLLATERAL_GUIDE.md** if applicable

---

## Contact & Support

- **Technical Questions:** Refer to specific documentation file
- **Troubleshooting:** Use **16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md**
- **Workflow Issues:** Check **5_ALERTS_AND_NOTIFICATIONS.md** and **16_OPERATIONAL_TROUBLESHOOTING_GUIDE.md**
- **Data Questions:** Consult **9_BUSINESS_DATA_GLOSSARY.md** and **6_FIELD_MAPPING_AND_DATA_LINEAGE.md**

---

**Project Status:** ✅ Complete and ready for deployment
**Documentation Coverage:** 928 pages across 20 comprehensive documents
**Last Review:** 2026-03-18
