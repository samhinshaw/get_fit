// This will contain all '/user/' routes
import express from 'express';
import _ from 'lodash';
import Moment from 'moment-timezone';
import { extendMoment } from 'moment-range';

import ensureAuthenticated from '../methods/auth';
import { getGoals, getDiaryData, authMFP, calculateExercisePoints } from '../myfitnesspal/mfp';

import Entry from '../models/entry';
import logger from '../methods/logger';
import parseDateRange from '../methods/parse-date-range';
import { updatePointTally } from '../methods/update-point-tally';

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

    // make array of dates we are going to display
    const displayRange = moment.range(res.locals.twoWeeksAgo, res.locals.tonight);
    const displayRangeArray = Array.from(displayRange.by('day'));

    const entries = await Entry.find(
      {
        date: {
          $gte: res.locals.twoWeeksAgo.toDate(),
          $lte: res.locals.today.toDate(),
        },
        user: res.locals.user.username,
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
        points: 0,
        user: res.locals.user.username,
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
      if (moment.tz(entry.date, 'US/Pacific').format('ddd') === 'Sun') {
        sundays.push(entry.date);
      }
      return true;
    });
    // Make ranges for those dates for querying
    // =======================================
    const weeks = [];
    sundays.forEach((sunday, index) => {
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
        endDate,
      });
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
            $lte: week.endDate,
          },
          user: res.locals.user.username,
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
        workoutMinutes,
      };
    });

    const promisedWeekSummaries = Promise.all(weekSummaries);

    // render page
    res.render('user/index', {
      // Object to send data along with response
      moment,
      startDate: moment.tz(req.user.startDate, 'YYYY-MM-DD', 'US/Pacific'),
      entries: sortedEntries,
      // Here we're awaiting that mega-promise!
      weekSummaries: await promisedWeekSummaries,
      routeInfo: {
        heroType: 'user',
        route: '/user',
      },
    });
  })
);

// Route to Weight Data
router.get('/weight', ensureAuthenticated, (req, res) => {
  res.render('user/weight', {
    routeInfo: {
      heroType: 'user',
      route: '/user/weight',
    },
  });
});

router.post(
  '/:date',
  ensureAuthenticated,
  asyncMiddleware(async (req, res) => {
    try {
      const [startDate, endDate] = parseDateRange(req.params.date);

      const mfpUser = res.locals.user.mfp;
      const mfpUserUpper = res.locals.user.mfp.toUpperCase();

      const session = await authMFP(mfpUser, process.env[`MFP_PASS_${mfpUserUpper}`]);

      const mfpDiaryEntries = await getDiaryData(
        session,
        { exercise: true, food: true },
        startDate,
        endDate
      );

      const mfpGoals = await getGoals(session, startDate, endDate);

      const entriesMade = mfpDiaryEntries.map(async entry => {
        if (!entry.date) {
          throw new Error('Unspecified error retreiving data from MyFitnessPal.');
        }
        if (!_.get(entry, 'food.totals.calories')) {
          // Could add a warning here--some dates did not have data
          // If no entry, just skip this date
          return Promise.resolve();
        }
        // get the goal for the range of this date
        let goalCals;
        try {
          goalCals = mfpGoals.goals.get(mfpGoals.ranges.get(entry.date)).default_goal.energy.value;
        } catch (err) {
          throw new Error('Error retreiving goals from MyFitnessPal.');
        }

        const exerciseSummary = await calculateExercisePoints(entry, req.user);

        const totalCals = _.get(entry, 'food.totals.calories') ? entry.food.totals.calories : 0;

        const dateAsDateObject = moment
          .tz(entry.date, 'YYYY-MM-DD', 'US/Pacific')
          .startOf('day')
          .toDate();

        // TODO: Calculate points from calorie goal
        // TODO: Get completion status?

        const formattedEntry = {
          // store
          date: dateAsDateObject,
          totalCals,
          goalCals,
          netCals: goalCals - totalCals,
          // TODO: avoid this hack
          complete: true,
          points: exerciseSummary.points,
          exercise: exerciseSummary.exercises,
          user: req.user.username,
        };

        // Update each entry
        return Entry.findOneAndUpdate(
          {
            date: dateAsDateObject,
            user: req.user.username,
          },
          {
            $set: formattedEntry,
          },
          // create a new object if none exists, and return the new object
          { new: true, upsert: true }
        );
      });

      // after all entries have been made,
      Promise.all(entriesMade)
        // update the point tally cookie before continuing
        .then(() => updatePointTally(res, req.user.username, req.user.partner))
        .then(() => {
          res.status(200).json({
            message: 'Success updating user data from MyFitnessPal',
            type: 'success',
          });
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        //! TODO: Write custom stanitized error messages
        message: err.message,
        type: 'danger',
      });
    }
  })
);

export default router;
