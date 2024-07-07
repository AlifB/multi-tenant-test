const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const authMiddleware = require("./middlewares/auth");
const UserController = require("./controllers/userController");
const HomeController = require("./controllers/homeController");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/:tenantId/login", (req, res) => {
  const tenantId = req.params.tenantId;
  if (tenantId.match(/^[a-zA-Z0-9]+$/)) {
    res.render("login", { tenantId: tenantId });
  } else {
    res.status(400).json({ message: "Invalid tenantId" });
  }
});

app.post("/:tenantId/login", (req, res) => {
  const tenantId = req.params.tenantId;
  // check if tenantid valid
  if (tenantId.match(/^[a-zA-Z0-9]+$/)) {
    UserController.login(tenantId, req, res);
  } else {
    res.status(400).json({ message: "Invalid tenantId" });
  }
});

app.get("/:tenantId/register", (req, res) => {
  const tenantId = req.params.tenantId;
  if (tenantId.match(/^[a-zA-Z0-9]+$/)) {
    res.render("register", { tenantId: tenantId });
  } else {
    res.status(400).json({ message: "Invalid tenantId" });
  }
});

app.post("/:tenantId/register", (req, res) => {
  const tenantId = req.params.tenantId;
  if (tenantId.match(/^[a-zA-Z0-9]+$/)) {
    UserController.register(tenantId, req, res);
  } else {
    res.status(400).json({ message: "Invalid tenantId" });
  }
});

app.get("/logout", authMiddleware, UserController.logout);

app.get("/home", authMiddleware, HomeController.home);

app.post("/post", authMiddleware, HomeController.post);

module.exports = app;
