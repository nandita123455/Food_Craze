const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Rider = require('../models/Rider');

// ==================== DASHBOARD STATS ====================

router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Parallel queries for better performance
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      totalRiders,
      pendingRiders,
      onlineRiders,
      todayOrders,
      weekOrders,
      monthOrders,
      revenueData,
      todayRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Rider.countDocuments({ status: 'approved' }),
      Rider.countDocuments({ status: 'pending' }),
      Rider.countDocuments({ status: 'approved', isAvailable: true }),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRiders,
      pendingRiders,
      onlineRiders,
      todayOrders,
      weekOrders,
      monthOrders,
      totalRevenue: revenueData[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ==================== ORDERS ====================

// Get all orders
// ✅ Get all orders - Return simple array for compatibility
router.get('/orders', auth, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const query = status && status !== 'all' ? { orderStatus: status } : {};
    
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('rider', 'name phone isAvailable')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .limit(limit * 1);
    
    console.log(`📦 Admin fetched ${orders.length} orders`);
    
    // ✅ Return simple array (not object)
    res.json(orders);
  } catch (error) {
    console.error('❌ Admin orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});


// Get single order details
router.get('/orders/:id', auth, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('rider', 'name phone email')
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('❌ Order fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
router.put('/orders/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    const validStatuses = [
      'pending', 'confirmed', 'processing', 'preparing',
      'shipped', 'out_for_delivery', 'delivered', 'cancelled'
    ];
    
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        orderStatus,
        ...(orderStatus === 'delivered' && { 
          'tracking.deliveredAt': new Date(),
          paymentStatus: 'paid'
        }),
        ...(orderStatus === 'cancelled' && { 
          'tracking.cancelledAt': new Date() 
        })
      },
      { new: true }
    ).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.emit(`order-update-${order._id}`, {
        status: orderStatus,
        message: `Your order status has been updated to ${orderStatus}`
      });
    }
    
    console.log(`✅ Order ${order._id.toString().slice(-8)} → ${orderStatus}`);
    res.json(order);
  } catch (error) {
    console.error('❌ Order update error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete order
router.delete('/orders/:id', auth, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log(`🗑️ Order ${order._id.toString().slice(-8)} deleted`);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('❌ Order delete error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// ==================== RIDERS ====================

// Get all approved riders
router.get('/riders', auth, isAdmin, async (req, res) => {
  try {
    const riders = await Rider.find({ status: 'approved' })
      .select('-password')
      .sort({ totalDeliveries: -1 });
    
    console.log(`🏍️ Found ${riders.length} approved riders`);
    res.json(riders);
  } catch (error) {
    console.error('❌ Riders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch riders' });
  }
});

// Get pending riders
router.get('/riders/pending', auth, isAdmin, async (req, res) => {
  try {
    const riders = await Rider.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log(`🏍️ Found ${riders.length} pending riders`);
    res.json(riders);
  } catch (error) {
    console.error('❌ Pending riders error:', error);
    res.status(500).json({ error: 'Failed to fetch pending riders' });
  }
});

// Get live/online riders with locations
router.get('/riders/live', auth, isAdmin, async (req, res) => {
  try {
    const riders = await Rider.find({
      status: 'approved',
      isAvailable: true,
      'currentLocation.lat': { $exists: true }
    }).select('-password');
    
    console.log(`🗺️ Found ${riders.length} live riders`);
    res.json(riders);
  } catch (error) {
    console.error('❌ Live riders error:', error);
    res.status(500).json({ error: 'Failed to fetch live riders' });
  }
});

// Get single rider details
router.get('/riders/:id', auth, isAdmin, async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id).select('-password');
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    // Get rider's delivery history
    const deliveries = await Order.find({ 
      rider: rider._id,
      orderStatus: 'delivered'
    }).sort({ 'tracking.deliveredAt': -1 }).limit(10);
    
    res.json({ rider, deliveries });
  } catch (error) {
    console.error('❌ Rider fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch rider' });
  }
});

// Update rider status (approve/reject/suspend)
router.put('/riders/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    if ((status === 'rejected' || status === 'suspended') && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const updateData = { status };
    
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    // If suspending, set isAvailable to false
    if (status === 'suspended') {
      updateData.isAvailable = false;
    }
    
    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    console.log(`✅ Rider ${rider.name} → ${status}`);
    
    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('rider-status-update', {
        riderId: rider._id,
        status,
        message: status === 'approved' 
          ? 'Congratulations! Your account has been approved.' 
          : `Your account has been ${status}. ${rejectionReason || ''}`
      });
    }
    
    res.json(rider);
  } catch (error) {
    console.error('❌ Rider status update error:', error);
    res.status(500).json({ error: 'Failed to update rider status' });
  }
});

// Delete rider
router.delete('/riders/:id', auth, isAdmin, async (req, res) => {
  try {
    const rider = await Rider.findByIdAndDelete(req.params.id);
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    // Check if rider has active deliveries
    const activeDeliveries = await Order.countDocuments({
      rider: rider._id,
      orderStatus: { $in: ['preparing', 'shipped', 'out_for_delivery'] }
    });
    
    if (activeDeliveries > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete rider with active deliveries' 
      });
    }
    
    console.log(`🗑️ Rider ${rider.name} deleted`);
    res.json({ message: 'Rider deleted successfully' });
  } catch (error) {
    console.error('❌ Rider delete error:', error);
    res.status(500).json({ error: 'Failed to delete rider' });
  }
});

// ==================== PRODUCTS ====================

// Get all products
router.get('/products', auth, isAdmin, async (req, res) => {
  try {
    const { category, inStock } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (inStock === 'true') query.stock = { $gt: 0 };
    if (inStock === 'false') query.stock = 0;
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    console.log(`🛒 Admin fetched ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('❌ Products fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ==================== USERS ====================

// Get all users
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments();
    
    // Get order counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        const totalSpent = await Order.aggregate([
          { $match: { user: user._id, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        return {
          ...user.toObject(),
          orderCount,
          totalSpent: totalSpent[0]?.total || 0
        };
      })
    );
    
    console.log(`👥 Admin fetched ${users.length} users`);
    
    res.json({
      users: usersWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('❌ Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user details
router.get('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's orders
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ user, orders });
  } catch (error) {
    console.error('❌ User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Block/Unblock user
router.put('/users/:id/block', auth, isAdmin, async (req, res) => {
  try {
    const { blocked } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: blocked },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`${blocked ? '🚫' : '✅'} User ${user.name} ${blocked ? 'blocked' : 'unblocked'}`);
    res.json(user);
  } catch (error) {
    console.error('❌ User block error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ==================== ANALYTICS ====================

// Get revenue analytics
router.get('/analytics/revenue', auth, isAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    const revenueData = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(revenueData);
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get top products
router.get('/analytics/top-products', auth, isAdmin, async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);
    
    res.json(topProducts);
  } catch (error) {
    console.error('❌ Top products error:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

module.exports = router;
