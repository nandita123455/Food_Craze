const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');

const clearAllOrders = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Count existing orders
        const count = await Order.countDocuments();
        console.log(`📦 Found ${count} orders`);

        if (count === 0) {
            console.log('✅ No orders to delete');
            process.exit(0);
        }

        // Ask for confirmation (in a script context, we'll just proceed)
        console.log('⚠️  DELETING ALL ORDERS...');

        // Delete all orders
        const result = await Order.deleteMany({});

        console.log(`✅ Successfully deleted ${result.deletedCount} orders`);
        console.log('🎉 Database is now clean!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

clearAllOrders();
