const { Client } = require('@elastic/elasticsearch');

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

const deleteIndex = async (indexName) => {
    try {
        const response = await client.indices.delete({ index: indexName });
        console.log(`Index '${indexName}' deleted successfully:`, response);
    } catch (error) {
        if (error.meta && error.meta.body && error.meta.body.error.type === 'index_not_found_exception') {
            console.log(`Index '${indexName}' does not exist.`);
        } else {
            console.error('Error deleting index:', error);
        }
    }
};

// Gọi hàm deleteIndex với tên index bạn muốn xóa
deleteIndex('user-logs'); // Thay 'user-logs' bằng tên index bạn muốn xóa