const fs = require('fs');
const main = () => {
    const fileName = 'data.json';

    // Đọc dữ liệu hiện tại từ file (nếu có)
    let existingData = [];
    if (fs.existsSync(fileName)) {
        const rawData = fs.readFileSync(fileName);
        existingData = JSON.parse(rawData);
    }

    console.log(existingData.length);
}

main()