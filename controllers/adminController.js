exports.adminPanelOverview = async (req, res) => {
  try {
    res.render("adminpanel", {
      isAdmin: req.user.roles.includes("admin"),
      path: req.path,
      errorMessage: req.flash("error"),
      infoMessage: req.flash("info"),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.adminPanelVerification = async (req, res) => {
  try {
    const { User } = require("../model/setupAssociations")("default_tenant");

    const users = await User.findAll({
      order: [["name", "ASC"]],
    });

    res.render("adminpanelverify", {
      isAdmin: req.user.roles.includes("admin"),
      path: req.path,
      users: users,
      currentUser: req.user,
      csrfToken: res.locals.csrfToken,
      errorMessage: req.flash("error"),
      infoMessage: req.flash("info"),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.adminPanelPosts = async (req, res) => {
  try {
    const { db } = require("../config/database");
    const schemas = await db.showAllSchemas();
    // schema names as array
    const tenants = schemas.filter((schema) => schema.startsWith("tenant"));

    //get all posts from all tenants
    const posts = [];
    for (const tenant of tenants) {
      const { Post, User } = require("../model/setupAssociations")(tenant);
      const tenantPosts = await Post.findAll({
        include: [
          {
            model: User,
            as: "user",
          },
        ],
      });
      posts.push(...tenantPosts);
    }

    // sorts psots by createdAt in descending order
    posts.sort((a, b) => b.createdAt - a.createdAt);

    return res.render("adminpanelposts", {
      isAdmin: req.user.roles.includes("admin"),
      path: req.path,
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

// responds in json format
exports.updateVerified = async (req, res) => {
  const { User } = require("../model/setupAssociations")("default_tenant");
  try {
    // userId has to be a number and verified has to be a boolean
    const { userId, verified } = req.body;
    // check if userId is a number and verified is a boolean
    if (isNaN(userId) || typeof verified !== "boolean") {
      res.status(400).json({ message: "Invalid request" });
      return;
    }

    if (req.user.id == userId) {
      res
        .status(403)
        .json({ message: "You cannot update your own verified status" });
      return;
    }

    // update user
    await User.update({ verified: verified }, { where: { id: userId } });

    res.status(200).json({
      message: `User verified status updated successfully to ${verified}`,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId, tenant } = req.body;

    if (isNaN(postId)) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }

    if (!/^tenant\d+$/.test(tenant)) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }

    const { Post } = require("../model/setupAssociations")(tenant);

    await Post.destroy({ where: { id: postId } });

    res.status(200).json({
      message: `Post deleted successfully`,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
