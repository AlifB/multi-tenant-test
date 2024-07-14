exports.adminPanel = async (req, res) => {
  const { User } = require("../model/setupAssociations")("default_tenant");

  // get all users in ascending name order
  const users = await User.findAll(
    {
      order: [["name", "ASC"]],
    }
  );

  res.render("adminPanel", {
    users: users,
    currentUser: req.user,
    csrfToken: res.locals.csrfToken,
    errorMessage: req.flash("error"),
    infoMessage: req.flash("info"),
  });
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
      res.status(403).json({ message: "You cannot update your own verified status" });
      return;
    }

    // update user
    await User.update({ verified: verified }, { where: { id: userId } });

    res.status(200).json({ message: `User verified status updated successfully to ${verified}` });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
