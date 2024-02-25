const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Siparişi veren kullanıcının ID'si
  producerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Üreticinin ID'si
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Ürünün ID'si
      quantity: { type: Number, default: 1 }, // Ürün miktarı
      price: { type: Number, required: true }, // Ürün fiyatı
    }
  ],
  totalPrice: { type: Number, required: true }, // Toplam fiyat
  orderDate: { type: Date, default: Date.now }, // Sipariş tarihi
  status: { type: String, enum: ['Hazırlanıyor', 'Kargoya Verildi', 'Teslim Edildi'], default: 'Hazırlanıyor' }, // Sipariş durumu
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;