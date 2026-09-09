import { getConnection } from '../../lib/db';
import { guestPreviewStocks, getUserBriefingStocks } from '../../lib/briefing-stocks';

// تاريخ اليوم بتوقيت القاهرة بصيغة YYYY-MM-DD، لمقارنة الأيام التقويمية بدل الفرق الزمني الخام
function cairoDateString(date) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
}

async function getStocksForRequest(userId) {
    if (!userId) return guestPreviewStocks();

    let client;
    try {
        client = await getConnection();
        return await getUserBriefingStocks(client, userId);
    } catch (err) {
        return guestPreviewStocks();
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

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const stocks = await getStocksForRequest(userId);

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

    return Response.json({ date: today, personalized: !!userId, stocks: briefing });
}
