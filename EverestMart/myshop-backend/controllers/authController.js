const User = require('../models/User');
const jwt = require('jsonwebtoken');
const initializeFirebaseAdmin = require('../config/firebase-admin');
const admin = initializeFirebaseAdmin();


// Phone login with Firebase
exports.phoneLogin = async (req, res) => {
  try {
    const { phone, firebaseToken } = req.body;

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    
    if (decodedToken.phone_number !== phone) {
      return res.status(400).json({ message: 'Phone number mismatch' });
    }

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        name: `User${phone.slice(-4)}`,
        email: `${phone.replace('+', '')}@everestmart.com`
      });
      console.log(`✅ New user registered via phone: ${phone}`);
    } else {
      console.log(`✅ Existing user logged in: ${phone}`);
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        savedAddress: user.savedAddress || {}
      }
    });
  } catch (error) {
    console.error('❌ Phone login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password (use ONLY matchPassword OR comparePassword, not both)
    const isPasswordValid = await user.matchPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );

    console.log('✅ Login successful for:', user.email);

    // Send response (ONLY ONE res.json!)
    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        savedAddress: user.savedAddress
      },
      token
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile and address
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      // Update saved address
      if (req.body.savedAddress) {
        user.savedAddress = {
          street: req.body.savedAddress.street || user.savedAddress.street,
          city: req.body.savedAddress.city || user.savedAddress.city,
          state: req.body.savedAddress.state || user.savedAddress.state,
          zipCode: req.body.savedAddress.zipCode || user.savedAddress.zipCode,
          phone: req.body.savedAddress.phone || user.savedAddress.phone
        };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        savedAddress: updatedUser.savedAddress
      });
      
      console.log('✅ Profile updated for:', updatedUser.email);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
