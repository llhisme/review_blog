const pool = require('./config/database');

async function updateDbCommentReplies() {
  const client = await pool.connect();
  try {
    console.log('🔄 Bắt đầu cập nhật bảng comments...');

    await client.query(`
      ALTER TABLE comments 
      ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE
    `);
    
    console.log('✅ Đã thêm cột parent_id thành công!');
  } catch (err) {
    console.error('❌ Lỗi cập nhật DB:', err);
  } finally {
    client.release();
    pool.end();
  }
}

updateDbCommentReplies();
