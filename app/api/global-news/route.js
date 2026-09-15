export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ar&gl=EG&ceid=EG:ar`;
        const res = await fetch(url, {
            cache: 'no-store',
            headers: {
                // من غير User-Agent شبه متصفح، Google أحياناً بيرجع نتائج عامة/قديمة بدل نتائج البحث الفعلي
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            },
        });
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

            return {
                title,
                link,
                source,
                date: pubDate ? new Date(pubDate).toLocaleDateString('ar-EG') : '',
                rawDate: pubDate
            };
        })
        .filter(item => item.title)
        .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
        .slice(0, 12);

        return Response.json(news, { headers: { 'Cache-Control': 'no-store' } });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}