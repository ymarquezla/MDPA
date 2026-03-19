# Phase 5: Data Lineage — Confluence Publication - Research

**Researched:** 2026-03-19
**Domain:** Confluence REST API publication via Node.js — direct adaptation of the Phase 3 proven pattern
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LIN-05 | Lineage map is published to Confluence TREL space under MDPA parent page | The Phase 3 pattern (scripts/publish-gap-analysis.js) provides the complete implementation blueprint. Adaptation is straightforward: change source file, page title, and metadata strings. The converter's existing table and code block handlers cover DATA_LINEAGE.md's content patterns. |
</phase_requirements>

---

## Summary

Phase 5 is a direct adaptation of Phase 3 (Gap Analysis — Confluence Publication). The Phase 3 script `scripts/publish-gap-analysis.js` is a fully working, human-verified, idempotent Confluence publish script. It reads a Markdown source file, converts it to Confluence Storage Format, and creates-or-updates a child page under the MDPA parent (ID 4244045841) in the TREL space. Phase 5 requires writing a new script `scripts/publish-data-lineage.js` that reuses the same converter engine with three changes: source file path (`DATA_LINEAGE.md`), page title (`Data Lineage Map`), and the info macro metadata block.

`DATA_LINEAGE.md` is 775 lines with 267 table rows, 6 code blocks (all bare triple-backtick with no language tag), and 5 heading levels (h1/h2/h3/h4 plus some bold-prefixed paragraphs). All these patterns are handled by the existing converter. One meaningful difference from GAP_ANALYSIS.md: DATA_LINEAGE.md has wide tables (6 columns in Part 3, including verbatim formula strings that contain special characters like `>`, `<`, `[`, `]`, `!`). The `escapeHtml → formatInlineText` pipeline already in the converter handles `>` and `<` correctly. Square brackets (`[`, `]`) do not require HTML escaping and pass through safely in CDATA-less contexts.

The only content-specific addition needed is ensuring bare code blocks (no language tag) render correctly. The existing converter handles them by defaulting to `language="none"` when no language is specified after the opening triple-backtick.

**Primary recommendation:** Copy `scripts/publish-gap-analysis.js` to `scripts/publish-data-lineage.js`, change three strings (source path, page title, info macro text), and run. No converter changes needed.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js native `fetch` | v24.8.0 (confirmed in project) | Confluence REST API calls | Already proven in Phase 3 — no npm install needed |
| Node.js `fs` | built-in | Read DATA_LINEAGE.md | Same as Phase 3 |
| Node.js `path` / `url` | built-in | ESM `__dirname` polyfill, file path resolution | Same as Phase 3 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None (no additional deps) | — | — | Phase 3 used zero npm dependencies — maintain this |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual env parsing | `dotenv` npm package | Not needed — manual parsing proven and avoids npm dependency in MDPA root |
| Custom converter | Official Confluence Markdown macro | Official macro does not support Storage Format tables or structured macros — custom converter is required |

**Installation:**

```bash
# No install required — Node.js 24.8.0 + built-ins only
```

---

## Architecture Patterns

### Recommended Project Structure

```
MDPA/
├── scripts/
│   ├── publish-gap-analysis.js     # Phase 3 — proven, do not modify
│   └── publish-data-lineage.js     # Phase 5 — new script, copy of Phase 3 with 3 changes
├── DATA_LINEAGE.md                 # Source file (775 lines) — read by publish script
└── GAP_ANALYSIS.md                 # Phase 3 source — unchanged
```

### Pattern 1: Copy-and-Adapt (not Rebuild)

**What:** Copy the entire Phase 3 script as the starting point. Change only the three strings that differ. Do not touch the converter logic.

**When to use:** Always for Confluence publication phases in this project — all future phases (7, 9) follow the same pattern.

**Exact changes from publish-gap-analysis.js to publish-data-lineage.js:**

