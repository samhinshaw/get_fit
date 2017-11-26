// This will contain all '/' routes

const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
const Moment = require('moment-timezone');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);

// Setup brute force prevention
const ExpressBrute = require('express-brute');
const MongooseStore = require('express-brute-mongoose');
const bruteForceSchema = require('express-brute-mongoose/dist/schema');

const model = mongoose.model('bruteforce', bruteForceSchema);
const store = new MongooseStore(model);

const failCallback = (req, res, next, nextValidRequestDate) => {
  req.flash(
    'danger',
    `You've made too many failed attempts in a short period of time, please try again ${moment(
      nextValidRequestDate
    ).fromNow()}`
  );
  res.redirect('/'); // brute force protection triggered, send them back to the main page
};

const bruteforce = new ExpressBrute(store, {
  failCallback
});

const User = require('../models/user');
// const auth = require('../config/auth.js');
const secretConfig = require('../config/secret_config.json');

const router = express.Router();

// Get Started Handling

// router.get('/', auth.ensureAuthenticated, (req, res) => {
//   res.render('landing_page');
// });

// Register Form Route
router.get('/register', (req, res) => {
  // If already logged in, reroute to landing_page
  if (res.locals.loggedIn) {
    res.redirect('/');
  } else {
    res.render('register', {
      routeInfo: {
        heroType: 'dark',
        route: `/register`,
        userName: null,
        partnerName: null
      }
    });
  }
});

// Login Form
router.get('/login', (req, res) => {
  // If already logged in, reroute to landing_page
  if (res.locals.loggedIn) {
    res.redirect('/');
  } else {
    res.render('login', {
      routeInfo: {
        heroType: 'dark',
        route: `/login`,
        userName: null,
        partnerName: null
      }
    });
  }
});

// Login Process
router.post('/login', bruteforce.prevent, (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/overview',
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
router.post('/register', bruteforce.prevent, (req, res) => {
  const firstname = req.sanitize(req.body.firstname);
  const lastname = req.sanitize(req.body.lastname);
  const username = req.sanitize(req.body.username);
  const email = req.sanitize(req.body.email);
  const partner = req.sanitize(req.body.partner);
  const fitnessGoal = req.sanitize(req.body.fitnessGoal);
  const mfp = req.sanitize(req.body.mfp);
  const accessCode = req.sanitize(req.body.accessCode);
  // Not sanitizing password for now, since we're salting & hashing it.
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  req.checkBody('firstname', 'Name is required').notEmpty();
  req.checkBody('lastname', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req
    .checkBody('email', 'Email is not valid')
    .isEmail()
    .trim()
    .normalizeEmail();
  req.checkBody('mfp', 'MyFitnessPal username is required').notEmpty();
  // In the future, make sure username is not taken!!
  req.checkBody('username', 'Username is required').notEmpty();
  // req.checkBody('partner', 'Partner is required').notEmpty();
  req.checkBody('accessCode', 'Access code is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('passwordConfirm', 'Passwords do not match').equals(req.body.password);
  console.log('You provided: ', accessCode);
  console.log('Store code is: ', secretConfig.registrationSecret);

  const errors = req.validationErrors();

  if (errors) {
    // Or handle errors with flash
    errors.forEach(error => {
      req.flash('danger', error.msg);
    });

    res.redirect('#');
    // temporarily hard-wiring adding access code
  } else if (accessCode !== secretConfig.registrationSecret) {
    req.flash('danger', 'Incorrect Access Code');
    res.redirect('#');
  } else {
    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      mfp,
      partner,
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
