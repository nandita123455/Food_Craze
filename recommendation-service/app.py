from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
from dotenv import load_dotenv
import logging

# Import recommendation models
from models.collaborative_filter import CollaborativeFilter
from models.content_based import ContentBasedFilter
from utils.data_loader import DataLoader

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EverestMart Recommendation API",
    description="ML-powered product recommendation service",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models and data loader
data_loader = DataLoader()
collaborative_model = None
content_based_model = None

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    global collaborative_model, content_based_model
    
    logger.info("🚀 Starting Recommendation Service...")
    
    try:
        # Load data
        logger.info("📊 Loading data...")
        await data_loader.load_data()
        
        # Initialize models
        logger.info("🤖 Initializing models...")
        collaborative_model = CollaborativeFilter()
        content_based_model = ContentBasedFilter()
        
        # Try to load pre-trained models
        try:
            collaborative_model.load_model('models/saved/collaborative_model.pkl')
            content_based_model.load_model('models/saved/content_based_model.pkl')
            logger.info("✅ Loaded pre-trained models")
        except FileNotFoundError:
            logger.warning("⚠️  No pre-trained models found. Train models first.")
            # Train with initial data
            if data_loader.has_data():
                logger.info("🔧 Training initial models...")
                collaborative_model.train(data_loader.get_interaction_data())
                content_based_model.train(data_loader.get_product_data())
                logger.info("✅ Initial training complete")
        
        logger.info("✅ Recommendation Service Ready!")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}")
        # Don't fail on startup, allow service to run

# ============================================
# REQUEST/RESPONSE MODELS
# ============================================

class RecommendationRequest(BaseModel):
    user_id: Optional[str] = None
    product_id: Optional[str] = None
    limit: int = 10
    include_metadata: bool = False

class RecommendationResponse(BaseModel):
    recommendations: List[Dict]
    algorithm: str
    count: int

# ============================================
# HEALTH CHECK
# ============================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "recommendation-api",
        "models_loaded": {
            "collaborative": collaborative_model is not None,
            "content_based": content_based_model is not None
        },
        "data_loaded": data_loader.has_data()
    }

# ============================================
# RECOMMENDATION ENDPOINTS
# ============================================

@app.get("/recommend/user/{user_id}")
async def get_user_recommendations(
    user_id: str, 
    limit: int = 10
):
    """
    Get personalized recommendations for a user
    Uses collaborative filtering based on user behavior
    """
    try:
        if not collaborative_model:
            raise HTTPException(status_code=503, detail="Collaborative model not loaded")
        
        # Get recommendations from collaborative filtering
        recommendations = collaborative_model.recommend(user_id, limit)
        
        # If not enough recommendations, supplement with trending products
        if len(recommendations) < limit:
            trending = await get_trending_products(limit - len(recommendations))
            recommendations.extend(trending['recommendations'])
        
        return {
            "success": True,
            "user_id": user_id,
            "recommendations": recommendations[:limit],
            "algorithm": "collaborative_filtering",
            "count": len(recommendations)
        }
    
    except Exception as e:
        logger.error(f"Error getting user recommendations: {str(e)}")
        # Fallback to trending products
        trending = await get_trending_products(limit)
        return {
            "success": True,
            "user_id": user_id,
            "recommendations": trending['recommendations'],
            "algorithm": "trending_fallback",
            "count": len(trending['recommendations'])
        }

