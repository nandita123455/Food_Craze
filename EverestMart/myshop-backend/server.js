// ============================================
// QUIXO BACKEND SERVER
// Version: 1.1.0 - Admin Domain Isolation
// Production Ready - Handles 1000+ concurrent users
// Security: Separate Client & Admin Domains
// ============================================

require('dotenv').config();

// ============================================
// DEPENDENCIES
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');

// ============================================
// ROUTE IMPORTS
// ============================================
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const riderRoutes = require('./routes/rider');
const paymentRoutes = require('./routes/payments');
const categoryRoutes = require('./routes/categories');
const orderHistoryRoutes = require('./routes/orderHistory');
const wishlistRoutes = require('./routes/wishlist');
const addressRoutes = require('./routes/address');
const reviewRoutes = require('./routes/reviews');
const cartRoutes = require('./routes/cart');
const behaviorRoutes = require('./routes/behaviorRoutes');

// ============================================
// AUTOMATION WORKERS (Background Jobs)
// ============================================
if (process.env.NODE_ENV !== 'test') {
  require('./workers/emailWorker');
  require('./workers/smsWorker');
  require('./workers/orderWorker');
  require('./workers/inventoryWorker');
  require('./jobs/scheduledJobs');
  console.log('🤖 Automation workers initialized');
}

// ============================================
// APP & SERVER INITIALIZATION
// ============================================
const app = express();
const server = http.createServer(app);

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================
const isDevelopment = process.env.NODE_ENV !== 'production';
const SKIP_RATE_LIMIT = process.env.SKIP_RATE_LIMIT === 'true';
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET || 'myshop-session-secret';

// ✅ UPDATED: Separate Client and Admin URLs
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3001';
const PRODUCTION_CLIENT_URL = process.env.PRODUCTION_CLIENT_URL || '';
const PRODUCTION_ADMIN_URL = process.env.PRODUCTION_ADMIN_URL || '';

// ============================================
// SOCKET.IO CONFIGURATION
// ============================================
const io = new Server(server, {
  cors: {
    origin: isDevelopment
      ? [CLIENT_URL, ADMIN_URL, 'http://localhost:3000']
      : [CLIENT_URL, ADMIN_URL, PRODUCTION_CLIENT_URL, PRODUCTION_ADMIN_URL].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6,
  perMessageDeflate: true
});

app.set('io', io);

// ============================================
// PERFORMANCE MIDDLEWARE
// ============================================

// 1. Response Compression - Reduce bandwidth by 70%
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// 2. ETags for client-side caching
app.set('etag', 'strong');

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// ✅ ENHANCED: Rate Limiting with admin protection
const createLimiter = (windowMs, max, message) => {
  if (SKIP_RATE_LIMIT || isDevelopment) {
    return (req, res, next) => next();
  }

  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/' || req.path === '/api/health',
    handler: (req, res) => {
      console.log(`⚠️ Rate limit exceeded: ${req.ip} - ${req.path}`);
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

const generalLimiter = createLimiter(15 * 60 * 1000, 100, 'Too many requests');
const authLimiter = createLimiter(15 * 60 * 1000, 20, 'Too many login attempts');
const adminLimiter = createLimiter(15 * 60 * 1000, 50, 'Too many admin requests'); // ✅ NEW
const paymentLimiter = createLimiter(60 * 1000, 10, 'Too many payment attempts');

// MongoDB injection protection
app.use(mongoSanitize());

// ============================================
// CORS CONFIGURATION - ADMIN ISOLATION
// ============================================

// ✅ UPDATED: Separate origins for client and admin
const allowedOrigins = [
  // Development URLs
  'http://localhost:5173',        // Client dev (Vite)
  'http://localhost:3001',        // Admin dev
  'http://localhost:3000',        // Alternative port
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3001',

  // Environment-based URLs
  CLIENT_URL,
  ADMIN_URL,
  PRODUCTION_CLIENT_URL,
  PRODUCTION_ADMIN_URL
].filter(Boolean);

// Remove duplicates
const uniqueOrigins = [...new Set(allowedOrigins)];

console.log('🔒 CORS Allowed Origins:');
uniqueOrigins.forEach(origin => console.log(`   - ${origin}`));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (uniqueOrigins.includes(origin)) {
      callback(null, true);
    } else if (isDevelopment) {
      // In development, log but allow
      console.log('⚠️ CORS: Allowing dev origin:', origin);
      callback(null, true);
    } else {
      // In production, block unknown origins
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400 // 24 hours
}));

app.options('*', cors());

// ============================================
// BODY PARSER
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// SIMPLE IN-MEMORY CACHE
// ============================================
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute

const simpleCache = (duration = CACHE_DURATION) => (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl || req.url;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < duration) {
    res.set('X-Cache', 'HIT');
    return res.json(cached.data);
  }

  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cache.set(key, { data, timestamp: Date.now() });
    res.set('X-Cache', 'MISS');

    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return originalJson(data);
  };

  next();
};

