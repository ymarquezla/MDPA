// Publish MDPA Validation Dashboard Onboarding Guide to Confluence
// ESM — parent workspace package.json has "type": "module"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Load environment variables
// ---------------------------------------------------------------------------
// Credentials loaded from environment variables directly

const auth = Buffer.from(
  `${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`
).toString('base64');
const baseUrl = process.env.CONFLUENCE_BASE_URL;

if (!process.env.CONFLUENCE_EMAIL || !process.env.CONFLUENCE_API_TOKEN || !baseUrl) {
  console.error('ERROR: Missing required env vars: CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN, CONFLUENCE_BASE_URL');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PARENT_PAGE_ID = '4365451266'; // Validation Dashboard — QA Test Cases
const SPACE_KEY = 'TREL';
const PAGE_TITLE = 'Validation Dashboard — QA Critical Tests (First Pass)';

// ---------------------------------------------------------------------------
// Screenshots — real images for pages that already have them, placeholders for the rest
// ---------------------------------------------------------------------------
const PAGE_SCREENSHOTS = {
  1: `<ac:image ac:align="center" ac:layout="center" ac:original-height="940" ac:original-width="1127" ac:custom-width="true" ac:alt="image-20260407-161646.png" ac:width="760"><ri:attachment ri:filename="image-20260407-161646.png" ri:version-at-save="1" /><ac:caption><p><strong>TIE OUT / VALIDATION SUMMARY</strong></p></ac:caption></ac:image>`,
  2: `<ac:image ac:align="center" ac:layout="center" ac:original-height="695" ac:original-width="1131" ac:custom-width="true" ac:alt="image-20260407-161758.png" ac:width="760"><ri:attachment ri:filename="image-20260407-161758.png" ri:version-at-save="1" /><ac:caption><p><strong>LOAN TYPE VALIDATION</strong></p></ac:caption></ac:image>`,
};

const SCREENSHOT_PLACEHOLDER = `
<ac:structured-macro ac:name="info">
  <ac:parameter ac:name="title">Screenshot Placeholder</ac:parameter>
  <ac:rich-text-body>
    <p><em>Paste dashboard screenshot here.</em></p>
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <p>&nbsp;</p>
  </ac:rich-text-body>
</ac:structured-macro>
`;

function getScreenshot(pageNum) {
  return PAGE_SCREENSHOTS[pageNum] || SCREENSHOT_PLACEHOLDER;
}

// ---------------------------------------------------------------------------
// HTML utilities (shared pattern from existing publish scripts)
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
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  text = text.replace(/(?<=\s|^)_([^_]+)_(?=\s|$|[.,;:!?])/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  return text;
}

function formatCellContent(cellText) {
  const escaped = escapeHtml(cellText.trim());
  return formatInlineText(escaped);
}

function convertTable(rows) {
  if (rows.length === 0) return '';
  const headerCells = rows[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());

  let html = '<table data-table-width="900"><colgroup>';
  headerCells.forEach(() => { html += '<col />'; });
  html += '</colgroup><tbody>\n';

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].split('|').filter(c => c.trim() !== '');
    const isHeader = i === 0;
    const tag = isHeader ? 'th' : 'td';
    html += '<tr>\n';
    cells.forEach(cell => {
      const content = isHeader
        ? `<strong>${escapeHtml(cell.trim())}</strong>`
        : formatCellContent(cell);
      html += `<${tag}>${content}</${tag}>\n`;
    });
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
  let currentPageNum = 0; // tracks which Page N section we're in
  let inPageSection = false;
  let screenshotInserted = false;

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
      if (line.match(/^\|[\s\-:|]+\|$/)) continue;
      tableRows.push(line);
      continue;
    } else if (inTable) {
      const tableHtml = convertTable(tableRows);
      html += tableHtml;
      inTable = false;
      tableRows = [];

      // Insert screenshot placeholder once per Page section, after the first table
      if (inPageSection && !screenshotInserted) {
        html += getScreenshot(currentPageNum);
        screenshotInserted = true;
      }
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
      // Detect "Page N:" sections and reset screenshot flag
      const pageMatch = title.match(/^Page (\d+):/i);
      if (pageMatch) {
        currentPageNum = parseInt(pageMatch[1], 10);
        inPageSection = true;
        screenshotInserted = false;
      } else {
        inPageSection = false;
      }
      html += `<h3>${escapeHtml(title)}</h3>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      inPageSection = false;
      html += `<h2>${escapeHtml(line.slice(3).trim())}</h2>\n`;
      continue;
    }
    if (line.startsWith('# ')) {
      html += `<h1>${escapeHtml(line.slice(2))}</h1>\n`;
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      html += '<hr />\n';
      continue;
    }

    // Blockquotes (> Important Note)
    if (line.startsWith('> ')) {
      const text = line.slice(2);
      html += `<ac:structured-macro ac:name="note"><ac:rich-text-body><p>${formatInlineText(escapeHtml(text))}</p></ac:rich-text-body></ac:structured-macro>\n`;
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
  if (inTable) html += convertTable(tableRows);
  if (inList) html += listType === 'ol' ? '</ol>\n' : '</ul>\n';

  return html;
}

// ---------------------------------------------------------------------------
// Confluence API helpers
// ---------------------------------------------------------------------------
async function pageExists(title, parentId) {
  const cql = `title="${title}" AND space.key="${SPACE_KEY}"`;
  const url = `${baseUrl}/rest/api/content/search?cql=${encodeURIComponent(cql)}&expand=version`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' }
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
    title,
    space: { key: SPACE_KEY },
    ancestors: [{ id: parentId }],
    body: { storage: { value: content, representation: 'storage' } }
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
    title,
    version: { number: version + 1 },
    body: { storage: { value: content, representation: 'storage' } }
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

  console.log(`Publishing: ${PAGE_TITLE}`);
  if (isDryRun) console.log('[DRY RUN MODE — no API calls will be made]');

  const mdPath = path.join(__dirname, '../36_VALIDATION_DASHBOARD_QA_CRITICAL_TESTS.md');
  if (!fs.existsSync(mdPath)) {
    console.error('ERROR: Source file not found:', mdPath);
    process.exit(1);
  }
  const markdown = fs.readFileSync(mdPath, 'utf-8');
  const confluenceContent = markdownToConfluence(markdown);

  const fullContent = `<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>Dashboard:</strong> Validation | <strong>Version:</strong> 25.4.5.3 | <strong>Total Test Cases:</strong> 72</p>
    <p><strong>QA Owner:</strong> Preeti | <strong>Reference:</strong> Validation Dashboard — Client Onboarding Guide</p>
    <p>72 test cases covering all 9 dashboard pages plus cross-page and global control checks. 8 critical tests are flagged and must pass before any client handoff.</p>
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
<p style="color: #666; font-size: 12px;"><em>Source: 36_VALIDATION_DASHBOARD_QA_CRITICAL_TESTS.md — Maintained by Sprintendo Loan Analytics Team.</em></p>
`;

  if (isDryRun) {
    console.log('\n--- DRY RUN: First 3000 chars of converted Confluence XML ---\n');
    console.log(fullContent.slice(0, 3000));
    console.log('\n--- END DRY RUN ---');
    return;
  }

  const existingPage = await pageExists(PAGE_TITLE, PARENT_PAGE_ID);

  if (existingPage) {
    console.log(`Updating existing page: ${PAGE_TITLE} (ID: ${existingPage.id})`);
    const result = await updatePage(existingPage.id, PAGE_TITLE, fullContent, existingPage.version.number);
    console.log(`Updated — URL: ${baseUrl}/spaces/${SPACE_KEY}/pages/${result.id}`);
  } else {
    console.log(`Creating new page: ${PAGE_TITLE}`);
    const result = await createPage(PAGE_TITLE, fullContent, PARENT_PAGE_ID);
    console.log(`Created — URL: ${baseUrl}/spaces/${SPACE_KEY}/pages/${result.id}`);
  }

  console.log(`\nSuccessfully published "${PAGE_TITLE}" to Confluence!`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
