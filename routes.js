const authMiddleware = require("./middlewares/auth");
const UserController = require("./controllers/userController");
const HomeController = require("./controllers/homeController");
const AdminController = require("./controllers/adminController");
const { csrfValidation } = require("./middlewares/csrfValidation");
const { checkRolesMiddleware } = require("./middlewares/roles");

const setupRoutes = (app) => {
  app.set("view engine", "ejs");
  app.set("views", "./views");

  app.get("/", (req, res) => {
    res.redirect("/home");
  });

  app.get("/login", (req, res) => {
    try {
      res.render("login", { csrfToken: res.locals.csrfToken, errorMessage: req.flash("error"), infoMessage: req.flash("info") });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/login", csrfValidation, UserController.login);

  app.get("/register", async (req, res) => {
    try {
      // get all schemas
      const db = require("./config/database");
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
  });

  app.post("/register", UserController.register);

  app.get("/logout", UserController.logout);

  app.get("/home", authMiddleware, HomeController.home);

  app.post("/post", authMiddleware, csrfValidation, HomeController.post);

  app.get(
    "/admin-panel",
    authMiddleware,
    checkRolesMiddleware(["admin"]),
    AdminController.adminPanel
  );

  app.post(
    "/admin-panel/update-verified",
    authMiddleware,
    checkRolesMiddleware(["admin"]),
    csrfValidation,
    AdminController.updateVerified
  );
};

module.exports = setupRoutes;
