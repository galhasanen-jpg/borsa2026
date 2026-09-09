import { getConnection } from '../../../lib/db';
import { syncStockFromYahoo } from '../../../lib/sync-stock';

// مزامنة تلقائية يومية لكل الأسهم من Yahoo Finance، تُشغَّل عبر Vercel Cron
// (راجع vercel.json) قرب نهاية جلسة تداول البورصة المصرية. تُعالج الأسهم على
// دفعات متوازية لتقليل الوقت الكلي ضمن حدود تنفيذ الدالة السيرفرلس.
export const maxDuration = 300;

const BATCH_SIZE = 8;

export async function GET(request) {
    // حماية بسيطة: Vercel يرسل هذا الهيدر تلقائياً عند تشغيل الـ Cron إذا كان CRON_SECRET مضبوطاً
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    let client;
    try {
        client = await getConnection();

        const stocksResult = await client.query(`SELECT symbol, isin FROM stocks`);
        const stocks = stocksResult.rows;

        let successCount = 0;
        const failed = [];

        for (let i = 0; i < stocks.length; i += BATCH_SIZE) {
            const batch = stocks.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(
                batch.map(s => syncStockFromYahoo(client, s.symbol, s.isin))
            );
            for (const r of results) {
                if (r.success) successCount++;
                else failed.push(r.symbol);
            }
        }

        return Response.json({ total: stocks.length, success: successCount, failed });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
