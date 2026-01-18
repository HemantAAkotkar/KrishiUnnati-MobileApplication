// models/Order.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const orderSchema = new Schema({
  buyerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  qty:       { type: Number, required: true },
  status:    { type: String, enum: ['pending','accepted','delivered'], default: 'pending' }
}, { timestamps: true });

export default model('Order', orderSchema);
