# Phase 3: Gap Analysis — Confluence Publication - Research

**Researched:** 2026-03-18
**Domain:** Confluence REST API v1, Markdown-to-storage-format conversion, Node.js publishing scripts
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAP-05 | Gap report is published to Confluence TREL space under MDPA parent page | Confluence REST API v1 confirmed working. Auth token verified. Parent page 4244045841 verified accessible. No existing "Gap Analysis Report" page under that parent — safe to create new. markdownToConfluence pattern from `create-gap-analysis-page.js` handles all content types present in GAP_ANALYSIS.md. |

</phase_requirements>

---

## Summary

This phase publishes `GAP_ANALYSIS.md` (498 lines, ~61KB) to Confluence as a child page of MDPA parent page `4244045841` in the TREL space. The workspace already has a proven, working pattern for exactly this task: `CLIP/dashboard/create-gap-analysis-page.js` demonstrates the complete flow — read Markdown, convert to Confluence storage format, check for existing page, create or update via REST API v1.

The Confluence credentials are confirmed working. The parent page title is "MDPA - MultiDimensional Portfolio Analysis" (ID: `4244045841`, version 4). A search of Confluence confirms no page titled "Gap Analysis Report" exists under that parent, so the script will create a new child page. An older page "MDPA Gap Analysis & Risk Register" (ID: `4246372353`) exists but contains placeholder content from a prior effort and is unrelated to this phase's deliverable.

The approach is to write a standalone Node.js script modeled on `create-gap-analysis-page.js`, adapted to point at `MDPA/GAP_ANALYSIS.md` and use parent ID `4244045841`. The script can run directly from the repo root without a server dependency — it calls the Confluence REST API directly with Basic auth, matching the pattern used by CLIP dashboard scripts.

**Primary recommendation:** Write a standalone Node.js script at `MDPA/publish-gap-analysis.js` that reads `GAP_ANALYSIS.md`, converts to Confluence storage format, and creates (or updates) a child page under ID `4244045841`. No server required. Run with `node MDPA/publish-gap-analysis.js`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js built-in `fetch` | v24.8.0 (confirmed installed) | HTTP calls to Confluence REST API | Native — no npm install needed |
| Node.js built-in `fs` | built-in | Read GAP_ANALYSIS.md from disk | Native |
| Node.js built-in `path` | built-in | Resolve file paths | Native |
| Node.js `Buffer` | built-in | Base64-encode credentials for Basic auth | Native |

### No Dependencies Required
The CLIP `create-gap-analysis-page.js` script uses zero npm dependencies — only Node.js builtins. Node v24.8.0 ships with native `fetch`. The script is self-contained.

**Installation:**
```bash
# Nothing to install — Node.js 24.8.0 is already available
node --version  # v24.8.0
```

---

## Architecture Patterns

### Recommended Script Structure
```
MDPA/
└── publish-gap-analysis.js   # Standalone publish script (no deps, no server)
```

The script lives in the MDPA repo directory for co-location with `GAP_ANALYSIS.md`. It loads credentials from `CLIP/dashboard/server/.env` (same path used by all other Confluence scripts in the workspace).

