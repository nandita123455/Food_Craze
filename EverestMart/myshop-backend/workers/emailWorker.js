/**
 * Email Queue Worker
 * Processes email jobs from the queue
 */

const { emailQueue } = require('../config/queue');
const emailService = require('../utils/emailService');

// Process email jobs
emailQueue.process(async (job) => {
    const { type, data } = job.data;

    console.log(`📧 Processing email job: ${type}`);

    try {
        switch (type) {
            case 'welcome':
                await emailService.sendWelcomeEmail(data.email, data.name);
                break;

            case 'order-confirmation':
                await emailService.sendOrderConfirmation(data);
                break;

            case 'order-update':
                await emailService.sendOrderUpdate(data);
                break;

            case 'abandoned-cart':
                await emailService.sendAbandonedCartEmail(data);
                break;

            case 'low-stock-alert':
                await emailService.sendLowStockAlert(data);
                break;

            default:
                throw new Error(`Unknown email type: ${type}`);
        }

        return { success: true, type };
    } catch (error) {
        console.error(`Email job failed:`, error);
        throw error;
    }
});

console.log('📧 Email worker started');

module.exports = emailQueue;
