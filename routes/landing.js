// This will contain all '/' routes

const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');
// const auth = require('../config/auth.js');

const router = express.Router();

// Get Started Handling

// router.get('/', auth.ensureAuthenticated, (req, res) => {
//   res.render('landing_page');
// });

// Register Form Route
router.get('/register', (req, res) => {
  res.render('register');
});

// Login Form
router.get('/login', (req, res) => {
  res.render('login');
});

// Login Process
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Loogout option
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('info', 'Logged out');
  res.redirect('/');
});

// Handle Registration POSTS
router.post('/register', (req, res) => {
  const firstname = req.body.firstname.toLowerCase();
  const lastname = req.body.lastname.toLowerCase();
  const username = req.body.username;
  const email = req.body.email;
  const partner = req.body.partner;
  const calGoal = req.body.calGoal;
  const fitnessGoal = req.body.fitnessGoal;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  req.checkBody('firstname', 'Name is required').notEmpty();
  req.checkBody('lastname', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('calGoal', 'Calorie goal is required').notEmpty();
  // In the future, make sure username is not taken!!
  req.checkBody('username', 'Username is required').notEmpty();
  // req.checkBody('partner', 'Partner is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('passwordConfirm', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    // Handle errors within template...
    // res.render('register', {
    //   errors
    // });

    // Or handle errors with flash
    errors.forEach(error => {
      req.flash('danger', error.msg);
    });

    res.redirect('#');
  } else {
    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      partner,
      calGoal,
      fitnessGoal,
      password,
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
        newUser.save(saveErr => {
          if (saveErr) {
            console.log(saveErr);
          } else {
            req.flash('success', 'You are now registered!');
            res.redirect('/login');
          }
        });
      });
    });
  }
});

module.exports = router;
