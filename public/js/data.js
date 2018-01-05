/* global d3 */

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

// Set D3 locale

const locale = d3.timeFormatLocale({
  dateTime: '%x, %X',
  date: '%-m/%-d/%Y',
  time: '%-I:%M:%S %p',
  periods: ['AM', 'PM'],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
});

$.getJSON('/api/user_weight.json/', json => {
  // Pre-parse date
  const data = [];
  const parseDate = locale.parse('%B %d, %Y at %I:%M%p%Z');
  // const formatDate = locale.format('%s');
  // example: June 07, 2017 at 09:01AM
  // dateFormat('June 07, 2017 at 09:01AM-0700');

  // const map = d3.map(json.rows, d => formatDate(parseDate(`${d.date}-0700`)));
  // console.log(map);

  json.rows.forEach(d => {
    data.push({
      date: parseDate(`${d.date}-0700`),
      weight: +d.weight
    });
  });
  // console.log(data);

  // const nestedData = d3
  //   .nest()
  //   .key(d => parseDate(`${d.date}-0700`)) // tack on pacific TZ
  //   .entries(data);

  const margin = { top: 20, right: 80, bottom: 60, left: 50 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = d3
    .scaleTime()
    // .domain([new Date(2016, 11, 1), new Date(2018, 6, 30)])
    .range([0, width]);

  const y = d3
    .scaleLinear()
    // .domain([150, 190])
    .range([height, 0]);

  const xAxis = d3.axisBottom().scale(x);
  const yAxis = d3.axisLeft().scale(y);

  // const color = d3.scale.category10();

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  function drawMainGraph() {
    const line = d3
      .line()
      .x(d => x(d.date))
      .y(d => y(d.weight));

    x.domain(d3.extent(data, d => d.date));
    y.domain(d3.extent(data, d => d.weight));
    // y.domain([150, 190]);

    svg
      .append('g')
      .style(
        'font-family',
        "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
      )
      .style('font-size', '12px')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis.tickFormat(d3.timeFormat('%b %Y')))
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
