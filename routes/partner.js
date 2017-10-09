// This will contain all '/data/' routes
const PythonShell = require('python-shell');
const express = require('express');
const _ = require('lodash');
const request = require('request');
const auth = require('../config/auth.js');

// datetime functions
// const moment = require('moment');
const moment = require('moment-timezone');
// const mongoMiddleware = require('../middlewares/mongoMiddleware');

// Define Async middleware wrapper to avoid try-catch
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// IFTTT Configuration

function configureIFTTT(user, requestType) {
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
}

// Initialize Moment & Today Object
moment().format(); // required by package entirely
// const now = moment.utc();
const now = moment().tz('US/Pacific');
const today = now.clone().startOf('day');

const router = express.Router();

// Bring in user model
const Entry = require('../models/entry');
const Reward = require('../models/reward');
const Purchase = require('../models/purchase');

// Print in the page info we're using to style the page with Bulma
// const pageInfo = {
//   heroType: 'warning', // note, should update this to color, not warning
//   route: `/${req.user.username}`,
//   user: 'sam', // replace with session
//   User: 'Sam'
// };

// Use middleware to modify locals object (makes available to view engine!)
// https://stackoverflow.com/questions/12550067/expressjs-3-0-how-to-pass-res-locals-to-a-jade-view
router.use((req, res, next) => {
  res.locals.today = today; // do we want to pass an object instead?
  res.locals.require = require;
  // res.locals.routeInfo = {
  //   heroType: req.user.username,
  //   route: '/user',
  //   user: req.user.username,
  //   userName: req.user.username.charAt(0).toUpperCase() + req.user.username.slice(1),
  //   partnerName: req.user.partner.charAt(0).toUpperCase() + req.user.partner.slice(1).toLowerCase()
  // };
  next();
});

// Route to Sam's Data
router.get('/', auth.ensureAuthenticated, (req, res) => {
  // Construct an array of dates to query. Let's get the past two weeks
  // First our start and end points:
  const twoWeeksAgo = today.clone().subtract(14, 'days');

  // NOTE, we can also query an array of dates, as I did see a StackOverflow
  // post mentioning that the $gte and $lte operators can be a bit wonky with
  // dates. I have not experienced that yet, so I will avoid anything containing
  // a for loop for now. However, I will leave the code commented out below in
  // case we need to use it in the future.

  // const queryDates = [];
  // let day = twoWeeksAgo;
  // while (day <= today) {
  //   queryDates.push(day.toDate());
  //   day = day.clone().add(1, 'd');
  // }

  Entry.find(
    {
      // date: {
      //   $in: queryDates
      // }
      date: {
        $gte: twoWeeksAgo.toDate(),
        $lte: today.toDate()
      },
      user: res.locals.user.partner
    },
    (err, entries) => {
      if (err) {
        console.log(err);
      } else {
        // If we get the results back, reorder the dates
        const sortedEntries = _.orderBy(entries, 'date', 'desc');

        // render page
        res.render('partner/index', {
          // Object to send data along with response
          entries: sortedEntries,
          routeInfo: {
            heroType: 'dark',
            route: '/partner',
            user: req.user.username,
            userName: req.user.username.charAt(0).toUpperCase() + req.user.username.slice(1),
            partnerName: req.user.partner.charAt(0).toUpperCase() + req.user.partner.slice(1).toLowerCase()
          }
        });
      }
    }
  );
});

router.post('/:date', auth.ensureAuthenticated, (req, res) => {
  // parse date that was POSTed as string
  // Wait, we're passing the string directly to python, so is this even necessary?
  // const postedDate = moment.utc(req.params.date, 'YYYY-MM-DD');
  let startDate;
  let endDate;

  if (/^\d{4}-\d{2}-\d{2}$/.test(req.params.date)) {
    startDate = req.params.date;
    endDate = req.params.date;
  } else if (/^\d{4}-\d{2}-\d{2} \d{4}-\d{2}-\d{2}$/.test(req.params.date)) {
    const date = req.params.date.split(' ');
    startDate = date[0];
    endDate = date[1];
  }

  // Python script options
  const options = {
    // mode: 'text',
    // pythonPath: '/Users/samhinshaw/.miniconda2/bin/python',
    // pythonOptions: ['-u'],
    scriptPath: './data',
    args: [startDate, endDate, res.locals.user.partner]
  };

  // Run python script
  PythonShell.run('getMFP.py', options, err => {
    if (err) {
      console.log(JSON.stringify(err));
      req.flash('danger', JSON.stringify(err));
      res.redirect('/partner');
    } else {
      console.log('Success updating user data from MFP');
      res.send('Success');
    }
  });
});

module.exports = router;
