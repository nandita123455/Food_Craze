/**
 * Job Queue Configuration
 * Uses Bull and Redis for background job processing
 */

const Bull = require('bull');
const Redis = require('ioredis');

// Redis connection config
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
};

// Create job queues
const emailQueue = new Bull('email-notifications', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

const smsQueue = new Bull('sms-notifications', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        }
    }
});

const orderQueue = new Bull('order-processing', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: 'fixed',
            delay: 5000
        }
    }
});

const inventoryQueue = new Bull('inventory-management', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 1
    }
});

// Queue event handlers
const setupQueueEvents = (queue, name) => {
    queue.on('completed', (job) => {
        console.log(`✅ ${name} job ${job.id} completed`);
    });

    queue.on('failed', (job, err) => {
        console.error(`❌ ${name} job ${job.id} failed:`, err.message);
    });

    queue.on('stalled', (job) => {
        console.warn(`⚠️ ${name} job ${job.id} stalled`);
    });
};

setupQueueEvents(emailQueue, 'Email');
setupQueueEvents(smsQueue, 'SMS');
setupQueueEvents(orderQueue, 'Order');
setupQueueEvents(inventoryQueue, 'Inventory');

module.exports = {
    emailQueue,
    smsQueue,
    orderQueue,
    inventoryQueue
};
