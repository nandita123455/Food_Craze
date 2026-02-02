/**
 * Automation Service
 * Central service to trigger automated workflows
 * Works with both Redis queues and simple in-memory queues
 */

const { emailQueue, smsQueue, orderQueue, inventoryQueue } = require('../config/queue');

class AutomationService {
    /**
     * Trigger workflow when new order is created
     */
    static async onOrderCreated(orderId) {
        try {
            await orderQueue.add('new-order', {
                type: 'new-order',
                data: { orderId }
            });

            console.log(`✅ Order workflow triggered for ${orderId}`);
        } catch (error) {
            console.error('Failed to trigger order workflow:', error);
        }
    }

    /**
     * Trigger workflow when order status changes
     */
    static async onOrderStatusUpdate(orderId, newStatus, metadata = {}) {
        try {
            await orderQueue.add('order-update', {
                type: 'order-update',
                data: {
                    orderId,
                    status: newStatus,
                    ...metadata
                }
            });

            console.log(`✅ Order update workflow triggered for ${orderId}`);
        } catch (error) {
            console.error('Failed to trigger order update workflow:', error);
        }
    }

    /**
     * Send welcome email to new user
     */
    static async onUserRegistered(email, name) {
        try {
            await emailQueue.add('welcome', {
                type: 'welcome',
                data: { email, name }
            });

            console.log(`✅ Welcome email queued for ${email}`);
        } catch (error) {
            console.error('Failed to queue welcome email:', error);
        }
    }

    /**
     * Send OTP via SMS
     */
    static async sendOTP(phone, otp) {
        try {
            await smsQueue.add('otp', {
                type: 'otp',
                data: { phone, otp }
            }, {
                priority: 10, // High priority
                attempts: 5
            });

            console.log(`✅ OTP SMS queued for ${phone}`);
        } catch (error) {
            console.error('Failed to queue OTP SMS:', error);
        }
    }

    /**
     * Notify on low stock
     */
    static async onLowStock(productId, currentStock) {
        try {
            await inventoryQueue.add('low-stock-alert', {
                type: 'low-stock-alert',
                data: { productId, currentStock }
            });

            console.log(`✅ Low stock alert queued for product ${productId}`);
        } catch (error) {
            console.error('Failed to queue low stock alert:', error);
        }
    }

    /**
     * Send custom email
     */
    static async sendCustomEmail(email, subject, content) {
        try {
            await emailQueue.add('custom', {
                type: 'custom',
                data: { email, subject, content }
            });

            console.log(`✅ Custom email queued for ${email}`);
        } catch (error) {
            console.error('Failed to queue custom email:', error);
        }
    }

    /**
     * Send custom SMS
     */
    static async sendCustomSMS(phone, message) {
        try {
            await smsQueue.add('custom', {
                type: 'custom',
                data: { phone, message }
            });

            console.log(`✅ Custom SMS queued for ${phone}`);
        } catch (error) {
            console.error('Failed to queue custom SMS:', error);
        }
    }
}

module.exports = AutomationService;
