var ArticleModel = require('../model/articleModel');
var UserModel = require('../model/userModel');

var homeController = {
        // Trang chủ - Hiển thị danh sách bài viết ĐANG HOẠT ĐỘNG
        index: async (req, res) => {
                try {
                        const { category, skin_type, price_range, keyword } = req.query;
                        const filters = { category, skin_type, price_range, keyword };

                        const page = parseInt(req.query.page) || 1;
                        const limit = 4; // Cố định 4 bài viết trong Grid như bạn muốn test (Sau này có thể đổi thành 12)

                        let queryLimit = limit;
                        let offset = 0;

                        if (page === 1) {
                                queryLimit = limit + 1; // +1 bài cho mục "Gợi ý từ PurePick"
                                offset = 0;
                        } else {
                                queryLimit = limit;
                                offset = (limit + 1) + (page - 2) * limit;
                        }

                        const { articles, total } = await ArticleModel.getAllActive(filters, queryLimit, offset);

                        let totalPages = 1;
                        if (total > limit + 1) {
                                totalPages = 1 + Math.ceil((total - (limit + 1)) / limit);
                        }

                        // Chỉ trả về partial nếu HTMX yêu cầu đúng vùng kết quả
                        const isPartial = req.headers['hx-request'] && req.headers['hx-target'] === 'search-results';

                        res.render('index', {
                                title: 'PurePick - Review Mỹ phẩm Chuyên sâu',
                                description: 'Tìm kiếm sản phẩm chăm sóc sắc đẹp phù hợp nhất với làn da và ngân sách của bạn thông qua đánh giá chuyên gia.',
                                articles,
                                filters,
                                currentPage: page,
                                totalPages,
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

                        // Lấy bài viết liên quan (Truyền thêm recommended_slug nếu có)
                        const relatedArticles = await ArticleModel.getRelated(article.category, article.id, article.recommended_slug);

                        // Lấy trạng thái Save và Like của user
                        let isSaved = false;
                        let isLiked = false;
                        if (req.session.userId) {
                                isSaved = await UserModel.isSaved(req.session.userId, article.id);
                                isLiked = await UserModel.isLiked(req.session.userId, article.id);
                        }

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
                                relatedArticles,
                                isSaved,
                                isLiked
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
        },

        // Trang chính sách bảo mật
        privacyPolicy: (req, res) => {
                res.render('privacy-policy', {
                        title: 'Chính sách bảo mật - PurePick'
                });
        },

        // Trang điều khoản sử dụng
        termsOfUse: (req, res) => {
                res.render('terms-of-use', {
                        title: 'Điều khoản sử dụng - PurePick'
                });
        }
};

module.exports = homeController;