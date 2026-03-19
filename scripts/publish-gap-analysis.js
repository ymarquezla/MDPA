// Publish MDPA Gap Analysis Report to Confluence
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
const PAGE_TITLE = 'Gap Analysis Report'; // MUST match success criterion exactly

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

function convertTable(rows) {
  if (rows.length === 0) return '';

  let html = '<table><tbody>\n';

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].split('|').filter(c => c.trim() !== '');
    const tag = i === 0 ? 'th' : 'td';

    html += '<tr>\n';
    for (const cell of cells) {
      // escapeHtml FIRST (handles > characters in cells like "> 0", "> 70%"),
      // then formatInlineText for bold/italic/code markup
      const escaped = escapeHtml(cell.trim());
      html += `<${tag}>${formatInlineText(escaped)}</${tag}>\n`;
    }
    html += '</tr>\n';
  }

  html += '</tbody></table>\n';
  return html;
}

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
      html += `<h3>${escapeHtml(line.slice(4))}</h3>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      html += `<h2>${escapeHtml(line.slice(3))}</h2>\n`;
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

  console.log('Creating MDPA Gap Analysis Report page...');
  if (isDryRun) {
    console.log('[DRY RUN MODE — no API calls will be made]');
  }

  // Read source markdown
  const mdPath = path.join(__dirname, '../GAP_ANALYSIS.md');
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
    <p><strong>Document Status:</strong> Phase 2 — Prioritized Gap Analysis (Final)</p>
    <p><strong>Source File:</strong> GAP_ANALYSIS.md in MDPA repository (498 lines)</p>
    <p><strong>Generated:</strong> 2026-03-18 from 2020_DataProcess_v5.2.yxmd (49,082 lines XML) and 14 documentation files</p>
    <p>This page contains the complete MDPA gap analysis report with 41 prioritized findings across GAP-01, GAP-02, and GAP-03 categories, plus 25 remediation items (REM-001 through REM-025) and a Coverage Matrix.</p>
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
<p style="color: #666; font-size: 12px;"><em>Source: GAP_ANALYSIS.md — MDPA Gap Analysis Phase 2. Maintained by Rise Analytics Implementation Team.</em></p>
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
