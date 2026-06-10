const pool = require('./config/database');

async function updateDb() {
  const client = await pool.connect();
  try {
    console.log('🔄 Bắt đầu cập nhật cơ sở dữ liệu...');

    // 1. Thêm cột role vào bảng users nếu chưa có
    try {
      await client.query(`ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'`);
      console.log('✅ Đã thêm cột "role" vào bảng users.');
    } catch (e) {
      if (e.code === '42701') {
        console.log('ℹ️ Cột "role" đã tồn tại.');
      } else {
        throw e;
      }
    }

    // Đặt quyền admin cho các tài khoản cũ (nếu username là admin)
    await client.query(`UPDATE users SET role = 'admin' WHERE username = 'admin'`);

    // 2. Tạo bảng saved_articles
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_articles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, article_id)
      )
    `);
    console.log('✅ Đã tạo bảng "saved_articles".');

    // 3. Tạo bảng article_likes
    await client.query(`
      CREATE TABLE IF NOT EXISTS article_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
        liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, article_id)
      )
    `);
    console.log('✅ Đã tạo bảng "article_likes".');

    console.log('🎉 Cập nhật cơ sở dữ liệu thành công!');
  } catch (err) {
    console.error('❌ Lỗi cập nhật DB:', err);
  } finally {
    client.release();
    pool.end();
  }
}

updateDb();
