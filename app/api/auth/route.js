import { getConnection } from '../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    let client;
    try {
        const { email, password } = await request.json();

        client = await getConnection();

        // جلب المتابع
        const result = await client.query(
            `SELECT f.*, fg.plan, fg.analyst_id, fg.status as group_status
            FROM followers f
            LEFT JOIN follower_groups fg ON f.id = fg.follower_id
            WHERE f.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return Response.json({ error: 'الإيميل غير مسجل' }, { status: 401 });
        }

        const follower = result.rows[0];

        // التحقق من كلمة السر
        const isValid = await bcrypt.compare(password, follower.password_hash);
        if (!isValid) {
            return Response.json({ error: 'كلمة السر غير صحيحة' }, { status: 401 });
        }

        // التحقق من حالة الحساب
        if (follower.status === 'pending') {
            return Response.json({ error: 'حسابك قيد المراجعة' }, { status: 403 });
        }

        if (follower.status === 'approved' && !follower.code_used) {
            return Response.json({ error: 'يجب تفعيل حسابك بالكود المرسل على إيميلك', needActivation: true, id: follower.id }, { status: 403 });
        }

        if (follower.status !== 'active') {
            return Response.json({ error: 'حسابك غير مفعل' }, { status: 403 });
        }

        // إرجاع بيانات المتابع بدون كلمة السر
        const { password_hash, activation_code, ...safeData } = follower;
        return Response.json({ success: true, user: safeData });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}