```javascript
// Source: scripts/publish-gap-analysis.js (proven Phase 3 pattern)

// Change 1: Source file path
// FROM:
const mdPath = path.join(__dirname, '../GAP_ANALYSIS.md');
// TO:
const mdPath = path.join(__dirname, '../DATA_LINEAGE.md');

// Change 2: Page title constant
// FROM:
const PAGE_TITLE = 'Gap Analysis Report';
// TO:
const PAGE_TITLE = 'Data Lineage Map';

// Change 3: Info macro metadata block (update document status, source, and description)
// FROM (in fullContent template literal):
//   Document Status: Phase 2 — Prioritized Gap Analysis (Final)
//   Source File: GAP_ANALYSIS.md in MDPA repository (498 lines)
//   Generated: 2026-03-19 from 2020_DataProcess_v5.2.yxmd (49,082 lines XML) ...
//   This page contains the complete MDPA gap analysis report with 41 prioritized findings...
// TO:
//   Document Status: Phase 4 — Data Lineage Map (Final)
//   Source File: DATA_LINEAGE.md in MDPA repository (775 lines)
//   Generated: 2026-03-19 from 2020_DataProcess_v5.2.yxmd (49,082 lines XML) and 14 documentation files
//   This page traces all key fields across 4 source systems, 7 processing stages, and 5 output types...

// Change 4: Console log message (cosmetic)
// FROM:
console.log('Creating MDPA Gap Analysis Report page...');
// TO:
console.log('Creating MDPA Data Lineage Map page...');

// Change 5: Footer paragraph (cosmetic)
// FROM:
//   Source: GAP_ANALYSIS.md — MDPA Gap Analysis Phase 2...
// TO:
//   Source: DATA_LINEAGE.md — MDPA Data Lineage Phase 4...
```

**Everything else stays identical** — the converter, credentials loading, API helpers, dry-run flag, idempotent logic.

### Pattern 2: Idempotent Create-or-Update

**What:** Before creating the page, CQL-search for an existing page with the exact title under the parent. If found, update it (version + 1). If not, create new.

**When to use:** Always. The "Data Lineage Map" page does not exist yet — first run will CREATE. Subsequent runs will UPDATE.

```javascript
// Source: scripts/publish-gap-analysis.js (unchanged — same in Phase 5)
const existingPage = await pageExists(PAGE_TITLE, PARENT_PAGE_ID);
if (existingPage) {
  await updatePage(existingPage.id, PAGE_TITLE, fullContent, existingPage.version.number);
} else {
  await createPage(PAGE_TITLE, fullContent, PARENT_PAGE_ID);
}
```

### Pattern 3: Dry-Run for Pre-Flight Verification

**What:** `--dry-run` flag prints the first 2000 chars of converted XML and exits without calling the API.

**When to use:** Always verify the converter output before the live API call. Catches XML escaping issues or malformed Storage Format before they reach Confluence.

```bash
# Source: proven Phase 3 workflow
node /home/mabushanab/claude-agents/MDPA/scripts/publish-data-lineage.js --dry-run
# Expect: "ac:structured-macro" in output, no raw "## " or "|---|" patterns
```

### Anti-Patterns to Avoid

- **Rebuilding the converter:** The Phase 3 converter is proven and human-verified. Rewriting it introduces new bugs. Copy it entirely.
- **Using `require()` instead of ESM `import`:** The workspace-level `claude-agents/package.json` has `"type": "module"`. Node.js will reject `require()` in `.js` files. Use ESM — same as Phase 3.
- **Skipping dry-run:** DATA_LINEAGE.md has 267 table rows with verbatim formula strings. A dry-run is the fastest way to catch any escaping edge cases before live publish.
- **Modifying `publish-gap-analysis.js`:** Never touch the Phase 3 script. Write a separate `publish-data-lineage.js`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown-to-Confluence conversion | New converter | Copy existing `markdownToConfluence()` from Phase 3 script | Phase 3 already solved the hard cases: table cell escaping, `_` in identifiers, ESM module style, CDATA wrapping for code blocks |
| Confluence auth | New auth mechanism | Copy existing Basic auth pattern from Phase 3 | Proven: `Buffer.from(email:token).toString('base64')` |
| Idempotent publish | New existence check | Copy existing `pageExists()` / CQL pattern from Phase 3 | Proven: CQL `title="X" AND ancestor=Y`, returns version for update |
| ENV loading | `dotenv` npm install | Copy existing manual `.env` parsing from Phase 3 | Zero-dependency, already works in this workspace |

