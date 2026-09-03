import { getConnection } from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const analystId = searchParams.get('analyst_id');
    const recId = searchParams.get('recommendation_id');
    const isPublic = searchParams.get('is_public');

    let client;
    try {
        client = await getConnection();

        let query = `
            SELECT gc.*, 
            json_agg(
                json_build_object(
                    'id', cr.id,
                    'user_name', cr.user_name,
                    'is_analyst', cr.is_analyst,
                    'content', cr.content,
                    'created_at', cr.created_at
                ) ORDER BY cr.created_at ASC
            ) FILTER (WHERE cr.id IS NOT NULL) as replies
            FROM group_comments gc
            LEFT JOIN comment_replies cr ON gc.id = cr.comment_id
            WHERE 1=1
        `;

        const params = [];
        let paramCount = 1;

        if (analystId) {
            query += ` AND gc.analyst_id = $${paramCount}`;
            params.push(analystId);
            paramCount++;
        }

        if (recId) {
            query += ` AND gc.recommendation_id = $${paramCount}`;
            params.push(recId);
            paramCount++;
        }

        if (isPublic !== null && isPublic !== undefined) {
            query += ` AND gc.is_public = $${paramCount}`;
            params.push(isPublic === 'true');
            paramCount++;
        }

        query += ` GROUP BY gc.id ORDER BY gc.created_at DESC`;

        const result = await client.query(query, params);
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
        const { analyst_id, recommendation_id, user_name, plan, content, is_public } = await request.json();

        client = await getConnection();
        const result = await client.query(
            `INSERT INTO group_comments (analyst_id, recommendation_id, user_name, plan, content, is_public)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id`,
            [analyst_id, recommendation_id || null, user_name, plan || 'basic', content, is_public || false]
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
        await client.query(`DELETE FROM group_comments WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}