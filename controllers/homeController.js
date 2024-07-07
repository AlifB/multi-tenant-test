const db = require("../config/database");

exports.home = async (req, res) => {

  // Sync tenant models
  db.sync({ alter: true }).then(() => {
    console.log(`Database (${req.user.tenant}) & tables created!`);
  });

  const { User, Post } = require("../model/setupAssociations")(req.user.tenant);

  // get user posts
  const user = await User.findOne({
    where: { id: req.user.id },
    include: [
      {
        model: Post,
        as: "posts",
      },
    ],
  });
  console.log(user);

  res.render("home", {
    name: req.user.name,
    tenant: req.user.tenant,
    posts: user.posts,
  });
};

exports.post = async (req, res) => {
  // Define tenant-specific models
  const { User, Post } = require("../model/setupAssociations")(req.user.tenant);

  // Create post in the tenant database
  const post = await Post.create({
    title: req.body.title,
    content: req.body.content,
    userId: req.user.id,
  });

  console.log(`Post created. Post ID: ${post.id}`);

  res.redirect("/home");
};
