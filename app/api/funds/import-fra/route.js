import { getConnection } from '../../../lib/db';
import { isAdminRequest } from '../../../lib/admin-auth';
import { ensureFundsSchema } from '../../../lib/funds-schema';

// استيراد من صفحات محفوظة (HTML) لقائمة "نشرات اكتتاب / مذكرات معلومات" على fra.gov.eg
// (الهيئة العامة للرقابة المالية) — الموقع محجوب من بيئة السيرفر فمفيش وسيلة لجلبه مباشرة،
// فالأدمن بيحفظ صفحات النتائج (Ctrl+S، "Webpage, Complete") ويرفعها هنا. كل صف بيدّينا:
// اسم الصندوق، رقم/سنة الترخيص أو الموافقة، ورابط نشرة الاكتتاب الرسمية (PDF على fra.gov.eg).
//
// مفيش رسوم اشتراك/استرداد ولا أيام دخول/خروج في الصفحة دي أصلاً — مش هنخترعها.
// وبعض الصفوف مجرد "موافقة الهيئة رقم كذا" بدون اسم صندوق واضح (تعميمات عامة) — دي بنتجاهلها
// تماماً لأننا مش هنقدر نربطها بصندوق معيّن من غير تخمين.
//
// الربط بصندوق موجود عندنا بيتم بمطابقة الاسم (تشابه الكلمات المشتركة، Jaccard) — بعتبة عالية
// (0.55) نسبياً لتقليل خطر ربط نشرة صندوق بصندوق تاني غلط. أي صف معندوش تطابق واثق بيتسجّل
// في "unmatched" عشان الأدمن يراجعه يدوياً، مش بيتم تجاهله بصمت.

function stripTags(html) {
    return html.replace(/<[^>]+>/g, ' ');
}

function decodeEntities(s) {
    return s
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#8211;/g, '–')
        .replace(/&#8217;/g, '’')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

const LI_RE = /<li class="pdf">([\s\S]*?)<\/li>/g;
const A_RE = /<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/;
const P_RE = /<p>([\s\S]*?)<\/p>/;
const REF_RE = /(ترخيص|موافقة) الهيئة رقم\s*\(?(\d+)\)?\s*لعام\s*(\d{4})|(ترخيص|موافقة) الهيئة رقم\s*\(?(\d+)\)?\s*لسنة\s*(\d{4})/;

function cleanText(raw) {
    return decodeEntities(raw.replace(/ـ/g, '').replace(/\s+/g, ' ')).trim();
}

function parseFraHtml(html) {
    const entries = [];
    let m;
    LI_RE.lastIndex = 0;
    while ((m = LI_RE.exec(html))) {
        const block = m[1];
        const aMatch = A_RE.exec(block);
        if (!aMatch) continue;
        const url = decodeEntities(aMatch[1]);
        const name = cleanText(stripTags(aMatch[2]));
        if (!name.startsWith('صندوق')) continue; // تعميم عام بدون اسم صندوق — نتجاهله

        const pMatch = P_RE.exec(block);
        const pText = pMatch ? cleanText(stripTags(pMatch[1])) : '';
        const refMatch = REF_RE.exec(pText) || REF_RE.exec(name);
        let licenseInfo = null;
        if (refMatch) {
            const groups = refMatch.slice(1).filter(Boolean);
            const [kind, num, year] = groups;
            licenseInfo = `${kind} الهيئة رقم ${num} لسنة ${year} (fra.gov.eg)`;
        }
        entries.push({ name, url, licenseInfo });
    }
    return entries;
}

// تطبيع مبسّط للعربي (توحيد الألف/التاء المربوطة/الياء، إزالة علامات الترقيم) عشان
// المطابقة تتجاوز فروق الإملاء الشائعة بين مصادر مختلفة لنفس اسم الصندوق
function normalize(s) {
    return s
        .replace(/[إأآا]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const STOPWORDS = new Set(['صندوق', 'استثمار', 'إستثمار', 'في', 'من', 'ذو', 'ذات', 'مع', 'و', 'ال']);

function tokens(s) {
    return new Set(normalize(s).split(' ').filter(w => w.length > 1 && !STOPWORDS.has(w)));
}

function jaccard(a, b) {
    const ta = tokens(a), tb = tokens(b);
    if (ta.size === 0 || tb.size === 0) return 0;
    let inter = 0;
    for (const w of ta) if (tb.has(w)) inter++;
    const union = ta.size + tb.size - inter;
    return union === 0 ? 0 : inter / union;
}

const MATCH_THRESHOLD = 0.55;

export async function POST(request) {
    if (!isAdminRequest(request)) {
        return Response.json({ error: 'غير مصرح' }, { status: 401 });
    }

    let client;
    try {
        const form = await request.formData();
        const files = form.getAll('files').filter(f => f && typeof f === 'object' && f.size > 0);
        if (files.length === 0) {
            return Response.json({ error: 'يجب اختيار ملف HTML واحد على الأقل' }, { status: 400 });
        }

        const seen = new Map(); // name -> entry (يشيل التكرار لو نفس الصندوق ظهر في أكتر من صفحة)
        for (const file of files) {
            const html = await file.text();
            for (const entry of parseFraHtml(html)) {
                seen.set(entry.name, entry);
            }
        }
        const parsedEntries = [...seen.values()];
        if (parsedEntries.length === 0) {
            return Response.json({ error: 'لم يتم العثور على أي صفوف صناديق صالحة في الملفات المرفوعة — تأكد إنها نفس صفحة "نشرات اكتتاب / مذكرات معلومات" بتصنيف صناديق استثمار' }, { status: 400 });
        }

        client = await getConnection();
        await ensureFundsSchema(client);

        const fundsResult = await client.query(`SELECT id, name, license_info, prospectus_url FROM investment_funds`);
        const existingFunds = fundsResult.rows;

        let matched = 0, filled = 0;
        const unmatched = [];

        for (const entry of parsedEntries) {
            let best = null, bestScore = 0;
            for (const f of existingFunds) {
                const score = jaccard(entry.name, f.name);
                if (score > bestScore) { bestScore = score; best = f; }
            }

            if (!best || bestScore < MATCH_THRESHOLD) {
                unmatched.push(entry.name);
                continue;
            }

            matched++;
            if (best.license_info && best.prospectus_url) continue; // عنده البيانات دي بالفعل

            await client.query(
                `UPDATE investment_funds SET
                    license_info = COALESCE(license_info, $1),
                    prospectus_url = COALESCE(prospectus_url, $2),
                    updated_at = now()
                WHERE id = $3`,
                [entry.licenseInfo, entry.url, best.id]
            );
            filled++;
        }

        return Response.json({
            success: true,
            totalParsed: parsedEntries.length,
            matched,
            filled,
            unmatched,
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
