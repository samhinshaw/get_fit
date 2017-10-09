// This will contain all '/data/' routes
const PythonShell = require('python-shell');
const express = require('express');
const _ = require('lodash');
const request = require('request');
const auth = require('../config/auth.js');

// datetime functions
// const moment = require('moment');
const moment = require('moment-timezone');

// Define Async middleware wrapper to avoid try-catch
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Initialize Moment & Today Object
moment().format(); // required by package entirely
// const now = moment.utc();
const now = moment().tz('US/Pacific');
const today = now.clone().startOf('day');
const twoWeeksAgo = today.clone().subtract(14, 'days');

const router = express.Router();

// Bring in Date model
const Entry = require('../models/entry');

const Reward = require('../models/reward');
const Request = require('../models/request');

// Print in the page info we're using to style the page with Bulma
const pageInfo = {
  heroType: 'info',
  route: '/amelia',
  user: 'amelia'
};

// Use middleware to modify locals object (makes available to view engine (Pug)!)
// https://stackoverflow.com/questions/12550067/expressjs-3-0-how-to-pass-res-locals-to-a-jade-view
router.use((req, res, next) => {
  res.locals.today = today;
  res.locals.pageInfo = pageInfo;
  res.locals.require = require;
  next();
});

// Route to Amelia's Data
router.get('/', auth.ensureAuthenticated, (req, res) => {
  Entry.find(
    {
      date: {
        $gte: twoWeeksAgo.toDate(),
        $lte: today.toDate()
      },
      user: 'amelia'
    },
    (err, entries) => {
      if (err) {
        console.log(err);
      } else {
        // If we get the results back, reorder the dates
        const sortedEntries = _.orderBy(entries, 'date', 'desc');

        // render page
        res.render('amelia/index', {
          // Object to send data along with response
          entries: sortedEntries
        });
      }
    }
  );
});

router.get('/spend', auth.ensureAuthenticated, (req, res) => {
  Reward.find({ for: 'amelia' }, (err, rewards) => {
    if (err) {
      console.log(err);
    }
    const sortedRewards = _.orderBy(rewards, 'cost', 'asc');
    res.render('amelia/spend', {
      rewards: sortedRewards
    });
  });
});

router.post(
  '/spend',
  auth.ensureAuthenticated,
  asyncMiddleware(async (req, res) => {
    const rewardKey = req.body.reward;

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

    if (rewardEntry.cost > res.locals.pointTally.sam) {
      req.flash('danger', 'Not enough points!');
      res.redirect('/amelia/spend');
      return;
    }

    const newRequest = new Request({
      reward: rewardKey,
      displayName: rewardEntry.displayName,
      pointCost: rewardEntry.cost,
      requester: res.locals.user.username,
      message: req.body.message,
      timeRequested: moment()
        .tz('US/Pacific')
        .toDate(),
      status: 'unapproved'
    });

    newRequest.save(saveErr => {
      if (saveErr) {
        console.log(saveErr);
      } else {
        req.flash('success', 'Request sent! Points deducted from your account.');
        res.redirect('/amelia/spend');
      }
    });

    // Finally send a message to IFTTT telling

    // Set the headers
    const headers = {
      // 'User-Agent': 'Super Agent/0.0.1',
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    // Configure the request
    const options = {
      url: 'https://maker.ifttt.com/trigger/request_request/with/key/JCavOg5Om_uGsh0R6McOC',
      method: 'POST',
      headers,
      form: { value1: 'Sam' }
    };

    // Start the request
    request(options, (error, response) => {
      //            (error, response, body)
      if (error) {
        console.log('ERROR:');
        console.log(error);
      } else if (!error && response.statusCode === 200) {
        // Print out the response body
        // console.log(body);
      }
    });
  })
);

router.post('/:date', auth.ensureAuthenticated, (req, res) => {
  // parse date that was POSTed as string
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
    args: [startDate, endDate, pageInfo.user]
  };

  let pyError;

  // Run python script
  PythonShell.run('getMFP.py', options, err => {
    if (err) {
      console.log(JSON.stringify(err));
      pyError = err;
      res.send('Failure');
    } else {
      // console.log('Success');
      res.send('Success');
    }

    req.flash('danger', JSON.stringify(pyError));
  });
});

module.exports = router;
