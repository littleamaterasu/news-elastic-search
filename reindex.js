// Import Elasticsearch client and other required modules
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const client = new Client({
    node: 'https://localhost:9200',
    auth: {
        apiKey: 'YW55VzdwRUJBSEljQTNKOEJ4NFI6QW93Ui1oSjdUV3V4SHRoUFJVaTdidw==' // Replace this with a valid API key
    }
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

reindexData();