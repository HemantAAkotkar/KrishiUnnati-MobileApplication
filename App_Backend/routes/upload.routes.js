const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { uploadImage } = require("../controllers/upload.controller");

// Multer setup (store locally)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST /api/upload
router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;
