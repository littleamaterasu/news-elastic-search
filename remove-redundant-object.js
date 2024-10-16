const fs = require('fs');

const fileName = 'a.json'; // Đặt tên file chứa dữ liệu crawled

// Hàm lọc bài viết trùng lặp
const filterDuplicateArticles = () => {
    // Kiểm tra xem file có tồn tại không
    if (fs.existsSync(fileName)) {
        // Đọc dữ liệu từ file
        const rawData = fs.readFileSync(fileName);
        const articles = JSON.parse(rawData);

        // Sử dụng Set để theo dõi các link đã thấy
        const crawledLinks = new Set();
        const uniqueArticles = [];

        articles.forEach(article => {
            if (!crawledLinks.has(article._source.link)) {
                // Nếu link chưa tồn tại, thêm vào Set và mảng kết quả
                crawledLinks.add(article._source.link);
                uniqueArticles.push(article._source);
            }
        });

        // Ghi lại vào file chỉ những bài viết duy nhất
        fs.writeFileSync(fileName, JSON.stringify(uniqueArticles, null, 2));
        console.log(`Đã lọc trùng, từ ${articles.length} còn lại ${uniqueArticles.length} bài viết duy nhất.`);
    } else {
        console.log(`File ${fileName} không tồn tại.`);
    }
};

// Gọi hàm để lọc bài viết trùng lặp
filterDuplicateArticles();
