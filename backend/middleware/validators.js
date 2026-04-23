const { body } = require('express-validator');

// ============================================
// AUTH VALIDATORS
// ============================================
exports.registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller'),
];

exports.loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ============================================
// STORE VALIDATORS
// ============================================
exports.storeValidator = [
  body('storeName')
    .trim()
    .notEmpty().withMessage('Store name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Store name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please enter a valid phone number'),
];

// ============================================
// PRODUCT VALIDATORS
// ============================================
exports.productValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),

  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock cannot be negative'),

  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('category')
    .optional()
    .isIn(['Electronics', 'Fashion', 'Food', 'Beauty', 'Home', 'Sports', 'Other'])
    .withMessage('Invalid category'),
];

// ============================================
// ORDER VALIDATORS
// ============================================
exports.orderValidator = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must have at least one item'),

  body('items.*.productId')
    .notEmpty().withMessage('Product ID is required for each item')
    .isMongoId().withMessage('Invalid product ID'),

  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('shippingAddress.street')
    .trim()
    .notEmpty().withMessage('Street address is required'),

  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('shippingAddress.country')
    .trim()
    .notEmpty().withMessage('Country is required'),
];

// ============================================
// PROFILE VALIDATORS
// ============================================
exports.updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('currentPassword')
    .optional()
    .notEmpty().withMessage('Current password is required to change password'),

  body('newPassword')
    .optional()
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/\d/).withMessage('New password must contain at least one number'),
];