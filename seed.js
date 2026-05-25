const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function seed() {
        console.log('🌱 Bắt đầu cài đặt database...\n');

        const client = await pool.connect();

        try {
                console.log('📦 Đang tạo bảng...');

                // Tạo bảng articles
                await client.query(`
                        CREATE TABLE IF NOT EXISTS articles (
                                id SERIAL PRIMARY KEY,
                                title VARCHAR(255) NOT NULL,
                                slug VARCHAR(255) UNIQUE NOT NULL,
                                excerpt TEXT,
                                content TEXT NOT NULL,
                                thumbnail VARCHAR(500),
                                affiliate_link VARCHAR(500),
                                status VARCHAR(20) DEFAULT 'active',
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                `);
                console.log('✅ Bảng "articles" đã sẵn sàng');

                // Tạo bảng users
                await client.query(`
                        CREATE TABLE IF NOT EXISTS users (
                                id SERIAL PRIMARY KEY,
                                username VARCHAR(50) UNIQUE NOT NULL,
                                password VARCHAR(255) NOT NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                `);
                console.log('✅ Bảng "users" đã sẵn sàng');

                // Bước 3: Thêm dữ liệu mẫu
                console.log('\n📦 Đang thêm dữ liệu mẫu...\n');

                // Tạo tài khoản admin
                await client.query(`
                        INSERT INTO users (username, password) 
                        VALUES ('admin', 'admin123')
                        ON CONFLICT (username) DO NOTHING
                `);
                console.log('✅ Đã tạo tài khoản admin:');
                console.log('   📧 Username: admin');
                console.log('   🔑 Password: admin123');

                // Tạo bài viết mẫu
                const sampleArticle = {
                        title: 'Đánh giá Jasper AI sau 7 ngày dùng thử: Có đáng tiền không?',
                        slug: 'danh-gia-jasper-ai',
                        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
                        excerpt: 'Trải nghiệm thực tế của mình với Jasper AI, từ lúc đăng ký dùng thử đến khi viết được những bài blog đầu tiên.',
                        content: `<h2>Jasper AI là gì?</h2><p>Jasper AI là công cụ viết nội dung bằng trí tuệ nhân tạo hàng đầu...</p>`,
                        affiliate_link: 'https://jasper.ai/?fpr=YOUR-AFFILIATE-CODE',
                        status: 'active'
                };

                // Kiểm tra xem bài viết mẫu đã tồn tại chưa
                const { rows: existing } = await client.query(
                        'SELECT id FROM articles WHERE slug = $1',
                        [sampleArticle.slug]
                );

                if (existing.length === 0) {
                        await client.query(
                                `INSERT INTO articles (title, slug, thumbnail, excerpt, content, affiliate_link, status) 
                                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                                [sampleArticle.title, sampleArticle.slug, sampleArticle.thumbnail, sampleArticle.excerpt, sampleArticle.content, sampleArticle.affiliate_link, sampleArticle.status]
                        );
                        console.log(`✅ Đã tạo bài viết mẫu: "${sampleArticle.title}"`);
                }

                console.log('\n🎉 CÀI ĐẶT HOÀN TẤT!');

        } catch (err) {
                console.error('\n❌ LỖI:', err.message);
        } finally {
                client.release();
                await pool.end();
                process.exit(0);
        }
}

seed();