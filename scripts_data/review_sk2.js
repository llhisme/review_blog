const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const content = `
<p>Có bao giờ nàng soi gương và thấy làn da mình bỗng dưng "đứng tuổi", xỉn màu và lỗ chân lông to oạch dù vẫn skincare đều đặn không? Đó chính là lúc da đang "biểu tình" vì thiếu hụt nguồn năng lượng phục hồi đấy. Hôm nay, mình sẽ tâm sự thật lòng về trải nghiệm với <strong>SK-II Facial Treatment Essence</strong> - thứ mà người ta hay gọi là "nước thần" nhưng giá thì cũng "thần thánh" không kém.</p>

<h2>"Nước thần" này thực chất là gì?</h2>
<p>Về texture, em này lỏng như nước, không màu, thấm nhanh đến mức mình chưa kịp massage đã thấy da khô ráo rồi. Nhưng mà cái mùi... ôi thôi, mùi men rượu đặc trưng hơi "nồng" một chút, bạn nào mới dùng chắc sẽ thấy hơi lạ, nhưng dùng quen lại thấy nghiện vì cảm giác nó rất nguyên bản, không hương liệu.</p>

<h2>Cảm giác khi dùng: Có thực sự "đổi đời"?</h2>
<p>Mình nhớ hồi đầu mới dùng, da mình đang trong giai đoạn sần sùi do thức đêm. <strong>Tuần đầu tiên</strong>, cảm giác rõ nhất là da mềm hơn hẳn. <strong>Sang tuần thứ 3</strong>, lỗ chân lông ở hai bên cánh mũi trông se lại một chút, và cái hay nhất là độ bóng tự nhiên (glowy) bắt đầu xuất hiện. Kiểu như mặt mộc vẫn xinh, chỉ cần thêm tí son là tự tin ra đường rồi.</p>

<ul>
    <li><strong>Ưu điểm:</strong> Khả năng "reset" da cực đỉnh, làm đều màu da và giúp các bước dưỡng sau thấm tốt hơn.</li>
    <li><strong>Nhược điểm:</strong> Giá "chát" vô cùng và mùi hơi kén người dùng. Đặc biệt, bạn nào da quá nhạy cảm với men thì nên test kỹ nhé.</li>
</ul>

<h2>So với "đối thủ" Estee Lauder Micro Essence thì sao?</h2>
<p>Nhà Estee Lauder cũng có dòng Essence rất đỉnh. Theo mình thấy:
<ul>
    <li><strong>SK-II:</strong> Thiên về tái tạo bề mặt da, phù hợp cho nàng nào muốn da trong suốt, mờ thâm và se lỗ chân lông.</li>
    <li><strong>Estee Lauder:</strong> Thiên về cấp ẩm sâu và làm dịu da nhanh chóng.</li>
</ul>
Nếu da bạn khỏe và muốn "hack" tuổi, chọn SK-II. Nếu da đang khô và cần phục hồi, Estee Lauder sẽ là lựa chọn an toàn hơn.</p>

<div class="verdict-box">
    <h3><i data-lucide="award"></i> Tổng kết: Có nên "xuống tiền"?</h3>
    <p><strong>Ai nên mua:</strong> Phụ nữ trên 25 tuổi, muốn đầu tư lâu dài cho làn da không tuổi.</p>
    <p><strong>Ai không nên mua:</strong> Các bạn học sinh, sinh viên hoặc người có làn da cực kỳ nhạy cảm với thành phần lên men.</p>
    <p><strong>Repurchase?</strong> Chắc chắn có, dù đau ví nhưng nhìn làn da "thủy tinh" thì mình thấy hoàn toàn xứng đáng!</p>
    
    <div style="margin-top: 2rem; text-align: center;">
        <a href="https://shope.ee/sk-ii-link" target="_blank" rel="nofollow" class="affiliate-btn">
            <i data-lucide="shopping-cart"></i>
            <span>SĂN DEAL SK-II CHÍNH HÃNG TẠI ĐÂY</span>
        </a>
    </div>
</div>
`;

async function seed() {
    const client = await pool.connect();
    try {
        await client.query(`
            UPDATE articles 
            SET title = $1, content = $2, excerpt = $3, price_range = $4
            WHERE slug = 'review-nuoc-than-sk-ii-facial-treatment-essence'
        `, [
            'Review "Nước thần" SK-II Facial Treatment Essence: Liệu có đáng để "đầu tư" hay chỉ là lời đồn?',
            content,
            'Nàng đang phân vân có nên chi tiền triệu cho SK-II? Đọc ngay bài review chân thực sau 4 tuần trải nghiệm để biết sự thật nhé!',
            'luxury'
        ]);
        console.log('✅ Đã cập nhật bài review SK-II với CTA trong hộp kết luận!');
    } finally {
        client.release();
        await pool.end();
    }
}
seed();
