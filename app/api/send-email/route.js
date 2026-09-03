import { Resend } from 'resend';

const resend = new Resend('re_carbri4B_4EJsHtGo8chY8EeifSaPwVbG');

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