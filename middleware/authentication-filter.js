module.exports = {
  /**
   * Filter endpoints thats need to be logged in
   * @param req
   * @param res
   * @param next
   */
  loggedIn: function (req, res, next) {
    if (req.user) {
      next();
    } else {
      res.redirect('/login');
    }
  },
  /**
   * Filters endpoint that you dont have to be authenticated
   * @param req
   * @param res
   * @param next
   */
  notLoggedIn: function (req, res, next) {
    if (req.user) {
      res.redirect('/');
    } else {
      next();
    }
  }
};