const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',       // references the User model
    required: true,
    unique: true,      // one store per seller
  },
  storeName: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  logo: String,        // URL to logo image
  location: String,
  phone: String,
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);