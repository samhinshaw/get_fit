/* global d3 */
/* global moment */

// async function asyncQuery() {
//   const response = await $.getJSON('/api/user_weight/', json => json);
//   return response;
// }

// asyncQuery('/api/user_weight')
//   .then(data => console.log(data))
//   .catch(reason => console.log(reason.message));

// const data = [
//   { name: 'Alice', math: 93, science: 84 },
//   { name: 'Bobby', math: 81, science: 97 },
//   { name: 'Carol', math: 74, science: 88 },
//   { name: 'David', math: 64, science: 76 },
//   { name: 'Emily', math: 80, science: 94 }
// ];

// Initialize Moment-Range
window['moment-range'].extendMoment(moment);

// Set up dates
const now = moment.tz('US/Pacific');
const today = now.clone().startOf('day');
// const twoWeeksAgo = today.clone().subtract(14, 'days');
const twoWeeksFromNow = today.clone().add(14, 'days');
const oneMonthAgo = today.clone().subtract(1, 'months');

// Enable custom domain?
// const dateRange = [oneMonthAgo.toDate(), twoWeeksFromNow.toDate()];
// const momentRange = moment.range(oneMonthAgo, twoWeeksFromNow);
// const dateRange = [new Date(2017, 10, 1), new Date(2018, 6, 30)];
const dateRange = false;

// Set D3 locale

// const locale = d3.timeFormatLocale({
//   dateTime: '%x, %X',
//   date: '%-m/%-d/%Y',
//   time: '%-I:%M:%S %p',
//   periods: ['AM', 'PM'],
//   days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
//   shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
//   months: [
//     'January',
//     'February',
//     'March',
//     'April',
//     'May',
//     'June',
//     'July',
//     'August',
//     'September',
//     'October',
//     'November',
//     'December'
//   ],
//   shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// });

$.getJSON('/api/user_weight/', json => {
  // Pre-parse date
  const data = [];
  // const parseDate = locale.parse('%B %d, %Y at %I:%M%p%Z');
  // example: June 07, 2017 at 09:01AM
  // parseDate('June 07, 2017 at 09:01AM-0700');

  // const map = d3.map(json.rows, d => formatDate(parseDate(`${d.date}-0700`)));
  // console.log(map);

  if (dateRange) {
    // if we're using a custom domain...
    json.rows.forEach(d => {
      // only add to the array if the the date falls within our custom domain
      if (moment.tz(d.date, 'MMMM DD, YYYY [at] hh:mmA', 'US/Pacific').within(momentRange)) {
        data.push({
          date: moment.tz(d.date, 'MMMM DD, YYYY [at] hh:mmA', 'US/Pacific').toDate(),
          weight: +d.weight
        });
      }
    });
    // if we're not using a custom domain, just push all the dates
  } else {
    json.rows.forEach(d => {
      data.push({
        date: moment.tz(d.date, 'MMMM DD, YYYY [at] hh:mmA', 'US/Pacific').toDate(),
        weight: +d.weight
      });
    });
  }

  // console.log(data);

  // const nestedData = d3
  //   .nest()
  //   .key(d => parseDate(`${d.date}-0700`)) // tack on pacific TZ
  //   .entries(data);

  const margin = { top: 20, right: 80, bottom: 60, left: 50 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const xAxis = d3.axisBottom().scale(x);
  const yAxis = d3.axisLeft().scale(y);

  // const color = d3.scale.category10();

  const svg = d3
    .select('#chart')
    .append('svg')
    .classed('svg-container', true) // container class to make it responsive
    // responsive SVG needs these 2 attributes and no width and height attr
    .attr('preserveAspectRatio', 'xMinYMin meet')
    // Viewbox is [min-x, min-y, width, height]
    .attr(
      'viewBox',
      `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
    )
    // class to make it responsive
    .classed('svg-content-responsive', true)
    // INSTEAD of setting height & width, use viewbox
    // .attr('width', width + margin.left + margin.right)
    // .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  function drawMainGraph() {
    const line = d3
      .line()
      .x(d => x(d.date))
      .y(d => y(d.weight));

    if (dateRange) {
      // Custom Domains
      x.domain(dateRange).clamp(true);
      y.domain([150, 190]);
    } else {
      // Automatic Domains
      x.domain(d3.extent(data, d => d.date));
      // y.domain(d3.extent(data, d => d.weight));
      y.domain([d3.min(data, d => d.weight) - 1, d3.max(data, d => d.weight) + 1]);
    }

    svg
      .append('g')
      .style(
        'font-family',
        "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
      )
      .style('font-size', '12px')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis.tickFormat(d3.timeFormat('%d %b %Y')))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg
      .append('g')
      .style(
        'font-family',
        "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
      )
      .style('font-size', '12px')
      .attr('class', 'y axis')
      .call(yAxis);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)
      .attr('d', line);
  }

  drawMainGraph();
});
