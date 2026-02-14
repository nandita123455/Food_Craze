module.exports = {
    apps: [
        {
            name: "myshop-backend",
            cwd: "./EverestMart/myshop-backend",
            script: "server.js",
            instances: "max",
            exec_mode: "cluster",
            env: {
                NODE_ENV: "production",
                PORT: 5000,
                // Ensure these match your actual backend configuration
                CLIENT_URL: "http://localhost:3000",
                ADMIN_URL: "http://localhost:3001"
            }
        },
        {
            name: "myshop-client",
            cwd: "./EverestMart/myshop",
            script: "serve",
            env: {
                PM2_SERVE_PATH: "./dist",
                PM2_SERVE_PORT: 3000,
                PM2_SERVE_SPA: "true",
                PM2_SERVE_HOMEPAGE: "/index.html"
            }
        },
        {
            name: "everestmart-admin",
            cwd: "./EverestMart/everestmart-admin",
            script: "serve",
            env: {
                PM2_SERVE_PATH: "./build",
                PM2_SERVE_PORT: 3001,
                PM2_SERVE_SPA: "true",
                PM2_SERVE_HOMEPAGE: "/index.html"
            }
        },
        {
            name: "recommendation-service",
            cwd: "./recommendation-service",
            script: "start-recommendation-service.bat",
            interpreter: "cmd.exe",
            args: "/c"
        }
    ]
};
