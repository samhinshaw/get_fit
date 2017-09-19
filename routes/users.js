// This will contain all '/data/' routes

const express = require('express');

const router = express.Router();

// Bring in Date model
const User = require('../models/user');

// Register Form Route
router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/login', (req, res) => {
  res.render('login');
});

module.exports = router;