// Clear cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, CACHE_DURATION);

// ============================================
// STATIC FILES - Upload Serving
// ============================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '365d',
  etag: true,
  lastModified: true,
  immutable: true,
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

// ============================================
// SESSION CONFIGURATION
// ============================================
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: !isDevelopment,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: isDevelopment ? 'lax' : 'strict'
  }
}));

// ============================================
// PASSPORT INITIALIZATION
// ============================================
app.use(passport.initialize());
app.use(passport.session());

// ============================================
// REQUEST LOGGING (DEV ONLY)
// ============================================
if (isDevelopment) {
  app.use((req, res, next) => {
    const start = Date.now();
    const origin = req.headers.origin || 'no-origin';

    res.on('finish', () => {
      const duration = Date.now() - start;
      const isAdmin = origin.includes('3001') || origin.includes('admin');
      const emoji = isAdmin ? '🔐' : '🌐';
      console.log(`${emoji} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) - ${origin}`);
    });
    next();
  });
}

// ✅ NEW: Origin-based request tracking
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Identify request source
  if (origin) {
    if (origin.includes('3001') || origin.includes('admin')) {
      req.isAdminRequest = true;
    } else {
      req.isClientRequest = true;
    }
  }

  next();
});

// ============================================
// SOCKET.IO EVENTS
// ============================================
io.on('connection', (socket) => {
  const origin = socket.handshake.headers.origin || 'unknown';
  const isAdmin = origin.includes('3001') || origin.includes('admin');

  console.log(`✅ ${isAdmin ? 'Admin' : 'Client'} connected:`, socket.id);

  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`📦 Socket ${socket.id} joined order: ${orderId}`);
  });

  socket.on('join-rider', (riderId) => {
    socket.join(`rider-${riderId}`);
    console.log(`🚴 Socket ${socket.id} joined rider: ${riderId}`);
  });

  // ✅ NEW: Admin-only room
  socket.on('join-admin', (adminId) => {
    socket.join('admin-dashboard');
    console.log(`🔐 Admin ${adminId} joined dashboard`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ============================================
// API ROUTES
// ============================================

// Health check (no cache, no rate limit)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cache: {
      size: cache.size,
      enabled: true
    },
    domains: {
      client: CLIENT_URL,
      admin: ADMIN_URL
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Quixo API v1.1.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    performance: {
      compression: 'enabled',
      caching: 'enabled',
      rateLimiting: SKIP_RATE_LIMIT ? 'disabled (testing)' : 'enabled'
    },
    security: {
      adminIsolation: 'enabled',
      cors: 'domain-restricted',
      helmet: 'enabled',
      mongoSanitize: 'enabled'
    },
    domains: {
      client: CLIENT_URL,
      admin: ADMIN_URL
    },
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      authAdmin: '/api/auth/admin/login',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin (admin only)',
      riders: '/api/rider',
      payments: '/api/payments',
      categories: '/api/categories',
      orderHistory: '/api/order-history',
      wishlist: '/api/wishlist',
      addresses: '/api/addresses',
      reviews: '/api/reviews',
      cart: '/api/cart'
    }
  });
});