@app.get("/recommend/similar/{product_id}")
async def get_similar_products(
    product_id: str, 
    limit: int = 10
):
    """
    Get similar products based on content similarity
    Uses content-based filtering on product attributes
    """
    try:
        if not content_based_model:
            raise HTTPException(status_code=503, detail="Content-based model not loaded")
        
        recommendations = content_based_model.find_similar(product_id, limit)
        
        return {
            "success": True,
            "product_id": product_id,
            "recommendations": recommendations,
            "algorithm": "content_based_filtering",
            "count": len(recommendations)
        }
    
    except Exception as e:
        logger.error(f"Error getting similar products: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@app.get("/recommend/trending")
async def get_trending_products(limit: int = 10):
    """
    Get trending products based on recent interactions
    """
    try:
        # Get trending from data loader (based on recent behaviors)
        trending = data_loader.get_trending_products(limit)
        
        return {
            "success": True,
            "recommendations": trending,
            "algorithm": "trending",
            "count": len(trending) 
        }
    
    except Exception as e:
        logger.error(f"Error getting trending products: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get trending products: {str(e)}")

@app.post("/recommend/hybrid")
async def get_hybrid_recommendations(request: RecommendationRequest):
    """
    Get hybrid recommendations combining multiple algorithms
    """
    try:
        user_recommendations = []
        similar_recommendations = []
        
        # Get user-based recommendations if user_id provided
        if request.user_id and collaborative_model:
            user_recs = collaborative_model.recommend(request.user_id, request.limit // 2)
            user_recommendations.extend(user_recs)
        
        # Get content-based recommendations if product_id provided
        if request.product_id and content_based_model:
            similar_recs = content_based_model.find_similar(request.product_id, request.limit // 2)
            similar_recommendations.extend(similar_recs)
        
        # Combine and deduplicate
        all_recommendations = user_recommendations + similar_recommendations
        seen = set()
        unique_recommendations = []
        
        for rec in all_recommendations:
            product_id = rec.get('product_id') or rec.get('_id')
            if product_id not in seen:
                seen.add(product_id)
                unique_recommendations.append(rec)
        
        # Fill remaining with trending if needed
        if len(unique_recommendations) < request.limit:
            trending = data_loader.get_trending_products(request.limit - len(unique_recommendations))
            for trend in trending:
                product_id = trend.get('product_id') or trend.get('_id')
                if product_id not in seen:
                    unique_recommendations.append(trend)
        
        return {
            "success": True,
            "recommendations": unique_recommendations[:request.limit],
            "algorithm": "hybrid",
            "count": len(unique_recommendations)
        }
    
    except Exception as e:
        logger.error(f"Error getting hybrid recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

# ============================================
# COLD START & SPECIALIZED RECOMMENDATIONS
# ============================================

@app.get("/recommend/cold-start")
async def get_cold_start_recommendations(category: str = None, limit: int = 10):
    """
    Get recommendations for new users with no history
    Uses external data patterns for cold-start problem
    """
    try:
        recommendations = data_loader.get_cold_start_recommendations(category, limit)
        
        return {
            "success": True,
            "recommendations": recommendations,
            "algorithm": "cold_start_patterns",
            "count": len(recommendations)
        }
    
    except Exception as e:
        logger.error(f"Error getting cold-start recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@app.get("/recommend/frequently-bought/{product_id}")
async def get_frequently_bought_together(product_id: str, limit: int = 5):
    """
    Get products frequently bought together with a given product
    Based on market basket analysis patterns
    """
    try:
        recommendations = data_loader.get_frequently_bought_together(product_id, limit)
        
        return {
            "success": True,
            "product_id": product_id,
            "recommendations": recommendations,
            "algorithm": "market_basket_analysis",
            "count": len(recommendations)
        }
    
    except Exception as e:
        logger.error(f"Error getting frequently bought together: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@app.get("/recommend/time-based")
async def get_time_based_recommendations(limit: int = 10):
    """
    Get recommendations based on current time of day
    """
    try:
        recommendations = data_loader.get_time_based_recommendations(limit)
        
        return {
            "success": True,
            "recommendations": recommendations,
            "algorithm": "time_based",
            "count": len(recommendations)
        }
    
    except Exception as e:
        logger.error(f"Error getting time-based recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

# ============================================
# REAL-TIME BEHAVIOR TRACKING
# ============================================

class BehaviorEvent(BaseModel):
    user_id: Optional[str] = None
    session_id: str
    product_id: str
    action: str  # view, click, add_to_cart, purchase, wishlist
    metadata: Optional[Dict] = None

@app.post("/behavior/track")
async def track_behavior(event: BehaviorEvent):
    """
    Track user behavior in real-time for recommendation updates
    """
    try:
        # Add to data loader's behavior list
        behavior_data = {
            'userId': event.user_id,
            'sessionId': event.session_id,
            'productId': event.product_id,
            'action': event.action,
            'metadata': event.metadata or {}
        }
        
        data_loader.add_behavior(behavior_data)
        
        logger.debug(f"Tracked behavior: {event.action} for product {event.product_id}")
        
        return {
            "success": True,
            "message": "Behavior tracked successfully"
        }
    
    except Exception as e:
        logger.error(f"Error tracking behavior: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/user/{user_id}/profile")
async def get_user_profile(user_id: str):
    """
    Get user behavior summary for personalization
    """
    try:
        profile = data_loader.get_user_behavior_summary(user_id)
        
        return {
            "success": True,
            "user_id": user_id,
            "profile": profile
        }
    
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get user profile: {str(e)}")

# ============================================
# MODEL MANAGEMENT
# ============================================

@app.post("/model/retrain")
async def retrain_models():
    """
    Retrain recommendation models with latest data
    """
    try:
        logger.info("🔄 Retraining models...")
        
        # Reload data from database
        await data_loader.load_data()
        
        # Retrain collaborative filter
        if collaborative_model:
            collaborative_model.train(data_loader.get_interaction_data())
            collaborative_model.save_model('models/saved/collaborative_model.pkl')
        
        # Retrain content-based filter  
        if content_based_model:
            content_based_model.train(data_loader.get_product_data())
            content_based_model.save_model('models/saved/content_based_model.pkl')
        
        logger.info("✅ Models retrained successfully")
        
        return {
            "success": True,
            "message": "Models retrained successfully",
            "data_stats": {
                "products": len(data_loader.products),
                "behaviors": len(data_loader.behaviors)
            }
        }
    
    except Exception as e:
        logger.error(f"Error retraining models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrain models: {str(e)}")

@app.get("/model/status")
async def get_model_status():
    """
    Get current model status and statistics
    """
    return {
        "success": True,
        "models": {
            "collaborative": {
                "loaded": collaborative_model is not None,
                "trained": collaborative_model.trained if collaborative_model else False,
                "users": len(collaborative_model.user_ids) if collaborative_model and collaborative_model.trained else 0,
                "products": len(collaborative_model.product_ids) if collaborative_model and collaborative_model.trained else 0
            },
            "content_based": {
                "loaded": content_based_model is not None,
                "trained": content_based_model.trained if content_based_model else False,
                "products": len(content_based_model.product_ids) if content_based_model and content_based_model.trained else 0
            }
        },
        "data": {
            "products_loaded": len(data_loader.products),
            "behaviors_loaded": len(data_loader.behaviors)
        }
    }

# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )

