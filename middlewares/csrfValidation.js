exports.csrfValidation = (req, res, next) => {
  const token = req.session.csrfToken;
  const csrfToken = req.body._csrf;

  if (!token || !csrfToken || token !== csrfToken) {
    req.session.csrfToken = null;
    req.flash("error", "CSRF token is invalid or missing. Please try again.");
    //redirect to original url if it is a get request
    if (req.method === "GET") {
      return res.status(403).redirect(req.originalUrl);
    } else {
      return res.status(403).redirect("/home");
    }
  }

  next();
};
