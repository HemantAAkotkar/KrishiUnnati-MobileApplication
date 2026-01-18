const cloudinary = require('../config/cloudinary');
const Product = require('../models/product.model');
const fs = require('fs'); // Node.js File System module

exports.addProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, image, sellerId, description, location } = req.body;

    const newProduct = new Product({
      name,
      category,
      price: Number(price), // Ensuring numeric value
      quantity: Number(quantity), // Ensuring numeric value
      image, // This is the secure_url from Cloudinary
      sellerId,
      description,
      location: {
        state: location?.state,
        district: location?.district
      }
    });

    await newProduct.save();
    res.status(201).json({ success: true, message: "Product listed successfully!", product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadToCloudinary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'krishi_unnati_products',
    });

    // PROFESSIONAL STEP: Delete the temporary file from your 'uploads/' folder
    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch (error) {
    // If upload fails, still try to delete local file to prevent junk
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Image Upload Failed", error: error.message });
  }
};

// Fetch all products with Search and Filter logic
exports.getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        // 1. Search Logic (Case-insensitive)
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // 2. Category Filter
        if (category && category !== 'All') {
            query.category = category;
        }

        const products = await Product.find(query).populate('sellerId', 'fullName');
        res.status(200).json({ success: true, count: products.length, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch Single Product by ID
exports.getProductById = async (req, res) => {
  try {
    // .populate('sellerId') fetches the actual User object, not just the ID
    const product = await Product.findById(req.params.id).populate('sellerId', 'fullName'); 
    
    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};