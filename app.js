const express = require('express');
const session = require('express-session');
const path = require('path');

// Import controllers
const homeController = require('./apps/controllers/homeController');
const adminController = require('./apps/controllers/adminController');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'apps/views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
        secret: process.env.SESSION_SECRET || 'purepick-secret-key-fallback',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24h
}));

// Global middleware to provide SITE_URL to all views
app.use((req, res, next) => {
        res.locals.SITE_URL = SITE_URL;
        next();
});

// ==================== ROUTES ====================

// Trang chủ
app.get('/', homeController.index);

// Trang chi tiết bài viết
app.get('/post/:slug', homeController.post);

// Trang giới thiệu
app.get('/about', homeController.about);

// API Tracking
app.post('/api/track-click/:id', homeController.trackClick);

// Admin - Đăng nhập
app.get('/admin/login', adminController.loginPage);
app.post('/admin/login', adminController.login);
app.get('/admin/logout', adminController.logout);

// Admin - Dashboard
app.get('/admin/dashboard', adminController.checkAuth, adminController.dashboard);

// Admin - Thêm bài viết mới
app.get('/admin/new', adminController.checkAuth, adminController.newArticle);

// Admin - Sửa bài viết
app.get('/admin/edit/:id', adminController.checkAuth, adminController.editArticle);

// Admin - Lưu bài viết
app.post('/admin/save', adminController.checkAuth, adminController.saveArticle);

// Admin - Xóa bài viết
app.post('/admin/delete/:id', adminController.checkAuth, adminController.deleteArticle);

// Admin - Đổi trạng thái bài viết
app.post('/admin/toggle-status/:id', adminController.checkAuth, adminController.toggleStatus);

// 404 - Không tìm thấy
app.use((req, res) => {
        res.status(404).render('404', {
                title: '404 - Không tìm thấy',
                message: 'Trang bạn tìm không tồn tại!'
        });
});

// Khởi động server (CHỈ THÊM '0.0.0.0' VÀO ĐÂY)
app.listen(PORT, '0.0.0.0', () => {
        console.log('='.repeat(50));
        console.log('🚀 Website đang chạy tại:');
        console.log(`    📖 Người dùng: http://localhost:${PORT}`);
        console.log(`    🔐 Admin:      http://localhost:${PORT}/admin/login`);
        console.log('='.repeat(50));
});