const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const multer = require('multer');
const AWS = require('aws-sdk');

const app = express();
const port = 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
const jwt = require("jsonwebtoken");

const userRoutes = require('./routes/user');
app.use('/api', userRoutes);



mongoose
  .connect("mongodb+srv://admin:EpyvP3HHct10obHz@koyden.97gdxbo.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Mongo Db");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDb", err);
  });

  

app.listen(port, "localhost", () => {
    console.log("Server is running on localhost");
  });
const User = require("./models/user");

//endpoint for registration of the user

app.post("/register", (req, res) => {
  const { name,surname,phone,email,password } = req.body;

  // create a new User object
  const newUser = new User({ name,surname,phone,email,password });

  // save the user to the database
  newUser
    .save()
    .then(() => {
      res.status(200).json({ message: "User registered successfully" });
    })
    .catch((err) => {
      console.log("Error registering user", err);
      res.status(500).json({ message: "Error registering the user!" });
    });
});

//function to create a token for the user
const createToken = (userId) => {
  // Set the token payload
  const payload = {
    userId: userId,
  };

  // Generate the token with a secret key and expiration time
  const token = jwt.sign(payload, "Q$r2K6W8n!jCW%Zk", { expiresIn: "1h" });

  return token;
};

//endpoint for logging in of that particular user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  //check if the email and password are provided
  if (!email || !password) {
    return res
      .status(404)
      .json({ message: "Email and the password are required" });
  }

  //check for that user in the database
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        //user not found
        return res.status(404).json({ message: "User not found" });
      }

      //compare the provided passwords with the password in the database
      if (user.password !== password) {
        return res.status(404).json({ message: "Invalid Password!" });
      }

      const token = createToken(user._id);
      res.status(200).json({ token });
    })
    .catch((error) => {
      console.log("error in finding the user", error);
      res.status(500).json({ message: "Internal server Error!" });
    });
});


//endpoint to access all the users except the user who's is currently logged in!
app.get("/users/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log("Error retrieving users", err);
      res.status(500).json({ message: "Error retrieving users" });
    });
});

// Endpoint to get a single user by ID
app.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  
  try {
    const user = await User.findById(userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ message: 'Error retrieving user' });
  }
});

// Endpoint to access the user's verification information
app.get("/users/:userId/verification", (req, res) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      res.status(200).json(user.verification);
    })
    .catch((err) => {
      console.log("Kullanıcı doğrulama bilgileri alınamadı", err);
      res.status(500).json({ message: "Kullanıcı doğrulama bilgileri alınamadı" });
    });
});

// Endpoint to update or add verification information for a user
app.post("/users/:userId/verification", (req, res) => {
  const userId = req.params.userId;
  const { verification } = req.body;

  User.findByIdAndUpdate(userId, { verification }, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      res.status(200).json(updatedUser.verification);
    })
    .catch((err) => {
      console.log("Kullanıcı doğrulama bilgileri güncellenemedi", err);
      res.status(500).json({ message: "Kullanıcı doğrulama bilgileri güncellenemedi" });
    });
});

