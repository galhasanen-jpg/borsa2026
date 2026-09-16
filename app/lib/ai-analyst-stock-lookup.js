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

// يبني مقدمة للرسالة توضّح الرمز الرسمي المعتمد لكل سهم مذكور، عشان Claude يبحث بيه
// بالتحديد بدل الاسم الشائع اللي ممكن يودّيه لبيانات قديمة أو غير مطابقة
export function buildStockReferenceNote(matchedStocks) {
    if (!matchedStocks.length) return '';
    const lines = matchedStocks.map(s => {
        const label = s.name_en ? `${s.name} / ${s.name_en}` : s.name;
        const isinPart = s.isin ? `، ISIN: ${s.isin}` : '';
        return `- ${label} — الرمز الرسمي المعتمد في قاعدة بيانات الموقع: ${s.symbol}${isinPart}`;
    });
    return `بيانات مرجعية موثوقة من قاعدة بيانات الموقع (ابحث بهذا الرمز الرسمي بالتحديد، وليس أي اسم أو اختصار شائع آخر مذكور في الأمر أدناه — الأسماء الشائعة قد تودّي لبيانات قديمة أو لشركة مختلفة على Yahoo/جوجل):\n${lines.join('\n')}\n\n`;
}