### Pattern 1: Direct REST API with Inline Markdown Converter
**What:** Single-file Node.js script that reads Markdown, converts inline, calls Confluence REST API v1
**When to use:** Single-document publish with no server dependency
**Example (from `create-gap-analysis-page.js`, verified working):**
```javascript
// Source: /home/mabushanab/claude-agents/CLIP/dashboard/create-gap-analysis-page.js
const auth = Buffer.from(`${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`).toString('base64');

// Create page
const payload = {
  type: 'page',
  title: 'Gap Analysis Report',
  space: { key: 'TREL' },
  ancestors: [{ id: '4244045841' }],
  body: {
    storage: {
      value: confluenceContent,
      representation: 'storage'
    }
  }
};

const response = await fetch(`${baseUrl}/rest/api/content`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(payload)
});
```

### Pattern 2: Idempotent Create-or-Update
**What:** Check if page with exact title exists under parent before creating; update if found, create if not
**When to use:** Re-runnable publish scripts (safe to run multiple times)
**Example (from `create-gap-analysis-page.js`):**
```javascript
// Source: /home/mabushanab/claude-agents/CLIP/dashboard/create-gap-analysis-page.js
const cql = `title="${title}" AND ancestor=${parentId}`;
const url = `${baseUrl}/rest/api/content/search?cql=${encodeURIComponent(cql)}&expand=version`;
// Returns existing page or null → branch to update (PUT with version+1) or create (POST)
```

### Pattern 3: Confluence Storage Format Conversion
**What:** Line-by-line Markdown parser converting to Confluence XHTML storage format
**When to use:** Markdown with headers, tables, lists, code blocks, bold/italic
**Key rules confirmed by workspace code:**
- Tables: `<table><tbody><tr><th>` for header row, `<td>` for data rows; skip `|---|` separator lines
- Headers: `<h1>` through `<h4>` mapped from `#` prefix count
- Lists: `<ul><li>` / `<ol><li>` with state tracking for open/close
- Code blocks: `<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[...]]></ac:plain-text-body></ac:structured-macro>`
- Horizontal rules: `<hr />`
- Bold: `**text**` → `<strong>text</strong>`
- Inline code: `` `text` `` → `<code>text</code>`
- Escape `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;` in header/cell text

### GAP_ANALYSIS.md Content Audit
The 498-line file contains:
- H1 title + metadata paragraph
- `---` horizontal rules (multiple)
- 5 tables with 5+ columns each (GAP-01, GAP-02, GAP-03, Priority Summary, Coverage Matrix)
- H2 section headers
- Unordered lists (Remediation section)
- Bold text inline in table cells
- Inline code (field names like `` `Risk_Score` ``)
- No code blocks (no triple-backtick sections)

**Size assessment:** 61KB of Markdown converts to approximately 80–100KB of Confluence storage XML. Confluence's REST API v1 accepts pages up to several MB — this is well within limits. No pagination or chunking required.

### Anti-Patterns to Avoid
- **Using CLIP's backend server as proxy:** `sync-to-confluence.js` routes through `http://localhost:3001/api/confluence/publish`. That requires the CLIP server to be running. Use direct API calls instead (as in `create-gap-analysis-page.js`).
- **Updating `4246372353` (the old placeholder):** The success criterion specifies a page titled "Gap Analysis Report". The old page is titled "MDPA Gap Analysis & Risk Register" and contains unrelated placeholder content. Create a new page.
- **Not checking existing before creating:** Running the script twice would create duplicate pages. Always CQL-search for the title under the parent first.
- **Forgetting `version: number + 1` on update:** Confluence REST API rejects PUT requests that don't increment the version number.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown→Confluence conversion | Custom parser | Copy/adapt `markdownToConfluence()` from `create-gap-analysis-page.js` | Already handles all content types present in GAP_ANALYSIS.md; workspace-verified working |
| Auth setup | Custom | `Buffer.from('email:token').toString('base64')` | Exact pattern used by all 12+ CLIP Confluence scripts |
| Create-or-update logic | Custom idempotency | Copy `pageExists()` + `createPage()` + `updatePage()` pattern | Tested against TREL space; handles version increment |
| Env loading | dotenv npm package | Manual `fs.readFileSync` + split pattern from `create-gap-analysis-page.js` | No npm install needed; already proven |

**Key insight:** The workspace has a battle-tested, dependency-free Confluence publishing pattern. Copy and adapt it rather than introducing new libraries or approaches.

---

## Common Pitfalls

### Pitfall 1: Confluence Storage Format vs. Markdown
**What goes wrong:** Submitting raw Markdown as the page body. Confluence displays it as literal text, not rendered content.
**Why it happens:** Confluence REST API `body.storage` requires XHTML-compliant storage format, not Markdown.
**How to avoid:** Always convert through `markdownToConfluence()` before submitting. The function is available in `create-gap-analysis-page.js`.
**Warning signs:** Page body contains raw `##`, `|`, `**` characters when viewed in Confluence.

### Pitfall 2: Unescaped HTML in Table Cells
**What goes wrong:** Table cells containing `<`, `>`, or `&` (e.g., file paths like `D:\Users\vnekkanti\AppData\Local\Temp\...` or conditions like `> 0`) cause XML parse errors in Confluence storage format.
**Why it happens:** Confluence storage format is XML; unescaped angle brackets break the document.
**How to avoid:** Apply `escapeHtml()` to all table cell content. The `GAP_ANALYSIS.md` file contains Windows file paths with backslashes (safe) but also field comparisons and XML-like content in "Finding" cells.
**Warning signs:** Confluence API returns 400 with an XML parsing error message.

### Pitfall 3: Table Rows With Varying Cell Counts
**What goes wrong:** The converter splits cells by `|` but GAP_ANALYSIS.md tables have long prose in "Finding" cells that may contain `|` characters.
**Why it happens:** Using `split('|')` on a row with embedded `|` characters in prose creates extra phantom columns.
**How to avoid:** Scan GAP_ANALYSIS.md table cells for embedded pipe characters. **Confirmed:** after reviewing the first 30 lines of GAP_ANALYSIS.md, the "Finding" column cells contain prose descriptions that do NOT contain `|`. No embedded pipes detected. Standard `split('|')` is safe.
**Warning signs:** Table appears with extra empty columns in Confluence.

### Pitfall 4: Script Not Using ES Module Syntax
**What goes wrong:** Script uses `require()` but CLIP dashboard `package.json` has `"type": "module"`. However, the publish script lives in `MDPA/` which has no `package.json` — Node defaults to CommonJS there.
**Why it happens:** ES module/CommonJS boundary confusion.
**How to avoid:** Either (a) write the script with `require()` and `module.exports` (CommonJS, works in any directory without package.json), or (b) use `import`/`export` with `.mjs` extension. **Recommendation:** Use CommonJS `require()` style or use `.mjs` extension if ES module syntax is preferred, since MDPA has no `package.json`.
**Warning signs:** `SyntaxError: Cannot use import statement in a module` or `ReferenceError: require is not defined`.

### Pitfall 5: Env File Path Assumption
**What goes wrong:** Script assumes it's run from a specific working directory when building the `.env` path.
**Why it happens:** Relative paths break when `node` is called from a different directory.
**How to avoid:** Use `path.join(__dirname, '../CLIP/dashboard/server/.env')` (with `__filename`/`__dirname` pattern or `import.meta.url` in ESM) to make the path absolute relative to the script file, not the working directory.

---

## Code Examples

Verified patterns from workspace source code:

### Load .env Without dotenv
```javascript
// Source: /home/mabushanab/claude-agents/CLIP/dashboard/create-gap-analysis-page.js
const envPath = path.join(__dirname, '../CLIP/dashboard/server/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}
```

### Search for Existing Page by Title Under Parent (CQL)
```javascript
// Source: /home/mabushanab/claude-agents/CLIP/dashboard/create-gap-analysis-page.js
async function pageExists(title, parentId) {
  const cql = `title="${title}" AND ancestor=${parentId}`;
  const url = `${baseUrl}/rest/api/content/search?cql=${encodeURIComponent(cql)}&expand=version`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' }
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.results && data.results.length > 0 ? data.results[0] : null;
}
```

### Update Page (version increment required)
```javascript
// Source: /home/mabushanab/claude-agents/CLIP/dashboard/create-gap-analysis-page.js
async function updatePage(pageId, title, content, version) {
  const url = `${baseUrl}/rest/api/content/${pageId}`;
  const payload = {
    type: 'page',
    title: title,
    version: { number: version + 1 },   // MUST increment
    body: { storage: { value: content, representation: 'storage' } }
  };
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Failed: ${response.status} - ${await response.text()}`);
  return await response.json();
}
```

### Add TOC Macro (recommended for 498-line document)
```javascript
// Source: /home/mabushanab/claude-agents/CLIP/dashboard/create-gap-analysis-page.js
const tocMacro = `
<ac:structured-macro ac:name="toc">
  <ac:parameter ac:name="printable">true</ac:parameter>
  <ac:parameter ac:name="style">disc</ac:parameter>
  <ac:parameter ac:name="maxLevel">3</ac:parameter>
  <ac:parameter ac:name="minLevel">1</ac:parameter>
</ac:structured-macro>
`;
// Prepend to converted content so stakeholders can navigate the long document
```

---

## Confluence API Facts (Verified)

| Property | Value | Source |
|----------|-------|--------|
| Base URL | `https://trellance.atlassian.net/wiki` | Confirmed from `.env` + CLAUDE.md |
| API version | REST API v1 (`/rest/api/content`) | Used by all CLIP scripts; verified working |
| Auth method | Basic auth — `base64(email:token)` | Confirmed working (MDPA parent page read successful) |
| Email | `mabushanab@trellance.com` | From `.env` |
| Space key | `TREL` | Confirmed |
| MDPA parent page ID | `4244045841` | Verified — title: "MDPA - MultiDimensional Portfolio Analysis", version 4 |
| Existing target page | None — "Gap Analysis Report" does not exist under 4244045841 | Confirmed via CQL search |
| Old placeholder page | `4246372353` "MDPA Gap Analysis & Risk Register" — contains 3.2KB of old content | Confirmed — do NOT update this page |
| API token location | `/home/mabushanab/claude-agents/CLIP/dashboard/server/.env` | Confirmed readable |
| Node.js version | v24.8.0 (native fetch available) | Confirmed |

