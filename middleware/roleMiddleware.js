
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/login');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).render('forbidden', {
        title: 'Forbidden',
        message: 'You do not have permission to access this page.'
      });
    }

    return next();
  };
}

module.exports = { requireRole };
