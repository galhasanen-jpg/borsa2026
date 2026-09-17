import Anthropic from '@anthropic-ai/sdk';
import { getConnection } from '../../../lib/db';
import { isAdminRequest } from '../../../lib/admin-auth';
import { AI_ANALYST_SYSTEM_PROMPT } from '../../../lib/ai-analyst-prompt';
import { AI_REPORT_CACHE_DAYS, normalizeCommand } from '../../../lib/ai-analyst-cache';
import { resolveStockMentions, buildStockReferenceNote } from '../../../lib/ai-analyst-stock-lookup';

const MODEL = 'claude-opus-5';
const MAX_PAUSE_RESUMES = 3;
const PEERS_PER_STOCK = 6;

// التجربة الفعلية أثبتت إن سهم مغطّى إعلامياً بيخلص في 100-150 ثانية من أصل الـ 300
// المتاحة على خطة Hobby — رفعنا الإعدادات هنا لأقصى جودة ممكنة في حدود الميزانية دي
export const maxDuration = 300;

// بيرسل تحديثات حالة التحليل أولاً بأول (NDJSON) بدل ما يسيب الأدمن مستني بلا أي
// إشارة لمدة تصل لدقيقتين ونص — كل سطر JSON مستقل على سطره الخاص
function createNdjsonStream() {
    const encoder = new TextEncoder();
    let controllerRef;
    const stream = new ReadableStream({
        start(controller) { controllerRef = controller; },
    });
    return {
        stream,
        send(obj) {
            try { controllerRef.enqueue(encoder.encode(JSON.stringify(obj) + '\n')); } catch (err) { /* الاتصال اتقفل من العميل */ }
        },
        close() {
            try { controllerRef.close(); } catch (err) { /* already closed */ }
        },
    };
}

