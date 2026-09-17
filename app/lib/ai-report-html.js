// يحوّل نص تقرير "محلل AI" (شبه-Markdown، نفس صيغة AiReportView.tsx) إلى HTML
// كامل جاهز للطباعة كـ PDF — نسخة سيرفر-سايد بديلة عن المكوّن لأن مسار توليد
// الـ PDF Node route عادي، مش React component.

import { CAIRO_ARABIC_WOFF2_BASE64, CAIRO_LATIN_WOFF2_BASE64 } from './pdf-fonts.js';

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderInline(text) {
    const escaped = escapeHtml(text);
    return escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function parseBlocks(report) {
    const lines = report.replace(/\r\n/g, '\n').split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) { i++; continue; }

        if (trimmed.startsWith('### ')) { blocks.push({ type: 'h3', text: trimmed.slice(4) }); i++; continue; }
        if (trimmed.startsWith('## ')) { blocks.push({ type: 'h2', text: trimmed.slice(3) }); i++; continue; }
        if (trimmed.startsWith('# ')) { blocks.push({ type: 'h1', text: trimmed.slice(2) }); i++; continue; }

        if (trimmed.startsWith('|') && lines[i + 1] && /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim())) {
            const header = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => !(idx === 0 && arr[0] === '') && !(idx === arr.length - 1 && arr[arr.length - 1] === ''));
            const rows = [];
            let j = i + 2;
            while (j < lines.length && lines[j].trim().startsWith('|')) {
                const cells = lines[j].trim().split('|').map(c => c.trim()).filter((_, idx, arr) => !(idx === 0 && arr[0] === '') && !(idx === arr.length - 1 && arr[arr.length - 1] === ''));
                rows.push(cells);
                j++;
            }
            blocks.push({ type: 'table', header, rows });
            i = j;
            continue;
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const items = [];
            let j = i;
            while (j < lines.length && (lines[j].trim().startsWith('- ') || lines[j].trim().startsWith('* '))) {
                items.push(lines[j].trim().slice(2));
                j++;
            }
            blocks.push({ type: 'list', items });
            i = j;
            continue;
        }

        const pLines = [trimmed];
        let j = i + 1;
        while (
            j < lines.length && lines[j].trim() &&
            !lines[j].trim().startsWith('#') && !lines[j].trim().startsWith('|') &&
            !lines[j].trim().startsWith('- ') && !lines[j].trim().startsWith('* ')
        ) {
            pLines.push(lines[j].trim());
            j++;
        }
        blocks.push({ type: 'p', text: pLines.join(' ') });
        i = j;
    }

    return blocks;
}

function blocksToHtml(blocks) {
    return blocks.map(b => {
        if (b.type === 'h1') return `<h2 class="h1">${renderInline(b.text)}</h2>`;
        if (b.type === 'h2') return `<h3 class="h2">${renderInline(b.text)}</h3>`;
        if (b.type === 'h3') return `<h4 class="h3">${renderInline(b.text)}</h4>`;
        if (b.type === 'list') {
            return `<ul>${b.items.map(it => `<li>${renderInline(it)}</li>`).join('')}</ul>`;
        }
        if (b.type === 'table') {
            const head = `<tr>${b.header.map(h => `<th>${renderInline(h)}</th>`).join('')}</tr>`;
            const body = b.rows.map(r => `<tr>${r.map(c => `<td>${renderInline(c)}</td>`).join('')}</tr>`).join('');
            return `<div class="table-wrap"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
        }
        return `<p>${renderInline(b.text)}</p>`;
    }).join('\n');
}

export function reportToPdfHtml({ command, report, createdAt, model, watermarkLines }) {
    const bodyHtml = blocksToHtml(parseBlocks(report));
    const dateStr = createdAt ? new Date(createdAt).toLocaleString('ar-EG') : '';
    const watermarkText = (watermarkLines || []).map(escapeHtml).join(' &nbsp;|&nbsp; ');

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Cairo';
    font-weight: 400 700;
    font-style: normal;
    src: url(data:font/woff2;base64,${CAIRO_ARABIC_WOFF2_BASE64}) format('woff2');
    unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFC, U+200C-200E;
  }
  @font-face {
    font-family: 'Cairo';
    font-weight: 400 700;
    font-style: normal;
    src: url(data:font/woff2;base64,${CAIRO_LATIN_WOFF2_BASE64}) format('woff2');
    unicode-range: U+0000-00FF, U+2000-206F;
  }
  @page { size: A4; margin: 22mm 16mm 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
    direction: rtl;
    text-align: right;
    color: #1a1a1a;
    font-size: 12px;
    line-height: 1.7;
    position: relative;
  }
  .cover {
    text-align: center;
    padding: 60px 20px 30px;
    border-bottom: 3px solid #ea580c;
    margin-bottom: 24px;
  }
  .cover .brand { color: #ea580c; font-weight: bold; font-size: 15px; margin-bottom: 6px; }
  .cover h1 { font-size: 22px; margin: 10px 0; color: #111; }
  .cover .meta { color: #555; font-size: 11px; margin-top: 8px; }
  .h1 { color: #ea580c; font-size: 17px; margin: 22px 0 10px; border-bottom: 1px solid #f0c9a8; padding-bottom: 4px; page-break-after: avoid; }
  .h2 { color: #c2410c; font-size: 14px; margin: 16px 0 8px; page-break-after: avoid; }
  .h3 { color: #9a3412; font-size: 12.5px; margin: 12px 0 6px; page-break-after: avoid; }
  p { margin: 0 0 10px; }
  ul { margin: 0 0 10px; padding-right: 18px; }
  li { margin-bottom: 4px; }
  .table-wrap { margin: 0 0 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  th, td { border: 1px solid #ddd; padding: 5px 7px; text-align: center; }
  th { background: #fdf1e7; color: #9a3412; font-weight: bold; }
  tbody tr:nth-child(even) { background: #fafafa; }
  strong { color: #111; }
  .watermark {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none;
    z-index: 1000;
    transform: rotate(-30deg);
    opacity: 0.08;
    font-size: 15px;
    font-weight: bold;
    color: #000;
    line-height: 5.5;
    text-align: center;
    white-space: pre-wrap;
  }
  .footer-note { margin-top: 24px; padding-top: 10px; border-top: 1px solid #eee; color: #999; font-size: 9px; text-align: center; }
</style>
</head>
<body>
  <div class="watermark">${(watermarkText + ' &nbsp; ').repeat(9)}</div>
  <div class="cover">
    <div class="brand">🤖 بورصة 2026 — محلل AI</div>
    <h1>${escapeHtml(command)}</h1>
    <div class="meta">${escapeHtml(model || '')} ${dateStr ? '— ' + escapeHtml(dateStr) : ''}</div>
  </div>
  ${bodyHtml}
  <div class="footer-note">هذا التقرير تحليل آلي بالذكاء الاصطناعي ولا يُعد توصية استثمارية — بورصة 2026</div>
</body>
</html>`;
}
