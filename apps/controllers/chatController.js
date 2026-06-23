const Groq = require("groq-sdk");
const Fuse = require("fuse.js");
const ArticleModel = require('../model/articleModel');

const groqApiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: groqApiKey });

// Lưu trữ lịch sử hội thoại trong bộ nhớ tạm (Có thể tối ưu bằng session/Redis sau này)
const chatSessions = new Map();

var chatController = {
    handleChat: async (req, res) => {
        try {
            const { message, sessionId } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Nội dung tin nhắn không được trống.' });
            }

            // 1. Lấy dữ liệu bài viết từ DB làm ngữ cảnh (Context)
            const articles = await ArticleModel.getAllForRAG();

            // Khởi tạo bộ máy tìm kiếm Fuse.js
            const fuseOptions = {
                keys: [
                    { name: 'title', weight: 0.5 },
                    { name: 'category', weight: 0.4 },
                    { name: 'excerpt', weight: 0.3 },
                    { name: 'content', weight: 0.1 }
                ],
                threshold: 0.6, // Mở rộng độ tìm kiếm mờ
                ignoreLocation: true
            };
            const fuse = new Fuse(articles, fuseOptions);
            const searchResults = fuse.search(message);

            // Lấy Top 15 bài viết liên quan nhất (Hoặc lấy 15 bài đầu tiên nếu không có kết quả search)
            let top15Articles = searchResults.slice(0, 15).map(result => result.item);
            if (top15Articles.length === 0) {
                top15Articles = articles.slice(0, 15);
            }

            // Chỉ lấy Top 2 bài viết để truyền Full Nội Dung
            let top2Articles = top15Articles.slice(0, 2);

            // Xây dựng chuỗi Context kết hợp (Hybrid Context)
            let contextData = "--- 1. DANH SÁCH TÓM TẮT CÁC SẢN PHẨM HIỆN CÓ TRÊN HỆ THỐNG ---\n";
            contextData += "(CẢNH BÁO QUAN TRỌNG: Bạn PHẢI tự đánh giá xem các sản phẩm này có THỰC SỰ PHÙ HỢP với yêu cầu khắt khe của người dùng (ví dụ: da trắng, da ngăm, da mụn, khô...) hay không. Nếu không có sản phẩm nào thực sự khớp với mô tả, BẮT BUỘC phải nói là web chưa review sản phẩm phù hợp. KHÔNG ĐƯỢC gượng ép gợi ý sai.)\n";
            top15Articles.forEach(article => {
                contextData += `- Tên: ${article.title} | Danh mục: ${article.category} | Link: /post/${article.slug}\n  Tóm tắt: ${article.excerpt}\n`;
            });

            contextData += "\n--- 2. NỘI DUNG CHI TIẾT CỦA 2 SẢN PHẨM LIÊN QUAN NHẤT ---\n";
            contextData += "(Chỉ sử dụng nội dung này để trả lời sâu về thành phần, cảm nhận, nếu người dùng hỏi chi tiết về chúng)\n";
            top2Articles.forEach(article => {
                // Lược bỏ các thẻ HTML và link gốc khỏi content để tiết kiệm token và tránh AI dùng sai link
                const cleanContent = article.content.replace(/<[^>]*>?/gm, '');
                contextData += `\n>> Bài: ${article.title}\n${cleanContent}\n`;
            });

            // 2. Thiết lập System Instruction (Luật chơi cho AI)
            const systemInstruction = `
            Bạn là chuyên gia tư vấn sắc đẹp độc quyền của trang web PurePick. 
            Nhiệm vụ của bạn là lắng nghe nhu cầu của người dùng và đưa ra lời khuyên chân thành, mang tính chuyên môn cao.
            
            HƯỚNG DẪN TRẢ LỜI CHỐNG BỊA ĐẶT (QUAN TRỌNG):
            1. Khi người dùng đưa ra tiêu chí cụ thể (VD: "da trắng", "da mụn", "giá rẻ"): Bạn phải đối chiếu khắt khe với [DANH SÁCH TÓM TẮT]. 
            2. Nếu TRONG DANH SÁCH KHÔNG CÓ sản phẩm nào thực sự dành cho tiêu chí đó, bạn BẮT BUỘC phải trả lời: "Hiện tại PurePick chưa có bài review nào về sản phẩm phù hợp với nhu cầu [tiêu chí] của bạn." TUYỆT ĐỐI KHÔNG tự bịa ra bài viết hoặc gượng ép đưa một sản phẩm không liên quan vào.
            3. Chỉ gợi ý sản phẩm khi bạn chắc chắn thông tin tóm tắt hoặc nội dung của nó khớp với nhu cầu của người dùng.
            
            QUY TẮC ĐƯA LINK VÀ ĐỀ XUẤT (QUAN TRỌNG VÀ BẮT BUỘC):
            - LỖI THƯỜNG GẶP: Bạn rất hay quên gắn link sản phẩm! MỖI KHI nhắc đến một sản phẩm nào đó, BẮT BUỘC phải chèn ngay thẻ <a> chứa link của bài viết đó ở ngay dòng bên dưới.
            - TUYỆT ĐỐI KHÔNG nói chung chung kiểu "bạn có thể xem chi tiết tại web PurePick" mà lười không gắn link. Bạn PHẢI TRỰC TIẾP cung cấp link cho người dùng bấm vào!
            - Định dạng link BẮT BUỘC: <a href="[Link từ danh sách tóm tắt]" class="ai-product-link">[Tên sản phẩm]</a>
            - TUYỆT ĐỐI KHÔNG sao chép y nguyên định dạng dữ liệu thô. Bạn phải viết thành câu văn tự nhiên.
            - KHI ĐƯA LINK: Thẻ <a> BẮT BUỘC phải đứng ĐỘC LẬP trên một dòng riêng biệt. TUYỆT ĐỐI KHÔNG nhúng thẻ <a> vào giữa đoạn văn hay nối tiếp ngay sau dòng liệt kê.
            
            ĐỊNH DẠNG BẮT BUỘC: 
            - Trả lời ngắn gọn, súc tích, thân thiện.
            - TUYỆT ĐỐI KHÔNG SỬ DỤNG các thẻ HTML như <p>, <ul>, <li>, <br>. Hãy xuống dòng tự nhiên (văn bản thuần).
            - CHỈ DUY NHẤT link sản phẩm là dùng thẻ <a>.
            - Để in đậm, hãy dùng Markdown: **chữ in đậm**.
            - Khi liệt kê các mục, BẮT BUỘC dùng dấu gạch ngang "- " ở đầu mỗi dòng.
            
            VÍ DỤ CHUẨN VỀ LIỆT KÊ KÈM LINK:
            Dưới đây là một số sản phẩm phù hợp với bạn:
            
            - **Sữa rửa mặt CeraVe**: Đây là một sản phẩm rất tốt cho da dầu...
            <a href="/post/cerave-review" class="ai-product-link">Xem đánh giá Sữa rửa mặt CeraVe</a>
            
            - **Kem dưỡng Neutrogena**: Kem dưỡng mỏng nhẹ, cấp ẩm sâu...
            <a href="/post/neutrogena-review" class="ai-product-link">Xem đánh giá Kem dưỡng Neutrogena</a>
            
            ${contextData}
            `;

            // 3. Lấy hoặc tạo Chat Session History
            let history = [];
            if (chatSessions.has(sessionId)) {
                history = chatSessions.get(sessionId);
            } else {
                history = [
                    {
                        role: "user",
                        content: "Chào bạn, tôi muốn được tư vấn mỹ phẩm."
                    },
                    {
                        role: "assistant",
                        content: "Chào bạn! Tôi là trợ lý ảo của PurePick. Bạn có thể chia sẻ cho tôi biết tình trạng da hiện tại (khô, dầu, mụn...) và nhu cầu của bạn (chống lão hóa, dưỡng trắng...) được không?"
                    }
                ];
            }

            // Thêm tin nhắn mới của user vào lịch sử
            history.push({ role: "user", content: message });

            // 4. Gửi tin nhắn và nhận kết quả qua Groq API
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemInstruction },
                    ...history
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.7,
                max_tokens: 1024,
            });

            const responseText = chatCompletion.choices[0]?.message?.content || "";

            // Lưu lại phản hồi của AI vào lịch sử
            history.push({ role: "assistant", content: responseText });
            chatSessions.set(sessionId, history);

            res.status(200).json({
                success: true,
                reply: responseText
            });

        } catch (error) {
            console.error('Chatbot API Error:', error);
            res.status(500).json({
                success: false,
                error: 'Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau ít phút.'
            });
        }
    }
};

module.exports = chatController;