**Key insight:** Phase 3 spent the discovery cost on all the hard problems. Phase 5 is pure application of the proven pattern, not new research.

---

## Common Pitfalls

### Pitfall 1: Bare Code Blocks (No Language Tag)

**What goes wrong:** DATA_LINEAGE.md has 6 code blocks opened as ```` ``` ```` (no language tag, just three backticks). If the converter reads an empty language string and does not default it, the Confluence `code` macro gets `language=""` which may render as an error or fall back to plain text.

**Why it happens:** The existing Phase 3 converter already handles this: `const lang = line.slice(3).trim() || 'none';`. So this is NOT an actual problem — but the planner must know to verify this in the dry-run output.

**How to avoid:** Run `--dry-run` and confirm code blocks produce `<ac:parameter ac:name="language">none</ac:parameter>`.

**Warning signs:** Dry-run output contains `language=""` — means the defaulting logic was accidentally changed.

### Pitfall 2: Wide Table in Part 3 — Formula Column Width

**What goes wrong:** Part 3's formula table has 6 columns including "Formula (verbatim from XML)" which contains extremely long expressions (some 300+ characters). Confluence may truncate or wrap poorly in narrow column widths.

**Why it happens:** The `convertTable()` function sets fixed widths only for narrow columns (Priority = 80px, Gap ID = 90px). Wide tables with free-form content use auto-width (`<col />`).

**How to avoid:** The existing auto-width behavior is correct — do not add fixed widths to formula columns. Confluence will scroll horizontally on narrow viewports. This is acceptable for a technical reference page.

**Warning signs:** If table renders with all 6 columns crushed into 600px — explicitly set `data-table-width="1200"` for the Part 3 tables only (requires column-count detection in `convertTable()`).

### Pitfall 3: Square Brackets in Formula Cells Breaking formatInlineText

**What goes wrong:** Formula strings like `[Charge Off Amount]` contain `[` and `]` characters. If `formatInlineText()` interprets these as Markdown link syntax (`[text](url)`), it could corrupt formula output.

**Why it happens:** The existing `formatInlineText()` in Phase 3 does NOT implement Markdown link conversion (no `[...]` or `(...)` regex). Square brackets pass through untransformed. This is a non-issue — but worth confirming in the dry-run.

**How to avoid:** Verify in dry-run that `[Charge Off Amount]` appears verbatim in the code blocks and inside `<code>` tags in formula table cells.

**Warning signs:** Any `<a href` appearing in formula output.

### Pitfall 4: ESM Module Failure (Already Solved in Phase 3)

**What goes wrong:** If someone copies the script and uses `require()` instead of `import`, Node.js will throw `require is not defined in ES module scope`.

**Why it happens:** `claude-agents/package.json` has `"type": "module"`. This was the blocking issue in Phase 3 (documented in the SUMMARY).

**How to avoid:** Copy the Phase 3 script which already uses ESM. Do not convert back to CommonJS.

**Warning signs:** `ReferenceError: require is not defined in ES module scope`.

### Pitfall 5: Page Title Mismatch with Success Criterion

**What goes wrong:** The success criterion requires exactly `"Data Lineage Map"` as the page title. Any variation (e.g., "MDPA Data Lineage Map", "Data Lineage", "Data Lineage Map — Phase 4") will fail the CQL smoke check.

**Why it happens:** Success criteria use exact title matching, and the CQL smoke check verifies the exact title string.

**How to avoid:** Hardcode `const PAGE_TITLE = 'Data Lineage Map';` and never construct it dynamically.

---

## Code Examples

### Dry-Run Command

```bash
# Source: Phase 3 proven workflow
node /home/mabushanab/claude-agents/MDPA/scripts/publish-data-lineage.js --dry-run 2>&1 | head -60
```

Expected: Output contains `ac:structured-macro`, no raw `## ` headings or `|---|` separator lines.

