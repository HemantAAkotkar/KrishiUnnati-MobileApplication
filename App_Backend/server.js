const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

// 1. Ensure 'uploads' folder exists (Prevents Multer errors)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// =====================
// PROFESSIONAL CORS CONFIG
// =====================
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'ngrok-skip-browser-warning'
  ],
  credentials: true
}));

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files so the App can see the images
app.use("/uploads", express.static(uploadDir));

// =====================
// IMPORT ROUTES
// =====================
const authRoutes = require("./routes/auth.routes");
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.js');
const uploadRoutes = require('./routes/upload.routes'); // 👈 ADD THIS LINE

// =====================
// API ROUTES
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/upload", uploadRoutes); // 👈 ADD THIS LINE - This fixes your 404!

// Default test route
app.get("/", (req, res) => {
  res.send("Krishi Unnati API is running...");
});

// =====================
// MONGODB CONNECTION
// =====================
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "krishiUnnati",
  })
  .then(() => console.log("✅ MongoDB Atlas Connected: krishiUnnati"))
  .catch((err) => console.error("❌ Database Connection Error:", err));

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT,"0.0.0.0", () => {
  console.log(`🚀 Krishi Unnati Server running on port ${PORT}`);
  console.log(`📡 Local Access: http://localhost:${PORT}`);
  console.log(`🌐 Network Access: http://mobile:${PORT}`);
});