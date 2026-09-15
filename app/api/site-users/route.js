import bcrypt from 'bcryptjs';
import { getConnection } from '../../lib/db';
import { isAdminRequest } from '../../lib/admin-auth';

// إدارة حسابات الزوار (موافقة/رفض) — تُستدعى من لوحة /admin المحمية بـ HTTP Basic Auth
export async function GET() {
    let client;
    try {
        client = await getConnection();
        const result = await client.query(
            `SELECT id, name, email, status, created_at FROM site_users ORDER BY created_at DESC`
        );
        return Response.json(result.rows);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

// إنشاء حساب مباشرة من الأدمن (نشط فوراً، بدون كود تفعيل بالإيميل) — حل مؤقت
// ريثما يتوفر دومين موثّق في Resend يسمح بإرسال إيميلات لأي مستخدم
export async function POST(request) {
    if (!isAdminRequest(request)) {
        return Response.json({ error: 'غير مصرح' }, { status: 401 });
    }

    let client;
    try {
        const { name, email, password } = await request.json();
        if (!name?.trim() || !email?.trim() || !password) {
            return Response.json({ error: 'يرجى تعبئة جميع الحقول' }, { status: 400 });
        }
        if (password.length < 6) {
            return Response.json({ error: 'كلمة السر يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
        }
        const cleanEmail = email.trim().toLowerCase();

        client = await getConnection();
        const existing = await client.query(`SELECT id FROM site_users WHERE email = $1`, [cleanEmail]);
        if (existing.rows.length > 0) {
            return Response.json({ error: 'الإيميل مسجل مسبقاً' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await client.query(
            `INSERT INTO site_users (name, email, password_hash, status)
            VALUES ($1, $2, $3, 'active')
            RETURNING id, name, email, status, created_at`,
            [name.trim(), cleanEmail, passwordHash]
        );

        return Response.json({ success: true, user: result.rows[0] });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function PUT(request) {
    let client;
    try {
        const { id, action } = await request.json();
        client = await getConnection();

        if (action === 'approve') {
            await client.query(`UPDATE site_users SET status = 'active' WHERE id = $1`, [id]);
        } else if (action === 'reject') {
            await client.query(`UPDATE site_users SET status = 'rejected' WHERE id = $1`, [id]);
        } else {
            return Response.json({ error: 'action required' }, { status: 400 });
        }

        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let client;
    try {
        client = await getConnection();
        await client.query(`DELETE FROM site_users WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
