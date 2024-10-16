// Import Elasticsearch client and other required modules
const { Client } = require('@elastic/elasticsearch');
//const cors = require('cors');
const fs = require('fs');
const readline = require('readline');
//const express = require('express');

//const app = express();
//app.use(express.json());
//app.use(cors({
//    origin: 'http://localhost:5173'  // Allow only this origin
//}));

//const port = 3000;
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
    const filename = 'data3.json';
    const raw = fs.readFileSync(filename, 'utf-8');
    const data = JSON.parse(raw);

    const result = await client.helpers.bulk({
        datasource: data,
        onDocument: (doc) => ({ index: { _index: indexName } }),
    });

    console.log(result);
}

importToES();
