import Anthropic from '@anthropic-ai/sdk';
import { getConnection } from '../../../lib/db';
import { isAdminRequest } from '../../../lib/admin-auth';
import { AI_ANALYST_SYSTEM_PROMPT } from '../../../lib/ai-analyst-prompt';

const MODEL = 'claude-opus-5';
const MAX_PAUSE_RESUMES = 4;

export async function POST(request) {
    if (!isAdminRequest(request)) {
        return Response.json({ error: 'هذه الميزة متاحة للمشرف فقط حالياً' }, { status: 401 });
    }

    let command;
    try {
        ({ command } = await request.json());
    } catch (err) {
        return Response.json({ error: 'طلب غير صالح' }, { status: 400 });
    }

    if (!command || !command.trim()) {
        return Response.json({ error: 'يرجى كتابة أمر التحليل، مثال: حلل CIB' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        return Response.json({ error: 'مفتاح ANTHROPIC_API_KEY غير مُعرّف على السيرفر' }, { status: 500 });
    }

    const anthropic = new Anthropic();

    const messages = [{ role: 'user', content: command.trim() }];
    let finalMessage;

    try {
        for (let i = 0; i < MAX_PAUSE_RESUMES; i++) {
            const stream = anthropic.messages.stream({
                model: MODEL,
                max_tokens: 32000,
                thinking: { type: 'adaptive', display: 'summarized' },
                output_config: { effort: 'high' },
                system: [
                    { type: 'text', text: AI_ANALYST_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
                ],
                tools: [
                    { type: 'web_search_20260209', name: 'web_search', max_uses: 20 },
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
            `INSERT INTO ai_analyst_reports (command, report, model, input_tokens, output_tokens)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, created_at`,
            [
                command.trim(),
                reportText,
                MODEL,
                finalMessage.usage?.input_tokens ?? null,
                finalMessage.usage?.output_tokens ?? null,
            ]
        );

        return Response.json({
            success: true,
            id: result.rows[0].id,
            created_at: result.rows[0].created_at,
            report: reportText,
            usage: finalMessage.usage,
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
