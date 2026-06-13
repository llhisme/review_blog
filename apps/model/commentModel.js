const db = require('../../config/database');

const CommentModel = {
    // Lấy danh sách bình luận gốc kèm phân trang
    getParentComments: async (articleId, currentUserId = null, limit = 5, offset = 0) => {
        const { rows } = await db.query(
            `SELECT c.id, c.content, c.created_at, c.parent_id, c.user_id, u.full_name, u.username, u.avatar_url,
                    (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as like_count,
                    EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = $2) as is_liked,
                    (SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.id) as total_replies
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.article_id = $1 AND c.parent_id IS NULL
             ORDER BY c.created_at DESC
             LIMIT $3 OFFSET $4`,
            [articleId, currentUserId, limit, offset]
        );
        return rows;
    },

    // Lấy danh sách bình luận con kèm phân trang
    getReplies: async (parentId, currentUserId = null, limit = 2, offset = 0) => {
        const { rows } = await db.query(
            `SELECT c.id, c.content, c.created_at, c.parent_id, c.user_id, u.full_name, u.username, u.avatar_url,
                    (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as like_count,
                    EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = $2) as is_liked
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.parent_id = $1
             ORDER BY c.created_at ASC
             LIMIT $3 OFFSET $4`,
            [parentId, currentUserId, limit, offset]
        );
        return rows;
    },

    countParentComments: async (articleId) => {
        const { rows } = await db.query(`SELECT COUNT(*) FROM comments WHERE article_id = $1 AND parent_id IS NULL`, [articleId]);
        return parseInt(rows[0].count);
    },

    countTotalComments: async (articleId) => {
        const { rows } = await db.query(`SELECT COUNT(*) FROM comments WHERE article_id = $1`, [articleId]);
        return parseInt(rows[0].count);
    },

    // Thêm bình luận mới
    create: async (articleId, userId, content, parentId = null) => {
        const { rows } = await db.query(
            `INSERT INTO comments (article_id, user_id, content, parent_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, content, created_at, parent_id, user_id`,
            [articleId, userId, content, parentId]
        );
        
        const newCommentId = rows[0].id;
        const commentRows = await db.query(
            `SELECT c.id, c.content, c.created_at, c.parent_id, c.user_id, u.full_name, u.username, u.avatar_url,
                    0 as like_count, false as is_liked
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = $1`,
            [newCommentId]
        );
        
        return commentRows.rows[0];
    },

    // Cập nhật nội dung bình luận
    update: async (commentId, userId, content) => {
        const { rows } = await db.query(
            `UPDATE comments SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING content`,
            [content, commentId, userId]
        );
        return rows[0]; 
    },

    // Xóa bình luận
    delete: async (commentId, userId) => {
        const { rows } = await db.query(
            `DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id`,
            [commentId, userId]
        );
        return rows[0]; 
    },

    // Lấy chủ sở hữu của bình luận (để gửi thông báo)
    getCommentOwner: async (commentId) => {
        const { rows } = await db.query(
            `SELECT user_id, article_id FROM comments WHERE id = $1`,
            [commentId]
        );
        return rows[0];
    },

    // Thích / Bỏ thích bình luận
    toggleLike: async (commentId, userId) => {
        // Kiểm tra xem đã like chưa
        const check = await db.query(`SELECT 1 FROM comment_likes WHERE user_id = $1 AND comment_id = $2`, [userId, commentId]);
        let isLiked = false;
        
        if (check.rows.length > 0) {
            // Nếu đã like -> Xóa (Bỏ thích)
            await db.query(`DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2`, [userId, commentId]);
        } else {
            // Chưa like -> Thêm (Thích)
            await db.query(`INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)`, [userId, commentId]);
            isLiked = true;
        }

        // Đếm lại tổng số like
        const countRes = await db.query(`SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1`, [commentId]);
        return {
            like_count: parseInt(countRes.rows[0].count),
            is_liked: isLiked
        };
    },

    // Báo cáo bình luận
    report: async (commentId, userId, reason = 'Vi phạm tiêu chuẩn cộng đồng') => {
        await db.query(
            `INSERT INTO comment_reports (user_id, comment_id, reason) VALUES ($1, $2, $3)`,
            [userId, commentId, reason]
        );
        return true;
    }
};

module.exports = CommentModel;