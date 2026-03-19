// Publish MDPA Data Lineage Map to Confluence
// ESM — parent workspace package.json has "type": "module"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Load environment variables from CLIP dashboard server .env
// ---------------------------------------------------------------------------
const envPath = path.join(__dirname, '../../CLIP/dashboard/server/.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value && !process.env[key]) process.env[key] = value;
    }
  });
} else {
  console.error('ERROR: Could not find .env at', envPath);
  process.exit(1);
}

const auth = Buffer.from(
  `${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`
).toString('base64');
const baseUrl = process.env.CONFLUENCE_BASE_URL; // https://trellance.atlassian.net/wiki

if (!process.env.CONFLUENCE_EMAIL || !process.env.CONFLUENCE_API_TOKEN || !baseUrl) {
  console.error('ERROR: Missing required env vars: CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN, CONFLUENCE_BASE_URL');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PARENT_PAGE_ID = '4244045841'; // MDPA - MultiDimensional Portfolio Analysis
const SPACE_KEY = 'TREL';
const PAGE_TITLE = 'Data Lineage Map'; // MUST match success criterion exactly

// ---------------------------------------------------------------------------
// HTML utilities
// ---------------------------------------------------------------------------
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatInlineText(text) {
  // Bold (must come before italic)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic with * (single star — not double)
  text = text.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  // Italic with _ only when surrounded by word boundaries (not inside identifiers)
  text = text.replace(/(?<=\s|^)_([^_]+)_(?=\s|$|[.,;:!?])/g, '<em>$1</em>');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  return text;
}

// Priority → Confluence status macro colour map
const PRIORITY_COLOURS = {
  'critical': 'Red',
  'medium':   'Yellow',
  'low':      'Green',
};

function priorityBadge(text) {
  const key = text.trim().toLowerCase();
  if (PRIORITY_COLOURS[key]) {
    return `<ac:structured-macro ac:name="status"><ac:parameter ac:name="colour">${PRIORITY_COLOURS[key]}</ac:parameter><ac:parameter ac:name="title">${escapeHtml(text.trim())}</ac:parameter></ac:structured-macro>`;
  }
  return escapeHtml(text.trim());
}

function formatCellContent(headerName, cellText) {
  const header = (headerName || '').toLowerCase().trim();
  const text   = cellText.trim();
  if (header === 'priority') return priorityBadge(text);
  const escaped = escapeHtml(text);
  return formatInlineText(escaped);
}

function convertTable(rows) {
  if (rows.length === 0) return '';

  // Extract header names so we can apply per-column formatting
  const headerCells = rows[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());

  let html = '<table data-table-width="900"><colgroup>';
  // Distribute column widths — Priority column narrower, others flexible
  const colCount = headerCells.length;
  headerCells.forEach(h => {
    const key = h.toLowerCase();
    const width = key === 'priority' ? '80' : key === 'gap id' || key === 'req id' ? '90' : '';
    html += width ? `<col style="width: ${width}px;" />` : '<col />';
  });
  html += '</colgroup><tbody>\n';

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].split('|').filter(c => c.trim() !== '');
    const isHeader = i === 0;
    const tag = isHeader ? 'th' : 'td';

    html += '<tr>\n';
    cells.forEach((cell, ci) => {
      const colHeader = isHeader ? null : headerCells[ci];
      const content = isHeader
        ? `<strong>${escapeHtml(cell.trim())}</strong>`
        : formatCellContent(colHeader, cell);
      html += `<${tag}>${content}</${tag}>\n`;
    });
    html += '</tr>\n';
  }

  html += '</tbody></table>\n';
  return html;
}

// REM-### headings get turned into expand macros (collapsible)
function isRemHeading(heading) {
  return /^REM-\d+/i.test(heading.trim());
}

// Derive expand title for a REM heading — extract priority tag
function remExpandTitle(heading) {
  // e.g. "REM-001 [Critical] — Relocate 15 hard-path..."
  const match = heading.match(/^(REM-\d+)\s*\[([^\]]+)\]\s*[—-]+\s*(.+)/);
  if (match) {
    const [, id, priority, desc] = match;
    const colour = PRIORITY_COLOURS[priority.toLowerCase()] || 'Grey';
    const badge = `<ac:structured-macro ac:name="status"><ac:parameter ac:name="colour">${colour}</ac:parameter><ac:parameter ac:name="title">${escapeHtml(priority)}</ac:parameter></ac:structured-macro>`;
    return `${escapeHtml(id)} ${badge} ${escapeHtml(desc.trim())}`;
  }
  return escapeHtml(heading);
}

