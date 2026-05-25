var db = require('../../config/database');

var ArticleModel = {
        // Lấy tất cả bài viết (Cho Admin - thấy cả active và inactive)
        getAll: async () => {
                const { rows } = await db.query(
                        'SELECT id, title, slug, excerpt, thumbnail, status, created_at FROM articles ORDER BY id DESC'
                );
                return rows;
        },

        // Lấy bài viết đang hoạt động (Cho trang chủ)
        getAllActive: async (filters = {}) => {
                let query = 'SELECT id, title, slug, excerpt, thumbnail, created_at, category, skin_type, price_range FROM articles WHERE status = $1';
                let params = ['active'];
                let counter = 2;

                if (filters.category && filters.category !== 'all') {
                        query += ` AND category = $${counter++}`;
                        params.push(filters.category);
                }
                if (filters.skin_type && filters.skin_type !== 'all') {
                        query += ` AND skin_type = $${counter++}`;
                        params.push(filters.skin_type);
                }
                if (filters.price_range && filters.price_range !== 'all') {
                        query += ` AND price_range = $${counter++}`;
                        params.push(filters.price_range);
                }
                if (filters.keyword && filters.keyword.trim() !== '') {
                        query += ` AND title ILIKE $${counter++}`;
                        params.push(`%${filters.keyword}%`);
                }

                query += ' ORDER BY id DESC';
                const { rows } = await db.query(query, params);
                return rows;
        },

        // Lấy bài viết theo slug
        getBySlug: async (slug, onlyActive = true) => {
                let query = 'SELECT * FROM articles WHERE slug = $1';
                let params = [slug];
                
                if (onlyActive) {
                        query += ' AND status = $2';
                        params.push('active');
                }

                const { rows } = await db.query(query, params);
                return rows[0] || null;
        },

        // Lấy bài viết theo id
        getById: async (id) => {
                const { rows } = await db.query(
                        'SELECT * FROM articles WHERE id = $1',
                        [id]
                );
                return rows[0] || null;
        },

        // Tạo bài viết mới
        create: async (data) => {
                const { title, slug, excerpt, content, thumbnail, affiliate_link, status, category, skin_type, price_range } = data;
                const { rows } = await db.query(
                        'INSERT INTO articles (title, slug, excerpt, content, thumbnail, affiliate_link, status, category, skin_type, price_range) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
                        [title, slug, excerpt, content, thumbnail || null, affiliate_link || null, status || 'active', category || null, skin_type || null, price_range || null]
                );
                return rows[0].id;
        },

        // Cập nhật bài viết
        update: async (id, data) => {
                console.log('--- MODEL UPDATE START ---');
                console.log('Model ID Received:', id);
                console.log('Model Data Received:', data);

                const { title, slug, excerpt, content, thumbnail, affiliate_link, status, category, skin_type, price_range } = data;
                
                const query = `
                        UPDATE articles 
                        SET title = $1, 
                            slug = $2, 
                            excerpt = $3, 
                            content = $4, 
                            thumbnail = $5, 
                            affiliate_link = $6, 
                            status = $7, 
                            category = $8,
                            skin_type = $9,
                            price_range = $10,
                            updated_at = CURRENT_TIMESTAMP 
                        WHERE id = $11
                `;
                
                const values = [
                        title,
                        slug,
                        excerpt,
                        content,
                        thumbnail,
                        affiliate_link,
                        status,
                        category || null,
                        skin_type || null,
                        price_range || null,
                        id
                ];

                console.log('Query Values:', values);

                try {
                        const result = await db.query(query, values);
                        console.log('Database Result:', result.rowCount, 'rows affected');
                        console.log('--- MODEL UPDATE END ---');
                        return result.rowCount > 0;
                } catch (error) {
                        console.error('Database Query Error:', error);
                        console.log('--- MODEL UPDATE END (ERROR) ---');
                        throw error;
                }
        },

        // Xóa bài viết
        delete: async (id) => {
                await db.query(
                        'DELETE FROM articles WHERE id = $1',
                        [id]
                );
                return true;
        },

        // Lấy bài viết liên quan
        getRelated: async (category, currentId) => {
                const { rows } = await db.query(
                        'SELECT id, title, slug, excerpt, thumbnail, category, skin_type FROM articles WHERE category = $1 AND id != $2 AND status = $3 ORDER BY RANDOM() LIMIT 3',
                        [category, currentId, 'active']
                );
                return rows;
        },

        // Đếm số bài viết
        count: async (onlyActive = false) => {
                let query = 'SELECT COUNT(*) as total FROM articles';
                let params = [];
                if (onlyActive) {
                        query += ' WHERE status = $1';
                        params.push('active');
                }
                const { rows } = await db.query(query, params);
                return parseInt(rows[0].total);
        }
};

module.exports = ArticleModel;