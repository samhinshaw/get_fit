// This will contain all '/data/' routes
const PythonShell = require('python-shell');
const express = require('express');
const _ = require('lodash');
// Import date-fns
const startOfToday = require('date-fns/start_of_today');
const getYear = require('date-fns/get_year');
const getMonth = require('date-fns/get_month');
const getDate = require('date-fns/get_date');
// const getDay = require('date-fns/get_day');
const format = require('date-fns/format');

const router = express.Router();

// Bring in Date model
const Date = require('../models/date');

const theStartOfToday = startOfToday();

const today = {
  year: getYear(theStartOfToday),
  month: getMonth(theStartOfToday) + 1, // indexed to 0 FOR SOME REASON
  day: getDate(theStartOfToday),
  dayOfWeek: format(theStartOfToday, 'dddd')
};

// Print in the page info we're using to style the page with Bulma
const pageInfo = {
  heroType: 'info',
  route: '/amelia'
};

// Print in the user info we're using to style the page with Bulma
const userInfo = {
  sam: {
    points: 3,
    pointsClass: 'danger'
  },
  amelia: {
    points: 0,
    pointsClass: 'danger'
  }
};

// Use middleware to modify locals object (makes available to view engine!)
// https://stackoverflow.com/questions/12550067/expressjs-3-0-how-to-pass-res-locals-to-a-jade-view
router.use((req, res, next) => {
  res.locals.today = today;
  res.locals.pageInfo = pageInfo;
  res.locals.userInfo = userInfo;
  next();
});

// Route to Sam's Data
router.get('/', (req, res) => {
  Date.find(
    {
      // maybe we'll want a Date object in MongoDB later
      // maybe logic for date range
      // Say period of past two weeks?
    },
    (err, dates) => {
      if (err) {
        console.log(err);
      } else {
        // If we get the results back, reorder the dates
        const sortedDates = _.orderBy(
          dates,
          ['date.year', 'date.month', 'date.day'],
          ['desc', 'desc', 'desc']
        );

        // render page
        res.render('amelia', {
          // Object to send data along with response
          dates: sortedDates,
          today
        });
      }
    }
  );
});

router.post('/:year/:month/:day', (req, res) => {
  // const query = { _id: req.params.id };
  const query = {
    year: req.params.year,
    month: req.params.month,
    day: req.params.day
  };

  // Python script options
  const options = {
    // mode: 'text',
    // pythonPath: '/Users/samhinshaw/.miniconda2/bin/python',
    // pythonOptions: ['-u'],
    scriptPath: './data',
    args: [query.year, query.month, query.day]
  };

  let pyError;

  // Run python script
  PythonShell.run('get_single_day.py', options, (err) => {
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
