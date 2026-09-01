const jwt = require('jsonwebtoken');


function authMiddleware(req, res, next) {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    res.locals.currentUser = null;
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
    res.locals.currentUser = req.user;
    return next();
  } catch (err) {
    res.clearCookie('token');
    res.locals.currentUser = null;
    return res.redirect('/login');
  }
}

function optionalAuth(req, res, next) {
  const token = req.cookies && req.cookies.token;
  res.locals.currentUser = null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
    res.locals.currentUser = req.user;
  } catch (err) {
    res.clearCookie('token');
  }

  return next();
}

module.exports = { authMiddleware, optionalAuth };
