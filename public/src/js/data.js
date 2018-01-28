import Moment from 'moment-timezone';
import { extendMoment } from 'moment-range';
// import * as d3 from 'd3';
import { scaleLinear, scaleTime } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { min, max, extent } from 'd3-array';
import { timeFormat } from 'd3-time-format'; // timeFormatLocale, parseDate
import { select } from 'd3-selection'; // timeFormatLocale
import { line } from 'd3-shape'; // timeFormatLocale
// import { map, nest } from 'd3-collection';

// Import CSS
import '../css/d3.css';

const moment = extendMoment(Moment);

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

// Set up dates
const now = moment.tz('US/Pacific');
const today = now.clone().startOf('day');

// Set stard & end
const startDate = today.clone().subtract(1, 'years');
const endDate = today.clone().add(7, 'days');

// Enable custom domain?
const dateRange = [startDate.toDate(), endDate.toDate()];
// const momentArray = [startDate, endDate];
const momentRange = moment.range(startDate, endDate);
// const dateRange = [new Date(2017, 10, 1), new Date(2018, 6, 30)];
// const dateRange = false;

// Set D3 locale

// const locale = timeFormatLocale({
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

  // const map = map(json.rows, d => formatDate(parseDate(`${d.date}-0700`)));
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

  // const nestedData = nest()
  //   .key(d => parseDate(`${d.date}-0700`)) // tack on pacific TZ
  //   .entries(data);

  const margin = { top: 40, right: 80, bottom: 80, left: 50 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = scaleTime().range([0, width]);
  const y = scaleLinear().range([height, 0]);

  const xAxis = axisBottom().scale(x);
  const yAxis = axisLeft()
    .scale(y)
    .tickSize(-width);

  // const color = scale.category10();

  const svg = select('#chart')
    .append('div')
    .classed('svg-container', true) // container class to make it responsive
    .append('svg')
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
    const chartLine = line()
      .x(d => x(d.date))
      .y(d => y(d.weight));

    if (dateRange) {
      // Date Range
      x.domain(dateRange).clamp(true);
      y.domain([min(data, d => d.weight) - 1, max(data, d => d.weight) + 1]);
    } else {
      // All Dates
      x.domain(extent(data, d => d.date));
      y.domain([150, 190]);
      // y.domain(extent(data, d => d.weight));
    }

    // Create the x-axis and its ticks
    svg
      .append('g')
      .style('font-size', '0.9rem')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      // .call(xAxis.tickFormat(timeFormat('%d %b %Y')))
      // At 1yr scale, don't need day of month
      .call(xAxis.tickFormat(timeFormat('%b %Y')))
      .selectAll('text')
      .attr('transform', 'translate(10,5) rotate(-25)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');

    // Create the y-axis and its ticks
    svg
      .append('g')
      .style('font-size', '0.9rem')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Draw the actual data!
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)
      .attr('d', chartLine);
  }

  // Chart Title
  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', 0 - margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '1.5rem')
    // .style('text-decoration', 'underline')
    // .text(`Weight Change (${momentArray[0].format('MMM Do')} to ${today.format('MMM Do')})`);
    .text(`Weight Change (past year)`);

  // x-axis labels
  svg
    .append('text')
    .attr('transform', `translate(${width / 2} ,${height + margin.top + 40})`)
    .style('text-anchor', 'middle')
    .style('font-size', '1.15rem')
    .text('Date');

  // y-axis labels
  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('font-size', '1.15rem')
    .text('Weight (lbs)');

  // add the x-axis grid lines
  svg
    .append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${height})`)
    .call(
      axisBottom(x)
        .ticks(1)
        .tickSize(-height)
        .tickFormat('')
    );

  drawMainGraph();
});
