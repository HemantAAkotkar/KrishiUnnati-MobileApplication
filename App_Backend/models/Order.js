// App_Backend/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  price: Number,
  quantity: Number,
  totalAmount: Number,
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'COMPLETED'], 
    default: 'PENDING' 
  },
  blockchainHash: String, 
  blockchainOrderId: String,
  escrowStatus: { type: String, enum: ['LOCKED', 'RELEASED'], default: 'LOCKED' },
  deliveryDate: { type: Date }, // NEW: Critical for the Buyer's auto-popup
  isFarmerNotified: { type: Boolean, default: false } // NEW: For the login alert
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);