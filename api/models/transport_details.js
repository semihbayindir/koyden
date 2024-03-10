const mongoose = require("mongoose");

const transportDetailsSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // Sipariş Id
    transporterId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    offer: { type: Number, required: true},
    isOfferAccept: { type: Boolean, required: true},
})

const TransportDetails = mongoose.model("TransportDetails", transportDetailsSchema);

module.exports = TransportDetails;