import { getConnection } from '../../lib/db';

// تُستخدم فقط أول مرة (لزرع الجدول عند إنشائه) أو إذا تعذّر الوصول لقاعدة البيانات مؤقتاً
const DEFAULT_STOCKS = [
    { name: 'أبوظبي الإسلامي', name_en: 'ADIB Egypt', symbol: 'ADIB.CA' },
    { name: 'العربية للأسمنت', name_en: 'Arabian Cement', symbol: 'ARCC.CA' },
    { name: 'بلتون المالية', name_en: 'Beltone Financial', symbol: 'BTFH.CA' },
    { name: 'راميدا', name_en: 'Ramda', symbol: 'RMDA.CA' },
    { name: 'أوراسكوم للتنمية', name_en: 'Orascom Development', symbol: 'ORHD.CA' },
    { name: 'المنصورة للدواجن', name_en: 'Mansoura Poultry', symbol: null },
];

export async function GET() {
    let client;
    try {
        client = await getConnection();

        let result = await client.query(
            `SELECT id, name, name_en, symbol FROM briefing_stocks ORDER BY id ASC`
        );

        // أول استخدام: نزرع القائمة الافتراضية مرة واحدة فقط إذا كان الجدول فارغاً
        if (result.rows.length === 0) {
            for (const s of DEFAULT_STOCKS) {
                await client.query(
                    `INSERT INTO briefing_stocks (name, name_en, symbol) VALUES ($1, $2, $3)`,
                    [s.name, s.name_en, s.symbol]
                );
            }
            result = await client.query(
                `SELECT id, name, name_en, symbol FROM briefing_stocks ORDER BY id ASC`
            );
        }

        return Response.json(result.rows);

    } catch (err) {
        // قاعدة البيانات غير متاحة؛ نعرض القائمة الافتراضية بدون حفظ حتى يبقى القسم يعمل
        return Response.json(DEFAULT_STOCKS.map((s, i) => ({ id: -(i + 1), ...s })));
    } finally {
        if (client) client.release();
    }
}

export async function POST(request) {
    let client;
    try {
        const { name, name_en, symbol } = await request.json();
        if (!name || !name.trim()) {
            return Response.json({ error: 'name required' }, { status: 400 });
        }

        client = await getConnection();
        const result = await client.query(
            `INSERT INTO briefing_stocks (name, name_en, symbol)
            VALUES ($1, $2, $3) RETURNING id, name, name_en, symbol`,
            [name.trim(), name_en?.trim() || null, symbol?.trim() || null]
        );

        return Response.json(result.rows[0]);

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let client;
    try {
        client = await getConnection();
        await client.query(`DELETE FROM briefing_stocks WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
