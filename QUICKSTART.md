# Quick Start Guide - Recommendation System

## Start All Services

### Terminal 1: Node.js Backend
```bash
cd Everestmart/myshop-backend
npm run dev
```

### Terminal 2: Python Recommendation Service
```bash
cd recommendation-service
python app.py
```

### Terminal 3: React Frontend
```bash
cd EverestMart/myshop
npm run dev
```

## Test the System

1. Open browser: http://localhost:5173
2. Click "Shop" in navbar
3. Click any product → View tracked
4. Scroll down → See "🤖 AI Recommended Similar Products"
5. Click "Add to Cart" → Cart action tracked
6. Check browser DevTools Network tab for tracking requests

## Quick API Tests

```bash
# Backend Health
curl ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health

# Python Service Health
curl http://localhost:8001/health

# Get Trending Products
curl http://localhost:8001/recommend/trending

# Track a behavior
curl -X POST ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/behavior/track \
  -H "Content-Type: application/json" \
  -d '{"productId":"1","action":"view"}'
```

## Troubleshooting

**Python dependencies not installed?**
```bash
cd recommendation-service
python -m pip install fastapi uvicorn pandas numpy scikit-learn python-dotenv pymongo requests joblib scipy
```

**MongoDB not running?**
- Make sure MongoDB is running on localhost:27017

**CORS errors?**
- Check that all services are running on correct ports
- Frontend: 5173, Backend: 5000, Python: 8001
