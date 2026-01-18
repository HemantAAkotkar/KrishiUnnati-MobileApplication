const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true }, // Price per Quintal
  quantity: { type: Number, required: true },
  image: { type: String, required: true }, // Cloudinary URL
  description: { type: String },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    state: String,
    district: String
  },// product.model.js mein status field add karein
status: {
  type: String,
  enum: ['Pending', 'Delivered', 'Cancelled'],
  default: 'Pending' // Naye products ke liye automatic
}
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);