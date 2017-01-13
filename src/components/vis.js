import * as d3 from 'd3';
// import _ from 'lodash';
import textures from 'textures';

import '../global_styles/style.scss';

const timeFormatStr = '%d/%m/%Y';
const formatDate = d3.timeFormat(timeFormatStr);
const parseDate = d3.timeParse(timeFormatStr);

const keys = ['equipment', 'shield', 'glasses', 'cabin'];

function preprocess(d) {
  d.date = parseDate(d.date);

  d.protection = [
    { key: 'equipment', value: d.usedEquipment },
    { key: 'shield', value: d.ceilingShield },
    { key: 'glasses', value: d.leadGlasses },
    { key: 'cabin', value: d.radiationProtectionCabin }
    // { key: 'no protection', value: 1 }
  ];

  d.totalProtection = parseFloat(d.usedEquipment) + parseFloat(d.ceilingShield)
    + parseFloat(d.leadGlasses) + parseFloat(d.radiationProtectionCabin);

  d.radiation = [
    { key: 'left eye', value: 1 - d.totalProtection },
    { key: 'right eye', value: (1 + 0.2) - d.totalProtection }
  ];

  d.protection.forEach((e) => {
    e.date = d.date;
    // e.used = _.random(0, 1) ? true : false;
  });

  return d;
}

