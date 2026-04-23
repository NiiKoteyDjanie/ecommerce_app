const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,         // snapshot of product name at time of order
  price: Number,        // snapshot of price at time of order
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    street: String,
    city: String,
    country: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  paymentMethod: {
  type: String,
  enum: ['Cash on Delivery', 'Paystack'],
  default: 'Cash on Delivery',
},
isPaid: {
  type: Boolean,
  default: false,
},
paidAt: Date,
paystackReference: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);