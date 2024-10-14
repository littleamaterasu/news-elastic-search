// Import Elasticsearch client and other required modules
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');

// Tạo một client để kết nối với Elasticsearch
const client = new Client({
    node: 'https://localhost:9200',
    auth: {
        apiKey: 'YW55VzdwRUJBSEljQTNKOEJ4NFI6QW93Ui1oSjdUV3V4SHRoUFJVaTdidw==' // Replace this with a valid API key
    }
});

// Chỉ export index abcs 1 lần duy nhất
const indexName = 'abcs'; // Replace with your index name

async function exportIndex() {
    const fileName = 'export_abcs.json';
    const writeStream = fs.createWriteStream(fileName);

    try {
        // Search query to get all documents up to the size limit (25 documents in this case)
        const searchResult = await client.search({
            index: indexName,
            q: '*', // Match all documents
            size: 25 // Export 25 documents
        });

        const documents = searchResult.hits.hits;
        console.log(`Exporting ${documents.length} documents from index ${indexName}.`);

        // Write all documents to file
        writeStream.write(JSON.stringify(documents, null, 2));

        // Close the write stream
        writeStream.end(() => console.log(`Export completed and saved to ${fileName}`));
    } catch (error) {
        console.error('Error during export:', error);
    }
}

const searchWithAggregation = async () => {
    try {
        // Truy vấn với Aggregation
        const response = await client.search({
            index: 'abcs',  // Đổi sang tên chỉ mục của bạn
            size: 0, // Không cần trả về tài liệu
            aggs: {
                "unique_timeAgo": {
                    terms: {
                        field: 'timeAgo', // Sử dụng trường keyword
                        size: 1000 // Điều chỉnh kích thước theo số lượng giá trị bạn muốn lấy
                    }
                }
            }
        });

        // Lấy các buckets từ Aggregation
        let buckets = response.aggregations.unique_title.buckets;
        let tokens = [];
        buckets.forEach(ele => {
            tokens.push(ele.key);
        });

        // Lưu buckets vào file dictionary.json
        fs.writeFileSync('dictionary.json', JSON.stringify(buckets, null, 2), 'utf8');
        console.log('Buckets saved to dictionary.json');

        // 3-gram phân tích
        const ngram = await client.indices.analyze({
            body: {
                tokenizer: {
                    type: "ngram",
                    min_gram: 2,
                    max_gram: 3,
                    token_chars: ["letter", "digit", "symbol"]
                },
                text: tokens
            }
        });

        // Lưu ngram kết quả vào ngram.json
        fs.writeFileSync('ngram.json', JSON.stringify(ngram.tokens, null, 2), 'utf8');
        console.log('Ngram tokens saved to ngram.json');

    } catch (error) {
        console.error('Error executing search with aggregation:', error);
    }
};

// Chạy hàm thực hiện truy vấn
searchWithAggregation();
