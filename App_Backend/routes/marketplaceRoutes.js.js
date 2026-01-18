// routes/marketplaceRoutes.js
const express = require("express");
const router = express.Router();
const marketplaceController = require("../controllers/marketplaceController");

// ✅ Routes
router.get("/", marketplaceController.getProducts);
router.post("/", marketplaceController.addProduct);
router.get("/ledger", marketplaceController.getLedger);

module.exports = router;
