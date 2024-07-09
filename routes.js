const authMiddleware = require("./middlewares/auth");
const UserController = require("./controllers/userController");
const HomeController = require("./controllers/homeController");

const setupRoutes = (app) => {
  app.set("view engine", "ejs");
  app.set("views", "./views");

  app.get("/", (req, res) => {
    res.redirect("/home");
  });

  app.get("/login", (req, res) => {
    res.render("login");
  });

  app.post("/login", UserController.login);

  app.get("/register", async (req, res) => {
    // get all schemas
    const db = require("./config/database");
    const schemas = await db.showAllSchemas();
    // schema names as array
    const tenants = schemas.filter((schema) => schema.startsWith("tenant"));
    res.render("register", { tenants: tenants });
  });

  app.post("/register", UserController.register);

  app.get("/logout", UserController.logout);

  app.get("/home", authMiddleware, HomeController.home);

  app.post("/post", authMiddleware, HomeController.post);
};

module.exports = setupRoutes;
