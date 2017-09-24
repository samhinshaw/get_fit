// This will contain all '/data/' routes

const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = express.Router();

// Bring in Date model

// Print in the page info we're using to style the page with Bulma
const pageInfo = {
  heroType: 'success',
  route: '/users'
  // user: ''
};

router.use((req, res, next) => {
  // res.locals.today = today;
  res.locals.pageInfo = pageInfo;
  // res.locals.require = require;
  next();
});

// Register Form Route
router.get('/', (req, res) => {
  res.render('users');
});

router.get('/register', (req, res) => {
  res.render('register');
});

// Login Form
router.get('/login', (req, res) => {
  res.render('login');
});

// Login Process

// Handle Registration POSTS
router.post('/register', (req, res) => {
  const name = req.body.name.toLowerCase();
  const email = req.body.email;
  const calGoal = req.body.calGoal;
  const username = req.body.username;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not value').isEmail();
  req.checkBody('calGoal', 'Calorie goal is required').notEmpty();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('passwordConfirm', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    // Handle errors within template...
    // res.render('register', {
    //   errors
    // });

    // Or handle errors with flash
    errors.forEach((error) => {
      req.flash('danger', error.msg);
    });

    res.redirect('#');
  } else {
    const newUser = new User({
      name,
      email,
      username,
      password,
      calGoal,
      currentPoints: 0
    });

    bcrypt.genSalt(10, (saltErr, salt) => {
      if (saltErr) {
        console.log(saltErr);
      }
      bcrypt.hash(newUser.password, salt, (hashErr, hash) => {
        if (hashErr) {
          console.log(hashErr);
        }
        newUser.password = hash;
        newUser.save((saveErr) => {
          if (saveErr) {
            console.log(saveErr);
          } else {
            req.flash('success', 'You are now registered!');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});

module.exports = router;
