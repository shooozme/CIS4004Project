const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(400).send(error);
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ _id: user._id }, 'your_jwt_secret', { expiresIn: '24h' });
    res.send({ token });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
