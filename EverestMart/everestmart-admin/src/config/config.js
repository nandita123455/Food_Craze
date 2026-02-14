/**
 * Centralized Configuration for Quixo Admin Panel
 */

const config = {
    // API Configuration
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',

    // Application Settings
    APP_ENV: process.env.REACT_APP_ENV || 'development',
    APP_NAME: process.env.REACT_APP_NAME || 'Food Craze Admin',
    ENABLE_DEBUG: process.env.REACT_APP_ENABLE_DEBUG !== 'false',

    // Helper Methods
    isDevelopment: () => config.APP_ENV === 'development',
    isProduction: () => config.APP_ENV === 'production',

    // Get full API endpoint
    getApiEndpoint: (path) => {
        const basePath = path.startsWith('/') ? path.substring(1) : path;
        return `${config.API_URL}/${basePath}`;
    },

    // Get asset URL
    getAssetUrl: (path) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const assetPath = path.startsWith('/') ? path : `/${path}`;
        return `${config.BACKEND_URL}${assetPath}`;
    },
};

// Log configuration in development
if (config.isDevelopment() && config.ENABLE_DEBUG) {
    console.log('🔧 Admin Configuration:', {
        API_URL: config.API_URL,
        BACKEND_URL: config.BACKEND_URL,
        APP_ENV: config.APP_ENV,
    });
}

export default config;
