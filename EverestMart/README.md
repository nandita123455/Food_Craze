# 🏔️ Quixo - 10-Minute Grocery Delivery Platform

A modern, full-stack e-commerce platform for ultra-fast grocery delivery built with React, Node.js, Express, and MongoDB.

## 📦 Project Structure

```
Quixo/
│
├── myshop/                  # Customer-facing frontend (React + Vite)
├── everestmart-admin/       # Admin dashboard (React)
├── myshop-backend/          # Backend API server (Node.js + Express)
│
├── DEPLOYMENT.md            # 📘 Complete deployment guide
├── ENVIRONMENT_VARIABLES.md # 📋 All environment variables documented
├── build-all.bat            # 🔨 Build script for all components
└── start-everestmart.bat    # 🚀 Start all services locally
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone & Install

```bash
 Clone repository
git clone <your-repo-url>
cd Quixo

# Install dependencies for all components
cd myshop && npm install
cd ../everestmart-admin && npm install
cd ../myshop-backend && npm install
```

### 2. Environment Setup

Create environment files from templates:

```bash
# Frontend
cp myshop/.env.example myshop/.env.local

# Admin Panel
cp everestmart-admin/.env.example everestmart-admin/.env.local

# Backend
cp myshop-backend/.env.production.example myshop-backend/.env
```

**Edit these files** with your:
- MongoDB connection string
- Firebase configuration
- Google OAuth credentials
- Payment gateway keys

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for details.

### 3. Start Development Servers

**Option A: Use the startup script (Windows)**
```bash
start-everestmart.bat
```

**Option B: Manual start**
```bash
# Terminal 1 - Backend
cd myshop-backend
npm run dev

# Terminal 2 - Frontend
cd myshop
npm run dev

# Terminal 3 - Admin Panel
cd everestmart-admin
npm start
```

### 4. Access the Applications

- **Customer Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:3001
- **Backend API**: ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
- **API Health Check**: ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health

## 📦 Production Build

```bash
# Build all components for production
build-all.bat

# Or build individually:
cd myshop && npm run build                # Outputs to myshop/dist
cd everestmart-admin && npm run build     # Outputs to everestmart-admin/build
cd myshop-backend && npm start            # Run in production mode
```

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions covering:

- ✅ Vercel / Netlify (Frontend & Admin)
- ✅ AWS / DigitalOcean / VPS (Full stack)
- ✅ Heroku / Railway / Render (Backend)
- ✅ MongoDB Atlas setup
- ✅ SSL/HTTPS configuration
- ✅ PM2 process management
- ✅ Nginx reverse proxy

## 🔑 Environment Variables

All required environment variables are documented in [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).

**Critical variables:**

| Component | Variable | Description |
|-----------|----------|-------------|
| Frontend | `VITE_API_URL` | Backend server URL |
| Frontend | `VITE_FIREBASE_API_KEY` | Firebase configuration |
| Backend | `MONGODB_URI` | MongoDB connection string |
| Backend | `JWT_SECRET` | JWT signing secret |
| Backend | `CLIENT_URL` | Frontend URL for CORS |

## 🛠️ Technology Stack

### Frontend (myshop)
- **Framework**: React 19 + Vite
- **Routing**: React Router 7
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Auth**: Firebase + Google OAuth
- **Maps**: Google Maps API

### Admin Panel (everestmart-admin)
- **Framework**: React 19 + Create React App
- **UI Components**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios

### Backend (myshop-backend)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + Passport.js + Firebase Admin
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate Limiting, Sanitization
- **File Uploads**: Multer
- **Email**: SendGrid / Nodemailer
- **SMS**: Twilio
- **Payments**: PayU Integration

## 🎯 Features

### Customer Features
- 🔐 User authentication (Email, Google OAuth)
- 🛍️ Product browsing and search
- 🛒 Shopping cart management
- ❤️ Wishlist functionality
- 📍 Multiple delivery addresses
- 💳 Multiple payment options (COD, Online Payment)
- 📦 Real-time order tracking
- 🔔 Order notifications
- 📱 Responsive design

### Admin Features
- 📊 Dashboard with analytics
- 📦 Product management (CRUD)
- 🏷️ Category management
- 📋 Order management
- 👥 User management
- 🚴 Rider management and assignment
- 📈 Sales reports
- 🔔 Real-time notifications

### Rider Features
- 📍 Location tracking
- 📦 Order assignment
- ✅ Delivery management
- 💰 Earnings tracking

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting on all endpoints
- ✅ CORS protection with domain whitelisting
- ✅ MongoDB injection protection
- ✅ XSS protection (Helmet)
- ✅ Input validation and sanitization
- ✅ Secure session management
- ✅ HTTPS enforcement (production)

## ⚡ Performance Optimizations

- ✅ Connection pooling (100 max connections)
- ✅ Response compression (70% size reduction)
- ✅ In-memory caching (60s TTL)
- ✅ Code splitting and lazy loading
- ✅ Image optimization
- ✅ Bundle size optimization
- ✅ ETags for client-side caching

## 📖 API Documentation

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/profile
```

### Products
```
GET    /api/products
GET    /api/products/:id
POST   /api/products           (Admin only)
PUT    /api/products/:id       (Admin only)
DELETE /api/products/:id       (Admin only)
```

### Orders
```
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/cancel
```

*See backend code for complete API reference*

## 🧪 Testing

```bash
# Backend tests
cd myshop-backend
npm test

# Load testing (stress test)
npm run test:load
```

## 📝 Scripts Reference

| Script | Description |
|--------|-------------|
| `start-everestmart.bat` | Start all services (dev mode) |
| `build-all.bat` | Build all components for production |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support & Troubleshooting

### Common Issues

**Backend not starting**
- Check MongoDB connection string
- Ensure port 5000 is not in use
- Verify all required environment variables are set

**Frontend can't connect to backend**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env.local`
- Clear browser cache and restart dev server

**Build errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (must be 18+)

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting help.

## 📞 Contact

For questions or issues, please open a GitHub issue.

---

**Made with ❤️ for ultra-fast grocery delivery**
