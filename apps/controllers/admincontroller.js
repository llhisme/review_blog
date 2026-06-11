const ArticleModel = require('../model/articleModel');
const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const sanitizeHtml = require('sanitize-html');

const sanitizeOptions = {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption', 'colgroup', 'col', 'span', 'u', 's']),
        allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                '*': ['style', 'class', 'id'],
                'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
                'table': ['cellpadding', 'cellspacing', 'border'],
                'th': ['colspan', 'rowspan'],
                'td': ['colspan', 'rowspan']
        },
        allowedStyles: {
                '*': {
                        // Allow all styles for now to ensure Quill compatibility
                        'color': [/^#(?:[0-9a-fA-F]{3}){1,2}$/, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
                        'background-color': [/^#(?:[0-9a-fA-F]{3}){1,2}$/, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
                        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
                        'font-size': [/^\d+(?:px|em|rem|%)$|small|medium|large|huge/]
                }
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
                if (req.session && req.session.isAdmin) {
                        return res.redirect('/admin/dashboard');
                }
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
                                
                                // Kiểm tra quyền admin
                                if (user.role !== 'admin') {
                                        return res.render('admin/login', {
                                                title: 'Đăng nhập Quản trị',
                                                error: 'Bạn không có quyền truy cập vào khu vực này!'
                                        });
                                }

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
                                        req.session.userId = user.id;
                                        req.session.username = user.username;
                                        req.session.role = user.role;
                                        req.session.full_name = user.full_name;
                                        req.session.avatar_url = user.avatar_url;
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
                        const page = parseInt(req.query.page) || 1;
                        const limit = 10;
                        const offset = (page - 1) * limit;
                        const selectedDate = req.query.date || null; // Lấy ngày từ query bài viết

                        const articles = await ArticleModel.getPaginated(offset, limit);
                        const totalArticles = await ArticleModel.count();
                        const totalPages = Math.ceil(totalArticles / limit);
                        const stats = await ArticleModel.getStats(selectedDate); // Truyền ngày vào stats

                        // Nếu là request từ HTMX, chỉ trả về phần nội dung (Stats + Table)
                        if (req.headers['hx-request']) {
                                return res.render('admin/dashboard', {
                                        layout: false,
                                        articles,
                                        stats,
                                        totalArticles,
                                        page,
                                        totalPages,
                                        selectedDate, // Gửi lại ngày đã chọn
                                        onlyContent: true
                                });
                        }

                        res.render('admin/dashboard', {
                                title: 'Quản lý bài viết',
                                articles,
                                totalArticles,
                                stats,
                                page,
                                totalPages,
                                selectedDate, // Gửi lại ngày đã chọn
                                onlyContent: false,
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
        },

        // Đổi trạng thái bài viết (Hoạt động <-> Ẩn)
        toggleStatus: async (req, res) => {
                try {
                        await ArticleModel.toggleStatus(req.params.id);
                        
                        // Lấy URL hiện tại từ header HTMX để giữ nguyên trang và bộ lọc ngày
                        const currentUrl = req.header('hx-current-url');
                        if (currentUrl) {
                                try {
                                        // Trích xuất path và query string để redirect chính xác
                                        const urlObj = new URL(currentUrl, `${req.protocol}://${req.get('host')}`);
                                        return res.redirect(urlObj.pathname + urlObj.search);
                                } catch (e) {
                                        console.error('URL parse error:', e);
                                }
                        }
                        
                        res.redirect('/admin/dashboard');
                } catch (error) {
                        console.error('Toggle status error:', error);
                        res.status(500).send('Lỗi khi đổi trạng thái');
                }
        }
};

module.exports = adminController;