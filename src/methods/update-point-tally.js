import User from '../models/user';

/**
 *
 *
 * @param {string} username - the username of the user to get the current points for
 * @returns
 */
export async function getPoints(username) {
  const userEntry = await User.findOne({ username }, { currentPoints: true });

  return parseFloat(userEntry.currentPoints);
}

/**
 * Update point tally on the response object and set a cookie
 *
 * @param {object} res - the Express response object to be modified
 * @param {object} pointTally - the point value tally
 */
export async function setPointsCookie(res, pointTally) {
  // make the point tallies array available to the view engine
  res.locals.pointTally = pointTally;
  // And set a cookie to save on the front end
  res.cookie(`pointTally`, pointTally, {
    // expire tonight (when nightly update runs)
    expires: res.locals.tonight.toDate(),
    signed: false,
    sameSite: 'strict',
    // only set to secure in production
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Get the current point value of a user and update it on the response object and set a cookie
 *
 * @param {object} res - the response object to set the point tally and cookie on
 * @param {string} username - the username to get & set the points for
 */
export async function updatePointTally(res, username, partnerUsername) {
  const pointTally = {
    user: await getPoints(username),
    partner: await getPoints(partnerUsername),
  };
  return setPointsCookie(res, pointTally);
}
