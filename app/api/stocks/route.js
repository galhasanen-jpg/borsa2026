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
                `SELECT s.id, s.symbol, s.name, s.name_en, sec.name as sector, sec.name_en as sector_en
                FROM stocks s
                JOIN sectors sec ON s.sector_id = sec.id
                WHERE s.sector_id = $1
                ORDER BY s.name`,
                [sectorId]
            );
        } else {
            result = await client.query(
                `SELECT s.id, s.symbol, s.name, s.name_en, sec.name as sector, sec.name_en as sector_en
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