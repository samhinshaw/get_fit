// import Moment from 'moment-timezone';
// import { extendMoment } from 'moment-range';
import { parse, startOfDay, subYears, addDays, isWithinRange, format } from 'date-fns';
// import * as d3 from 'd3';
import { scaleLinear, scaleTime } from 'd3-scale';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { nest } from 'd3-collection';
// import { min, max, extent } from 'd3-array';
import { extent, mean } from 'd3-array';
import { timeFormat } from 'd3-time-format'; // timeFormatLocale, parseDate
import { select, event } from 'd3-selection';
import { transition } from 'd3-transition'; // eslint-disable-line no-unused-vars
import { line } from 'd3-shape';
// import { map, nest } from 'd3-collection';

// Little micro-library for what is essentially `seq()` in R
import rangeInclusive from 'range-inclusive';

// Import CSS
import '../css/d3.css';

// const moment = extendMoment(Moment);

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
const now = parse(new Date().toLocaleString('en-US', { timeZone: 'America/Vancouver' }));
const today = startOfDay(now);

// Set start & end
const startDate = subYears(today, 1);
const endDate = addDays(today, 7);

// Enable custom domain?
const dateRange = [startDate, endDate];
const weightRange = {
  start: 150,
  end: 175,
  seqMajor: 5,
  seqMinor: 1,
};

