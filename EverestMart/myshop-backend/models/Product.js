const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Number, default: 0 },
  
  // ✅ FIXED: Add more unit options
  unit: { 
    type: String, 
    enum: [
      'pcs',      // Pieces
      'piece',    // ✅ ADDED (alternative)
      'kg',       // Kilogram
      'g',        // Gram
      'ltr',      // Liter
      'ml',       // Milliliter
      'm',        // Meter
      'cm',       // Centimeter
      'dozen',    // Dozen
      'box',      // Box
      'packet',   // Packet
      'pair',     // ✅ ADDED
      'set'       // ✅ ADDED
    ],
    default: 'pcs',
    required: true
  },
  unitQuantity: { 
    type: Number, 
    default: 1,
    required: true
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
