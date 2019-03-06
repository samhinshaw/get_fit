import { Session } from 'mfp';
import _ from 'lodash';

import {
  exerciseMappings,
  exerciseGroups,
  exerciseGroupPoints,
} from './exercises.const';
import { getPrevDayFormatted, getDatesBetweenFormatted } from '../methods/dates-functions';

export async function getGoals(session, startDate, endDate) {
  const response = await session.fetchGoals(endDate);

  const userGoals = response.items[0];

  // userGoals.updated_at gives the precise timestamp of the update
  // userGoals.valid_from gives the date that change became valid

  // Base Case #1
  // If we requested goals from a date before we set goals (e.g. before we
  // opened our account), the MFP API will simply return the most recent goal.
  // This can lead to unexpected behavior, so we will treat that goal as if it
  // were valid from the start date (dateRangeStart = startDate)
  // Base Case #2
  // Our user's goals are valid from before our start date,
  // or were set on the same day
  const isBaseCase =
    new Date(userGoals.valid_from) > new Date(endDate) ||
    new Date(userGoals.valid_from) <= new Date(startDate);

  // If this is our base case, we want to finish up, so we will grab dates from the start date
  const dateRangeStart = isBaseCase ? startDate : userGoals.valid_from;

  const dates = getDatesBetweenFormatted(dateRangeStart, endDate);

  // Create Map to hold date ranges as keys and the goals as values
  const goalsForDateRanges = new Map([[`${dateRangeStart}--${endDate}`, userGoals]]);

  // Create Map to hold dates as keys and the date ranges for the goals as values
  const dateRanges = new Map(dates.map(date => [date, `${dateRangeStart}--${endDate}`]));

  if (isBaseCase) {
    // return the array of dates and the range they correspond to
    // then return the goals for that range
    return {
      ranges: dateRanges,
      goals: goalsForDateRanges,
    };
  }

  // Otherwise, get the next set of goals (one day previous)
  const newEndDate = getPrevDayFormatted(userGoals.valid_from);

  const { ranges, goals } = await getGoals(session, startDate, newEndDate);

  return {
    ranges: new Map([...dateRanges, ...ranges]),
    goals: new Map([...goalsForDateRanges, ...goals]),
  };
}

/**
 * Get a user's data for the specified date range
 *
 * @param {string} username The user's MFP username
 * @param {string} [password=''] (optional) The user's MFP password
 * @param {string} startDate (YYYY-MM-DD) Either the date of interest or the
 * first date in the range of interest.
 * @param {string} [endDate=startDate] (YYYY-MM-DD, optional) The last date in
 * the range of interest. If unspecified, defaults to the startDate.
 * @returns
 */
export async function getDiaryData(session, fields, startDate, endDate = startDate) {
  const dateRange = await session.fetchDateRange(fields, startDate, endDate);

  return dateRange;
}

export async function authMFP(username, password = '') {
  const session = new Session(username);

  if (!password) {
    return session;
  }
  return session.login(password);
}
export function calculatePoints(entry) {
  let exercisePoints;
  if (!_.get(entry, 'exercise.cardiovascular.exercises')) {
    exercisePoints = 0;
  } else {
    entry.exercise.cardiovascular.exercises.forEach(exercise => {
      console.log(exercise);
      try {
        const mappedName = partialMatch(exercise.name.toLowerCase());
        console.log(mappedName);
        const exerciseName = exerciseMappings.get(mappedName) || '';
        const exerciseMinutes = exercise.minutes || 0;
        const exerciseGroup = exerciseGroups.get(exerciseName) || '';
        const pointsPerHour = exerciseGroupPoints.get(exerciseGroup) || 0;

        const totalPoints = pointsPerHour * (exerciseMinutes / 60);

        exercisePoints += totalPoints;
      } catch (err) {
        console.error(err);
      }
    });
  }
  return 0 + exercisePoints;
}
