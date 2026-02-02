/**
 * Inventory Queue Worker
 * Monitors inventory and triggers alerts/actions
 */

const { inventoryQueue, emailQueue, smsQueue } = require('../config/queue');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * Check for low stock products
 */
async function checkLowStock() {
    try {
        // Find products with stock below threshold
        const lowStockProducts = await Product.find({
            stock: { $lte: 10, $gt: 0 },
            isActive: true
        });

        if (lowStockProducts.length > 0) {
            console.log(`⚠️ Found ${lowStockProducts.length} low stock products`);

            // Get admin users
            const admins = await User.find({ role: 'admin' });

            // Send email alerts to admins
            for (const admin of admins) {
                await emailQueue.add('low-stock-alert', {
                    type: 'low-stock-alert',
                    data: {
                        email: admin.email,
                        products: lowStockProducts.map(p => ({
                            name: p.name,
                            stock: p.stock,
                            sku: p.sku
                        }))
                    }
                });
            }
        }

        return { checked: true, lowStock: lowStockProducts.length };
    } catch (error) {
        console.error('Low stock check failed:', error);
        throw error;
    }
}

/**
 * Check for out of stock products
 */
async function checkOutOfStock() {
    try {
        const outOfStockProducts = await Product.find({
            stock: 0,
            isActive: true
        });

        if (outOfStockProducts.length > 0) {
            console.log(`🚫 Found ${outOfStockProducts.length} out of stock products`);

            // Auto-disable out of stock products
            await Product.updateMany(
                { stock: 0, isActive: true },
                { $set: { isActive: false } }
            );
        }

        return { checked: true, outOfStock: outOfStockProducts.length };
    } catch (error) {
        console.error('Out of stock check failed:', error);
        throw error;
    }
}

// Process inventory jobs
inventoryQueue.process(async (job) => {
    const { type, data } = job.data;

    console.log(`📦 Processing inventory job: ${type}`);

    try {
        switch (type) {
            case 'check-low-stock':
                const lowStockResult = await checkLowStock();
                return lowStockResult;

            case 'check-out-of-stock':
                const outOfStockResult = await checkOutOfStock();
                return outOfStockResult;

            case 'product-sold':
                // Update product stock (already done in orderWorker)
                // This job is for additional analytics/tracking
                console.log(`Product ${data.productId} sold, quantity: ${data.quantity}`);
                return { success: true };

            default:
                console.log(`Unknown inventory job type: ${type}`);
        }

        return { success: true, type };
    } catch (error) {
        console.error(`Inventory job failed:`, error);
        throw error;
    }
});

console.log('📦 Inventory worker started');

module.exports = inventoryQueue;
