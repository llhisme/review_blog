const pool = require('./config/database');

async function seedCeraveReview() {
    let client;
    try {
        client = await pool.connect();

        const title = "Review Sữa rửa mặt CeraVe Foaming Facial Cleanser: Giải pháp 'vàng' cho làn da dầu mụn";
        const slug = "review-cerave-foaming-facial-cleanser-cho-da-dau";
        const thumbnail = "https://down-vn.img.susercontent.com/file/vn-11134201-7ras8-map1zcsih7d8e1@resize_w450_nl.webp";
        const affiliate_link = "https://shopee.vn/S%E1%BB%AFa-r%E1%BB%ADa-m%E1%BA%B7t-CeraVe-Foaming-Facial-Cleanser-473ml-i.123456789";
        const excerpt = "Khám phá lý do tại sao CeraVe Foaming Facial Cleanser lại được các tín đồ skincare 'săn đón' nồng nhiệt. Liệu nó có thực sự kiềm dầu và làm sạch sâu như lời đồn?";
        const category = "skincare";
        const skin_type = "oily";
        const price_range = "mid-range";

        const content = `
            <p>Chào các nàng, hôm nay PurePick sẽ cùng các nàng "mổ xẻ" một huyền thoại trong làng làm sạch - <strong>CeraVe Foaming Facial Cleanser</strong>. Đây là dòng sữa rửa mặt luôn nằm trong top "must-have" của các bác sĩ da liễu trên toàn thế giới.</p>

            <div class="verdict-card">
                <div class="verdict-header">
                    <span class="verdict-summary">Đánh giá nhanh: Cực kỳ đáng đầu tư</span>
                    <span class="verdict-score">9.5/10</span>
                </div>
                <p>Một sản phẩm làm sạch hoàn hảo cho da dầu mụn với độ pH 5.5 lý tưởng, chứa Ceramide và Niacinamide giúp bảo vệ hàng rào độ ẩm tự nhiên của da.</p>
            </div>

            <h2>1. Thiết kế và Trải nghiệm thực tế</h2>
            <p>Sản phẩm có thiết kế chai nhựa trắng tối giản với vòi nhấn (pump) cực kỳ tiện lợi và vệ sinh. Bản 473ml dùng "thả ga" cả nửa năm mới hết.</p>
            
            <div class="product-showcase">
                <img src="https://down-vn.img.susercontent.com/file/vn-11134201-7ras8-map1zcsih7d8e1@resize_w450_nl.webp" alt="CeraVe Foaming Facial Cleanser Chính Hãng">
                <img src="https://down-vn.img.susercontent.com/file/vn-11134201-7ras8-map1zctwf6a4ef@resize_w450_nl.webp" alt="Kết cấu dạng gel tạo bọt nhẹ">
            </div>

            <div class="sensory-box">
                <div class="sensory-item">
                    <h4><i data-lucide="droplets"></i> Kết cấu & Tạo bọt</h4>
                    <p>Dạng gel trong suốt. Khi massage với nước tạo ra lớp bọt mỏng nhẹ, tơi xốp chứ không dày đặc như sữa rửa mặt tạo bọt của Nhật/Hàn, giúp giảm ma sát lên da.</p>
                </div>
                <div class="sensory-item">
                    <h4><i data-lucide="wind"></i> Mùi hương & Cảm giác</h4>
                    <p>Hoàn toàn không chứa hương liệu (Fragrance-free). Sản phẩm có mùi ngai ngái rất nhẹ đặc trưng của dược mỹ phẩm. Rửa xong da ẩm mướt, không hề bị khô căng kin kít.</p>
                </div>
            </div>

            <h2>2. Đối tượng sử dụng</h2>
            <p>Không phải tự nhiên CeraVe chia ra rất nhiều dòng. Để sản phẩm phát huy tối đa công dụng, bạn cần chọn đúng loại da của mình:</p>
            <ul>
                <li><strong>Phù hợp nhất:</strong> Da dầu, da hỗn hợp thiên dầu, da mụn, da nhạy cảm đang cần làm sạch sâu nhưng không muốn tổn thương màng bảo vệ.</li>
                <li><strong>Có thể cân nhắc:</strong> Da thường đổ dầu nhẹ vào mùa hè.</li>
                <li><strong>Không nên dùng:</strong> Da quá khô, da bong tróc (Nên chuyển sang dòng <em>CeraVe Hydrating Cleanser</em> nắp xanh lá).</li>
            </ul>

            <h2>3. Phân tích bảng thành phần</h2>
            <p>Điểm làm nên sự khác biệt của CeraVe chính là công nghệ MVE độc quyền giúp giải phóng dưỡng chất từ từ và sự kết hợp của các "ngôi sao" phục hồi:</p>

            <div class="ingredient-analysis">
                <div class="ing-header">
                    <i data-lucide="microscope"></i> Phân tích thành phần cốt lõi
                </div>
                <div class="ing-row">
                    <span class="ing-name">Ceramides (1, 3, 6-II)</span>
                    <span class="ing-safety safety-good">Phục hồi</span>
                </div>
                <div class="ing-row">
                    <span class="ing-name">Hyaluronic Acid</span>
                    <span class="ing-safety safety-good">Dưỡng ẩm</span>
                </div>
                <div class="ing-row">
                    <span class="ing-name">Niacinamide</span>
                    <span class="ing-safety safety-good">Kiềm dầu</span>
                </div>
                <div class="ing-row">
                    <span class="ing-name">Parabens</span>
                    <span class="ing-safety safety-warn">Cân nhắc</span>
                </div>
            </div>

            <h2>4. Hướng dẫn sử dụng</h2>
            <p>Để tối ưu hiệu quả làm sạch của dòng Foaming, các nàng hãy thử áp dụng quy trình sau nhé:</p>
            
            <div class="how-to-use">
                <div class="step-item">
                    <h4>Bước 1: Làm ướt mặt</h4>
                    <p>Sử dụng nước ấm (không quá nóng) để làm ướt toàn bộ da mặt, giúp lỗ chân lông giãn nở nhẹ.</p>
                </div>
                <div class="step-item">
                    <h4>Bước 2: Tạo bọt kỹ</h4>
                    <p>Lấy 1 pump ra lòng bàn tay ướt, xoa đều hai tay để tạo lớp bọt tơi mịn trước khi áp lên mặt.</p>
                </div>
                <div class="step-item">
                    <h4>Bước 3: Massage 60s</h4>
                    <p>Massage nhẹ nhàng theo vòng tròn từ trong ra ngoài, tập trung vào vùng chữ T (trán, mũi, cằm) có nhiều dầu.</p>
                </div>
            </div>

            <h2>5. Ưu điểm và Nhược điểm</h2>
            <div class="comparison-grid">
                <div class="compare-item">
                    <h3>Ưu điểm</h3>
                    <ul class="pros-list">
                        <li>Làm sạch sâu nhưng không gây khô da</li>
                        <li>Độ pH 5.5 cân bằng hoàn hảo</li>
                        <li>Chứa Niacinamide hỗ trợ kiềm dầu</li>
                        <li>Dung tích lớn, cực kỳ tiết kiệm</li>
                    </ul>
                </div>
                <div class="compare-item">
                    <h3>Nhược điểm</h3>
                    <ul class="cons-list">
                        <li>Có chứa Paraben (tỷ lệ cực thấp)</li>
                        <li>Thiết kế chai to khó mang đi du lịch</li>
                    </ul>
                </div>
            </div>

            <blockquote>
                "Làn da sau khi rửa mặt xong vẫn giữ được độ mướt tự nhiên, đây là sữa rửa mặt chân ái mà mình luôn dự trữ sẵn trong phòng tắm."
            </blockquote>

            <h2>6. Lời khuyên kết hợp</h2>
            <p>Để tối ưu hóa quy trình kiểm soát dầu và trị mụn, sau khi làm sạch với CeraVe, bạn cần một bước cấp nước và cân bằng da mỏng nhẹ. PurePick gợi ý bạn nên sử dụng kết hợp với toner tràm trà hoặc ý dĩ lành tính.</p>

            <div class="routine-box">
                <h3><i data-lucide="sparkles"></i> Mảnh ghép hoàn hảo</h3>
                <p><strong>Nước hoa hồng Naturie Hatomugi Skin Conditioner</strong> sẽ là sự kết hợp tuyệt vời giúp cấp ẩm sâu mà không gây bí tắc lỗ chân lông cho da dầu. Bạn có thể kéo xuống phần "Có thể nàng sẽ thích" bên dưới để đọc bài review chi tiết về em toner này nhé!</p>
            </div>

            <div class="conclusion-box">
                <h2>Lời kết</h2>
                <p>CeraVe Foaming Facial Cleanser là minh chứng cho việc một sản phẩm dược mỹ phẩm bình dân vẫn có thể mang lại chất lượng vượt trội. Nếu bạn đang sở hữu làn da dầu, hỗn hợp thiên dầu hoặc đang trong quá trình điều trị mụn cần sự an toàn, đây chắc chắn là khoản đầu tư "không bao giờ lỗ".</p>
            </div>
        `;

        const query = `
            INSERT INTO articles (title, slug, excerpt, content, thumbnail, affiliate_link, category, skin_type, price_range, status, recommended_slug, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            ON CONFLICT (slug) DO UPDATE 
            SET title = EXCLUDED.title, 
                excerpt = EXCLUDED.excerpt,
                content = EXCLUDED.content, 
                thumbnail = EXCLUDED.thumbnail, 
                affiliate_link = EXCLUDED.affiliate_link,
                category = EXCLUDED.category, 
                skin_type = EXCLUDED.skin_type,
                price_range = EXCLUDED.price_range,
                recommended_slug = EXCLUDED.recommended_slug;
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
            'active',
            'review-nuoc-hoa-hong-naturie-hatomugi' // Slug của sản phẩm khuyên dùng
        ]);

        console.log('✅ Đã tạo bài viết CeraVe hoàn chỉnh theo cấu trúc project!');
    } catch (err) {
        console.error('❌ Lỗi seeding:', err);
    } finally {
        if (client) client.release();
    }
}

seedCeraveReview().then(() => process.exit(0));
