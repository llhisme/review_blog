const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const content = `
<p>Là phụ nữ, ai cũng mong muốn có một mái tóc bồng bềnh như ngoài tiệm mỗi ngày. Nhưng việc cầm cái máy sấy nặng nề và mớ lược uốn thực sự là một "cực hình". Đó là lý do <strong>Dyson Airwrap Multistyler</strong> ra đời. Với mức giá tương đương một chiếc iPhone, liệu nó có đáng để chúng mình "nhịn ăn nhịn tiêu" rinh về không?</p>

<h2>Cú sốc về công nghệ Coanda</h2>
<p>Mình từng tưởng sẽ không bao giờ tự uốn tóc được cho đến khi dùng Dyson. Nó không dùng nhiệt cao đốt cháy tóc mà dùng luồng khí. Tóc tự động bị hút vào trục uốn, nhìn kỳ diệu lắm luôn. Cảm giác khi dùng cực kỳ nhàn, không sợ bị bỏng tay hay cháy tóc như các loại máy thông thường.</p>

<h2>Trải nghiệm thực tế: Đẹp nhưng cần kỹ năng?</h2>
<ul>
    <li><strong>Sấy khô:</strong> Cực nhanh, tóc bóng mượt chứ không bị xơ xác.</li>
    <li><strong>Tạo kiểu:</strong> Sóng tóc ra kiểu xoăn lơi rất "vibe" Hàn Quốc.</li>
    <li><strong>Độ bền:</strong> Đây là điểm trừ nhỏ, vì không dùng nhiệt cao nên nếu không có xịt giữ nếp, lọn uốn sẽ duỗi ra sau khoảng 4-5 tiếng.</li>
</ul>

<h2>Dyson Airwrap vs Shark FlexStyle</h2>
<p>Shark đang nổi lên như một đối thủ giá rẻ hơn. Theo mình:
<ul>
    <li><strong>Dyson:</strong> Đẳng cấp hơn về thiết kế, luồng khí mượt hơn và bộ phụ kiện sang xịn mịn hơn.</li>
    <li><strong>Shark:</strong> Giá chỉ bằng một nửa, lực sấy mạnh nhưng cảm giác máy hơi ồn và không "sang" bằng.</li>
</ul>
Nếu nàng có điều kiện, đừng ngần ngại chọn Dyson, nó là một trải nghiệm hoàn toàn khác biệt.</p>

<div class="verdict-box">
    <h3><i data-lucide="award"></i> Kết luận từ Blogger</h3>
    <p><strong>Nên mua khi:</strong> Bạn yêu bản thân, muốn bảo vệ mái tóc lâu dài và thích sự tiện lợi, nhanh chóng.</p>
    <p><strong>Không nên mua khi:</strong> Bạn không có thói quen tạo kiểu tóc thường xuyên hoặc ngân sách chưa dư dả.</p>
    <p><strong>Chốt:</strong> "Đắt xắt ra miếng", mái tóc là góc con người mà, đầu tư cho nó chưa bao giờ là lỗ!</p>
    
    <div style="margin-top: 2rem; text-align: center;">
        <a href="https://shope.ee/dyson-airwrap-link" target="_blank" rel="nofollow" class="affiliate-btn">
            <i data-lucide="zap"></i>
            <span>XEM GIÁ DYSON CHÍNH HÃNG</span>
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
            WHERE slug = 'review-dyson-airwrap-multistyler'
        `, [
            'Dyson Airwrap Review: "Triệu đô" cho mái tóc? Có đáng để nhịn ăn nhịn tiêu để rinh về?',
            content,
            'Khám phá chiếc máy làm tóc đắt đỏ nhất thế giới và sự thật đằng sau công nghệ Coanda. Liệu nó có thay thế được salon chuyên nghiệp?',
            'luxury'
        ]);
        console.log('✅ Đã cập nhật bài review Dyson với CTA dưới kết luận!');
    } finally {
        client.release();
        await pool.end();
    }
}
seed();
