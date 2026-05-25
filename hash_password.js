const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function hashPasswords() {
    const client = await pool.connect();
    try {
        console.log('--- BẮT ĐẦU MÃ HÓA MẬT KHẨU ---');
        
        // Lấy danh sách users có mật khẩu chưa mã hóa (bcrypt hash dài 60 ký tự)
        const { rows: users } = await client.query('SELECT id, username, password FROM users');
        
        for (const user of users) {
            if (user.password.length === 60 && user.password.startsWith('$2')) {
                console.log(`🔹 Tài khoản [${user.username}]: Đã được mã hóa trước đó. Bỏ qua.`);
                continue;
            }
            
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(user.password, salt);
            
            await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, user.id]);
            console.log(`✅ Tài khoản [${user.username}]: Mã hóa thành công!`);
        }
        
        console.log('--- HOÀN TẤT ---');
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
    } finally {
        client.release();
        await pool.end();
        process.exit(0);
    }
}

hashPasswords();