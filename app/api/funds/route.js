import { getConnection } from '../../lib/db';
import { isAdminRequest } from '../../lib/admin-auth';
import { ensureFundsSchema } from '../../lib/funds-schema';

// بيانات صناديق الاستثمار (اسم، تاريخ إنشاء، طبيعة، رسوم، أيام دخول/خروج...) —
// كلها بتتدخل يدوياً من الأدمن مع مصدر موثّق (source_note)، ومفيش أي رقم أو تاريخ
// يتولّد تلقائياً أو يُخمَّن — لو المعلومة مش موجودة، الحقل بيفضل فاضي بدل ما يتملى برقم غير مؤكد.
const LIST_COLUMNS = `f.id, f.name, f.name_en, f.fund_type, f.manager_company, f.inception_date, f.currency,
    f.subscription_fee, f.redemption_fee, f.entry_days, f.exit_days, f.source_note, f.risk_level,
    f.license_info, f.prospectus_url,
    (f.prospectus_pdf IS NOT NULL) as has_prospectus, f.prospectus_filename,
    f.created_at, f.updated_at,
    nav.value as latest_nav_value, nav.nav_date as latest_nav_date`;

// آخر قيمة وثيقة مسجّلة لكل صندوق (عرضها بجوار الاسم في القائمة عشان المستخدم يعرف فيه
// بيانات فعلية قبل ما يفتح صفحة التفاصيل) — LEFT JOIN LATERAL يرجّع null لو مفيش أي نقطة
// مسجّلة، وده بيتحول في الواجهة لـ"لا توجد بيانات متوفرة" بدل ما يتخيّل رقم
const FROM_WITH_LATEST_NAV = `investment_funds f
    LEFT JOIN LATERAL (
        SELECT value, to_char(nav_date, 'YYYY-MM-DD') as nav_date FROM fund_nav_history h
        WHERE h.fund_id = f.id ORDER BY nav_date DESC LIMIT 1
    ) nav ON true`;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let client;
    try {
        client = await getConnection();
        await ensureFundsSchema(client);

        if (id) {
            const result = await client.query(`SELECT ${LIST_COLUMNS} FROM ${FROM_WITH_LATEST_NAV} WHERE f.id = $1`, [id]);
            if (result.rows.length === 0) {
                return Response.json({ error: 'الصندوق غير موجود' }, { status: 404 });
            }
            return Response.json(result.rows[0]);
        }

        const result = await client.query(`SELECT ${LIST_COLUMNS} FROM ${FROM_WITH_LATEST_NAV} ORDER BY f.name`);
        return Response.json(result.rows);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

function readFundForm(form) {
    return {
        name: (form.get('name') || '').toString().trim(),
        name_en: (form.get('name_en') || '').toString().trim(),
        fund_type: (form.get('fund_type') || '').toString().trim(),
        manager_company: (form.get('manager_company') || '').toString().trim(),
        inception_date: (form.get('inception_date') || '').toString().trim(),
        currency: (form.get('currency') || 'EGP').toString().trim(),
        subscription_fee: (form.get('subscription_fee') || '').toString().trim(),
        redemption_fee: (form.get('redemption_fee') || '').toString().trim(),
        entry_days: (form.get('entry_days') || '').toString().trim(),
        exit_days: (form.get('exit_days') || '').toString().trim(),
        source_note: (form.get('source_note') || '').toString().trim(),
        risk_level: (form.get('risk_level') || '').toString().trim(),
        license_info: (form.get('license_info') || '').toString().trim(),
        prospectus_url: (form.get('prospectus_url') || '').toString().trim(),
    };
}

async function readProspectus(form) {
    const file = form.get('prospectus');
    if (!file || typeof file !== 'object' || file.size === 0) return null;
    if (file.type !== 'application/pdf') {
        throw new Error('نشرة الإصدار لازم تكون ملف PDF');
    }
    const arrayBuffer = await file.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), filename: file.name || 'prospectus.pdf' };
}

