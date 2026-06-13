const pool = require('./config/database');

async function updateDbNotifications() {
  const client = await pool.connect();
  try {
    console.log('🔄 Bắt đầu tạo bảng notifications...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        actor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
        comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Đã tạo bảng notifications thành công!');
  } catch (err) {
    console.error('❌ Lỗi cập nhật DB:', err);
  } finally {
    client.release();
    pool.end();
  }
}

updateDbNotifications();
