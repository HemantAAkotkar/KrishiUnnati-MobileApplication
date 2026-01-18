// forceMigrate.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    // 1. Apne database ka sahi naam yahan likhein (e.g., 'krishiUnnati')
    const database = client.db('krishiUnnati'); 
    const products = database.collection('products');

    console.log("🚀 Force Migration Started...");

    // 2. Har wo document jisme status nahi hai, usme "Pending" set karo
    const result = await products.updateMany(
      { status: { $exists: false } }, 
      { $set: { status: "Pending" } }
    );

    console.log("-----------------------------------------");
    console.log(`✅ Total Documents Scanned: ${await products.countDocuments()}`);
    console.log(`✅ New Fields Added: ${result.modifiedCount}`);
    console.log("-----------------------------------------");

  } finally {
    await client.close();
    console.log("🔌 Database Connection Closed.");
  }
}

run().catch(console.dir);