/**
 * PM2 Ecosystem Configuration for EverestMart Backend
 * 
 * This file configures PM2 process manager for running the backend in production.
 * PM2 provides clustering, auto-restart, and monitoring capabilities.
 * 
 * Usage:
 *   Development: pm2 start ecosystem.config.js
 *   Production:  pm2 start ecosystem.config.js --env production
 *   Cluster:     pm2 start ecosystem.config.js -i max
 */

module.exports = {
    apps: [{
        name: 'everestmart-backend',
        script: './server.js',

        // Instances configuration
        instances: process.env.PM2_INSTANCES || 1, // Use 'max' for clustering
        exec_mode: 'cluster', // cluster or fork

        // Environment variables
        env: {
            NODE_ENV: 'development',
            PORT: 5000,
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: process.env.PORT || 5000,
        },

        // Logging
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,

        // Auto-restart configuration
        watch: false, // Set to true only in development
        ignore_watch: ['node_modules', 'logs', 'uploads'],
        max_memory_restart: '500M', // Restart if memory exceeds 500MB

        // Graceful start/shutdown
        wait_ready: true,
        listen_timeout: 10000,
        kill_timeout: 5000,

        // Auto-restart on crash
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',

        // Cron restart (optional - restart daily at 3 AM)
        // cron_restart: '0 3 * * *',

        // Source maps support
        source_map_support: true,

        // Instance var (available in your app)
        instance_var: 'INSTANCE_ID',
    }]
};
