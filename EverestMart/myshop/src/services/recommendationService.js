import axios from 'axios';

const RECOMMENDATION_API_URL = import.meta.env.VITE_RECOMMENDATION_API_URL || 'http://localhost:8001';

/**
 * Recommendation Service
 * Provides methods to interact with the ML recommendation API
 */

class RecommendationService {
    /**
     * Get personalized recommendations for a user
     */
    static async getUserRecommendations(userId, limit = 10) {
        try {
            const response = await axios.get(
                `${RECOMMENDATION_API_URL}/recommend/user/${userId}`,
                { params: { limit } }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching user recommendations:', error);
            return { success: false, recommendations: [], algorithm: 'fallback' };
        }
    }

    /**
     * Get similar products based on a product ID
     */
    static async getSimilarProducts(productId, limit = 10) {
        try {
            const response = await axios.get(
                `${RECOMMENDATION_API_URL}/recommend/similar/${productId}`,
                { params: { limit } }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching similar products:', error);
            return { success: false, recommendations: [], algorithm: 'fallback' };
        }
    }

    /**
     * Get trending products
     */
    static async getTrendingProducts(limit = 10) {
        try {
            const response = await axios.get(
                `${RECOMMENDATION_API_URL}/recommend/trending`,
                { params: { limit } }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching trending products:', error);
            return { success: false, recommendations: [], algorithm: 'fallback' };
        }
    }

    /**
     * Get cold-start recommendations for new users
     */
    static async getColdStartRecommendations(category = null, limit = 10) {
        try {
            const params = { limit };
            if (category) params.category = category;

            const response = await axios.get(
                `${RECOMMENDATION_API_URL}/recommend/cold-start`,
                { params }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching cold-start recommendations:', error);
            return { success: false, recommendations: [], algorithm: 'fallback' };
        }
    }

    /**
     * Get frequently bought together products
     */
    static async getFrequentlyBoughtTogether(productId, limit = 5) {
        try {
            const response = await axios.get(
                `${RECOMMENDATION_API_URL}/recommend/frequently-bought/${productId}`,
                { params: { limit } }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching frequently bought together:', error);
            return { success: false, recommendations: [], algorithm: 'fallback' };
        }
    }

    /**
     * Get time-based recommendations (based on time of day)
     */
    static async getTimeBasedRecommendations(limit = 10) {
        try {
            const response = await axios.get(
                `${RECOMMENDATION_API_URL}/recommend/time-based`,
                { params: { limit } }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching time-based recommendations:', error);
            return { success: false, recommendations: [], algorithm: 'fallback' };
        }
    }

    /**
     * Get hybrid recommendations (combines multiple algorithms)
     */
    static async getHybridRecommendations(userId, productId, limit = 10) {
        try {
            const response = await axios.post(
                `${RECOMMENDATION_API_URL}/recommend/hybrid`,
                {
                    user_id: userId,
                    product_id: productId,
                    limit
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching hybrid recommendations:', error);
            return { success: false, recommendations: [], algorithm: 'fallback' };
        }
    }

    /**
     * Get user behavior profile
     */
    static async getUserProfile(userId) {
        try {
            const response = await axios.get(
                `${RECOMMENDATION_API_URL}/user/${userId}/profile`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return { success: false, profile: { has_history: false } };
        }
    }

    /**
     * Trigger model retraining (admin only)
     */
    static async retrainModels() {
        try {
            const response = await axios.post(
                `${RECOMMENDATION_API_URL}/model/retrain`
            );
            return response.data;
        } catch (error) {
            console.error('Error retraining models:', error);
            throw error;
        }
    }

    /**
     * Get model status and statistics
     */
    static async getModelStatus() {
        try {
            const response = await axios.get(`${RECOMMENDATION_API_URL}/model/status`);
            return response.data;
        } catch (error) {
            console.error('Error fetching model status:', error);
            return { success: false };
        }
    }

    /**
     * Check recommendation service health
     */
    static async checkHealth() {
        try {
            const response = await axios.get(`${RECOMMENDATION_API_URL}/health`);
            return response.data;
        } catch (error) {
            console.error('Recommendation service unavailable:', error);
            return { status: 'unavailable' };
        }
    }

    /**
     * Get smart recommendations - picks best algorithm based on user state
     * Uses cold-start for new users, personalized for returning users
     */
    static async getSmartRecommendations(userId = null, category = null, limit = 10) {
        try {
            // Check if user has history
            if (userId) {
                const profile = await this.getUserProfile(userId);
                if (profile.success && profile.profile?.has_history) {
                    // User has history - get personalized recommendations
                    return await this.getUserRecommendations(userId, limit);
                }
            }

            // New user or no history - use cold start
            const coldStart = await this.getColdStartRecommendations(category, limit);
            if (coldStart.success && coldStart.recommendations.length > 0) {
                return coldStart;
            }

            // Fallback to time-based
            return await this.getTimeBasedRecommendations(limit);

        } catch (error) {
            console.error('Error getting smart recommendations:', error);
            return { success: false, recommendations: [], algorithm: 'fallback' };
        }
    }
}

export default RecommendationService;

