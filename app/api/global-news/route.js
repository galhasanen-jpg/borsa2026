export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    try {
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

        return Response.json(news);

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}