// This will contain all '/partner/' routes
import PythonShell from 'python-shell';
import express from 'express';
import _ from 'lodash';
import Moment from 'moment-timezone';
import { extendMoment } from 'moment-range';

import ensureAuthenticated from '../methods/auth';
import Entry from '../models/entry';

const dbConfig = require('../../config/database.json');

const moment = extendMoment(Moment);

// Bring in user model

// Define Async middleware wrapper to avoid try-catch
// const asyncMiddleware = fn => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// // IFTTT Configuration

// function configureIFTTT(user, requestType) {
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
// }

// Initialize Moment & Today Object
// moment().format(); // required by package entirely

const router = express.Router();

// Route to User's Calorie & Exercise Data
router.get('/', ensureAuthenticated, (req, res) => {
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

  const displayRange = moment.range(res.locals.twoWeeksAgo, res.locals.today);
  const displayRangeArray = Array.from(displayRange.by('day'));

  Entry.find(
    {
      // date: {
      //   $in: queryDates
      // }
      date: {
        $gte: res.locals.twoWeeksAgo.toDate(),
        $lte: res.locals.today.toDate()
      },
      user: res.locals.partner.username
    },
    (err, entries) => {
      if (err) {
        console.log(err);
      } else {
        const displayRangeFilled = displayRangeArray.map(emptyDate => {
          const dateIndex = entries.findIndex(entry => moment(entry.date).isSame(emptyDate));
          if (dateIndex > -1) {
            return entries[dateIndex];
          }
          return {
            date: emptyDate.toDate(),
            exercise: [],
            totalCals: 0,
            goalCals: 0,
            netCals: 0,
            isEmpty: true,
            complete: false,
            points: -1,
            user: res.locals.partner.username
          };
        });
        // If we get the results back, reorder the dates
        const sortedEntries = _.orderBy(displayRangeFilled, 'date', 'desc');

        // render page
        res.render('partner/index', {
          // Object to send data along with response
          moment,
          startDate: dbConfig.startDate,
          entries: sortedEntries,
          routeInfo: {
            heroType: res.locals.partner.username,
            route: '/partner',
            userName:
              res.locals.user.firstname.charAt(0).toUpperCase() +
              res.locals.user.firstname.slice(1),
            partnerName:
              res.locals.partner.firstname.charAt(0).toUpperCase() +
              res.locals.partner.firstname.slice(1).toLowerCase()
          }
        });
      }
    }
  );
});

// Route to Weight Data
router.get('/weight', ensureAuthenticated, (req, res) => {
  res.render('partner/weight', {
    routeInfo: {
      heroType: res.locals.partner.username,
      route: '/partner/weight',
      userName:
        res.locals.user.firstname.charAt(0).toUpperCase() + res.locals.user.firstname.slice(1),
      partnerName:
        res.locals.partner.firstname.charAt(0).toUpperCase() +
        res.locals.partner.firstname.slice(1).toLowerCase()
    }
  });
});

router.post('/:date', ensureAuthenticated, (req, res) => {
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

  // Note that since we're posting to /partner/:date, we know to update the
  // partner's entry, not the user's entry
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
    args: [startDate, endDate, res.locals.partner.username, res.locals.partner.mfp]
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

export default router;
