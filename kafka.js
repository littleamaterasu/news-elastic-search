// server.js
const express = require('express');
const bodyParser = require('body-parser');
const kafka = require('kafka-node');

// Tạo Kafka Producer
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new kafka.Producer(client);

producer.on('ready', function () {
    console.log('Kafka Producer is ready');
});

producer.on('error', function (err) {
    console.error('Kafka Producer error:', err);
});

const app = express();
app.use(bodyParser.json());

// API endpoint để ghi lại từ khóa tìm kiếm
app.post('/search', (req, res) => {
    const searchKeyword = req.body.keyword;

    if (!searchKeyword) {
        return res.status(400).send('Missing search keyword');
    }

    // Ghi log từ khóa tìm kiếm
    const logMessage = {
        timestamp: new Date().toISOString(),
        action: 'search',
        keyword: searchKeyword,
    };

    // Gửi log tới Kafka
    const payloads = [
        { topic: 'search-logs', messages: JSON.stringify(logMessage), partition: 0 },
    ];

    producer.send(payloads, (err, data) => {
        if (err) {
            console.error('Failed to send log to Kafka:', err);
            return res.status(500).send('Failed to send log');
        }
        console.log('Log sent to Kafka:', data);
        res.status(200).send('Log recorded');
    });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