function create(svg, rawData) {
  const data = rawData.map(preprocess);
  // const svg = d3.select('#app').append('svg')
  //           .attr('width', 1200)
  //           .attr('height', 800);

  const margin = { top: 80, right: 250, bottom: 80, left: 40 };
  const centerMargin = 100;

  const width = +svg.attr('width') - margin.left - margin.right;
  const height = +svg.attr('height') - margin.top - margin.bottom;

  const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

  const gLeft = g.append('g');
  const gRight = g.append('g');

  const yBand = d3.scaleBand()
    .rangeRound([0, height])
    .padding(0.1);

  const yDate = d3.scaleTime()
    .range([0, height]);

// const yProcedure = d3.scaleBand()
//     .rangeRound([0, height])
//     .padding(0.1);

  const symbols = d3.scaleOrdinal()
                  .range(d3.symbols);

  const protColor = d3.scaleOrdinal()
    .range(d3.schemeCategory10);

  const radDose = d3.scaleLinear()
    .range(['#ffff00', '#ff0000']);


  // TODO: sort data
  // console.log('textures', textures);
  // data.reduce((acc, d) => {
  // });

  // data.sort((a, b) => b.total - a.total);

  yBand.domain(data.map(d => d.date));

  yDate.domain(d3.extent(data, d => d.date));

  console.log('data', data);
  protColor.domain(keys);
  radDose.domain(d3.extent(data, d => d.radiation[0].value));

  // stack
  (function() {
    const stack = d3.stack()
                    .keys(keys)
                    .value((a, key) => a.protection.find(b => b.key === key).value);

    const stacked = stack(data);
    // right
    const barWidth = d3.scaleLinear()
      .rangeRound([0, (width / 2) - (centerMargin / 2)])
      .domain([0, 1]);

    symbols.domain(['CA', 'CA+PCI', 'PVI', 'PM-Implantation']);

    // const area = d3.area()
    //     .y(d => yDate(d.data.date))
    //     .x0(d => (width / 2) + (centerMargin / 2) + barWidth(d[0]))
    //     .x1(d => (width / 2) + (centerMargin / 2) + barWidth(d[1]));
        // .curve(d3.curveBasis);

    // g.append('g')
    //         .attr('class', 'grid')
    //         .attr('transform', `translate(0,${height})`)
    //         .call(d3.axisTop(barWidth)
    //             .tickSize(height, 0, 0)
    //             .tickFormat('')
    //         );

    const labelCont = gRight.selectAll('.labelbar')
      .data(data)
      .enter()
      .append('g')
        .attr('transform', d => `translate(${width + (centerMargin / 2)}, ${yDate(d.date)})`);

    labelCont.append('path')
        .attr('d', d => d3.symbol().type(symbols(d.procedure))())
        // .attr('transform', `translate(${(20)}, ${(yBand.bandwidth() / 2) - 5})`)
        .attr('transform', `translate(${(20)}, ${7})`)
        .attr('dx', 4)
        .attr('fill', 'grey');

    labelCont.append('text')
        // .attr('transform', `translate(${(40)}, ${yBand.bandwidth() / 2})`)
        .attr('transform', `translate(${(40)}, ${10 / 2})`)
    //     .attr('alignment-baseline', 'middle')
        .text(d => d.procedure);
    //     .attr('dy', yBand.bandwidth() / 2)
    //     .attr('dx', 20);

    gRight.selectAll('.protBar')
      .data(stacked)
      .enter().append('g')
        .attr('class', d => d.key)
        // .append('path')
        // .attr('d', area)
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
        // .attr('class', d => console.log(d))
        // .attr('y', d => yBand(d.data.date))
        .attr('y', d => yDate(d.data.date) - (height / 19) / 2)
        .attr('x', d => (width / 2) + (centerMargin / 2) + barWidth(d[0]))
        .attr('width', d => barWidth(d[1]) - barWidth(d[0]))
        // .attr('height', yBand.bandwidth())
        // TODO: bandwidth
        .attr('height', height / 19 - 5)
        // .attr('height', 10)
        // .style('fill', d => protColor(d.data.protection.find(e => d[1] === e.value).value))
        .style('fill', function(d) {
          return protColor(d3.select(this.parentNode).datum().key);
        })
        .on('mouseover', function() {
          // console.log('event', d3.event.transform);
          d3.select(this)
          .attr('y', d => yDate(d.data.date) - (height / 19) / 2)
          .transition(2000)
          .attr('height', height / 19 - 5)
          .attr('height', 100)
          .attr('y', d => yDate(d.data.date) - 100 / 2);
        });
      //   .style('stroke', 'black')
      //   .on('click', function(d) {
      //     console.log('parent data', d, d3.select(this.parentNode).datum().key);
      //   });

    gRight.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0,${-40})`)
        .call(d3.axisTop(d3.scaleLinear()
                .rangeRound([(width / 2) + (centerMargin / 2), width])
                .domain([0, 1])
                ).tickFormat(d3.format('.0%')
             )
        )
        .append('text')
      // .attr('x', 2)
      // .attr('y', yBand)
      .attr('dy', '-30')
      // .attr('dx', '10')
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('font-size', 15)
      .attr('font-weight', 'bold')
      .text('Radiation');
    //
  }());

  (function() {
    const stack = d3.stack();
    stack
      .keys(keys)
      .value((a, key) => a.protection.find(b => b.key === key).value);

    const xRadLeft = d3.scaleLinear()
      .rangeRound([(width / 2) - (centerMargin / 2), 0])
      .domain([0, 1]);

    // g.append('g')
    //         .attr('class', 'grid')
    //         .attr('transform', `translate(0,${height})`)
    //         .call(d3.axisTop(xRadLeft)
    //             .tickSize(height, 0, 0)
    //             .tickFormat('')
    //         );

    const radBar = gLeft.selectAll('.radBar')
      .data(data)
      .enter()
      .append('g')
      .selectAll('rect')
      .data(d => d.radiation)
      .enter()
      .append('rect')
        .attr('class', d => d.key)
        .attr('x', d => xRadLeft(d.value))
      .attr('y', function() {
        return yBand(d3.select(this.parentNode).datum().date);
      })
      .attr('y', function() {
        return yDate(d3.select(this.parentNode).datum().date);
      })
        .attr('width', d => xRadLeft(0) - xRadLeft(d.value))
        // .attr('height', yBand.bandwidth())
        .attr('height', 10)
        // .attr('fill', d => radDose(d.value))
        .style('fill', (d) => {
          if (!d.used) {
            const tx = textures.lines()
              .thicker().stroke(radDose(d.value));
            svg.call(tx);
            return tx.url();
          }
          return radDose(d.value);
        })
        .style('opacity', d => (d.key === 'right eye') ? 0.2 : 1)
// .style('fill', 'url(#dots-7)')
        .style('stroke', 'black')
        .on('click', d => console.log('click', d));


    gLeft.append('g')
        .attr('class', 'axis axis--x')
        // .attr('transform', `translate(0,${height})`)
        .call(d3.axisTop(xRadLeft).tickFormat(d3.format('.0%')))
        .append('text')
      // .attr('x', 2)
      // .attr('y', yBand)
      .attr('dy', '-30')
      .attr('dx', width)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('font-size', 15)
      .attr('font-weight', 'bold')
      .text('Protection');
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
    //     .attr('text-anchor', 'start')
    //     .attr('fill', '#000')
    //     .text('Population');
  }());

  const yAxis = g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(yDate)
        .tickFormat(formatDate)
        .ticks(d3.timeDay.every(1))
        .tickPadding(-2)
        // .tickSize(0)
      )
      .attr('transform', `translate(${width / 2},0)`);

  console.log('yAxis', yAxis.selectAll('.tick').data());

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
      // .attr('y', yBand)
      .attr('dy', '-10')
      // .attr('dx', '10')
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('font-size', 15)
      .attr('font-weight', 'bold')
      .text('Time');

  const legend = g.append('g')
    .attr('transform', `translate(0,${height})`)
    .selectAll('.legend')
    .data(keys)
    .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0,${i * 20})`)
      .style('font', '10px sans-serif');
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
}

export { create };
