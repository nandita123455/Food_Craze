/**
 * Centralized Configuration for Quixo Frontend
 * 
 * This file consolidates all environment-based configuration.
 * All API URLs and external service URLs should be accessed through this config.
 */

// Environment variables with fallbacks
const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',

  // Application Settings
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Food Craze',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG !== 'false', // Default true in dev

  // Firebase Configuration
  FIREBASE: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  },

  // Google Services
  GOOGLE: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    mapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  },

  // Helper Methods
  isDevelopment: () => config.APP_ENV === 'development',
  isProduction: () => config.APP_ENV === 'production',
  isStaging: () => config.APP_ENV === 'staging',

  // Get full API endpoint
  getApiEndpoint: (path) => {
    const basePath = path.startsWith('/') ? path : `/${path}`;
    return `${config.API_BASE_URL}${basePath}`;
  },

  // Get asset URL (for images, etc.)
  getAssetUrl: (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;

    // Normalize path (replace backslashes with forward slashes for Windows compatibility)
    const normalizedPath = path.replace(/\\/g, '/');
    const assetPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

    return `${config.API_URL}${assetPath}`;
  },
};

// Log configuration in development
if (config.isDevelopment() && config.ENABLE_DEBUG) {
  console.log('🔧 App Configuration:', {
    API_URL: config.API_URL,
    API_BASE_URL: config.API_BASE_URL,
    SOCKET_URL: config.SOCKET_URL,
    APP_ENV: config.APP_ENV,
  });
}

export default config;
