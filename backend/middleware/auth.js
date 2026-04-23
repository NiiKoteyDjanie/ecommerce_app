const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify that user is logged in
const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the Authorization header as: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password'); // attach user to request
      next(); // proceed to the route
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Check that user has seller role
const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Sellers only.' });
  }
};

// Check that user has buyer role
const buyerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'buyer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Buyers only.' });
  }
};

module.exports = { protect, sellerOnly, buyerOnly };