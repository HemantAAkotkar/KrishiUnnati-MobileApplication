exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filePath = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      imageUrl: filePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
