const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../middleware/validators');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route  POST /api/auth/register
router.post('/register', registerValidator, validate, async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error); // pass to global error handler
  }
});

// @route  POST /api/auth/login
router.post('/login', loginValidator, validate, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
});

const { protect } = require('../middleware/auth');
const { updateProfileValidator } = require('../middleware/validators');

// @route  PUT /api/auth/profile
router.put('/profile', protect, updateProfileValidator, validate, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const emailExists = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (emailExists) return res.status(400).json({ message: 'Email already in use by another account' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @route  PUT /api/auth/password
router.put('/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save(); // triggers the pre-save hash hook
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;