### Live Publish Command

```bash
node /home/mabushanab/claude-agents/MDPA/scripts/publish-data-lineage.js
```

Expected output:
```
Creating MDPA Data Lineage Map page...
Creating new page: Data Lineage Map
Created page ID: [id]
URL: https://trellance.atlassian.net/wiki/spaces/TREL/pages/[id]

Successfully published Data Lineage Map to Confluence!
```

### CQL Smoke Check (Automated Verify)

```bash
# Source: Phase 3 proven verification pattern (adapted for new title)
node -e "
const fs = require('fs');
" 2>/dev/null || node --input-type=module <<'EOF'
import fs from 'fs';
const env = fs.readFileSync('/home/mabushanab/claude-agents/CLIP/dashboard/server/.env','utf-8');
const token = env.match(/CONFLUENCE_API_TOKEN=(.+)/)[1].trim();
const email = env.match(/CONFLUENCE_EMAIL=(.+)/)[1].trim();
const auth = Buffer.from(email+':'+token).toString('base64');
fetch('https://trellance.atlassian.net/wiki/rest/api/content/search?cql='+encodeURIComponent('title="Data Lineage Map" AND ancestor=4244045841'),{headers:{Authorization:'Basic '+auth,Accept:'application/json'}})
  .then(r=>r.json())
  .then(d=>{
    if(d.results && d.results.length>0) console.log('PASS - page found:', d.results[0].title, '| ID:', d.results[0].id);
    else { console.log('FAIL - page not found'); process.exit(1); }
  });
EOF
```

### Info Macro Template for DATA_LINEAGE.md

```javascript
// Source: adapted from scripts/publish-gap-analysis.js info macro pattern
const fullContent = `<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>Document Status:</strong> Phase 4 — Data Lineage Map (Final)</p>
    <p><strong>Source File:</strong> DATA_LINEAGE.md in MDPA repository (775 lines)</p>
    <p><strong>Generated:</strong> 2026-03-19 from 2020_DataProcess_v5.2.yxmd (49,082 lines XML) and 14 documentation files</p>
    <p>This page traces all key fields across 4 source systems, 7 processing stages, and 5 output types. Formulas are quoted verbatim from XML. Use Part 5 examples to trace any output field end-to-end.</p>
  </ac:rich-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="toc">
  <ac:parameter ac:name="printable">true</ac:parameter>
  <ac:parameter ac:name="style">disc</ac:parameter>
  <ac:parameter ac:name="maxLevel">3</ac:parameter>
  <ac:parameter ac:name="minLevel">1</ac:parameter>
</ac:structured-macro>

${confluenceContent}

<hr />
<p style="color: #666; font-size: 12px;"><em>Source: DATA_LINEAGE.md — MDPA Data Lineage Phase 4. Maintained by Rise Analytics Implementation Team.</em></p>
`;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CommonJS `require()` for publish scripts | ESM `import` | Phase 3 (forced by workspace package.json) | All scripts in MDPA must use ESM |
| Single-pass Markdown conversion | escapeHtml → formatInlineText pipeline for table cells | Phase 3 (Phase 3 SUMMARY decision) | Prevents `>` in formulas from breaking XML |
| Re-discovering Confluence API each phase | Copy proven Phase 3 script | Phase 3 complete | Phase 5 is pure execution |

**Deprecated/outdated:**
- CommonJS `require()` in this workspace: rejected by Node.js due to `"type": "module"` in parent package.json

---

## DATA_LINEAGE.md Content Analysis

Key facts for the planner to know about the source file:

| Property | Value |
|----------|-------|
| Total lines | 775 |
| Table rows (lines starting with `\|`) | 267 |
| Code blocks (triple-backtick pairs) | 6 (3 pairs) |
| Code block language tags | None (all bare ` ``` `) — converter defaults to `language="none"` |
| H1 headings | 1 (document title) |
| H2 headings (Parts) | 6 (`## Part 1` through `## Document Completeness Checklist`) |
| H3 headings | 25 (stages, sections, sources, examples) |
| H4 headings | 5 (subsections in Part 3) |
| Widest table | Part 3 formula table — 6 columns, formula column contains 300+ char strings |
| Special characters in table cells | `>`, `<`, `[`, `]`, `!`, `(`, `)` — all handled by existing escapeHtml pipeline |
| Ordered/unordered lists | None (document uses tables and prose, not lists) |
| Horizontal rules (`---`) | 7 (section separators) |

