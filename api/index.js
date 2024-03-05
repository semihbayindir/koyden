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

const Product = require("./models/product");


// ÜRÜN EKLEME
app.post("/products", (req, res) => {
  const { name, description, images, category, qty, minQty, price,producerId } = req.body;

  const newProduct = new Product({ name, description, images, category, qty, minQty, price,producerId  });

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

// Ürün eklemek için PUT isteği
app.put('/cart/add/:userId', async (req, res) => {
  const { productId } = req.body;
  const userId = req.params.userId;
  try {
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      cart = new Cart({ userId: userId, products: [] });
    }
    const existingProductIndex = cart.products.findIndex(item => item.productId === productId);
    if (existingProductIndex !== -1) {
      // Ürün sepette zaten var, miktarını arttır
      cart.products[existingProductIndex].quantity++;
    } else {
      // Yeni ürünü sepete ekle
      cart.products.push({ productId: productId, quantity: 1 });
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
    const { userId, producerId, products, totalPrice, from, to } = req.body;

    const newOrder = new SingleOrder({
      userId,
      producerId,
      products,
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

const SingleOrder = require('./models/singleOrder');
app.post('/singleOrders/create', async (req, res) => {
  try {
    const { userId, producerId, products, totalPrice, from, to } = req.body;

    const newOrder = new SingleOrder({
      userId,
      producerId,
      products,
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
//Sipariş Oluşturma (Tüketici tarafı):
app.post('/orders/create', async (req, res) => {
  try {
    const { userId, producerId, products, totalPrice, offer, isOfferAccept, from, to } = req.body;

    const newOrder = new Order({
      userId,
      producerId,
      products,
      totalPrice,
      offer,
      isOfferAccept,
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

// Ürünü sepette bulunan kullanıcının sepetinden silmek için DELETE isteği
app.delete('/cart/:userId/product/:productId', async (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.productId;
  try {
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const productIndex = cart.products.findIndex(item => item.productId === productId);
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




