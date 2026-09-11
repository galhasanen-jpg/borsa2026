import { getConnection } from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const sectorId = searchParams.get('sector_id');

    let client;
    try {
        client = await getConnection();

        let result;
        if (sectorId) {
            result = await client.query(
                `SELECT s.id, s.symbol, s.name, s.name_en, s.isin, s.is_egx30, sec.name as sector, sec.name_en as sector_en
                FROM stocks s
                JOIN sectors sec ON s.sector_id = sec.id
                WHERE s.sector_id = $1
                ORDER BY s.name`,
                [sectorId]
            );
        } else {
            result = await client.query(
                `SELECT s.id, s.symbol, s.name, s.name_en, s.isin, s.is_egx30, sec.name as sector, sec.name_en as sector_en
                FROM stocks s
                JOIN sectors sec ON s.sector_id = sec.id
                ORDER BY sec.id, s.name`
            );
        }

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
        const { symbol, name, name_en, sector_id, isin } = await request.json();
        if (!symbol?.trim() || !name?.trim() || !name_en?.trim() || !sector_id) {
            return Response.json({ error: 'symbol, name, name_en and sector_id are required' }, { status: 400 });
        }

        client = await getConnection();
        const result = await client.query(
            `INSERT INTO stocks (symbol, name, name_en, sector_id, isin)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [symbol.trim().toUpperCase(), name.trim(), name_en.trim(), sector_id, isin?.trim() || null]
        );

        return Response.json({ success: true, id: result.rows[0].id });

    } catch (err) {
        // unique_violation: الرمز مسجّل بالفعل
        if (err.code === '23505') {
            return Response.json({ error: 'رمز السهم موجود بالفعل' }, { status: 409 });
        }
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function PUT(request) {
    let client;
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) {
            return Response.json({ error: 'id required' }, { status: 400 });
        }

        client = await getConnection();

        if ('isin' in body) {
            await client.query(
                `UPDATE stocks SET isin = $1 WHERE id = $2`,
                [body.isin?.trim() || null, id]
            );
        }
        if ('is_egx30' in body) {
            await client.query(
                `UPDATE stocks SET is_egx30 = $1 WHERE id = $2`,
                [!!body.is_egx30, id]
            );
        }

        return Response.json({ success: true });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
