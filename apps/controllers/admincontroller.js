const ArticleModel = require('../model/articleModel');
const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const sanitizeHtml = require('sanitize-html');

const sanitizeOptions = {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe']),
        allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                '*': ['style', 'class', 'id'],
                'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen']
        }
};

const adminController = {
        // Middleware kiểm tra đăng nhập
        checkAuth: (req, res, next) => {
                if (req.session && req.session.isAdmin) {
                        return next();
                }
                res.redirect('/admin/login');
        },

        // Trang đăng nhập
        loginPage: (req, res) => {
                res.render('admin/login', {
                        title: 'Đăng nhập Admin',
                        error: null
                });
        },

        // Xử lý đăng nhập
        login: async (req, res) => {
                const { username, password } = req.body;

                try {
                        const { rows: users } = await db.query(
                                'SELECT * FROM users WHERE username = $1',
                                [username]
                        );

                        if (users.length > 0) {
                                const user = users[0];
                                // Kiểm tra xem mật khẩu có phải dạng hash không (bcrypt hash dài 60 ký tự)
                                let isMatch = false;
                                if (user.password.length === 60 || user.password.startsWith('$2')) {
                                        isMatch = await bcrypt.compare(password, user.password);
                                } else {
                                        // Fallback cho mật khẩu plain text (sẽ bị loại bỏ sau khi dùng tool hash)
                                        isMatch = (password === user.password);
                                }
                                
                                if (isMatch) {
                                        req.session.isAdmin = true;
                                        req.session.username = username;
                                        res.redirect('/admin/dashboard');
                                        return;
                                }
                        }
                        
                        res.render('admin/login', {
                                title: 'Đăng nhập Quản trị',
                                error: 'Tài khoản hoặc mật khẩu không chính xác!'
                        });
                } catch (error) {
                        console.error('Login error:', error);
                        res.render('admin/login', {
                                title: 'Đăng nhập Quản trị',
                                error: 'Máy chủ đang bận, vui lòng thử lại sau ít phút!'
                        });
                }
        },

        // Đăng xuất
        logout: (req, res) => {
                req.session.destroy();
                res.redirect('/admin/login');
        },

        // Dashboard - Danh sách bài viết
        dashboard: async (req, res) => {
                try {
                        const articles = await ArticleModel.getAll();
                        const totalArticles = await ArticleModel.count();

                        res.render('admin/dashboard', {
                                title: 'Quản lý bài viết',
                                articles,
                                totalArticles,
                                success: req.query.success || null
                        });
                } catch (error) {
                        console.error('Dashboard error:', error);
                        res.status(500).send('Lỗi hệ thống');
                }
        },

        // Form thêm bài mới
        newArticle: (req, res) => {
                res.render('admin/edit', {
                        title: 'Thêm bài viết mới',
                        article: null,
                        isEdit: false
                });
        },

        // Form sửa bài viết
        editArticle: async (req, res) => {
                try {
                        const article = await ArticleModel.getById(req.params.id);

                        if (!article) {
                                return res.redirect('/admin/dashboard');
                        }

                        res.render('admin/edit', {
                                title: 'Sửa bài viết',
                                article,
                                isEdit: true
                        });
                } catch (error) {
                        console.error('Edit article error:', error);
                        res.redirect('/admin/dashboard');
                }
        },
        
        // Lưu bài viết (thêm mới hoặc cập nhật)
        saveArticle: async (req, res) => {
                let { id, title, slug, excerpt, content, thumbnail, affiliate_link, status, category, skin_type, price_range } = req.body;

                // Validation cơ bản
                if (!title || !slug || !content) {
                        return res.status(400).send('Vui lòng điền đầy đủ thông tin bắt buộc!');
                }

                // Chống XSS - Làm sạch HTML
                content = sanitizeHtml(content, sanitizeOptions);

                try {
                        if (id) {
                                // Cập nhật
                                const updated = await ArticleModel.update(id, { title, slug, excerpt, content, thumbnail, affiliate_link, status, category, skin_type, price_range });
                                if (updated) {
                                        res.redirect('/admin/dashboard?success=updated');
                                } else {
                                        res.status(404).send('Không tìm thấy bài viết để cập nhật!');
                                }
                        } else {
                                // Thêm mới
                                await ArticleModel.create({ title, slug, excerpt, content, thumbnail, affiliate_link, status, category, skin_type, price_range });
                                res.redirect('/admin/dashboard?success=created');
                        }
                } catch (error) {
                        console.error('Save article error:', error);
                        if (error.code === '23505') {
                                res.status(400).send('Slug này đã tồn tại, vui lòng chọn slug khác!');
                        } else {
                                res.status(500).send('Lỗi khi lưu bài viết: ' + error.message);
                        }
                }
        },


        // Xóa bài viết
        deleteArticle: async (req, res) => {
                try {
                        await ArticleModel.delete(req.params.id);
                        res.redirect('/admin/dashboard?success=deleted');
                } catch (error) {
                        console.error('Delete article error:', error);
                        res.status(500).send('Lỗi khi xóa bài viết');
                }
        }
};

module.exports = adminController;