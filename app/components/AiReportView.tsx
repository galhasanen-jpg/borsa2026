'use client';

// عرض منسّق لتقرير "محلل AI" (نص شبه-Markdown) بدل النص الخام — بعناوين وجداول
// واضحة، ومحمي بمنع التحديد/النسخ ومنع الزر الأيمن. هذا رادع وليس منعاً مطلقاً:
// أي محتوى معروض في متصفح يقدر حد ياخده screenshot، لكنه بيشيل أسهل طرق النسخ
// (تحديد النص، الزر الأيمن، عرض المصدر مباشرة كنص عادي).

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

type Block =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'list'; items: string[] }
  | { type: 'p'; text: string };

function parseBlocks(report: string): Block[] {
  const lines = report.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) });
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) });
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.slice(2) });
      i++;
      continue;
    }

    // جدول Markdown: سطر يبدأ بـ | يليه سطر فاصل (---|---)
    if (trimmed.startsWith('|') && lines[i + 1] && /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim())) {
      const header = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => !(idx === 0 && arr[0] === '') && !(idx === arr.length - 1 && arr[arr.length - 1] === ''));
      const rows: string[][] = [];
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
      const items: string[] = [];
      let j = i;
      while (j < lines.length && (lines[j].trim().startsWith('- ') || lines[j].trim().startsWith('* '))) {
        items.push(lines[j].trim().slice(2));
        j++;
      }
      blocks.push({ type: 'list', items });
      i = j;
      continue;
    }

    // فقرة: اجمع الأسطر المتتالية حتى سطر فاضي أو بداية بلوك تاني
    const pLines: string[] = [trimmed];
    let j = i + 1;
    while (
      j < lines.length &&
      lines[j].trim() &&
      !lines[j].trim().startsWith('#') &&
      !lines[j].trim().startsWith('|') &&
      !lines[j].trim().startsWith('- ') &&
      !lines[j].trim().startsWith('* ')
    ) {
      pLines.push(lines[j].trim());
      j++;
    }
    blocks.push({ type: 'p', text: pLines.join(' ') });
    i = j;
  }

  return blocks;
}

export default function AiReportView({ report }: { report: string }) {
  const blocks = parseBlocks(report);

  return (
    <div
      className="ai-report-view text-gray-200 text-sm leading-relaxed"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      onContextMenu={e => e.preventDefault()}
    >
      {blocks.map((b, i) => {
        if (b.type === 'h1') return <h2 key={i} className="text-orange-500 font-bold text-lg mt-4 mb-2 first:mt-0">{renderInline(b.text, `${i}`)}</h2>;
        if (b.type === 'h2') return <h3 key={i} className="text-orange-500 font-bold text-base mt-4 mb-2">{renderInline(b.text, `${i}`)}</h3>;
        if (b.type === 'h3') return <h4 key={i} className="text-orange-400 font-bold text-sm mt-3 mb-1.5">{renderInline(b.text, `${i}`)}</h4>;
        if (b.type === 'list') {
          return (
            <ul key={i} className="list-disc pr-5 mb-3 space-y-1">
              {b.items.map((it, k) => <li key={k}>{renderInline(it, `${i}-${k}`)}</li>)}
            </ul>
          );
        }
        if (b.type === 'table') {
          return (
            <div key={i} className="overflow-x-auto mb-3">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    {b.header.map((h, k) => (
                      <th key={k} className="bg-gray-800 text-orange-400 border border-gray-700 px-2 py-1.5 text-center whitespace-nowrap">{renderInline(h, `${i}-h${k}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((r, k) => (
                    <tr key={k} className={k % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'}>
                      {r.map((c, m) => (
                        <td key={m} className="border border-gray-800 px-2 py-1.5 text-center">{renderInline(c, `${i}-${k}-${m}`)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={i} className="mb-3">{renderInline(b.text, `${i}`)}</p>;
      })}
    </div>
  );
}
