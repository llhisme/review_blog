const pool = require('./config/database');

async function seedNaturieReview() {
    let client;
    try {
        client = await pool.connect();

        const title = "Review Nước hoa hồng Naturie Hatomugi: 'Nước thần' cấp ẩm sâu cho da dầu";
        const slug = "review-nuoc-hoa-hong-naturie-hatomugi";
        const thumbnail = "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800"; // Placeholder, can be changed later
        const affiliate_link = "https://shopee.vn/N%C6%B0%E1%BB%9Bc-Hoa-H%E1%BB%93ng-Toner-Naturie-Hatomugi-Skin-Conditioner-500ml-i.123456";
        const excerpt = "Khám phá sức mạnh cấp ẩm tuyệt vời từ chiết xuất hạt ý dĩ. Toner Naturie Hatomugi có thực sự xứng đáng với danh hiệu 'nước thần' bình dân số 1 Nhật Bản?";
        const category = "skincare";
        const skin_type = "oily"; // Phù hợp để recommend cho CeraVe (da dầu)
        const price_range = "budget";
        
        const content = `
            <p>Chào các nàng, tiếp nối series chăm sóc da dầu mụn, hôm nay PurePick mang đến một siêu phẩm cấp nước đến từ Nhật Bản: <strong>Nước hoa hồng Naturie Hatomugi Skin Conditioner</strong>. Đây là chai toner to oạch mà hầu như beauty blogger nào cũng từng nhắc đến.</p>

            <div class="verdict-card">
                <div class="verdict-header">
                    <span class="verdict-summary">Đánh giá nhanh: Ngon - Bổ - Rẻ</span>
                    <span class="verdict-score">9.0/10</span>
                </div>
                <p>Một chai lotion đa năng, dung tích "siêu to khổng lồ" 500ml. Cấp ẩm sâu, làm dịu da cực tốt nhờ chiết xuất hạt ý dĩ, hoàn hảo cho phương pháp lotion mask.</p>
            </div>

            <h2>1. Thiết kế và Trải nghiệm thực tế</h2>
            <p>Chai nhựa trong suốt khổng lồ 500ml cầm cực kỳ chắc tay. Tuy thiết kế hơi đơn điệu nhưng bù lại dung tích lớn giúp bạn xài thả ga mà không xót ví.</p>
            
            <div class="sensory-box">
                <div class="sensory-item">
                    <h4><i data-lucide="droplets"></i> Kết cấu</h4>
                    <p>Kết cấu lỏng nhẹ như nước vo gạo, màu trắng đục. Thấm cực kỳ nhanh vào da, không hề gây nhờn rít hay bí bách lỗ chân lông.</p>
                </div>
                <div class="sensory-item">
                    <h4><i data-lucide="wind"></i> Mùi hương</h4>
                    <p>Sản phẩm không có hương liệu nhân tạo, chỉ có mùi ngai ngái nhè nhẹ đặc trưng của chiết xuất hạt ý dĩ, rất dễ chịu và bay hơi nhanh.</p>
                </div>
            </div>

            <h2>2. Phân tích bảng thành phần</h2>
            <div class="ingredient-analysis">
                <div class="ing-header">
                    <i data-lucide="microscope"></i> Thành phần nổi bật
                </div>
                <div class="ing-row">
                    <span class="ing-name">Chiết xuất hạt Ý dĩ (Coix Extract)</span>
                    <span class="ing-safety safety-good">Dưỡng ẩm, làm sáng</span>
                </div>
                <div class="ing-row">
                    <span class="ing-name">Glycerin</span>
                    <span class="ing-safety safety-good">Cấp ẩm</span>
                </div>
                <div class="ing-row">
                    <span class="ing-name">Alcohol (Cồn)</span>
                    <span class="ing-safety safety-warn">Dung môi</span>
                </div>
            </div>
            <p><em>Lưu ý:</em> Sản phẩm có chứa một lượng cồn rất nhỏ đóng vai trò làm dung môi giúp dưỡng chất thấm nhanh hơn. Tuy nhiên, nó an toàn và không gây khô da.</p>

            <h2>3. Ưu điểm và Nhược điểm</h2>
            <div class="comparison-grid">
                <div class="compare-item">
                    <h3>Ưu điểm</h3>
                    <ul class="pros-list">
                        <li>Dung tích lớn 500ml, siêu tiết kiệm</li>
                        <li>Cấp ẩm tức thì, làm dịu da đang rát/đỏ</li>
                        <li>Thấm nhanh, không gây nhờn dính</li>
                        <li>Lý tưởng để làm Lotion Mask</li>
                    </ul>
                </div>
                <div class="compare-item">
                    <h3>Nhược điểm</h3>
                    <ul class="cons-list">
                        <li>Chai to khó mang theo khi đi du lịch</li>
                        <li>Có chứa lượng nhỏ cồn (da cực kỳ nhạy cảm với cồn nên test trước)</li>
                    </ul>
                </div>
            </div>

            <div class="conclusion-box">
                <h2>Lời kết</h2>
                <p>Naturie Hatomugi Skin Conditioner thực sự là một khoản đầu tư xứng đáng cho quy trình skincare cơ bản. Cấp ẩm tốt, dung tích "khủng" và giá thành vô cùng thân thiện. Nó đặc biệt phù hợp để cấp nước cho làn da dầu thiếu ẩm sau khi làm sạch sâu.</p>
            </div>
        `;

        const query = `
            INSERT INTO articles (title, slug, excerpt, content, thumbnail, affiliate_link, category, skin_type, price_range, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            ON CONFLICT (slug) DO UPDATE 
            SET title = EXCLUDED.title, 
                excerpt = EXCLUDED.excerpt,
                content = EXCLUDED.content, 
                thumbnail = EXCLUDED.thumbnail, 
                affiliate_link = EXCLUDED.affiliate_link,
                category = EXCLUDED.category, 
                skin_type = EXCLUDED.skin_type,
                price_range = EXCLUDED.price_range;
        `;

        await client.query(query, [
            title, 
            slug, 
            excerpt,
            content, 
            thumbnail, 
            affiliate_link,
            category, 
            skin_type, 
            price_range,
            'active'
        ]);

        console.log('✅ Đã tạo bài viết Naturie Toner thành công!');
    } catch (err) {
        console.error('❌ Lỗi seeding:', err);
    } finally {
        if (client) client.release();
    }
}

seedNaturieReview().then(() => process.exit(0));
