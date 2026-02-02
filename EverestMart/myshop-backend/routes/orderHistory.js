const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

// ✅ Get user's order history (with OTP)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    console.log(`📦 Fetching orders for user: ${req.user.email}`);
    
    const query = { user: req.user._id };
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    const orders = await Order.find(query)
      .populate('items.product', 'name price images image category')
      .populate('shippingAddress') // ✅ Added shippingAddress population
      .populate('rider', 'name phone email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    console.log(`✅ Found ${orders.length} orders for ${req.user.email}`);
    
    // ✅ OTP is included automatically because customer owns these orders
    res.json({
      success: true,
      orders, // OTP included for customer
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Order history error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order history',
      message: error.message 
    });
  }
});

// ✅ Get single order details (with OTP)
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    })
      .populate('items.product')
      .populate('shippingAddress') // ✅ Added
      .populate('rider', 'name phone email');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log(`✅ Order ${order._id} details fetched`);
    console.log(`🔐 OTP: ${order.deliveryOTP}`);
    
    // ✅ OTP included for customer
    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Order details error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order details',
      message: error.message 
    });
  }
});

// ✅ Reorder (add items to cart)
router.post('/:orderId/reorder', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check available items
    const availableItems = [];
    const unavailableItems = [];
    
    for (let item of order.items) {
      if (!item.product) {
        unavailableItems.push('Product no longer available');
        continue;
      }
      
      if (item.product.stock >= item.quantity) {
        availableItems.push(item);
      } else if (item.product.stock > 0) {
        // Partial stock available
        availableItems.push({
          ...item,
          quantity: item.product.stock
        });
        unavailableItems.push(`${item.product.name} - Only ${item.product.stock} available`);
      } else {
        unavailableItems.push(`${item.product.name} - Out of stock`);
      }
    }
    
    if (availableItems.length === 0) {
      return res.status(400).json({ 
        error: 'No items available for reorder',
        unavailableItems 
      });
    }
    
    // Add to user's cart
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    availableItems.forEach(item => {
      const existingItem = user.cart.find(
        cartItem => cartItem.product.toString() === item.product._id.toString()
      );
      
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        user.cart.push({
          product: item.product._id,
          quantity: item.quantity
        });
      }
    });
    
    await user.save();
    
    console.log(`🔄 ${availableItems.length} items reordered for ${user.email}`);
    
    res.json({ 
      success: true, 
      message: 'Items added to cart',
      itemsAdded: availableItems.length,
      unavailableItems: unavailableItems.length > 0 ? unavailableItems : undefined
    });
  } catch (error) {
    console.error('❌ Reorder error:', error);
    res.status(500).json({ 
      error: 'Failed to reorder',
      message: error.message 
    });
  }
});

// ✅ Cancel order (with proper fields and stock restoration)
router.post('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if cancellation is allowed
    const cancellableStatuses = ['pending', 'confirmed', 'processing', 'preparing'];
    
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({ 
        error: 'Cannot cancel order',
        message: `Orders that are ${order.orderStatus} cannot be cancelled. Please contact support.`
      });
    }
    
    // ✅ Update order with all cancellation fields
    order.orderStatus = 'cancelled';
    order.cancellationReason = reason || 'Customer requested cancellation';
    order.cancelledAt = new Date(); // ✅ Added
    order.cancelledBy = 'customer'; // ✅ Added
    
    await order.save();
    
    // ✅ Restore product stock
    for (let item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: item.quantity }
        });
      }
    }
    
    console.log(`❌ Order ${order._id} cancelled by user ${req.user.email}`);
    console.log(`✅ Stock restored for ${order.items.length} items`);
    
    // ✅ Notify rider if assigned
    if (order.rider) {
      const io = req.app.get('io');
      if (io) {
        io.emit(`order-cancelled-${order.rider}`, {
          orderId: order._id,
          message: 'Order was cancelled by customer'
        });
        
        // Broadcast to all riders
        io.emit('order-cancelled', {
          orderId: order._id
        });
        
        console.log('📡 Cancellation notification sent to rider');
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Order cancelled successfully',
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        cancelledAt: order.cancelledAt,
        cancellationReason: order.cancellationReason
      }
    });
  } catch (error) {
    console.error('❌ Cancel order error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel order',
      message: error.message 
    });
  }
});

module.exports = router;
