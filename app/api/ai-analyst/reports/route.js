import { getConnection } from '../../../lib/db';
import { isAdminRequest } from '../../../lib/admin-auth';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = Math.min(parseInt(searchParams.get('limit')) || 30, 100);

    let client;
    try {
        client = await getConnection();

        if (id) {
            const result = await client.query(
                `SELECT id, command, report, model, created_at FROM ai_analyst_reports WHERE id = $1`,
                [id]
            );
            if (result.rows.length === 0) {
                return Response.json({ error: 'not found' }, { status: 404 });
            }
            return Response.json(result.rows[0]);
        }

        const result = await client.query(
            `SELECT id, command, report, model, created_at FROM ai_analyst_reports ORDER BY created_at DESC LIMIT $1`,
            [limit]
        );
        return Response.json(result.rows);
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
        await client.query(`DELETE FROM ai_analyst_reports WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
