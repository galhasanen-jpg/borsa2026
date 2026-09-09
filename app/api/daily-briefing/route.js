import { getConnection } from '../../lib/db';

const DEFAULT_STOCKS = [
    { id: -1, name: 'أبوظبي الإسلامي', name_en: 'ADIB Egypt', symbol: 'ADIB.CA' },
    { id: -2, name: 'العربية للأسمنت', name_en: 'Arabian Cement', symbol: 'ARCC.CA' },
    { id: -3, name: 'بلتون المالية', name_en: 'Beltone Financial', symbol: 'BTFH.CA' },
    { id: -4, name: 'راميدا', name_en: 'Ramda', symbol: 'RMDA.CA' },
    { id: -5, name: 'أوراسكوم للتنمية', name_en: 'Orascom Development', symbol: 'ORHD.CA' },
    { id: -6, name: 'المنصورة للدواجن', name_en: 'Mansoura Poultry', symbol: null },
];

// تاريخ اليوم بتوقيت القاهرة بصيغة YYYY-MM-DD، لمقارنة الأيام التقويمية بدل الفرق الزمني الخام
function cairoDateString(date) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
}

async function getBriefingStocks() {
    let client;
    try {
        client = await getConnection();
        const result = await client.query(
            `SELECT id, name, name_en, symbol FROM briefing_stocks ORDER BY id ASC`
        );
        if (result.rows.length > 0) return result.rows;
        return DEFAULT_STOCKS;
    } catch (err) {
        return DEFAULT_STOCKS;
    } finally {
        if (client) client.release();
    }
}

async function fetchStockNews(name, symbol) {
    try {
        const query = encodeURIComponent(`${name} ${symbol || ''} البورصة المصرية`);
        const url = `https://news.google.com/rss/search?q=${query}&hl=ar&gl=EG&ceid=EG:ar`;
        const res = await fetch(url, { cache: 'no-store' });
        const xml = await res.text();
        const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

        return items.map(item => {
            const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
                ?.replace(/<!\[CDATA\[|\]\]>/g, '')
                ?.replace(/&amp;/g, '&')
                ?.replace(/&quot;/g, '"') || '';
            const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
            const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
            const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]
                ?.replace(/<!\[CDATA\[|\]\]>/g, '') || '';

            return {
                title,
                link,
                source,
                date: pubDate ? new Date(pubDate).toLocaleDateString('ar-EG') : '',
                rawDate: pubDate
            };
        }).filter(item => item.title && item.rawDate);
    } catch (err) {
        return [];
    }
}

export async function GET() {
    const stocks = await getBriefingStocks();

    const now = new Date();
    const today = cairoDateString(now);
    const yesterday = cairoDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));

    const briefing = await Promise.all(stocks.map(async (stock) => {
        const allNews = await fetchStockNews(stock.name, stock.symbol);

        // نعرض فقط أخبار نفس اليوم أو اليوم السابق (بتوقيت القاهرة)
        const freshNews = allNews
            .filter(item => {
                const d = cairoDateString(new Date(item.rawDate));
                return d === today || d === yesterday;
            })
            .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
            .slice(0, 6);

        return {
            id: stock.id,
            name: stock.name,
            name_en: stock.name_en,
            symbol: stock.symbol,
            news: freshNews,
        };
    }));

    return Response.json({ date: today, stocks: briefing });
}
