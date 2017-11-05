// This will contain all '/data/' routes
const PythonShell = require('python-shell');
const express = require('express');
const _ = require('lodash');
// const request = require('request');
const auth = require('../config/auth.js');

// datetime functions
// const moment = require('moment');
const moment = require('moment-timezone');
// const mongoMiddleware = require('../middlewares/mongoMiddleware');

// Define Async middleware wrapper to avoid try-catch
// const asyncMiddleware = fn => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// IFTTT Configuration

// const configureIFTTT = (user, requestType) => {
//   const configOptions = {
//     url: `https://maker.ifttt.com/trigger/${requestType}/with/key/JCavOg5Om_uGsh0R6McOC`,
//     method: 'POST',
//     headers: {
//       // 'User-Agent': 'Super Agent/0.0.1',
//       'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     form: { value1: user }
//   };
//   return configOptions;
// };

// Initialize Moment & Today Object
moment().format(); // required by package entirely
const router = express.Router();

// Bring in user model
const Entry = require('../models/entry');

// Route to Sam's Data
router.get('/', auth.ensureAuthenticated, (req, res) => {
  // Construct an array of dates to query. Let's get the past two weeks
  // First our start and end points:

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
        $gte: res.locals.twoWeeksAgo.toDate(),
        $lte: res.locals.today.toDate()
      },
      user: res.locals.user.username
    },
    (err, entries) => {
      if (err) {
        console.log('ERROR, WILL ROBINSON!');
        console.log(err);
      } else {
        console.log('SUCCESS, WILL ROBINSON!');
        // If we get the results back, reorder the dates
        const sortedEntries = _.orderBy(entries, 'date', 'desc');

        sortedEntries.map(entry => {
          console.log(entry.date);
          return true;
        });

        // render page
        res.render('user/index', {
          // Object to send data along with response
          entries: sortedEntries,
          routeInfo: {
            heroType: res.locals.user.username,
            route: '/user',
            user: req.user.username,
            userName: req.user.username.charAt(0).toUpperCase() + req.user.username.slice(1),
            partner: req.user.partner,
            partnerName:
              req.user.partner.charAt(0).toUpperCase() + req.user.partner.slice(1).toLowerCase()
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

  // Note that since we're posting to /user/:date, we know to update the user's
  // entry, not the partner's entry
  let pythonPath;

  if (process.platform === 'linux') {
    pythonPath = '/home/sam/.miniconda3/bin/python3';
  } else if (process.platform === 'darwin') {
    pythonPath = '/Users/samhinshaw/.miniconda3/bin/python';
  }

  // Python script options
  const options = {
    // mode: 'text',
    pythonPath,
    // pythonOptions: ['-u'],
    scriptPath: './data',
    args: [startDate, endDate, res.locals.user.username, res.locals.user.mfp]
  };

  // Run python script
  PythonShell.run('getMFP.py', options, err => {
    if (err) {
      console.log(JSON.stringify(err));
      req.flash('danger', JSON.stringify(err));
      res.redirect('/user');
    } else {
      console.log('Success updating user data from MFP');
      res.send('Success');
    }
  });
});

module.exports = router;
