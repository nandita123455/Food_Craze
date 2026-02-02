/**
 * Scheduled Jobs - Automated Tasks
 * Uses node-cron for scheduling
 */

const cron = require('node-cron');
const { inventoryQueue, emailQueue } = require('../config/queue');
const Order = require('../models/Order');
const User = require('../models/User');

/**
 * Check for abandoned carts
 * Runs every hour
 */
cron.schedule('0 * * * *', async () => {
    console.log('🕐 Running abandoned cart check...');

    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find users with items in cart but no order in last hour
        const Cart = require('../models/Cart');

        const abandonedCarts = await Cart.find({
            updatedAt: { $gte: oneDayAgo, $lte: oneHourAgo },
            'items.0': { $exists: true } // has at least one item
        }).populate('userId');

        console.log(`Found ${abandonedCarts.length} abandoned carts`);

        for (const cart of abandonedCarts) {
            if (cart.userId && cart.userId.email) {
                await emailQueue.add('abandoned-cart', {
                    type: 'abandoned-cart',
                    data: {
                        email: cart.userId.email,
                        name: cart.userId.name,
                        cartItems: cart.items,
                        cartTotal: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    }
                }, {
                    delay: Math.random() * 3600000 // Random delay up to 1 hour
                });
            }
        }
    } catch (error) {
        console.error('Abandoned cart check failed:', error);
    }
});

/**
 * Check inventory levels
 * Runs every 6 hours
 */
cron.schedule('0 */6 * * *', async () => {
    console.log('📦 Running inventory check...');

    try {
        await inventoryQueue.add('check-low-stock', {
            type: 'check-low-stock',
            data: {}
        });

        await inventoryQueue.add('check-out-of-stock', {
            type: 'check-out-of-stock',
            data: {}
        });
    } catch (error) {
        console.error('Inventory check failed:', error);
    }
});

/**
 * Generate daily sales report
 * Runs daily at 11 PM
 */
cron.schedule('0 23 * * *', async () => {
    console.log('📊 Generating daily sales report...');

    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Get orders for today
        const todayOrders = await Order.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const completedOrders = todayOrders.filter(o => o.status === 'delivered');
        const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        const report = {
            date: new Date().toISOString().split('T')[0],
            totalOrders: todayOrders.length,
            completedOrders: completedOrders.length,
            totalRevenue,
            averageOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
        };

        // Send report to admins
        const admins = await User.find({ role: 'admin' });

        for (const admin of admins) {
            await emailQueue.add('daily-report', {
                type: 'daily-report',
                data: {
                    email: admin.email,
                    report
                }
            });
        }

        console.log('📧 Daily report sent to admins');
    } catch (error) {
        console.error('Daily report generation failed:', error);
    }
});

/**
 * Clean up old completed jobs
 * Runs daily at 3 AM
 */
cron.schedule('0 3 * * *', async () => {
    console.log('🧹 Cleaning up old jobs...');

    try {
        const { emailQueue, smsQueue, orderQueue } = require('../config/queue');

        await emailQueue.clean(7 * 24 * 60 * 60 * 1000); // 7 days
        await smsQueue.clean(7 * 24 * 60 * 60 * 1000);
        await orderQueue.clean(7 * 24 * 60 * 60 * 1000);

        console.log('✅ Old jobs cleaned up');
    } catch (error) {
        console.error('Job cleanup failed:', error);
    }
});

console.log('⏰ Scheduled jobs initialized');
console.log('  - Abandoned cart check: Every hour');
console.log('  - Inventory check: Every 6 hours');
console.log('  - Daily report: 11 PM daily');
console.log('  - Job cleanup: 3 AM daily');

module.exports = { cron };
