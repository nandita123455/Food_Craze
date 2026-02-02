"""
Collaborative Filtering Recommendation Model
Uses user-product interaction matrix and similarity-based filtering
"""

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import dok_matrix
import joblib
import logging

logger = logging.getLogger(__name__)

class CollaborativeFilter:
    def __init__(self):
        self.user_item_matrix = None
        self.user_similarity = None
        self.product_ids = []
        self.user_ids = []
        self.trained = False
    
    def train(self, interaction_data):
        """
        Train collaborative filtering model
        
        Args:
            interaction_data: List of dicts with userId, productId, and score/action
        """
        try:
            if not interaction_data or len(interaction_data) == 0:
                logger.warning("No interaction data provided for training")
                return
            
            logger.info(f"Training collaborative filter with {len(interaction_data)} interactions")
            
            # Convert to DataFrame
            df = pd.DataFrame(interaction_data)
            
            # Create scoring based on action types
            action_scores = {
                'view': 1,
                'click': 2,
                'add_to_cart': 3,
                'purchase': 5,
                'wishlist': 4
            }
            
            if 'action' in df.columns:
                df['score'] = df['action'].map(action_scores).fillna(1)
            elif 'score' not in df.columns:
                df['score'] = 1
            
            # Get unique users and products
            self.user_ids = df['userId'].unique().tolist()
            self.product_ids = df['productId'].unique().tolist()
            
            # Create user-item matrix
            n_users = len(self.user_ids)
            n_products = len(self.product_ids)
            
            self.user_item_matrix = dok_matrix((n_users, n_products), dtype=np.float32)
            
            user_id_map = {uid: idx for idx, uid in enumerate(self.user_ids)}
            product_id_map = {pid: idx for idx, pid in enumerate(self.product_ids)}
            
            # Fill matrix with interaction scores
            for _, row in df.iterrows():
                user_idx = user_id_map.get(row['userId'])
                product_idx = product_id_map.get(row['productId'])
                
                if user_idx is not None and product_idx is not None:
                    # Accumulate scores for multiple interactions
                    self.user_item_matrix[user_idx, product_idx] += row['score']
            
            # Convert to dense for similarity calculation
            matrix_dense = self.user_item_matrix.toarray()
            
            # Calculate user similarity using cosine similarity
            # Add small epsilon to avoid division by zero
            self.user_similarity = cosine_similarity(matrix_dense + 1e-9)
            
            self.trained = True
            logger.info(f"✅ Collaborative filter trained: {n_users} users, {n_products} products")
            
        except Exception as e:
            logger.error(f"Error training collaborative filter: {str(e)}")
            raise
    
    def recommend(self, user_id, n_recommendations=10):
        """
        Get recommendations for a user
        
        Args:
            user_id: User ID to get recommendations for
            n_recommendations: Number of recommendations to return
        
        Returns:
            List of recommended product IDs with scores
        """
        try:
            if not self.trained:
                logger.warning("Model not trained yet")
                return []
            
            # Check if user exists in training data
            if user_id not in self.user_ids:
                logger.info(f"User {user_id} not in training data, returning popular items")
                return self._get_popular_products(n_recommendations)
            
            user_idx = self.user_ids.index(user_id)
            
            # Get similar users
            similar_users = self.user_similarity[user_idx]
            
            # Get weighted average of similar users' preferences
            user_ratings = self.user_item_matrix.toarray()
            weighted_ratings = similar_users.dot(user_ratings)
            
            # Get products user hasn't interacted with
            user_products = user_ratings[user_idx]
            weighted_ratings[user_products > 0] = -np.inf  # Exclude already interacted products
            
            # Get top N recommendations
            top_indices = weighted_ratings.argsort()[::-1][:n_recommendations]
            
            recommendations = [
               {
                    'product_id': str(self.product_ids[idx]),
                    'score': float(weighted_ratings[idx]),
                    'rank': rank + 1
                }
                for rank, idx in enumerate(top_indices)
                if weighted_ratings[idx] > -np.inf
            ]
            
            # If not enough recommendations, fill with popular items
            if len(recommendations) < n_recommendations:
                popular = self._get_popular_products(n_recommendations - len(recommendations))
                recommendations.extend(popular)
            
            return recommendations[:n_recommendations]
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return self._get_popular_products(n_recommendations)
    
    def _get_popular_products(self, n=10):
        """Get most popular products based on interaction count"""
        if not self.trained or self.user_item_matrix is None:
            return []
        
        # Sum interactions across all users
        product_popularity = np.array(self.user_item_matrix.sum(axis=0)).flatten()
        top_indices = product_popularity.argsort()[::-1][:n]
        
        return [
            {
                'product_id': str(self.product_ids[idx]),
                'score': float(product_popularity[idx]),
                'rank': rank + 1,
                'reason': 'popular'
            }
            for rank, idx in enumerate(top_indices)
            if product_popularity[idx] > 0
        ]
    
    def save_model(self, filepath):
        """Save trained model to disk"""
        try:
            import os
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            model_data = {
                'user_item_matrix': self.user_item_matrix,
                'user_similarity': self.user_similarity,
                'product_ids': self.product_ids,
                'user_ids': self.user_ids,
                'trained': self.trained
            }
            joblib.dump(model_data, filepath)
            logger.info(f"✅ Model saved to {filepath}")
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
    
    def load_model(self, filepath):
        """Load trained model from disk"""
        try:
            model_data = joblib.load(filepath)
            self.user_item_matrix = model_data['user_item_matrix']
            self.user_similarity = model_data['user_similarity']
            self.product_ids = model_data['product_ids']
            self.user_ids = model_data['user_ids']
            self.trained = model_data['trained']
            logger.info(f"✅ Model loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise FileNotFoundError(f"Model file not found: {filepath}")
