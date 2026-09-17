// توليد PDF فعلي من HTML عبر Chromium بدون واجهة رسومية (headless).
// على Vercel (بيئة Hobby بلا Chromium مثبّت) بنستخدم @sparticuz/chromium-min
// اللي بيجيب الملف الثنائي وقت التشغيل من مسار HTTPS بدل تضمينه في حجم الدالة
// (لتجنّب تجاوز حد حجم Serverless Function) — الملف مستضاف كأصل ثابت من نفس
// الموقع (public/bin/chromium-pack.x64.tar) عشان نضمن سرعة واستقرار التحميل
// بدل الاعتماد على رابط خارجي (GitHub Releases غير موثوق كمصدر دائم للإنتاج).
// محلياً (تطوير) بنستخدم Chromium المثبّت في بيئة التطوير مباشرة.

import puppeteer from 'puppeteer-core';

const LOCAL_CHROME_PATH = process.env.LOCAL_CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// مهم: VERCEL_URL بيشاور على رابط الـ deployment الفريد (وليس دومين الإنتاج
// المعروض للزوار)، وده غالباً محمي بمصادقة Vercel الخاصة بالـ deployments
// (Vercel Authentication) — أي طلب سيرفر-لسيرفر ليه بيرجّع صفحة تسجيل دخول
// Vercel نفسها بدل الملف، فيبوظ استخراج الـ tar. لازم نستخدم دومين الإنتاج
// العلني (اللي بيفتحه الزوار فعلاً) بدل ما نعتمد على VERCEL_URL.
function siteBaseUrl() {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return null;
}

export async function htmlToPdfBuffer(html) {
    const isVercel = !!process.env.VERCEL;
    let launchOptions;

    if (isVercel) {
        const chromium = (await import('@sparticuz/chromium-min')).default;
        const base = siteBaseUrl();
        if (!base) throw new Error('تعذّر تحديد رابط الموقع لجلب Chromium (VERCEL_URL غير متاح)');
        const packUrl = `${base}/bin/chromium-pack.x64.tar`;
        chromium.setGraphicsMode = false;
        launchOptions = {
            args: chromium.args,
            executablePath: await chromium.executablePath(packUrl),
            headless: chromium.headless,
        };
    } else {
        launchOptions = {
            executablePath: LOCAL_CHROME_PATH,
            headless: true,
            args: ['--no-sandbox', '--disable-gpu'],
        };
    }

    const browser = await puppeteer.launch(launchOptions);
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({ format: 'A4', printBackground: true });
        return pdf;
    } finally {
        await browser.close();
    }
}
