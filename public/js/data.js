/* global d3 */

const data = [90, 70, 50, 30, 10];

d3
  .select('#chart')
  .selectAll('div')
  .data(data)
  .attr('class', 'bar')
  .style('width', d => `${d}px`);
