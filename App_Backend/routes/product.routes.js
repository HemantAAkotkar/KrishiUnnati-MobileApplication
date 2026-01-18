const express = require('express');
const multer = require('multer');
// DESTRICTURING: Add 'getAllProducts' and 'getProductById' here
const { 
  addProduct, 
  uploadToCloudinary, 
  getAllProducts, 
  getProductById 
} = require('../controllers/product.controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 1. Image Upload
router.post('/upload', upload.single('image'), uploadToCloudinary);

// 2. Add Product
router.post('/add', addProduct);

// 3. Get All Products (For Marketplace)
router.get('/', getAllProducts);

// 4. Get Single Product (For Details Page)
router.get('/:id', getProductById);

module.exports = router;