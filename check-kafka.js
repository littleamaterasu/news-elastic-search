// spamTest.js
const axios = require('axios');
const { response } = require('express');

// Số lượng yêu cầu tìm kiếm bạn muốn gửi
const numberOfRequests = 100;

// Hàm để gửi yêu cầu tìm kiếm
async function sendSearchRequests() {
    const numberOfRequests = 1; // Set the number of requests to 200
    const ports = [3000, 3002, 3003]; // Define the ports to send requests to

    for (let port of ports) {
        for (let i = 0; i < numberOfRequests; i++) {
            const keyword = `search term ${Math.random() * (i + 1)}`; // Generate a random search term

            try {
                const response = await axios.post(`http://localhost:3003/search`, {
                    keyword: keyword,
                });
                console.log(`Request to port ${port} search ${i + 1}: Success - ${response.data}`);
            } catch (error) {
                console.error(`Request to port ${port} search ${i + 1}: Error - ${error.response ? error.response.data : error.message}`);
            }

            // Optional: Wait for a short duration between requests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100 ms
        }
    }
}

// Gọi hàm để gửi yêu cầu
sendSearchRequests();
