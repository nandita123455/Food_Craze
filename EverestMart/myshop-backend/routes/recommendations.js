const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth } = require('../middleware/auth');

const RECOMMENDATION_SERVICE_URL = 'http://localhost:8001';

// Healthy Check
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get(`${RECOMMENDATION_SERVICE_URL}/health`);
        res.json(response.data);
    } catch (error) {
        console.error('Recommendation service health check failed:', error.message);
        res.status(503).json({
            success: false,
            message: 'Recommendation service unavailable'
        });
    }
});

// Get User Recommendations
router.get('/user', auth, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const limit = req.query.limit || 10;

        const response = await axios.get(`${RECOMMENDATION_SERVICE_URL}/recommend/user/${userId}?limit=${limit}`);
        res.json(response.data);
    } catch (error) {
        console.error('Failed to get user recommendations:', error.message);
        // Fallback to trending if service fails or user has no history
        try {
            const trendingResponse = await axios.get(`${RECOMMENDATION_SERVICE_URL}/recommend/trending?limit=${req.query.limit || 10}`);
            res.json(trendingResponse.data);
        } catch (fallbackError) {
            res.status(503).json({ success: false, message: 'Recommendation service unavailable' });
        }
    }
});

// Get Similar Products
router.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const limit = req.query.limit || 10;

        const response = await axios.get(`${RECOMMENDATION_SERVICE_URL}/recommend/similar/${productId}?limit=${limit}`);
        res.json(response.data);
    } catch (error) {
        console.error('Failed to get similar products:', error.message);
        res.status(503).json({ success: false, message: 'Recommendation service unavailable' });
    }
});

// Get Trending Products
router.get('/trending', async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const response = await axios.get(`${RECOMMENDATION_SERVICE_URL}/recommend/trending?limit=${limit}`);
        res.json(response.data);
    } catch (error) {
        console.error('Failed to get trending products:', error.message);
        res.status(503).json({ success: false, message: 'Recommendation service unavailable' });
    }
});

module.exports = router;