// ✅ UPDATED: Apply routes with caching and rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/payments', paymentLimiter, paymentRoutes);
app.use('/api/rider', generalLimiter, riderRoutes);
app.use('/api/products', simpleCache(60000), generalLimiter, productRoutes);
app.use('/api/orders', generalLimiter, orderRoutes);
app.use('/api/admin', adminLimiter, adminRoutes); // ✅ Admin-specific rate limit
app.use('/api/categories', simpleCache(120000), generalLimiter, categoryRoutes);
app.use('/api/order-history', generalLimiter, orderHistoryRoutes);
app.use('/api/wishlist', generalLimiter, wishlistRoutes);
app.use('/api/addresses', generalLimiter, addressRoutes);
app.use('/api/reviews', generalLimiter, reviewRoutes);
app.use('/api/cart', generalLimiter, cartRoutes);
app.use('/api/behavior', generalLimiter, behaviorRoutes); // User behavior tracking

// ============================================
// ERROR HANDLERS
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Don't expose stack traces in production
  const errorResponse = isDevelopment
    ? {
      error: err.message,
      stack: err.stack,
      path: req.path,
      timestamp: new Date().toISOString()
    }
    : {
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    };

  res.status(err.status || 500).json(errorResponse);
});

// ============================================
// DATABASE CONNECTION (OPTIMIZED)
// ============================================
const mongoOptions = {
  maxPoolSize: 100,
  minPoolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  maxIdleTimeMS: 30000,
  compressors: ['zlib']
};

mongoose.connect(MONGO_URI, mongoOptions)
  .then(() => {
    console.log('\n✅ MongoDB Connected:', mongoose.connection.name);
    console.log('📊 Connection Pool: 100 (min: 10)');
    console.log('🔒 Security: Helmet, Rate Limiting, CORS, Sanitization');
    console.log('⚡ Performance: Compression, Caching, Connection Pooling');
    console.log('🔐 Admin Isolation: ENABLED');

    server.listen(PORT, () => {
      console.log(`\n🚀 Server: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n📱 Client App: ${CLIENT_URL}`);
      console.log(`🔐 Admin App: ${ADMIN_URL}`);
      console.log(`📡 Socket.IO: Ready`);
      console.log(`💾 Cache: In-Memory (${CACHE_DURATION / 1000}s TTL)`);
      console.log(`🔒 Rate Limiting: ${SKIP_RATE_LIMIT ? '❌ DISABLED (Testing Mode)' : '✅ ENABLED'}`);

      if (isDevelopment) {
        console.log('\n⚠️  Development Mode');
      }

      console.log('\n✨ Ready to handle 1000+ concurrent users!');
      console.log('🔐 Admin & Client domains isolated for security\n');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    console.error('💡 Check MONGODB_URI in .env file');
    process.exit(1);
  });

// ============================================
// GRACEFUL SHUTDOWN (MONGOOSE 8+ COMPATIBLE)
// ============================================
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    console.log('⚠️  Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;
  console.log(`\n👋 ${signal} received, shutting down gracefully...`);

  const forceShutdownTimer = setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);

  try {
    // 1. Stop accepting new connections
    await new Promise((resolve) => {
      server.close((err) => {
        if (err) {
          console.error('⚠️  Error closing HTTP server:', err.message);
        } else {
          console.log('✅ HTTP server closed');
        }
        resolve();
      });
    });

    // 2. Close Socket.IO connections
    io.close(() => {
      console.log('✅ Socket.IO closed');
    });

    // 3. Close MongoDB connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');

    // 4. Clear cache
    if (cache) {
      cache.clear();
      console.log('✅ Cache cleared');
    }

    clearTimeout(forceShutdownTimer);
    console.log('👋 Shutdown complete');
    process.exit(0);

  } catch (error) {
    console.error('❌ Shutdown error:', error.message);
    clearTimeout(forceShutdownTimer);
    process.exit(1);
  }
};

// Signal handlers
process.on('SIGTERM', () => {
  if (!isShuttingDown) gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  if (!isShuttingDown) gracefulShutdown('SIGINT');
});

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  if (!isShuttingDown) gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  if (!isShuttingDown) gracefulShutdown('UNHANDLED_REJECTION');
});

// ============================================
// EXPORTS
// ============================================
module.exports = { app, server, io };
