import { getConnection } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { signSession, sessionCookieHeader, clearSessionCookieHeader } from '../../lib/session';

// حساب زوار عام (منفصل عن نظام "المتابعين" المرتبط بمحلل)
// المسار: تسجيل -> كود تأكيد بالإيميل -> موافقة إدارية -> يقدر يدخل بإيميله وكلمة سره
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const CODE_TTL_MS = 30 * 60 * 1000; // 30 دقيقة

export async function POST(request) {
    let client;
    try {
        const body = await request.json();
        const { action } = body;

        if (action === 'logout') {
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearSessionCookieHeader() },
            });
        }

        client = await getConnection();

        if (action === 'register') {
            const { name, email, password } = body;
            if (!name?.trim() || !email?.trim() || !password) {
                return Response.json({ error: 'يرجى تعبئة جميع الحقول' }, { status: 400 });
            }
            if (password.length < 6) {
                return Response.json({ error: 'كلمة السر يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
            }
            const cleanEmail = email.trim().toLowerCase();

            const existing = await client.query(`SELECT id FROM site_users WHERE email = $1`, [cleanEmail]);
            if (existing.rows.length > 0) {
                return Response.json({ error: 'الإيميل مسجل مسبقاً' }, { status: 400 });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const code = generateCode();
            const expires = new Date(Date.now() + CODE_TTL_MS);

            const result = await client.query(
                `INSERT INTO site_users (name, email, password_hash, status, email_code, email_code_expires)
                VALUES ($1, $2, $3, 'pending_email', $4, $5)
                RETURNING id, name, email`,
                [name.trim(), cleanEmail, passwordHash, code, expires]
            );

            // الكود يرجع بالرد حتى تقدر الصفحة ترسله بالإيميل (نفس نمط الموقع الحالي لكود تفعيل المتابعين)
            return Response.json({ success: true, ...result.rows[0], code });
        }

        if (action === 'resend_code') {
            const { id } = body;
            const code = generateCode();
            const expires = new Date(Date.now() + CODE_TTL_MS);
            const result = await client.query(
                `UPDATE site_users SET email_code = $1, email_code_expires = $2
                WHERE id = $3 AND status = 'pending_email'
                RETURNING id, name, email`,
                [code, expires, id]
            );
            if (result.rows.length === 0) {
                return Response.json({ error: 'لا يمكن إعادة إرسال الكود لهذا الحساب' }, { status: 400 });
            }
            return Response.json({ success: true, ...result.rows[0], code });
        }

        if (action === 'verify_email') {
            const { id, code } = body;
            const result = await client.query(
                `SELECT id FROM site_users
                WHERE id = $1 AND email_code = $2 AND email_code_expires > NOW() AND status = 'pending_email'`,
                [id, code]
            );
            if (result.rows.length === 0) {
                return Response.json({ error: 'الكود غير صحيح أو منتهي الصلاحية' }, { status: 400 });
            }
            await client.query(
                `UPDATE site_users SET status = 'pending_admin', email_code = NULL, email_code_expires = NULL WHERE id = $1`,
                [id]
            );
            return Response.json({ success: true });
        }

        if (action === 'login') {
            const { email, password } = body;
            if (!email || !password) {
                return Response.json({ error: 'البريد وكلمة السر مطلوبة' }, { status: 400 });
            }
            const cleanEmail = email.trim().toLowerCase();
            const result = await client.query(
                `SELECT id, name, email, password_hash, status FROM site_users WHERE email = $1`,
                [cleanEmail]
            );
            if (result.rows.length === 0) {
                return Response.json({ error: 'الإيميل غير مسجل' }, { status: 401 });
            }

            const user = result.rows[0];
            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) {
                return Response.json({ error: 'كلمة السر غير صحيحة' }, { status: 401 });
            }

            if (user.status === 'pending_email') {
                return Response.json({ error: 'يجب تأكيد إيميلك أولاً', needEmailVerify: true, id: user.id }, { status: 403 });
            }
            if (user.status === 'pending_admin') {
                return Response.json({ error: 'حسابك قيد المراجعة من الإدارة، سيتم تفعيله بعد الموافقة' }, { status: 403 });
            }
            if (user.status === 'rejected') {
                return Response.json({ error: 'تم رفض طلب تسجيلك' }, { status: 403 });
            }
            if (user.status !== 'active') {
                return Response.json({ error: 'حسابك غير مفعّل' }, { status: 403 });
            }

            const { password_hash, status, ...safeUser } = user;
            const token = await signSession(user.id);
            return new Response(JSON.stringify({ success: true, user: safeUser }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Set-Cookie': sessionCookieHeader(token) },
            });
        }

        return Response.json({ error: 'action required' }, { status: 400 });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
