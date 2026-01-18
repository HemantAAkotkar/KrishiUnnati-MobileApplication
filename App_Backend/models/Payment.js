// models/Payment.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const paymentSchema = new Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount:  { type: Number, required: true },
  status:  { type: String, enum: ['paid','unpaid'], default: 'unpaid' }
}, { timestamps: true });

export default model('Payment', paymentSchema);
