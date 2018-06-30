// This will contain all '/account/' routes

import express from 'express';
import request from 'request';
import _ from 'lodash';
import Moment from 'moment-timezone';
import { extendMoment } from 'moment-range';

import ensureAuthenticated from '../methods/auth';

import logger from '../methods/logger';
import Request from '../models/request';
import Reward from '../models/reward';
import Period from '../models/period';
// import Gift from '../models/gift';
import User from '../models/user';
import Entry from '../models/entry';
// const flash = require('connect-flash');
const moment = extendMoment(Moment);

// Bring in config files

// moment().format(); // required by package entirely
const iftttToken = require('../../config/secret/ifttt.json');

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

router.get('/', ensureAuthenticated, (req, res) => {
  res.render('account/index', {
    routeInfo: {
      heroType: 'twitter',
      route: '/account'
    }
  });
});
router.post('/', ensureAuthenticated, (req, res) => {
  const userObject = {};

  // console.log('pre-validation name: ', firstname);
  let firstname = req.sanitize('firstname').trim();
  firstname = firstname !== '' ? firstname : null;

  if (firstname) userObject.firstname = firstname;

  let lastname = req.sanitize('lastname').trim();
  lastname = lastname !== '' ? lastname : null;

  if (lastname) userObject.lastname = lastname;
  // const username = req.sanitize('username').trim();
  // const email = req.sanitize('email').trim();
  // req
  // .checkBody('email', 'Email is not valid')
  // .isEmail()
  // .trim()
  // .normalizeEmail();
  let fitnessGoal = req.sanitize('fitness-goal').trim();
  fitnessGoal = fitnessGoal !== '' ? fitnessGoal : null;
  if (fitnessGoal) userObject.fitnessGoal = fitnessGoal;

  let startDate = req.sanitize('start-date').trim();
  startDate = startDate !== '' ? startDate : null;
  if (startDate) userObject.startDate = startDate;

  let mfp = req.sanitize('mfp').trim();
  mfp = mfp !== '' ? mfp : null;
  if (mfp) userObject.mfp = mfp;

  // let currentPoints = req.sanitize('current-points').trim();
  // currentPoints = currentPoints !== '' ? currentPoints : null;
  // if (currentPoints) userObject.currentPoints = currentPoints;

  // const weight = req.sanitize('weight').trim();
  // const calorieGoal = req.sanitize('calorie-goal').trim();

  User.findOneAndUpdate(
    { username: req.user.username },
    {
      $set: userObject
    },
    err => {
      if (err) {
        req.flash('danger', 'Oops, there was an error updating your settings!');
        res.redirect('#');
      }
      req.flash('success', 'Settings successfully updated!');
      res.redirect('#');
    }
  );
});

router.get('/spend', ensureAuthenticated, (req, res) => {
  Reward.find({ for: res.locals.user.username }, (err, rewards) => {
    if (err) {
      logger.error(err);
    }
    const sortedRewards = _.orderBy(rewards, 'cost', 'asc');
    res.render('account/spend', {
      moment,
      rewards: sortedRewards,
      routeInfo: {
        heroType: 'twitter',
        route: '/account/spend'
      }
    });
  });
});

router.post(
  '/spend',
  ensureAuthenticated,
  asyncMiddleware(async (req, res) => {
    const rewardKey = req.sanitize('reward').trim();

    const query = {
      key: rewardKey
    };
    // Pull up reward entry in DB
    const rewardEntry = await Reward.findOne(query, (err, reward) => {
      if (err) {
        logger.error(err);
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
        logger.error(saveErr);
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
              logger.error(error);
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

// router.get('/send', ensureAuthenticated, (req, res) => {
//   Reward.find({ for: res.locals.partner.username }, (err, rewards) => {
//     if (err) {
//       logger.error(err);
//     }
//     const sortedRewards = _.orderBy(rewards, 'cost', 'asc');
//     res.render('account/send', {
//       moment,
//       rewards: sortedRewards,
//       routeInfo: {
//         heroType: 'twitter',
//         route: '/account/send'
//       }
//     });
//   });
// });

// Receive POST request
// router.post(
//   '/send',
//   asyncMiddleware(async (req, res) => {
//     let rewardKey;
//     let rewardEntry;
//     if (req.params.reward) {
//       rewardKey = req.sanitize('reward').trim();

//       const query = {
//         key: rewardKey
//       };

//       // Pull up reward entry in DB
//       rewardEntry = await Reward.findOne(query, (err, reward) => {
//         if (err) {
//           logger.error(err);
//         }
//         return reward;
//       });
//     }

//     // If these values exist, assign them, otherwise use 'null'
//     const newGift = new Gift({
//       reward: rewardKey || null,
//       displayName: rewardEntry.displayName || null,
//       points: req.sanitize('message').trim() || null,
//       sender: res.locals.user.username, // replace with session
//       timeSent: moment.tz('US/Pacific').toDate(),
//       message: req.sanitize('message').trim() || null
//     });

//     // Pull up request entry in DB
//     // Note: Model.findByIdAndUpdate() is specifically for when we need the found
//     // document returned as well.
//     newGift.save(saveErr => {
//       if (saveErr) {
//         logger.error(saveErr);
//       } else {
//         // If saved, send request via IFTTT
//         request(
//           // this function will return our configuration object with
//           configureIFTTT({
//             user:
//               res.locals.user.firstname.charAt(0).toUpperCase() +
//               res.locals.user.firstname.slice(1),
//             partnerToken: iftttToken[res.locals.partner.username].token,
//             messageType: 'gift'
//           }),
//           (error, response) => {
//             // (error, response, body)
//             if (error) {
//               logger.error(error);
//               req.flash('danger', 'Oops, there was an error sending your gift!');
//               res.redirect('/account/send');
//             } else if (!error && response.statusCode === 200) {
//               // Print out the response body
//               // console.log(body);
//               req.flash('success', 'Gift sent!');
//               res.redirect('/account/send');
//             }
//           }
//         );
//       }
//     });
//   })
// );

router.get('/requests', ensureAuthenticated, (req, res) => {
  // Our requests are pulled in via middleware in app.js so we can display the #
  // of pending requests badge on your account info button in the navbar.
  // Therefore, they do not need to be passed through here, and can be pulled
  // directly from res.locals
  res.render('account/requests', {
    moment,
    routeInfo: {
      heroType: 'twitter',
      route: '/account/requests'
    }
  });
});

router.get('/exercises', ensureAuthenticated, (req, res) => {
  res.render('account/exercises', {
    _,
    routeInfo: {
      heroType: 'twitter',
      route: '/account/exercises'
    }
  });
});

// Receive AJAX response to request
router.post('/requests/respond', ensureAuthenticated, (req, res) => {
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
        logger.error(err);
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
              logger.error(error);
              req.flash('danger', 'Error sending response. Please try again.');
              res.redirect('/account/requests');
            } else if (!error && response.statusCode === 200) {
              // Print out the response body
              // console.log(body);
              req.flash('success', 'Response sent!');
              res.redirect('/account/requests');
            }
          }
        );
      }
    }
  );
});

