// Import Elasticsearch client and other required modules
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json());

const port = 3000;
// Tạo một client để kết nối với Elasticsearch
const client = new Client({
    node: 'https://localhost:9200',
    auth: {
        apiKey: 'YW55VzdwRUJBSEljQTNKOEJ4NFI6QW93Ui1oSjdUV3V4SHRoUFJVaTdidw==' // Replace this with a valid API key
    }
});

// Chỉ export index abcs 1 lần duy nhất
const indexName = 'abcs'; // Replace with your index name

const importToES = async () => {
    const raw = fs.readFileSync('data.json', 'utf-8');
    const data = JSON.parse(raw);

    const result = await client.helpers.bulk({
        datasource: data,
        onDocument: (doc) => ({ index: { _index: indexName } }),
    });

    console.log(result);
}

// API để tìm kiếm dữ liệu trong Elasticsearch
app.post('/search', async (req, res) => {
    console.log("request", req.query)
    const { query } = req.body; // Nhận query tìm kiếm từ yêu cầu

    try {
        // Thực hiện truy vấn tìm kiếm trong Elasticsearch
        const result = await client.search({
            index: indexName,
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: ['title', 'description'] // Thay thế bằng các trường bạn muốn tìm kiếm
                    }
                }
            }
        });

        const searchedItems = result.hits.hits;
        const returnItems = [];
        searchedItems.forEach(element => {
            returnItems.push(element._source);
        });

        // Trả về kết quả tìm kiếm cho người dùng
        res.status(200).json(returnItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while searching data', error });
    }
});

// Khởi động server
app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
});
