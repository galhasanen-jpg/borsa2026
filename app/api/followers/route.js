import { getConnection } from '../../lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const analystId = searchParams.get('analyst_id');
    const status = searchParams.get('status');
    const email = searchParams.get('email');

    let client;
    try {
        client = await getConnection();

        if (email) {
            const result = await client.query(
                `SELECT f.*, fg.plan, fg.status as group_status, fg.analyst_id
                FROM followers f
                LEFT JOIN follower_groups fg ON f.id = fg.follower_id
                WHERE f.email = $1`,
                [email]
            );
            return Response.json(result.rows[0] || null);
        }

        if (analystId) {
            let query = `
                SELECT f.id, f.name, f.email, f.whatsapp, f.status,
                fg.plan, fg.status as group_status, fg.analyst_approved,
                fg.admin_approved, fg.created_at
                FROM followers f
                JOIN follower_groups fg ON f.id = fg.follower_id
                WHERE fg.analyst_id = $1
            `;
            const params = [analystId];

            if (status === 'pending') {
                query += ` AND fg.analyst_approved = false`;
            } else if (status) {
                query += ` AND fg.status = $2`;
                params.push(status);
            }

            query += ` ORDER BY fg.created_at DESC`;
            const result = await client.query(query, params);
            return Response.json(result.rows);
        }

        const result = await client.query(
            `SELECT f.*, fg.plan, fg.status as group_status,
            fg.analyst_approved, fg.admin_approved, a.name as analyst_name
            FROM followers f
            JOIN follower_groups fg ON f.id = fg.follower_id
            JOIN analysts a ON fg.analyst_id = a.id
            ORDER BY f.created_at DESC`
        );
        return Response.json(result.rows);

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function POST(request) {
    let client;
    try {
        const { name, email, whatsapp, password, analyst_id, plan } = await request.json();

        client = await getConnection();

        // التحقق من عدم تكرار الإيميل
        const existing = await client.query(
            `SELECT id FROM followers WHERE email = $1`,
            [email]
        );
        if (existing.rows.length > 0) {
            return Response.json({ error: 'الإيميل مسجل مسبقاً' }, { status: 400 });
        }

        // تشفير كلمة السر
        const passwordHash = await bcrypt.hash(password, 10);

        // إنشاء المتابع
        const followerResult = await client.query(
            `INSERT INTO followers (name, email, whatsapp, password_hash, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING id`,
            [name, email, whatsapp, passwordHash]
        );

        const followerId = followerResult.rows[0].id;

        // ربط المتابع بالمحلل
        await client.query(
            `INSERT INTO follower_groups (follower_id, analyst_id, plan, status)
            VALUES ($1, $2, $3, 'pending')`,
            [followerId, analyst_id, plan || 'free']
        );

        return Response.json({ success: true, id: followerId });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function PUT(request) {
    let client;
    try {
        const { id, action, plan, activation_code, password } = await request.json();

        client = await getConnection();

        if (action === 'analyst_approve') {
            await client.query(
                `UPDATE follower_groups SET analyst_approved = true
                WHERE follower_id = $1`,
                [id]
            );
        } else if (action === 'admin_approve') {
            // توليد كود التفعيل
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            await client.query(
                `UPDATE follower_groups SET admin_approved = true, status = 'approved'
                WHERE follower_id = $1`,
                [id]
            );
            await client.query(
                `UPDATE followers SET activation_code = $1, status = 'approved'
                WHERE id = $2`,
                [code, id]
            );
            return Response.json({ success: true, code });
        } else if (action === 'activate') {
            // التحقق من الكود
            const follower = await client.query(
                `SELECT * FROM followers WHERE id = $1 AND activation_code = $2 AND code_used = false`,
                [id, activation_code]
            );
            if (follower.rows.length === 0) {
                return Response.json({ error: 'الكود غير صحيح أو منتهي الصلاحية' }, { status: 400 });
            }
            const passwordHash = await bcrypt.hash(password, 10);
            await client.query(
                `UPDATE followers SET password_hash = $1, code_used = true, status = 'active'
                WHERE id = $2`,
                [passwordHash, id]
            );
        } else if (action === 'upgrade_plan') {
            await client.query(
                `UPDATE follower_groups SET plan = $1 WHERE follower_id = $2`,
                [plan, id]
            );
            await client.query(
                `INSERT INTO plan_upgrades (follower_id, analyst_id, old_plan, new_plan)
                SELECT follower_id, analyst_id, plan, $1
                FROM follower_groups WHERE follower_id = $2`,
                [plan, id]
            );
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
        await client.query(`DELETE FROM followers WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}