const express = require('express');
const router = express.Router();
const { protect, sellerOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { storeValidator, productValidator } = require('../middleware/validators');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendShippingUpdate } = require('../config/email');


router.use(protect, sellerOnly);

// --- STORE ---
router.post('/store', storeValidator, validate, async (req, res, next) => {
  try {
    let store = await Store.findOne({ seller: req.user._id });
    if (store) {
      store = await Store.findOneAndUpdate({ seller: req.user._id }, req.body, { new: true, runValidators: true });
    } else {
      store = await Store.create({ ...req.body, seller: req.user._id });
    }
    res.json(store);
  } catch (error) {
    next(error);
  }
});

router.get('/store', async (req, res, next) => {
  try {
    const store = await Store.findOne({ seller: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found. Please set up your store.' });
    res.json(store);
  } catch (error) {
    next(error);
  }
});

// --- PRODUCTS ---
router.post('/products', productValidator, validate, async (req, res, next) => {
  try {
    const store = await Store.findOne({ seller: req.user._id });
    if (!store) return res.status(400).json({ message: 'Set up your store first' });
    const product = await Product.create({ ...req.body, seller: req.user._id, store: store._id });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.put('/products/:id', productValidator, validate, async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found or not yours' });
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found or not yours' });
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

// --- ORDERS ---
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('buyer', 'name email')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
});


module.exports = router;