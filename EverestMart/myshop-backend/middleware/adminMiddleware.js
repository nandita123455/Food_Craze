const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
      if (!req.user) {
        console.log('❌ No req.user found');
        return res.status(401).json({ 
          success: false, 
          message: 'Not authenticated' 
        });
      }
  
      console.log(`🔍 Admin check: ${req.user.email}, isAdmin: ${req.user.isAdmin}, Type: ${typeof req.user.isAdmin}`);
  
      // ✅ Handle undefined/null cases
      const isAdmin = req.user.isAdmin === true || req.user.isAdmin === 'true';
      
      if (!isAdmin) {
        console.log(`❌ Access denied for ${req.user.email} (isAdmin: ${req.user.isAdmin})`);
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied! Admin privileges required.' 
        });
      }
  
      console.log(`✅ Admin access granted for: ${req.user.name}`);
      next();
  
    } catch (error) {
      console.error('❌ Admin middleware error:', error);
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
  };
  