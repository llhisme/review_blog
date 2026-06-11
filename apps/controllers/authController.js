var UserModel = require('../model/userModel');
const bcrypt = require('bcryptjs');

var authController = {
    // Xử lý đăng nhập (API cho HTMX)
    login: async (req, res) => {
        const { username, password } = req.body;
        try {
            const user = await UserModel.findByUsername(username);
            
            if (!user) {
                return res.status(401).send('<div class="error-msg">Tài khoản không tồn tại.</div>');
            }

            // Fallback cho mật khẩu plain text (của admin cũ nếu có) hoặc bcrypt
            let isMatch = false;
            if (user.password.length === 60 || user.password.startsWith('$2')) {
                isMatch = await bcrypt.compare(password, user.password);
            } else {
                isMatch = (password === user.password);
            }

            if (isMatch) {
                req.session.userId = user.id;
                req.session.username = user.username;
                req.session.role = user.role;
                req.session.full_name = user.full_name;
                req.session.avatar_url = user.avatar_url;

                // Xử lý Ghi nhớ đăng nhập
                const { remember_me } = req.body;
                if (remember_me) {
                    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 ngày
                } else {
                    req.session.cookie.expires = false; // Hết hạn khi đóng trình duyệt
                }
                
                // Trả về HX-Location để HTMX thực hiện load lại trang mượt mà qua AJAX
                res.set('HX-Location', '{"path":"' + req.get('Referrer') + '", "target":"body"}');
                return res.send('');
            } else {
                return res.status(401).send('<div class="error-msg">Sai mật khẩu.</div>');
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send('<div class="error-msg">Lỗi hệ thống.</div>');
        }
    },

    // Xử lý đăng ký (API cho HTMX)
    register: async (req, res) => {
        const { full_name, username, password, confirm_password } = req.body;
        
        if (password !== confirm_password) {
            return res.status(400).send('<div class="error-msg">Mật khẩu xác nhận không khớp.</div>');
        }

        if (password.length < 6) {
            return res.status(400).send('<div class="error-msg">Mật khẩu phải từ 6 ký tự.</div>');
        }

        try {
            const existingUser = await UserModel.findByUsername(username);
            if (existingUser) {
                return res.status(400).send('<div class="error-msg">Tên đăng nhập đã tồn tại.</div>');
            }

            const newUser = await UserModel.create(username, password, full_name);
            
            // Đăng nhập tự động sau khi đăng ký
            req.session.userId = newUser.id;
            req.session.username = newUser.username;
            req.session.role = newUser.role;
            req.session.full_name = newUser.full_name;
            req.session.avatar_url = newUser.avatar_url;

            res.set('HX-Location', '{"path":"' + req.get('Referrer') + '", "target":"body"}');
            return res.send('');
        } catch (error) {
            console.error(error);
            return res.status(500).send('<div class="error-msg">Lỗi hệ thống.</div>');
        }
    },

    // Xử lý đăng xuất
    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/');
    },

    // API Lưu bài viết (HTMX)
    toggleSave: async (req, res) => {
        if (!req.session.userId) {
            // Trả về trigger để mở popup thay vì html
            res.set('HX-Trigger', 'open-auth-modal');
            return res.status(401).send('');
        }

        const articleId = req.params.id;
        try {
            const result = await UserModel.toggleSave(req.session.userId, articleId);
            
            // Trả về HTML nút mới (tô màu nếu đã lưu)
            if (result.saved) {
                return res.send('<button class="action-btn active" hx-post="/api/save/' + articleId + '" hx-swap="outerHTML"><i data-lucide="bookmark" class="filled-icon"></i> Đã lưu</button>');
            } else {
                return res.send('<button class="action-btn" hx-post="/api/save/' + articleId + '" hx-swap="outerHTML"><i data-lucide="bookmark"></i> Lưu bài</button>');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi');
        }
    },

    // API Thích bài viết (HTMX)
    toggleLike: async (req, res) => {
        if (!req.session.userId) {
            res.set('HX-Trigger', 'open-auth-modal');
            return res.status(401).send('');
        }

        const articleId = req.params.id;
        try {
            const result = await UserModel.toggleLike(req.session.userId, articleId);
            
            if (result.liked) {
                return res.send('<button class="action-btn active" hx-post="/api/like/' + articleId + '" hx-swap="outerHTML"><i data-lucide="heart" class="filled-icon"></i> Đã thích</button>');
            } else {
                return res.send('<button class="action-btn" hx-post="/api/like/' + articleId + '" hx-swap="outerHTML"><i data-lucide="heart"></i> Thích</button>');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi');
        }
    },

    // Trang bài viết đã lưu
    savedArticlesPage: async (req, res) => {
        if (!req.session.userId) {
            return res.redirect('/');
        }

        try {
            const { category, skin_type, price_range, keyword } = req.query;
            const filters = { category, skin_type, price_range, keyword };
            
            const page = parseInt(req.query.page) || 1;
            const limit = 8;
            const offset = (page - 1) * limit;

            const { articles, total } = await UserModel.getSavedArticles(req.session.userId, filters, limit, offset);
            const totalPages = Math.ceil(total / limit);

            // Chỉ trả về partial nếu HTMX yêu cầu đúng vùng kết quả
            const isPartial = req.headers['hx-request'] && req.headers['hx-target'] === 'saved-results';

            res.render('saved-articles', {
                title: 'Bài viết đã lưu - PurePick',
                articles: articles,
                filters: filters,
                currentPage: page,
                totalPages: totalPages,
                user: req.session,
                isPartial: isPartial
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi Server');
        }
    },

    // Trang hồ sơ cá nhân
    profilePage: async (req, res) => {
        if (!req.session.userId) {
            return res.redirect('/');
        }

        try {
            const user = await UserModel.findById(req.session.userId);
            res.render('profile', {
                title: 'Hồ sơ của tôi - PurePick',
                user: user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi Server');
        }
    },

    // Xử lý cập nhật hồ sơ (API cho HTMX)
    updateProfile: async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).send('<div class="error-msg">Vui lòng đăng nhập.</div>');
        }

        const { full_name, new_password, confirm_new_password } = req.body;
        let avatar_url = req.session.avatar_url; // Giữ nguyên ảnh cũ mặc định

        // Nếu có file upload lên, tạo đường dẫn mới
        if (req.file) {
            avatar_url = '/uploads/avatars/' + req.file.filename;
        }

        if (new_password && new_password !== confirm_new_password) {
            return res.status(400).send('<div class="error-msg">Mật khẩu xác nhận không khớp.</div>');
        }

        try {
            const updatedUser = await UserModel.updateProfile(req.session.userId, {
                full_name,
                avatar_url,
                new_password
            });

            // Cập nhật lại Session
            req.session.full_name = updatedUser.full_name;
            req.session.avatar_url = updatedUser.avatar_url;

            // Báo thành công và reload lại trang (để update Header)
            res.set('HX-Location', '{"path":"/profile", "target":"body"}');
            return res.send('');
        } catch (error) {
            console.error('Update Profile Error:', error);
            return res.status(500).send('<div class="error-msg">Lỗi cập nhật. Vui lòng thử lại.</div>');
        }
    }
};

module.exports = authController;