// Kullanıcı profili için fotoğraf URL'sini güncellemek için endpoint
app.put('/users/:userId/image', async (req, res) => {
  const { userId } = req.params;
  const { image } = req.body;

  try {
      const updatedUser = await User.findByIdAndUpdate(userId, { image: image }, { new: true });
      res.json(updatedUser);
  } catch (error) {
      console.error('Error updating user profile image:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/producer/:producerId', async (req, res) => {
  const producerId = req.params.producerId;

  try {
    // Kullanıcıyı veritabanından bul
    const producer = await User.findById(producerId);

    if (!producer) {
      return res.status(404).json({ message: "Üretici bulunamadı." });
    }

    // Kullanıcının bilgilerini döndür
    res.status(200).json({ producer });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});


const Product = require("./models/product");


// ÜRÜN EKLEME
app.post("/products", (req, res) => {
  const { name, description, images, category, qty, qtyFormat, minQty, price,producerId } = req.body;

  const newProduct = new Product({ name, description, images, category, qty, qtyFormat, minQty, price,producerId  });

  newProduct
    .save()
    .then(() => {
      res.status(200).json({ message: "Product added successfully" });
    })
    .catch((err) => {
      console.log("Error adding product", err);
      res.status(500).json({ message: "Error adding the product!" });
    });
});

// ÜRÜNLERİ LİSTELEME
app.get("/products", (req, res) => {
  Product.find()
    .then((products) => {
      res.status(200).json(products);
    })
    .catch((err) => {
      console.log("Error retrieving products", err);
      res.status(500).json({ message: "Error retrieving products" });
    });
});

// ÜRETİCİ KENDİ ÜRÜNLERİNİ LİSTELEME
app.get("/products/producer/:producerId", (req, res) => {
  const producerId = req.params.producerId;

  Product.find({ producerId: producerId })
    .then((products) => {
      res.status(200).json(products);
    })
    .catch((err) => {
      console.error('Error fetching products:', err);
      res.status(500).json({ message: "Error fetching products" });
    });
});

// Single Product
  app.get("/products/:productId", (req, res) => {
    const productId = req.params.productId;

    Product.findById(productId)
      .then((product) => {
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
      })
      .catch((err) => {
        console.log("Error fetching product:", err);
        res.status(500).json({ message: "Error fetching product" });
      });
  });
// ÜRÜNLERİ GÜNCELLEME VE SİLME
app.put("/products/:productId", (req, res) => {
  const productId = req.params.productId;
  const { name, description, images, category, qty, minQty, price  } = req.body;

  Product.findByIdAndUpdate(
    productId,
    { name, description, images, category, qty, minQty, price  },
    { new: true }
  )
    .then((updatedProduct) => {
      res.status(200).json(updatedProduct);
    })
    .catch((err) => {
      console.log("Error updating product", err);
      res.status(500).json({ message: "Error updating the product" });
    });
});

app.delete("/products/:productId", (req, res) => {
  const productId = req.params.productId;

  Product.findByIdAndDelete(productId)
    .then(() => {
      res.status(200).json({ message: "Product deleted successfully" });
    })
    .catch((err) => {
      console.log("Error deleting product", err);
      res.status(500).json({ message: "Error deleting the product" });
    });
});

app.put("/products/:productId/decreaseQuantity", async (req, res) => {
  const productId = req.params.productId;
  const quantityToDecrease = req.body.quantityToDecrease;

  try {
      // İlgili ürünü bul ve miktarını azalt
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }

      // Ürün miktarını azalt
      product.qty -= quantityToDecrease;
      await product.save();

      res.status(200).json({ message: "Product quantity decreased successfully" });
  } catch (error) {
      console.error('Error decreasing product quantity:', error);
      res.status(500).json({ message: "Error decreasing product quantity" });
  }
});

// AWS S3 konfigürasyonu
const s3 = new AWS.S3({
  accessKeyId: 'AKIAYS2NVLWJLYKFENOA',
  secretAccessKey: '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',
  region: 'eu-central-1',
});

// Multer yapılandırması
const upload = multer({ dest: 'uploads/' });

// Görsel yükleme endpoint'i
app.post('/upload', upload.single('image'), (req, res) => {
  const { file } = req;

  const params = {
    Bucket: 'koyden',
    Key: file.originalname,
    Body: require('fs').createReadStream(file.path),
    ContentType: file.mimetype
  };

  s3.upload(params, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.json({ imageUrl: data.Location });
  });
});

const Cart = require('./models/cart');

// Kullanıcının sepetini almak için GET isteği
app.get('/cart/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const cart = await Cart.findOne({ userId: userId }).populate('products.productId');
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Yeni bir sepet oluşturmak için POST isteği
app.post('/cart/create', async (req, res) => {
  const { userId } = req.body;
  try {
    const newCart = new Cart({ userId: userId, products: [] });
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    console.error('Error creating cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/cart/add/:userId', async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.params.userId;

  try {
    // Kullanıcının sepetini bul veya yeni sepet oluştur
    let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!cart) {
      cart = new Cart({ userId: new mongoose.Types.ObjectId(userId), products: [] });
    }

    const existingProductIndex = cart.products.findIndex(item => item.productId.toString() === productId);

    if (existingProductIndex !== -1) {
      // Ürün sepette zaten var, miktarını güncelle
      cart.products[existingProductIndex].quantity += quantity;
      
      // Bu kısımda doğrudan MongoDB'ye update işlemi yapabilirsiniz
      await Cart.updateOne(
        { userId: new mongoose.Types.ObjectId(userId), "products.productId": new mongoose.Types.ObjectId(productId) },
        { $set: { "products.$.quantity": cart.products[existingProductIndex].quantity } }
      );
    } else {
      // Yeni ürünü sepete ekle
      cart.products.push({ productId: new mongoose.Types.ObjectId(productId), quantity: quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Sepeti silmek için DELETE isteği
app.delete('/cart/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const deletedCart = await Cart.findOneAndDelete({ userId: userId });
    if (!deletedCart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json(deletedCart);
  } catch (error) {
    console.error('Error deleting cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
const SingleOrder = require('./models/singleOrder');
app.post('/singleOrders/create', async (req, res) => {
  try {
    const { userId, producerId, products, orderIds, totalPrice, from, to } = req.body;

    const newOrder = new SingleOrder({
      userId,
      producerId,
      products,
      orderIds,
      totalPrice,
      from,
      to
    });

    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/singleOrders/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const orders = await SingleOrder.find({ userId }).populate('products.productId');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const Order = require('./models/order');
const TransportDetails = require("./models/transport_details");
//Sipariş Oluşturma (Tüketici tarafı):
app.post('/orders/create', async (req, res) => {
  try {
    const { userId, producerId, transportDetailsId, products, totalPrice, from, to, transportFee } = req.body;

    const newOrder = new Order({
      userId,
      producerId,
      transportDetailsId,
      products,
      totalPrice,
      from,
      to,
      transportFee
    });

    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/orders/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    // İlgili orderId'ye sahip olan order'ı veritabanından bul
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Tüm Siparişleri Almak (Tüketici tarafı):
app.get('/orders/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const orders = await Order.find({ userId }).populate('products.productId');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
//Tüm Siparişleri Almak (Üretici tarafı):
app.get('/orders/producer/:producerId', async (req, res) => {
  const producerId = req.params.producerId;
  try {
    const orders = await Order.find({ producerId }).populate('products.productId');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
//Sipariş Durumunu Güncelleme (Üretici tarafı):
app.put('/orders/update/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;
  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.put('/orders/update/offer/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  const { offer } = req.body;
  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { offer }, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Tüm siparişleri getirme
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate('products.productId');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST endpoint for adding transportDetailsId to an order
app.post('/orders/addTransportDetailsId', async (req, res) => {
  try {
    const { orderId, transportDetailsId } = req.body;

    // Siparişi bul ve transportDetailsId alanını güncelle
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { transportDetailsId }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }

    res.status(200).json({ message: "TransportDetailsId başarıyla eklendi.", order: updatedOrder });
  } catch (error) {
    console.error('Error adding transportDetailsId to order:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

app.delete('/orders/:orderId', async (req, res) => {
  const orderId = req.params.orderId; // orderId olarak değiştirildi
  try {
    // Order'ı bul ve sil
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (deletedOrder) {
      res.status(200).json({ message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// OrderId ile SingleOrder'ı silmek için endpoint
app.delete('/singleOrder/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const result = await SingleOrder.findOneAndDelete({ 'orderIds.orderId': orderId });

    if (!result) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});
app.delete('/cart/:userId/product/:productId', async (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.productId;
  try {
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
    // Ürünü sepetten kaldır
    cart.products.splice(productIndex, 1);
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error deleting product from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/cart/:cartId/product/:productId/decrease', async (req, res) => {
  try {
    const { cartId, productId } = req.params;

    const cart = await Cart.findById(cartId);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const product = cart.products.find(item => item.productId.toString() === productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found in the cart' });
    }

    if (product.quantity > 1) {
      product.quantity--;
    } else {
      // If quantity is already 1, remove the product from the cart
      cart.products = cart.products.filter(item => item.productId.toString() !== productId);
    }

    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Endpoint to increase the quantity of a product in the cart
app.put('/cart/:cartId/product/:productId/increase', async (req, res) => {
  try {
    const { cartId, productId } = req.params;

    const cart = await Cart.findById(cartId);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const product = cart.products.find(item => item.productId.toString() === productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found in the cart' });
    }

    product.quantity++;

    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// Teklif oluşturma endpointi
app.post('/transportDetails/offer', async (req, res) => {
  try {
    const { orderId, transporterId } = req.body;

    // Yeni bir TransportDetails belgesi oluştur
    const transportDetails = new TransportDetails({
      orderId,
      transporterId,
      isOfferAccept: false // Başlangıçta teklif kabul edilmiş olarak işaretlenir
    });

    // TransportDetails belgesini kaydet
    await transportDetails.save();

    // Sipariş belgesini bul ve transportDetailsId alanını güncelle
    await Order.findByIdAndUpdate(orderId, { transportDetailsId: transportDetails._id });

    res.status(201).send(transportDetails);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).send('Internal Server Error');
  }
});
// GET all transport details
app.get('/transportDetails/:transporterId', async (req, res) => {
  const transporterId = req.params.transporterId;
  try {
    const transportDetails = await TransportDetails.find({ transporterId });
    res.json(transportDetails);
  } catch (error) {
    console.error('Error fetching transport details by transporterId:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET endpoint for fetching transport details by transportDetailsId
app.get('/transportDetails/id/:transportDetailsId', async (req, res) => {
  try {
    const { transportDetailsId } = req.params;
    const transportDetails = await TransportDetails.findById(transportDetailsId);

    if (!transportDetails) {
      return res.status(404).json({ message: "Taşıma detayı bulunamadı." });
    }

    res.status(200).json({ transportDetails });
  } catch (error) {
    console.error('Error fetching transport details by transportDetailsId:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});
// DELETE request to remove transportDetailsId from order
app.delete('/orders/:orderId/removeTransportDetailsId', async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findByIdAndUpdate(orderId, { transportDetailsId: null }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error('Error removing transportDetailsId from order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT endpoint for updating offer acceptance status of an order
app.put('/transportDetails/update/isOfferAccept/:transportDetailsId', async (req, res) => {
  try {
    const { transportDetailsId } = req.params;
    const { isOfferAccept } = req.body;

    // Taşıma detaylarını bul ve teklif kabul durumunu güncelle
    const updatedTransportDetails = await TransportDetails.findByIdAndUpdate(transportDetailsId, { isOfferAccept }, { new: true });

    if (!updatedTransportDetails) {
      return res.status(404).json({ message: "Taşıma detayları bulunamadı." });
    }

    res.status(200).json({ message: "Teklif kabul durumu başarıyla güncellendi.", transportDetails: updatedTransportDetails });
  } catch (error) {
    console.error('Error updating offer acceptance status:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// Sipariş durumunu güncelleyen endpoint
app.put('/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    order.status = 'Kargoya Verildi';
    await order.save();

    res.json({ message: 'Sipariş durumu güncellendi', order });
  } catch (error) {
    console.error('Sipariş durumu güncellenirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sipariş durumunu güncelleyen endpoint
app.put('/orders/:orderId/lastStatus/', async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    order.status = 'Teslim Edildi';
    await order.save();

    res.json({ message: 'Sipariş durumu güncellendi', order });
  } catch (error) {
    console.error('Sipariş durumu güncellenirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.put('/singleOrder/:orderId/lastStatus', async (req, res) => {
  const { orderId } = req.params;

  try {
    // İlgili SingleOrder belgesini bul
    const singleOrder = await SingleOrder.findOne({ "orderIds.orderId": orderId });

    if (!singleOrder) {
      return res.status(404).json({ message: 'Single order not found' });
    }

    // Belirli orderId'e sahip SingleOrder belgesini güncelle
    singleOrder.orderIds.forEach(orderIdObj => {
      if (orderIdObj.orderId.toString() === orderId) {
        orderIdObj.status = 'Teslim Edildi'; // Durumu güncelle
      }
    });

    // SingleOrder belgesinin durumunu güncelle
    singleOrder.status = 'Teslim Edildi';

    // Güncellenmiş belgeyi kaydet
    const updatedSingleOrder = await singleOrder.save();

    res.status(200).json({ message: 'Status updated successfully', singleOrder: updatedSingleOrder });
  } catch (error) {
    console.error('Error updating status for single order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.put('/singleOrder/:orderId/status', async (req, res) => {
  const { orderId } = req.params;

  try {
    // İlgili SingleOrder belgesini bul
    const singleOrder = await SingleOrder.findOne({ "orderIds.orderId": orderId });

    if (!singleOrder) {
      return res.status(404).json({ message: 'Single order not found' });
    }

    // Belirli orderId'e sahip SingleOrder belgesini güncelle
    singleOrder.orderIds.forEach(orderIdObj => {
      if (orderIdObj.orderId.toString() === orderId) {
        orderIdObj.status = 'Kargoya Verildi'; // Durumu güncelle
      }
    });

    // SingleOrder belgesinin durumunu güncelle
    singleOrder.status = 'Kargoya Verildi';

    // Güncellenmiş belgeyi kaydet
    const updatedSingleOrder = await singleOrder.save();

    res.status(200).json({ message: 'Status updated successfully', singleOrder: updatedSingleOrder });
  } catch (error) {
    console.error('Error updating status for single order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Endpoint to add or update consumer ratings for producer
app.post('/users/:id/rateProducer', async (req, res) => {
  try {
    const userId = req.params.id;
    const { productQuality, reliability, serviceQuality } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    if (!user.qualityRating) {
      user.qualityRating = {}; // Eğer yoksa, önce oluşturun
    }
    

    const newRatingCount = (user.qualityRating && user.qualityRating.ratingCount || 0) + 1;
    if (newRatingCount == 1){
      user.qualityRating.productQuality = productQuality;
      user.qualityRating.reliability = reliability;
      user.qualityRating.serviceQuality = serviceQuality;
      user.qualityRating.ratingCount = newRatingCount;
    }else {
      user.qualityRating.productQuality = parseFloat(((productQuality + user.qualityRating.productQuality) / newRatingCount).toFixed(1));
      user.qualityRating.reliability = parseFloat(((reliability + user.qualityRating.reliability) / newRatingCount).toFixed(1));
      user.qualityRating.serviceQuality = parseFloat(((serviceQuality + user.qualityRating.serviceQuality) / newRatingCount).toFixed(1));      
      user.qualityRating.ratingCount = newRatingCount;
    }
    

    await user.save();

    res.send(user);
  } catch (error) {
    console.error('Error submitting producer rating:', error); // Log the error
    res.status(500).send(error.message);
  }
});


// Endpoint to add or update transporter ratings
app.post('/users/:id/rateTransporter', async (req, res) => {
  try {
    const userId = req.params.id;
    const { transportSpeed, longDistance, transportReliability } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    if (!user.qualityRating) {
      user.qualityRating = {}; // Eğer yoksa, önce oluşturun
    }
    

    const newRatingCount = (user.qualityRating && user.qualityRating.ratingCount || 0) + 1;
    if (newRatingCount == 1){
      user.qualityRating.transportSpeed = transportSpeed;
      user.qualityRating.longDistance = longDistance;
      user.qualityRating.transportReliability = transportReliability;
      user.qualityRating.ratingCount = newRatingCount;
    } else{
      user.qualityRating.transportSpeed = parseFloat(((transportSpeed + user.qualityRating.transportSpeed) / newRatingCount).toFixed(1));
      user.qualityRating.longDistance = parseFloat(((longDistance + user.qualityRating.longDistance) / newRatingCount).toFixed(1));
user.qualityRating.transportReliability = parseFloat(((transportReliability + user.qualityRating.transportReliability) / newRatingCount).toFixed(1));
      user.qualityRating.ratingCount = newRatingCount;
    }

    await user.save();

    res.send(user);
  } catch (error) {
    console.error('Error submitting transporter rating:', error); // Log the error
    res.status(500).send(error.message);
  }
});
