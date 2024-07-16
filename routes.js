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

  app.get("/login", UserController.loginPage);

  app.post("/login", csrfValidation, UserController.login);

  app.get("/register", UserController.registerPage);

  app.post("/register", UserController.register);

  app.get("/logout", UserController.logout);

  app.get("/home", authMiddleware, HomeController.home);

  app.post("/post", authMiddleware, csrfValidation, HomeController.post);

  app.get(
    "/admin-panel",
    authMiddleware,
    checkRolesMiddleware(["admin"]),
    AdminController.adminPanelOverview
  );

  app.get(
    "/admin-panel/verification",
    authMiddleware,
    checkRolesMiddleware(["admin"]),
    AdminController.adminPanelVerification
  );

  app.get(
    "/admin-panel/posts",
    authMiddleware,
    checkRolesMiddleware(["admin"]),
    AdminController.adminPanelPosts
  )

  app.post(
    "/admin-panel/update-verified",
    authMiddleware,
    checkRolesMiddleware(["admin"]),
    csrfValidation,
    AdminController.updateVerified
  );

  app.post(
    "/admin-panel/delete-post",
    authMiddleware,
    checkRolesMiddleware(["admin"]),
    csrfValidation,
    AdminController.deletePost
  );
};

module.exports = setupRoutes;
