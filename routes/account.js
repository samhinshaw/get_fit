// This will contain all '/data/' routes

const express = require('express');
const auth = require('../config/auth.js');
const request = require('request');
const _ = require('lodash');
const moment = require('moment-timezone');

const Request = require('../models/request');
const Reward = require('../models/reward');
// const flash = require('connect-flash');

// Bring in config files
const iftttToken = require('../config/ifttt.json');

// moment().format(); // required by package entirely

const router = express.Router();

// Define Async middleware wrapper to avoid try-catch
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Call this function with 3 options:
// user: the currently logged in user sending the request
// partnerToken: your partner's IFTTT token (to send THEM an SMS)
// messageType: is this a request or a response to a request?
const configureIFTTT = ({ user, partnerToken, messageType }) => {
  const configOptions = {
    url: `https://maker.ifttt.com/trigger/${messageType}/with/key/${partnerToken}`,
    method: 'POST',
    headers: {
      // 'User-Agent': 'Super Agent/0.0.1',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: { value1: user }
  };
  return configOptions;
};

// Get Started Handling

router.get('/', auth.ensureAuthenticated, (req, res) => {
  res.render('account/index', {
    routeInfo: {
      heroType: 'twitter',
      route: '/account',
      userName:
        res.locals.user.firstname.charAt(0).toUpperCase() + res.locals.user.firstname.slice(1) ||
        null,
      userLastName:
        res.locals.user.lastname.charAt(0).toUpperCase() + res.locals.user.lastname.slice(1) ||
        null,
      partnerName:
        res.locals.partner.firstname.charAt(0).toUpperCase() +
          res.locals.partner.firstname.slice(1).toLowerCase() || null,
      partnerLastName:
        res.locals.partner.lastname.charAt(0).toUpperCase() +
          res.locals.partner.lastname.slice(1).toLowerCase() || null
    }
  });
});

router.get('/spend', auth.ensureAuthenticated, (req, res) => {
  Reward.find({ for: res.locals.user.username }, (err, rewards) => {
    if (err) {
      console.log(err);
    }
    const sortedRewards = _.orderBy(rewards, 'cost', 'asc');
    res.render('account/spend', {
      rewards: sortedRewards,
      routeInfo: {
        heroType: 'twitter',
        route: '/account/spend',
        userName:
          res.locals.user.firstname.charAt(0).toUpperCase() + res.locals.user.firstname.slice(1),
        partnerName:
          res.locals.partner.firstname.charAt(0).toUpperCase() +
          res.locals.partner.firstname.slice(1).toLowerCase()
      }
    });
  });
});

router.post(
  '/spend',
  auth.ensureAuthenticated,
  asyncMiddleware(async (req, res) => {
    const rewardKey = req.sanitize('reward').trim();

    const query = {
      key: rewardKey
    };
    // Pull up reward entry in DB
    const rewardEntry = await Reward.findOne(query, (err, reward) => {
      if (err) {
        console.log(err);
      }
      return reward;
    });

    if (rewardEntry.cost > res.locals.pointTally.user) {
      req.flash('danger', 'Not enough points!');
      res.redirect('/account/spend');
      return;
    }

    const newRequest = new Request({
      reward: rewardKey,
      displayName: rewardEntry.displayName,
      pointCost: rewardEntry.cost,
      requester: res.locals.user.username, // replace with session
      requestMessage: req.sanitize('message').trim(),
      timeRequested: moment.tz('US/Pacific').toDate(),
      status: 'unapproved'
    });

    newRequest.save(saveErr => {
      if (saveErr) {
        console.log(saveErr);
      } else {
        // If saved, send request via IFTTT
        request(
          // this function will return our configuration object with
          configureIFTTT({
            user:
              res.locals.user.firstname.charAt(0).toUpperCase() +
              res.locals.user.firstname.slice(1),
            partnerToken: iftttToken[res.locals.partner.username].token,
            messageType: 'reward_request'
          }),
          (error, response) => {
            // (error, response, body)
            if (error) {
              console.log('ERROR:');
              console.log(error);
            } else if (!error && response.statusCode === 200) {
              // Print out the response body
              // console.log(body);
              req.flash('success', 'Request sent! Points deducted from your account.');
              res.redirect('/account/spend');
            }
          }
        );
      }
    });
  })
);

router.get('/send', auth.ensureAuthenticated, (req, res) => {
  Reward.find({ for: res.locals.partner.username }, (err, rewards) => {
    if (err) {
      console.log(err);
    }
    const sortedRewards = _.orderBy(rewards, 'cost', 'asc');
    res.render('account/send', {
      rewards: sortedRewards,
      routeInfo: {
        heroType: 'twitter',
        route: '/account/send',
        userName:
          res.locals.user.firstname.charAt(0).toUpperCase() + res.locals.user.firstname.slice(1),
        partnerName:
          res.locals.partner.firstname.charAt(0).toUpperCase() +
          res.locals.partner.firstname.slice(1).toLowerCase()
      }
    });
  });
});

router.get('/send', auth.ensureAuthenticated, (req, res) => {
  // Reward.find({ for: res.locals.user.username }, (err, rewards) => {
  //   if (err) {
  //     console.log(err);
  //   }
  //   const sortedRewards = _.orderBy(rewards, 'cost', 'asc');
  res.render('account/send', {
    // rewards: sortedRewards,
    routeInfo: {
      heroType: 'twitter',
      route: '/account/send',
      userName:
        res.locals.user.firstname.charAt(0).toUpperCase() + res.locals.user.firstname.slice(1),
      partnerName:
        res.locals.partner.firstname.charAt(0).toUpperCase() +
        res.locals.partner.firstname.slice(1).toLowerCase()
    }
  });
  // });
});

router.get('/requests', auth.ensureAuthenticated, (req, res) => {
  // Our requests are pulled in via middleware in app.js so we can display the #
  // of pending requests badge on your account info button in the navbar.
  // Therefore, they do not need to be passed through here, and can be pulled
  // directly from res.locals
  res.render('account/requests', {
    routeInfo: {
      heroType: 'twitter',
      route: '/account/requests',
      userName:
        res.locals.user.firstname.charAt(0).toUpperCase() + res.locals.user.firstname.slice(1) ||
        null,
      partnerName:
        res.locals.partner.firstname.charAt(0).toUpperCase() +
          res.locals.partner.firstname.slice(1).toLowerCase() || null
    }
  });
});

// Receive AJAX response to request
router.post('/requests/respond', auth.ensureAuthenticated, (req, res) => {
  // Pull up request entry in DB
  // Note: Model.findByIdAndUpdate() is specifically for when we need the found
  // document returned as well.
  Request.update(
    { _id: req.sanitize('id').trim() },
    {
      $set: {
        status: req.sanitize('type').trim(),
        responseMessage: req.sanitize('message').trim(),
        timeResponded: moment.tz('US/Pacific').toDate()
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
          configureIFTTT({
            user:
              res.locals.user.firstname.charAt(0).toUpperCase() +
              res.locals.user.firstname.slice(1),
            partnerToken: iftttToken[res.locals.partner.username].token,
            messageType: 'request_response'
          }),
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

router.get('/history', auth.ensureAuthenticated, (req, res) => {
  Request.find(
    {
      requester: res.locals.user.username,
      status: ['approved', 'denied']
    },
    (err, requests) => {
      if (err) {
        console.log(err);
      }
      // If we get the results back, reorder the dates
      const sortedRequests = _.orderBy(requests, 'timeResponded', 'desc');
      res.render('account/history', {
        approvedRequests: sortedRequests,
        routeInfo: {
          heroType: 'twitter',
          route: '/account/history',
          userName:
            res.locals.user.firstname.charAt(0).toUpperCase() +
              res.locals.user.firstname.slice(1) || null,
          partnerName:
            res.locals.partner.firstname.charAt(0).toUpperCase() +
              res.locals.partner.firstname.slice(1).toLowerCase() || null
        }
      });
    }
  );
});

module.exports = router;
