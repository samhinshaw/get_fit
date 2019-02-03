// This will contain all '/user/' routes
import PythonShell from 'python-shell';
import express from 'express';
import _ from 'lodash';
import Moment from 'moment-timezone';
import { extendMoment } from 'moment-range';

import ensureAuthenticated from '../methods/auth';

import Entry from '../models/entry';
import logger from '../methods/logger';

const appConfig = require('../../config/app_config.json');

const moment = extendMoment(Moment);

// Define Async middleware wrapper to avoid try-catch
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = express.Router();

// Route to User's Calorie & Exercise Data
router.get(
  '/',
  ensureAuthenticated,
  asyncMiddleware(async (req, res) => {
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
    const endOfToday = res.locals.today.clone().endOf('day');

    // make array of dates we are going to display
    const displayRange = moment.range(res.locals.twoWeeksAgo, endOfToday);
    const displayRangeArray = Array.from(displayRange.by('day'));

    const entries = await Entry.find(
      {
        date: {
          $gte: res.locals.twoWeeksAgo.toDate(),
          $lte: res.locals.today.toDate()
        },
        user: res.locals.user.username
      },
      (err, response) => {
        if (err) {
          logger.error(err);
        }
        return response;
      }
    );

    // Not the best solution, but currently my way for merging an array of empty
    // dates with an array of the existing entries. Maybe it'd just be better to
    // create a new empty entry every day.
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
        user: res.locals.user.username
      };
    });

    // Reorder the dates array for displaying on the page
    const sortedEntries = _.orderBy(displayRangeFilled, 'date', 'desc');

    // Create a weekly summary.
    // =======================================
    // To start we need to figure out which dates to pull from Mongo
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // refactor note: This should only slightly exceed the past two weeks, so
    // let's pull all those dates in at once above, and THEN deal with
    // sorting/filtering/etcetera
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    // First get Sundays in the past two weeks
    const sundays = [];
    sortedEntries.map(entry => {
      if (moment(entry.date).format('ddd') === 'Sun') {
        sundays.push(entry.date);
      }
      return true;
    });
    // Make ranges for those dates for querying
    // =======================================
    const weeks = [];
    sundays.map((sunday, index) => {
      // For each sunday, get:
      // 1. The Sunday
      // 2. The end of that Sunday
      // 3. The beginning of the previous Monday
      const sundayMoment = moment.tz(sunday, 'US/Pacific');
      const endDate = sundayMoment.endOf('day');
      const startDate = sundayMoment
        .clone()
        .subtract(6, 'days')
        .startOf('day');

      // Construct an object to push to the new weeks array
      weeks.push({
        key: `week ${index}`,
        startDate,
        endDate
      });
      // Make ESLint happy that we're returning a value. Our actual return is
      // done via an array push, so as to not have an array with lots of
      // `undefined` values
      return true;
    });

    // HEAVY LIFTING
    // Summarize each week into various key statistics
    // =======================================
    // For each week...
    const weekSummaries = weeks.map(async week => {
      // Get the entries that week
      const entriesOfWeek = await Entry.find(
        {
          date: {
            $gte: week.startDate,
            $lte: week.endDate
          },
          user: res.locals.user.username
        },
        (err, response) => {
          if (err) {
            logger.error(err);
          }
          return response;
        }
      );
      // Figure out how many days you hit your calorie goal!
      const successfulDays = entriesOfWeek.reduce((successDays, entry) => {
        // If you were under your goal (and it was completed) add a point
        if (entry.netCals > 0 && entry.complete) {
          return successDays + 1;
        }
        // Otherwise just return the accumulator without adding
        return successDays;
      }, 0);

      // Figure out how many points you made that week
      const points = entriesOfWeek
        .reduce((pointTotal, entry) => pointTotal + entry.points, 0)
        .toFixed(1);

      // Figure out how many workouts you did that week (excluding walking)
      const workouts = entriesOfWeek.reduce((numOfExercises, entry) => {
        // For each day, you're going to have an array of exercises! So you've
        // got to reduce all your multiple exercises that day too.
        const exercisesThatDay = entry.exercise.reduce((totalExercises, exercise) => {
          // If not walking, add one to count this as an exercise
          if (exercise.name !== 'walking') {
            return totalExercises + 1;
          }
          // Otherwise, return the accumulator without adding
          return totalExercises;
        }, 0);
        // Return the accumulator plus the number of exercises that day
        return numOfExercises + exercisesThatDay;
      }, 0);

      // Figure out how many minutes you worked out that week.
      const workoutMinutes = entriesOfWeek.reduce((totalMins, entry) => {
        // For each day, you're going to have an array of exercises! So you've
        // got to reduce all your multiple exercises that day too.
        const exerciseMinsThatDay = entry.exercise.reduce((totalMinsThatDay, exercise) => {
          // If not walking, add the total minutes from that exercise
          if (exercise.name !== 'walking') {
            return totalMinsThatDay + exercise.minutes;
          }
          // Otherwise, return the accumulator without adding
          return totalMinsThatDay;
        }, 0);
        // Return the accumulator plus the number of minutes worked out that day
        return totalMins + exerciseMinsThatDay;
      }, 0);

      // Finally, return an object containing all of the relevant information!
      // The 'endDate' will correspond to the last day of the period, the Sunday
      // at the end of the week. Then, pass the information we just generated
      // from all of our reduce statements as well!
      return {
        endDate: week.endDate.startOf('day'),
        points,
        successfulDays,
        workouts,
        workoutMinutes
      };
    });

    // OMG, figured this out!!! Huge thanks to:
    // https://stackoverflow.com/questions/40140149/use-async-await-with-array-map/40140359
    // Now, because we're waiting on MULTIPLE PROMISES to come through, we need
    // to use Promise.all to reduce them to one single await-able promise.
    // Otherwise, we'll end up with an array of promises (thanks to the
    // weeks.map() function above), which we can't properly await. However, we
    // can simply await this new combined mega-promise! This is what Wes Bos was
    // talking about in his episode of Syntax on async/await.
    const promisedWeekSummaries = Promise.all(weekSummaries);

    // render page
    res.render('user/index', {
      // Object to send data along with response
      moment,
      startDate: moment.tz(appConfig.startDate, 'MM-DD-YYYY', 'US/Pacific'),
      entries: sortedEntries,
      // Here we're awaiting that mega-promise!
      weekSummaries: await promisedWeekSummaries,
      routeInfo: {
        heroType: 'user',
        route: '/user'
      }
    });
  })
);

