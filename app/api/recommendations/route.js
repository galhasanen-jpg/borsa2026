import { getConnection } from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const analystId = searchParams.get('analyst_id');
    const status = searchParams.get('status');
    const approved = searchParams.get('approved');

    let client;
    try {
        client = await getConnection();

        let query = `
            SELECT r.*, a.name as analyst_name, a.avatar_url,
            COALESCE(AVG(rr.rating), 0) as avg_rating,
            COUNT(rr.id) as rating_count
            FROM recommendations r
            JOIN analysts a ON r.analyst_id = a.id
            LEFT JOIN rec_ratings rr ON r.id = rr.recommendation_id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (analystId) {
            query += ` AND r.analyst_id = $${paramCount}`;
            params.push(analystId);
            paramCount++;
        }

        if (status) {
            query += ` AND r.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (approved !== null && approved !== undefined) {
            query += ` AND r.approved = $${paramCount}`;
            params.push(approved === 'true');
            paramCount++;
        }

        query += ` GROUP BY r.id, a.name, a.avatar_url ORDER BY r.created_at DESC`;

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
        const {
            analyst_id, symbol, stock_name, type,
            entry_price, target_price, stop_loss,
            duration, description, approved
        } = await request.json();

        client = await getConnection();
        const result = await client.query(
            `INSERT INTO recommendations 
            (analyst_id, symbol, stock_name, type, entry_price, target_price, stop_loss, duration, description, approved, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'open')
            RETURNING id`,
            [analyst_id, symbol, stock_name || '', type, entry_price, target_price || null, stop_loss || null, duration || 'medium', description || '', approved || false]
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
        const { id, status, result_price, approved, ...data } = await request.json();

        client = await getConnection();

        if (status === 'success' || status === 'failed' || status === 'cancelled') {
            await client.query(
                `UPDATE recommendations SET 
                status = $1, result_price = $2, closed_at = NOW(),
                approved = $3
                WHERE id = $4`,
                [status, result_price || null, approved !== undefined ? approved : true, id]
            );
        } else {
            await client.query(
                `UPDATE recommendations SET 
                symbol = $1, stock_name = $2, type = $3,
                entry_price = $4, target_price = $5, stop_loss = $6,
                duration = $7, description = $8, approved = $9
                WHERE id = $10`,
                [data.symbol, data.stock_name, data.type, data.entry_price, data.target_price, data.stop_loss, data.duration, data.description, approved !== undefined ? approved : false, id]
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let client;
    try {
        client = await getConnection();
        await client.query(`DELETE FROM recommendations WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}