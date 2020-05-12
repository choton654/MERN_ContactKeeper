const jwt = require('jsonwebtoken');
const config = require('config');

const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.json({ msg: 'There is no token for user' });
  jwt.verify(token, config.get('jwt_secret'), (err, data) => {
    if (err) return res.json({ msg: 'Authorization Denied' });
    req.user = data.user;
  });
  next();
};

module.exports = authMiddleware;
