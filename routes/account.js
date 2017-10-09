// This will contain all '/data/' routes

const express = require('express');
const auth = require('../config/auth.js');

const router = express.Router();

// router.use((req, res, next) => {
// res.locals.routeInfo = {
//   heroType: 'account',
//   route: `/account`,
//   user: req.user.username,
//   userName: req.user.username.charAt(0).toUpperCase() + req.user.username.slice(1),
//   partnerName: req.user.partner.charAt(0).toUpperCase() + req.user.partner.slice(1).toLowerCase()
// };
// res.locals.require = require;
// res.locals.today = today;
//   next();
// });

// Get Started Handling

router.get('/', auth.ensureAuthenticated, (req, res) => {
  res.render('account/index', {
    routeInfo: {
      heroType: 'twitter',
      route: '/account',
      user: req.user.username || null,
      userName: req.user.username.charAt(0).toUpperCase() + req.user.username.slice(1) || null,
      partnerName: req.user.partner.charAt(0).toUpperCase() + req.user.partner.slice(1).toLowerCase() || null
    }
  });
});

router.get('/requests', auth.ensureAuthenticated, (req, res) => {
  res.render('account/requests', {
    routeInfo: {
      heroType: 'twitter',
      route: '/account/requests',
      user: req.user.username || null,
      userName: req.user.username.charAt(0).toUpperCase() + req.user.username.slice(1) || null,
      partnerName: req.user.partner.charAt(0).toUpperCase() + req.user.partner.slice(1).toLowerCase() || null
    }
  });
});

module.exports = router;
