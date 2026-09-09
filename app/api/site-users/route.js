import { getConnection } from '../../lib/db';

// إدارة حسابات الزوار (موافقة/رفض) — تُستدعى من لوحة /admin المحمية بـ HTTP Basic Auth
export async function GET() {
    let client;
    try {
        client = await getConnection();
        const result = await client.query(
            `SELECT id, name, email, status, created_at FROM site_users ORDER BY created_at DESC`
        );
        return Response.json(result.rows);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function PUT(request) {
    let client;
    try {
        const { id, action } = await request.json();
        client = await getConnection();

        if (action === 'approve') {
            await client.query(`UPDATE site_users SET status = 'active' WHERE id = $1`, [id]);
        } else if (action === 'reject') {
            await client.query(`UPDATE site_users SET status = 'rejected' WHERE id = $1`, [id]);
        } else {
            return Response.json({ error: 'action required' }, { status: 400 });
        }

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
        await client.query(`DELETE FROM site_users WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
