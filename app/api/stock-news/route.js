export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const name = searchParams.get('name') || '';
    const fetchUrl = searchParams.get('url');

    // جلب محتوى خبر معين
    if (fetchUrl) {
        try {
            const res = await fetch(fetchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'ar,en;q=0.9',
                    'Referer': 'https://www.google.com/'
                },
                cache: 'no-store'
            });

            const html = await res.text();
            let content = '';

            // طريقة 1: البحث عن article
            const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
            if (articleMatch) {
                content = articleMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            }

            // طريقة 2: البحث عن div بكلاسات شائعة
            if (!content || content.length < 100) {
                const divPatterns = [
                    /class="[^"]*(?:article|content|story|body|text)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                    /class="[^"]*(?:post|entry|news)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                ];
                for (const pattern of divPatterns) {
                    const match = html.match(pattern);
                    if (match) {
                        const extracted = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                        if (extracted.length > content.length) content = extracted;
                    }
                }
            }

            // طريقة 3: استخراج الفقرات
            if (!content || content.length < 100) {
                const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
                content = paragraphs
                    .map(p => p
                        .replace(/<[^>]+>/g, '')
                        .replace(/&amp;/g, '&')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&quot;/g, '"')
                        .replace(/&#\d+;/g, '')
                        .trim()
                    )
                    .filter(p => p.length > 40)
                    .slice(0, 15)
                    .join('\n\n');
            }

            // تنظيف المحتوى
            content = content
                .replace(/&amp;/g, '&')
                .replace(/&nbsp;/g, ' ')
                .replace(/&quot;/g, '"')
                .replace(/&#\d+;/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            if (content.length > 3000) content = content.slice(0, 3000) + '...';

            return Response.json({ content });

        } catch (err) {
            return Response.json({ content: '' });
        }
    }

    if (!symbol) {
        return Response.json({ error: 'symbol required' }, { status: 400 });
    }

    try {
        const query = encodeURIComponent(`${name} ${symbol} البورصة المصرية`);
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

            // استخراج وتنظيف الـ description
            const descRaw = item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
            const description = descRaw
                .replace(/<!\[CDATA\[|\]\]>/g, '')
                .replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '')
                .replace(/<font[^>]*>/gi, '')
                .replace(/<\/font>/gi, '')
                .replace(/<[^>]+>/g, '')
                .replace(/&amp;/g, '&')
                .replace(/&nbsp;/g, ' ')
                .replace(/&quot;/g, '"')
                .replace(/&lt;/g, '')
                .replace(/&gt;/g, '')
                .replace(/&#\d+;/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            return {
                title,
                link,
                source,
                description,
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