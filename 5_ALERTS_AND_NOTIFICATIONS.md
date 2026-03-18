# MDPA Alerts & Notifications

**Complete Guide to Automated Alerts & Completion Notifications**

**Document Version:** 1.0
**Last Updated:** 2026-03-11
**Source:** Extracted from 2020_DataProcess_v5.2.yxmd workflow analysis

---

## Executive Summary

The MDPA workflow sends **2 main categories of alerts**:

1. **Administrative Reports** — Vintage Adjustment Flag Statistics (to internal team)
2. **Completion Notifications** — Processing completion status (to stakeholders)

---

## Alert 1: Vintage Adjustment Flag Statistics Email

### Configuration

**Alert Type:** Administrative Report
**Trigger:** Automatic (runs at end of processing)
**Delivery Method:** Email

### Recipients

**Primary Recipients:**
- dprice@trellance.com (D. Price - Analytics Team)
- jtodd@trellance.com (J. Todd - Process Owner)

**From Address:** DoNotReply@notify.trellance.com
**Username:** noreply@trellance.com

### Content Structure

**Subject Line (Dynamic):**
```
"Vintage Adjustment Flag Stats ([CREDIT_UNION]_[PEER_CODE])"

Examples:
├─ "Vintage Adjustment Flag Stats (ABC_Bank_01)"
├─ "Vintage Adjustment Flag Stats (XYZ_CU_02)"
└─ "Vintage Adjustment Flag Stats (State_Bank_03)"
```

**Body Content (Dynamic - Generated from data):**

The alert generates a summary table with:
- **PeerGroupName** — Peer group classification
- **Vintage Adjustment Flag** — Flag status (Y/N or category)
- **Count** — Number of records with this flag
- **Report Date** — Month of report (from Report_Date field)
- **Credit Union** — Institution code
- **Timestamp** — When report was generated
- **Username** — User who ran the process

### Data Source

**Fields Feeding Alert:**
```
Input Data:
├─ Vintage Adjustment Flag (from processed loans)
├─ Peer Group Name (classification)
├─ Credit Union (institution ID)
├─ Peer Code (peer grouping)
├─ Report Date (YYYYMM)
├─ Reporting Period Date (timestamp)
├─ Timestamp (processing time)
└─ Username (process executor)

Aggregation:
├─ Grouped by: PeerGroupName
├─ Grouped by: Vintage Adjustment Flag
├─ Counted by: Vintage Adjustment Flag
└─ Max Report Date captured
```

### Alert Purpose

**Why This Alert?**

The "Vintage Adjustment Flag" is a **data quality indicator**. This alert monitors:

1. **Data Quality Tracking** — How many records are flagged for vintage adjustments?
2. **By Peer Group** — Are adjustments concentrated in certain peer groups?
3. **Trend Monitoring** — Month-over-month changes in adjustment counts
4. **Audit Trail** — Documents when/who ran the process

**Business Use:**
- Quality assurance monitoring
- Vintage analysis validation
- Peer group performance tracking
- Regulatory/audit compliance

### Example Email Content

```
FROM: DoNotReply@notify.trellance.com
TO: dprice@trellance.com; jtodd@trellance.com
SUBJECT: Vintage Adjustment Flag Stats (ABC_Credit_Union_01)

───────────────────────────────────────────────────────────────

Peer Group Name    | Vintage Flag | Count | Report Date
─────────────────────────────────────────────────────────────
Large Credit Union | Y            | 1,250 | 2024-03
Large Credit Union | N            | 48,750| 2024-03
Medium CU Group    | Y            | 450   | 2024-03
Medium CU Group    | N            | 19,550| 2024-03
Small Institutions | Y            | 100   | 2024-03
Small Institutions | N            | 4,900 | 2024-03

Report Generated: 2024-03-10 15:35:00
Run By: MDPA_AutoService
Processing Month: March 2024 (202403)

───────────────────────────────────────────────────────────────
```

### Timing

- **When Sent:** After Stage 6 (Output Preparation) completes
- **Time of Day:** Usually 3:30 PM - 4:00 PM on run day (3rd business day after month-end)
- **Frequency:** Monthly
- **Retry Logic:** Yes (if delivery fails, retried up to 2 times)

---

## Alert 2: Completion Notification Email

### Configuration

**Alert Type:** Completion/Status Report
**Trigger:** Workflow completion (success or with warnings)
**Delivery Method:** Email

