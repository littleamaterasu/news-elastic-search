// Import Elasticsearch client and other required modules
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const client = new Client({
    node: 'https://localhost:9200',
    auth: {
        apiKey: 'YW55VzdwRUJBSEljQTNKOEJ4NFI6QW93Ui1oSjdUV3V4SHRoUFJVaTdidw' // Thay bằng API key hợp lệ của bạn
    },
    ssl: {
        rejectUnauthorized: false, // Bỏ qua SSL nếu bạn sử dụng chứng chỉ tự ký
    },
    tls: {
        rejectUnauthorized: false, // Bỏ qua SSL nếu bạn sử dụng chứng chỉ tự ký
    },
});

const indexName = 'user-logs'; // Thay thế với tên index của bạn

// Hàm export dữ liệu ra file JSON
async function exportDataToFile() {
    const filePath = 'b.json'; // Đường dẫn tới file JSON sẽ lưu trữ dữ liệu
    const stream = fs.createWriteStream(filePath, { flags: 'w' }); // Tạo stream để ghi dữ liệu ra file

    try {
        // Tìm kiếm với query match_all và giới hạn kết quả ở 1000 tài liệu
        const result = await client.search({
            index: indexName,
            body: {
                query: {
                    match_all: {}
                },
                size: 10000
            }
        });

        // Ghi kết quả tìm kiếm vào file a.json
        stream.write(JSON.stringify(result.hits.hits, null, 2));
        console.log('Data has been exported to a.json successfully.');

    } catch (error) {
        console.error('Error exporting data:', error);
    } finally {
        // Đảm bảo đóng stream sau khi ghi xong
        stream.end();
    }
}

// Gọi hàm để export dữ liệu ra file JSON
exportDataToFile();
