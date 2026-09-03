import { getConnection } from '../../lib/db';

export async function POST(request) {
    let client;
    try {
        const { comment_id, user_name, is_analyst, content } = await request.json();

        client = await getConnection();
        const result = await client.query(
            `INSERT INTO comment_replies (comment_id, user_name, is_analyst, content)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [comment_id, user_name, is_analyst || false, content]
        );

        return Response.json({ success: true, id: result.rows[0].id });

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
        await client.query(`DELETE FROM comment_replies WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}