**No converter changes needed.** All patterns in DATA_LINEAGE.md are already handled by the Phase 3 converter.

---

## Open Questions

1. **Wide table readability in Confluence**
   - What we know: Part 3 formula table has 6 columns with 300+ char formula strings. Confluence renders tables at auto-width.
   - What's unclear: Whether Confluence will scroll horizontally or wrap formula text in ways that make it unreadable.
   - Recommendation: Run dry-run, then do a live publish and review the page in Confluence before marking the task complete. If the table is unreadable, increase `data-table-width` for the Part 3 table (minor converter tweak — not blocking).

2. **Existing "Data Lineage Map" page**
   - What we know: The idempotent pattern will update if a page with this exact title already exists.
   - What's unclear: Whether any prior test or draft page was ever created under parent 4244045841.
   - Recommendation: The CQL check in the script handles both cases. No pre-flight check needed — the script is designed for this.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No test framework — this phase uses automated CLI smoke checks (Node.js inline scripts) |
| Config file | None |
| Quick run command | `node scripts/publish-data-lineage.js --dry-run` |
| Full suite command | CQL smoke check (see Code Examples above) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIN-05 | Confluence page "Data Lineage Map" exists under parent 4244045841 | smoke | CQL search via Node inline script (see Code Examples) | Wave 0: script must be created |
| LIN-05 | Script converts DATA_LINEAGE.md without raw Markdown symbols in output | unit (dry-run) | `node scripts/publish-data-lineage.js --dry-run 2>&1 \| grep "ac:structured-macro"` | Wave 0: script must be created |

### Sampling Rate

- **Per task commit:** `node scripts/publish-data-lineage.js --dry-run` (exits 0, output contains `ac:structured-macro`)
- **Per wave merge:** CQL smoke check confirming page exists with correct title and parent
- **Phase gate:** Human review of Confluence page URL before marking LIN-05 complete

### Wave 0 Gaps

- [ ] `scripts/publish-data-lineage.js` — the publish script itself (primary deliverable of this phase)

---

## Sources

### Primary (HIGH confidence)

- `scripts/publish-gap-analysis.js` — direct source for the converter and API pattern (verified working, human-approved in Phase 3)
- `.planning/phases/03-gap-analysis-confluence-publication/03-01-SUMMARY.md` — documents all Phase 3 decisions, bug fixes, and Confluence page details
- `DATA_LINEAGE.md` — source file inspected directly (775 lines, content patterns confirmed)
- `CLIP/dashboard/server/.env` — confirmed path exists and contains required `CONFLUENCE_EMAIL`, `CONFLUENCE_API_TOKEN`, `CONFLUENCE_BASE_URL` keys

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` — confirms DATA_LINEAGE.md is fully complete and human-verified (Phase 4 complete)
- `.planning/REQUIREMENTS.md` — confirms LIN-05 is the single requirement for this phase

### Tertiary (LOW confidence)

- None. All claims in this research are sourced from files in the repository.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — same stack as Phase 3, which is complete and proven
- Architecture: HIGH — direct copy-and-adapt pattern, three string changes identified precisely
- Pitfalls: HIGH — all pitfalls derived from Phase 3 SUMMARY decisions and actual DATA_LINEAGE.md content inspection

**Research date:** 2026-03-19
**Valid until:** 2026-06-01 (Confluence REST API v1 is stable; Node.js version pinned at 24.8.0 in this workspace)
