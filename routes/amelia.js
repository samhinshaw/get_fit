// This will contain all '/data/' routes
const PythonShell = require('python-shell');
const express = require('express');
const _ = require('lodash');
// datetime functions
// const moment = require('moment');
const moment = require('moment-timezone');

// Initialize Moment & Today Object
moment().format(); // required by package entirely
// const now = moment.utc();
const now = moment().tz('US/Pacific');
const today = now.clone().startOf('day');
const twoWeeksAgo = today.clone().subtract(14, 'days');

const router = express.Router();

// Bring in Date model
const Entry = require('../models/entry');

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
router.get('/', (req, res) => {
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
        res.render('amelia', {
          // Object to send data along with response
          entries: sortedEntries
        });
      }
    }
  );
});

router.post('/:date', (req, res) => {
  // parse date that was POSTed as string
  // const postedDate = moment.utc(req.params.date, 'YYYY-MM-DD');

  // construct query to pass to python script
  const args = {
    // _id: req.params.id
    date: req.params.date,
    user: pageInfo.user
  };

  // Python script options
  const options = {
    // mode: 'text',
    // pythonPath: '/Users/samhinshaw/.miniconda2/bin/python',
    // pythonOptions: ['-u'],
    scriptPath: './data',
    args: [args.date, args.user]
  };

  let pyError;

  // Run python script
  PythonShell.run('getMFP.py', options, (err) => {
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
