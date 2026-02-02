# EverestMart Recommendation Service

ML-powered product recommendation microservice using Python, FastAPI, and machine learning models.

## Features

- **Collaborative Filtering**: User-based recommendations using interaction data
- **Content-Based Filtering**: Product similarity using TF-IDF and cosine similarity
- **Hybrid Recommendations**: Combines multiple algorithms for better results
- **Trending Products**: Real-time popular product tracking
- **Behavior Tracking Integration**: Uses MongoDB data from Node.js backend

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/everestmart
NODE_BACKEND_URL=${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
PORT=8001
```

### 3. Start the Service

```bash
# Development mode with auto-reload
python app.py

# Or use uvicorn directly
uvicorn app:app --reload --port 8001
```

The service will be available at `http://localhost:8001`

## API Endpoints

### Health Check
```
GET /health
```

### User Recommendations
```
GET /recommend/user/{user_id}?limit=10
```
Returns personalized recommendations based on user behavior.

### Similar Products
```
GET /recommend/similar/{product_id}?limit=10
```
Returns similar products using content-based filtering.

### Trending Products
```
GET /recommend/trending?limit=10
```
Returns currently popular products.

### Hybrid Recommendations
```
POST /recommend/hybrid
Body: {
  "user_id": "123",
  "product_id": "456",
  "limit": 10
}
```

### Retrain Models
```
POST /model/retrain
```
Triggers model retraining with latest data.

## Architecture

```
recommendation-service/
├── app.py                 # FastAPI application
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── models/
│   ├── collaborative_filter.py   # User-based filtering
│   ├── content_based.py          # Product similarity
│   └── saved/                    # Trained model files
├── utils/
│   └── data_loader.py    # Data loading from MongoDB
└── data/
    └── sample_data.py    # Initial dataset
```

## How It Works

### 1. Data Collection
- User behaviors are tracked by the Node.js backend
- Stored in MongoDB (`userbehaviors` collection)
- Includes: views, clicks, add_to_cart, purchases

### 2. Training
- **Collaborative Filter**: User-item interaction matrix with cosine similarity
- **Content-Based Filter**: TF-IDF vectorization of product attributes
- Models trained on startup or via `/model/retrain` endpoint

### 3. Recommendations
- Real-time inference using trained models
- Fallback to trending products if insufficient data
- Results cached for performance

## Integration with Frontend

The React frontend uses `recommendationService.js` to fetch recommendations:

```javascript
import RecommendationService from './services/recommendationService'

// Get user recommendations
const recs = await RecommendationService.getUserRecommendations(userId, 10)

// Get similar products
const similar = await RecommendationService.getSimilarProducts(productId, 6)

// Get trending
const trending = await RecommendationService.getTrendingProducts()
```

## Model Performance

- **Cold Start**: Uses trending products for new users
- **Warm Start**: Improves with more user interaction data
- **Retraining**: Recommended daily or weekly based on traffic

## Testing

```bash
# Check service health
curl http://localhost:8001/health

# Get trending products
curl http://localhost:8001/recommend/trending

# Get user recommendations
curl http://localhost:8001/recommend/user/USER_ID
```

## Production Deployment

1. Use production WSGI server (Gunicorn):
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
   ```

2. Set up reverse proxy (Nginx)

3. Enable HTTPS

4. Schedule periodic model retraining (cron job)

## Future Enhancements

- [ ] Add Redis caching for faster responses
- [ ] Implement A/B testing framework
- [ ] Add more sophisticated models (Neural Collaborative Filtering)
- [ ] Real-time model updates
- [ ] Personalized ranking
- [ ] Diversity in recommendations

## License

MIT
