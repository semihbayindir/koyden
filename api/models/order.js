const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  producerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transportDetailsId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportDetails', required: false },
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
  transportFee: { type: Number, required: true },
  status: { type: String, enum: ['Hazırlanıyor', 'Kargoya Verildi', 'Teslim Edildi'], default: 'Hazırlanıyor' },
});

orderSchema.virtual('adjustedTransportFee').get(function() {
  const currentDate = new Date();
  const orderDate = new Date(this.orderDate);
  const diffDays = Math.floor((currentDate - orderDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 2) {
    return this.transportFee * 1.1; // %10 artış
  }
  return this.transportFee;
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
