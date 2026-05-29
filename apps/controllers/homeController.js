var ArticleModel = require('../model/articleModel');

var homeController = {
        // Trang chủ - Hiển thị danh sách bài viết ĐANG HOẠT ĐỘNG
        index: async (req, res) => {
                try {
                        const { category, skin_type, price_range, keyword } = req.query;
                        const filters = { category, skin_type, price_range, keyword };

                        var articles = await ArticleModel.getAllActive(filters);
                        
                        // Chỉ trả về partial nếu HTMX yêu cầu đúng vùng kết quả
                        const isPartial = req.headers['hx-request'] && req.headers['hx-target'] === 'search-results';

                        res.render('index', {
                                title: 'PurePick - Review Mỹ phẩm Chuyên sâu',
                                description: 'Tìm kiếm sản phẩm chăm sóc sắc đẹp phù hợp nhất với làn da và ngân sách của bạn thông qua đánh giá chuyên gia.',
                                articles,
                                filters,
                                isPartial
                        });
                } catch (error) {
                        console.error('Home page error:', error);
                        res.status(500).render('404', {
                                title: 'Lỗi hệ thống',
                                message: 'Có lỗi xảy ra, vui lòng thử lại sau.'
                        });
                }
        },

        // Trang chi tiết bài viết (Chỉ cho xem bài viết ACTIVE)
        post: async (req, res) => {
                try {
                        var article = await ArticleModel.getBySlug(req.params.slug, true);

                        if (!article) {
                                return res.status(404).render('404', {
                                        title: 'Không tìm thấy bài viết',
                                        message: 'Bài viết bạn tìm không tồn tại hoặc đã bị ẩn.'
                                });
                        }

                        // Lấy bài viết liên quan
                        const relatedArticles = await ArticleModel.getRelated(article.category, article.id);

                        // Tối ưu lượt xem: Chỉ tăng view nếu chưa xem trong session này
                        if (!req.session.viewed_posts) {
                                req.session.viewed_posts = [];
                        }

                        if (!req.session.viewed_posts.includes(article.id)) {
                                // Tăng lượt xem bài viết (chạy ngầm)
                                ArticleModel.incrementViews(article.id).catch(err => console.error('View tracking error:', err));
                                // Đánh dấu đã xem
                                req.session.viewed_posts.push(article.id);
                        }

                        res.render('post', {
                                title: article.title,
                                article,
                                relatedArticles
                        });
                } catch (error) {
                        console.error('Post page error:', error);
                        res.status(500).render('404', {
                                title: 'Lỗi hệ thống',
                                message: 'Có lỗi xảy ra, vui lòng thử lại sau.'
                        });
                }
        },

        // API Theo dõi click affiliate
        trackClick: async (req, res) => {
                try {
                        const { id } = req.params;
                        await ArticleModel.incrementClicks(id);
                        res.status(200).json({ success: true });
                } catch (error) {
                        console.error('Click tracking error:', error);
                        res.status(500).json({ success: false });
                }
        },

        // Trang giới thiệu
        about: (req, res) => {
                res.render('about', {
                        title: 'Về PurePick - Hành trình Sắc đẹp'
                });
        }
};

module.exports = homeController;