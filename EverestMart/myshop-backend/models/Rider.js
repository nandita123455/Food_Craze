const mongoose = require('mongoose');

const RiderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  
  // KYC Documents
  hoto: {
    type: String, // Passport size photo
    default: null
  },
  citizenshipProof: {
    type: String,
    default: null
  },
  panCard: {
    type: String,
    default: null
  },
  policeRecord: {
    type: String,
    default: null
  },
  
  // ✅ Bike Details
  bikeDetails: {
    model: { type: String },
    registrationNumber: { type: String },
    rcDocument: { type: String }, // RC Book
    insurance: { type: String }
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  
  isAvailable: {
    type: Boolean,
    default: false
  },
  
  totalDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5
  },
  
  currentLocation: {
    lat: { type: Number, default: 19.0760 },
    lng: { type: Number, default: 72.8777 }
  },
  
  lastOnline: {
    type: Date,
    default: Date.now
  },
  
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  
  rejectionReason: {
    type: String,
    default: null
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  
  isAvailable: {
    type: Boolean,
    default: false
  },
  
  // ✅ Enhanced Stats
  totalDeliveries: {
    type: Number,
    default: 0
  },
  todayDeliveries: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // ✅ Enhanced Location
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  lastLocationUpdate: {
    type: Date,
    default: null
  },
  
  // Earnings
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  
  // ✅ Bank Details (for payments)
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  
  // ✅ Rejection reason
  rejectionReason: {
    type: String,
    default: null
  }
  
}, { timestamps: true });



module.exports = mongoose.model('Rider', RiderSchema);
