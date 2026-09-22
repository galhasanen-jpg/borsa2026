import { getConnection } from '../../../lib/db';
import { isAdminRequest } from '../../../lib/admin-auth';
import { ensureFundsSchema } from '../../../lib/funds-schema';

// استيراد دفعة من ملف تصدير Starta Markets (startamarkets.com/Funds/prices-today) —
// المصدر الوحيد اللي اتلقاه بيجمّع أسعار صناديق مصرية كتير في مكان واحد، وترخيصه
// بيسمح صراحة بالاقتباس مع الإسناد لـ Starta Markets وشركة إدارة الصندوق. كل صندوق
// بيتربط بمعرّف Starta الخاص بيه (external_ref) عشان استيراد ملف أحدث بعدين يحدّث
// نفس الصفوف بدل ما يكرّرها. تاريخ الإنشاء مش موجود في تصدير Starta، فبيفضل فارغ
// (مش بيتخمّن) — الأدمن يقدر يضيفه يدوياً بعد كده لو حابب.

const CATEGORY_LABELS = {
    equity: 'صندوق أسهم',
    balanced: 'صندوق متوازن',
    'fixed-income': 'صندوق دخل ثابت',
    'money-market': 'صندوق نقدي',
    gold: 'صندوق ذهب',
    index: 'صندوق مؤشر',
    sector: 'صندوق قطاعي',
    shariah: 'صندوق متوافق مع الشريعة الإسلامية',
};

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
        const file = form.get('file');
        if (!file || typeof file !== 'object' || file.size === 0) {
            return Response.json({ error: 'يجب اختيار ملف CSV' }, { status: 400 });
        }

        let text = await file.text();
        text = text.replace(/^﻿/, ''); // إزالة BOM
        const allLines = text.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0 && !l.trim().startsWith('#'));

        if (allLines.length < 2) {
            return Response.json({ error: 'الملف فارغ أو مفيهوش صفوف بيانات' }, { status: 400 });
        }

        const header = parseCsvLine(allLines[0]).map(h => h.trim());
        const col = name => header.indexOf(name);
        const idx = {
            fund_id: col('fund_id'), name_en: col('name_en'), name_ar: col('name_ar'),
            category: col('category'), currency: col('currency'), latest_nav: col('latest_nav'),
            nav_as_of: col('nav_as_of'), manager: col('manager'), url: col('url'),
        };
        if (idx.fund_id === -1 || idx.name_ar === -1 || idx.latest_nav === -1 || idx.nav_as_of === -1) {
            return Response.json({ error: 'شكل الملف غير متوقع — الأعمدة المطلوبة (fund_id, name_ar, latest_nav, nav_as_of) غير موجودة' }, { status: 400 });
        }

        const rows = [];
        const errors = [];
        for (let i = 1; i < allLines.length; i++) {
            const cells = parseCsvLine(allLines[i]);
            const fundExtId = cells[idx.fund_id];
            const nameAr = cells[idx.name_ar];
            const navDate = cells[idx.nav_as_of];
            const navValue = cells[idx.latest_nav];

            if (!fundExtId || !nameAr) { errors.push({ line: i + 1, reason: 'صف ناقص fund_id أو name_ar' }); continue; }
            if (!navDate || !DATE_RE.test(navDate)) { errors.push({ line: i + 1, reason: `تاريخ NAV غير صالح: "${navDate || ''}"` }); continue; }
            if (!navValue || isNaN(Number(navValue))) { errors.push({ line: i + 1, reason: `قيمة NAV غير صالحة: "${navValue || ''}"` }); continue; }

            const category = idx.category >= 0 ? cells[idx.category] : '';
            const url = idx.url >= 0 ? cells[idx.url] : '';
            rows.push({
                externalRef: `starta:${fundExtId}`,
                name: nameAr,
                nameEn: idx.name_en >= 0 ? cells[idx.name_en] || null : null,
                fundType: CATEGORY_LABELS[category] || (category ? category : 'غير مصنّف'),
                manager: idx.manager >= 0 ? cells[idx.manager] || null : null,
                currency: idx.currency >= 0 ? cells[idx.currency] || 'EGP' : 'EGP',
                navDate,
                navValue: Number(navValue),
                sourceNote: url
                    ? `Starta Markets — ${url} (بإسناد Starta Markets وشركة إدارة الصندوق، وفق ترخيص الاستخدام الحر بالإسناد المذكور في ملف المصدر)`
                    : 'Starta Markets (بإسناد Starta Markets وشركة إدارة الصندوق)',
            });
        }

        if (rows.length === 0) {
            return Response.json({ error: 'لا توجد صفوف صالحة في الملف', errors }, { status: 400 });
        }

        client = await getConnection();
        await ensureFundsSchema(client);

        let created = 0, updated = 0, navPoints = 0;
        await client.query('BEGIN');
        try {
            for (const row of rows) {
                const existing = await client.query(`SELECT id FROM investment_funds WHERE external_ref = $1`, [row.externalRef]);
                let fundId;
                if (existing.rows.length > 0) {
                    fundId = existing.rows[0].id;
                    await client.query(
                        `UPDATE investment_funds SET name=$1, name_en=$2, fund_type=$3, manager_company=$4,
                            currency=$5, source_note=$6, updated_at=now() WHERE id=$7`,
                        [row.name, row.nameEn, row.fundType, row.manager, row.currency, row.sourceNote, fundId]
                    );
                    updated++;
                } else {
                    const inserted = await client.query(
                        `INSERT INTO investment_funds (name, name_en, fund_type, manager_company, currency, source_note, external_ref)
                        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
                        [row.name, row.nameEn, row.fundType, row.manager, row.currency, row.sourceNote, row.externalRef]
                    );
                    fundId = inserted.rows[0].id;
                    created++;
                }

                await client.query(
                    `INSERT INTO fund_nav_history (fund_id, nav_date, value, source_note)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (fund_id, nav_date) DO UPDATE SET value = EXCLUDED.value, source_note = EXCLUDED.source_note`,
                    [fundId, row.navDate, row.navValue, row.sourceNote]
                );
                navPoints++;
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }

        return Response.json({ success: true, created, updated, navPoints, skipped: errors.length, errors });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
