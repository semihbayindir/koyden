const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Kullanıcının profil bilgilerini getiren endpoint
router.get('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Kullanıcının ID'sine göre veritabanından kullanıcıyı çek
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcı bilgilerini geri döndür
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
