const express = require('express');
const router = express.Router();
const UserBehavior = require('../models/UserBehavior');
const UserSession = require('../models/UserSession');
const { v4: uuidv4 } = require('uuid');

// Track single user behavior
router.post('/track', async (req, res) => {
    try {
        const {
            userId,
            sessionId,
            productId,
            action,
            metadata = {}
        } = req.body;

        // Validate required fields
        if (!productId || !action) {
            return res.status(400).json({
                success: false,
                message: 'productId and action are required'
            });
        }

        // Generate session ID if not provided
        const finalSessionId = sessionId || req.headers['x-session-id'] || uuidv4();

        // Create or update session
        const session = await UserSession.createOrGetSession(finalSessionId, {
            userId: userId || null,
            deviceInfo: {
                userAgent: req.headers['user-agent'],
                device: req.headers['x-device-type'] || 'desktop'
            },
            location: metadata.location || {},
            referrer: req.headers.referrer || req.headers.referer,
            landingPage: metadata.page
        });

        // Update session statistics
        await session.updateStats(action);

        // Track behavior
        const behavior = await UserBehavior.track({
            userId: userId || null,
            sessionId: finalSessionId,
            productId,
            action,
            metadata: {
                ...metadata,
                deviceType: session.deviceInfo?.device
            }
        });

        res.json({
            success: true,
            data: {
                behaviorId: behavior._id,
                sessionId: finalSessionId
            }
        });
    } catch (error) {
        console.error('Error tracking behavior:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track behavior',
            error: error.message
        });
    }
});

// Bulk track behaviors (for batch updates)
router.post('/bulk', async (req, res) => {
    try {
        const { behaviors } = req.body;

        if (!Array.isArray(behaviors) || behaviors.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'behaviors array is required'
            });
        }

        const results = await Promise.all(
            behaviors.map(behavior => UserBehavior.track(behavior))
        );

        res.json({
            success: true,
            data: {
                tracked: results.length
            }
        });
    } catch (error) {
        console.error('Error bulk tracking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bulk track behaviors',
            error: error.message
        });
    }
});

// Get user behavior history
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, action } = req.query;

        let query = { userId };
        if (action) {
            query.action = action;
        }

        const behaviors = await UserBehavior.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .populate('productId', 'name category price image');

        res.json({
            success: true,
            data: behaviors
        });
    } catch (error) {
        console.error('Error fetching user history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user history',
            error: error.message
        });
    }
});

// Get session behaviors
router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        const behaviors = await UserBehavior.find({ sessionId })
            .sort({ timestamp: -1 })
            .populate('productId', 'name category price image');

        const session = await UserSession.findOne({ sessionId });

        res.json({
            success: true,
            data: {
                session,
                behaviors
            }
        });
    } catch (error) {
        console.error('Error fetching session data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch session data',
            error: error.message
        });
    }
});

// Get product interaction stats
router.get('/product/:productId/stats', async (req, res) => {
    try {
        const { productId } = req.params;

        const stats = await UserBehavior.getProductStats(productId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching product stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product stats',
            error: error.message
        });
    }
});

// Get trending products
router.get('/trending', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const trending = await UserBehavior.getTrendingProducts(parseInt(limit));

        res.json({
            success: true,
            data: trending
        });
    } catch (error) {
        console.error('Error fetching trending products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trending products',
            error: error.message
        });
    }
});

// Get analytics summary
router.get('/analytics/summary', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const query = Object.keys(dateFilter).length > 0
            ? { timestamp: dateFilter }
            : {};

        const summary = await UserBehavior.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalUsers = await UserBehavior.distinct('userId', query);
        const totalSessions = await UserBehavior.distinct('sessionId', query);
        const activeSessions = await UserSession.getActiveSessions();

        res.json({
            success: true,
            data: {
                actionCounts: summary,
                totalUsers: totalUsers.length,
                totalSessions: totalSessions.length,
                activeSessions
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
});

// End session
router.post('/session/:sessionId/end', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { exitPage } = req.body;

        const session = await UserSession.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        await session.endSession(exitPage);

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to end session',
            error: error.message
        });
    }
});

module.exports = router;
