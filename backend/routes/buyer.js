const express = require('express');
const router = express.Router();
const { protect, buyerOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { orderValidator } = require('../middleware/validators');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');
const { sendOrderConfirmation } = require('../config/email');

router.use(protect, buyerOnly);

router.post('/orders', orderValidator, validate, async (req, res, next) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  try {
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product not available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        seller: product.seller,
      });
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
    });
    sendOrderConfirmation(req.user.email, order);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'name image')
      .populate('items.seller', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id })
      .populate('items.product', 'name image price');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.put('/orders/:id/cancel', async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }
    order.status = 'Cancelled';
    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.put('/orders/:id/pay', async (req, res, next) => {
  try {
    const { paystackReference } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isPaid: true, paidAt: new Date(), paystackReference, paymentMethod: 'Paystack' },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.get('/sellers/:sellerId', async (req, res, next) => {
  try {
    const seller = await User.findById(req.params.sellerId).select('name email');
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }
    const store = await Store.findOne({ seller: req.params.sellerId });
    res.json({ seller, store });
  } catch (error) {
    next(error);
  }
});

router.get('/sellers/:sellerId/products', async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.params.sellerId, isActive: true });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

module.exports = router;