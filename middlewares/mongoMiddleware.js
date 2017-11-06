// Script to calculate the number of points our user has!
// Calculate and bring in our points of interest!
// const mongoose = require('mongoose');
const Moment = require('moment-timezone');
const MomentRange = require('moment-range');
// const _ = require('lodash');
// const config = require('../config/database');
// const async = require('async');

const moment = MomentRange.extendMoment(Moment);

// Initialize Moment & Today Object
// moment().format();

// Bring in user models
const Entry = require('../models/entry');

const Request = require('../models/request');

async function queryWeeksFromMongo(user) {
  // First get all db entries for that user

  const entries = await Entry.find({ user }, (err, res) => {
    if (err) {
      console.log(err);
    }
    return res;
  });

  // or remove redundancies in-line
  const weekMondays = await entries.reduce((weeks, entry) => {
    const monday = moment.tz(entry.date, 'US/Pacific').startOf('isoweek');

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
      const date = moment.tz(entry.date, 'US/Pacific');
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

async function queryCustomPeriodsFromMongo(user, customRanges) {
  // First get all db entries for that user
  const entries = await Entry.find({ user }, (err, res) => {
    if (err) {
      console.log(err);
    }
    return res;
  });

  const requests = await Request.find(
    { requester: user, status: ['approved', 'unapproved'] },
    (err, res) => {
      if (err) {
        console.log(err);
      }
      return res;
    }
  );

  const customPeriods = await customRanges.reduce((customPeriodResult, customPeriod) => {
    // For each date that exists in this period, sum the points
    const customPeriodPoints = entries.reduce((points, entry) => {
      const date = moment.tz(entry.date, 'US/Pacific');
      if (date.isBetween(customPeriod.startDate, customPeriod.endDate, 'day', '[]')) {
        // console.log('date: ');
        // console.log(date);
        // console.log('points: ');
        // console.log(entry.points);
        return points + entry.points;
      }
      return points;
    }, 0);

    let totalForPeriod;

    // IF we're counting from the start, subtract requests, since that's our running TOTAL.
    // Otherwise, we just want to know the number of points EARNED in that period.
    if (customPeriod.key === 'sinceStart') {
      console.log('The custom range is: ', customPeriod);
      const customPeriodRequests = requests.reduce((points, request) => {
        const date = moment.tz(request.timeRequested, 'US/Pacific');
        if (date.isBetween(customPeriod.startDate, customPeriod.endDate, 'day', '[]')) {
          return points + request.pointCost;
        }
        return points;
      }, 0);

      totalForPeriod = customPeriodPoints - customPeriodRequests;
    } else {
      totalForPeriod = customPeriodPoints;
    }

    customPeriodResult.push({
      key: customPeriod.key,
      startDate: customPeriod.startDate,
      endDate: customPeriod.endDate,
      points: totalForPeriod.toFixed(1),
      user
    });

    return customPeriodResult;
  }, []);

  return customPeriods;
}

// async function getSortedEntries(user, startDate, endDate) {
//   const sortedEntries = await Entry.find(
//     {
//       user,
//       date: {
//         $gte: startDate.toDate(),
//         $lte: endDate.toDate()
//       }
//     },
//     (err, res) => {
//       if (err) {
//         console.log(err);
//       }
//       // If we get the results back, reorder the dates
//       const sortedRes = _.orderBy(res, 'date', 'desc');
//       return sortedRes;
//     }
//   );
//   return sortedEntries;
// }

async function getPendingRequests(partner) {
  const requests = await Request.find(
    {
      requester: partner,
      status: 'unapproved'
    },
    (err, res) => {
      if (err) {
        console.log(err);
      }
      // If we get the results back, reorder the dates
      return res;
    }
  );
  return requests;
}

module.exports = {
  queryWeeksFromMongo,
  queryCustomPeriodsFromMongo,
  // getSortedEntries,
  getPendingRequests
};
