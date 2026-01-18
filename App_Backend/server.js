const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// =====================
// PROFESSIONAL CORS CONFIG
// =====================
app.use(cors({
  origin: "*", // Allows all origins (essential for mobile dev)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// =====================
// IMPORT ROUTES
// =====================
const authRoutes = require("./routes/auth.routes");
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
// =====================
// STATIC FOLDER & API ROUTES
// 2. Form Data Parser (Optional but helpful)
app.use(express.urlencoded({ extended: true }));
// =====================
// app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Added this
app.use("/api/products", productRoutes);
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
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.error("❌ Database Connection Error:", err));

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // console.log(`📡 Network URL: http://192.168.135.153:${PORT}`); 
    console.log(`📡 Network URL: http://10.189.48.153:${PORT}`); 

});