router.get(
  '/history',
  ensureAuthenticated,
  asyncMiddleware(async (req, res) => {
    const requests = await Request.find(
      {
        requester: res.locals.user.username,
        status: ['approved', 'denied']
      },
      (err, response) => {
        if (err) {
          logger.error(err);
        }
        return response;
      }
    );

    // const gifts = await Gift.find(
    //   {
    //     sender: res.locals.partner.username
    //   },
    //   (err, response) => {
    //     if (err) {
    //       logger.error(err);
    //     }
    //     return response;
    //   }
    // );

    // For this, since we're simply showing ALL, we can merge requests and gifts
    // const history = requests.concat(gifts);
    const history = requests;

    // If we get the results back, reorder the dates
    let sortedHistory;
    if (history.length > 0) {
      sortedHistory = _.orderBy(history, 'timeResponded', 'desc');
    } else {
      sortedHistory = []; // same as sortedHistory = history
    }

    // Render Page
    res.render('account/history', {
      approvedRequests: sortedHistory,
      moment,
      routeInfo: {
        heroType: 'twitter',
        route: '/account/history'
      }
    });
  })
);

router.get('/delete', ensureAuthenticated, (req, res) => {
  // Our requests are pulled in via middleware in app.js so we can display the #
  // of pending requests badge on your account info button in the navbar.
  // Therefore, they do not need to be passed through here, and can be pulled
  // directly from res.locals
  res.render('account/delete', {
    moment,
    routeInfo: {
      heroType: 'twitter',
      route: '/account/delete'
    }
  });
});

router.post(
  '/delete',
  ensureAuthenticated,
  asyncMiddleware(async (req, res, next) => {
    const confirmation = req.sanitize('confirm').trim();
    if (confirmation !== res.locals.user.username) {
      req.flash('danger', 'The input you supplied does not match your username!');
      res.redirect('#');
      // and prevent any of the other methods from being called!
      next();
    } else {
      // Delete user's entries
      const deletedEntries = await Entry.remove({ user: res.locals.user.username }, err => {
        if (err) {
          logger.error('Error removing entries: %j', err);
          req.flash('danger', 'There was an error deleting your account!');
          res.redirect('#');
          next(err);
        }
      });

      // Delete user's periods
      const deletedPeriods = await Period.remove({ user: res.locals.user.username }, err => {
        if (err) {
          logger.error('Error removing periods: %j', err);
          req.flash('danger', 'There was an error deleting your account!');
          res.redirect('#');
          next(err);
        }
      });

      // Delete user's requests
      const deletedRequests = await Request.remove({ requester: res.locals.user.username }, err => {
        if (err) {
          logger.error('Error removing requests: %j', err);
          req.flash('danger', 'There was an error deleting your account!');
          res.redirect('#');
          next(err);
        }
      });

      // Delete user's rewards
      const deletedRewards = await Reward.remove({ for: res.locals.user.username }, err => {
        if (err) {
          logger.error('Error removing rewards: %j', err);
          req.flash('danger', 'There was an error deleting your account!');
          res.redirect('#');
          next(err);
        }
      });

      // Delete user
      const deletedUser = await User.remove({ username: res.locals.user.username }, err => {
        if (err) {
          logger.error('Error removing user: %j', err);
          req.flash('danger', 'There was an error deleting your account!');
          res.redirect('#');
          next(err);
        }
      });

      Promise.all([
        deletedEntries,
        deletedPeriods,
        deletedRequests,
        deletedRewards,
        deletedUser
      ]).then(() => {
        logger.info('User successfully deleted: %s', res.locals.user.username);
        req.flash('success', 'Account deletion successful!');
        res.redirect('../logout');
      });
    }
  })
);

export default router;
