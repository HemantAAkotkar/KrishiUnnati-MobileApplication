const { products } = require("../data/mockBlockchainData");

// controllers/marketplaceController.js

// let products = [
//   { id: 1, name: "Organic Wheat", price: "₹1200 / quintal", seller: "Ramesh", location: "Amravati" },
//   { id: 2, name: "Soyabean", price: "₹4600 / quintal", seller: "Suresh", location: "Akola" },
// ];

// Simulate Blockchain Transaction Record
let blockchainLedger = [];

// GET all products
exports.getProducts = (req, res) => {
  res.json({ success: true, data: products });
};

// POST add product (simulate transaction)
exports.addProduct = (req, res) => {
  const { productName, price, seller, location } = req.body;
  const newProduct = {
    id: products.length + 1,
    productName,
    price,
    seller,
    location,
  };
  products.push(newProduct);

  // simulate blockchain "transaction"
  const transaction = {
    txId: Date.now(),
    timestamp: new Date(),
    action: "ADD_PRODUCT",
    product: newProduct,
  };
  blockchainLedger.push(transaction);

  res.status(201).json({
    success: true,
    message: "Product added successfully (recorded on blockchain simulation)",
    data: newProduct,
  });
};

// GET blockchain ledger
exports.getLedger = (req, res) => {
  res.json({
    success: true,
    ledgerLength: blockchainLedger.length,
    data: blockchainLedger,
  });
};


exports.getAllProducts = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Blockchain Marketplace Data Fetched Successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};
