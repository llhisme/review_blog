const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const comparisonContentWithTable = `
<p>Nước tẩy trang là bước không thể thiếu trong quy trình skincare. Hôm nay, chúng mình sẽ đặt lên bàn cân hai "đối thủ" đáng gờm nhất trong phân khúc bình dân: <strong>Bioderma Sensibio H2O (Nắp hồng)</strong> và <strong>L'Oreal Micellar Water (Nắp xanh)</strong>. Liệu đắt hơn có luôn tốt hơn?</p>

<!-- Bảng so sánh thông số -->
<div class="comparison-table-wrapper">
    <table class="comparison-table">
        <thead>
            <tr>
                <th>Đặc điểm</th>
                <th>Bioderma Sensibio</th>
                <th>L'Oreal Micellar</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Dung tích</td>
                <td>500ml</td>
                <td>400ml</td>
            </tr>
            <tr>
                <td>Loại da phù hợp</td>
                <td>Da nhạy cảm, da khô</td>
                <td>Mọi loại da, da dầu</td>
            </tr>
            <tr>
                <td>Công nghệ</td>
                <td>Hạt Micelle nguyên bản</td>
                <td>Công nghệ Micellar</td>
            </tr>
            <tr>
                <td>Độ pH</td>
                <td>5.5 (Lý tưởng)</td>
                <td>6.0</td>
            </tr>
            <tr>
                <td>Xuất xứ</td>
                <td>Pháp</td>
                <td>Pháp</td>
            </tr>
        </tbody>
    </table>
</div>

<div class="comparison-grid">
    <!-- Sản phẩm 1 -->
    <div class="compare-item">
        <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400" alt="Bioderma">
        <h3>Bioderma Sensibio H2O</h3>
        <div class="pros-cons-container">
            <div class="pros-list">
                <h4>Ưu điểm</h4>
                <ul>
                    <li>Lành tính tuyệt đối cho da nhạy cảm.</li>
                    <li>Làm sạch sâu mà không cần rửa lại với nước.</li>
                    <li>Không gây khô căng hay nhờn rít.</li>
                </ul>
            </div>
            <div class="cons-list">
                <h4>Nhược điểm</h4>
                <ul>
                    <li>Giá thành cao (khoảng 400k/500ml).</li>
                    <li>Khó làm sạch các sản phẩm makeup chống nước mạnh.</li>
                </ul>
            </div>
        </div>
        <a href="https://shope.ee/bioderma-link" target="_blank" rel="nofollow" class="btn-compare-aff">
            <i data-lucide="shopping-cart" size="16"></i>
            Check giá Bioderma
        </a>
    </div>

    <!-- Sản phẩm 2 -->
    <div class="compare-item">
        <img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400" alt="L'Oreal">
        <h3>L'Oreal Micellar Water</h3>
        <div class="pros-cons-container">
            <div class="pros-list">
                <h4>Ưu điểm</h4>
                <ul>
                    <li>Giá cực kỳ hạt dẻ (khoảng 150k/400ml).</li>
                    <li>Dễ dàng tìm mua ở bất cứ đâu.</li>
                    <li>Khả năng làm sạch ổn cho nhu cầu hàng ngày.</li>
                </ul>
            </div>
            <div class="cons-list">
                <h4>Nhược điểm</h4>
                <ul>
                    <li>Có thể gây cảm giác hơi châm chích nhẹ với da quá nhạy cảm.</li>
                    <li>Lớp finish hơi dính nhẹ so với Bioderma.</li>
                </ul>
            </div>
        </div>
        <a href="https://shope.ee/loreal-link" target="_blank" rel="nofollow" class="btn-compare-aff">
            <i data-lucide="shopping-cart" size="16"></i>
            Check giá L'Oreal
        </a>
    </div>
</div>

<h2>So sánh chi tiết về hiệu năng</h2>
<p>Bioderma vẫn giữ vững ngôi vương về độ dịu nhẹ. Nếu bạn đang treatment hoặc có làn da "siêu đỏng đảnh", Bioderma là lựa chọn không thể thay thế. Trong khi đó, L'Oreal là sự lựa chọn kinh tế tuyệt vời cho học sinh, sinh viên chỉ dùng kem chống nắng hàng ngày.</p>

<div class="verdict-box">
    <h3><i data-lucide="award"></i> Kết luận từ PurePick</h3>
    <p><strong>Chọn Bioderma nếu:</strong> Bạn có ngân sách dư dả và ưu tiên sự an toàn tuyệt đối cho làn da nhạy cảm.</p>
    <p><strong>Chọn L'Oreal nếu:</strong> Bạn cần một sản phẩm làm sạch tốt với mức giá bình dân và làn da khỏe.</p>
    
    <a href="https://shope.ee/bioderma-link" target="_blank" rel="nofollow" class="affiliate-btn" style="margin-top: 1.5rem;">
        <span>Mua Bioderma (Lựa chọn tốt nhất)</span>
        <i data-lucide="external-link"></i>
    </a>
</div>
`;

async function updateComparisonWithTable() {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE articles 
            SET content = $1
            WHERE slug = 'so-sanh-bioderma-vs-loreal'
        `;
        await client.query(query, [comparisonContentWithTable]);
        console.log('✅ Đã thêm bảng so sánh thuộc tính vào bài viết!');
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

updateComparisonWithTable();