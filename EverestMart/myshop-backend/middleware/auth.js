const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Rider = require('../models/Rider');

// ============================================
// MAIN AUTHENTICATION MIDDLEWARE
// ============================================
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.log('❌ No Authorization header');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please login first!' 
      });
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      console.log('❌ Empty token');
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Please login first!' 
      });
    }
    
    console.log('🔍 Token received:', token.slice(0, 30) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔓 Decoded token:', decoded);
    
    let user = null;
    
    // ✅ Check if token is for a rider
    if (decoded.role === 'rider' || decoded.email?.includes('rider')) {
      console.log('🚴 Authenticating as rider:', decoded.id);
      user = await Rider.findById(decoded.id).select('-password');
      
      if (user) {
        user.role = 'rider';
        user.isRider = true;
        user.isAdmin = false;
        console.log('✅ Rider authenticated:', user.name, '|', user.email);
      }
    } 
    
    // ✅ If not found as rider, check users collection
    if (!user) {
      console.log('👤 Authenticating as user:', decoded.id);
      user = await User.findById(decoded.id).select('-password');
      
      if (user) {
        user.role = user.isAdmin ? 'admin' : 'customer';
        user.isRider = false;
        console.log('✅ User authenticated:', user.name, '|', user.email, '| Role:', user.role);
      }
    }
    
    if (!user) {
      console.log('❌ User/Rider not found in database');
      return res.status(401).json({ 
        error: 'User not found',
        message: 'Account not found. Please login again.' 
      });
    }
    
    // Attach to request
    req.user = user;
    req.token = token;
    req.userId = user._id;
    req.isRider = user.isRider || false;
    req.isAdmin = user.isAdmin || false;
    
    console.log('✅ Auth successful:', {
      email: user.email,
      role: user.role,
      isRider: req.isRider,
      isAdmin: req.isAdmin
    });
    
    next();
    
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Please login again.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Session expired. Please login again.' 
      });
    }
    
    res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Please login first!' 
    });
  }
};

// ============================================
// ROLE-BASED MIDDLEWARE
// ============================================

// ✅ Admin-only middleware
const isAdmin = (req, res, next) => {
  if (!req.user) {
    console.log('❌ No user object in request');
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please login first!' 
    });
  }
  
  if (!req.user.isAdmin) {
    console.log('❌ Admin access denied for:', req.user.email);
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Admin privileges required' 
    });
  }
  
  console.log('👨‍💼 Admin access granted:', req.user.email);
  next();
};

// ✅ Rider-only middleware
const isRider = (req, res, next) => {
  if (!req.user) {
    console.log('❌ No user object in request');
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please login first!' 
    });
  }
  
  if (!req.isRider && req.user.role !== 'rider') {
    console.log('❌ Rider access denied for:', req.user.email);
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Rider access required' 
    });
  }
  
  console.log('🚴 Rider access granted:', req.user.email);
  next();
};

// ✅ Customer-only middleware
const isCustomer = (req, res, next) => {
  if (!req.user) {
    console.log('❌ No user object in request');
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please login first!' 
    });
  }
  
  if (req.user.isAdmin || req.isRider) {
    console.log('❌ Customer-only route blocked for:', req.user.email, '| Role:', req.user.role);
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'This feature is only available for customers' 
    });
  }
  
  console.log('🛒 Customer access granted:', req.user.email);
  next();
};

// ✅ Optional auth (doesn't fail if not authenticated)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.log('ℹ️ No auth header - proceeding as guest');
      req.user = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user = await Rider.findById(decoded.id).select('-password');
    
    if (!user) {
      user = await User.findById(decoded.id).select('-password');
    }
    
    if (user) {
      req.user = user;
      req.isRider = user.role === 'rider';
      req.isAdmin = user.isAdmin || false;
      console.log('✅ Optional auth - user found:', user.email);
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.log('ℹ️ Optional auth failed - proceeding as guest');
    req.user = null;
    next();
  }
};

module.exports = { 
  auth, 
  isAdmin, 
  isRider, 
  isCustomer,
  optionalAuth
};
