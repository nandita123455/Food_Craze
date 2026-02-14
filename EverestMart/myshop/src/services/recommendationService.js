import axios from 'axios';

// Use the backend proxy instead of direct interaction
const API_URL = 'http://localhost:5000/api/recommendations';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Recommendation Service
 * Interacts with the backend proxy to get ML-powered recommendations
 */
const RecommendationService = {
    /**
     * Get personalized recommendations for the logged-in user
     */
    getUserRecommendations: async (limit = 10) => {
        try {
            const response = await axios.get(`${API_URL}/user`, {
                params: { limit },
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user recommendations:', error);
            // Fallback to trending
            return { success: false, recommendations: [], algorithm: 'fallback' };
        }
    },

    /**
     * Get similar products based on a product ID
     */
    getSimilarProducts: async (productId, limit = 10) => {
        try {
            const response = await axios.get(`${API_URL}/product/${productId}`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching similar products:', error);
            return { success: false, recommendations: [], algorithm: 'fallback' };
        }
    },

    /**
     * Get trending products
     */
    getTrendingProducts: async (limit = 10) => {
        try {
            const response = await axios.get(`${API_URL}/trending`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching trending products:', error);
            return { success: false, recommendations: [], algorithm: 'fallback' };
        }
    },

    /**
     * Check service health
     */
    checkHealth: async () => {
        try {
            const response = await axios.get(`${API_URL}/health`);
            return response.data;
        } catch (error) {
            return { status: 'unavailable' };
        }
    }
};

export default RecommendationService;

