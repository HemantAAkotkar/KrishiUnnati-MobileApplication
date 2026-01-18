const mongoose = require("mongoose");
const User = require("./models/user.model");
const Product = require("./models/product.model");
const Transaction = require("./models/transaction.model");

mongoose.connect("mongodb+srv://MyAppUser:myappUser@cluster0.agyxps6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

async function seedTransactions() {
  try {
    console.log("🔄 Seeding transactions...");

    const buyers = await User.find({ role: "Buyer" });
    const products = await Product.find();

    if (!buyers.length || !products.length) {
      throw new Error("Buyers or Products not found");
    }

    const transactions = [];

    for (let i = 1; i <= 10; i++) {
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      const product = products[Math.floor(Math.random() * products.length)];

      const quantity = Math.floor(Math.random() * 5) + 1;

      transactions.push({
        buyerId: buyer._id,
        sellerId: product.sellerId,
        productId: product._id,
        quantity,
        totalAmount: quantity * product.price,
        paymentStatus: "completed",   // ✅ FIXED
        orderStatus: "delivered"      // ✅ FIXED
      });
    }

    await Transaction.insertMany(transactions);

    console.log("✅ 10 Transactions seeded successfully");
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Transaction seeding failed:", error.message);
    mongoose.disconnect();
  }
}

seedTransactions();