$.getJSON('/api/user_weight/', json => {
  // Pre-parse date
  const data = [];
  // const parseDate = locale.parse('%B %d, %Y at %I:%M%p%Z');
  // example: June 07, 2017 at 09:01AM
  // parseDate('June 07, 2017 at 09:01AM-0700');

  // const map = map(json.rows, d => formatDate(parseDate(`${d.date}-0700`)));
  // console.log(map);

  json.rows.forEach(d => {
    // Use String.prototype.split() to split on the ' at ' in the middle, taking
    // the first part and throwing away the timestamp. With date-fns 2.0, should
    // be able to `parse()` directly, with something like:
    // parse(d.date, 'MMMM DD, YYYY [at] hh:mmA')
    // parse(`${d.date}-0700`, 'MMMM DD, YYYY [at] hh:mmAZZ')
    const rowDate = parse(
      new Date(d.date.split(' at ')[0]).toLocaleString('en-US', {
        timeZone: 'America/Vancouver',
      })
    );
    // if we're using a custom domain...
    // only add to the array if the the date falls within our custom domain
    if (dateRange) {
      if (isWithinRange(rowDate, startDate, endDate)) {
        data.push({
          date: rowDate,
          weight: +d.weight,
        });
      }
      // if we're not using a custom domain, just push all the dates
    } else {
      data.push({
        date: rowDate,
        weight: +d.weight,
      });
    }
  });

  // console.log(data);

  // Use nest()'s .key() and .rollup(), which are similar to group_by() and summarize()
  // with help from http://learnjsdata.com/group_data.html
  const nestedData = nest()
    .key(d => d.date) // nest by key
    .rollup(v => mean(v, d => d.weight)) // return the mean weight from each date (2 fns!)
    .entries(data) // apply this to the data array previously defined
    .map(d => ({
      // finally, instead of returning {"key": "", "value": "" }
      date: parse(d.key), // return a parsed data (it was coerced to chr)
      weight: d.value, // and the weight as "weight"
    }));

  const margin = {
    top: 40,
    right: 80,
    bottom: 80,
    left: 50,
  };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = scaleTime().range([0, width]);
  const y = scaleLinear().range([height, 0]);

  const xAxis = axisBottom().scale(x);

  // const color = scale.category10();

  const svg = select('#chart')
    .append('div')
    .classed('svg-container', true) // container class to make it responsive
    .append('svg')
    // responsive SVG needs these 2 attributes and no width and height attr
    .attr('preserveAspectRatio', 'xMinYMin meet')
    // viewBox is [min-x, min-y, width, height]
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
    if (dateRange) {
      // Date Range
      x.domain(dateRange).clamp(true);
      // y.domain([min(nestedData, d => d.weight) - 1, max(nestedData, d => d.weight) + 1]);
      y.domain([weightRange.start, weightRange.end]);
    } else {
      // All Dates
      x.domain(extent(nestedData, d => d.date));
      y.domain([weightRange.start, weightRange.end]);
      // y.domain(extent(nestedData, d => d.weight));
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

    // Create the y-axis major ticks
    svg
      .append('g')
      .style('font-size', '0.9rem')
      .attr('class', 'y-axis')
      .attr('class', 'major-ticks')
      .call(
        axisRight()
          .scale(y)
          .tickSize(width)
          .tickValues(rangeInclusive(weightRange.start, weightRange.end, weightRange.seqMajor))
      );

    // Create the y-axis minor ticks
    svg
      .append('g')
      .attr('class', 'y-axis')
      .attr('class', 'minor-ticks')
      .call(
        axisLeft()
          .scale(y)
          .tickSize(-width)
          .tickValues(rangeInclusive(weightRange.start, weightRange.end, weightRange.seqMinor))
      );

    // Remove text from minor ticks
    svg
      .select('.minor-ticks')
      .selectAll('.tick text')
      .remove();

    // Make the major ticks thick
    svg
      .select('.major-ticks')
      .selectAll('.tick line')
      .attr('stroke-width', 2);

    // Make the y-axis major ticks
    // svg
    //   .select('.minor-ticks')
    //   .selectAll('.tick line')
    //   .attr('stroke-width', 1);

    // Add a div to show on mouseover
    // This can't be within the SVG since it's a div
    // But perhaps we could change this to a rect + text element
    const tooltip = select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('font-size', '0.9rem')
      .style('background-color', 'steelblue')
      .style('color', '#f0f0f0')
      .style('padding', '0 0.3rem 0 0.3rem')
      .style('border-radius', '3px')
      .style('opacity', 0);

    // Chart's line
    const chartLine = line()
      .x(d => x(d.date))
      .y(d => y(d.weight));

    // Draw the actual data!
    svg
      .append('path')
      .datum(nestedData)
      .attr('d', chartLine)
      .attr('id', 'weight-line');

    // Make points to overlay on line
    const points = svg.append('g').selectAll('circle');

    // Attach data to points
    points
      .data(nestedData)
      .enter()
      .append('circle')
      // .attr('r', 2)
      // .attr('fill', 'steelblue')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.weight))
      .on('mouseover', d => {
        tooltip
          .transition()
          .duration(200)
          .style('opacity', 1);
        tooltip
          .html(d.weight)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        tooltip
          .transition()
          .delay(500)
          .duration(500)
          .style('opacity', 0);
      });

    // add constant params (not dependent on data)
    svg
      .selectAll('circle')
      .attr('r', 3)
      .attr('fill', 'steelblue');

    svg
      .select('#weight-line')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5);
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
    .text(`Weight Change (${format(startDate, 'MMM YYYY')} - ${format(endDate, 'MMM YYYY')})`);

  // x-axis labels
  svg
    .append('text')
    .attr('transform', `translate(${width / 2} ,${height + margin.top + 40})`)
    .style('text-anchor', 'middle')
    .style('font-size', '1.15rem')
    .text('Date');

  // y-axis labels

  const yAxisLabelPosition = {
    x: width + margin.right,
    y: height / 2,
  };
  svg
    .append('text')
    .attr('x', yAxisLabelPosition.x)
    .attr('y', yAxisLabelPosition.y)
    .attr('dy', '1em')
    // The 2nd and 3rd arguments to rotate are `cx` and `cy`, which tell rotate
    // what coordinates to rotate about! Otherwise this will rotate them
    // **around the chart's origin**!!!
    .attr('transform', `rotate(90,${yAxisLabelPosition.x},${yAxisLabelPosition.y})`)
    .attr('id', 'y-axis-label')
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

  // Make the y-axis tick lines we want
  // svg
  //   .append('g')
  //   .attr('class', 'grid')
  //   .call(
  //     make_y_gridlines()
  //       .tickSize(-width)
  //       .tickFormat('')
  //   );

  drawMainGraph();
});
