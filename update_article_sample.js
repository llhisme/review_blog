const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const richContent = `
<p>Chào các bạn, trong thế giới công nghệ AI đang phát triển chóng mặt như hiện nay, việc tìm kiếm một trợ lý viết lách thực sự hiệu quả là điều không hề dễ dàng. Hôm nay, mình sẽ chia sẻ trải nghiệm thực tế sau một tuần "ăn ngủ" cùng <strong>Jasper AI</strong> - một trong những nền tảng tạo nội dung bằng AI hàng đầu thế giới.</p>

<h2>1. Giao diện và Trải nghiệm Người dùng</h2>
<p>Ngay từ khi đăng nhập, Jasper ghi điểm bởi giao diện hiện đại và sạch sẽ. Mọi tính năng được sắp xếp một cách logic, giúp cả những người mới bắt đầu cũng có thể làm quen chỉ sau vài phút. Hệ thống <em>Templates</em> đa dạng là một điểm cộng lớn, giúp bạn bắt đầu viết ngay mà không cần phải suy nghĩ quá nhiều về cấu trúc.</p>

<img src="https://images.unsplash.com/photo-1620712943543-bcc4628c9757?auto=format&fit=crop&q=80&w=1200" alt="Làm việc với AI">

<h2>2. Các tính năng nổi bật của Jasper AI</h2>
<ul>
    <li><strong>Long-form Assistant:</strong> Công cụ hỗ trợ viết bài blog chuyên sâu, giúp bạn tạo ra những bài viết hàng ngàn từ chỉ trong 15-20 phút.</li>
    <li><strong>Surfer SEO Integration:</strong> Tích hợp tối ưu hóa SEO ngay trong quá trình viết, giúp bài viết của bạn dễ dàng lọt Top Google.</li>
    <li><strong>50+ Templates:</strong> Từ bài đăng Facebook, tiêu đề quảng cáo cho đến mô tả sản phẩm Amazon, Jasper đều có sẵn khuôn mẫu.</li>
    <li><strong>Brand Voice:</strong> Tính năng độc đáo giúp Jasper học theo giọng văn riêng biệt của thương hiệu bạn.</li>
</ul>

<h2>3. Hiệu năng thực tế: Jasper viết có "mượt" không?</h2>
<p>Điểm khác biệt lớn nhất của Jasper so với các công cụ miễn phí là khả năng hiểu ngữ cảnh. Thay vì chỉ ghép các câu rời rạc, Jasper tạo ra một mạch văn tự nhiên, có sự kết nối logic giữa các đoạn. Đặc biệt, khả năng viết bằng tiếng Việt của Jasper đã cải thiện đáng kể trong năm 2024, câu từ trở nên tự nhiên và ít lỗi ngữ pháp hơn trước.</p>

<blockquote>
    "Jasper không chỉ là một công cụ viết lách, nó là một người đồng đội sáng tạo giúp bạn vượt qua rào cản 'sợ trang giấy trắng'."
</blockquote>

<h2>4. So sánh các gói giá</h2>
<p>Mặc dù giá của Jasper có phần cao hơn mặt bằng chung, nhưng những gì nó mang lại hoàn toàn xứng đáng nếu bạn là một nhà sáng tạo nội dung chuyên nghiệp hoặc chủ doanh nghiệp:</p>
<ul>
    <li><strong>Gói Creator:</strong> Phù hợp cho cá nhân, bắt đầu từ $39/tháng.</li>
    <li><strong>Gói Pro:</strong> Dành cho team nhỏ, hỗ trợ nhiều tính năng nâng cao hơn.</li>
    <li><strong>Gói Business:</strong> Giải pháp tùy chỉnh cho các doanh nghiệp lớn.</li>
</ul>

<h2>Kết luận</h2>
<p>Nếu bạn đang tìm kiếm một công cụ để bứt phá trong công việc viết lách và tối ưu hóa thời gian, Jasper AI chắc chắn là một khoản đầu tư thông minh. Đừng quên sử dụng link ưu đãi của mình bên dưới để nhận được những quyền lợi tốt nhất nhé!</p>
`;

async function updateArticle() {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE articles 
            SET content = $1, 
                excerpt = $2,
                title = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE slug = 'danh-gia-jasper-ai'
        `;
        const values = [
            richContent,
            'Đánh giá chi tiết Jasper AI năm 2024: Liệu đây có còn là công cụ tạo nội dung số 1 thị trường? Khám phá sức mạnh thực sự của AI trong viết lách.',
            'Đánh giá Jasper AI 2024: Sức mạnh thực sự của Trợ lý Viết lách AI'
        ];
        
        await client.query(query, values);
        console.log('✅ Đã cập nhật bài viết với nội dung hoàn chỉnh!');
    } catch (err) {
        console.error('❌ Lỗi cập nhật:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

updateArticle();