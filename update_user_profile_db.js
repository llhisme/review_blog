const pool = require('./config/database');

async function updateUserProfileDb() {
  const client = await pool.connect();
  try {
    console.log('🔄 Bắt đầu cập nhật bảng users...');

    // 1. Thêm cột full_name
    try {
      await client.query(`ALTER TABLE users ADD COLUMN full_name VARCHAR(255)`);
      console.log('✅ Đã thêm cột "full_name" vào bảng users.');
    } catch (e) {
      if (e.code === '42701') {
        console.log('ℹ️ Cột "full_name" đã tồn tại.');
      } else {
        throw e;
      }
    }

    // 2. Thêm cột avatar_url
    try {
      await client.query(`ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)`);
      console.log('✅ Đã thêm cột "avatar_url" vào bảng users.');
    } catch (e) {
      if (e.code === '42701') {
        console.log('ℹ️ Cột "avatar_url" đã tồn tại.');
      } else {
        throw e;
      }
    }

    // Đặt tên mặc định cho tài khoản cũ (tùy chọn)
    await client.query(`UPDATE users SET full_name = username WHERE full_name IS NULL`);
    await client.query(`UPDATE users SET avatar_url = 'https://ui-avatars.com/api/?name=' || username || '&background=6366f1&color=fff' WHERE avatar_url IS NULL`);

    console.log('🎉 Cập nhật bảng users thành công!');
  } catch (err) {
    console.error('❌ Lỗi cập nhật DB:', err);
  } finally {
    client.release();
    pool.end();
  }
}

updateUserProfileDb();
