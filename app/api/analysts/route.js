import { getConnection } from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let client;
    try {
        client = await getConnection();

        if (id) {
            const result = await client.query(
                `SELECT a.*, 
                COUNT(r.id) as total_recommendations,
                COUNT(CASE WHEN r.status = 'success' THEN 1 END) as successful,
                COUNT(CASE WHEN r.status = 'failed' THEN 1 END) as failed,
                COUNT(CASE WHEN r.status = 'open' THEN 1 END) as open_recs
                FROM analysts a
                LEFT JOIN recommendations r ON a.id = r.analyst_id AND r.approved = true
                WHERE a.id = $1
                GROUP BY a.id`,
                [id]
            );
            if (result.rows.length === 0) {
                return Response.json({ error: 'not found' }, { status: 404 });
            }
            return Response.json(result.rows[0]);
        }

        const result = await client.query(
            `SELECT a.*, 
            COUNT(r.id) as total_recommendations,
            COUNT(CASE WHEN r.status = 'success' THEN 1 END) as successful,
            COUNT(CASE WHEN r.status = 'open' THEN 1 END) as open_recs
            FROM analysts a
            LEFT JOIN recommendations r ON a.id = r.analyst_id AND r.approved = true
            WHERE a.status = 'active'
            GROUP BY a.id
            ORDER BY a.created_at DESC`
        );
        return Response.json(result.rows);

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function POST(request) {
    let client;
    try {
        const { name, name_en, bio, bio_en, specialization, avatar_url, whatsapp_link, telegram_link } = await request.json();

        client = await getConnection();
        const result = await client.query(
            `INSERT INTO analysts (name, name_en, bio, bio_en, specialization, avatar_url, whatsapp_link, telegram_link, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
            RETURNING id`,
            [name, name_en || '', bio || '', bio_en || '', specialization || '', avatar_url || '', whatsapp_link || '', telegram_link || '']
        );

        return Response.json({ success: true, id: result.rows[0].id });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function PUT(request) {
    let client;
    try {
        const { id, status, ...data } = await request.json();

        client = await getConnection();
        await client.query(
            `UPDATE analysts SET 
            name = $1, bio = $2, specialization = $3, 
            avatar_url = $4, whatsapp_link = $5, telegram_link = $6,
            status = $7
            WHERE id = $8`,
            [data.name, data.bio, data.specialization, data.avatar_url, data.whatsapp_link, data.telegram_link, status, id]
        );

        return Response.json({ success: true });

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
        await client.query(`DELETE FROM analysts WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}