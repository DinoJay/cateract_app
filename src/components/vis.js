import * as d3 from 'd3';
// import _ from 'lodash';
import textures from 'textures';

import { dateDiff } from './lib/utils';

import '../global_styles/style.scss';

const timeFormatStr = '%d/%m/%Y';
const formatDate = d3.timeFormat(timeFormatStr);
const parseDate = d3.timeParse(timeFormatStr);

const keys = ['shield', 'glasses', 'cabin'];
const timeFormat = d3.timeFormat('%Y/%m/%d %H:%M:%S %Z');

function d3TimeSwitch(timeIntervalStr) {
  switch (timeIntervalStr) {
  case 'days':
    return d3.timeDay;
  case 'months':
    return d3.timeMonth;
  case 'weeks':
    return d3.timeWeek;
  default:
    return d3.timeHour;
  }
}


function preprocess(d) {
  d.date = parseDate(d.date);

  d.protections = [
    // { key: 'equipment', value: parseFloat(d.usedEquipment) },
    { key: 'shield', value: parseFloat(d.ceilingShield) },
    { key: 'glasses', value: parseFloat(d.leadGlasses) },
    { key: 'cabin', value: parseFloat(d.radiationProtectionCabin) }
    // { key: 'no protections', value: 1 }
  ];

  d.totalProtection = parseFloat(d.usedEquipment) + parseFloat(d.ceilingShield)
    + parseFloat(d.leadGlasses) + parseFloat(d.radiationProtectionCabin);

  d.radiation = [
    { key: 'left eye', value: 1 - d.totalProtection },
    { key: 'right eye', value: (1 + 0.2) - d.totalProtection }
  ];

  d.protections.forEach((e) => {
    e.date = d3.timeHours(d.date);
    // e.used = _.random(0, 1) ? true : false;
  });
  d.equipment = parseFloat(d.usedEquipment);

  return d;
}


