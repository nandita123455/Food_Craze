const jwt = require('jsonwebtoken');
const Rider = require('../models/Rider');

const riderAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // ✅ MUST use process.env.JWT_SECRET (same as signup/login)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const rider = await Rider.findById(decoded.id).select('-password');
    
    if (!rider) {
      return res.status(401).json({ error: 'Rider not found' });
    }
    
    // Check if rider is approved
    if (rider.status !== 'approved') {
      return res.status(403).json({ 
        error: `Your account is ${rider.status}. Please contact admin.`,
        status: rider.status
      });
    }
    
    req.rider = rider;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('❌ Rider auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Please login again.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = riderAuth;
