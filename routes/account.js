// This will contain all '/data/' routes

const express = require('express');
const auth = require('../config/auth.js');

const router = express.Router();

// Bring in Date model

// Print in the page info we're using to style the page with Bulma
const pageInfo = {
  heroType: 'success',
  route: '/account'
  // user: ''
};

router.use((req, res, next) => {
  // res.locals.today = today;
  res.locals.pageInfo = pageInfo;
  // res.locals.require = require;
  next();
});

// Get Started Handling

router.get('/', auth.ensureAuthenticated, (req, res) => {
  res.render('account/index', {
    route: '/account'
  });
});

router.get('/requests', auth.ensureAuthenticated, (req, res) => {
  res.render('account/requests', {
    route: '/account/requests'
  });
});

module.exports = router;
