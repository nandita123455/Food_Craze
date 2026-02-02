const axios = require('axios');

const API_URL = `http://localhost:5000`http://localhost:5000'}/api';

// Test user credentials
const TEST_USER = {
    email: 'customer@test.com',
    password: 'test123',
    name: 'Test Customer',
    phone: '9876543210'
};

async function setupTestData() {
    try {
        console.log('\n🚀 Setting up Test Data for OTP System...\n');

        // Step 1: Register test user
        console.log('1️⃣  Registering test customer...');
        let token;

        try {
            const registerRes = await axios.post(`${API_URL}/auth/register`, TEST_USER);
            token = registerRes.data.token;
            console.log('   ✅ Customer registered');
        } catch (error) {
            // User might already exist, try logging in
            if (error.response?.status === 400) {
                console.log('   ℹ️  Customer exists, logging in...');
                const loginRes = await axios.post(`${API_URL}/auth/login`, {
                    email: TEST_USER.email,
                    password: TEST_USER.password
                });
                token = loginRes.data.token;
                console.log('   ✅ Customer logged in');
            } else {
                throw error;
            }
        }

        // Step 2: Add address
        console.log('2️⃣  Creating shipping address...');
        let addressId;

        try {
            const addressRes = await axios.post(
                `${API_URL}/addresses`,
                {
                    name: 'Test Customer',
                    phone: '9876543210',
                    addressLine1: 'House No 123, Test Street',
                    addressLine2: 'Near Test Market',
                    landmark: 'Opposite Test School',
                    city: 'Biratnagar',
                    state: 'Province 1',
                    pincode: '56600',
                    location: {
                        latitude: 26.4525,
                        longitude: 87.2718
                    },
                    isDefault: true
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            addressId = addressRes.data.address._id;
            console.log('   ✅ Address created');
        } catch (error) {
            // Address might exist, get it
            const addressesRes = await axios.get(`${API_URL}/addresses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addressId = addressesRes.data.addresses[0]?._id;
            console.log('   ✅ Address found');
        }

        if (!addressId) {
            console.log('   ❌ No address available');
            return;
        }

        // Step 3: Get products
        console.log('3️⃣  Getting products...');
        const productsRes = await axios.get(`${API_URL}/products?limit=10`);
        const products = productsRes.data.products || productsRes.data || [];

        if (!Array.isArray(products) || products.length === 0) {
            console.log('   ❌ No products found! Please seed products first');
            console.log('   Run: node scripts/seedViaAPI.js');
            return;
        }
        console.log(`   ✅ Found ${products.length} products`);

        // Step 4: Add products to cart
        console.log('4️⃣  Adding products to cart...');
        for (let i = 0; i < Math.min(3, products.length); i++) {
            await axios.post(
                `${API_URL}/cart`,
                { productId: products[i]._id, quantity: Math.floor(Math.random() * 2) + 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        }
        console.log('   ✅ Cart populated');

        // Step 5: Create orders
        console.log('5️⃣  Creating test orders...\n');

        const orderCount = 3;
        for (let i = 0; i < orderCount; i++) {
            try {
                const orderRes = await axios.post(
                    `${API_URL}/orders`,
                    {
                        items: products.slice(0, 2).map(p => ({
                            product: p._id,
                            quantity: Math.floor(Math.random() * 2) + 1,
                            price: p.price,
                            name: p.name,
                            image: p.image
                        })),
                        shippingAddress: addressId,
                        paymentMethod: 'COD'
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const orderId = orderRes.data.order?._id || orderRes.data._id;
                console.log(`   ✅ Order ${i + 1} created: ${orderId?.toString().slice(-8).toUpperCase()}`);
            } catch (error) {
                console.log(`   ⚠️  Order ${i + 1} failed:`, error.response?.data?.error || error.message);
            }
        }

        console.log('\n✅ ========================================');
        console.log('✅ Test Data Created Successfully!');
        console.log('✅ ========================================\n');
        console.log('📝 Test User Credentials:');
        console.log(`   Email: ${TEST_USER.email}`);
        console.log(`   Password: ${TEST_USER.password}\n`);
        console.log('🎯 Next Steps:');
        console.log('   1. Refresh rider dashboard (http://localhost:5173/rider/dashboard)');
        console.log('   2. Go online (toggle availability)');
        console.log('   3. Accept an available order');
        console.log('   4. Mark as picked up');
        console.log('   5. Mark as delivered (generates OTP)');
        console.log('   6. Login as customer to see OTP');
        console.log('   7. Enter OTP to complete delivery\n');

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

setupTestData();
