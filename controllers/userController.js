require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.loginPage = (req, res) => {
  try {
    res.render("login", {
      csrfToken: res.locals.csrfToken,
      errorMessage: req.flash("error"),
      infoMessage: req.flash("info"),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { User } = require("../model/setupAssociations")("default_tenant");
    const name = req.body.name;
    const password = req.body.password;
    const { db } = require("../config/database");

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
          const token = jwt.sign({ user }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });
          // save token in cookies
          res.cookie("token", token, { 
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === 'production',
            domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost' 
          });
          res.redirect("/home");
        } else {
          req.flash("error", "Invalid credentials");
          res.status(401).redirect("/login");
        }
      })
      .catch((error) => {
        // Handle user not found
        console.error(error);
        res.status(401).json({ message: "User not found" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.registerPage = async (req, res) => {
  try {
    // get all schemas
    const { db } = require("../config/database");
    const schemas = await db.showAllSchemas();
    // schema names as array
    const tenants = schemas.filter((schema) => schema.startsWith("tenant"));
    res.render("register", {
      tenants: tenants,
      csrfToken: res.locals.csrfToken,
      errorMessage: req.flash("error"),
      infoMessage: req.flash("info"),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.register = (req, res) => {
  try {
    const { name, email, password, tenant } = req.body;
    const { User } = require("../model/setupAssociations")(tenant);

    if (!name || !email || !password || !tenant) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Hash password asynchronously
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true });
    req.session.destroy();
    res.redirect(`/login`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
