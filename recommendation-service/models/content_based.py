"""
Content-Based Filtering Recommendation Model
Uses product features and TF-IDF for similarity
"""

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import logging

logger = logging.getLogger(__name__)

class ContentBasedFilter:
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=500,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.tfidf_matrix = None
        self.product_features = None
        self.product_ids = []
        self.trained = False
    
    def train(self, product_data):
        """
        Train content-based model using product features
        
        Args:
            product_data: List of dicts with product information
                         (id, name, description, category, etc.)
        """
        try:
            if not product_data or len(product_data) == 0:
                logger.warning("No product data provided for training")
                return
            
            logger.info(f"Training content-based filter with {len(product_data)} products")
            
            # Convert to DataFrame
            df = pd.DataFrame(product_data)
            
            # Store product IDs
            self.product_ids = df['_id'].astype(str).tolist() if '_id' in df.columns else df['id'].astype(str).tolist()
            
            # Create combined feature text from name, description, category
            df['combined_features'] = ''
            
            if 'name' in df.columns:
                df['combined_features'] += df['name'].fillna('').astype(str) + ' '
            
            if 'description' in df.columns:
                df['combined_features'] += df['description'].fillna('').astype(str) + ' '
            
            if 'category' in df.columns:
                # Repeat category multiple times to increase its weight
                df['combined_features'] += (df['category'].fillna('').astype(str) + ' ') * 3
            
            if 'tags' in df.columns:
                df['combined_features'] += df['tags'].fillna('').astype(str) + ' '
            
            # Create TF-IDF matrix
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(df['combined_features'])
            
            # Store product features for reference
            self.product_features = df[['name', 'category', 'price']].to_dict('records') if 'name' in df.columns else []
            
            self.trained = True
            logger.info(f"✅ Content-based filter trained with {len(self.product_ids)} products")
            
        except Exception as e:
            logger.error(f"Error training content-based filter: {str(e)}")
            raise
    
    def find_similar(self, product_id, n_recommendations=10):
        """
        Find similar products based on content features
        
        Args:
            product_id: Product ID to find similar products for
            n_recommendations: Number of similar products to return
        
        Returns:
            List of similar product IDs with similarity scores
        """
        try:
            if not self.trained:
                logger.warning("Model not trained yet")
                return []
            
            product_id = str(product_id)
            
            # Check if product exists
            if product_id not in self.product_ids:
                logger.warning(f"Product {product_id} not found in training data")
                return []
            
            # Get product index
            product_idx = self.product_ids.index(product_id)
            
            # Calculate cosine similarity with all products
            product_vector = self.tfidf_matrix[product_idx]
            similarities = cosine_similarity(product_vector, self.tfidf_matrix).flatten()
            
            # Get top N similar products (excluding the product itself)
            similar_indices = similarities.argsort()[::-1][1:n_recommendations + 1]
            
            recommendations = [
                {
                    'product_id': self.product_ids[idx],
                    'similarity_score': float(similarities[idx]),
                    'rank': rank + 1,
                    'features': self.product_features[idx] if idx < len(self.product_features) else {}
                }
                for rank, idx in enumerate(similar_indices)
                if similarities[idx] > 0.01  # Minimum similarity threshold
            ]
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error finding similar products: {str(e)}")
            return []
    
    def get_recommendations_by_category(self, category, n_recommendations=10):
        """Get top products in a specific category"""
        try:
            if not self.trained or not self.product_features:
                return []
            
            # Filter products by category
            category_products = [
                (idx, feat) for idx, feat in enumerate(self.product_features)
                if feat.get('category', '').lower() == category.lower()
            ]
            
            if not category_products:
                return []
            
            # Sort by some criteria (price, name, etc.) or return random sample
            recommendations = [
                {
                    'product_id': self.product_ids[idx],
                    'rank': rank + 1,
                    'features': feat
                }
                for rank, (idx, feat) in enumerate(category_products[:n_recommendations])
            ]
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting category recommendations: {str(e)}")
            return []
    
    def save_model(self, filepath):
        """Save trained model to disk"""
        try:
            import os
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            model_data = {
                'tfidf_vectorizer': self.tfidf_vectorizer,
                'tfidf_matrix': self.tfidf_matrix,
                'product_features': self.product_features,
                'product_ids': self.product_ids,
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
            self.tfidf_vectorizer = model_data['tfidf_vectorizer']
            self.tfidf_matrix = model_data['tfidf_matrix']
            self.product_features = model_data['product_features']
            self.product_ids = model_data['product_ids']
            self.trained = model_data['trained']
            logger.info(f"✅ Model loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise FileNotFoundError(f"Model file not found: {filepath}")
