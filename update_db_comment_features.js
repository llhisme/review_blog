const pool = require('./config/database');

async function updateDbCommentFeatures() {
  const client = await pool.connect();
  try {
    console.log('🔄 Bắt đầu cập nhật bảng cho Thích và Báo cáo bình luận...');

    // 1. Tạo bảng comment_likes
    await client.query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, comment_id)
      )
    `);
    console.log('✅ Đã tạo bảng comment_likes thành công!');

    // 2. Tạo bảng comment_reports
    await client.query(`
      CREATE TABLE IF NOT EXISTS comment_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Đã tạo bảng comment_reports thành công!');

  } catch (err) {
    console.error('❌ Lỗi cập nhật DB:', err);
  } finally {
    client.release();
    pool.end();
  }
}

updateDbCommentFeatures();
