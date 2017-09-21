// Script to calculate the number of points our user has!
// Calculate and bring in our points of interest!
const mongoose = require('mongoose');
const Moment = require('moment-timezone');
const MomentRange = require('moment-range');
const async = require('async');

const moment = MomentRange.extendMoment(Moment);

// Initialize Moment & Today Object
moment().format(); // required by package entirely

mongoose.connect('mongodb://localhost:27025/get_fit');
const db = mongoose.connection;

// Check connection
db.once('open', () => {
  console.log('Connected to MongoDB');
});
// Check for DB errors
db.on('error', (err) => {
  console.log(err);
});

// const Purchase = require('../models/purchase');
const Period = require('../models/period');
const Sam = require('../models/sam');
// const Amelia = require('../models/amelia');

// ///// Fudge Data /////////

// Instantiate some dates
const now = moment().tz('US/Pacific');
const today = now.clone().startOf('day');
const startofTracking = moment('09-18-2017', 'MM-DD-YYYY')
  .tz('US/Pacific')
  .startOf('day');
const twoWeeksAgo = today.clone().subtract(14, 'days');
// .startOf('week')    = Sunday
// .startOf('isoweek') = Monday
// const startOfWeek = today.clone().startOf('isoweek');

const user = Sam;
const startDate = twoWeeksAgo;
const endDate = today;

// ///// End Fudging /////////

// async function executeAsyncTask() {
//   const valueA = await functionA();
//   const valueB = await functionB(valueA);
//   return function3(valueA, valueB);
// }

async function queryWeeksFromMongo() {
  // First get all db entries for that user

  const entries = await user.find(
    {
      // date: {
      //   $gte: startDate,
      //   $lte: endDate
      // }
    },
    (err, ents) => {
      if (err) {
        console.log(err);
      } else {
        return ents;
        // entries.forEach((entry) => {
        //   dates.push(entry);
        // });
      }
    }
  );

  // const weekMondays = dates.reduce((weeks, entry) => {
  //   weeks.push(entry.date.startOf('isoweek'));
  //   return weeks;
  // }, []);

  // const weekMondays = await dates.reduce((weeks, entry) => {
  //   const startOfQueryWeek = moment(entry.date)
  //     .tz('US/Pacific')
  //     .startOf('isoweek');
  //   if (weeks.includes(startOfQueryWeek)) {
  //     return weeks;
  //   }
  //   weeks.push();
  //   console.log(weeks);
  //   return weeks;
  // }, []);

  // or remove redundancies in-line
  const weekMondays = await entries.reduce((weeks, entry) => {
    const monday = moment(entry.date)
      .tz('US/Pacific')
      .startOf('isoweek');
    // const sunday = monday.endOf('week').startOf('day');

    // const weekPeriod = entry.reduce;
    // can't compare moments directly, so we have to use moment's
    // built in comparisons
    if (weeks.length === 0) {
      weeks.push(monday);
    } else if (weeks.length === 1) {
      if (!weeks[0].isSame(monday, 'day')) {
        weeks.push(monday);
      }
    } else {
      const min = moment.min(weeks);
      const max = moment.max(weeks);
      if (!monday.isBetween(min, max, 'day', '[]')) {
        weeks.push(monday);
      }
    }
    return weeks;
  }, []);

  const weekPeriods = await weekMondays.reduce((weekPeriodResult, monday, index) => {
    const sunday = monday
      .clone()
      .endOf('week')
      .startOf('day');

    // For each date that exists in this period, sum the points
    const weekPoints = entries.reduce((points, entry) => {
      const date = moment(entry.date).tz('US/Pacific');
      if (date.isBetween(monday, sunday, 'day', '[]')) {
        return points + entry.points;
      }
      return points;
    }, 0);

    weekPeriodResult.push({
      key: `Week ${index + 1}`,
      startDate: monday,
      endDate: sunday,
      points: weekPoints.toFixed(1)
    });

    return weekPeriodResult;
  }, []);

  await console.log(weekPeriods);
  return weekPeriods;
}

const weekPeriods = queryWeeksFromMongo();

const customRanges = [
  {
    // We started Monday, Sept 18th
    key: 'sinceStarted',
    startDate: startofTracking,
    endDate: today
  },
  {
    key: 'pastTwoWeeks',
    startDate: twoWeeksAgo,
    endDate: today
  }
];

async function queryCustomPeriodsFromMongo() {
  // First get all db entries for that user

  const entries = await user.find(
    {
      // date: {
      //   $gte: startDate,
      //   $lte: endDate
      // }
    },
    (err, ents) => {
      if (err) {
        console.log(err);
      } else {
        return ents;
        // entries.forEach((entry) => {
        //   dates.push(entry);
        // });
      }
    }
  );
  const customPeriods = await customRanges.reduce((customPeriodResult, customPeriod) => {
    // For each date that exists in this period, sum the points
    const customPeriodPoints = entries.reduce((points, entry) => {
      const date = moment(entry.date).tz('US/Pacific');
      if (date.isBetween(customPeriod.startDate, customPeriod.endDate, 'day', '[]')) {
        return points + entry.points;
      }
      return points;
    }, 0);

    customPeriodResult.push({
      key: customPeriod.key,
      startDate: customPeriod.startDate,
      endDate: customPeriod.endDate,
      points: customPeriodPoints.toFixed(1)
    });

    return customPeriodResult;
  }, []);

  await console.log(customPeriods);

  return customPeriods;
}

const customPeriods = queryCustomPeriodsFromMongo();
// or remove redundancies in-line another way
// const weekMondays = dates.reduce((weeks, entry) => {
//   const startOfTheWeek = entry.date.startOf('isoweek');
//   weeks[startOfTheWeek] = weeks[startOfTheWeek] || '';
//   weeks.push();
//   return weeks;
// }, []);

// const totalPoints = dates.reduce((total, entry) => total + entry.points, 0);

// Period.findOneAndUpdate(
//   { startDate, endDate },
//   { $set: { points: periodPoints } },
//   { upsert: true },
//   (periodErr, periodEntry) => {
//     if (periodErr) {
//       console.log(periodErr);
//     } else {
//       res.locals[periodName] = periodName;
//       console.log(Math.round(periodEntry, 1));
//     }
//   }
// );

// ////////////// One method ////////////////
// Query a range and assign in callback. ///
// /////////// Another method: /////////////
// Query all and then deal with ranges.  ///
// /////////////////////////////////////////

// user.find(
//   {
//     date: {
//       $gte: startDate,
//       $lte: endDate
//     }
//   },
//   (err, entries) => {
//     if (err) {
//       console.log(err);
//     } else {
//       periodPoints = entries.reduce((total, entry) => total + entry.points, 0);
//     }
//   }
// );

// Period.findOneAndUpdate(
//   { startDate, endDate },
//   { $set: { points: periodPoints } },
//   { upsert: true },
//   (periodErr, periodEntry) => {
//     if (periodErr) {
//       console.log(periodErr);
//     } else {
//       res.locals[periodName] = periodName;
//       console.log(Math.round(periodEntry, 1));
//     }
//   }
// );

mongoose.connection.close();
