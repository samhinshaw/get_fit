// This will contain all '/data/' routes

const express = require('express');
const auth = require('../config/auth.js');
const request = require('request');
const Request = require('../models/request');
// const flash = require('connect-flash');

const router = express.Router();

// Define Async middleware wrapper to avoid try-catch
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const configureIFTTT = (user, requestType) => {
  const configOptions = {
    url: `https://maker.ifttt.com/trigger/${requestType}/with/key/JCavOg5Om_uGsh0R6McOC`,
    method: 'POST',
    headers: {
      // 'User-Agent': 'Super Agent/0.0.1',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: { value1: user }
  };
  return configOptions;
};

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
      partnerName:
        req.user.partner.charAt(0).toUpperCase() + req.user.partner.slice(1).toLowerCase() || null
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
      partnerName:
        req.user.partner.charAt(0).toUpperCase() + req.user.partner.slice(1).toLowerCase() || null
    }
  });
});

// Receive AJAX response to request
router.post('/requests/respond', auth.ensureAuthenticated, (req, res) => {
  // Pull up request entry in DB
  // Note: Model.findByIdAndUpdate() is specifically for when we need the found
  // document returned as well.
  Request.update(
    { _id: req.body.id },
    {
      $set: {
        status: req.body.type,
        responseMessage: req.body.message
      }
    },
    err => {
      if (err) {
        console.log(err);
        req.flash('danger', 'Error saving response. Please try again.');
        res.redirect('/account/requests');
      } else {
        // If saved, send request via IFTTT
        request(
          // this function will return our configuration object with
          configureIFTTT(
            req.user.username.charAt(0).toUpperCase() + req.user.username.slice(1),
            'request_response'
          ),
          (error, response) => {
            // (error, response, body)
            if (error) {
              console.log('ERROR:');
              console.log(error);
              req.flash('danger', 'Error sending response. Please try again.');
              res.redirect('/account/requests');
            } else if (!error && response.statusCode === 200) {
              // Print out the response body
              // console.log(body);
              console.log('Message Sent');
              req.flash('success', 'Response sent!');
              res.redirect('/account/requests');
            }
          }
        );
      }
    }
  );
});

module.exports = router;
