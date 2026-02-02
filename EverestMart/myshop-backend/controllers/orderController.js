const Order = require('../models/Order');
const { notifyWarehouse, notifyRider, notifyCustomer, notifyAdmin } = require('../services/notificationService');

exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      user: req.user._id,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      shippingAddress: req.body.shippingAddress,
    });

    const io = req.app.get('io');
    notifyWarehouse(io, order);
    notifyAdmin(io, order);
    notifyCustomer(io, order, 'pending');

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product');
  res.json(orders);
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate('items.product user');
  res.json(orders);
};
