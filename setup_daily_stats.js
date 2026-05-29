const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDailyStats() {
    const client = await pool.connect();
    try {
        console.log('Đang thiết lập bảng thống kê theo ngày...');
        
        // 1. Tạo bảng article_stats
        await client.query(`
            CREATE TABLE IF NOT EXISTS article_stats (
                id SERIAL PRIMARY KEY,
                article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
                stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
                views INTEGER DEFAULT 0,
                affiliate_clicks INTEGER DEFAULT 0,
                UNIQUE(article_id, stat_date)
            );
        `);

        // 2. Chuyển dữ liệu hiện tại vào ngày hôm nay để khởi tạo (Optional - giúp Dashboard có số liệu ngay)
        // Chúng ta lấy dữ liệu từ bảng articles (đã có số ngẫu nhiên trước đó) đưa vào stats của ngày hôm nay
        await client.query(`
            INSERT INTO article_stats (article_id, stat_date, views, affiliate_clicks)
            SELECT id, CURRENT_DATE, views, affiliate_clicks FROM articles
            ON CONFLICT (article_id, stat_date) DO UPDATE 
            SET views = EXCLUDED.views, 
                affiliate_clicks = EXCLUDED.affiliate_clicks;
        `);

        console.log('✅ Đã thiết lập bảng thống kê theo ngày thành công!');
    } catch (err) {
        console.error('❌ Lỗi thiết lập:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

setupDailyStats();