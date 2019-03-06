export default function parseDateRange(dateString) {
  // parse date that was POSTed as string
  // Wait, we're passing the string directly to python, so is this even necessary?
  // const postedDate = moment.utc(dateString, 'YYYY-MM-DD');
  let startDate;
  let endDate;

  // A single date was POST-ed
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    startDate = dateString;
    endDate = dateString;
    // a date range was POST-ed
  } else if (/^\d{4}-\d{2}-\d{2} \d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const date = dateString.split(' ');
    [startDate, endDate] = date;
    // This is array destructuring! It is equivalent to the below:
    // startDate = date[0];
    // endDate = date[1];
  }

  return [startDate, endDate];
}
