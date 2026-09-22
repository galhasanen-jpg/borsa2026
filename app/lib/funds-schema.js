// المشروع ده مفيهوش أداة migrations منفصلة — الجداول الموجودة كلها (stocks، sectors...)
// اتعملت مباشرة على قاعدة البيانات قبل كده. جداول صناديق الاستثمار بنضمن وجودها هنا
// بدل ما نحتاج خطوة SQL يدوية منفصلة — CREATE TABLE IF NOT EXISTS آمن يتنفّذ كل مرة.
export async function ensureFundsSchema(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS investment_funds (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            name_en TEXT,
            fund_type TEXT NOT NULL,
            manager_company TEXT,
            inception_date DATE NOT NULL,
            currency TEXT NOT NULL DEFAULT 'EGP',
            subscription_fee TEXT,
            redemption_fee TEXT,
            entry_days TEXT,
            exit_days TEXT,
            source_note TEXT,
            prospectus_pdf BYTEA,
            prospectus_filename TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `);
    await client.query(`
        CREATE TABLE IF NOT EXISTS fund_nav_history (
            id SERIAL PRIMARY KEY,
            fund_id INTEGER NOT NULL REFERENCES investment_funds(id) ON DELETE CASCADE,
            nav_date DATE NOT NULL,
            value NUMERIC NOT NULL,
            source_note TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(fund_id, nav_date)
        )
    `);
}
