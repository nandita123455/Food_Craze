/**
 * Simple In-Memory Queue (No Redis Required)
 * Perfect for development and corporate environments
 */

const EventEmitter = require('events');

class SimpleQueue extends EventEmitter {
    constructor(name) {
        super();
        this.name = name;
        this.jobs = [];
        this.processing = false;
        this.processors = [];
    }

    /**
     * Add job to queue
     */
    async add(jobType, data, options = {}) {
        const job = {
            id: Date.now() + Math.random(),
            type: jobType,
            data,
            options,
            attempts: 0,
            maxAttempts: options.attempts || 3,
            addedAt: new Date()
        };

        this.jobs.push(job);
        console.log(`✅ Job added to ${this.name}: ${jobType}`);

        // Process immediately
        setImmediate(() => this.processNext());

        return job;
    }

    /**
     * Register processor function
     */
    process(processorFn) {
        this.processors.push(processorFn);
        console.log(`✅ Processor registered for ${this.name}`);
    }

    /**
     * Process next job in queue
     */
    async processNext() {
        if (this.processing || this.jobs.length === 0) {
            return;
        }

        this.processing = true;
        const job = this.jobs.shift();

        try {
            // Run all processors
            for (const processor of this.processors) {
                await processor(job);
            }

            this.emit('completed', job);
            console.log(`✅ ${this.name} job ${job.id} completed`);
        } catch (error) {
            job.attempts++;

            if (job.attempts < job.maxAttempts) {
                // Retry
                console.warn(`⚠️ ${this.name} job ${job.id} failed, retrying... (${job.attempts}/${job.maxAttempts})`);
                this.jobs.push(job);
            } else {
                // Max attempts reached
                this.emit('failed', job, error);
                console.error(`❌ ${this.name} job ${job.id} failed:`, error.message);
            }
        } finally {
            this.processing = false;

            // Process next job if any
            if (this.jobs.length > 0) {
                setImmediate(() => this.processNext());
            }
        }
    }

    /**
     * Get queue size
     */
    getWaitingCount() {
        return this.jobs.length;
    }
}

// Create queues
const emailQueue = new SimpleQueue('email-notifications');
const smsQueue = new SimpleQueue('sms-notifications');
const orderQueue = new SimpleQueue('order-processing');
const inventoryQueue = new SimpleQueue('inventory-management');

// Queue event handlers
const setupQueueEvents = (queue, name) => {
    queue.on('completed', (job) => {
        console.log(`✅ ${name} job ${job.id} completed`);
    });

    queue.on('failed', (job, err) => {
        console.error(`❌ ${name} job ${job.id} failed:`, err.message);
    });
};

setupQueueEvents(emailQueue, 'Email');
setupQueueEvents(smsQueue, 'SMS');
setupQueueEvents(orderQueue, 'Order');
setupQueueEvents(inventoryQueue, 'Inventory');

console.log('📦 Simple in-memory queues initialized (No Redis required)');

module.exports = {
    emailQueue,
    smsQueue,
    orderQueue,
    inventoryQueue
};
