import { getConnection } from '../../lib/db';
import { isAdminRequest } from '../../lib/admin-auth';
import { ensureFundsSchema } from '../../lib/funds-schema';

// بيانات صناديق الاستثمار (اسم، تاريخ إنشاء، طبيعة، رسوم، أيام دخول/خروج...) —
// كلها بتتدخل يدوياً من الأدمن مع مصدر موثّق (source_note)، ومفيش أي رقم أو تاريخ
// يتولّد تلقائياً أو يُخمَّن — لو المعلومة مش موجودة، الحقل بيفضل فاضي بدل ما يتملى برقم غير مؤكد.
const LIST_COLUMNS = `id, name, name_en, fund_type, manager_company, inception_date, currency,
    subscription_fee, redemption_fee, entry_days, exit_days, source_note,
    (prospectus_pdf IS NOT NULL) as has_prospectus, prospectus_filename,
    created_at, updated_at`;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let client;
    try {
        client = await getConnection();
        await ensureFundsSchema(client);

        if (id) {
            const result = await client.query(`SELECT ${LIST_COLUMNS} FROM investment_funds WHERE id = $1`, [id]);
            if (result.rows.length === 0) {
                return Response.json({ error: 'الصندوق غير موجود' }, { status: 404 });
            }
            return Response.json(result.rows[0]);
        }

        const result = await client.query(`SELECT ${LIST_COLUMNS} FROM investment_funds ORDER BY name`);
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
                subscription_fee, redemption_fee, entry_days, exit_days, source_note,
                prospectus_pdf, prospectus_filename)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING id`,
            [f.name, f.name_en || null, f.fund_type, f.manager_company || null, f.inception_date || null, f.currency,
                f.subscription_fee || null, f.redemption_fee || null, f.entry_days || null, f.exit_days || null,
                f.source_note || null, prospectus?.buffer || null, prospectus?.filename || null]
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
                    prospectus_pdf=$12, prospectus_filename=$13, updated_at=now()
                WHERE id=$14`,
                [f.name, f.name_en || null, f.fund_type, f.manager_company || null, f.inception_date || null, f.currency,
                    f.subscription_fee || null, f.redemption_fee || null, f.entry_days || null, f.exit_days || null,
                    f.source_note || null, prospectus.buffer, prospectus.filename, id]
            );
        } else {
            await client.query(
                `UPDATE investment_funds SET
                    name=$1, name_en=$2, fund_type=$3, manager_company=$4, inception_date=$5, currency=$6,
                    subscription_fee=$7, redemption_fee=$8, entry_days=$9, exit_days=$10, source_note=$11,
                    updated_at=now()
                WHERE id=$12`,
                [f.name, f.name_en || null, f.fund_type, f.manager_company || null, f.inception_date || null, f.currency,
                    f.subscription_fee || null, f.redemption_fee || null, f.entry_days || null, f.exit_days || null,
                    f.source_note || null, id]
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
