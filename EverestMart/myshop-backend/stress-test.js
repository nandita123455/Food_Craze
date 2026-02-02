const axios = require('axios');

const BASE_URL = `http://localhost:5000`http://localhost:5000'}';
const CONCURRENT_USERS = 1000;
const REQUESTS_PER_USER = 10;

// Test endpoints
const endpoints = [
  { method: 'GET', url: '/api/health' },
  { method: 'GET', url: '/api/products' },
  { method: 'GET', url: '/api/categories' },
  { method: 'GET', url: '/' }
];

// Statistics
let stats = {
  total: 0,
  success: 0,
  failed: 0,
  totalTime: 0,
  minTime: Infinity,
  maxTime: 0,
  errors: []
};

// Simulate single user
async function simulateUser(userId) {
  const requests = [];
  
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    
    requests.push(
      axios({
        method: endpoint.method,
        url: BASE_URL + endpoint.url,
        timeout: 10000
      })
      .then(response => {
        const responseTime = response.headers['x-response-time'] || 'N/A';
        return { success: true, responseTime, userId };
      })
      .catch(error => {
        return { 
          success: false, 
          error: error.message, 
          userId,
          endpoint: endpoint.url
        };
      })
    );
    
    // Random delay between requests (0-2 seconds)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
  }
  
  return Promise.all(requests);
}

// Main test function
async function runLoadTest() {
  console.log('🚀 Starting Load Test...\n');
  console.log(`   Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`   Requests per User: ${REQUESTS_PER_USER}`);
  console.log(`   Total Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}\n`);
  console.log('⏳ Please wait...\n');
  
  const startTime = Date.now();
  
  // Create all users
  const users = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    users.push(simulateUser(i));
  }
  
  // Execute all requests
  try {
    const results = await Promise.all(users);
    
    // Analyze results
    results.forEach(userResults => {
      userResults.forEach(result => {
        stats.total++;
        
        if (result.success) {
          stats.success++;
        } else {
          stats.failed++;
          stats.errors.push(result.error);
        }
      });
    });
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    // Print results
    console.log('═'.repeat(60));
    console.log('📊 LOAD TEST RESULTS');
    console.log('═'.repeat(60));
    console.log(`✅ Successful Requests: ${stats.success} (${((stats.success/stats.total)*100).toFixed(2)}%)`);
    console.log(`❌ Failed Requests: ${stats.failed} (${((stats.failed/stats.total)*100).toFixed(2)}%)`);
    console.log(`📈 Total Requests: ${stats.total}`);
    console.log(`⏱️  Total Time: ${totalTime.toFixed(2)}s`);
    console.log(`🚀 Requests/Second: ${(stats.total / totalTime).toFixed(2)}`);
    console.log(`⚡ Avg Response Time: ${(totalTime * 1000 / stats.total).toFixed(2)}ms`);
    console.log('═'.repeat(60));
    
    if (stats.failed > 0) {
      console.log('\n❌ Error Summary:');
      const errorCounts = {};
      stats.errors.forEach(err => {
        errorCounts[err] = (errorCounts[err] || 0) + 1;
      });
      Object.entries(errorCounts).forEach(([error, count]) => {
        console.log(`   ${error}: ${count} times`);
      });
    }
    
    // Verdict
    console.log('\n🎯 VERDICT:');
    if (stats.failed === 0) {
      console.log('   ✅ PASSED - Server handled all requests successfully!');
    } else if (stats.failed < stats.total * 0.01) {
      console.log('   ⚠️  ACCEPTABLE - Less than 1% error rate');
    } else if (stats.failed < stats.total * 0.05) {
      console.log('   ⚠️  WARNING - Error rate between 1-5%');
    } else {
      console.log('   ❌ FAILED - Error rate above 5%');
    }
    
  } catch (error) {
    console.error('❌ Load test crashed:', error.message);
  }
}

// Run the test
runLoadTest().then(() => {
  console.log('\n✨ Load test complete!\n');
  process.exit(0);
});
