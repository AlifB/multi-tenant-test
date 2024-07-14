exports.checkRolesMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).redirect("/login");
    }

    for (let role of allowedRoles) {
      if (req.user.roles.includes(role)) {
        return next();
      }
    }

    return res.status(403).json({ message: "Forbidden" });
  };
};
