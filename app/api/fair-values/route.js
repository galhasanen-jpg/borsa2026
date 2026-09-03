import { getConnection } from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const name = searchParams.get('name') || '';
    const mode = searchParams.get('mode') || 'db';

    // جلب من Google News
    if (mode === 'news') {
        try {
            const query = encodeURIComponent(`${name} ${symbol} القيمة العادلة توصية`);
            const url = `https://news.google.com/rss/search?q=${query}&hl=ar&gl=EG&ceid=EG:ar`;

            const res = await fetch(url, { cache: 'no-store' });
            const xml = await res.text();

            const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

            const news = items.map(item => {
                const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
                    ?.replace(/<!\[CDATA\[|\]\]>/g, '')
                    ?.replace(/&amp;/g, '&')
                    ?.replace(/&quot;/g, '"') || '';

                const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
                const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
                const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]
                    ?.replace(/<!\[CDATA\[|\]\]>/g, '') || '';

                // استخراج القيمة العادلة من العنوان
                const fairValueMatch = title.match(/(\d+[\.,]\d+|\d+)\s*جنيه/) ||
                    title.match(/القيمة العادلة[:\s]+(\d+[\.,]\d+|\d+)/) ||
                    title.match(/target[:\s]+(\d+[\.,]\d+|\d+)/i) ||
                    title.match(/(\d+[\.,]\d+)\s*ج/);

                const fairValue = fairValueMatch ? fairValueMatch[1].replace(',', '.') : null;

                // استخراج التوصية من العنوان
                let recommendation = null;
                if (title.includes('شراء') || title.toLowerCase().includes('buy')) recommendation = 'شراء';
                else if (title.includes('بيع') || title.toLowerCase().includes('sell')) recommendation = 'بيع';
                else if (title.includes('احتفاظ') || title.toLowerCase().includes('hold') || title.includes('محايد')) recommendation = 'احتفاظ';

                return {
                    title,
                    link,
                    source,
                    fairValue,
                    recommendation,
                    date: pubDate ? new Date(pubDate).toLocaleDateString('ar-EG') : '',
                    rawDate: pubDate
                };
            })
            .filter(item => item.title)
            .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
            .slice(0, 10);

            return Response.json(news);

        } catch (err) {
            return Response.json({ error: err.message }, { status: 500 });
        }
    }

    // جلب من قاعدة البيانات
    let client;
    try {
        client = await getConnection();

        if (symbol) {
            const result = await client.query(
                `SELECT id, symbol, analyst, analysis_date, fair_value, recommendation, notes
                FROM fair_values
                WHERE symbol = $1
                ORDER BY analysis_date DESC`,
                [symbol]
            );
            return Response.json(result.rows);
        }

        const result = await client.query(
            `SELECT id, symbol, analyst, analysis_date, fair_value, recommendation, notes
            FROM fair_values
            ORDER BY analysis_date DESC`
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
        const { symbol, analyst, analysis_date, fair_value, recommendation, notes } = await request.json();

        client = await getConnection();
        await client.query(
            `INSERT INTO fair_values (symbol, analyst, analysis_date, fair_value, recommendation, notes)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [symbol, analyst, analysis_date, fair_value, recommendation, notes || '']
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
        await client.query(`DELETE FROM fair_values WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}