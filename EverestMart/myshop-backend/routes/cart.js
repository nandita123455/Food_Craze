const express = require('express');
const router = express.Router();
const { auth, isCustomer } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

// =====================================
// GET CART
// =====================================
router.get('/', auth, async (req, res) => {
  try {
    // ✅ Check if user is a rider
    if (req.isRider || req.user.role === 'rider') {
      console.log('⚠️ Rider attempted to access cart - returning empty cart');
      return res.json({
        success: true,
        cart: [],
        message: 'Riders do not have shopping carts'
      });
    }
    
    const user = await User.findById(req.user._id)
      .populate('cart.product', 'name price images stock');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    console.log(`✅ ${user.email} fetched cart`);
    
    res.json({
      success: true,
      cart: user.cart || []
    });
  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch cart' 
    });
  }
});

// =====================================
// ADD TO CART
// =====================================
router.post('/add', auth, async (req, res) => {
  try {
    // ✅ Block riders from adding to cart
    if (req.isRider || req.user.role === 'rider') {
      return res.status(403).json({ 
        success: false, 
        error: 'Riders cannot add items to cart' 
      });
    }
    
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
      });
    }
    
    if (quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity must be at least 1' 
      });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        error: `Only ${product.stock} items available in stock` 
      });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      const newQuantity = user.cart[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          success: false, 
          error: `Cannot add more than ${product.stock} items` 
        });
      }
      
      user.cart[existingItemIndex].quantity = newQuantity;
      console.log(`✅ ${user.email} updated ${product.name} quantity to ${newQuantity}`);
    } else {
      user.cart.push({
        product: productId,
        quantity: quantity
      });
      console.log(`✅ ${user.email} added ${product.name} to cart`);
    }
    
    await user.save();
    await user.populate('cart.product', 'name price images stock');
    
    res.json({
      success: true,
      message: 'Added to cart successfully',
      cart: user.cart
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add to cart' 
    });
  }
});

// =====================================
// CLEAR CART (Must be BEFORE /:productId)
// =====================================
router.delete('/clear', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    user.cart = [];
    await user.save();
    
    console.log(`✅ ${user.email} cleared cart`);
    
    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: []
    });
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear cart' 
    });
  }
});

// =====================================
// UPDATE CART ITEM QUANTITY
// =====================================
router.put('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    // Validate quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity must be at least 1' 
      });
    }
    
    // Get user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Find cart item
    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );
    
    if (cartItemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found in cart' 
      });
    }
    
    // Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        error: `Only ${product.stock} items available in stock` 
      });
    }
    
    // Update quantity
    user.cart[cartItemIndex].quantity = quantity;
    await user.save();
    await user.populate('cart.product', 'name price images stock');
    
    console.log(`✅ ${user.email} updated ${product.name} quantity to ${quantity}`);
    
    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart: user.cart
    });
  } catch (error) {
    console.error('❌ Update cart error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update cart' 
    });
  }
});

// =====================================
// REMOVE FROM CART
// =====================================
router.delete('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Find and remove item
    const initialLength = user.cart.length;
    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );
    
    if (user.cart.length === initialLength) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found in cart' 
      });
    }
    
    await user.save();
    await user.populate('cart.product', 'name price images stock');
    
    console.log(`✅ ${user.email} removed product ${productId} from cart`);
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: user.cart
    });
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove from cart' 
    });
  }
});

// =====================================
// GET CART COUNT (Bonus)
// =====================================
router.get('/count', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const count = user.cart.reduce((total, item) => total + item.quantity, 0);
    
    res.json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('❌ Get cart count error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get cart count' 
    });
  }
});

module.exports = router;
