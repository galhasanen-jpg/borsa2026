// يربط أمر المستخدم النصي ("حلل CIB") بالرمز الرسمي المؤكد من قاعدة بيانات الموقع
// (نفس الجدول اللي بيغذي المزامنة الحقيقية من Yahoo) — عشان نمنع أداة البحث من
// البحث برمز غير رسمي (زي "CIB" الاسم الشائع) بينما السعر الحقيقي مسجّل بـ"COMI".

// أول حرف من كل كلمة في الاسم الإنجليزي — "Commercial International Bank" → "CIB"
function acronym(nameEn) {
    if (!nameEn) return '';
    return nameEn
        .replace(/[^a-zA-Z\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .map(w => w[0])
        .join('')
        .toUpperCase();
}

export function resolveStockMentions(command, stocks) {
    const upperCommand = command.toUpperCase();
    const tokens = new Set((command.match(/\b[A-Za-z]{2,8}\b/g) || []).map(t => t.toUpperCase()));

    const matched = new Map();
    for (const s of stocks) {
        const symbolU = (s.symbol || '').toUpperCase();
        const isinU = (s.isin || '').toUpperCase();
        const acr = acronym(s.name_en);

        let hit = false;
        if (symbolU && tokens.has(symbolU)) hit = true;
        if (!hit && isinU && isinU.length >= 6 && upperCommand.includes(isinU)) hit = true;
        if (!hit && acr && acr.length >= 2 && tokens.has(acr)) hit = true;
        if (!hit && s.name && command.includes(s.name)) hit = true;
        if (!hit && s.name_en && upperCommand.includes(s.name_en.toUpperCase())) hit = true;

        if (hit && !matched.has(s.symbol)) matched.set(s.symbol, s);
    }
    return [...matched.values()];
}

// يبني مقدمة للرسالة توضّح الرمز الرسمي المعتمد لكل سهم مذكور + سعره الحالي الفعلي
// من نظام مزامنة الموقع نفسه (وليس بحث Claude العام) — بحث الويب العام بيرجّع غالباً
// نسخة مؤرشفة/مفهرسة قديمة من صفحة السعر (شهر أو أكتر) مش السعر اللحظي الحقيقي،
// فبنغنيه عن البحث عن السعر خالص ونديله الرقم الموثوق مباشرة، ونخلّي البحث للبيانات
// اللي مفيش عندنا ليها مصدر مباشر (القوائم المالية، الأخبار، المنافسين...)
export function buildStockReferenceNote(matchedStocks) {
    if (!matchedStocks.length) return '';
    const lines = matchedStocks.map(s => {
        const label = s.name_en ? `${s.name} / ${s.name_en}` : s.name;
        const isinPart = s.isin ? `، ISIN: ${s.isin}` : '';
        let priceLine = '';
        if (s.price != null) {
            const changePart = s.change_percent != null ? ` (${Number(s.change_percent) >= 0 ? '+' : ''}${s.change_percent}%)` : '';
            const timePart = s.quote_time ? ` — بتاريخ/وقت السعر: ${new Date(s.quote_time).toISOString()}` : '';
            priceLine = `\n  السعر الحالي الموثوق (من نظام مزامنة الموقع مباشرة، وليس بحثاً عاماً): ${s.price} جنيه${changePart}${timePart}`;
        }
        return `- ${label} — الرمز الرسمي المعتمد: ${s.symbol}${isinPart}${priceLine}`;
    });
    return `بيانات مرجعية موثوقة من قاعدة بيانات الموقع:\n${lines.join('\n')}\n\n` +
        `تعليمات إلزامية:\n` +
        `1. استخدم الرمز الرسمي أعلاه بالتحديد عند أي بحث (وليس أي اسم أو اختصار شائع آخر مذكور في الأمر أدناه).\n` +
        `2. لو السعر الحالي مذكور أعلاه، اعتبره هو "السعر الحالي" الموثوق في تحليلك بالكامل (بما فيه حساب P/E وP/B والتحليل الفني) — لا تحاول البحث عن سعر أحدث منه أو تستبدله برقم من نتائج بحثك، لأن نتائج البحث العام غالباً تكون نسخة أرشيفية قديمة من صفحة السعر وليست السعر اللحظي.\n` +
        `3. استخدم البحث فقط للبيانات اللي مش متوفرة هنا (القوائم المالية، الأرباح، الأخبار، المنافسين، إلخ).\n\n`;
}
