/**
 * Order Queue Worker
 * Handles order processing automation
 */

const { orderQueue } = require('../config/queue');
const { emailQueue, smsQueue } = require('../config/queue');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Auto-assign nearest available rider
 */
async function autoAssignRider(order) {
    try {
        const Rider = require('../models/Rider');

        // Find available riders near the delivery location
        const availableRiders = await Rider.find({
            isActive: true,
            isAvailable: true,
            'currentLocation.coordinates': {
                $near: {
                    $geometry: order.deliveryAddress.location,
                    $maxDistance: 5000 // 5km radius
                }
            }
        }).limit(5);

        if (availableRiders.length === 0) {
            console.log('⚠️ No riders available, will retry later');
            return null;
        }

        // Assign to first available rider
        const rider = availableRiders[0];
        order.riderId = rider._id;
        order.status = 'assigned';
        await order.save();

        console.log(`✅ Order ${order._id} assigned to rider ${rider.name}`);

        // Notify rider via socket.io (handled in real-time)
        const io = require('../server').io;
        if (io) {
            io.to(rider._id.toString()).emit('newOrder', order);
        }

        return rider;
    } catch (error) {
        console.error('Auto-assign rider failed:', error);
        return null;
    }
}

/**
 * Update inventory after order
 */
async function updateInventory(order) {
    try {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }
        console.log(`✅ Inventory updated for order ${order._id}`);
    } catch (error) {
        console.error('Inventory update failed:', error);
        throw error;
    }
}

// Process order jobs
orderQueue.process(async (job) => {
    const { type, data } = job.data;

    console.log(`📦 Processing order job: ${type}`);

    try {
        switch (type) {
            case 'new-order':
                const order = await Order.findById(data.orderId).populate('userId');

                if (!order) {
                    throw new Error('Order not found');
                }

                // 1. Update inventory
                await updateInventory(order);

                // 2. Auto-assign rider
                await autoAssignRider(order);

                // 3. Send confirmation email
                await emailQueue.add('order-confirmation', {
                    type: 'order-confirmation',
                    data: {
                        email: order.userId.email,
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                        items: order.items,
                        total: order.totalAmount
                    }
                });

                // 4. Send SMS notification
                if (order.userId.phone) {
                    await smsQueue.add('order-placed', {
                        type: 'order-placed',
                        data: {
                            phone: order.userId.phone,
                            orderId: order.orderNumber,
                            trackingUrl: `${process.env.CLIENT_URL}/orders/${order._id}`
                        }
                    });
                }

                break;

            case 'order-update':
                // Send update notifications
                const updatedOrder = await Order.findById(data.orderId).populate('userId');

                await emailQueue.add('order-update', {
                    type: 'order-update',
                    data: {
                        email: updatedOrder.userId.email,
                        order: updatedOrder,
                        status: data.status
                    }
                });

                if (data.status === 'shipped' && updatedOrder.userId.phone) {
                    await smsQueue.add('order-shipped', {
                        type: 'order-shipped',
                        data: {
                            phone: updatedOrder.userId.phone,
                            orderId: updatedOrder.orderNumber,
                            estimatedTime: data.estimatedTime || '30-45 mins'
                        }
                    });
                }

                break;

            default:
                console.log(`Unknown order job type: ${type}`);
        }

        return { success: true, type };
    } catch (error) {
        console.error(`Order job failed:`, error);
        throw error;
    }
});

console.log('📦 Order worker started');

module.exports = orderQueue;
