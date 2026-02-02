const express = require('express');
const router = express.Router();
const { auth, isCustomer } = require('../middleware/auth'); // ✅ Import isCustomer
const User = require('../models/User');
const Product = require('../models/Product');

// ============================================
// GET WISHLIST (Customer Only)
// ============================================
router.get('/', auth, async (req, res) => {
  try {
    // ✅ Check if rider/admin - return empty wishlist
    if (req.isRider || req.user.isAdmin) {
      console.log('⚠️ Rider/Admin attempted to access wishlist - returning empty');
      return res.json({ success: true, wishlist: [] });
    }

    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist.product',
        select: 'name price images category stock rating'
      });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Filter out deleted products
    const wishlist = user.wishlist
      .filter(item => item.product)
      .map(item => ({
        ...item.product.toObject(),
        addedAt: item.addedAt
      }));
    
    console.log(`✅ Fetched wishlist for ${user.email}: ${wishlist.length} items`);
    
    res.json({ success: true, wishlist });
  } catch (error) {
    console.error('❌ Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// ============================================
// ADD TO WISHLIST (Customer Only)
// ============================================
router.post('/add/:productId', auth, isCustomer, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Check if already in wishlist
    const exists = user.wishlist.some(
      item => item.product.toString() === req.params.productId
    );
    
    if (exists) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }
    
    user.wishlist.push({
      product: req.params.productId,
      addedAt: new Date()
    });
    
    await user.save();
    
    console.log(`💖 ${user.email} added ${product.name} to wishlist`);
    
    res.json({ 
      success: true, 
      message: 'Added to wishlist',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('❌ Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// ============================================
// REMOVE FROM WISHLIST (Customer Only)
// ============================================
router.delete('/remove/:productId', auth, isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.wishlist = user.wishlist.filter(
      item => item.product.toString() !== req.params.productId
    );
    
    await user.save();
    
    console.log(`💔 ${user.email} removed product from wishlist`);
    
    res.json({ 
      success: true, 
      message: 'Removed from wishlist',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('❌ Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// ============================================
// MOVE WISHLIST ITEM TO CART (Customer Only)
// ============================================
router.post('/move-to-cart/:productId', auth, isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.stock === 0) {
      return res.status(400).json({ error: 'Product out of stock' });
    }
    
    // Add to cart
    const existingCartItem = user.cart.find(
      item => item.product.toString() === req.params.productId
    );
    
    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      user.cart.push({
        product: req.params.productId,
        quantity: 1
      });
    }
    
    // Remove from wishlist
    user.wishlist = user.wishlist.filter(
      item => item.product.toString() !== req.params.productId
    );
    
    await user.save();
    
    console.log(`🛒 ${user.email} moved ${product.name} from wishlist to cart`);
    
    res.json({ 
      success: true, 
      message: 'Moved to cart',
      cart: user.cart,
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('❌ Move to cart error:', error);
    res.status(500).json({ error: 'Failed to move to cart' });
  }
});

// ============================================
// CLEAR WISHLIST (Customer Only)
// ============================================
router.delete('/clear', auth, isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = [];
    await user.save();
    
    console.log(`🗑️ ${user.email} cleared wishlist`);
    
    res.json({ 
      success: true, 
      message: 'Wishlist cleared' 
    });
  } catch (error) {
    console.error('❌ Clear wishlist error:', error);
    res.status(500).json({ error: 'Failed to clear wishlist' });
  }
});

module.exports = router;
