import Anthropic from '@anthropic-ai/sdk';
import { getConnection } from '../../../lib/db';
import { isAdminRequest } from '../../../lib/admin-auth';
import { AI_ANALYST_SYSTEM_PROMPT } from '../../../lib/ai-analyst-prompt';
import { AI_REPORT_CACHE_DAYS, normalizeCommand } from '../../../lib/ai-analyst-cache';

const MODEL = 'claude-opus-5';
const MAX_PAUSE_RESUMES = 4;

// رفعها لـ 800 فشل الـ deploy نفسه (خطة الحساب الحالية مش بتسمح بالقيمة دي —
// Vercel بيرفض النشر بدل ما يحدّها تلقائياً زي ما كنا متوقعين). رجّعناها لآخر
// قيمة نشرت بنجاح (300، وهي أصلاً القيمة الافتراضية) لحد ما نتأكد من سقف
// الخطة الحقيقي من رسالة الخطأ في لوحة Vercel
export const maxDuration = 300;

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

    // نفس الأمر خلال آخر AI_REPORT_CACHE_DAYS أيام؟ رجّع التقرير المحفوظ بدل ما نستدعي Claude تاني بتكلفة إضافية —
    // إلا لو الأدمن طلب تحديث إجباري (force)
    let cacheClient;
    if (!force) {
        try {
            cacheClient = await getConnection();
            const cached = await cacheClient.query(
                `SELECT id, command, report, model, created_at FROM ai_analyst_reports
                WHERE normalized_command = $1 AND created_at > now() - ($2 || ' days')::interval
                ORDER BY created_at DESC LIMIT 1`,
                [normalizedCommand, AI_REPORT_CACHE_DAYS]
            );
            if (cached.rows.length > 0) {
                return Response.json({ success: true, cached: true, ...cached.rows[0] });
            }
        } catch (err) {
            return Response.json({ error: err.message }, { status: 500 });
        } finally {
            if (cacheClient) cacheClient.release();
        }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        return Response.json({ error: 'مفتاح ANTHROPIC_API_KEY غير مُعرّف على السيرفر' }, { status: 500 });
    }

    const anthropic = new Anthropic();

    const messages = [{ role: 'user', content: command.trim() }];
    let finalMessage;

    try {
        for (let i = 0; i < MAX_PAUSE_RESUMES; i++) {
            // effort:'high' + 32K مخرجات + 20 بحث كان بياخد أكتر من 5 دقايق فعلياً (أطول من
            // maxDuration نفسه) — قلّلنا الإعدادات عشان يخلص التحليل فعلياً بدل ما يتقطع
            const stream = anthropic.messages.stream({
                model: MODEL,
                max_tokens: 20000,
                thinking: { type: 'adaptive', display: 'summarized' },
                output_config: { effort: 'medium' },
                system: [
                    { type: 'text', text: AI_ANALYST_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
                ],
                tools: [
                    { type: 'web_search_20260209', name: 'web_search', max_uses: 10 },
                ],
                messages,
            });

            finalMessage = await stream.finalMessage();

            if (finalMessage.stop_reason === 'pause_turn') {
                messages.push({ role: 'assistant', content: finalMessage.content });
                continue;
            }
            break;
        }
    } catch (err) {
        if (err instanceof Anthropic.AuthenticationError) {
            return Response.json({ error: 'مفتاح Anthropic API غير صالح' }, { status: 500 });
        }
        if (err instanceof Anthropic.RateLimitError) {
            return Response.json({ error: 'تم تجاوز حد الاستخدام المسموح، حاول بعد قليل' }, { status: 429 });
        }
        if (err instanceof Anthropic.APIError) {
            return Response.json({ error: `خطأ من Claude API: ${err.message}` }, { status: 502 });
        }
        return Response.json({ error: err.message || 'حدث خطأ غير متوقع' }, { status: 500 });
    }

    if (finalMessage.stop_reason === 'refusal') {
        return Response.json({ error: 'تم رفض تنفيذ هذا الطلب من قِبل النموذج' }, { status: 422 });
    }

    const reportText = finalMessage.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n\n')
        .trim();

    if (!reportText) {
        return Response.json({ error: 'لم يتم الحصول على تقرير نصي من النموذج' }, { status: 502 });
    }

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

        return Response.json({
            success: true,
            cached: false,
            id: result.rows[0].id,
            created_at: result.rows[0].created_at,
            command: command.trim(),
            report: reportText,
            usage: finalMessage.usage,
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