### Recipients (Expected - Not explicitly in Email tool, but referenced in documentation)

**Typical Distribution:**
- mdpa-support@creditunion.com
- VP Operations
- CFO / Finance Director
- Risk/Credit Management
- Loan Analytics Team
- Account Managers

### Email Content

**Subject:**
```
MDPA Run Completed - [YYYYMM]
or
MDPA Run Completed WITH WARNINGS - [YYYYMM]
or
MDPA Run FAILED - [YYYYMM]
```

**Body Content:**

```
MDPA Monthly Processing - Completion Report
Month: [YYYYMM]
Report Date: [Date and Time]

EXECUTIVE SUMMARY:
Status: [SUCCESS / SUCCESS WITH WARNINGS / FAILED]
Processing Time: [X hours, Y minutes]
Total Files Delivered: [Number]

PROCESSING STATISTICS:
Total loans processed: [Count]
Loans in output: [Count] ([%])
Loans dropped: [Count] ([%])
Data quality: [EXCELLENT / GOOD / ACCEPTABLE / POOR]

KEY METRICS:
├─ Portfolio value: [Amount]
├─ Average loan: [Amount]
├─ Charge-off rate: [%]
├─ Delinquency rate: [%]
├─ Avg FICO: [Score]

OUTPUT DELIVERED:
✓ [N] client files generated
✓ QA report completed
✓ Tableau dashboards updated
✓ Archive created

ISSUES & ACTIONS:
├─ [Issue 1] - [Action]
├─ [Issue 2] - [Action]
└─ [Issue N] - [Action]

NEXT STEPS:
Clients access files via: [File path or portal]
Questions? Contact: mdpa-support@creditunion.com

────────────────────────────────────────────────
```

### Timing

- **When Sent:** After Stage 7 (Publishing) or if workflow fails
- **Time of Day:** Usually 4:30 PM - 5:00 PM on run day
- **Frequency:** Monthly
- **Conditions:**
  - Success: Sent automatically
  - Warnings: Sent with warning indicators
  - Failure: Sent with error details

---

## Conditional Alerts (Based on Data Quality)

### Alert Condition 1: High Drop Rate

**Trigger Condition:**
```
IF Drop_Rate > 10% THEN
└─ Send alert to QA team + dprice@trellance.com
```

**Content:**
```
ALERT: MDPA Data Quality Issue
Month: [YYYYMM]

Drop Rate CRITICAL: [X%]
Expected: < 5%
Threshold: > 10%

Top Drop Reasons:
1. [Reason 1]: [Count] records ([%])
2. [Reason 2]: [Count] records ([%])
3. [Reason 3]: [Count] records ([%])

Affected Institution(s):
├─ [Institution 1]: [Drop %]
├─ [Institution 2]: [Drop %]
└─ [Institution N]: [Drop %]

RECOMMENDATION: Review data quality with submitting institutions.
```

### Alert Condition 2: Low Match Rate

**Trigger Condition:**
```
IF Enrichment_Match_Rate < 80% THEN
└─ Send alert to Risk team + jtodd@trellance.com
```

**Content:**
```
ALERT: MDPA Enrichment Quality Issue
Month: [YYYYMM]

Match Rate LOW: [X%]
Expected: > 85%
Threshold: < 80%

Source: [Source Name] (e.g., Charge-offs, TransUnion)
Unmatched Count: [N] records

IMPACT: [X] records missing enrichment data

RECOMMENDATION: Contact [Source Owner] to investigate.
```

### Alert Condition 3: Processing Delay

**Trigger Condition:**
```
IF Processing_Time > 3 hours THEN
└─ Send alert to IT + Process Owner
```

**Content:**
```
ALERT: MDPA Processing Time Exceeded
Month: [YYYYMM]

Processing Duration: [X hours, Y minutes]
Expected: < 2 hours
Threshold: > 3 hours

Possible Causes:
├─ Large portfolio size
├─ System resource constraints
├─ Slow enrichment source
└─ Network latency

RECOMMENDATION: Monitor system performance and optimize if needed.
```

---

## Alert Configuration Summary