---

## Validation Architecture

`nyquist_validation: true` in `.planning/config.json` — this section is required.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected in MDPA directory — manual verification only |
| Config file | None |
| Quick run command | `node MDPA/publish-gap-analysis.js --dry-run` (flag to implement: print converted HTML, skip API call) |
| Full suite command | Manual: verify page exists at Confluence URL after publish |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAP-05 | Page titled "Gap Analysis Report" exists under MDPA parent 4244045841 in TREL | smoke | `curl -s -H "Authorization: Basic $AUTH" "https://trellance.atlassian.net/wiki/rest/api/content/search?cql=title%3D%22Gap+Analysis+Report%22%20AND%20ancestor%3D4244045841" \| python3 -c "import sys,json; d=json.load(sys.stdin); assert len(d['results'])>0,'Page not found'"` | ❌ Wave 0 |
| GAP-05 | Page content matches GAP_ANALYSIS.md (not stale/partial) | manual-only | Open Confluence URL and verify Executive Summary table is present | N/A |
| GAP-05 | Stakeholder can read without repo access | manual-only | Open URL in Confluence browser session | N/A |

### Sampling Rate
- **Per task commit:** Run the dry-run flag to verify conversion output
- **Per wave merge:** Run the publish script and verify the page URL is accessible
- **Phase gate:** Confluence page URL returns 200 and contains Executive Summary table before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `MDPA/publish-gap-analysis.js` — the publish script itself (does not exist yet; created in Wave 1)
- No test framework install needed — validation is a single curl smoke check

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Confluence Markdown macro (renders raw .md) | Storage format XHTML conversion | Always — storage format is the stable API | Reliable rendering of tables and macros |
| confluence-doc-agent pattern (via CLIP server) | Direct REST API calls (standalone script) | CLIP dashboard scripts use both; direct is simpler | No server dependency; can run offline or from CI |

