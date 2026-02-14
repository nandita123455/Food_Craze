import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const RECOMMENDATION_API = import.meta.env.VITE_RECOMMENDATION_API_URL || 'http://localhost:8001';

// Behavior buffer for batch tracking
let behaviorBuffer = [];
const BUFFER_FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_BUFFER_SIZE = 20;

// Generate a unique session ID
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('behaviorSessionId');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('behaviorSessionId', sessionId);
    }
    return sessionId;
};

// Get device type
const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
};

/**
 * Behavior Tracking Service
 * Comprehensive tracking for recommendation system
 */
class BehaviorTracker {
    /**
     * Track a user behavior/interaction
     */
    static async track(productId, action, metadata = {}) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const sessionId = getSessionId();

            const behaviorData = {
                userId: user._id || user.id || null,
                sessionId,
                productId,
                action, // 'view', 'click', 'add_to_cart', 'purchase', 'wishlist'
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString(),
                    page: window.location.pathname,
                    referrer: document.referrer,
                    deviceType: getDeviceType()
                }
            };

            // Add to buffer for batch processing
            behaviorBuffer.push(behaviorData);

            // Flush if buffer is full
            if (behaviorBuffer.length >= MAX_BUFFER_SIZE) {
                await this.flushBuffer();
            }

            // Also send to recommendation service for real-time updates
            this._sendToRecommendationService(behaviorData);

        } catch (error) {
            // Silently fail - don't disrupt user experience
            console.debug('Behavior tracking failed:', error.message);
        }
    }

    /**
     * Send behavior to recommendation service for real-time model updates
     */
    static async _sendToRecommendationService(behaviorData) {
        try {
            await axios.post(`${RECOMMENDATION_API}/behavior/track`, {
                user_id: behaviorData.userId,
                session_id: behaviorData.sessionId,
                product_id: behaviorData.productId,
                action: behaviorData.action,
                metadata: behaviorData.metadata
            }, { timeout: 2000 });
        } catch (error) {
            // Silent fail - recommendation service might be unavailable
            console.debug('Recommendation service tracking failed:', error.message);
        }
    }

    /**
     * Flush behavior buffer to backend
     */
    static async flushBuffer() {
        if (behaviorBuffer.length === 0) return;

        const bufferedBehaviors = [...behaviorBuffer];
        behaviorBuffer = [];

        try {
            await axios.post(`${API_URL}/behavior/bulk`, {
                behaviors: bufferedBehaviors
            });
        } catch (error) {
            // Re-add failed behaviors back to buffer
            behaviorBuffer = bufferedBehaviors.concat(behaviorBuffer);
            console.debug('Buffer flush failed:', error.message);
        }
    }

    /**
     * Track page view
     */
    static trackPageView(page, metadata = {}) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const sessionId = getSessionId();

        return axios.post(`${API_URL}/behavior/track`, {
            userId: user._id || user.id || null,
            sessionId,
            productId: null,
            action: 'page_view',
            metadata: {
                ...metadata,
                page,
                deviceType: getDeviceType()
            }
        }).catch(err => console.debug('Page view tracking failed:', err.message));
    }

    /**
     * Track page exit with time spent
     */
    static trackPageExit(page, metadata = {}) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const sessionId = getSessionId();

        // Use sendBeacon for reliable exit tracking
        const data = JSON.stringify({
            userId: user._id || user.id || null,
            sessionId,
            productId: null,
            action: 'page_exit',
            metadata: {
                ...metadata,
                page
            }
        });

        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(`${API_URL}/behavior/track`, blob);
    }

    /**
     * Track product view
     */
    static trackView(productId, metadata = {}) {
        return this.track(productId, 'view', metadata);
    }

    /**
     * Track product click
     */
    static trackClick(productId, metadata = {}) {
        return this.track(productId, 'click', metadata);
    }

    /**
     * Track add to cart
     */
    static trackAddToCart(productId, quantity = 1, metadata = {}) {
        return this.track(productId, 'add_to_cart', {
            ...metadata,
            quantity
        });
    }

    /**
     * Track remove from cart
     */
    static trackRemoveFromCart(productId, metadata = {}) {
        return this.track(productId, 'remove_from_cart', metadata);
    }

    /**
     * Track purchase
     */
    static trackPurchase(productId, quantity = 1, price = 0, metadata = {}) {
        return this.track(productId, 'purchase', {
            ...metadata,
            quantity,
            price
        });
    }

    /**
     * Track wishlist addition
     */
    static trackWishlist(productId, metadata = {}) {
        return this.track(productId, 'wishlist', metadata);
    }

    /**
     * Track category view
     */
    static async trackCategoryView(category, metadata = {}) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const sessionId = getSessionId();

            await axios.post(`${API_URL}/behavior/track`, {
                userId: user._id || user.id || null,
                sessionId,
                productId: null,
                action: 'category_view',
                metadata: {
                    ...metadata,
                    category,
                    page: window.location.pathname,
                    deviceType: getDeviceType()
                }
            });
        } catch (error) {
            console.debug('Category view tracking failed:', error.message);
        }
    }

    /**
     * Track search query
     */
    static async trackSearch(query, metadata = {}) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const sessionId = getSessionId();

            await axios.post(`${API_URL}/behavior/track`, {
                userId: user._id || user.id || null,
                sessionId,
                productId: null,
                action: 'search',
                metadata: {
                    ...metadata,
                    searchQuery: query,
                    page: window.location.pathname,
                    deviceType: getDeviceType()
                }
            });
        } catch (error) {
            console.debug('Search tracking failed:', error.message);
        }
    }

    /**
     * Track product impressions (products seen in a list)
     */
    static async trackImpressions(productIds, listType = 'product_list') {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const sessionId = getSessionId();

            await axios.post(`${API_URL}/behavior/bulk`, {
                behaviors: productIds.slice(0, 20).map(productId => ({
                    userId: user._id || user.id || null,
                    sessionId,
                    productId,
                    action: 'impression',
                    metadata: {
                        listType,
                        page: window.location.pathname
                    }
                }))
            });
        } catch (error) {
            console.debug('Impression tracking failed:', error.message);
        }
    }

    /**
     * Track user activity state (idle, active, tab visibility)
     */
    static async trackActivity(activityType, metadata = {}) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const sessionId = getSessionId();

            await axios.post(`${API_URL}/behavior/track`, {
                userId: user._id || user.id || null,
                sessionId,
                productId: null,
                action: 'activity',
                metadata: {
                    ...metadata,
                    activityType,
                    page: window.location.pathname
                }
            });
        } catch (error) {
            console.debug('Activity tracking failed:', error.message);
        }
    }

    /**
     * Bulk track multiple behaviors
     */
    static async trackBulk(behaviors) {
        try {
            await axios.post(`${API_URL}/behavior/bulk`, { behaviors });
        } catch (error) {
            console.debug('Bulk tracking failed:', error.message);
        }
    }

    /**
     * End current session
     */
    static async endSession() {
        try {
            // Flush any pending behaviors
            await this.flushBuffer();

            const sessionId = getSessionId();
            await axios.post(`${API_URL}/behavior/session/${sessionId}/end`, {
                exitPage: window.location.pathname
            });

            // Clear session ID for next visit
            sessionStorage.removeItem('behaviorSessionId');
        } catch (error) {
            console.debug('Session end failed:', error.message);
        }
    }
}

// Set up periodic buffer flush
setInterval(() => {
    BehaviorTracker.flushBuffer();
}, BUFFER_FLUSH_INTERVAL);

// Track session end on page unload
window.addEventListener('beforeunload', () => {
    // Use sendBeacon for reliable tracking on page unload
    const sessionId = getSessionId();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const endSessionData = JSON.stringify({
        exitPage: window.location.pathname,
        userId: user._id || user.id || null
    });
    const endSessionBlob = new Blob([endSessionData], { type: 'application/json' });

    navigator.sendBeacon(
        `${API_URL}/behavior/session/${sessionId}/end`,
        endSessionBlob
    );

    // Also flush any pending behaviors
    if (behaviorBuffer.length > 0) {
        const bufferData = JSON.stringify({ behaviors: behaviorBuffer });
        const bufferBlob = new Blob([bufferData], { type: 'application/json' });

        navigator.sendBeacon(
            `${API_URL}/behavior/bulk`,
            bufferBlob
        );
    }
});

export default BehaviorTracker;

