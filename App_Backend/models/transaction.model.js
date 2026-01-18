// models/transaction.model.js

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  quantity: Number,
  totalAmount: Number,
  paymentStatus: {
    type: String,
    enum: ["pending", "completed"],
    default: "completed"
  },
  orderStatus: {
    type: String,
    enum: ["placed", "shipped", "delivered"],
    default: "placed"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
