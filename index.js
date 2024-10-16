// Import Elasticsearch client and other required modules
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');
const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'  // Allow only this origin
}));

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
    const raw = fs.readFileSync('data2.json', 'utf-8');
    const data = JSON.parse(raw);

    const result = await client.helpers.bulk({
        datasource: data,
        onDocument: (doc) => ({ index: { _index: indexName } }),
    });

    console.log(result);
}

// importToES();
app.get('/showAll', async (req, res) => {
  try {
    const result = await client.search({
      index: 'abcs', // Thay 'my_index' bằng tên index của bạn
      body: {
        query: {
		match_all: {}
	}, // Truyền query từ body của request
        size: 1000            // Trả về tối đa 1000 kết quả
      }
    });

    res.json(result.hits.hits); // Trả về các hits từ kết quả truy vấn
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error executing search query' });
  }
});

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
        res.status(200).json(searchedItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while searching data', error });
    }
});

// Khởi động server
app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
});

async function reindexData() {
    try {
        const sourceIndex = 'abcs';
        const destIndex = 'my_vietnamese_index';

        // Gửi yêu cầu reindex
        const response = await client.reindex({
            body: {
                source: {
                    index: sourceIndex
                },
                dest: {
                    index: destIndex
                }
            }
        });

        console.log(`Reindexing completed: ${response.body}`);
    } catch (error) {
        console.error('Error during reindexing:', error);
    }
}

// Gọi hàm reindex
// reindexData();

async function createIndex() {
    try {
        const indexName = 'my_vietnamese_index';

        // Kiểm tra xem chỉ mục đã tồn tại chưa
        const { body: exists } = await client.indices.exists({ index: indexName });
        if (exists) {
            console.log(`Index ${indexName} already exists.`);
            return;
        }

        // Tạo chỉ mục với cấu hình
        await client.indices.create({
            index: indexName,
            body: {
                settings: {
                    analysis: {
                        char_filter: {

                        },
                        analyzer: {
                            vietnamese_analyzer: {
                                type: 'custom',
                                tokenizer: 'icu_tokenizer',
                                filter: [
                                    'lowercase',
                                    'vietnamese_stop',
                                    'asciifolding'
                                ]
                            }
                        },
                        filter: {
                            vietnamese_stop: {
                                type: 'stop',
                                stopwords: '_vietnamese_'  // Sử dụng danh sách từ dừng mặc định cho tiếng Việt
                            }
                        }
                    }
                },
                mappings: {
                    properties: {
                        title: {
                            type: 'text',
                            analyzer: 'vietnamese_analyzer'
                        },
                        link: {
                            type: 'text',
                            analyzer: 'vietnamese_analyzer'
                        },
                        timeAgo: {
                            type: 'text',
                            analyzer: 'vietnamese_analyzer'
                        },
                        description: {
                            type: 'text',
                            analyzer: 'vietnamese_analyzer'
                        }
                    }
                }
            }
        });

        console.log(`Index ${indexName} created successfully.`);
    } catch (error) {
        console.error('Error creating index:', error);
    }
}



// // Gọi hàm tạo chỉ mục
// createIndex();
