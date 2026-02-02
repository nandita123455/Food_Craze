const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product'); // ✅ Add this
const Address = require('../models/Address');
const { auth } = require('../middleware/auth');

// PayU Configuration
const PAYU_MERCHANT_KEY = process.env.PAYU_TEST_KEY;
const PAYU_SALT = process.env.PAYU_TEST_SALT;
const PAYU_BASE_URL = 'https://test.payu.in/_payment';

// ✅ Generate PayU Hash for REQUEST
function generatePayUHash(data) {
  const hashString = `${PAYU_MERCHANT_KEY}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1 || ''}|${data.udf2 || ''}|${data.udf3 || ''}|${data.udf4 || ''}|${data.udf5 || ''}||||||${PAYU_SALT}`;
  
  console.log('🔐 Request Hash String:', hashString);
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');
  console.log('🔑 Generated Hash:', hash);
  
  return hash;
}

// ✅ Verify PayU Hash for RESPONSE
function verifyPayUResponseHash(data) {
  const hashString = `${PAYU_SALT}|${data.status}|||||||${data.udf5 || ''}|${data.udf4 || ''}|${data.udf3 || ''}|${data.udf2 || ''}|${data.udf1 || ''}|${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${PAYU_MERCHANT_KEY}`;
  
  console.log('🔐 Response Hash String:', hashString);
  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
  console.log('🔑 Calculated Hash:', calculatedHash);
  console.log('📨 Received Hash:', data.hash);
  
  return calculatedHash === data.hash;
}

