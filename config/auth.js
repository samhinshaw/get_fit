// Access Control
// We can add this to ANY route we want to protect
const ensureAuthenticated = (req, res, next) => {
  // Because we're using passport, we can check the req for isAuthenticated();
  if (req.isAuthenticated()) {
    // and if auth, continue as normal
    return next();
  }
  // otherwise, redirect to landing page!
  req.flash('danger', 'Please login.');
  res.redirect('/account/login');
  return true;
};

module.exports = {
  ensureAuthenticated
};
