const { validationResult } = require('express-validator');

// This middleware runs after validation rules
// If there are errors, it returns them all at once
// If no errors, it calls next() to proceed to the route handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

module.exports = validate;