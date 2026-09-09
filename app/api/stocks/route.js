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
                `SELECT s.id, s.symbol, s.name, s.name_en, s.isin, sec.name as sector, sec.name_en as sector_en
                FROM stocks s
                JOIN sectors sec ON s.sector_id = sec.id
                WHERE s.sector_id = $1
                ORDER BY s.name`,
                [sectorId]
            );
        } else {
            result = await client.query(
                `SELECT s.id, s.symbol, s.name, s.name_en, s.isin, sec.name as sector, sec.name_en as sector_en
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

export async function PUT(request) {
    let client;
    try {
        const { id, isin } = await request.json();
        if (!id) {
            return Response.json({ error: 'id required' }, { status: 400 });
        }

        client = await getConnection();
        await client.query(
            `UPDATE stocks SET isin = $1 WHERE id = $2`,
            [isin?.trim() || null, id]
        );

        return Response.json({ success: true });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