function update(data, dim, timeIntervalStr = 'days') {
  const d3TimeInterval = d3TimeSwitch(timeIntervalStr);
  console.log('d3TimeInterval', d3TimeInterval);
  // data.forEach(e => (e.date = d3TimeInterval(e.date)));

  const nestedData = d3.nest()
    .key(d => timeFormat(d3TimeInterval(d.date)))
    .entries(data)
    .map((e) => {
      e.date = new Date(e.key);
      return e;
    });

  console.log('nestedData', nestedData);

  const values = nestedData.reduce((acc, d) => acc.concat(d.values), []);

  const stacked = d3.stack()
                  .keys(keys)
                  .value((a, key) => {
                    const sum = d3.sum(a.values, e => e.protections.find(b => b.key === key).value);
                    return sum;
                  })(nestedData);

  const symbols = d3.scaleOrdinal()
                  .range(d3.symbols);

  const protColor = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeCategory10);

  const radDose = d3.scaleLinear()
    .domain(d3.extent(values, d => d.radiation[0].value))
    .range(['#ffff00', '#ff0000']);

  const dateExt = d3.extent(values, d => d.date);
  const dateTicks = dateDiff(dateExt[0], dateExt[1], timeIntervalStr);

  const yDate = d3.scaleTime()
    .domain(dateExt)
    .range([0, dim.height]);

  (function protectionBars() {
    d3.select('.prot-axis').call(d3.axisTop(d3.scaleLinear()
                .rangeRound([dim.width / 2 + dim.margin.center / 2, dim.width])
                .domain([0, 1])
                ).tickFormat(d3.format('.0%')
             )
        )
      .append('text')
      // .attr('x', 2)
      .attr('dy', '-30')
      .attr('dx', dim.width)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('font-size', 15)
      .attr('font-weight', 'bold')
      .text('protections');

    // right
    const barWidth = d3.scaleLinear()
      .rangeRound([0, (dim.width / 2) - (dim.margin.center / 2)])
      .domain([0, d3.max(data, d => d3.sum(d.protections, e => e.value))]);

    symbols.domain(['CA', 'CA+PCI', 'PVI', 'PM-Implantation']);

    // const label = d3.select('g.prot-right').selectAll('.labelbar')
    //   .data(data);
    //
    // const gLabelEnter = label.enter().append('g')
    //   .attr('class', 'labelbar');
    //
    // label.merge(gLabelEnter)
    //   .attr('transform', d => `translate(${dim.width + (dim.margin.center / 2)}, ${yDate(d.date)})`);
    //
    // gLabelEnter.append('path')
    //     // TODO: update
    //     .attr('d', d => d3.symbol().type(symbols(d.procedure))())
    //     .attr('transform', `translate(${(20)}, ${7})`)
    //     .attr('dx', 4)
    //     .attr('fill', 'grey');
    //
    // gLabelEnter.append('text')
    //     // TODO: update
    //     .attr('transform', `translate(${(40)}, ${10 / 2})`)
    //     .attr('class', 'label')
    // //     .attr('alignment-baseline', 'middle')
    //     .text(d => d.procedure);
    // //     .attr('dx', 20);

    const protCont = d3.select('g.prot-right').selectAll('.protCont')
      .data(stacked, e => e.key);

    protCont
      .enter()
      .append('g')
      .attr('class', e => `protCont ${e.key}`)
        // .append('path')
        // .attr('d', area)
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
        .attr('class', 'protBar')
        .attr('y', d => yDate(d.data.date) - (dim.height / dateTicks) / 2)
        .attr('x', d => dim.width / 2 + dim.margin.center / 2 + barWidth(d[0]))
        .attr('width', d => barWidth(d[1]) - barWidth(d[0]))
        // TODO: bandwidth
        .attr('height', dim.height / dateTicks - 5)
        // .attr('height', 10)
        // .style('fill', d => protColor(d.data.protections.find(e => d[1] === e.value).value))
        .style('fill', function() {
          return protColor(d3.select(this.parentNode).datum().key);
        })
        .on('mouseover', (d) => {
          // d3.select(this)
          //   .attr('y', e => yDate(e.data.date) - (dim.height / dateTicks) / 2)
          //   .transition(2000)
          //   .attr('height', dim.height / dateTicks - 5)
          //   .attr('height', 100)
          //   .attr('y', e => yDate(e.data.date) - 100 / 2);
          // console.log('mouseover', d.data.equipmentName);
        })
        .on('click', () => update(data, dim, 'weeks'));
      //   .style('stroke', 'black')
      //   .on('click', function(d) {
      //     console.log('parent data', d, d3.select(this.parentNode).datum().key);
      //   });

    (function timeLine() {
      (function dateAxis() {
        const yAxis = d3.select('.date-axis')
      .call(d3.axisLeft(yDate)
        .tickFormat(formatDate)
        .ticks(d3TimeInterval.every(1))
        .tickPadding(-2)
        // .tickSize(0)
      )
      .attr('transform', `translate(${dim.width / 2},0)`);

        yAxis.selectAll('g text')
      .attr('font-size', 15)
      .attr('text-anchor', 'middle');

    // yAxis.select("path.domain")
      // .attr('dx', function() {
      //   var w = this.getBBox().width;
      //   console.log("w", w);
      //   return -w/4;
      //
      // })
        yAxis.append('text')
      // .attr('x', 2)
      .attr('dy', '-30')
      // .attr('dx', '10')
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('font-size', 15)
      .attr('font-weight', 'bold')
      .text('Time');
      }());

      const equipCont = d3.select('g.center').selectAll('.equip-value')
      .data(nestedData, d => d.date);
      const radius = (dim.height / dateTicks) / 2;

      console.log('radius', radius, 'height', dim.height, 'dateTicks', dateTicks);

      equipCont.enter()
      .append('circle')
        .attr('class', d => d.key)
        .attr('cx', dim.width / 2)
        .attr('cy', d => yDate(d.date))

          // .attr('y', d => yDate(d.data.date) - (height / dateTicks) / 2)
        // .attr('width', 20)
        .attr('r', radius)
        // .attr('fill', d => radDose(d.value))
        .style('fill', 'blue')
        // .style('opacity', d => ((d.key === 'right eye') ? 0.2 : 1))
        .style('stroke', 'black')
        .on('click', () => update(data, dim));
    }());
    //
  }());

  (function radiationBars() {
    // const stack = d3.stack();
    // stack
    //   .keys(keys)
    //   .value((a, key) => a.protections.find(b => b.key === key).value);

    const xRadLeft = d3.scaleLinear()
      .rangeRound([(dim.width / 2) - (dim.margin.center / 2), 0])
      .domain([0, 1]);

    // g.append('g')
    //         .attr('class', 'grid')
    //         .attr('transform', `translate(0,${height})`)
    //         .call(d3.axisTop(xRadLeft)
    //             .tickSize(height, 0, 0)
    //             .tickFormat('')
    //         );

    d3.select('.left').selectAll('.radCont')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'radCont')
      .selectAll('rect')
      .data(d => d.radiation)
      .enter()
      .append('rect')
        .attr('class', d => d.key)
        .attr('x', d => xRadLeft(d.value))
        .attr('y', function() {
          return yDate(d3.select(this.parentNode).datum().date) - (dim.height / dateTicks) / 2;
        })

          // .attr('y', d => yDate(d.data.date) - (height / dateTicks) / 2)
        .attr('width', d => xRadLeft(0) - xRadLeft(d.value))
        .attr('height', dim.height / dateTicks - 5)
        // .attr('fill', d => radDose(d.value))
        .style('fill', (d) => {
          if (!d.used) {
            const tx = textures.lines()
              .thicker().stroke(radDose(d.value));
            d3.select('svg').call(tx);
            return tx.url();
          }
          return radDose(d.value);
        })
        .style('opacity', d => ((d.key === 'right eye') ? 0.2 : 1))
        .style('stroke', 'black')
        .on('click', () => update(data, dim));


    d3.select('.rad-axis')
        // .attr('transform', `translate(0,${height})`)
        .call(d3.axisTop(xRadLeft).tickFormat(d3.format('.0%')))
        // .transition().duration(1500)
        // .ease('sin-in-out')
        .append('text')
      // .attr('x', 2)
      .attr('dy', '-30')
      // .attr('dx', width)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('font-size', 15)
      .attr('font-weight', 'bold')
      .text('Radiation');
    // gLeft.append('g')
    //     .attr('class', 'axis axis--x')
    //     .attr('transform', `translate(0,${height})`)
    //     .call(d3.axisBottom(yBand));

    //
    // g.append('g')
    //     .attr('class', 'axis axis--y')
    //     .call(d3.axisLeft(xRadLeft).ticks(10, 's'))
    //   .append('text')
    //     .attr('x', 2)
    //     .attr('y', xRadLeft(xRadLeft.ticks(10).pop()))
    //     .attr('dy', '0.35em')
    //     .attr('text-anchor', 'x0')
    //     .attr('fill', '#000')
    //     .text('Population');
  }());
}

