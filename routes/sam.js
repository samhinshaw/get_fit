// This will contain all '/data/' routes
const PythonShell = require('python-shell');
const express = require('express');
const _ = require('lodash');
// datetime functions
// const moment = require('moment');
const moment = require('moment-timezone');
const mongoMiddleware = require('../middlewares/mongoMiddleware');

// Initialize Moment & Today Object
moment().format(); // required by package entirely
// const now = moment.utc();
const now = moment().tz('US/Pacific');
const today = now.clone().startOf('day');

const router = express.Router();

// Bring in user model
const Sam = require('../models/sam');
const Amelia = require('../models/amelia');

// Print in the page info we're using to style the page with Bulma
const pageInfo = {
  heroType: 'warning',
  route: '/sam',
  user: 'sam'
};

// Use middleware to modify locals object (makes available to view engine!)
// https://stackoverflow.com/questions/12550067/expressjs-3-0-how-to-pass-res-locals-to-a-jade-view
router.use((req, res, next) => {
  res.locals.today = today; // do we want to pass an object instead?
  res.locals.pageInfo = pageInfo;
  res.locals.require = require;
  next();
});

// Route to Sam's Data
router.get('/', (req, res) => {
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

  Sam.find(
    {
      // date: {
      //   $in: queryDates
      // }
      date: {
        $gte: twoWeeksAgo.toDate(),
        $lte: today.toDate()
      }
    },
    (err, entries) => {
      if (err) {
        console.log(err);
      } else {
        // If we get the results back, reorder the dates
        const sortedEntries = _.orderBy(entries, 'date', 'desc');

        // render page
        res.render('sam', {
          // Object to send data along with response
          entries: sortedEntries
        });
      }
    }
  );
});

router.post('/:date', (req, res) => {
  // parse date that was POSTed as string
  // Wait, we're passing the string directly to python, so is this even necessary?
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
  PythonShell.run('get_single_day.py', options, (err) => {
    if (err) {
      console.log(JSON.stringify(err));
      pyError = err;
      res.send('Failure');
    } else {
      console.log('Success updating user data from MFP');
      res.send('Success');
    }

    req.flash('danger', JSON.stringify(pyError));
  });

  // ///////////////////////////////
  // RECALCULATE ALL POINT PERIODS
  // ///////////////////////////////

  // async function updatePeriods() {
  //   const samWeekPeriods = await mongoMiddleware.queryWeeksFromMongo(Sam);
  //   const samCustomPeriods = await mongoMiddleware.queryCustomPeriodsFromMongo(Sam);
  //   const ameliaWeekPeriods = await mongoMiddleware.queryWeeksFromMongo(Amelia);
  //   const ameliaCustomPeriods = await mongoMiddleware.queryCustomPeriodsFromMongo(Amelia);

  //   const pointTotals = {
  //     sam: {
  //       weekTotals: samWeekPeriods,
  //       customTotals: samCustomPeriods
  //     },
  //     amelia: {
  //       weekTotals: ameliaWeekPeriods,
  //       customTotals: ameliaCustomPeriods
  //     }
  //   };
  //   res.locals.pointTotals = pointTotals;

  //   // make the most important entries available at the top level
  //   // if more specific ones needed, we can get those within the views template
  //   const samPointTally = samCustomPeriods.find(element => element.key === 'sinceStart');
  //   const ameliaPointTally = ameliaCustomPeriods.find(element => element.key === 'sinceStart');

  //   const pointTally = {
  //     sam: parseFloat(samPointTally.points),
  //     amelia: parseFloat(ameliaPointTally.points)
  //   };

  //   res.locals.pointTally = pointTally;
  // }
});

module.exports = router;
