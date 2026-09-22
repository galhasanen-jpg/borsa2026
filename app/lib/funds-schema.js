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
            inception_date DATE,
            currency TEXT NOT NULL DEFAULT 'EGP',
            subscription_fee TEXT,
            redemption_fee TEXT,
            entry_days TEXT,
            exit_days TEXT,
            source_note TEXT,
            prospectus_pdf BYTEA,
            prospectus_filename TEXT,
            external_ref TEXT,
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
    // تعديلات على جدول موجود بالفعل على الإنتاج (اتعمل قبل ما نسيب inception_date اختيارية
    // ونضيف external_ref لدعم الاستيراد الدفعي — كل التعديلات آمنة التكرار
    await client.query(`ALTER TABLE investment_funds ALTER COLUMN inception_date DROP NOT NULL`);
    await client.query(`ALTER TABLE investment_funds ADD COLUMN IF NOT EXISTS external_ref TEXT`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS investment_funds_external_ref_idx ON investment_funds(external_ref) WHERE external_ref IS NOT NULL`);
}
