const mongoose = require('mongoose');

const singleOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  producerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 }, 
      price: { type: Number, required: true }, 
    }
  ],
  totalPrice: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now }, 
  from: { type: String, required: true },
  to: { type: String, required: true }, 
  status: { type: String, enum: ['Hazırlanıyor', 'Kargoya Verildi', 'Teslim Edildi'], default: 'Hazırlanıyor' },
});

const SingleOrder = mongoose.model('SingleOrder', singleOrderSchema);

module.exports = SingleOrder;
