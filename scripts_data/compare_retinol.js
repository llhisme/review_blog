const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const content = `
<p>Nếu là một "tín đồ" skincare, chắc chắn nàng không thể ngó lơ Retinol - "hoạt chất vàng" giúp giữ gìn tuổi thanh xuân. Nhưng chọn loại nào giữa một "đế chế" <strong>Obagi Clinical Retinol 0.5</strong> đắt đỏ và một <strong>The Ordinary Retinol 0.5%</strong> rẻ đến bất ngờ? Hôm nay mình sẽ mổ xẻ tận gốc để nàng chọn được "chân ái" nhé!</p>

<div class="comparison-grid">
    <div class="compare-item">
        <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400" alt="Obagi">
        <h3>Obagi Clinical Retinol 0.5</h3>
        <p><em>"Đắt xắt ra miếng"</em></p>
        <div class="pros-cons-container">
            <div class="pros-list">
                <h4>Tại sao mình mê?</h4>
                <ul>
                    <li>Texture dạng cream mướt mát, thấm nhanh.</li>
                    <li>Công nghệ giải phóng chậm dùng êm ru.</li>
                </ul>
            </div>
        </div>
        <a href="https://shope.ee/retinol-link" target="_blank" rel="nofollow" class="btn-compare-aff">
            <i data-lucide="shopping-cart"></i> Check giá Obagi
        </a>
    </div>

    <div class="compare-item">
        <img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400" alt="The Ordinary">
        <h3>The Ordinary Retinol 0.5%</h3>
        <p><em>"Chiến thần bình dân"</em></p>
        <div class="pros-cons-container">
            <div class="pros-list">
                <h4>Điểm cộng:</h4>
                <ul>
                    <li>Giá quá rẻ, ai cũng mua được.</li>
                    <li>Nền Squalane giúp da mềm mượt.</li>
                </ul>
            </div>
        </div>
        <a href="https://shope.ee/retinol-link" target="_blank" rel="nofollow" class="btn-compare-aff">
            <i data-lucide="shopping-cart"></i> Check giá Ordinary
        </a>
    </div>
</div>

<h2>Trải nghiệm thực tế của mình</h2>
<p>Mình tưởng sẽ không hợp với Retinol vì da khá nhạy cảm, nhưng khi thử Obagi thì mọi chuyện khác hẳn. Da căng bóng hơn mà không bị đỏ rát. Còn với The Ordinary, mình hay dùng để bôi vùng cổ - vừa tiết kiệm mà vẫn hiệu quả. Đi làm dùng Retinol buổi tối, sáng ra thấy da rạng rỡ hẳn.</p>

<div class="verdict-box">
    <h3><i data-lucide="award"></i> Chốt lại là...</h3>
    <p>Nếu nàng ưu tiên trải nghiệm "luxury" và sự ổn định: Chọn <strong>Obagi</strong>.</p>
    <p>Nếu nàng chỉ muốn thử hoạt chất với giá rẻ nhất: Chọn <strong>The Ordinary</strong>.</p>
    
    <div style="margin-top: 2rem; text-align: center;">
        <a href="https://shope.ee/retinol-link" target="_blank" rel="nofollow" class="affiliate-btn">
            <i data-lucide="sparkles"></i>
            <span>XEM GIÁ ƯU ĐÃI RETINOL TẠI ĐÂY</span>
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
            WHERE slug = 'so-sanh-retinol-obagi-vs-the-ordinary'
        `, [
            'Retinol Obagi vs The Ordinary: Đắt xắt ra miếng hay Bình dân là đủ? Kinh nghiệm thực tế từ một "con nghiện" Retinol',
            content,
            'Trận chiến giữa hai đại diện tiêu biểu của làng Retinol. Bạn nên đầu tư vào Obagi đắt đỏ hay The Ordinary giá rẻ? Đọc ngay review chi tiết!',
            'all'
        ]);
        console.log('✅ Đã cập nhật bài so sánh Retinol với CTA giống bài Bioderma!');
    } finally {
        client.release();
        await pool.end();
    }
}
seed();
