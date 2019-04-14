export function formatDateObject(date) {
  if (!(date instanceof Date)) {
    throw new Error('You must supply a Date object to format to YYYY-MM-DD.');
  }
  return date.toISOString().slice(0, 10);
}

export function getPrevDayFormatted(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const previousDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() - 1);

  return formatDateObject(previousDate);
}

// getDatesBetween ideated from:
// https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
/**
 * Take in two dates and return an array of the dates between them inclusive
 *
 * @param {Date} startDate - the first date you wish to include
 * @param {Date} stopDate - the last date you wish to include
 * @returns {Date[]} - an array of dates between the two dates specified, inclusive
 */
export function getDatesBetweenFormatted(startDate, stopDate) {
  const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const stopDateObj = typeof stopDate === 'string' ? new Date(stopDate) : stopDate;

  const dateArray = [startDateObj];
  let currentDate = startDateObj;
  while (currentDate <= stopDateObj) {
    dateArray.push(new Date(currentDate));
    const date = new Date(currentDate);
    currentDate = date.setDate(date.getDate() + 1);
  }
  return dateArray.map(date => formatDateObject(date));
}
