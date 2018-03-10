// Script to calculate the number of points our user has!
// Calculate and bring in our points of interest!
// const mongoose = require('mongoose');
import Moment from 'moment-timezone';
import { extendMoment } from 'moment-range';
// const _ = require('lodash');
// const config = require('../config/database');
// const async = require('async');
// Bring in user models
import Entry from '../models/entry';
import Request from '../models/request';
import logger from '../methods/logger';

const moment = extendMoment(Moment);

// Initialize Moment & Today Object
moment().format();

// export async function queryWeeksFromMongo(user) {
//   // First get all db entries for that user

//   const entries = await Entry.find({ user }, (err, res) => {
//     if (err) {
//       logger.error(err);
//     }
//     return res;
//   });

//   // or remove redundancies in-line
//   const weekMondays = await entries.reduce((weeks, entry) => {
//     const monday = moment.tz(entry.date, 'US/Pacific').startOf('isoweek');

//     // const weekPeriod = entry.reduce;
//     // can't compare moments directly, so we have to use moment's
//     // built in comparisons
//     if (weeks.length === 0) {
//       weeks.push(monday);
//     } else if (weeks.length === 1) {
//       if (!weeks[0].isSame(monday, 'day')) {
//         weeks.push(monday);
//       }
//     } else {
//       const min = moment.min(weeks);
//       const max = moment.max(weeks);
//       if (!monday.isBetween(min, max, 'day', '[]')) {
//         weeks.push(monday);
//       }
//     }
//     return weeks;
//   }, []);

//   const weekPeriods = await weekMondays.reduce((weekPeriodResult, monday, index) => {
//     const sunday = monday
//       .clone()
//       .endOf('week')
//       .startOf('day');

//     // For each date that exists in this period, sum the points
//     const weekPoints = entries.reduce((points, entry) => {
//       const date = moment.tz(entry.date, 'US/Pacific');
//       if (date.isBetween(monday, sunday, 'day', '[]')) {
//         return points + entry.points;
//       }
//       return points;
//     }, 0);

//     weekPeriodResult.push({
//       key: `Week ${index + 1}`,
//       startDate: monday,
//       endDate: sunday,
//       points: weekPoints.toFixed(1),
//       user
//     });

//     return weekPeriodResult;
//   }, []);

//   return weekPeriods;
// }

// Old method would pass in all custom periods. New method passes in one custom
// period at a time
export async function queryCustomPeriodsFromMongo(user, customRange) {
  // First get all db entries for that user
  const entries = await Entry.find(
    {
      date: {
        $gte: customRange.startDate.toDate(),
        $lte: customRange.endDate.toDate()
      },
      user
    },
    // for now JUST return the number of points!
    { points: 1 },
    (err, res) => {
      if (err) {
        logger.error(err);
      }
      return res;
    }
  );

  const requests = await Request.find(
    {
      timeRequested: {
        $gte: customRange.startDate.toDate(),
        $lte: customRange.endDate.toDate()
      },
      requester: user,
      status: ['approved', 'unapproved']
    },
    // just return the number of points
    { pointCost: 1 },
    (err, res) => {
      if (err) {
        logger.error(err);
      }
      return res;
    }
  );

  // For each date that exists in this period, sum the points
  const customPeriodPoints = entries.reduce((points, entry) => points + entry.points, 0);

  let totalForPeriod;

  // IF we're counting from the start, subtract requests, since that's our
  // running TOTAL. Otherwise, we just want to know the number of points EARNED
  // in that period. Note to self: this should probably NOT BE HARDCODED. Could
  // be another argument passed, like a boolean value on whether to subtract
  // requests
  if (customRange.key === 'sinceStart') {
    const customPeriodRequests = requests.reduce(
      (points, request) => points + request.pointCost,
      0
    );
    totalForPeriod = customPeriodPoints - customPeriodRequests;
  } else {
    totalForPeriod = customPeriodPoints;
  }

  return {
    key: customRange.key,
    startDate: customRange.startDate,
    endDate: customRange.endDate,
    points: totalForPeriod.toFixed(1),
    user
  };
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
//         logger.error(err);
//       }
//       // If we get the results back, reorder the dates
//       const sortedRes = _.orderBy(res, 'date', 'desc');
//       return sortedRes;
//     }
//   );
//   return sortedEntries;
// }

export async function getPendingRequests(partner) {
  const requests = await Request.find(
    {
      requester: partner,
      status: 'unapproved'
    },
    (err, res) => {
      if (err) {
        logger.error(err);
      }
      // If we get the results back, reorder the dates
      return res;
    }
  );
  return requests;
}
