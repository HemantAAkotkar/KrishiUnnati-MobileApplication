const axios = require('axios');
// Assuming you have your config imported
const { BLOCKCHAIN_SERVICE_URL, baseBlockchainURL } = require('../config/config');
const Order = require('../models/Order');
const User = require('../models/user.model');

// Bypass Header for Ngrok
const bypassHeaders = {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
};

exports.createOrder = async (req, res) => {
    try {
        const { buyerId, farmerId, productId, quantity, totalAmount } = req.body;
        // 1. Fetch REAL-TIME balance from the E: Drive Wallet Service
        const walletRes = await axios.get(`${BLOCKCHAIN_SERVICE_URL}/api/v1/pay-system-kup/wallet/balance/${buyerId}`);
        const realBalance = walletRes.data.balance;
        // 2. Validate against the real balance, NOT the local MERN field
        if (realBalance < totalAmount) {
            return res.status(400).json({
                success: false,
                message: `Insufficient Balance. You have ₹${realBalance}, but need ₹${totalAmount}`
            });
        }
        // --- STEP 2: FETCH BLOCKCHAIN ADDRESSES ---
        const buyer = await User.findById(buyerId);
        const farmer = await User.findById(farmerId);

        // --- STEP 3: HIT NGROK BLOCKCHAIN (NGROK) ---
        console.log("🚀 Attempting Blockchain Create...");
        const chainRes = await axios.post(`${baseBlockchainURL}/api/trade/create`, {
            farmeraddress: farmer.blockchainAddress,
            buyerAddress: buyer.blockchainAddress,
            crop: productId,
            price: totalAmount / quantity,
            quantity: quantity
        }, { headers: bypassHeaders });

        console.log("📦 Blockchain Response:", chainRes.data);

        // --- STEP 4: SAVE TO MERN DB ---
        const newOrder = new Order({
            ...req.body,
            blockchainOrderId: chainRes.data.orderId,
            status: 'PENDING',
            escrowStatus: 'LOCKED'
        });

        await newOrder.save();
        res.status(201).json({ success: true, order: newOrder });

    } catch (error) {
        console.error("❌ Create Order Error:", error.response?.data || error.message);
        res.status(500).json({ success: false, message: error.message });
    }

};
// 1. Farmer Ships the Product
exports.shipOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            { status: "SHIPPED", updatedAt: Date.now() },
            { new: true }
        );
        res.json({ success: true, message: "Order marked as Shipped", order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// 2. Buyer Accepts Delivery & Triggers Blockchain Release
exports.acceptDelivery = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
        // CALL E: DRIVE WALLET SERVICE TO RELEASE FUNDS
        const releaseRes = await axios.post(`${BLOCKCHAIN_SERVICE_URL}/api/v1/pay-system-kup/escrow/release`, {
            orderId: order._id,
            buyerId: order.buyerId,
            farmerId: order.farmerId,
            amount: order.totalAmount
        }, {
            headers: ngrokHeaders
        });
        const ngrokHeaders = {
            'ngrok-skip-browser-warning': 'true'
        };
        if (releaseRes.data.success) {
            order.status = 'DELIVERED';
            order.escrowStatus = 'RELEASED';
            await order.save();
            res.status(200).json({ success: true, message: "Funds released to Farmer!" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// 2. Finalize Order (Settlement)
exports.finalizeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // FIX: Find the Buyer in USER collection, not Order collection
        const buyer = await User.findById(order.buyerId);
        if (!buyer) return res.status(404).json({ message: "Buyer not found" });

        console.log("🔄 Updating Blockchain Status for:", order.blockchainOrderId);

        // --- STEP 1: UPDATE BLOCKCHAIN (NGROK) ---
        const chainUpdate = await axios.post(`${baseBlockchainURL}/api/trade/update-status`, {
            orderId: order.blockchainOrderId, // Fixed typo from 'oderId'
            status: "COMPLETED",
            buyerPrivateKey: buyer.blockchainPrivateKey
        }, { headers: bypassHeaders });

        console.log("✅ Blockchain Update Response:", chainUpdate.data);

        if (chainUpdate.data.success) {
            // --- STEP 2: WALLET RELEASE (E: DRIVE) ---
            const walletRes = await axios.post(`${BLOCKCHAIN_SERVICE_URL}/api/v1/pay-system-kup/escrow/release`, {
                buyerId: order.buyerId,
                farmerId: order.farmerId,
                amount: order.totalAmount,
                orderId: order._id
            });

            if (walletRes.data.success) {
                order.status = 'COMPLETED';
                order.escrowStatus = 'RELEASED';
                await order.save();
                res.json({ success: true, message: "Blockchain Updated & Funds Released!" });
            }
        } else {
            res.status(400).json({ success: false, message: "Blockchain API rejected the update." });
        }
    } catch (err) {
        console.error("❌ Finalize Error:", err.response?.data || err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ $or: [{ buyerId: userId }, { farmerId: userId }] })
            .populate('productId')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('productId').sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};