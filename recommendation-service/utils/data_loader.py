"""
Data Loader Utility
Loads product and behavior data from MongoDB, external sources, and local cache
Enhanced with cold-start handling and real-time sync
"""

import os
import logging
from typing import List, Dict, Optional
import asyncio
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Import external data hooks
try:
    from .external_data import external_data, instacart_patterns
    EXTERNAL_DATA_AVAILABLE = True
except ImportError:
    EXTERNAL_DATA_AVAILABLE = False
    logger.warning("External data module not available")

class DataLoader:
    def __init__(self):
        self.products = []
        self.behaviors = []
        self.mongodb_uri = os.getenv('MONGODB_URI', '')
        self.use_mongodb = bool(self.mongodb_uri)
        
    async def load_data(self):
        """Load data from MongoDB or sample data"""
        try:
            if self.use_mongodb:
                await self._load_from_mongodb()
            else:
                self._load_sample_data()
                
            logger.info(f"✅ Loaded {len(self.products)} products and {len(self.behaviors)} behaviors")
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            # Fallback to sample data
            self._load_sample_data()
    
    async def _load_from_mongodb(self):
        """Load data from MongoDB"""
        try:
            from pymongo import MongoClient
            
            client = MongoClient(self.mongodb_uri)
            db = client.get_default_database()
            
            # Load products
            products_collection = db['products']
            self.products = list(products_collection.find())
            
            # Load user behaviors
            behaviors_collection = db['userbehaviors']
            self.behaviors = list(behaviors_collection.find().limit(10000))  # Limit for performance
            
            client.close()
            logger.info(f"Loaded from MongoDB: {len(self.products)} products, {len(self.behaviors)} behaviors")
            
        except Exception as e:
            logger.error(f"MongoDB error: {str(e)}")
            raise
    
    def _load_sample_data(self):
        """Load sample grocery data for initial testing"""
        logger.info("Loading sample grocery data...")
        
        # Sample grocery products
        self.products = [
            {'_id': '1', 'name': 'Fresh Milk', 'category': 'Dairy', 'price': 2.99, 'description': 'Fresh whole milk'},
            {'_id': '2', 'name': 'Bread', 'category': 'Bakery', 'price': 1.99, 'description': 'Whole wheat bread'},
            {'_id': '3', 'name': 'Eggs', 'category': 'Dairy', 'price': 3.49, 'description': 'Free range eggs'},
            {'_id': '4', 'name': 'Bananas', 'category': 'Fruits', 'price': 0.99, 'description': 'Fresh bananas'},
            {'_id': '5', 'name': 'Apples', 'category': 'Fruits', 'price': 2.49, 'description': 'Red apples'},
            {'_id': '6', 'name': 'Chicken Breast', 'category': 'Meat', 'price': 6.99, 'description': 'Fresh chicken breast'},
            {'_id': '7', 'name': 'Rice', 'category': 'Grains', 'price': 4.99, 'description': 'Basmati rice 5kg'},
            {'_id': '8', 'name': 'Pasta', 'category': 'Grains', 'price': 1.49, 'description': 'Spaghetti pasta'},
            {'_id': '9', 'name': 'Tomatoes', 'category': 'Vegetables', 'price': 1.99, 'description': 'Fresh tomatoes'},
            {'_id': '10', 'name': 'Potatoes', 'category': 'Vegetables', 'price': 2.99, 'description': 'Fresh potatoes'},
            {'_id': '11', 'name': 'Yogurt', 'category': 'Dairy', 'price': 1.99, 'description': 'Greek yogurt'},
            {'_id': '12', 'name': 'Cheese', 'category': 'Dairy', 'price': 4.99, 'description': 'Cheddar cheese'},
            {'_id': '13', 'name': 'Orange Juice', 'category': 'Beverages', 'price': 3.99, 'description': 'Fresh orange juice'},
            {'_id': '14', 'name': 'Coffee', 'category': 'Beverages', 'price': 7.99, 'description': 'Premium coffee beans'},
            {'_id': '15', 'name': 'Tea', 'category': 'Beverages', 'price': 3.49, 'description': 'Green tea'},
            {'_id': '16', 'name': 'Cereal', 'category': 'Breakfast', 'price': 3.99, 'description': 'Corn flakes'},
            {'_id': '17', 'name': 'Peanut Butter', 'category': 'Spreads', 'price': 4.49, 'description': 'Creamy peanut butter'},
            {'_id': '18', 'name': 'Jam', 'category': 'Spreads', 'price': 2.99, 'description': 'Strawberry jam'},
            {'_id': '19', 'name': 'Olive Oil', 'category': 'Oils', 'price': 8.99, 'description': 'Extra virgin olive oil'},
            {'_id': '20', 'name': 'Salt', 'category': 'Spices', 'price': 0.99, 'description': 'Sea salt'},
        ]
        
        # Sample user behaviors
        self.behaviors = [
            {'userId': 'user1', 'productId': '1', 'action': 'purchase'},
            {'userId': 'user1', 'productId': '2', 'action': 'purchase'},
            {'userId': 'user1', 'productId': '4', 'action': 'view'},
            {'userId': 'user2', 'productId': '1', 'action': 'purchase'},
            {'userId': 'user2', 'productId': '3', 'action': 'purchase'},
            {'userId': 'user2', 'productId': '6', 'action': 'add_to_cart'},
            {'userId': 'user3', 'productId': '4', 'action': 'purchase'},
            {'userId': 'user3', 'productId': '5', 'action': 'purchase'},
            {'userId': 'user3', 'productId': '1', 'action': 'view'},
        ]
        
        logger.info(f"Loaded {len(self.products)} sample products")
    
    def has_data(self) -> bool:
        """Check if data is loaded"""
        return len(self.products) > 0
    
    def get_product_data(self) -> List[Dict]:
        """Get product data for content-based filtering"""
        return self.products
    
    def get_interaction_data(self) -> List[Dict]:
        """Get user-product interaction data for collaborative filtering"""
        return self.behaviors
    
    def get_trending_products(self, limit: int = 10) -> List[Dict]:
        """Get trending products based on recent behaviors"""
        if not self.behaviors:
            # Return first N products if no behavior data
            return [
                {
                    'product_id': p['_id'],
                    'name': p.get('name'),
                    'category': p.get('category'),
                    'price': p.get('price'),
                    'rank': idx + 1
                }
                for idx, p in enumerate(self.products[:limit])
            ]
        
        # Count product occurrences in behaviors
        from collections import Counter
        product_counts = Counter([b['productId'] for b in self.behaviors])
        most_common = product_counts.most_common(limit)
        
        # Get product details for trending items
        product_map = {p['_id']: p for p in self.products}
        
        trending = []
        for idx, (product_id, count) in enumerate(most_common):
            product = product_map.get(product_id, {})
            trending.append({
                'product_id': product_id,
                'name': product.get('name'),
                'category': product.get('category'),
                'price': product.get('price'),
                'interaction_count': count,
                'rank': idx + 1
            })
        
        return trending
    
    def get_product_by_id(self, product_id: str) -> Optional[Dict]:
        """Get a single product by ID"""
        for product in self.products:
            if str(product['_id']) == str(product_id):
                return product
        return None
    
    async def sync_from_mongodb(self):
        """Reload data from MongoDB (for periodic updates)"""
        if self.use_mongodb:
            await self._load_from_mongodb()
        else:
            logger.warning("MongoDB not configured, using sample data")
    
    def add_behavior(self, behavior: Dict):
        """Add a new behavior record in real-time"""
        self.behaviors.append(behavior)
        # Keep behaviors list manageable
        if len(self.behaviors) > 15000:
            self.behaviors = self.behaviors[-10000:]
    
    def get_cold_start_recommendations(self, category: Optional[str] = None, limit: int = 10) -> List[Dict]:
        """
        Get recommendations for new users with no behavior history
        Uses external data patterns if available, otherwise uses product popularity
        """
        if EXTERNAL_DATA_AVAILABLE:
            # Get pattern-based recommendations
            pattern_recs = external_data.get_cold_start_recommendations(category, limit * 2)
            
            # Match patterns to actual products in catalog
            matched_products = []
            for rec in pattern_recs:
                product_name = rec.get('product_name', '').lower()
                for product in self.products:
                    if product_name in product.get('name', '').lower():
                        matched_products.append({
                            'product_id': str(product.get('_id', product.get('id', ''))),
                            'name': product.get('name'),
                            'category': product.get('category'),
                            'price': product.get('price'),
                            'confidence': rec.get('confidence', 0.5),
                            'source': 'cold_start'
                        })
                        break
            
            if matched_products:
                return matched_products[:limit]
        
        # Fallback: return category-filtered or top products
        if category:
            category_products = [
                p for p in self.products 
                if category.lower() in p.get('category', '').lower()
            ]
            products_to_return = category_products[:limit] if category_products else self.products[:limit]
        else:
            products_to_return = self.products[:limit]
        
        return [
            {
                'product_id': str(p.get('_id', p.get('id', ''))),
                'name': p.get('name'),
                'category': p.get('category'),
                'price': p.get('price'),
                'source': 'default'
            }
            for p in products_to_return
        ]
    
    def get_frequently_bought_together(self, product_id: str, limit: int = 5) -> List[Dict]:
        """
        Get products frequently bought together with given product
        Uses external patterns if available
        """
        product = self.get_product_by_id(product_id)
        if not product:
            return []
        
        product_name = product.get('name', '')
        related = []
        
        if EXTERNAL_DATA_AVAILABLE:
            # Get co-purchase suggestions from external patterns
            suggestions = instacart_patterns.get_co_purchase_suggestions(product_name)
            
            # Match suggestions to actual products
            for suggestion in suggestions:
                suggestion_name = suggestion.get('suggestion', '').lower()
                for p in self.products:
                    if suggestion_name in p.get('name', '').lower() and str(p.get('_id')) != product_id:
                        related.append({
                            'product_id': str(p.get('_id', p.get('id', ''))),
                            'name': p.get('name'),
                            'category': p.get('category'),
                            'price': p.get('price'),
                            'confidence': suggestion.get('confidence', 0.5),
                            'type': 'frequently_bought_together'
                        })
                        break
        
        # Fallback: same category products
        if len(related) < limit:
            product_category = product.get('category', '')
            for p in self.products:
                if (p.get('category', '') == product_category and 
                    str(p.get('_id')) != product_id and
                    str(p.get('_id')) not in [r['product_id'] for r in related]):
                    related.append({
                        'product_id': str(p.get('_id', p.get('id', ''))),
                        'name': p.get('name'),
                        'category': p.get('category'),
                        'price': p.get('price'),
                        'type': 'same_category'
                    })
                    if len(related) >= limit:
                        break
        
        return related[:limit]
    
    def get_time_based_recommendations(self, limit: int = 10) -> List[Dict]:
        """
        Get recommendations based on current time of day
        """
        recommended_categories = []
        
        if EXTERNAL_DATA_AVAILABLE:
            recommended_categories = external_data.get_time_based_recommendations()
        else:
            from datetime import datetime
            hour = datetime.now().hour
            if 6 <= hour < 11:
                recommended_categories = ['dairy', 'bakery', 'breakfast']
            elif 11 <= hour < 14:
                recommended_categories = ['grains', 'vegetables']
            elif 14 <= hour < 18:
                recommended_categories = ['snacks', 'beverages']
            else:
                recommended_categories = ['meat', 'vegetables', 'grains']
        
        # Filter products by recommended categories
        recommended = []
        for category in recommended_categories:
            for p in self.products:
                if category.lower() in p.get('category', '').lower():
                    recommended.append({
                        'product_id': str(p.get('_id', p.get('id', ''))),
                        'name': p.get('name'),
                        'category': p.get('category'),
                        'price': p.get('price'),
                        'source': 'time_based'
                    })
                    if len(recommended) >= limit:
                        return recommended
        
        return recommended[:limit]
    
    def get_user_behavior_summary(self, user_id: str) -> Dict:
        """
        Get summary of a user's behavior for personalization
        """
        user_behaviors = [b for b in self.behaviors if str(b.get('userId')) == str(user_id)]
        
        if not user_behaviors:
            return {'has_history': False, 'total_interactions': 0}
        
        # Count by action type
        action_counts = {}
        category_interests = {}
        product_ids = []
        
        for behavior in user_behaviors:
            action = behavior.get('action', 'view')
            action_counts[action] = action_counts.get(action, 0) + 1
            
            product_id = behavior.get('productId')
            if product_id:
                product_ids.append(product_id)
                product = self.get_product_by_id(product_id)
                if product:
                    cat = product.get('category', 'other')
                    category_interests[cat] = category_interests.get(cat, 0) + 1
        
        # Sort categories by interest
        top_categories = sorted(category_interests.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'has_history': True,
            'total_interactions': len(user_behaviors),
            'action_counts': action_counts,
            'top_categories': [c[0] for c in top_categories],
            'unique_products_viewed': len(set(product_ids))
        }

