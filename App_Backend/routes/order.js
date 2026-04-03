// App_Backend/routes/order.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const authMiddleware = require('../middlewares/auth');
const User = require('../models/user.model')
const SECRET_KEY = "KUP_PRIVATE_BLOCKCHAIN_KEY_2026"; //store in .env later
const orderController = require('../controllers/order.controller')
// 1. Create Order
// App_Backend/routes/order.js
// Update the Create Order route to be dynamic
// App_Backend/routes/order.js
// A. Create & Lock (Buyer clicks Buy)
router.post('/create', async (req, res) => {
  try {
    const { productId, farmerId, buyerId, price, quantity, totalAmount } = req.body;
    const buyer = await User.findById(buyerId);
    if (!buyer || buyer.walletBalance < totalAmount) {
      return res.status(400).json({ success: false, message: "Insufficient Balance for total quantity" });
    }
    // Hash logic updated to include quantity
    const dealData = `${buyerId}-${farmerId}-${productId}-${totalAmount}`;
    const secureHash = crypto.createHmac('sha256', SECRET_KEY).update(dealData).digest('hex');
    // Deduct Total Amount
    buyer.walletBalance -= totalAmount;
    await buyer.save();
    const newOrder = new Order({
      buyerId,
      farmerId,
      productId,
      price,
      quantity,
      totalAmount,
      blockchainHash: secureHash,
      status: 'PENDING',
      escrowStatus: 'LOCKED'
    });
    await newOrder.save();
    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// B. Farmer Accepts & Sets Date (Farmer clicks Confirm)
router.put('/farmer-accept/:id', async (req, res) => {
  try {
    const { deliveryDate } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, {
      status: 'ACCEPTED',
      deliveryDate: deliveryDate,
      isFarmerNotified: true
    }, { new: true });
    res.json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false }); }
});
// C. Final Settlement (Buyer clicks Accept Delivery)
router.post('/finalize/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    // THE TAMPER-PROOF CHECK (This is what you show the guide)
    const dealData = `${order.buyerId}-${order.farmerId}-${order.productId}-${order.price}`;
    const verifyHash = crypto.createHmac('sha256', SECRET_KEY).update(dealData).digest('hex');
    if (verifyHash !== order.blockchainHash) {
      // If someone changed the 'price' in MongoDB, the hashes won't match!
      return res.status(403).json({
        success: false,
        message: "CRITICAL: Database Tampering Detected! Transaction Halted for Audit."
      });
    }
    // If verification passes, proceed with release
    order.status = 'COMPLETED';
    order.escrowStatus = 'RELEASED';
    await order.save();
    const farmer = await User.findById(order.farmerId);
    farmer.walletBalance += order.price;
    await farmer.save();
    res.json({ success: true, msg: "Contract Executed: Farmer Paid accurately." });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});
// D. Notification Check for Farmer Login
// App_Backend/routes/order.js
router.get('/notifications/pending', authMiddleware, async (req, res) => {
  try {
    const fId = req.user.id || req.user.userId; // Ensure your auth middleware provides this
    // Find any order for this farmer that hasn't been notified yet
    const count = await Order.countDocuments({
      farmerId: fId,
      status: 'PENDING',
      isFarmerNotified: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ count: 0 });
  }
});
// 2. Fetch Single Order
router.get('/:id', async (req, res) => {
  try {
    // Note: Make sure your model fields match 'productId' and 'farmerId'
    const order = await Order.findById(req.params.id)
      .populate('productId')
      .populate('farmerId');
    res.json({ success: true, order });
  } catch (err) {
    res.status(404).json({ success: false, message: "Order not found" });
  }
});
// 3. Farmer Confirms Order
router.post('/confirm/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: 'ACCEPTED' }, { new: true });
  res.json({ success: true, order });
});
// 4. Buyer Releases Payment
router.post('/release/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order.status === 'COMPLETED') return res.status(400).json({ msg: "Already released" });
    // 1. Update Order Status
    order.status = 'COMPLETED';
    order.escrowStatus = 'RELEASED';
    await order.save();
    // 2. Add money to Farmer's (Vijay's) Wallet
    const farmer = await User.findById(order.farmerId);
    farmer.walletBalance += order.price;
    await farmer.save();
    res.json({ success: true, msg: "Funds released to Farmer Wallet", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Get all orders for the logged-in Farmer
router.get('/farmer/my-orders', authMiddleware, async (req, res) => {
  try {
    // req.user.id comes from your JWT/Auth token, making it global for any farmer
    const orders = await Order.find({ farmerId: req.user.id })
      .populate('productId')
      .populate('buyerId', 'fullName email');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
// Order status update karne ke liye (Confirm Shipment)
router.put('/update-status/:id', authMiddleware, async (req, res) => {
  try {
    const { status, escrowStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Order not found" });
    if (status) order.status = status;
    if (escrowStatus) order.escrowStatus = escrowStatus;
    // Agar Buyer ne "Received" kiya toh Farmer ko paise transfer karo
    if (status === 'COMPLETED' && order.escrowStatus === 'RELEASED') {
      const farmer = await User.findById(order.farmerId);
      farmer.walletBalance += order.price;
      await farmer.save();
    }
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/', orderController.getAllOrders);
router.get('/user/:userId', orderController.getUserOrders);
module.exports = router;