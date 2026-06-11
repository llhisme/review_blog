var db = require('../../config/database');

var ArticleModel = {
        // Lấy bài viết có phân trang (Cho Admin)
        getPaginated: async (offset, limit) => {
                const { rows } = await db.query(
                        'SELECT id, title, slug, excerpt, thumbnail, status, views, affiliate_clicks, created_at FROM articles ORDER BY id DESC LIMIT $1 OFFSET $2',
                        [limit, offset]
                );
                return rows;
        },

        // Lấy tất cả bài viết (Dùng cho các trường hợp cần list đầy đủ)
        getAll: async () => {
                const { rows } = await db.query(
                        'SELECT id, title, slug, excerpt, thumbnail, status, views, affiliate_clicks, created_at FROM articles ORDER BY id DESC'
                );
                return rows;
        },

        // Lấy bài viết đang hoạt động (Cho trang chủ, có phân trang và lọc tips)
        getAllActive: async (filters = {}, limit = 12, offset = 0) => {
                let query = 'SELECT id, title, slug, excerpt, thumbnail, created_at, category, skin_type, price_range FROM articles WHERE status = $1';
                let countQuery = 'SELECT COUNT(*) FROM articles WHERE status = $1';
                let params = ['active'];
                let counter = 2;

                if (filters.category && filters.category !== 'all') {
                        query += ` AND category = $${counter}`;
                        countQuery += ` AND category = $${counter}`;
                        params.push(filters.category);
                        counter++;
                } else {
                        // Mặc định ẩn bài viết chuyên mục 'tips' ở trang chủ
                        query += ` AND (category != 'tips' OR category IS NULL)`;
                        countQuery += ` AND (category != 'tips' OR category IS NULL)`;
                }

                if (filters.skin_type && filters.skin_type !== 'all') {
                        query += ` AND skin_type = $${counter}`;
                        countQuery += ` AND skin_type = $${counter}`;
                        params.push(filters.skin_type);
                        counter++;
                }
                if (filters.price_range && filters.price_range !== 'all') {
                        query += ` AND price_range = $${counter}`;
                        countQuery += ` AND price_range = $${counter}`;
                        params.push(filters.price_range);
                        counter++;
                }
                if (filters.keyword && filters.keyword.trim() !== '') {
                        query += ` AND title ILIKE $${counter}`;
                        countQuery += ` AND title ILIKE $${counter}`;
                        params.push(`%${filters.keyword}%`);
                        counter++;
                }

                query += ` ORDER BY id DESC LIMIT $${counter} OFFSET $${counter + 1}`;
                
                const { rows: articles } = await db.query(query, [...params, limit, offset]);
                const { rows: countRows } = await db.query(countQuery, params);
                
                return { 
                    articles, 
                    total: parseInt(countRows[0].count) 
                };
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
                const { title, slug, excerpt, content, thumbnail, affiliate_link, status, category, skin_type, price_range, recommended_slug } = data;
                const { rows } = await db.query(
                        'INSERT INTO articles (title, slug, excerpt, content, thumbnail, affiliate_link, status, category, skin_type, price_range, recommended_slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
                        [title, slug, excerpt, content, thumbnail || null, affiliate_link || null, status || 'active', category || null, skin_type || null, price_range || null, recommended_slug || null]
                );
                return rows[0].id;
        },

        // Cập nhật bài viết
        update: async (id, data) => {
                console.log('--- MODEL UPDATE START ---');
                console.log('Model ID Received:', id);
                console.log('Model Data Received:', data);

                const { title, slug, excerpt, content, thumbnail, affiliate_link, status, category, skin_type, price_range, recommended_slug } = data;
                
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
                            updated_at = CURRENT_TIMESTAMP,
                            recommended_slug = $11
                        WHERE id = $12
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
                        recommended_slug || null,
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

        // Lấy bài viết liên quan (Có ưu tiên bài viết recommended)
        getRelated: async (category, currentId, recommendedSlug = null) => {
                let relatedArticles = [];
                let excludeIds = [currentId];

                // Nếu có bài viết được recommend, lấy nó lên đầu
                if (recommendedSlug) {
                        const { rows: recommendedRows } = await db.query(
                                'SELECT id, title, slug, excerpt, thumbnail, category, skin_type FROM articles WHERE slug = $1 AND status = $2',
                                [recommendedSlug, 'active']
                        );
                        if (recommendedRows.length > 0) {
                                // Thêm cờ để view biết đây là bài được recommend
                                recommendedRows[0].is_recommended = true;
                                relatedArticles.push(recommendedRows[0]);
                                excludeIds.push(recommendedRows[0].id);
                        }
                }

                // Lấy thêm bài viết cùng chuyên mục để lấp đầy (tổng cộng 3 bài)
                const limit = 3 - relatedArticles.length;
                if (limit > 0) {
                        // Tạo chuỗi tham số $1, $2, $3... cho excludeIds
                        const excludeParams = excludeIds.map((_, index) => `$${index + 3}`).join(',');
                        const { rows } = await db.query(
                                `SELECT id, title, slug, excerpt, thumbnail, category, skin_type FROM articles WHERE category = $1 AND status = $2 AND id NOT IN (${excludeParams}) ORDER BY RANDOM() LIMIT ${limit}`,
                                [category, 'active', ...excludeIds]
                        );
                        relatedArticles = relatedArticles.concat(rows);
                }

                return relatedArticles;
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
        },

        // Tăng lượt xem bài viết
        incrementViews: async (id) => {
                // 1. Tăng tổng lượt xem trong bảng articles
                await db.query(
                        'UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE id = $1',
                        [id]
                );
                // 2. Tăng lượt xem trong ngày tại bảng article_stats
                await db.query(`
                        INSERT INTO article_stats (article_id, stat_date, views)
                        VALUES ($1, CURRENT_DATE, 1)
                        ON CONFLICT (article_id, stat_date) 
                        DO UPDATE SET views = article_stats.views + 1
                `, [id]);
        },

        // Tăng lượt click affiliate
        incrementClicks: async (id) => {
                // 1. Tăng tổng click trong bảng articles
                await db.query(
                        'UPDATE articles SET affiliate_clicks = COALESCE(affiliate_clicks, 0) + 1 WHERE id = $1',
                        [id]
                );
                // 2. Tăng click trong ngày tại bảng article_stats
                await db.query(`
                        INSERT INTO article_stats (article_id, stat_date, affiliate_clicks)
                        VALUES ($1, CURRENT_DATE, 1)
                        ON CONFLICT (article_id, stat_date) 
                        DO UPDATE SET affiliate_clicks = article_stats.affiliate_clicks + 1
                `, [id]);
        },

        // Đổi trạng thái bài viết (Hoạt động <-> Ẩn)
        toggleStatus: async (id) => {
                await db.query(
                        "UPDATE articles SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END WHERE id = $1",
                        [id]
                );
                return true;
        },

        // Lấy thống kê cho Dashboard (Hỗ trợ lọc theo ngày)
        getStats: async (date = null) => {
                let totalViewsQuery, totalClicksQuery, topViewedQuery, topClickedQuery;
                let params = [];

                if (date) {
                        // Thống kê theo một ngày cụ thể
                        totalViewsQuery = "SELECT SUM(COALESCE(s.views, 0)) as total FROM article_stats s JOIN articles a ON s.article_id = a.id WHERE s.stat_date = $1 AND a.status = 'active'";
                        totalClicksQuery = "SELECT SUM(COALESCE(s.affiliate_clicks, 0)) as total FROM article_stats s JOIN articles a ON s.article_id = a.id WHERE s.stat_date = $1 AND a.status = 'active'";
                        
                        topViewedQuery = `
                                SELECT a.id, a.title, a.slug, s.views, s.affiliate_clicks 
                                FROM article_stats s 
                                JOIN articles a ON s.article_id = a.id 
                                WHERE s.stat_date = $1 AND a.status = 'active' 
                                ORDER BY s.views DESC LIMIT 5
                        `;
                        
                        topClickedQuery = `
                                SELECT a.id, a.title, a.slug, s.views, s.affiliate_clicks 
                                FROM article_stats s 
                                JOIN articles a ON s.article_id = a.id 
                                WHERE s.stat_date = $1 AND a.status = 'active' 
                                ORDER BY s.affiliate_clicks DESC LIMIT 5
                        `;
                        params = [date];
                } else {
                        // Thống kê Tổng (All Time)
                        totalViewsQuery = "SELECT SUM(COALESCE(views, 0)) as total FROM articles WHERE status = 'active'";
                        totalClicksQuery = "SELECT SUM(COALESCE(affiliate_clicks, 0)) as total FROM articles WHERE status = 'active'";
                        
                        topViewedQuery = "SELECT id, title, slug, views, affiliate_clicks FROM articles WHERE status = 'active' ORDER BY COALESCE(views, 0) DESC LIMIT 5";
                        topClickedQuery = "SELECT id, title, slug, views, affiliate_clicks FROM articles WHERE status = 'active' ORDER BY COALESCE(affiliate_clicks, 0) DESC LIMIT 5";
                }

                const totalViews = await db.query(totalViewsQuery, params);
                const totalClicks = await db.query(totalClicksQuery, params);
                const topViewed = await db.query(topViewedQuery, params);
                const topClicked = await db.query(topClickedQuery, params);

                return {
                        totalViews: parseInt(totalViews.rows[0].total || 0),
                        totalClicks: parseInt(totalClicks.rows[0].total || 0),
                        topViewed: topViewed.rows,
                        topClicked: topClicked.rows
                };
        }
};

module.exports = ArticleModel;