// Section colours for h2 panel-style headers
const SECTION_PANELS = {
  'executive summary':             true,
  'prioritized findings summary':  true,
};

// ---------------------------------------------------------------------------
// Markdown -> Confluence storage format converter
// ---------------------------------------------------------------------------
function markdownToConfluence(markdown) {
  let html = '';
  const lines = markdown.split('\n');
  let inTable = false;
  let inCodeBlock = false;
  let tableRows = [];
  let inList = false;
  let listType = 'ul';
  let inExpand = false;  // tracks open REM expand macro

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        html += ']]></ac:plain-text-body></ac:structured-macro>\n';
        inCodeBlock = false;
      } else {
        const lang = line.slice(3).trim() || 'none';
        html += `<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${lang}</ac:parameter><ac:plain-text-body><![CDATA[`;
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      html += line + '\n';
      continue;
    }

    // Tables
    if (line.startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // Skip separator lines (e.g., |---|---|)
      if (line.match(/^\|[\s\-:|]+\|$/)) {
        continue;
      }
      tableRows.push(line);
      continue;
    } else if (inTable) {
      html += convertTable(tableRows);
      inTable = false;
      tableRows = [];
    }

    // Close open list before headers / hr
    if (inList && (line.startsWith('#') || line.match(/^---+$/))) {
      html += listType === 'ol' ? '</ol>\n' : '</ul>\n';
      inList = false;
    }

    // Headers
    if (line.startsWith('#### ')) {
      html += `<h4>${escapeHtml(line.slice(5))}</h4>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      const title = line.slice(4).trim();
      // Close any open REM expand
      if (inExpand) {
        html += '</ac:rich-text-body></ac:structured-macro>\n';
        inExpand = false;
      }
      if (isRemHeading(title)) {
        // REM items: collapsible expand macro with priority badge in title
        html += `<ac:structured-macro ac:name="expand"><ac:parameter ac:name="title">${remExpandTitle(title)}</ac:parameter><ac:rich-text-body>\n`;
        inExpand = true;
      } else {
        html += `<h3>${escapeHtml(title)}</h3>\n`;
      }
      continue;
    }
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim();
      // Close any open REM expand
      if (inExpand) {
        html += '</ac:rich-text-body></ac:structured-macro>\n';
        inExpand = false;
      }
      // Special sections get a blue heading panel for visual hierarchy
      if (SECTION_PANELS[title.toLowerCase()]) {
        html += `<ac:structured-macro ac:name="panel"><ac:parameter ac:name="borderColor">#0052CC</ac:parameter><ac:parameter ac:name="titleBGColor">#0052CC</ac:parameter><ac:parameter ac:name="titleColor">#FFFFFF</ac:parameter><ac:parameter ac:name="title">${escapeHtml(title)}</ac:parameter><ac:rich-text-body></ac:rich-text-body></ac:structured-macro>\n`;
      }
      html += `<h2>${escapeHtml(title)}</h2>\n`;
      continue;
    }
    if (line.startsWith('# ')) {
      html += `<h1>${escapeHtml(line.slice(2))}</h1>\n`;
      continue;
    }

    // Horizontal rule (only if NOT a table separator already handled above)
    if (line.match(/^---+$/)) {
      html += '<hr />\n';
      continue;
    }

    // Unordered lists
    if (line.match(/^[\s]*[-*] /)) {
      const text = line.replace(/^[\s]*[-*] /, '');
      if (!inList || listType !== 'ul') {
        if (inList) html += listType === 'ol' ? '</ol>\n' : '</ul>\n';
        html += '<ul>\n';
        inList = true;
        listType = 'ul';
      }
      html += `<li>${formatInlineText(escapeHtml(text))}</li>\n`;
      continue;
    }

    // Ordered lists
    if (line.match(/^\d+\. /)) {
      const text = line.replace(/^\d+\. /, '');
      if (!inList || listType !== 'ol') {
        if (inList) html += listType === 'ol' ? '</ol>\n' : '</ul>\n';
        html += '<ol>\n';
        inList = true;
        listType = 'ol';
      }
      html += `<li>${formatInlineText(escapeHtml(text))}</li>\n`;
      continue;
    }

    // End list on non-list non-empty line
    if (inList && line.trim() !== '') {
      html += listType === 'ol' ? '</ol>\n' : '</ul>\n';
      inList = false;
    }

    // Empty lines
    if (line.trim() === '') {
      if (inList) {
        html += listType === 'ol' ? '</ol>\n' : '</ul>\n';
        inList = false;
      }
      continue;
    }

    // Regular paragraph
    html += `<p>${formatInlineText(escapeHtml(line))}</p>\n`;
  }

  // Close any open elements at EOF
  if (inTable) {
    html += convertTable(tableRows);
  }
  if (inList) {
    html += listType === 'ol' ? '</ol>\n' : '</ul>\n';
  }
  if (inExpand) {
    html += '</ac:rich-text-body></ac:structured-macro>\n';
  }

  return html;
}

