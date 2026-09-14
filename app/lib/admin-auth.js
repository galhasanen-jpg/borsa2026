// فحص صلاحية الأدمن داخل route handler مباشرة (وليس فقط عبر middleware).
// يُستخدم في نقاط الـ API التي لها تكلفة فعلية بالمال (مثل استدعاء Claude API)
// حتى لا تعمل إلا من صفحة /admin المحمية أصلاً بنفس كلمة السر.

export function isAdminRequest(request) {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return false;

    const auth = request.headers.get('authorization');
    if (!auth) return false;

    const [scheme, encoded] = auth.split(' ');
    if (scheme !== 'Basic' || !encoded) return false;

    try {
        const [, password] = Buffer.from(encoded, 'base64').toString().split(':');
        return password === expected;
    } catch (err) {
        return false;
    }
}
