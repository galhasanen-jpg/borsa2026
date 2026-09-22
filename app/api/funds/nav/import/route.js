import { getConnection } from '../../../../lib/db';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { ensureFundsSchema } from '../../../../lib/funds-schema';

// استيراد دفعة من نقاط "قيمة الوثيقة" مرة واحدة من ملف CSV بدل إدخال كل نقطة
// يدوياً — التنسيق المتوقع: تاريخ, قيمة, مصدر (اختياري) — نفس مبدأ عدم التخمين:
// أي صف تاريخ/قيمة فيه غير صالح بيتسجّل كخطأ ومايتوقفش الاستيراد كله بسببه

function parseCsvLine(line) {
    const cells = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
            else if (ch === '"') { inQuotes = false; }
            else { cur += ch; }
        } else {
            if (ch === '"') inQuotes = true;
            else if (ch === ',') { cells.push(cur); cur = ''; }
            else cur += ch;
        }
    }
    cells.push(cur);
    return cells.map(c => c.trim());
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request) {
    if (!isAdminRequest(request)) {
        return Response.json({ error: 'غير مصرح' }, { status: 401 });
    }

    let client;
    try {
        const form = await request.formData();
        const fundId = (form.get('fund_id') || '').toString();
        const file = form.get('file');

        if (!fundId) {
            return Response.json({ error: 'معرّف صندوق غير صالح' }, { status: 400 });
        }
        if (!file || typeof file !== 'object' || file.size === 0) {
            return Response.json({ error: 'يجب اختيار ملف CSV' }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);

        const rows = [];
        const errors = [];
        lines.forEach((line, idx) => {
            const cells = parseCsvLine(line);
            const [rawDate, rawValue, rawSource] = cells;

            // تجاهل صف العناوين لو أول صف والقيمة مش رقم (مثال: "التاريخ,القيمة,المصدر")
            if (idx === 0 && rawValue != null && isNaN(Number(rawValue))) return;

            if (!rawDate || !DATE_RE.test(rawDate)) {
                errors.push({ line: idx + 1, reason: `تاريخ غير صالح: "${rawDate || ''}" (المتوقع YYYY-MM-DD)` });
                return;
            }
            if (rawValue == null || rawValue === '' || isNaN(Number(rawValue))) {
                errors.push({ line: idx + 1, reason: `قيمة غير صالحة: "${rawValue || ''}"` });
                return;
            }
            rows.push({ date: rawDate, value: Number(rawValue), source: rawSource?.trim() || null });
        });

        if (rows.length === 0) {
            return Response.json({ error: 'لا توجد صفوف صالحة في الملف', errors }, { status: 400 });
        }

        client = await getConnection();
        await ensureFundsSchema(client);

        await client.query('BEGIN');
        let imported = 0;
        try {
            for (const row of rows) {
                await client.query(
                    `INSERT INTO fund_nav_history (fund_id, nav_date, value, source_note)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (fund_id, nav_date) DO UPDATE SET value = EXCLUDED.value, source_note = EXCLUDED.source_note`,
                    [fundId, row.date, row.value, row.source]
                );
                imported++;
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }

        return Response.json({ success: true, imported, skipped: errors.length, errors });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
