
# 🏔️ EverestMart - Complete Project Documentation
**Generated on:** 1/1/2026, 3:57:40 pm
**Version:** 1.0.0
**Status:** Production Ready

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Backend Structure](#backend-structure)
4. [Frontend Structure](#frontend-structure)
5. [API Endpoints](#api-endpoints)
6. [Environment Variables](#environment-variables)
7. [Database Schema](#database-schema)
8. [Deployment Guide](#deployment-guide)
9. [Cleanup Recommendations](#cleanup-recommendations)

---

## 🎯 Project Overview

**EverestMart** is a full-stack e-commerce platform for 10-minute grocery delivery.

### Features:
- ✅ User Authentication (Email/Password + Google OAuth)
- ✅ Product Management (Admin)
- ✅ Shopping Cart & Checkout
- ✅ Real-time Order Tracking
- ✅ Rider Management System
- ✅ Payment Integration (PayU)
- ✅ Email Notifications (Welcome, Login, Orders)
- ✅ Google Maps Integration
- ✅ Admin Dashboard
- ✅ Rider Dashboard

---

## 🛠️ Technology Stack

### Backend:
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT + Passport.js (Google OAuth)
- **Email Service:** Nodemailer (Gmail SMTP)
- **Payment Gateway:** PayU
- **Security:** bcryptjs, express-validator

### Frontend:
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** Context API
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Maps:** Google Maps API

---

## 📁 Backend Structure

```
├── 📜 cleanup-windows.js (3.5 KB)
├── 📜 cleanup.js (2.3 KB)
├── 📁 config/
│   ├── 📜 firebase-admin.js (391 B)
│   ├── 📜 multer.js (1.2 KB)
│   ├── 📜 passport.js (2.0 KB)
│   └── 📋 serviceAccountKey.json (2.3 KB)
├── 📁 controllers/
│   ├── 📜 adminController.js (1.8 KB)
│   ├── 📜 authController.js (6.1 KB)
│   ├── 📜 orderController.js (1009 B)
│   ├── 📜 otpController.js (3.1 KB)
│   └── 📜 productController.js (3.5 KB)
├── 📜 generate-docs.js (13.8 KB)
├── 📁 middleware/
│   ├── 📜 adminAuth.js (1.2 KB)
│   ├── 📜 adminMiddleware.js (1.1 KB)
│   ├── 📜 auth.js (3.2 KB)
│   └── 📜 riderAuth.js (1.4 KB)
├── 📁 models/
│   ├── 📜 Address.js (879 B)
│   ├── 📜 Category.js (727 B)
│   ├── 📜 Order.js (2.1 KB)
│   ├── 📜 OTP.js (425 B)
│   ├── 📜 Product.js (1.1 KB)
│   ├── 📜 Review.js (1.1 KB)
│   ├── 📜 Rider.js (2.8 KB)
│   └── 📜 User.js (2.1 KB)
├── 📋 package.json (1.2 KB)
├── 📝 PROJECT_DOCUMENTATION.md (13.0 KB)
├── 📝 README.md (330 B)
├── 📁 routes/
│   ├── 📜 address.js (4.2 KB)
│   ├── 📜 admin.js (15.8 KB)
│   ├── 📜 auth.js (14.7 KB)
│   ├── 📜 cart.js (8.4 KB)
│   ├── 📜 categories.js (3.3 KB)
│   ├── 📜 orderHistory.js (4.3 KB)
│   ├── 📜 orders.js (7.6 KB)
│   ├── 📜 payments.js (17.5 KB)
│   ├── 📜 products.js (7.3 KB)
│   ├── 📜 reviews.js (6.4 KB)
│   ├── 📜 rider.js (24.5 KB)
│   └── 📜 wishlist.js (5.5 KB)
├── 📜 server.js (15.1 KB)
├── 📁 services/
│   └── 📜 notificationService.js (740 B)
├── 📁 uploads/
│   ├── 📁 products/
│   ├── 📁 rider-documents/
│   └── 📁 riders/
└── 📁 utils/
    └── 📜 emailService.js (13.8 KB)

```

### Backend File Statistics:
{
  ".js": 38,
  ".json": 2,
  ".md": 2
}

---

## 📁 Frontend Structure

❌ Frontend directory not found at: C:\Users\aalok.sah\Desktop\myshop-frontend


---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | User login | ❌ |
| POST | `/admin/login` | Admin login | ❌ |
| POST | `/rider/login` | Rider login | ❌ |
| GET | `/google` | Initiate Google OAuth | ❌ |
| GET | `/google/callback` | Google OAuth callback | ❌ |
| GET | `/profile` | Get user profile | ✅ |
| PUT | `/profile` | Update user profile | ✅ |
| GET | `/verify` | Verify JWT token | ✅ |

### Product Routes (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all products | ❌ |
| GET | `/:id` | Get product by ID | ❌ |
| POST | `/` | Create product | ✅ Admin |
| PUT | `/:id` | Update product | ✅ Admin |
| DELETE | `/:id` | Delete product | ✅ Admin |

### Order Routes (`/api/orders`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new order | ✅ |
| GET | `/my-orders` | Get user orders | ✅ |
| GET | `/:id` | Get order by ID | ✅ |
| PUT | `/:id/status` | Update order status | ✅ Admin |

### Rider Routes (`/api/riders`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all riders | ✅ Admin |
| POST | `/register` | Register new rider | ❌ |
| PUT | `/:id/approve` | Approve rider | ✅ Admin |
| PUT | `/:id/availability` | Update availability | ✅ Rider |

### Admin Routes (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get dashboard stats | ✅ Admin |
| GET | `/orders` | Get all orders | ✅ Admin |
| GET | `/users` | Get all users | ✅ Admin |

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Environment
NODE_ENV=production

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration
EMAIL_USER=everestmart2082@gmail.com
EMAIL_PASSWORD=your_app_password

# Payment Gateway (PayU)
PAYU_TEST_KEY=your_test_key
PAYU_TEST_SALT=your_test_salt
PAYU_PROD_KEY=your_production_key
PAYU_PROD_SALT=your_production_salt

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key

# URLs
FRONTEND_URL=https://your-frontend-url.com
BACKEND_URL=https://your-backend-url.com

# Server
PORT=5000

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-url.com/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_PAYU_MERCHANT_KEY=your_payu_key
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  phone: String,
  googleId: String,
  avatar: String,
  isAdmin: Boolean (default: false),
  isVerified: Boolean (default: false),
  savedAddress: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String (required),
  description: String,
  price: Number (required),
  originalPrice: Number,
  category: String (required),
  subcategory: String,
  image: String (required),
  stock: Number (default: 0),
  unit: String (required),
  discount: Number,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId (ref: 'User'),
  items: [{
    product: ObjectId (ref: 'Product'),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  deliveryAddress: Object,
  deliveryFee: Number,
  status: String (enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
  paymentMethod: String,
  paymentStatus: String,
  rider: ObjectId (ref: 'Rider'),
  trackingInfo: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Rider Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  phone: String (required),
  vehicleNumber: String,
  vehicleType: String,
  status: String (enum: ['pending', 'approved', 'rejected']),
  isAvailable: Boolean (default: true),
  currentLocation: Object,
  totalDeliveries: Number (default: 0),
  rating: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Deployment Guide

### Prerequisites:
- Node.js v18+ installed
- MongoDB database (MongoDB Atlas recommended)
- Domain name (optional)
- SSL certificate (Let's Encrypt recommended)

### Backend Deployment (Railway/Render/DigitalOcean):

1. **Prepare for Production:**
   ```bash
   npm run cleanup  # Remove unnecessary files
   npm audit fix    # Fix security vulnerabilities
   ```

2. **Update Environment Variables:**
   - Set `NODE_ENV=production`
   - Update `FRONTEND_URL` to production domain
   - Update `BACKEND_URL` to production domain
   - Update Google OAuth callback URL

3. **Deploy to Platform:**
   ```bash
   # For Railway
   railway up
   
   # For Render
   # Connect GitHub repo and deploy
   
   # For DigitalOcean
   # Use App Platform or deploy to Droplet
   ```

### Frontend Deployment (Vercel/Netlify):

1. **Build for Production:**
   ```bash
   cd myshop-frontend
   npm run build
   ```

2. **Deploy:**
   ```bash
   # For Vercel
   vercel --prod
   
   # For Netlify
   netlify deploy --prod
   ```

3. **Configure Environment Variables** in platform dashboard

---

## 🧹 Cleanup Recommendations

### Files to Remove Before Production:

#### Backend:
- ❌ `testEmail.js` (testing file)
- ❌ `debugEmail.js` (debugging file)
- ❌ `verifyEnv.js` (development tool)
- ❌ Any `.log` files
- ❌ `.env.example` files with real credentials

#### Frontend:
- ❌ `src/test/` (if exists)
- ❌ Unused components
- ❌ Console.log statements
- ❌ Development comments

### Code Cleanup Commands:

```bash
# Remove test files
rm -f testEmail.js debugEmail.js verifyEnv.js

# Remove logs
rm -f *.log

# Remove build artifacts
rm -rf dist/ build/

# Clean node_modules and reinstall
rm -rf node_modules
npm install --production
```

---

## 📝 Development Guidelines

### Git Workflow:
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "feat: description"`
3. Push to remote: `git push origin feature/feature-name`
4. Create Pull Request
5. After review, merge to main

### Commit Message Format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## 🔒 Security Best Practices

1. ✅ Never commit `.env` files to Git
2. ✅ Use environment variables for all secrets
3. ✅ Enable CORS only for trusted domains
4. ✅ Use HTTPS in production
5. ✅ Implement rate limiting
6. ✅ Sanitize user inputs
7. ✅ Keep dependencies updated
8. ✅ Use helmet.js for HTTP headers
9. ✅ Implement CSRF protection
10. ✅ Regular security audits

---

## 📞 Support & Contact

- **Developer:** Your Team
- **Email:** support@everestmart.com
- **Documentation:** [Link to docs]
- **API Docs:** [Link to API documentation]

---

**Generated by:** EverestMart Documentation Generator
**Last Updated:** 1/1/2026, 3:57:40 pm
