const db = require('../../config/database');

const NotificationModel = {
    // Tạo thông báo mới
    create: async (data) => {
        const { user_id, actor_id, type, article_id, comment_id } = data;
        
        // Tránh tạo thông báo nếu actor chính là user nhận
        if (user_id === actor_id) return null;

        const { rows } = await db.query(
            `INSERT INTO notifications (user_id, actor_id, type, article_id, comment_id) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id`,
            [user_id, actor_id, type, article_id, comment_id]
        );
        return rows[0];
    },

    // Lấy danh sách thông báo của user
    getByUserId: async (userId, limit = 20) => {
        const { rows } = await db.query(
            `SELECT n.id, n.type, n.is_read, n.created_at, n.article_id, n.comment_id,
                    u.full_name as actor_name, u.avatar_url as actor_avatar, u.username as actor_username,
                    a.title as article_title, a.slug as article_slug
             FROM notifications n
             JOIN users u ON n.actor_id = u.id
             JOIN articles a ON n.article_id = a.id
             WHERE n.user_id = $1
             ORDER BY n.created_at DESC
             LIMIT $2`,
            [userId, limit]
        );
        return rows;
    },

    // Đếm số thông báo chưa đọc
    countUnread: async (userId) => {
        const { rows } = await db.query(
            `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
        return parseInt(rows[0].count);
    },

    // Lấy chi tiết thông báo
    getById: async (id, userId) => {
        const { rows } = await db.query(
            `SELECT n.id, n.comment_id, a.slug as article_slug
             FROM notifications n
             JOIN articles a ON n.article_id = a.id
             WHERE n.id = $1 AND n.user_id = $2`,
            [id, userId]
        );
        return rows[0];
    },

    // Đánh dấu đã đọc một thông báo
    markAsRead: async (notifId, userId) => {
        await db.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
            [notifId, userId]
        );
        return true;
    },

    // Đánh dấu tất cả đã đọc
    markAllAsRead: async (userId) => {
        await db.query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
            [userId]
        );
        return true;
    }
};

module.exports = NotificationModel;
