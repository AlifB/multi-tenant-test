const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  const { User } = require("../model/setupAssociations")("default_tenant");
  const name = req.body.name;
  const password = req.body.password;
  const db = require("../config/database");

  // sync default_tenant models
  db.sync({ alter: true }).then(() => {
    console.log("Database (default_tenant) & tables created!");
  });

  // find user with username
  User.findOne({ where: { name: name } })
    .then((user) => {
      // Handle user found
      // check if password is correct with bcrypt
      if (bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ user }, "your-secret-key", {
          expiresIn: "1h",
        });
        // save token in cookies
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/home");
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    })
    .catch((error) => {
      // Handle user not found
      console.log(error);
      res.status(401).json({ message: "User not found" });
    });
};

exports.register = (req, res) => {
  const { name, email, password, tenant } = req.body;
  const { User } = require("../model/setupAssociations")(tenant);

  if (!name || !email || !password || !tenant) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Hash password asynchronously
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error hashing password" });
    }

    // Create user with hashed password
    User.create({ name: name, email: email, password: hash, tenant: tenant })
      .then((user) => {
        res.status(201).redirect("/login");
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      });
  });
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect(`/login`);
};
