const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_URL = `http://localhost:5000`http://localhost:5000'}/api';
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Sample test user credentials
const TEST_USER = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test Customer',
    phone: '9876543210'
};

// Sample address
const TEST_ADDRESS = {
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
    }
};

async function createTestOrders() {
    try {
        console.log('\n🚀 Creating Test Orders for OTP System...\n');

        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected\n');

        const User = require('../models/User');
        const Product = require('../models/Product');
        const Address = require('../models/Address');
        const Order = require('../models/Order');

        // Step 1: Create or find test user
        console.log('1️⃣  Creating test user...');
        let user = await User.findOne({ email: TEST_USER.email });

        if (!user) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);

            user = await User.create({
                name: TEST_USER.name,
                email: TEST_USER.email,
                password: hashedPassword,
                phone: TEST_USER.phone
            });
            console.log('   ✅ User created:', user.email);
        } else {
            console.log('   ✅ User found:', user.email);
        }

        // Step 2: Create address for user
        console.log('2️⃣  Creating shipping address...');
        let address = await Address.findOne({ user: user._id });

        if (!address) {
            address = await Address.create({
                ...TEST_ADDRESS,
                user: user._id,
                isDefault: true
            });
            console.log('   ✅ Address created');
        } else {
            console.log('   ✅ Address found');
        }

        // Step 3: Get some products
        console.log('3️⃣  Getting products...');
        const products = await Product.find().limit(5);

        if (products.length === 0) {
            console.log('   ❌ No products found! Please run seedViaAPI.js first');
            process.exit(1);
        }
        console.log(`   ✅ Found ${products.length} products`);

        // Step 4: Create test orders with different statuses
        console.log('4️⃣  Creating test orders...\n');

        const orderStatuses = [
            { status: 'pending', name: 'Pending Order' },
            { status: 'confirmed', name: 'Confirmed Order' },
            { status: 'processing', name: 'Processing Order' }
        ];

        for (const orderType of orderStatuses) {
            // Select 2-3 random products
            const orderItems = products.slice(0, 2 + Math.floor(Math.random() * 2)).map(product => ({
                product: product._id,
                quantity: Math.floor(Math.random() * 3) + 1,
                price: product.price,
                name: product.name,
                image: product.image
            }));

            const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const order = await Order.create({
                user: user._id,
                items: orderItems,
                shippingAddress: address._id,
                totalAmount: totalAmount,
                deliveryCharges: 50,
                paymentMethod: 'COD',
                paymentStatus: 'Pending',
                orderStatus: orderType.status
            });

            console.log(`   ✅ ${orderType.name} created: ₹${totalAmount}`);
            console.log(`      Order ID: ${order._id.toString().slice(-8).toUpperCase()}`);
            console.log(`      Items: ${orderItems.length} products\n`);
        }

        console.log('✅ ========================================');
        console.log('✅ Test Orders Created Successfully!');
        console.log('✅ ========================================\n');
        console.log('📝 Test User Credentials:');
        console.log(`   Email: ${TEST_USER.email}`);
        console.log(`   Password: ${TEST_USER.password}\n`);
        console.log('🎯 Next Steps:');
        console.log('   1. Login to rider dashboard');
        console.log('   2. Go online (toggle availability)');
        console.log('   3. Accept an available order');
        console.log('   4. Mark as picked up');
        console.log('   5. Mark as delivered (generates OTP)');
        console.log('   6. Login as customer to see OTP');
        console.log('   7. Enter OTP to complete delivery\n');

        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the script
createTestOrders();
