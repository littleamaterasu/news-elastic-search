const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const fileName = 'data1.json';

// Danh sách các URL với -p2 và -p3
const urls = [
    'https://vnexpress.net/tin-tuc-24h',
    'https://vnexpress.net/tin-tuc-24h-p2',
    'https://vnexpress.net/tin-tuc-24h-p3',
];
let articles = [];

let crawledLinks = new Set(); // Dùng để lưu các link đã crawl

const setCrawledLinks = () => {

    // Đọc dữ liệu hiện tại từ file (nếu có)
    let existingData = [];
    if (fs.existsSync(fileName)) {
        const rawData = fs.readFileSync(fileName);
        existingData = JSON.parse(rawData);
    }

    existingData.forEach(element => {
        crawledLinks.add(element.link);
    });
}

// Hàm ghi dữ liệu vào file JSON
const writeDataToFile = () => {

    // Đọc dữ liệu hiện tại từ file (nếu có)
    let existingData = [];
    if (fs.existsSync(fileName)) {
        const rawData = fs.readFileSync(fileName);
        existingData = JSON.parse(rawData);
    }

    // Thêm dữ liệu mới vào mảng hiện có
    existingData.push(...articles);

    // Ghi dữ liệu mới vào file
    fs.writeFile(fileName, JSON.stringify(existingData, null, 2), (err) => {
        if (err) {
            console.error(`Có lỗi xảy ra khi ghi file ${fileName}: ${err}`);
        } else {
            console.log(`Dữ liệu đã được lưu vào ${fileName}`, `số lượng ${existingData.length}`);
        }
    });

    articles = [];
};

// Hàm lấy thời gian đăng bài từ liên kết chi tiết
const fetchTimeAgo = async (link) => {
    try {
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        return $('span.date').text().trim();
    } catch (error) {
        console.error(`Có lỗi xảy ra khi lấy thời gian đăng bài từ ${link}: ${error}`);
        return 'Không có thông tin';
    }
};

// Hàm lấy dữ liệu từ URL và trích xuất thông tin bài viết
const fetchDataFromUrl = async (url) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Lưu các promises của các bài viết
        let articlePromises = [];

        // Lặp qua các bài viết trên trang
        $('article.item-news').each((index, element) => {
            const link = $(element).find('a').attr('href');
            const title = $(element).find('h3.title-news a').text().trim();
            const description = $(element).find('p.description a').text().trim();

            if (title && link && description) {
                const fullLink = new URL(link, url).href; // Tạo link đầy đủ nếu link tương đối

                // Kiểm tra nếu bài viết đã được crawl trước đó
                if (!crawledLinks.has(fullLink)) {
                    // Lưu lời hứa (promise) fetchTimeAgo và đẩy vào mảng promises
                    const articlePromise = fetchTimeAgo(fullLink).then(timeAgo => {
                        // Thêm dữ liệu vào mảng articles
                        const element = {
                            title: title,
                            link: fullLink,
                            description: description,
                            timeAgo: timeAgo
                        };
                        articles.push(element);
                        crawledLinks.add(fullLink);
                    });

                    articlePromises.push(articlePromise);
                }
            }
        });

        // Chờ tất cả các bài viết đã được xử lý
        await Promise.all(articlePromises);
    } catch (error) {
        console.error(`Có lỗi xảy ra với URL ${url}: ${error}`);
    }
};

// Hàm chính để crawl dữ liệu từ tất cả các URL
const main = async () => {
    // for (const url of urls) {
    await fetchDataFromUrl(urls[0]);
    await fetchDataFromUrl(urls[1]);
    await fetchDataFromUrl(urls[2]);
    // }

    // Sau khi tất cả các bài viết đã được fetch, ghi dữ liệu vào file
    writeDataToFile();
};

setCrawledLinks();

main();

// Lặp lại việc crawl mỗi 5 phút
//setInterval(main, 300000); // 5 phút
