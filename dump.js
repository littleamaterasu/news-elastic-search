const elasticdump = require('elasticdump');
const { exec } = require('child_process');

// Điền username, password
const username = '';
const password = '';
const indexName = '';

// Cấu hình cho việc xuất chỉ mục
const inputIndex = `https://${username}:${password}@localhost:9200/${indexName}`;
const outputFile = 'your_data.json'; // Tên file đầu ra

// Hàm để xuất chỉ mục
function exportIndex() {
    exec(`elasticdump --input=${inputIndex} --output=${outputFile} --type=data`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Export successful: ${stdout}`);
    });
}

// Gọi hàm xuất chỉ mục
exportIndex();