const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 12, sort = 'newest', minPrice, maxPrice } = req.query;

    let filter = { isActive: true };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt:  1 },
      price_asc:  { price:      1 },
      price_desc: { price:     -1 },
    };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit)); // max 50 per page
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'name email')
        .populate('store', 'storeName location')
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('store', 'storeName description location logo');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = router;