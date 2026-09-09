// القائمة الافتراضية تُستخدم لعرض معاينة للزوار غير المسجلين، ولزرع قائمة كل مستخدم أول مرة يسجّل دخول
export const DEFAULT_BRIEFING_STOCKS = [
    { name: 'أبوظبي الإسلامي', name_en: 'ADIB Egypt', symbol: 'ADIB.CA' },
    { name: 'العربية للأسمنت', name_en: 'Arabian Cement', symbol: 'ARCC.CA' },
    { name: 'بلتون المالية', name_en: 'Beltone Financial', symbol: 'BTFH.CA' },
    { name: 'راميدا', name_en: 'Ramda', symbol: 'RMDA.CA' },
    { name: 'أوراسكوم للتنمية', name_en: 'Orascom Development', symbol: 'ORHD.CA' },
    { name: 'المنصورة للدواجن', name_en: 'Mansoura Poultry', symbol: null },
];

export function guestPreviewStocks() {
    return DEFAULT_BRIEFING_STOCKS.map((s, i) => ({ id: -(i + 1), ...s }));
}

// يرجع قائمة أسهم النشرة الخاصة بمستخدم معيّن، ويزرعها بالقائمة الافتراضية أول مرة يدخل فيها
export async function getUserBriefingStocks(client, userId) {
    let result = await client.query(
        `SELECT id, name, name_en, symbol FROM briefing_stocks WHERE user_id = $1 ORDER BY id ASC`,
        [userId]
    );

    if (result.rows.length === 0) {
        for (const s of DEFAULT_BRIEFING_STOCKS) {
            await client.query(
                `INSERT INTO briefing_stocks (user_id, name, name_en, symbol) VALUES ($1, $2, $3, $4)`,
                [userId, s.name, s.name_en, s.symbol]
            );
        }
        result = await client.query(
            `SELECT id, name, name_en, symbol FROM briefing_stocks WHERE user_id = $1 ORDER BY id ASC`,
            [userId]
        );
    }

    return result.rows;
}
