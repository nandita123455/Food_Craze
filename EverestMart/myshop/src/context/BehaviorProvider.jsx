import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import BehaviorTracker from '../services/behaviorTracker';

// Context for behavior tracking
const BehaviorContext = createContext(null);

// Session tracking state
let sessionStartTime = Date.now();
let lastActivityTime = Date.now();
let isIdle = false;
const IDLE_THRESHOLD = 60000; // 1 minute

/**
 * BehaviorProvider - Provides comprehensive user behavior tracking
 * 
 * Features:
 * - Automatic page view tracking on route changes
 * - Scroll depth tracking
 * - Time on page tracking
 * - Idle/active state detection
 * - Session management
 */
export function BehaviorProvider({ children }) {
    const location = useLocation();
    const scrollDepthRef = useRef(0);
    const pageViewTimeRef = useRef(Date.now());
    const lastPageRef = useRef('');

    // Track page views on route changes
    useEffect(() => {
        const currentPath = location.pathname;

        // Record time spent on previous page
        if (lastPageRef.current && lastPageRef.current !== currentPath) {
            const timeSpent = Math.floor((Date.now() - pageViewTimeRef.current) / 1000);
            if (timeSpent > 0) {
                BehaviorTracker.trackPageExit(lastPageRef.current, {
                    timeSpent,
                    scrollDepth: scrollDepthRef.current
                });
            }
        }

        // Track new page view
        BehaviorTracker.trackPageView(currentPath, {
            referrer: lastPageRef.current || document.referrer,
            timestamp: new Date().toISOString()
        });

        // Reset tracking for new page
        lastPageRef.current = currentPath;
        pageViewTimeRef.current = Date.now();
        scrollDepthRef.current = 0;

    }, [location.pathname]);

    // Track scroll depth
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

            // Update max scroll depth
            if (scrollPercent > scrollDepthRef.current) {
                scrollDepthRef.current = scrollPercent;
            }

            // Update activity time
            lastActivityTime = Date.now();
            if (isIdle) {
                isIdle = false;
                BehaviorTracker.trackActivity('resume_activity');
            }
        };

        // Throttled scroll handler
        let ticking = false;
        const throttledScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledScroll, { passive: true });
        return () => window.removeEventListener('scroll', throttledScroll);
    }, []);

    // Track user activity and idle state
    useEffect(() => {
        const activityEvents = ['mousedown', 'keydown', 'touchstart'];

        const handleActivity = () => {
            lastActivityTime = Date.now();
            if (isIdle) {
                isIdle = false;
                BehaviorTracker.trackActivity('resume_activity');
            }
        };

        activityEvents.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // Check for idle state periodically
        const idleChecker = setInterval(() => {
            if (Date.now() - lastActivityTime > IDLE_THRESHOLD && !isIdle) {
                isIdle = true;
                BehaviorTracker.trackActivity('idle');
            }
        }, 10000);

        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            clearInterval(idleChecker);
        };
    }, []);

    // Track visibility changes (tab switch)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                BehaviorTracker.trackActivity('tab_hidden');
            } else {
                BehaviorTracker.trackActivity('tab_visible');
                lastActivityTime = Date.now();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Track category view
    const trackCategoryView = useCallback((category, metadata = {}) => {
        BehaviorTracker.trackCategoryView(category, metadata);
    }, []);

    // Track search
    const trackSearch = useCallback((query, metadata = {}) => {
        BehaviorTracker.trackSearch(query, metadata);
    }, []);

    // Track product interaction
    const trackProduct = useCallback((productId, action, metadata = {}) => {
        BehaviorTracker.track(productId, action, metadata);
    }, []);

    // Track impression (product seen in list)
    const trackImpressions = useCallback((productIds, listType = 'product_list') => {
        BehaviorTracker.trackImpressions(productIds, listType);
    }, []);

    // Context value
    const value = {
        trackCategoryView,
        trackSearch,
        trackProduct,
        trackImpressions,
        getSessionDuration: () => Math.floor((Date.now() - sessionStartTime) / 1000),
        isUserIdle: () => isIdle
    };

    return (
        <BehaviorContext.Provider value={value}>
            {children}
        </BehaviorContext.Provider>
    );
}

// Hook to use behavior tracking
export function useBehavior() {
    const context = useContext(BehaviorContext);
    if (!context) {
        throw new Error('useBehavior must be used within a BehaviorProvider');
    }
    return context;
}

export default BehaviorProvider;
