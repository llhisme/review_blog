const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');

// Cấu hình Multer cho Avatar Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/avatars')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// Import controllers
const homeController = require('./apps/controllers/homeController');
const adminController = require('./apps/controllers/adminController');
const authController = require('./apps/controllers/authController');
const chatController = require('./apps/controllers/chatController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'apps/views'));

// EJS Helper: Time Ago (Xử lý múi giờ Việt Nam)
app.locals.timeAgo = function(dateInput) {
    if (!dateInput) return '';
    
    // Vì thư viện pg đã được cấu hình parse đúng chuẩn UTC, ta có thể dùng trực tiếp
    const date = new Date(dateInput);
    const now = new Date();
    
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays <= 3) return `${diffInDays} ngày trước`;
    
    return date.toLocaleString('vi-VN', { 
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

// Cấu hình Session
const sessionMiddleware = session({
        secret: process.env.SESSION_SECRET || 'purepick-secret-key-fallback',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false } // Mặc định hết hạn khi đóng trình duyệt
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sessionMiddleware);

// Chia sẻ io instance qua req và middleware
app.use((req, res, next) => {
        req.io = io;
        res.locals.SITE_URL = SITE_URL;
        res.locals.user = req.session.userId ? { 
            id: req.session.userId, 
            username: req.session.username, 
            role: req.session.role,
            full_name: req.session.full_name,
            avatar_url: req.session.avatar_url
        } : null;
        next();
});

// Cấu hình Socket.io chia sẻ session
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

io.on('connection', (socket) => {
    const session = socket.request.session;
    if (session && session.userId) {
        // Tham gia phòng riêng theo userId để nhận thông báo cá nhân
        socket.join(`user_${session.userId}`);
        console.log(`User ${session.userId} connected via socket.`);
    }

    socket.on('disconnect', () => {
        // Handle disconnect if needed
    });
});

// ==================== ROUTES ====================

// Trang chủ
app.get('/', homeController.index);

// Trang chi tiết bài viết
app.get('/post/:slug', homeController.post);

// Trang giới thiệu
app.get('/about', homeController.about);

// Trang pháp lý
app.get('/privacy-policy', homeController.privacyPolicy);
app.get('/terms-of-use', homeController.termsOfUse);

// Auth & User routes
app.post('/auth/login', authController.login);
app.post('/auth/register', authController.register);
app.get('/auth/logout', authController.logout);
app.get('/saved', authController.savedArticlesPage);
app.get('/profile', authController.profilePage);
app.post('/api/profile', upload.single('avatar'), authController.updateProfile);

// User Actions
app.post('/api/save/:id', authController.toggleSave);
app.post('/api/like/:id', authController.toggleLike);
app.post('/api/comments/:articleId', homeController.postComment);
app.get('/api/comments/:articleId/more', homeController.loadMoreComments);
app.get('/api/comments/replies/:parentId', homeController.loadMoreReplies);
app.put('/api/comments/:id', homeController.updateComment);
app.delete('/api/comments/:id', homeController.deleteComment);
app.post('/api/comments/:id/like', homeController.toggleCommentLike);
app.post('/api/comments/:id/report', homeController.reportComment);

// Notifications
app.get('/api/notifications', homeController.getNotifications);
app.get('/api/notifications/unread-count', homeController.getUnreadCount);
app.post('/api/notifications/:id/read', homeController.readNotification);
app.post('/api/notifications/read-all', homeController.readAllNotifications);

// Tracking
app.post('/api/track-click/:id', homeController.trackClick);

// Chatbot AI
app.post('/api/chat', chatController.handleChat);

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
server.listen(PORT, '0.0.0.0', () => {
        console.log('='.repeat(50));
        console.log('🚀 Website đang chạy tại:');
        console.log(`    📖 Người dùng: http://localhost:${PORT}`);
        console.log(`    🔐 Admin:      http://localhost:${PORT}/admin/login`);
        console.log('='.repeat(50));
});