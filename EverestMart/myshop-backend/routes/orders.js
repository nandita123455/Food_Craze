const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Address = require('../models/Address');
const { auth } = require('../middleware/auth');
const AutomationService = require('../services/AutomationService');

// ✅ CREATE ORDER (with OTP generation + Address saving)
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount, deliveryCharges, paymentMethod } = req.body;

    console.log('📦 Creating order for user:', req.user._id);
    console.log('Items:', items?.length);
    console.log('Total:', totalAmount);
    console.log('Address:', shippingAddress);

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    // ✅ Handle Address Saving
    let addressData;

    if (shippingAddress._id) {
      // Address already exists in database (from web app)
      addressData = shippingAddress._id;
      console.log('✅ Using existing address:', addressData);
    } else if (shippingAddress.addressLine1 && shippingAddress.city && shippingAddress.state && shippingAddress.pincode) {
      // Full address from web app - save it
      try {
        const newAddress = await Address.create({
          user: req.user._id,
          fullName: shippingAddress.fullName || req.user.name,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          label: shippingAddress.label || 'Home',
          isDefault: false
        });

        addressData = newAddress._id;
        console.log('✅ New address created and saved:', addressData);
      } catch (addrError) {
        console.error('❌ Address creation error:', addrError);
        return res.status(400).json({
          error: 'Failed to save address',
          details: addrError.message
        });
      }
    } else {
      // Simple address from mobile app - use directly without saving
      addressData = shippingAddress;
      console.log('✅ Using simple address from mobile app:', shippingAddress);
    }

    // Validate items exist and have stock
    for (let item of items) {
      const product = await Product.findById(item.productId || item.product || item._id);
      if (!product) {
        return res.status(400).json({
          error: `Product not found: ${item.productId || item.product || item._id}`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }
    }

    // ✅ Generate 6-digit delivery OTP
    const deliveryOTP = crypto.randomInt(100000, 999999).toString();
    console.log('🔐 Generated OTP:', deliveryOTP);

    // Create order with address (either ID or object)
    const order = await Order.create({
      user: req.user._id,
      items: items.map(item => ({
        product: item.productId || item.product || item._id,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: addressData, // ✅ Can be ID or object
      totalAmount,
      deliveryCharges: deliveryCharges || 0,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      orderStatus: 'pending',
      deliveryOTP, // ✅ OTP saved to order
      otpVerified: false
    });

    // Update product stock
    for (let item of items) {
      await Product.findByIdAndUpdate(item.productId || item.product || item._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Populate order details
    await order.populate('items.product shippingAddress');

    console.log('✅ Order created:', order._id);
    console.log('✅ Address linked to order');
    console.log('🔐 Delivery OTP:', deliveryOTP);

    // Emit notification to admin/riders (without OTP)
    const io = req.app.get('io');
    if (io) {
      io.emit('new-order', {
        orderId: order._id,
        user: req.user.name,
        totalAmount: order.totalAmount,
        items: items.length,
        city: shippingAddress.city
      });

      // ✅ Send OTP to customer only
      io.emit(`order-created-${req.user._id}`, {
        orderId: order._id,
        deliveryOTP: deliveryOTP,
        message: 'Order placed successfully!'
      });

      console.log('📡 New order notification sent');
    }

    // 🤖 TRIGGER AUTOMATION WORKFLOW
    // This will automatically:
    // - Update inventory
    // - Assign nearest rider
    // - Send confirmation email
    // - Send SMS notification
    AutomationService.onOrderCreated(order._id)
      .then(() => console.log('🤖 Automation workflow triggered'))
      .catch(err => console.error('❌ Automation failed:', err));

    res.status(201).json({
      success: true,
      order: {
        ...order.toObject(),
        deliveryOTP: deliveryOTP // ✅ Include OTP for customer
      },
      message: 'Order placed successfully! Address saved for future use.'
    });
  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ GET USER ORDERS (with full details and OTP for customer)
router.get('/', auth, async (req, res) => {
  try {
    console.log('📦 Fetching orders for user:', req.user._id);

    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price images image')
      .populate('shippingAddress')
      .populate('rider', 'name phone email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} orders for user ${req.user.email}`);

    // ✅ Include OTP for customer's own orders
    res.json(orders);
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ✅ GET SINGLE ORDER (with OTP for customer)
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('📦 Fetching order:', req.params.id);

    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price images image')
      .populate('shippingAddress')
      .populate('rider', 'name phone email')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // ✅ Check if user owns this order (or is admin/rider)
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('✅ Order found:', order._id);
    console.log('🔐 Delivery OTP:', order.deliveryOTP);

    // ✅ Include OTP for customer
    res.json(order);
  } catch (error) {
    console.error('❌ Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ✅ Cancel Order (Customer)
router.put('/:orderId/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify this is the customer's order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to cancel this order' });
    }

    // ✅ Check if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed', 'preparing'];

    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        error: 'Order cannot be cancelled',
        message: `Orders that are ${order.orderStatus} cannot be cancelled. Please contact support.`
      });
    }

    // ✅ Update order status with all cancellation fields
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || 'Customer requested cancellation';
    order.cancelledBy = 'customer'; // ✅ Added this field

    await order.save();

    console.log(`✅ Order ${order._id} cancelled by user ${req.user.email}`);

    // Notify rider if assigned
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
      }
    }

    // ✅ Restore product stock
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }
    console.log('✅ Product stock restored');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        cancelledAt: order.cancelledAt
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
