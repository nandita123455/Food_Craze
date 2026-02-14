const axios = require('axios');

const API_URL = 'http://localhost:5000/api/products';
const TOTAL_REQUESTS = 150; // Enough to trigger the 100 limit
const CONCURRENCY = 10;

console.log(`🛡️  Starting Rate Limit Verification...`);
console.log(`🎯 Target: ${API_URL}`);
console.log(`🚀 Sending ${TOTAL_REQUESTS} requests...`);

let successCount = 0;
let blockedCount = 0;
let errorCount = 0;

const makeRequest = async (i) => {
    try {
        await axios.get(API_URL);
        successCount++;
        process.stdout.write('✅'); // Visual progress
    } catch (error) {
        if (error.response && error.response.status === 429) {
            blockedCount++;
            process.stdout.write('⛔'); // Visual progress
        } else {
            errorCount++;
            process.stdout.write('❌'); // Visual progress
            // console.error(`\nRequest ${i} failed:`, error.message);
        }
    }
};

const runTest = async () => {
    const promises = [];
    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        promises.push(makeRequest(i));

        // Small delay every few requests to not crash the test script itself
        if (i % CONCURRENCY === 0) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    await Promise.all(promises);

    console.log('\n\n📊 TEST RESULTS:');
    console.log(`-----------------------------------`);
    console.log(`✅ Successful Requests (200 OK): ${successCount}`);
    console.log(`⛔ Blocked Requests (429 Too Many): ${blockedCount}`);
    console.log(`❌ Other Errors: ${errorCount}`);
    console.log(`-----------------------------------`);

    if (blockedCount > 0) {
        console.log(`✅ PASSED: DoS Protection is ACTIVE. The server blocked excessive requests.`);
    } else {
        console.log(`❌ FAILED: No requests were blocked. Rate limiting might not be working or limit is too high.`);
    }
};

runTest();