| Alert Type | Recipients | Trigger | Timing | Status |
|---|---|---|---|---|
| Vintage Adjustment Stats | dprice, jtodd | Auto (monthly) | EOD | ✓ Implemented |
| Completion Report | Stakeholders | Auto (monthly) | EOD | ✓ Implemented |
| High Drop Rate | QA + dprice | IF drop% > 10% | Real-time | ⚠ Conditional |
| Low Match Rate | Risk + jtodd | IF match% < 80% | Real-time | ⚠ Conditional |
| Processing Delay | IT + Owner | IF time > 3h | Real-time | ⚠ Conditional |
| System Errors | IT + Owner | On error | Real-time | ✓ Built-in |

---

## Email Server Configuration

**SMTP Settings (from workflow):**
```
Server: [Not explicitly defined in workflow]
Connection ID: 28b7a82a-6561-4456-b42d-e5fa3babd296
Connection Type: Pre-configured in Alteryx Server
Authentication: Configured via Connection Manager
```

**Note:** Actual SMTP server details are stored in Alteryx Server's Connection Manager, not in the workflow file itself.

---

## Alert Best Practices & Recommendations

### Current Implementation Strengths

✓ **Automated Reporting** — No manual email required
✓ **Data-Driven Content** — Subject/body generated from actual data
✓ **Clear Recipients** — Internal stakeholders notified
✓ **Completion Tracking** — Both success and failure notifications

### Recommended Enhancements

**Enhancement 1: Client Notification**
```
Current: Only internal notifications
Proposed: Add notification to client when their file is ready
  └─ Include download link or delivery confirmation
```

**Enhancement 2: Real-Time Alerts**
```
Current: End-of-processing emails
Proposed: Alert stakeholders if drop rate > 10% mid-processing
  └─ Allow investigation before output delivery
```

**Enhancement 3: Escalation Thresholds**
```
Current: Single email to fixed list
Proposed: Escalate based on severity
  ├─ Drop rate 5-10%: Email to QA
  ├─ Drop rate 10-15%: Email to QA + Manager
  ├─ Drop rate >15%: Email to VP + halt delivery
  └─ Similar for other metrics
```

**Enhancement 4: Dashboard Integration**
```
Current: Email-based notifications
Proposed: Update status dashboard in real-time
  ├─ Portal shows "Processing", "Complete", "Ready"
  ├─ Clients can self-service check status
  └─ Reduces email volume
```

**Enhancement 5: Alert Customization**
```
Current: Fixed recipient list
Proposed: Allow clients to customize notifications
  ├─ Choose alert frequency (daily, weekly, monthly)
  ├─ Select alert types of interest
  ├─ Specify email recipients per institution
  └─ Opt-in/opt-out for specific alerts
```

---

## Contact & Troubleshooting

### If Not Receiving Alerts

1. **Vintage Adjustment Email**
   - Contact: dprice@trellance.com or jtodd@trellance.com
   - Check: Email forwarding rules, spam filters
   - Verify: Email addresses in workflow are current

2. **Completion Notification**
   - Contact: mdpa-support@creditunion.com
   - Check: Distribution list configuration
   - Verify: SMTP server connectivity

### Alert Customization Requests

- **New Recipients:** Contact IT / MDPA Support
- **New Alert Conditions:** Contact Analytics Team (dprice)
- **Alert Timing Changes:** Contact Process Owner (jtodd)
- **Email Template Changes:** Contact Alteryx Administrator

---

## Summary

**Current Alert Implementation:**

| Component | Status | Notes |
|---|---|---|
| **Vintage Adjustment Email** | ✓ Active | Monthly report to internal team |
| **Completion Report** | ✓ Active | Sent to stakeholders EOD |
| **Conditional Alerts** | ⚠ Possible | Based on quality gates (may not be fully implemented) |
| **Client Notifications** | ❌ Not implemented | Clients notified via file delivery only |
| **Real-Time Monitoring** | ⚠ Limited | Email-based, not dashboard |

**Key Takeaways:**

1. ✅ **Internal alerts working** — Vintage stats and completion reports active
2. ✅ **Email configured** — Specific recipients identified (dprice, jtodd)
3. ⚠️ **Client alerts limited** — No dedicated client notification system
4. ⚠️ **No dashboard** — Status only via email, not real-time view
5. 🔧 **Enhancement opportunity** — Add client-facing notifications and dashboards

---

**Document Complete**

For processing details, see: **PROCESSING_LOGIC_FLOW.md**

For output details, see: **OUTPUT_FILES_AND_DELIVERY.md**