// ---------------------------------------------------------------------------
// Confluence API helpers
// ---------------------------------------------------------------------------
async function pageExists(title, parentId) {
  const cql = `title="${title}" AND ancestor=${parentId}`;
  const url = `${baseUrl}/rest/api/content/search?cql=${encodeURIComponent(cql)}&expand=version`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`pageExists check failed: ${response.status} - ${body}`);
    return null;
  }

  const data = await response.json();
  return data.results && data.results.length > 0 ? data.results[0] : null;
}

async function createPage(title, content, parentId) {
  const url = `${baseUrl}/rest/api/content`;

  const payload = {
    type: 'page',
    title: title,
    space: { key: SPACE_KEY },
    ancestors: [{ id: parentId }],
    body: {
      storage: {
        value: content,
        representation: 'storage'
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Create page failed: ${response.status} - ${errorText}`);
    process.exit(1);
  }

  return await response.json();
}

async function updatePage(pageId, title, content, version) {
  const url = `${baseUrl}/rest/api/content/${pageId}`;

  const payload = {
    type: 'page',
    title: title,
    version: { number: version + 1 },
    body: {
      storage: {
        value: content,
        representation: 'storage'
      }
    }
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Update page failed: ${response.status} - ${errorText}`);
    process.exit(1);
  }

  return await response.json();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('Creating MDPA Data Lineage Map page...');
  if (isDryRun) {
    console.log('[DRY RUN MODE — no API calls will be made]');
  }

  // Read source markdown
  const mdPath = path.join(__dirname, '../DATA_LINEAGE.md');
  if (!fs.existsSync(mdPath)) {
    console.error('ERROR: Source file not found:', mdPath);
    process.exit(1);
  }
  const markdown = fs.readFileSync(mdPath, 'utf-8');

  // Convert to Confluence storage format
  const confluenceContent = markdownToConfluence(markdown);

  // Build full page content with info + TOC macros
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

  if (isDryRun) {
    console.log('\n--- DRY RUN: First 2000 chars of converted Confluence storage XML ---\n');
    console.log(fullContent.slice(0, 2000));
    console.log('\n--- END DRY RUN ---');
    return;
  }

  // Check if page already exists (idempotent)
  const existingPage = await pageExists(PAGE_TITLE, PARENT_PAGE_ID);

  if (existingPage) {
    console.log(`Updating existing page: ${PAGE_TITLE}`);
    const result = await updatePage(
      existingPage.id,
      PAGE_TITLE,
      fullContent,
      existingPage.version.number
    );
    console.log(`Updated page ID: ${result.id}`);
    console.log(`URL: ${baseUrl}/spaces/${SPACE_KEY}/pages/${result.id}`);
  } else {
    console.log(`Creating new page: ${PAGE_TITLE}`);
    const result = await createPage(PAGE_TITLE, fullContent, PARENT_PAGE_ID);
    console.log(`Created page ID: ${result.id}`);
    console.log(`URL: ${baseUrl}/spaces/${SPACE_KEY}/pages/${result.id}`);
  }

  console.log('');
  console.log(`Successfully published ${PAGE_TITLE} to Confluence!`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
