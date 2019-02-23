import { Session } from 'mfp';

const DATA_OF_INTEREST = { exercise: true, food: true };
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
async function getMfpData(username, password = '', startDate, endDate = startDate) {
  const session = new Session(username);

  if (!password) {
    console.log('No password was supplied');
    return session.fetchDateRange(DATA_OF_INTEREST, startDate, endDate);
  }
  const authSession = await session.login(password);
  return authSession.fetchDateRange(DATA_OF_INTEREST, startDate, endDate);
}

export default getMfpData;
