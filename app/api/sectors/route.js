import { getConnection } from '../../lib/db';

export async function GET() {
    let client;
    try {
        client = await getConnection();
        const result = await client.query(
            `SELECT id, name, name_en FROM sectors ORDER BY id`
        );
        return Response.json(result.rows);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}