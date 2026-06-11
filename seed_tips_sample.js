const pool = require('./config/database');

async function seedTipsArticle() {
    let client;
    try {
        client = await pool.connect();

        const title = "Cẩm nang: Quy tắc 'sống còn' khi kết hợp Retinol cho người mới bắt đầu";
        const slug = "quy-tac-ket-hop-retinol-cho-nguoi-moi";
        const thumbnail = "https://images.unsplash.com/photo-1615397323719-75b47a9561b3?auto=format&fit=crop&q=80&w=800"; 
        const excerpt = "Retinol là 'thần dược' chống lão hóa, nhưng dùng sai cách sẽ khiến da 'toang' nặng. Khám phá ngay cách kết hợp Retinol an toàn, không bong tróc.";
        const category = "tips";
        
        const content = `
            <p>Nhắc đến chống lão hóa và trị mụn ẩn, <strong>Retinol</strong> luôn là cái tên được xướng lên đầu tiên. Tuy nhiên, hoạt chất "nặng đô" này giống như một con ngựa chứng, nếu bạn không biết cách "thuần phục" và kết hợp với các sản phẩm khác, da bạn sẽ lập tức đối mặt với tình trạng đỏ rát, bong tróc và đẩy mụn ồ ạt.</p>

            <div class="verdict-card" style="border-color: var(--primary-light);">
                <div class="verdict-header">
                    <span class="verdict-summary" style="color: var(--primary-dark);">Nguyên tắc Vàng: "Chậm mà chắc"</span>
                    <span class="verdict-score" style="background: var(--primary-color); color: white;"><i data-lucide="shield-alert"></i> Cảnh báo</span>
                </div>
                <p>Luôn bắt đầu với nồng độ thấp (0.1% - 0.3%), sử dụng tần suất thưa (1-2 lần/tuần) và tuyệt đối không bao giờ quên phục hồi - chống nắng.</p>
            </div>

            <h2>1. Những thành phần "Tối Kỵ" khi dùng chung với Retinol</h2>
            <p>Để bảo vệ hàng rào da, bạn tuyệt đối không nên thoa các hoạt chất sau đây cùng một lúc (cùng một buổi tối) với Retinol:</p>
            
            <div class="ingredient-analysis">
                <div class="ing-header" style="background: #fef2f2; color: #991b1b; border-bottom-color: #fecaca;">
                    <i data-lucide="alert-triangle"></i> Cảnh báo tương tác (Không dùng chung buổi)
                </div>
                <div class="ing-row">
                    <span class="ing-name">AHA/BHA (Tẩy da chết hóa học)</span>
                    <span class="ing-safety safety-danger">Gây bỏng rát</span>
                </div>
                <div class="ing-row">
                    <span class="ing-name">Vitamin C (L-AA nguyên bản)</span>
                    <span class="ing-safety safety-danger">Giảm tác dụng</span>
                </div>
                <div class="ing-row">
                    <span class="ing-name">Benzoyl Peroxide</span>
                    <span class="ing-safety safety-danger">Khô da cực độ</span>
                </div>
            </div>
            
            <p><em>Mẹo nhỏ:</em> Nếu bạn vẫn muốn dùng AHA/BHA hoặc Vitamin C, hãy dùng chúng vào <strong>buổi sáng</strong>, và để dành Retinol cho <strong>buổi tối</strong>.</p>

            <h2>2. Những "Thiên Thần Phục Hồi" nên kết hợp cùng Retinol</h2>
            <p>Retinol làm da tăng tốc độ tái tạo, dẫn đến việc da dễ mất nước. Đây là lúc các thành phần làm dịu và phục hồi lên ngôi:</p>

            <div class="comparison-grid">
                <div class="compare-item" style="border-top: 4px solid #10b981;">
                    <h3><i data-lucide="droplets" style="color: #10b981; display: inline-block; vertical-align: middle;"></i> Hyaluronic Acid</h3>
                    <p style="text-align: left; font-size: 0.95rem; color: var(--text-muted);">HA là chất hút ẩm tuyệt vời. Thoa HA trên da ẩm trước khi dùng Retinol (phương pháp đệm) giúp giảm thiểu tối đa sự kích ứng.</p>
                </div>
                <div class="compare-item" style="border-top: 4px solid var(--primary-color);">
                    <h3><i data-lucide="shield-check" style="color: var(--primary-color); display: inline-block; vertical-align: middle;"></i> Ceramides</h3>
                    <p style="text-align: left; font-size: 0.95rem; color: var(--text-muted);">Được ví như lớp xi măng gắn kết các tế bào da. Kem dưỡng chứa Ceramides khóa lại Retinol, củng cố hàng rào bảo vệ da mạnh mẽ.</p>
                </div>
            </div>

            <h2>3. Routine cơ bản cho người mới (Phương pháp Sandwich)</h2>
            <p>Phương pháp Sandwich (Kem dưỡng -> Retinol -> Kem dưỡng) là cứu cánh cho những làn da mỏng manh muốn "đu đưa" cùng Retinol.</p>
            
            <div class="how-to-use">
                <div class="step-item">
                    <h4>Bước 1: Làm sạch & Cấp ẩm nền</h4>
                    <p>Tẩy trang, rửa mặt bằng sữa rửa mặt dịu nhẹ (pH 5.5). Dùng Toner/Serum HA cấp ẩm và đợi da khô hoàn toàn.</p>
                </div>
                <div class="step-item">
                    <h4>Bước 2: Lớp đệm bảo vệ (Tùy chọn)</h4>
                    <p>Thoa một lớp mỏng kem dưỡng ẩm phục hồi (chứa B5, Ceramide). Đợi 5 phút cho kem thấm.</p>
                </div>
                <div class="step-item">
                    <h4>Bước 3: Thoa Retinol</h4>
                    <p>Lấy một lượng Retinol bằng đúng <strong>1 hạt đậu xanh</strong>. Chấm đều 5 điểm và thoa mỏng toàn mặt (tránh vùng mắt và khóe miệng).</p>
                </div>
                <div class="step-item">
                    <h4>Bước 4: Khóa ẩm (Bắt buộc)</h4>
                    <p>Sau 10-15 phút, thoa thêm một lớp kem dưỡng ẩm nữa để khóa chặt hoạt chất và cấp ẩm sâu cho da qua đêm.</p>
                </div>
            </div>

            <blockquote>
                "Sự kiên nhẫn là chìa khóa khi dùng Retinol. Một làn da căng bóng, không nếp nhăn không thể xây dựng chỉ trong một đêm."
            </blockquote>

            <h2>4. Lời khuyên sản phẩm</h2>
            <p>Để thực hiện phương pháp Sandwich an toàn, bạn cần một bước làm sạch dịu nhẹ và giữ lại màng ẩm tự nhiên nhất cho da.</p>

            <div class="routine-box">
                <h3><i data-lucide="sparkles"></i> Mảnh ghép hoàn hảo cho Retinol</h3>
                <p>Sữa rửa mặt CeraVe Foaming Facial Cleanser sẽ là bước làm sạch lý tưởng với độ pH 5.5 chuẩn y khoa và chứa sẵn Ceramides phục hồi. Kéo xuống phần <strong>"Có thể nàng sẽ thích"</strong> để đọc bài review chi tiết về em sữa rửa mặt này nhé!</p>
            </div>

            <div class="conclusion-box">
                <h2>Tóm tắt</h2>
                <p>Bắt đầu hành trình với Retinol là một quyết định sáng suốt cho làn da, nhưng hãy luôn đi kèm với kem chống nắng phổ rộng vào ban ngày và một quy trình phục hồi cẩn thận vào ban đêm. Hãy lắng nghe làn da của mình, nếu thấy đỏ rát quá mức, hãy ngừng vài ngày và tăng cường dưỡng ẩm nhé!</p>
            </div>
        `;

        const query = `
            INSERT INTO articles (title, slug, excerpt, content, thumbnail, category, status, recommended_slug, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (slug) DO UPDATE 
            SET title = EXCLUDED.title, 
                excerpt = EXCLUDED.excerpt,
                content = EXCLUDED.content, 
                thumbnail = EXCLUDED.thumbnail, 
                category = EXCLUDED.category, 
                status = EXCLUDED.status,
                recommended_slug = EXCLUDED.recommended_slug;
        `;

        await client.query(query, [
            title, 
            slug, 
            excerpt,
            content, 
            thumbnail, 
            category, 
            'active',
            'review-cerave-foaming-facial-cleanser-cho-da-dau' // Trỏ ngược về bài CeraVe
        ]);

        console.log('✅ Đã tạo bài viết Cẩm Nang (Tips) mẫu thành công!');
    } catch (err) {
        console.error('❌ Lỗi seeding:', err);
    } finally {
        if (client) client.release();
        pool.end();
    }
}

seedTipsArticle();
