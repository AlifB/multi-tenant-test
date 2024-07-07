const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.login = async (tenantId, req, res) => {
  console.log(req.body);
  const { User } = require("../model/setupAssociations")(tenantId);
  const name = req.body.name;
  const password = req.body.password;

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

exports.register = (tenantId, req, res) => {
  const { name, email, password } = req.body;
  const tenant = "tenant1";
  const { User } = require("../model/setupAssociations")("tenant1");

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
  const tenant = req.user.tenant;
  res.clearCookie("token");
  res.redirect(`/${tenant}/login`);
};
