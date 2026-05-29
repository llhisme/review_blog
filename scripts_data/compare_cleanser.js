const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const content = `
<p>Tìm được một loại sữa rửa mặt chân ái cho da nhạy cảm khó như tìm người yêu vậy đó các nàng ạ. Quanh đi quẩn lại cũng chỉ có hai cái tên "quốc dân" là <strong>CeraVe Hydrating Cleanser</strong> và <strong>Cetaphil Gentle Skin Cleanser</strong>. Vậy đâu mới là lựa chọn thực sự giúp da nàng khỏe lên mỗi ngày?</p>

<div class="comparison-grid">
    <div class="compare-item">
        <h3>CeraVe Hydrating Cleanser</h3>
        <p><em>"Chiến thần phục hồi"</em></p>
        <div class="pros-list">
            <h4>Ưu điểm nổi bật</h4>
            <ul>
                <li>Chứa 3 loại Ceramide phục hồi da.</li>
                <li>Hyaluronic Acid giữ ẩm cực tốt.</li>
            </ul>
        </div>
        <a href="https://shope.ee/cleanser-link" target="_blank" rel="nofollow" class="btn-compare-aff">
            <i data-lucide="shopping-cart"></i> Check giá CeraVe
        </a>
    </div>

    <div class="compare-item">
        <h3>Cetaphil Gentle Skin Cleanser</h3>
        <p><em>"Sự an toàn tuyệt đối"</em></p>
        <div class="pros-list">
            <h4>Ưu điểm nổi bật</h4>
            <ul>
                <li>Công thức siêu đơn giản, không kích ứng.</li>
                <li>Giá cực kỳ kinh tế cho mọi đối tượng.</li>
            </ul>
        </div>
        <a href="https://shope.ee/cleanser-link" target="_blank" rel="nofollow" class="btn-compare-aff">
            <i data-lucide="shopping-cart"></i> Check giá Cetaphil
        </a>
    </div>
</div>

<h2>Cảm giác khi dùng thực tế</h2>
<p>Trước đây mình cứ tưởng sữa rửa mặt là phải có bọt mới sạch, nhưng dùng hai em này rồi mới thấy sai lầm. CeraVe cho mình cảm giác da "đủ đầy" dinh dưỡng, còn Cetaphil mang lại sự nhẹ nhàng như không. Đi làm về mệt, chỉ cần rửa với một trong hai em này là thấy da được thở rồi.</p>

<div class="verdict-box">
    <h3><i data-lucide="award"></i> Lựa chọn của mình</h3>
    <p>Nếu da bạn đang cần phục hồi sau khi dùng Retinol hay AHA/BHA: Hãy về đội của <strong>CeraVe</strong>.</p>
    <p>Nếu bạn muốn một thứ gì đó đơn giản nhất, sạch dịu nhất: Hãy chọn <strong>Cetaphil</strong>.</p>
    
    <div style="margin-top: 2rem; text-align: center;">
        <a href="https://shope.ee/cleanser-link" target="_blank" rel="nofollow" class="affiliate-btn">
            <i data-lucide="check-circle"></i>
            <span>MUA HÀNG CHÍNH HÃNG TẠI ĐÂY</span>
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
            WHERE slug = 'so-sanh-cerave-vs-cetaphil'
        `, [
            'CeraVe hay Cetaphil? Đâu mới là "chân ái" thực sự cho làn da nhạy cảm khó chiều?',
            content,
            'Hai loại sữa rửa mặt quốc dân này có gì khác biệt và loại nào sẽ giúp làn da của bạn khỏe lên mỗi ngày? Đọc ngay bài viết so sánh cực chi tiết!',
            'budget'
        ]);
        console.log('✅ Đã cập nhật bài so sánh sữa rửa mặt với CTA giống bài Bioderma!');
    } finally {
        client.release();
        await pool.end();
    }
}
seed();
