// جلسة موقّعة بسيطة (HMAC) لتحديد هوية الزائر المسجّل عبر كل صفحات الموقع.
// نستخدم Web Crypto (crypto.subtle) لأنها متاحة في كل من Middleware (Edge) وواجهات الـ API (Node) بدون استيراد إضافي.

const SESSION_SECRET = process.env.SESSION_SECRET || 'borsa2026-dev-fallback-secret';
const SESSION_COOKIE = 'site_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 يوم

async function getKey() {
    const enc = new TextEncoder();
    return crypto.subtle.importKey(
        'raw', enc.encode(SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
    );
}

function toHex(buffer) {
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex) {
    return new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
}

export async function signSession(userId) {
    const payload = `${userId}.${Date.now()}`;
    const key = await getKey();
    const enc = new TextEncoder();
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    return `${payload}.${toHex(sig)}`;
}

export async function verifySession(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [userId, ts, sigHex] = parts;

    try {
        const key = await getKey();
        const enc = new TextEncoder();
        const valid = await crypto.subtle.verify('HMAC', key, fromHex(sigHex), enc.encode(`${userId}.${ts}`));
        return valid ? parseInt(userId) : null;
    } catch (err) {
        return null;
    }
}

export function sessionCookieHeader(token) {
    return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookieHeader() {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

// كوكي بسيط (غير موقّع — مجرد بوابة واجهة، وليس صلاحية حقيقية) يُضبط من زر
// "الدخول كزائر" بصفحة تسجيل الدخول. بدونه لا يمكن تصفح حتى الصفحات المفتوحة للزوار.
export const GUEST_COOKIE_NAME = 'site_guest';
