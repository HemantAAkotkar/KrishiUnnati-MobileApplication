const mongoose = require('mongoose');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');

const MONGO_URI = "mongodb+srv://MyAppUser:KUP-MobileApp@cluster0.agyxps6.mongodb.net/KrishiUnnati?retryWrites=true&w=majority"; 
const SECRET_KEY = "KUP_PRIVATE_BLOCKCHAIN_KEY_2026";

async function runSettlementProcess(orderId) {
    try {
        console.log("\n--- KUP BLOCKCHAIN SCANNER STARTING ---");
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;

        // 1. SCAN ALL COLLECTIONS TO FIND THE ORDER
        const collections = await db.listCollections().toArray();
        let order = null;
        let collectionName = "";

        for (let col of collections) {
            const found = await db.collection(col.name).findOne({ _id: new ObjectId(orderId) });
            if (found) {
                order = found;
                collectionName = col.name;
                break;
            }
        }

        if (!order) {
            console.log("❌ ERROR: Order ID not found in ANY collection.");
            console.log("Checked collections:", collections.map(c => c.name).join(', '));
            return;
        }

        console.log(`✅ FOUND: Order in collection [${collectionName}]`);
        console.log(`[ANALYSIS] Amount to Settle: ₹${order.totalAmount}`);

        // 2. CRYPTOGRAPHIC INTEGRITY CHECK
        const verifyData = `${order.buyerId}-${order.farmerId}-${order.totalAmount}`;
        const currentHash = crypto.createHmac('sha256', SECRET_KEY).update(verifyData).digest('hex');

        if (currentHash !== order.blockchainHash) {
            console.log("\n⚠️ SECURITY ALERT: DATA TAMPERING DETECTED!");
            console.log("Database hash mismatch. Process Terminated.");
            return;
        }

        // 3. SETTLEMENT (ESCROW -> FARMER)
        console.log(`[ESCROW] Locking funds...`);
        await db.collection(collectionName).updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { status: 'COMPLETED', escrowStatus: 'RELEASED' } }
        );

        // Find farmer in 'users' or 'Users' (Auto-check case)
        const farmerCol = collections.find(c => c.name.toLowerCase() === 'users').name;
        const farmer = await db.collection(farmerCol).findOne({ _id: new ObjectId(order.farmerId) });

        if (farmer) {
            const newBalance = (farmer.walletBalance || 0) + order.totalAmount;
            await db.collection(farmerCol).updateOne(
                { _id: new ObjectId(order.farmerId) },
                { $set: { walletBalance: newBalance } }
            );
            console.log(`✅ SUCCESS: ₹${order.totalAmount} transferred to ${farmer.fullName}`);
        }

        // 4. GENERATE RECEIPT
        printAmountSlip(order, farmer);

    } catch (err) {
        console.error("❌ ENGINE CRASH:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

function printAmountSlip(order, farmer) {
    console.log("\n==========================================");
    console.log("       KUP TRANSACTION RECEIPT           ");
    console.log("==========================================");
    console.log(`Order ID:     ${order._id}`);
    console.log(`Tx Hash:      ${order.blockchainHash.substring(0, 20)}...`);
    console.log(`Status:       SETTLED (Verified)`);
    console.log(`Recipient:    ${farmer ? farmer.fullName : "Verified Farmer"}`);
    console.log(`Amount:       ₹${order.totalAmount}`);
    console.log("------------------------------------------");
    console.log("     AUTHENTICATED BY KRISHI-CHAIN      ");
    console.log("==========================================\n");
}

runSettlementProcess("69897f1dec531bc9e6216a32");