function create(svg, rawData) {
  const data = rawData.map(preprocess);
  // const svg = d3.select('#app').append('svg')
  //           .attr('width', 1200)
  //           .attr('height', 800);

  const margin = { top: 80, right: 250, bottom: 80, left: 80, center: 100 };

  const width = +svg.attr('width') - margin.left - margin.right;
  const height = +svg.attr('height') - margin.top - margin.bottom;

  const dim = { width, height, margin };

  const gMain = svg
            .append('g')
            .attr('class', 'main')
            .attr('transform', `translate(${margin.left / 2},${margin.top / 2})`);

  gMain.append('g')
            .attr('class', 'left')
            .attr('transform', `translate(${0},${margin.top / 2})`);

  const gCenter = gMain.append('g')
            .attr('class', 'center')
            .attr('transform', `translate(${0},${margin.top / 2})`);

  gMain.append('g')
            .attr('class', 'prot-right')
            .attr('transform', `translate(${0},${margin.top / 2})`);

  gMain.append('g')
      .attr('class', 'prot-axis axis-x');

  gCenter.append('g')
      .attr('class', 'date-axis axis-y');

  gMain.append('g')
      .attr('class', 'rad-axis axis-x');

// const yProcedure = d3.scaleBand()
//     .rangeRound([0, height])
//     .padding(0.1);

  const legend = gMain.append('g')
    .attr('transform', `translate(0,${height})`)
    .selectAll('.legend')
    .data(keys)
    .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0,${i * 20})`)
      .style('font', '10px sans-serif');

  const protColor = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeCategory10);
  //
  legend.append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', protColor);

  legend.append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .text(d => d);

  update(data, dim);

  // TODO: sort data
  // console.log('textures', textures);
  // data.reduce((acc, d) => {
  // });

  // data.sort((a, b) => b.total - a.total);
}


export { create, update };
