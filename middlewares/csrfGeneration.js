const crypto = require("crypto");

exports.csrfGeneration = (req, res, next) => {
  if (!req.session.csrfToken) {
    const csrfToken = crypto.randomBytes(64).toString("hex");
    req.session.csrfToken = csrfToken;
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};
