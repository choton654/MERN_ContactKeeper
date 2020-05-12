const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const authMiddleware = require('../middleWare/authMiddleware');

router.get('/', authMiddleware, (req, res) => {
  const userID = req.user.id;
  User.findById(userID)
    .select('-password')
    .then((user) => {
      res.json(user);
    })
    .catch((err) => res.json({ msg: err }));
});
router.post(
  '/',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter 6 letter password').isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      User.findOne({ email })
        .then((user) => {
          if (!user) return res.json({ msg: 'Invalid User' });
          bcrypt.compare(password, user.password).then((result) => {
            if (!result) return res.json({ msg: 'Invalid Password' });
          });
          const payload = {
            user: {
              id: user.id,
            },
          };
          jwt.sign(
            payload,
            config.get('jwt_secret'),
            { expiresIn: 36000 },
            (err, token) => {
              if (err) throw err;
              res.json({ token });
            }
          );
        })
        .catch((err) => res.send(err));
    } catch (error) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
