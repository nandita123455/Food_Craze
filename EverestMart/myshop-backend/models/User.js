const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home'
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: String,
  landmark: String,
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: String,
  phone: String,
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  profilePicture: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  
  // ✅ Cart
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  
  // ✅ Wishlist
  wishlist: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ✅ Recently Viewed
  recentlyViewed: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ✅ Addresses
  addresses: [addressSchema],
  
  isBlocked: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Auto-limit recently viewed to 20
userSchema.pre('save', function(next) {
  if (this.recentlyViewed && this.recentlyViewed.length > 20) {
    this.recentlyViewed = this.recentlyViewed.slice(-20);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
