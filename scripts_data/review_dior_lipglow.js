const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const content = `
<p>Nàng có bao giờ rơi vào cảnh muốn đánh son nhưng môi lại khô khốc, bong tróc làm màu son lên lem nhem không? Đó là lý do tại sao <strong>Dior Addict Lip Glow</strong> luôn là vật bất ly thân trong túi xách của mình. Hôm nay, hãy cùng mình khám phá xem "nàng thơ" này có thực sự thần thánh như lời đồn không nhé!</p>

<h2>Thiết kế làm nên thương hiệu</h2>
<p>Phải thừa nhận, nhìn cái vỏ màu hồng tiểu thư sang chảnh này thôi là đã muốn rút ví rồi. Cầm trên tay nặng, chắc chắn, đúng đẳng cấp Dior. Đi làm hay đi cafe với bạn bè, chỉ cần lấy em này ra dặm lại thôi là thấy mình "chanh sả" lên vài phần rồi.</p>

<h2>Chất son và Cảm giác khi dùng</h2>
<p>Em này có texture dạng sáp mềm, mướt như bơ. Khi lên môi, cảm giác đầu tiên là sự mát lạnh dễ chịu. Điểm mình thích nhất là nó không hề gây dính hay bóng nhẫy như mỡ hành đâu, mà là một lớp finish căng mọng tự nhiên.</p>
<ul>
    <li><strong>Màu sắc:</strong> Màu 001 Pink và 004 Coral là hai màu mình ưng nhất. Nó lên màu dựa trên độ pH của môi nên mỗi nàng sẽ có một sắc thái riêng.</li>
    <li><strong>Độ dưỡng:</strong> Cực đỉnh! Môi mình hay nẻ mà dùng em này cả ngày thấy môi mềm hẳn, không còn vảy da chết nữa.</li>
</ul>

<h2>So với Bobbi Brown Extra Lip Tint</h2>
<p>Đây là hai đối thủ "kẻ tám lạng, người nửa cân". 
<ul>
    <li><strong>Dior:</strong> Thiên về độ bóng nhẹ và bao bì cực đẹp, màu sắc phong phú hơn.</li>
    <li><strong>Bobbi Brown:</strong> Dưỡng sâu hơn một chút, phù hợp cho nàng nào môi cực kỳ khô, nhưng thiết kế hơi đơn giản.</li>
</ul>
Cá nhân mình vẫn chọn Dior vì cảm giác nó mang lại niềm vui mỗi khi sử dụng!</p>

<div class="verdict-box">
    <h3><i data-lucide="award"></i> Đánh giá tổng quan</h3>
    <p><strong>Ai nên mua:</strong> Các nàng yêu phong cách tự nhiên, thích đồ hiệu và cần một thỏi son dưỡng chất lượng.</p>
    <p><strong>Ai không nên mua:</strong> Bạn nào cần son lên màu đậm chuẩn hoặc muốn tiết kiệm ngân sách.</p>
    <p><strong>Có mua lại không?</strong> Luôn luôn! Đây là thỏi son dưỡng thứ 5 của mình rồi đó.</p>
    
    <div style="margin-top: 2rem; text-align: center;">
        <a href="https://shope.ee/dior-lipglow-link" target="_blank" rel="nofollow" class="affiliate-btn">
            <i data-lucide="heart"></i>
            <span>SỞ HỮU SON DIOR CHÍNH HÃNG</span>
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
            WHERE slug = 'review-son-duong-dior-addict-lip-glow'
        `, [
            'Dior Addict Lip Glow Review: "Nàng thơ" của mọi cô gái hay chỉ là món đồ hiệu xa xỉ? Đọc ngay nếu nàng không muốn phí tiền!',
            content,
            'Liệu thỏi son dưỡng đắt đỏ nhất thế giới này có thực sự xứng đáng với vị trí số 1 trong lòng phái đẹp? Cùng PurePick giải mã nhé!',
            'luxury'
        ]);
        console.log('✅ Đã cập nhật bài review son Dior với CTA dưới kết luận!');
    } finally {
        client.release();
        await pool.end();
    }
}
seed();
