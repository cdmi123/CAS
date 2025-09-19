module.exports = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).render('errors/404', {
      message: 'Not authorized as admin'
    });
  }
};