// ===================================================
// COD PAYMENT ROUTE
// ===================================================
// ✅ COD PAYMENT ROUTE - FIXED TO HANDLE BOTH FORMATS
router.post('/cod', auth, async (req, res) => {
  try {
    console.log('💵 COD Request received');
    console.log('Body keys:', Object.keys(req.body));
    console.log('Full body:', JSON.stringify(req.body, null, 2));
    
    // ✅ Support both wrapped and unwrapped data
    const orderData = req.body.orderData || req.body;
    const { items, shippingAddress, totalAmount, deliveryCharges } = orderData;
    
    console.log('User:', req.user._id);
    console.log('Items:', items?.length);
    console.log('Address:', shippingAddress);
    
    // Validate items
    if (!items || items.length === 0) {
      console.error('❌ No items in order');
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Validate address
    if (!shippingAddress) {
      console.error('❌ No shipping address');
      return res.status(400).json({ error: 'Shipping address is required' });
    }
    
    // Validate amount
    if (!totalAmount || totalAmount <= 0) {
      console.error('❌ Invalid amount:', totalAmount);
      return res.status(400).json({ error: 'Invalid order amount' });
    }
    
    // ✅ Save or Get Address ID
    let addressId;
    
    if (shippingAddress._id) {
      addressId = shippingAddress._id;
      console.log('✅ Using existing address:', addressId);
    } else {
      try {
        const newAddress = await Address.create({
          user: req.user._id,
          fullName: shippingAddress.name || shippingAddress.fullName || req.user.name,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.street || shippingAddress.addressLine1,
          addressLine2: shippingAddress.landmark || shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.zipCode || shippingAddress.pincode,
          label: shippingAddress.label || 'Home',
          isDefault: false,
          location: shippingAddress.location
        });
        
        addressId = newAddress._id;
        console.log('✅ New address created:', addressId);
      } catch (addrError) {
        console.error('❌ Address creation error:', addrError);
        return res.status(400).json({ 
          error: 'Failed to save address',
          details: addrError.message 
        });
      }
    }
    
    // Validate items and stock
    for (let item of items) {
      const product = await Product.findById(item.product || item._id);
      if (!product) {
        return res.status(400).json({ 
          error: `Product not found: ${item.name || 'Unknown'}` 
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
    }
    
    // Generate OTP
    const deliveryOTP = crypto.randomInt(100000, 999999).toString();
    console.log('🔐 Generated OTP:', deliveryOTP);
    
    // ✅ Create order with address ID
    const order = await Order.create({
      user: req.user._id,
      items: items.map(item => ({
        product: item.product || item._id,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: addressId, // ✅ Use address ID, not object
      totalAmount,
      deliveryCharges: deliveryCharges || 0,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'pending',
      deliveryOTP,
      otpVerified: false
    });
    
    // Update product stock
    for (let item of items) {
      await Product.findByIdAndUpdate(item.product || item._id, {
        $inc: { stock: -item.quantity }
      });
    }
    
    // Populate order details
    await order.populate('items.product shippingAddress');
    
    console.log('✅ COD Order created:', order._id);
    console.log('🔐 Delivery OTP:', deliveryOTP);
    
    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.emit('new-order', {
        orderId: order._id,
        user: req.user.name,
        totalAmount: order.totalAmount,
        paymentMethod: 'COD'
      });
    }
    
    res.json({
      success: true,
      order,
      orderId: order._id,
      message: 'Order placed successfully! Pay cash on delivery.'
    });
    
  } catch (error) {
    console.error('❌ COD payment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to process COD order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// ===================================================
// ONLINE PAYMENT - CREATE ORDER
// ===================================================
router.post('/create-order', auth, async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount, deliveryCharges } = req.body;
    
    console.log('💳 Processing Online Payment order');
    
    // Validate
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }
    
    // ✅ Save or Get Address ID
    let addressId;
    
    if (shippingAddress._id) {
      addressId = shippingAddress._id;
      console.log('✅ Using existing address:', addressId);
    } else {
      try {
        const newAddress = await Address.create({
          user: req.user._id,
          fullName: shippingAddress.name || shippingAddress.fullName || req.user.name,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.street || shippingAddress.addressLine1,
          addressLine2: shippingAddress.landmark || shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.zipCode || shippingAddress.pincode,
          label: shippingAddress.label || 'Home',
          isDefault: false,
          location: shippingAddress.location
        });
        
        addressId = newAddress._id;
        console.log('✅ New address created:', addressId);
      } catch (addrError) {
        console.error('❌ Address creation error:', addrError);
        return res.status(400).json({ 
          error: 'Failed to save address',
          details: addrError.message 
        });
      }
    }
    
    // Validate items and stock
    for (let item of items) {
      const product = await Product.findById(item.product || item._id);
      if (!product) {
        return res.status(400).json({ error: `Product not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}` 
        });
      }
    }
    
    // Generate OTP
    const deliveryOTP = crypto.randomInt(100000, 999999).toString();
    
    // ✅ Create order with address ID
    const order = await Order.create({
      user: req.user._id,
      items: items.map(item => ({
        product: item.product || item._id,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: addressId, // ✅ Use address ID
      totalAmount,
      deliveryCharges: deliveryCharges || 0,
      paymentMethod: 'Online',
      paymentStatus: 'Pending',
      orderStatus: 'pending',
      deliveryOTP,
      otpVerified: false
    });
    
    console.log('✅ Order created (pending payment):', order._id);
    
    // Here you would integrate with payment gateway (PayU, Razorpay, etc.)
    // For now, return order details
    
    res.json({
      success: true,
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        deliveryOTP // Include OTP for testing
      },
      message: 'Order created. Proceed to payment.'
    });
    
  } catch (error) {
    console.error('❌ Online payment error:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===================================================
// PAYU - INITIATE PAYMENT
// ===================================================
// ✅ PAYU - INITIATE PAYMENT - FIXED
router.post('/payu/initiate', auth, async (req, res) => {
  try {
    console.log('💳 PayU initiation request');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const orderData = req.body.orderData || req.body;
    const { items, shippingAddress, totalAmount, deliveryCharges } = orderData;
    
    // Validate
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address required' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!req.user.email) {
      return res.status(400).json({ error: 'User email required for payment' });
    }
    
    // ✅ Save address
    let addressId;
    if (shippingAddress._id) {
      addressId = shippingAddress._id;
    } else {
      const newAddress = await Address.create({
        user: req.user._id,
        fullName: shippingAddress.name || shippingAddress.fullName || req.user.name,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.street || shippingAddress.addressLine1,
        addressLine2: shippingAddress.landmark || shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.zipCode || shippingAddress.pincode,
        label: 'Home',
        isDefault: false
      });
      addressId = newAddress._id;
    }
    
    // Generate OTP
    const deliveryOTP = crypto.randomInt(100000, 999999).toString();
    
    // ✅ Create order
    const order = await Order.create({
      user: req.user._id,
      items: items.map(item => ({
        product: item.product || item._id,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: addressId, // ✅ Use address ID
      totalAmount,
      deliveryCharges: deliveryCharges || 0,
      paymentMethod: 'Online',
      paymentStatus: 'Pending',
      orderStatus: 'pending',
      deliveryOTP,
      otpVerified: false
    });
    
    console.log('✅ Order created:', order._id);
    
    // Generate transaction ID
    const txnid = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // PayU data
    const payuData = {
      key: PAYU_MERCHANT_KEY,
      txnid: txnid,
      amount: totalAmount.toFixed(2),
      productinfo: `EverestMart Order #${order._id}`,
      firstname: shippingAddress.name || shippingAddress.fullName || 'Customer',
      email: req.user.email,
      phone: shippingAddress.phone,
      surl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
      furl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure`,
      udf1: order._id.toString(),
      udf2: req.user._id.toString(),
      udf3: '',
      udf4: '',
      udf5: ''
    };
    
    // Generate hash
    payuData.hash = generatePayUHash(payuData);
    
    // Save payment details
    order.paymentDetails = {
      transactionId: txnid,
      method: 'PayU',
      status: 'pending'
    };
    await order.save({ validateModifiedOnly: true });
    
    console.log('💳 Payment initiated for order:', order._id);
    
    res.json({
      success: true,
      payuUrl: PAYU_BASE_URL,
      payuData,
      orderId: order._id
    });
    
  } catch (error) {
    console.error('❌ PayU initiation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Payment initiation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// ===================================================
// PAYU - SUCCESS CALLBACK
// ===================================================
router.post('/payu/success', async (req, res) => {
  try {
    console.log('✅ Payment success callback received:', req.body);
    
    const { txnid, status, hash, udf1, amount } = req.body;
    
    if (!verifyPayUResponseHash(req.body)) {
      console.error('❌ SECURITY ALERT: Invalid hash in payment response!');
      
      const order = await Order.findById(udf1);
      if (order) {
        order.orderStatus = 'cancelled';
        order.paymentStatus = 'failed';
        order.paymentDetails = {
          ...order.paymentDetails,
          status: 'failed',
          note: 'Hash verification failed',
          payuResponse: req.body
        };
        await order.save({ validateModifiedOnly: true });
      }
      
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment hash' 
      });
    }
    
    const order = await Order.findById(udf1);
    if (!order) {
      console.error('❌ Order not found:', udf1);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.paymentStatus === 'paid') {
      console.log('⚠️ Order already paid:', udf1);
      return res.json({ success: true, message: 'Payment already processed' });
    }
    
    const orderAmount = parseFloat(order.totalAmount).toFixed(2);
    const paidAmount = parseFloat(amount).toFixed(2);
    
    if (orderAmount !== paidAmount) {
      console.error('❌ Amount mismatch!');
      
      order.orderStatus = 'cancelled';
      order.paymentStatus = 'failed';
      order.paymentDetails = {
        ...order.paymentDetails,
        status: 'failed',
        note: 'Amount mismatch',
        payuResponse: req.body
      };
      await order.save({ validateModifiedOnly: true });
      
      return res.status(400).json({ error: 'Amount mismatch' });
    }
    
    order.orderStatus = 'confirmed';
    order.paymentStatus = 'paid';
    order.paymentDetails = {
      transactionId: txnid,
      method: 'PayU',
      status: 'completed',
      paidAt: new Date(),
      payuResponse: req.body
    };
    await order.save({ validateModifiedOnly: true });
    
    console.log('✅ Payment verified:', order._id);
    
    res.json({ success: true, message: 'Payment successful' });
    
  } catch (error) {
    console.error('❌ Payment success callback error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// ===================================================
// PAYU - FAILURE CALLBACK
// ===================================================
router.post('/payu/failure', async (req, res) => {
  try {
    console.log('❌ Payment failure callback:', req.body);
    
    const { txnid, udf1, error_Message } = req.body;
    
    const order = await Order.findById(udf1);
    if (order) {
      order.orderStatus = 'cancelled';
      order.paymentStatus = 'failed';
      order.paymentDetails = {
        transactionId: txnid,
        method: 'PayU',
        status: 'failed',
        failureReason: error_Message || 'Payment failed',
        payuResponse: req.body
      };
      await order.save({ validateModifiedOnly: true });
      
      console.log('❌ Order cancelled:', order._id);
    }
    
    res.json({ success: false, message: 'Payment failed' });
    
  } catch (error) {
    console.error('❌ Payment failure callback error:', error);
    res.status(500).json({ error: 'Payment failure processing error' });
  }
});

module.exports = router;
