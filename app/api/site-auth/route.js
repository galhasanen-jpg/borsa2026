import { getConnection } from '../../lib/db';
import bcrypt from 'bcryptjs';

// حساب زوار عام وبسيط (بدون اشتراك بمحلل أو موافقة إدارية) — منفصل تماماً عن نظام "المتابعين"
export async function POST(request) {
    let client;
    try {
        const { action, name, email, password } = await request.json();

        if (!email || !password) {
            return Response.json({ error: 'البريد وكلمة السر مطلوبة' }, { status: 400 });
        }

        client = await getConnection();
        const cleanEmail = email.trim().toLowerCase();

        if (action === 'register') {
            if (!name || !name.trim()) {
                return Response.json({ error: 'الاسم مطلوب' }, { status: 400 });
            }
            if (password.length < 6) {
                return Response.json({ error: 'كلمة السر يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
            }

            const existing = await client.query(`SELECT id FROM site_users WHERE email = $1`, [cleanEmail]);
            if (existing.rows.length > 0) {
                return Response.json({ error: 'الإيميل مسجل مسبقاً' }, { status: 400 });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const result = await client.query(
                `INSERT INTO site_users (name, email, password_hash)
                VALUES ($1, $2, $3) RETURNING id, name, email`,
                [name.trim(), cleanEmail, passwordHash]
            );

            return Response.json({ success: true, user: result.rows[0] });
        }

        if (action === 'login') {
            const result = await client.query(
                `SELECT id, name, email, password_hash FROM site_users WHERE email = $1`,
                [cleanEmail]
            );
            if (result.rows.length === 0) {
                return Response.json({ error: 'الإيميل غير مسجل' }, { status: 401 });
            }

            const isValid = await bcrypt.compare(password, result.rows[0].password_hash);
            if (!isValid) {
                return Response.json({ error: 'كلمة السر غير صحيحة' }, { status: 401 });
            }

            const { password_hash, ...safeUser } = result.rows[0];
            return Response.json({ success: true, user: safeUser });
        }

        return Response.json({ error: 'action required' }, { status: 400 });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
