import { Pool } from 'pg';

const pool = new Pool({
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ljzudmkmvdwigqocnyfm',
    password: 'XWN@53KIw100',
    ssl: { rejectUnauthorized: false }
});

export async function getConnection() {
    const client = await pool.connect();
    return client;
}