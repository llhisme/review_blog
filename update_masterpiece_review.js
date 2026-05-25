const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const richContent = `
<p>Nếu bạn sở hữu một làn da dầu "đỏng đảnh" và đang đi tìm một loại kem chống nắng không gây bí bách, không để lại vệt trắng thì chắc chắn cái tên <strong>La Roche-Posay Anthelios UVmune 400</strong> đã ít nhất một lần xuất hiện trong tầm ngắm. Sau 2 tuần trải nghiệm thực tế dưới cái nắng gắt, PurePick sẽ mang đến cho bạn góc nhìn chi tiết nhất về sản phẩm này.</p>

<h2>1. Thiết kế bao bì và Kết cấu (Texture)</h2>
<p>Vẫn giữ nguyên tone màu cam-trắng đặc trưng của dòng Anthelios, nhưng phiên bản UVmune 400 mang đến cảm giác chắc chắn hơn. Điểm cộng lớn nhất chính là kết cấu dạng sữa (fluid) cực kỳ lỏng nhẹ. Khi thoa lên da, sản phẩm thấm nhanh "như một cơn gió", để lại lớp finish khô thoáng nhưng vẫn có độ ẩm tự nhiên.</p>

<img src="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1200" alt="Kết cấu kem chống nắng La Roche-Posay">

<h2>2. Công nghệ màng lọc Mexoryl 400 đỉnh cao</h2>
<p>Đây chính là "linh hồn" của sản phẩm này. La Roche-Posay đã giới thiệu màng lọc UV độc quyền giúp bảo vệ da khỏi các tia UVA dài (400nm) - nguyên nhân chính gây lão hóa sớm và thâm nám mà nhiều loại kem chống nắng khác bỏ qua.</p>
<ul>
    <li><strong>Chống nắng phổ rộng:</strong> Bảo vệ tối ưu trước tia UVA và UVB.</li>
    <li><strong>Kháng nước & mồ hôi:</strong> Phù hợp cho cả những hoạt động ngoài trời hoặc đi bơi.</li>
    <li><strong>Không gây cay mắt:</strong> Một cải tiến đáng giá so với các phiên bản cũ.</li>
</ul>

<h2>3. Cảm nhận thực tế: Có thực sự kiềm dầu tốt?</h2>
<p>Với một người có làn da hỗn hợp thiên dầu như mình, việc kem chống nắng bị "xuống tone" vào cuối ngày là nỗi ám ảnh. Tuy nhiên, UVmune 400 đã làm rất tốt nhiệm vụ của mình. Sau khoảng 4-5 tiếng, vùng chữ T chỉ hơi bóng nhẹ, không hề có cảm giác nặng mặt hay nhờn rít.</p>

<blockquote>
    "UVmune 400 không chỉ là kem chống nắng, nó giống như một lớp màng bảo vệ vô hình nhưng cực kỳ kiên cố cho làn da dầu mụn."
</blockquote>

<h2>4. Ưu và nhược điểm</h2>
<h3>Ưu điểm:</h3>
<ul>
    <li>Thấm cực nhanh, không để lại vệt trắng (invisible finish).</li>
    <li>Khả năng bảo vệ da thuộc hàng Top 1 thị trường hiện nay.</li>
    <li>Lành tính, không chứa hương liệu, an toàn cho da nhạy cảm.</li>
</ul>
<h3>Nhược điểm:</h3>
<ul>
    <li>Giá thành hơi cao so với mặt bằng chung (khoảng 450k - 500k).</li>
    <li>Kết cấu lỏng nên dùng khá nhanh hết.</li>
</ul>

<h2>Kết luận: Có đáng để đầu tư?</h2>
<p>Câu trả lời là <strong>CÓ</strong>. Nếu bạn ưu tiên khả năng bảo vệ da và sự thoải mái khi sử dụng hàng ngày, đây là khoản đầu tư hoàn toàn xứng đáng. Sản phẩm đặc biệt khuyên dùng cho các nàng có làn da dầu, hỗn hợp dầu hoặc đang sử dụng các treatment mạnh.</p>
`;

async function updateArticle() {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE articles 
            SET title = $1,
                content = $2, 
                excerpt = $3,
                category = $4,
                skin_type = $5,
                price_range = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE slug = 'review-kcn-la-roche-posay-anthelios'
        `;
        const values = [
            'Đánh giá Kem chống nắng La Roche-Posay Anthelios UVmune 400: "Vua" của dòng da dầu?',
            richContent,
            'Phiên bản UVmune 400 mới nhất có thực sự bảo vệ da tốt hơn? Review chi tiết về kết cấu, độ kiềm dầu và khả năng chống nắng thực tế.',
            'skincare',
            'oily',
            'mid-range'
        ];
        
        await client.query(query, values);
        console.log('✅ Đã hoàn thành bài review "Siêu phẩm" cho PurePick!');
    } catch (err) {
        console.error('❌ Lỗi cập nhật:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

updateArticle();