export async function POST(request) {
    if (!isAdminRequest(request)) {
        return Response.json({ error: 'هذه الميزة متاحة للمشرف فقط حالياً' }, { status: 401 });
    }

    let command, force;
    try {
        ({ command, force } = await request.json());
    } catch (err) {
        return Response.json({ error: 'طلب غير صالح' }, { status: 400 });
    }

    if (!command || !command.trim()) {
        return Response.json({ error: 'يرجى كتابة أمر التحليل، مثال: حلل CIB' }, { status: 400 });
    }

    const normalizedCommand = normalizeCommand(command);
    const { stream, send, close } = createNdjsonStream();

    (async () => {
        try {
            // نفس الأمر خلال آخر AI_REPORT_CACHE_DAYS أيام؟ رجّع التقرير المحفوظ بدل ما نستدعي
            // Claude تاني بتكلفة إضافية — إلا لو الأدمن طلب تحديث إجباري (force)
            if (!force) {
                send({ type: 'status', message: '🔍 يتحقق من وجود تحليل محفوظ مسبقاً...' });
                let cacheClient;
                try {
                    cacheClient = await getConnection();
                    const cached = await cacheClient.query(
                        `SELECT id, command, report, model, created_at FROM ai_analyst_reports
                        WHERE normalized_command = $1 AND created_at > now() - ($2 || ' days')::interval
                        ORDER BY created_at DESC LIMIT 1`,
                        [normalizedCommand, AI_REPORT_CACHE_DAYS]
                    );
                    if (cached.rows.length > 0) {
                        send({ type: 'result', success: true, cached: true, ...cached.rows[0] });
                        return;
                    }
                } finally {
                    if (cacheClient) cacheClient.release();
                }
            }

            if (!process.env.ANTHROPIC_API_KEY) {
                send({ type: 'error', error: 'مفتاح ANTHROPIC_API_KEY غير مُعرّف على السيرفر' });
                return;
            }

            // نربط أي رمز/اسم شائع مذكور في الأمر بالرمز الرسمي المؤكد من جدول أسهمنا، ونجيب
            // سعره الحالي الفعلي + شركات منافسة في نفس القطاع من نفس نظام المزامنة الحقيقي —
            // بحث Claude العام كان بيرجّع سعراً قديماً ومنافسين غير دقيقين لشركات EGX المحلية
            send({ type: 'status', message: '📡 يجلب بيانات الأسعار والقطاع من قاعدة بيانات الموقع...' });
            let stockRefNote = '';
            let stocksLookupClient;
            try {
                stocksLookupClient = await getConnection();
                const stocksResult = await stocksLookupClient.query(
                    `SELECT s.symbol, s.name, s.name_en, s.isin, s.sector_id, sec.name as sector_name, sec.name_en as sector_name_en
                    FROM stocks s LEFT JOIN sectors sec ON s.sector_id = sec.id`
                );
                const matchedStocks = resolveStockMentions(command, stocksResult.rows);

                if (matchedStocks.length > 0) {
                    // شركات منافسة بنفس القطاع (لقسم "مقارنة المنافسين") — حتى PEERS_PER_STOCK لكل سهم
                    const peersByStock = new Map();
                    for (const s of matchedStocks) {
                        if (!s.sector_id) continue;
                        const peers = stocksResult.rows
                            .filter(r => r.sector_id === s.sector_id && r.symbol !== s.symbol)
                            .slice(0, PEERS_PER_STOCK);
                        if (peers.length) peersByStock.set(s.symbol, peers);
                    }

                    const allSymbols = new Set(matchedStocks.map(s => s.symbol));
                    for (const peers of peersByStock.values()) {
                        for (const p of peers) allSymbols.add(p.symbol);
                    }

                    const pricesResult = await stocksLookupClient.query(
                        `SELECT symbol, price, change_percent, quote_time FROM stock_prices WHERE symbol = ANY($1)`,
                        [[...allSymbols]]
                    );
                    const priceBySymbol = new Map(pricesResult.rows.map(r => [r.symbol, r]));

                    for (const s of matchedStocks) {
                        const p = priceBySymbol.get(s.symbol);
                        if (p) Object.assign(s, { price: p.price, change_percent: p.change_percent, quote_time: p.quote_time });
                    }
                    for (const peers of peersByStock.values()) {
                        for (const peer of peers) {
                            const p = priceBySymbol.get(peer.symbol);
                            if (p) Object.assign(peer, { price: p.price, change_percent: p.change_percent });
                        }
                    }

                    stockRefNote = buildStockReferenceNote(matchedStocks, peersByStock);
                }
            } catch (err) {
                // فشل جلب قائمة الأسهم/الأسعار المرجعية ما يوقفش التحليل — يكمل بدون هذه الإضافة
            } finally {
                if (stocksLookupClient) stocksLookupClient.release();
            }

            const anthropic = new Anthropic();
            const messages = [{ role: 'user', content: `${stockRefNote}${command.trim()}` }];
            let finalMessage;

            send({ type: 'status', message: '🚀 يبدأ التحليل عبر الذكاء الاصطناعي...' });

            try {
                for (let i = 0; i < MAX_PAUSE_RESUMES; i++) {
                    const aiStream = anthropic.messages.stream({
                        model: MODEL,
                        max_tokens: 26000,
                        thinking: { type: 'adaptive', display: 'summarized' },
                        output_config: { effort: 'high' },
                        system: [
                            { type: 'text', text: AI_ANALYST_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
                        ],
                        tools: [
                            { type: 'web_search_20260209', name: 'web_search', max_uses: 14 },
                        ],
                        messages,
                    });

                    let sawThinking = false;
                    let sawText = false;
                    aiStream.on('contentBlock', (block) => {
                        if (block.type === 'server_tool_use' && block.name === 'web_search') {
                            const query = block.input && typeof block.input === 'object' ? block.input.query : null;
                            send({ type: 'status', message: query ? `🌐 يبحث عن: ${query}` : '🌐 يبحث في الإنترنت عن بيانات محدثة...' });
                        } else if (block.type === 'web_search_tool_result') {
                            send({ type: 'status', message: '📄 وجد نتائج بحث، يواصل التحليل...' });
                        } else if (block.type === 'thinking' && !sawThinking) {
                            sawThinking = true;
                            send({ type: 'status', message: '🧠 يحلل البيانات المالية...' });
                        } else if (block.type === 'text' && !sawText) {
                            sawText = true;
                            send({ type: 'status', message: '✍️ يكتب التقرير النهائي...' });
                        }
                    });

                    finalMessage = await aiStream.finalMessage();

                    if (finalMessage.stop_reason === 'pause_turn') {
                        messages.push({ role: 'assistant', content: finalMessage.content });
                        send({ type: 'status', message: '⏳ يكمل الجلسة (استمرار البحث والتحليل)...' });
                        continue;
                    }
                    break;
                }
            } catch (err) {
                if (err instanceof Anthropic.AuthenticationError) {
                    send({ type: 'error', error: 'مفتاح Anthropic API غير صالح' });
                } else if (err instanceof Anthropic.RateLimitError) {
                    send({ type: 'error', error: 'تم تجاوز حد الاستخدام المسموح، حاول بعد قليل' });
                } else if (err instanceof Anthropic.APIError) {
                    send({ type: 'error', error: `خطأ من Claude API: ${err.message}` });
                } else {
                    send({ type: 'error', error: err.message || 'حدث خطأ غير متوقع' });
                }
                return;
            }

            if (finalMessage.stop_reason === 'refusal') {
                send({ type: 'error', error: 'تم رفض تنفيذ هذا الطلب من قِبل النموذج' });
                return;
            }

            const reportText = finalMessage.content
                .filter(block => block.type === 'text')
                .map(block => block.text)
                .join('\n\n')
                .trim();

            if (!reportText) {
                send({ type: 'error', error: 'لم يتم الحصول على تقرير نصي من النموذج' });
                return;
            }

            send({ type: 'status', message: '💾 يحفظ التقرير...' });

            let client;
            try {
                client = await getConnection();
                const result = await client.query(
                    `INSERT INTO ai_analyst_reports (command, normalized_command, report, model, input_tokens, output_tokens)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id, created_at`,
                    [
                        command.trim(),
                        normalizedCommand,
                        reportText,
                        MODEL,
                        finalMessage.usage?.input_tokens ?? null,
                        finalMessage.usage?.output_tokens ?? null,
                    ]
                );

                send({
                    type: 'result',
                    success: true,
                    cached: false,
                    id: result.rows[0].id,
                    created_at: result.rows[0].created_at,
                    command: command.trim(),
                    report: reportText,
                    usage: finalMessage.usage,
                });
            } catch (err) {
                send({ type: 'error', error: err.message });
            } finally {
                if (client) client.release();
            }
        } catch (err) {
            send({ type: 'error', error: err.message || 'حدث خطأ غير متوقع' });
        } finally {
            close();
        }
    })();

    return new Response(stream, {
        status: 200,
        headers: {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
