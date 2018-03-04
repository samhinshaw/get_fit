// Access Control
// We can add this to ANY route we want to protect
export default function ensureAuthenticated(req, res, next) {
  // Because we're using passport, we can check the req for isAuthenticated();
  if (req.isAuthenticated()) {
    // and if auth, continue as normal
    return next();
  }
  // otherwise, redirect to landing page!
  req.flash('danger', 'Please login.');
  res.redirect('/login');
  return true;
}