export async function POST(request) {
    if (!isAdminRequest(request)) {
        return Response.json({ error: 'غير مصرح' }, { status: 401 });
    }

    let client;
    try {
        const form = await request.formData();
        const f = readFundForm(form);
        if (!f.name || !f.fund_type) {
            return Response.json({ error: 'اسم الصندوق وطبيعته حقول مطلوبة' }, { status: 400 });
        }

        let prospectus;
        try {
            prospectus = await readProspectus(form);
        } catch (err) {
            return Response.json({ error: err.message }, { status: 400 });
        }

        client = await getConnection();
        await ensureFundsSchema(client);
        const result = await client.query(
            `INSERT INTO investment_funds
                (name, name_en, fund_type, manager_company, inception_date, currency,
                subscription_fee, redemption_fee, entry_days, exit_days, source_note, risk_level,
                license_info, prospectus_url, prospectus_pdf, prospectus_filename)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            RETURNING id`,
            [f.name, f.name_en || null, f.fund_type, f.manager_company || null, f.inception_date || null, f.currency,
                f.subscription_fee || null, f.redemption_fee || null, f.entry_days || null, f.exit_days || null,
                f.source_note || null, f.risk_level || null, f.license_info || null, f.prospectus_url || null,
                prospectus?.buffer || null, prospectus?.filename || null]
        );

        return Response.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function PUT(request) {
    if (!isAdminRequest(request)) {
        return Response.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
        return Response.json({ error: 'missing id' }, { status: 400 });
    }

    let client;
    try {
        const form = await request.formData();
        const f = readFundForm(form);
        if (!f.name || !f.fund_type) {
            return Response.json({ error: 'اسم الصندوق وطبيعته حقول مطلوبة' }, { status: 400 });
        }

        let prospectus;
        try {
            prospectus = await readProspectus(form);
        } catch (err) {
            return Response.json({ error: err.message }, { status: 400 });
        }

        client = await getConnection();
        await ensureFundsSchema(client);

        if (prospectus) {
            await client.query(
                `UPDATE investment_funds SET
                    name=$1, name_en=$2, fund_type=$3, manager_company=$4, inception_date=$5, currency=$6,
                    subscription_fee=$7, redemption_fee=$8, entry_days=$9, exit_days=$10, source_note=$11,
                    risk_level=$12, license_info=$13, prospectus_url=$14,
                    prospectus_pdf=$15, prospectus_filename=$16, updated_at=now()
                WHERE id=$17`,
                [f.name, f.name_en || null, f.fund_type, f.manager_company || null, f.inception_date || null, f.currency,
                    f.subscription_fee || null, f.redemption_fee || null, f.entry_days || null, f.exit_days || null,
                    f.source_note || null, f.risk_level || null, f.license_info || null, f.prospectus_url || null,
                    prospectus.buffer, prospectus.filename, id]
            );
        } else {
            await client.query(
                `UPDATE investment_funds SET
                    name=$1, name_en=$2, fund_type=$3, manager_company=$4, inception_date=$5, currency=$6,
                    subscription_fee=$7, redemption_fee=$8, entry_days=$9, exit_days=$10, source_note=$11,
                    risk_level=$12, license_info=$13, prospectus_url=$14, updated_at=now()
                WHERE id=$15`,
                [f.name, f.name_en || null, f.fund_type, f.manager_company || null, f.inception_date || null, f.currency,
                    f.subscription_fee || null, f.redemption_fee || null, f.entry_days || null, f.exit_days || null,
                    f.source_note || null, f.risk_level || null, f.license_info || null, f.prospectus_url || null, id]
            );
        }

        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function DELETE(request) {
    if (!isAdminRequest(request)) {
        return Response.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
        return Response.json({ error: 'missing id' }, { status: 400 });
    }

    let client;
    try {
        client = await getConnection();
        await ensureFundsSchema(client);
        await client.query(`DELETE FROM investment_funds WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
