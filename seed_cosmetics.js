const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const articles = [
    {
        title: 'Review Kem Chống Nắng La Roche-Posay Anthelios UVmune 400',
        slug: 'review-kcn-la-roche-posay-anthelios',
        category: 'skincare',
        skin_type: 'oily',
        price_range: 'mid-range',
        thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800',
        excerpt: 'Dòng kem chống nắng "quốc dân" cho da dầu mụn. Liệu phiên bản mới UVmune 400 có thực sự đỉnh như lời đồn?',
        content: '<h2>Đánh giá chi tiết</h2><p>La Roche-Posay luôn là cái tên bảo chứng cho chất lượng...</p>',
        affiliate_link: 'https://shope.ee/example1'
    },
    {
        title: 'Top 5 Sữa Rửa Mặt Dịu Nhẹ Cho Da Khô Nhạy Cảm',
        slug: 'top-5-sua-rua-mat-cho-da-kho',
        category: 'skincare',
        skin_type: 'dry',
        price_range: 'budget',
        thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
        excerpt: 'Danh sách những loại sữa rửa mặt không gây khô căng, giúp bảo vệ hàng rào độ ẩm cho làn da khô.',
        content: '<h2>1. CeraVe Hydrating Facial Cleanser</h2><p>Sản phẩm cực kỳ lành tính...</p>',
        affiliate_link: 'https://shope.ee/example2'
    },
    {
        title: 'Review Son Kem Lì 3CE Hazy Lip Clay - Bảng Màu Cực Tây',
        slug: 'review-son-3ce-hazy-lip-clay',
        category: 'makeup',
        skin_type: 'all',
        price_range: 'mid-range',
        thumbnail: 'https://images.unsplash.com/photo-1586773860418-d3b9795056f7?auto=format&fit=crop&q=80&w=800',
        excerpt: 'Dòng son mới nhất từ nhà 3CE với chất son bùn mịn lì, che phủ rãnh môi cực tốt.',
        content: '<h2>Chất son và Bảng màu</h2><p>Thiết kế bao bì sang chảnh...</p>',
        affiliate_link: 'https://shope.ee/example3'
    }
];

async function seed() {
    const client = await pool.connect();
    try {
        for (const article of articles) {
            await client.query(
                `INSERT INTO articles (title, slug, category, skin_type, price_range, thumbnail, excerpt, content, affiliate_link)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 ON CONFLICT (slug) DO UPDATE SET 
                 category = EXCLUDED.category, 
                 skin_type = EXCLUDED.skin_type, 
                 price_range = EXCLUDED.price_range`,
                [article.title, article.slug, article.category, article.skin_type, article.price_range, article.thumbnail, article.excerpt, article.content, article.affiliate_link]
            );
        }
        console.log('✅ Cập nhật dữ liệu mỹ phẩm mẫu thành công!');
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();