var db = require('../../config/database');
const bcrypt = require('bcryptjs');

var UserModel = {
    // Tìm người dùng theo username
    findByUsername: async (username) => {
        const { rows } = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        return rows[0];
    },

    // Tìm người dùng theo id
    findById: async (id) => {
        const { rows } = await db.query(
            'SELECT id, username, role, full_name, avatar_url, created_at FROM users WHERE id = $1',
            [id]
        );
        return rows[0];
    },

    // Tạo người dùng mới
    create: async (username, password, fullName) => {
        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo avatar mặc định theo tên (hoặc username nếu ko có tên)
        const nameForAvatar = fullName || username;
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=6366f1&color=fff&rounded=true&bold=true`;

        const { rows } = await db.query(
            'INSERT INTO users (username, password, role, full_name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role, full_name, avatar_url',
            [username, hashedPassword, 'user', fullName, defaultAvatar]
        );
        return rows[0];
    },

    // Kiểm tra xem bài viết đã được lưu chưa
    isSaved: async (userId, articleId) => {
        const { rows } = await db.query(
            'SELECT * FROM saved_articles WHERE user_id = $1 AND article_id = $2',
            [userId, articleId]
        );
        return rows.length > 0;
    },

    // Lưu / Bỏ lưu bài viết
    toggleSave: async (userId, articleId) => {
        const isSaved = await UserModel.isSaved(userId, articleId);
        if (isSaved) {
            await db.query(
                'DELETE FROM saved_articles WHERE user_id = $1 AND article_id = $2',
                [userId, articleId]
            );
            return { saved: false };
        } else {
            await db.query(
                'INSERT INTO saved_articles (user_id, article_id) VALUES ($1, $2)',
                [userId, articleId]
            );
            return { saved: true };
        }
    },

    // Kiểm tra xem bài viết đã được thích chưa
    isLiked: async (userId, articleId) => {
        const { rows } = await db.query(
            'SELECT * FROM article_likes WHERE user_id = $1 AND article_id = $2',
            [userId, articleId]
        );
        return rows.length > 0;
    },

    // Thích / Bỏ thích bài viết
    toggleLike: async (userId, articleId) => {
        const isLiked = await UserModel.isLiked(userId, articleId);
        if (isLiked) {
            await db.query(
                'DELETE FROM article_likes WHERE user_id = $1 AND article_id = $2',
                [userId, articleId]
            );
            return { liked: false };
        } else {
            await db.query(
                'INSERT INTO article_likes (user_id, article_id) VALUES ($1, $2)',
                [userId, articleId]
            );
            return { liked: true };
        }
    },

    // Lấy danh sách bài viết đã lưu của user
    getSavedArticles: async (userId) => {
        const { rows } = await db.query(
            `SELECT a.id, a.title, a.slug, a.excerpt, a.thumbnail, a.category, a.skin_type, a.created_at, sa.saved_at
             FROM articles a
             JOIN saved_articles sa ON a.id = sa.article_id
             WHERE sa.user_id = $1 AND a.status = 'active'
             ORDER BY sa.saved_at DESC`,
            [userId]
        );
        return rows;
    },

    // Cập nhật hồ sơ người dùng
    updateProfile: async (userId, data) => {
        const { full_name, avatar_url, new_password } = data;
        
        let query = 'UPDATE users SET full_name = $1, avatar_url = $2';
        let values = [full_name, avatar_url];
        let index = 3;

        if (new_password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(new_password, salt);
            query += `, password = $${index}`;
            values.push(hashedPassword);
            index++;
        }

        query += ` WHERE id = $${index} RETURNING id, username, role, full_name, avatar_url`;
        values.push(userId);

        const { rows } = await db.query(query, values);
        return rows[0];
    }
};

module.exports = UserModel;