// Route to Weight Data
router.get('/weight', ensureAuthenticated, (req, res) => {
  res.render('user/weight', {
    routeInfo: {
      heroType: 'user',
      route: '/user/weight'
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
    [startDate, endDate] = date;
    // This is array destructuring! It is equivalent to the below:
    // startDate = date[0];
    // endDate = date[1];
  }

  // Python script options
  const pythonOptions = {
    // mode: 'json',
    pythonOptions: ['-u'], // this will let us see Python's print statements
    scriptPath: './data',
    args: [startDate, endDate, res.locals.user.username, res.locals.user.mfp]
  };

  // Run python script
  PythonShell.run('getMFP.py', pythonOptions, (err, messages) => {
    // Only throw error if exit code was nonzero.
    // For some reason I am getting errors with nonzero exit statuses
    if (err && err.exitCode !== 0) {
      logger.error('Error updating from MyFitnessPal:');
      if (err.traceback) {
        logger.error(err.traceback);
        delete err.traceback;
      }
      logger.error(err);
      res.status(500).json({ message: 'Error updating from MyFitnessPal', type: 'danger' });
      // res.status(500).json(err);
    } else {
      if (messages) logger.info('messages: %j', messages);
      logger.info('Success updating user data from MFP.');
      res.status(200).json({
        message: 'Success updating user data from MyFitnessPal',
        type: 'success'
      });
      // res.status(200).json(result);
    }
  });
});

export default router;
