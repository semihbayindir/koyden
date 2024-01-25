const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
const port = 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
const jwt = require("jsonwebtoken");



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
// const Message = require("./models/message");

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

const Product = require("./models/product");


// ÜRÜN EKLEME
app.post("/products", (req, res) => {
  const { name, description, images, category, qty, minQty, price } = req.body;

  const newProduct = new Product({ name, description, images, category, qty, minQty, price  });

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
