var ArticleModel = require('../model/articleModel');
var UserModel = require('../model/userModel');
var CommentModel = require('../model/commentModel');

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

                        const limitParents = 5;
                        const limitReplies = 2;
                        
                        const parentComments = await CommentModel.getParentComments(article.id, req.session.userId, limitParents, 0);
                        const totalParents = await CommentModel.countParentComments(article.id);
                        const totalComments = await CommentModel.countTotalComments(article.id);

                        // Lấy replies cho từng parent comment
                        for (let comment of parentComments) {
                            if (comment.total_replies > 0) {
                                comment.replies = await CommentModel.getReplies(comment.id, req.session.userId, limitReplies, 0);
                            } else {
                                comment.replies = [];
                            }
                        }

                        res.render('post', {
                                title: article.title,
                                article,
                                relatedArticles,
                                isSaved,
                                isLiked,
                                comments: parentComments,
                                totalComments: totalComments,
                                totalParents: totalParents,
                                hasMoreParents: totalParents > limitParents
                        });
                } catch (error) {
                        console.error('Post page error:', error);
                        res.status(500).render('404', {
                                title: 'Lỗi hệ thống',
                                message: 'Có lỗi xảy ra, vui lòng thử lại sau.'
                        });
                }
        },

        // Lấy thêm bình luận gốc
        loadMoreComments: async (req, res) => {
            try {
                const { articleId } = req.params;
                const offset = parseInt(req.query.offset) || 0;
                const limit = 5;
                const limitReplies = 2;

                const parentComments = await CommentModel.getParentComments(articleId, req.session.userId, limit, offset);
                const totalParents = await CommentModel.countParentComments(articleId);

                for (let comment of parentComments) {
                    if (comment.total_replies > 0) {
                        comment.replies = await CommentModel.getReplies(comment.id, req.session.userId, limitReplies, 0);
                    } else {
                        comment.replies = [];
                    }
                }

                const hasMore = totalParents > offset + limit;
                const nextOffset = offset + limit;

                res.render('partials/comments-chunk', {
                    comments: parentComments,
                    articleId: articleId,
                    hasMoreParents: hasMore,
                    nextParentOffset: nextOffset
                });
            } catch (error) {
                console.error('Load more comments error:', error);
                res.status(500).send('Error');
            }
        },

        // Lấy thêm phản hồi
        loadMoreReplies: async (req, res) => {
            try {
                const { parentId } = req.params;
                const offset = parseInt(req.query.offset) || 0;
                const limit = 10; // Load 10 replies at a time when 'load more' is clicked

                const replies = await CommentModel.getReplies(parentId, req.session.userId, limit, offset);
                // Note: We don't have total_replies passed easily here without another query, 
                // but we can check if returned replies == limit to show another button,
                // or just do a quick count query. For simplicity, assume if we got exactly 'limit', there might be more.
                const hasMore = replies.length === limit;
                const nextOffset = offset + limit;

                res.render('partials/replies-chunk', {
                    replies: replies,
                    parentId: parentId,
                    hasMoreReplies: hasMore,
                    nextReplyOffset: nextOffset
                });
            } catch (error) {
                console.error('Load more replies error:', error);
                res.status(500).send('Error');
            }
        },

        // API thêm bình luận (HTMX)
        postComment: async (req, res) => {
                if (!req.session.userId) {
                        return res.status(401).send('<div class="error-msg">Vui lòng đăng nhập để bình luận.</div>');
                }

                const { articleId } = req.params;
                const { content, parent_id } = req.body;

                if (!content || content.trim() === '') {
                        return res.status(400).send('<div class="error-msg">Bình luận không được để trống.</div>');
                }

                try {
                        const newComment = await CommentModel.create(articleId, req.session.userId, content.trim(), parent_id || null);
                        
                        if (parent_id) {
                            // Render HTML cho Reply (Bình luận con)
                            res.render('partials/comment-item', { 
                                comment: newComment, 
                                isReply: true
                            });
                        } else {
                            // Render HTML cho Parent (Bình luận gốc)
                            res.render('partials/comment-thread', { 
                                comment: { ...newComment, replies: [] }, 
                                articleId: articleId
                            });
                        }
                } catch (error) {
                        console.error('Post comment error:', error);
                        res.status(500).send('<div class="error-msg">Có lỗi xảy ra, vui lòng thử lại sau.</div>');
                }
        },

        // API cập nhật bình luận (HTMX)
        updateComment: async (req, res) => {
                if (!req.session.userId) {
                        return res.status(401).send('Unauthorized');
                }

                const { id } = req.params;
                const { content } = req.body;

                if (!content || content.trim() === '') {
                        return res.status(400).send('Nội dung không được để trống.');
                }

                try {
                        const updated = await CommentModel.update(id, req.session.userId, content.trim());
                        if (!updated) {
                                return res.status(403).send('Forbidden or Comment not found');
                        }
                        // Trả về nội dung mới bọc trong thẻ p để giữ nguyên CSS
                        res.send(`<p class="comment-text">${updated.content}</p>`);
                } catch (error) {
                        console.error('Update comment error:', error);
                        res.status(500).send('Error');
                }
        },

        // API xóa bình luận (HTMX)
        deleteComment: async (req, res) => {
                if (!req.session.userId) {
                        return res.status(401).send('');
                }

                const { id } = req.params;

                try {
                        const deleted = await CommentModel.delete(id, req.session.userId);
                        if (!deleted) {
                                return res.status(403).send('');
                        }
                        // Trả về rỗng để HTMX xóa element (hx-swap="outerHTML")
                        res.send('');
                } catch (error) {
                        console.error('Delete comment error:', error);
                        res.status(500).send('');
                }
        },

        // API thích bình luận (HTMX)
        toggleCommentLike: async (req, res) => {
                if (!req.session.userId) {
                        return res.status(401).send('Unauthorized');
                }

                const { id } = req.params;

                try {
                        const result = await CommentModel.toggleLike(id, req.session.userId);
                        
                        const html = `
                        <button class="btn-reply" hx-post="/api/comments/${id}/like" hx-swap="outerHTML">
                            <i data-lucide="heart" size="14" class="${result.is_liked ? 'filled-icon' : ''}" style="${result.is_liked ? 'color: #e11d48;' : ''}"></i>
                            <span class="like-count">${result.like_count > 0 ? result.like_count : 'Thích'}</span>
                        </button>
                        `;
                        res.send(html);
                } catch (error) {
                        console.error('Like comment error:', error);
                        res.status(500).send('Error');
                }
        },

        // API báo cáo bình luận
        reportComment: async (req, res) => {
                if (!req.session.userId) {
                        return res.status(401).send('Unauthorized');
                }

                const { id } = req.params;

                try {
                        await CommentModel.report(id, req.session.userId);
                        res.send(''); // Không cần trả về giao diện, chỉ cần status 200 để alert chạy
                } catch (error) {
                        console.error('Report comment error:', error);
                        res.status(500).send('Error');
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