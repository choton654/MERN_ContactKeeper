const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleWare/authMiddleware');
const { check, validationResult } = require('express-validator');
const Contact = require('../models/Contacts');

router.get('/', authMiddleware, (req, res) => {
  Contact.find({ user: req.user.id })
    .sort({ date: -1 })
    .then((contacts) => res.send(contacts))
    .catch((err) => {
      console.log(err);
      res.status(500).send('server error');
    });
});

router.post(
  '/',
  [
    authMiddleware,
    check('name', 'Please enter a name').not().isEmpty(),
    check('name', 'Please enter a name').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { name, email, phone, type } = req.body;
    const newContact = await new Contact({
      name,
      email,
      phone,
      type,
      user: req.user.id,
    });
    await newContact.save();
    res.json(newContact);
  }
);

router.put('/:id', authMiddleware, (req, res) => {
  const { name, email, phone, type } = req.body;
  const contactFields = {};
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  try {
    Contact.findById(req.params.id).then((contact) => {
      if (contact.user.toString() === req.user.id) {
        Contact.findByIdAndUpdate(
          req.params.id,
          { $set: contactFields },
          { new: true }
        )
          .then((contact) => res.json(contact))
          .catch(() => res.status(404).json({ msg: 'Contact not found' }));
      } else {
        return res.status(404).json({ msg: 'Invalid user' });
      }
    });
  } catch (error) {
    res.status(404).json(error);
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  Contact.findById(req.params.id)
    .then((contact) => {
      if (contact.user.toString() === req.user.id) {
        Contact.findByIdAndDelete(req.params.id)
          .then(() => res.json({ msg: 'contact deleted' }))
          .catch(() => res.status(500).json({ msg: 'Contact not found' }));
      } else {
        return res.status(404).json({ msg: 'Invalid user' });
      }
    })
    .catch(() => res.status(500).json({ msg: 'Server error' }));
});

module.exports = router;
