const { db } = require("../config/database");

exports.home = async (req, res) => {
  try {
    db.sync({ alter: true }).then(() => {
      console.log(`Database (${req.user.tenant}) & tables created!`);
    });

    const { User, Post } = require("../model/setupAssociations")(
      req.user.tenant
    );

    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    return res.render("home", {
      isAdmin: req.user.roles.includes("admin"),
      path: req.path,
      name: req.user.name,
      tenant: req.user.tenant,
      isAdmin: req.user.roles.includes("admin"),
      posts: posts,
      csrfToken: res.locals.csrfToken,
      errorMessage: req.flash("error"),
      infoMessage: req.flash("info"),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.post = async (req, res) => {
  try {
    // Define tenant-specific models
    const { User, Post } = require("../model/setupAssociations")(
      req.user.tenant
    );

    // Create post in the tenant database
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      userId: req.user.id,
    });

    console.log(`Post created. Post ID: ${post.id}`);
    req.flash("info", "Post created successfully!");
    res.redirect("/home");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
