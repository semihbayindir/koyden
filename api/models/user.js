const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  iban: {
    type: String,
    required: false
  },
  accountNumber: {
    type: String,
    required: false
  },
});

const addressSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
});

const verificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Individual', 'Company'], // ?????
    required: false
  },
  producerAddress: {
    type: addressSchema,
    required: false
  },
  paymentInfo: {
    type: paymentSchema,
    required: false
  },
  description: {
    type: String,
    required: false
  }
});

const qualityRatingSchema = new mongoose.Schema({
  productQuality: {
    type: Number,
    required: false
  },
  reliability: {
    type: Number,
    required: false
  },
  serviceQuality: {
    type: Number,
    required: false
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  address: {
    type: addressSchema, // Adres bilgisi, özel bir şema olarak tanımlanmıştır.
    required: false
  },
  paymentDetails: {
    type: paymentSchema,
    required: false
  },
  verification: {
    type: verificationSchema, // Doğrulama bilgileri, özel bir şema olarak tanımlanmıştır.
    required: false
  },
  qualityRating: {
    type: qualityRatingSchema, // Kalite değerlendirme bilgileri, özel bir şema olarak tanımlanmıştır.
    required: false
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
