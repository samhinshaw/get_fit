// Script to calculate the number of points our user has!
// Calculate and bring in our points of interest!
const mongoose = require('mongoose');
const Moment = require('moment-timezone');
const MomentRange = require('moment-range');
const async = require('async');

const moment = MomentRange.extendMoment(Moment);

// Initialize Moment & Today Object
moment().format(); // required by package entirely

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
const customRanges = [
  {
    // We started Monday, Sept 18th
    key: 'sinceStart',
    startDate: startofTracking,
    endDate: today
  },
  {
    key: 'pastTwoWeeks',
    startDate: twoWeeksAgo,
    endDate: today
  }
];

// Bring in user models
const Entry = require('../models/entry');

async function queryWeeksFromMongo(user) {
  // First get all db entries for that user

  const entries = await Entry.find({ user }, (err, ents) => {
    if (err) {
      console.log(err);
    } else {
      return ents;
    }
  });

  // or remove redundancies in-line
  const weekMondays = await entries.reduce((weeks, entry) => {
    const monday = moment(entry.date)
      .tz('US/Pacific')
      .startOf('isoweek');

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
      points: weekPoints.toFixed(1),
      user
    });

    return weekPeriodResult;
  }, []);

  return weekPeriods;
}

async function queryCustomPeriodsFromMongo(user) {
  // First get all db entries for that user
  const entries = await Entry.find({ user }, (err, ents) => {
    if (err) {
      console.log(err);
    } else {
      return ents;
    }
  });
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
      points: customPeriodPoints.toFixed(1),
      user
    });

    return customPeriodResult;
  }, []);

  return customPeriods;
}

module.exports = {
  queryWeeksFromMongo,
  queryCustomPeriodsFromMongo
};
