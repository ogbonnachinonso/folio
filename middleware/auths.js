module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    } else {
      req.flash("error_msg", "Please Login in fisrt to access this page");
      res.redirect('/login')
    }

  },
  ensureGuest: function (req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard')
    }else {
      req.flash("error_msg", "Please Login in fisrt to access this page");
      return next()
    }
  },
}