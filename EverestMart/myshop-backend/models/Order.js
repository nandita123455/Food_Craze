const mongoose = require('mongoose');
const crypto = require('crypto');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or object
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryCharges: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'paid', 'failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider'
  },

  // ✅ OTP FIELDS - Generate on-demand when rider attempts delivery
  deliveryOTP: {
    type: String,
    required: false,
    select: true,
    default: null // ✅ Don't auto-generate, generate on delivery attempt
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  otpVerifiedAt: {
    type: Date,
    default: null
  },
  otpGeneratedAt: {
    type: Date,
    default: null
  },

  // ✅ CANCELLATION FIELDS
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'admin', 'system'],
    default: null
  },

  paymentDetails: {
    transactionId: String,
    method: String,
    status: String,
    paidAt: Date,
    payuResponse: Object
  },

  tracking: {
    acceptedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    riderLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date
    }
  }
}, {
  timestamps: true
});

// ✅ Indexes for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ rider: 1, orderStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ deliveryOTP: 1 });

module.exports = mongoose.model('Order', orderSchema);
