import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        const { to, subject, html } = await request.json();
        const data = await resend.emails.send({
            from: 'بورصة 2026 <onboarding@resend.dev>',
            to,
            subject,
            html
        });
        return Response.json({ success: true, id: data.id });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}