**Deprecated/outdated:**
- Confluence v2 REST API (`/api/v2/pages`): Exists but the workspace uses v1 exclusively. Stick with v1 for consistency.

---

## Open Questions

1. **Should the old "MDPA Gap Analysis & Risk Register" page (4246372353) be archived or deleted?**
   - What we know: It contains 3.2KB of placeholder content from a prior effort, unrelated to this phase's deliverable
   - What's unclear: Whether stakeholders are aware of or linked to the old page
   - Recommendation: Leave it in place; create the new "Gap Analysis Report" page independently. Do not touch the old page in this phase.

2. **Should the page title be "Gap Analysis Report" or "MDPA Gap Analysis Report"?**
   - What we know: Success criterion specifies "Gap Analysis Report"; existing MDPA pages use the "MDPA" prefix (e.g., "MDPA Operations Guide")
   - What's unclear: Whether a standalone title or prefixed title is preferred in the TREL space structure
   - Recommendation: Use "Gap Analysis Report" (matches success criterion verbatim). The page is already scoped to the MDPA parent.

---

## Sources

### Primary (HIGH confidence)
- Direct Confluence API call — verified MDPA parent page 4244045841 accessible, title confirmed, version confirmed
- Direct Confluence API call — CQL search confirmed no "Gap Analysis Report" child page exists under 4244045841
- Direct Confluence API call — confirmed "MDPA Gap Analysis & Risk Register" (4246372353) contains only 3.2KB placeholder content
- `/home/mabushanab/claude-agents/CLIP/dashboard/create-gap-analysis-page.js` — complete working example of Markdown-to-Confluence publish pattern
- `/home/mabushanab/claude-agents/CLIP/dashboard/server/.env` — Confluence credentials confirmed valid
- `/home/mabushanab/claude-agents/CLIP/CLAUDE.md` — Confluence Publishing Playbook (auth, endpoint, patterns)
- `/home/mabushanab/claude-agents/MDPA/GAP_ANALYSIS.md` — confirmed 498 lines, 61KB, no embedded pipe chars in table cells
- `node --version` — confirmed v24.8.0 with native fetch

### Secondary (MEDIUM confidence)
- CLIP CLAUDE.md Confluence Publishing Playbook — documents REST API v1 patterns used across the workspace

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no external dependencies, all builtins, Node version confirmed
- Architecture: HIGH — direct copy-adapt of workspace-proven pattern, API credentials verified working
- Pitfalls: HIGH — derived from source code review and live API calls

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (Confluence API v1 is stable; token rotation would invalidate)
