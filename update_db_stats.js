const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateDB() {
    const client = await pool.connect();
    try {
        console.log('Đang cập nhật database...');
        // Thêm cột views và affiliate_clicks nếu chưa có
        await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;`);
        await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS affiliate_clicks INTEGER DEFAULT 0;`);
        
        // Cập nhật ngẫu nhiên một số lượt view/click cho các bài viết đã có để demo
        await client.query(`UPDATE articles SET views = floor(random() * 500 + 100) WHERE (views IS NULL OR views = 0);`);
        await client.query(`UPDATE articles SET affiliate_clicks = floor(random() * 50 + 10) WHERE (affiliate_clicks IS NULL OR affiliate_clicks = 0);`);

        console.log('✅ Database đã được cập nhật với các cột thống kê!');
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

updateDB();