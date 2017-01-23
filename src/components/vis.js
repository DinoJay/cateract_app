import * as d3 from 'd3';
// import _ from 'lodash';
// import textures from 'textures';

// import { dateDiff } from './lib/utils';
import * as moreSymbols from 'd3-symbol-extra';
import '../global_styles/style.scss';

const timeFormatStr = '%d/%m/%Y';
// const formatDate = d3.timeFormat(timeFormatStr);
const parseDate = d3.timeParse(timeFormatStr);

const keys = ['shield', 'glasses', 'cabin'];
const formatTime = d3.timeFormat('%Y/%m/%d %H:%M:%S %Z');
const extraSymbols = Object.values(moreSymbols).reverse();

function d3TimeSwitch(data, yDate) {
  // const nestedData = d3.nest()
  //   .key(d => formatTime(timeTickInterval(d.date)))
  //   .entries(data);
  const [startDate, endDate] = yDate.domain();
  const limit = 20;

  switch (true) {
  case (d3.timeDay.count(startDate, endDate) < limit):
    console.log('timeDay', d3.timeDay.count(startDate, endDate));
    return {
      timeIntervalStr: 'days',
      timeTickInterval: d3.timeDay,
      timeNestInterval: d3.timeDay,
      timeFormat: d3.timeFormat('%a %d')
    };
  case (d3.timeWeek.count(startDate, endDate) < limit):
    console.log('timeWeek', d3.timeWeek.count(startDate, endDate));
    return {
      timeIntervalStr: 'weeks',
      timeTickInterval: d3.timeWeek,
      timeNestInterval: d3.timeDay,
      timeFormat: d3.timeFormat('%b %d')
    };
  case (d3.timeMonth.count(startDate, endDate) < limit):
    console.log('timeMonth', d3.timeMonth.count(startDate, endDate));
    return {
      timeIntervalStr: 'months',
      timeTickInterval: d3.timeMonth,
      timeNestInterval: d3.timeDay,
      timeFormat: d3.timeFormat('%B')
    };
  default:
    console.log('timeYear', d3.timeMonth.count(startDate, endDate));
    return {
      timeIntervalStr: 'years',
      timeTickInterval: d3.timeYear,
      timeNestInterval: d3.timeDay,
      timeFormat: d3.timeFormat('%Y')
    };

  }

  // if (aggrTime(d3.timeDay, data).length < limit) {
  //   console.log('days');
  //   return { timeIntervalStr: 'days', timeTickInterval: d3.timeDay, timeFormat: d3.timeFormat('%a %d') };
  // } else {
  //   return { timeIntervalStr: 'months', timeTickInterval: d3.timeMonth, timeFormat: d3.timeFormat('%a %d') };
  // }

  // switch (data) {
  // case d3.nest().key(d => formatTime(d3.timeDay(d.date))).entries(data).length < limit || true:
  //   return { key: 'days', timeTickInterval: d3.timeDay, timeFormat: d3.timeFormat('%a %d') };
  // case d3.nest().key(d => formatTime(d3.timeWeek(d.date))).entries(data).length < limit:
  //   return { key: 'weeks', timeTickInterval: d3.timeWeek, timeFormat: d3.timeFormat('%a %d') };
  // case d3.nest().key(d => formatTime(d3.timeMonth(d.date))).entries(data).length < limit:
  //   return { key: 'months', timeTickInterval: d3.timeMonth, timeFormat: d3.timeFormat('%a %d') };
  // default:
  //   return { key: 'years', timeTickInterval: d3.timeYear, timeFormat: d3.timeFormat('%a %d') };
  // }
}
  // switch (timeIntervalStr) {
  // case 'days':
  //   return { timeTickInterval: d3.timeDay, timeFormat: d3.timeFormat('%a %d') };
  // case 'months':
  //   return { timeTickInterval: d3.timeMonth, timeFormat: d3.timeFormat('%B') };
  // case 'weeks':
  //   return { timeTickInterval: d3.timeWeek, timeFormat: d3.timeFormat('%b %d') };
  // case 'years':
  //   return { timeTickInterval: d3.timeYear, timeFormat: d3.timeFormat('%Y') };
  // default:
  //   return { timeTickInterval: d3.timeHour, timeFormat: d3.timeFormat('%I %p') };
  // }
// }

function adjustTextLabels(selection) {
}

// calculate the width of the days in the timeScale
function daysToPixels(days, timeScale, timeInterval) {
  const d1 = new Date();
  return timeScale(timeInterval.offset(d1, days)) - timeScale(d1);
}

function preprocess(d) {
  d.date = parseDate(d.date);

  d.protections = [
    { key: 'equipment', value: parseFloat(d.usedEquipment) },
    { key: 'shield', value: parseFloat(d.ceilingShield) },
    { key: 'glasses', value: parseFloat(d.leadGlasses) },
    { key: 'cabin', value: parseFloat(d.radiationProtectionCabin) }
    // { key: 'no protections', value: 1 }
  ];

  d.totalProtection = parseFloat(d.ceilingShield)
    + parseFloat(d.leadGlasses) + parseFloat(d.radiationProtectionCabin);

  // d.radiation = [
  //   { key: 'left eye', value: 1 - d.totalProtection },
  //   { key: 'right eye', value: (1 + 0.2) - d.totalProtection }
  // ];
  d.radiation = 1 - d.totalProtection;

  // d.protections.forEach((e) => {
  //   e.date = d3.timeHours(d.date);
  //   // e.used = _.random(0, 1) ? true : false;
  // });
  d.equipment = parseFloat(d.usedEquipment);

  return d;
}


function update(data, dim, opts = { timeIntervalStr: 'days', yDate: null }) {
  const { _, yDate } = opts;

  // data.forEach(e => (e.date = timeTickInterval(e.date)));

  const { timeIntervalStr, timeTickInterval, timeFormat, timeNestInterval } = d3TimeSwitch(data, yDate);

  const nestedData = d3.nest()
    .key(d => formatTime(timeNestInterval(d.date)))
    .entries(data)
    .map((e) => {
      e.date = new Date(e.key);
      e.totalProtection = d3.sum(e.values, a => a.totalProtection);
      e.totalRadiation = d3.sum(e.values, a => a.radiation);
      return e;
    });


  const symbols = d3.scaleOrdinal()
                  .range(extraSymbols);

  const protColor = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeCategory10);

  const radDose = d3.scaleLinear()
    .domain(d3.extent(data, d => d.radiation))
    .range(['#ffff00', '#ff0000']);

  // const offStartDate = timeTickInterval.offset(startDate, -1);
  // const timeRange = timeTickInterval.count(...dateExt) + 1;

  // const yDate2 = yDate.copy();
  const [startDate, endDate] = yDate.domain().map(d => timeTickInterval.floor(d, 1));
  const barHeight = yDate(startDate) - yDate(timeNestInterval.offset(startDate, -1));
  console.log('barHeight', barHeight);
  const dateTicks = timeNestInterval.count(startDate, endDate) + 1;

  const maxProt = d3.max(nestedData, d => d.totalProtection);
  // const zoom = d3.zoom()
  //         .scaleExtent([1, 32])
  //         .translateExtent([[0, 0], [dim.width, dim.height]])
  //         .extent([[0, 0], [dim.width, dim.height]])
  //         .on('zoom', () => {
  //           opts.yDate = d3.event.transform.rescaleX(yDate);
  //           update(data, dim, opts);
  //         });
  //
  // d3.select('svg').call(zoom);

  const padding = 0;
  (function protectionBars() {
    const axis = d3.select('.prot-axis').call(d3.axisTop(d3.scaleLinear()
                .rangeRound([dim.width / 2 + dim.innerMargin.center / 2, dim.width])
                .domain([0, maxProt])
                ));
      // .tickFormat(d3.format('.0%'))
      //            .tickSizeInner(12)
      //            .tickPadding(-2));

    axis.selectAll('.tick text')
    .attr('x', 5)
    .attr('dy', null)
    .style('text-anchor', null);

    // axis.append('text')
    //   .attr('x', -45)
    //   .attr('dy', '-30')
    //   .attr('dx', dim.width)
    //   .attr('text-anchor', 'middle')
    //   .attr('fill', '#000')
    //   .attr('font-size', 15)
    //   .attr('font-weight', 'bold')
    //   .text('Protection');
    console.log('maxProt', maxProt);

    const barWidth = d3.scaleLinear()
      .range([dim.width / 2 + dim.innerMargin.center / 2, dim.width])
      .domain([0, maxProt]);

    const stacked = d3.stack()
                  .keys(keys)
                  .value((a, key) =>
                    d3.sum(a.values, e => e.protections.find(b => b.key === key)
                      .value))(nestedData);

    symbols.domain(['CA', 'CA+PCI', 'PVI', 'PM-Implantation']);
    console.log('barWidth', [dim.width / 2 + dim.innerMargin.center / 2, dim.width]);

    const protLayer = d3.select('g.right').selectAll('.prot-layer')
      .data(stacked, (d, i) => `prot${Math.random() * 100}+${i}`);

    console.log('timeNestInterval', timeNestInterval.toString());
    protLayer.exit().remove();

    const area = d3.area()
        .y(d => yDate(timeNestInterval(d.data.date)) + padding / 2)
        .x0(d => barWidth(d[0]))
        .x1(d => barWidth(d[1]));
        // .curve(d3.curveStepBefore);

    const protLayerEnter = protLayer
      .enter()
      .append('g')
      .attr('class', 'prot-layer');

    protLayerEnter.append('path')
        .style('fill', function() {
          return protColor(d3.select(this.parentNode).datum().key);
        })
        .attr('opacity', 0.5)
        .style('stroke', 'black');

    protLayerEnter.selectAll('path')
      .attr('d', area);

    protLayer.selectAll('path')
      .style('fill', 'green')
      .attr('d', area);

    protLayerEnter.selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
        .attr('class', 'prot-bar')
        // .attr('y', d => yDate(timeTickInterval(d.data.date)) - (dim.height / dateTicks) / 2)
        // .attr('x', d => dim.width / 2 + dim.innerMargin.center / 2 + barWidth(d[0]))
        // .attr('width', d => barWidth(d[1]) - barWidth(d[0]))
        // // TODO: bandwidth
        // .attr('height', dim.height / dateTicks - 5)
        // .attr('height', 10)
        // .style('fill', d => protColor(d.data.protections.find(e => d[1] === e.value).value))
        .style('fill', function() {
          return protColor(d3.select(this.parentNode).datum().key);
        })
        .on('mouseover', (d) => {
          console.log('mousever', d, d.data);
          // d3.select(this)
          //   .attr('y', e => yDate(e.data.date) - (dim.height / dateTicks) / 2)
          //   .transition(2000)
          //   .attr('height', dim.height / dateTicks - 5)
          //   .attr('height', 100)
          //   .attr('y', e => yDate(e.data.date) - 100 / 2);
          // console.log('mouseover', d.data.equipmentName);
        })
        .on('click', () => update(data, dim, { timeIntervalStr: 'weeks', yDate: null }));

    const protMerge = protLayer.merge(protLayerEnter).selectAll('rect')
        .attr('y', d => yDate(timeNestInterval(d.data.date)) + padding / 2)
        .attr('x', d => barWidth(d[0]))
        .attr('width', d => barWidth(d[1]) - barWidth(d[0]))
        .attr('height', barHeight - padding);

    console.log('merge', protMerge);

    // protLayer.selectAll('.prot-bar').style('fill', 'red')
    //     .attr('y', d => yDate(timeTickInterval(d.data.date)) + padding / 2)
    //     .attr('x', d => dim.width / 2 + dim.innerMargin.center / 2 + barWidth(d[0]))
    //     .attr('width', d => barWidth(d[1]) - barWidth(d[0]))
    //     .attr('height', tickHeight - padding);

      //   .style('stroke', 'black')
      //   .on('click', function(d) {
      //     console.log('parent data', d, d3.select(this.parentNode).datum().key);
      //   });

    (function timeLine() {
// var customTimeFormat = d3.time.format.multi([
//   [".%L", function(d) { return d.getMilliseconds(); }],
//   [":%S", function(d) { return d.getSeconds(); }],
//   ["%I:%M", function(d) { return d.getMinutes(); }],
//   ["%I %p", function(d) { return d.getHours(); }],
//   ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
//   ["%b %d", function(d) { return d.getDate() != 1; }],
//   ["%B", function(d) { return d.getMonth(); }],
//   ["%Y", function() { return true; }]
// ]);
                // .tickSize(60);
                // .tickPadding(-2)
                // .tickPadding(30);

      (function dateAxis() {
        const padding = 0;
        const width = dim.innerMargin.center - padding;

        const tickHeight = yDate(endDate) - yDate(timeTickInterval.offset(endDate, -1));
        const height = tickHeight - padding;

        // const yAxisGen = d3.axisLeft(yDate)
        //         // .tickFormat(timeFormat)
        //         .ticks(timeTickInterval.every(1));

        d3.select('.date-axis').selectAll('*').remove();
        const timeData = timeTickInterval.range(...yDate.domain());

        const yAxis = d3.select('.date-axis').selectAll('.tick')
          .data(timeData);

        const yAxisEnter = yAxis.enter()
          .append('g')
          .attr('class', 'tick');

        yAxisEnter.append('rect')
          .attr('width', width)
          .attr('transform', `translate(${-width / 2}, 0)`)
          .attr('height', d => yDate(timeTickInterval.offset(d, 1)) - yDate(d))
          .attr('rx', 5)
          .attr('ry', 5)
          .attr('fill', 'none')
          .attr('stroke', 'grey')
          .on('mouseover', d => console.log('d', d));

        yAxis.merge(yAxisEnter)
          .attr('transform', d => `translate(0, ${yDate(d)})`);


          // .call(yAxisGen);
          // .attr('transform', `translate(${dim.width / 2},0)`);

        yAxisEnter
         .append('text')
         .attr('font-size', 14)
         .attr('text-anchor', 'middle')
         .text(timeFormat)
         .attr('transform', function() {
           const bbox = this.getBBox();
           return `translate(${0},${height / 2 + bbox.height / 4})`;
         });

    // yAxis.select("path.domain")
      // .attr('dx', function() {
      //   var w = this.getBBox().width;
      //   console.log("w", w);
      //   return -w/4;
      //
      // })
      //   yAxis.append('text')
      // // .attr('x', 2)
      // .attr('dy', '-30')
      // // .attr('dx', '10')
      // .attr('text-anchor', 'middle')
      // .attr('fill', '#000')
      // .attr('font-size', 15)
      // .attr('font-weight', 'bold')
      // .text('Time');

        // yAxis.select('.domain').remove();
        //
        // yAxis.selectAll('.tick line').remove();
        //
        // yAxis.selectAll('.tick')
        //   .append('rect')
        //   .attr('width', dim.innerMargin.center)
        //   .attr('transform', `translate(${-dim.innerMargin.center / 2}, 0)`)
        //   .attr('height', tickHeight)
        //   .attr('rx', 5)
        //   .attr('ry', 5)
        //   .attr('fill', 'none')
        //   .attr('stroke', 'grey')
        //   .on('mouseover', d => console.log('d', d));
          // .attr('x1', -dim.innerMargin.center / 2)
          // .attr('x2', dim.innerMargin.center / 2;
          // .attr('y1', 0)
          // .attr('y2', tickHeight)


        // yAxis.selectAll('g text')
        // .attr('transform', function() {
        //   return `translate(${this.getBBox().width / 4},${tickHeight / 2})`;
        // })
        // .attr('text-anchor', 'middle');
      }());


      const proc = d3.select('g.center').selectAll('.proc')
        .data(data, d => `${d.key}-${timeIntervalStr}`);

      // const procWidth = d3.min([dim.innerMargin.center / 2, tickHeight]);

      // (function procedure() {
      //   const symbolSize = 5;
      //   const symbolGenerator = d3.symbol().size(symbolSize * 10);
      //
      //   const procEnter = proc.enter()
      //   .append('path')
      //   .attr('class', 'proc')
      //   .attr('d', d => symbolGenerator.type(symbols(d.procedure))())
      //
      //   // .attr('transform', `translate(${(20)}, ${(yBand.bandwidth() / 2) - 5})`)
      //   // .attr('dx', 4)
      //   .attr('fill', 'grey');
      //
      //
      //   // .append('circle')
      //   // .attr('class', 'proc')
      //   // .attr('cy', d => yDate(d.date))
      //   // .attr('r', 5); // .attr('width', procWidth)
      //
      //   proc.merge(procEnter)
      //   .attr('transform', d => `translate(${0}, ${yDate(d.date) + symbolSize / 2})`);
      //
      // // proc
      // //   .attr('fill', 'red')
      // //   .attr('transform', d => `translate(${0}, ${yDate(d.date) + symbolSize / 2})`);
      //   proc.exit().remove();
      // }());
    }());
    //
  }());

  (function radiationBars() {
    // const stack = d3.stack();
    // stack
    //   .keys(keys)
    //   .value((a, key) => a.protections.find(b => b.key === key).value);

    const radBarWidth = d3.scaleLinear()
      .rangeRound([(dim.width / 2) - (dim.innerMargin.center / 2), 0])
      .domain([0, d3.max(nestedData, d => d.totalRadiation)]);

    // g.append('g')
    //         .attr('class', 'grid')
    //         .attr('transform', `translate(0,${height})`)
    //         .call(d3.axisTop(radBarWidth)
    //             .tickSize(height, 0, 0)
    //             .tickFormat('')
    //         );

    const radBar = d3.select('.left').selectAll('.rad-bar')
      .data(nestedData, (d, i) => `prot${timeIntervalStr}+${i}`);

    const radBarEnter = radBar.enter()
      // .append('g')
      // .attr('class', 'rad-cont')
      // .selectAll('rect')
      // .data(d => d.radiation)
      // .enter()
      .append('rect')
        .attr('class', 'rad-bar')
        // .style('opacity', d => ((d.key === 'right eye') ? 0.2 : 1))
        // .style('stroke', 'black')
        .on('click', () => update(data, dim));

    radBar.merge(radBarEnter)
      .attr('x', d => radBarWidth(d.totalRadiation))
      .attr('y', d => yDate(d.date) + padding / 2)
      .attr('width', d => radBarWidth(0) - radBarWidth(d.totalRadiation))
      .attr('height', barHeight - padding)
      .style('fill', d => radDose(d.totalRadiation));

    radBar.exit().remove();

    d3.select('.rad-axis')
        // .attr('transform', `translate(0,${height})`)
        .call(d3.axisTop(radBarWidth))
        // .transition().duration(1500)
        // .ease('sin-in-out')
        .append('text')
      // .attr('x', 2)
      .attr('dy', -30)
      .attr('dx', 35)
      // .attr('text-anchor', 'middle')
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
    //     .call(d3.axisLeft(radBarWidth).ticks(10, 's'))
    //   .append('text')
    //     .attr('x', 2)
    //     .attr('y', radBarWidth(radBarWidth.ticks(10).pop()))
    //     .attr('dy', '0.35em')
    //     .attr('text-anchor', 'x0')
    //     .attr('fill', '#000')
    //     .text('Population');
  }());
}

function create(svg, rawData) {
  const data = rawData.map(preprocess).sort((a, b) => a.date - b.date);
  // const svg = d3.select('#app').append('svg')
  //           .attr('width', 1200)
  //           .attr('height', 800);

  const brushHeight = 50;
  const brushMargin = 10;
  const brushHandleSize = 40;
  const axisHeight = 45;

  const outerMargin = { top: 0, right: 10, bottom: 80, left: 20 };
  const innerMargin = {
    top: 10 + brushHeight + brushMargin + axisHeight,
    right: 250,
    bottom: 80,
    left: 0,
    center: 50
  };

  const width = +svg.attr('width') - outerMargin.left - outerMargin.right;
  const height = +svg.attr('height') - outerMargin.top - outerMargin.bottom;

  const dim = { width, height, innerMargin };

  const cont = svg
            .append('g')
            .attr('class', 'cont')
           .attr('transform', `translate(${outerMargin.left},${outerMargin.top})`);

  const context = cont.append('g')
    .attr('class', 'context');

  const gBrush = context.append('g')
      .attr('class', 'brush');

  const gMain = cont
            .append('g')
            .attr('class', 'main')
            .attr('clip-path', 'url(#clip)')
            .attr('transform', `translate(${0},${innerMargin.top})`);

  svg.append('clipPath')
   .attr('id', 'clip')
   .append('rect')
   .attr('width', width)
   .attr('height', height);

  gMain.append('g')
       .attr('class', 'left');

  const gCenter = gMain.append('g')
            .attr('class', 'center')
            .attr('transform', `translate(${width / 2},${0})`);

  gMain.append('g')
            .attr('class', 'right');
            // .attr('clip-path', 'url(#clip)');
            // .attr('transform', `translate(${0},${0})`);

  gCenter.append('g')
      .attr('class', 'date-axis axis-y');

  cont.append('g')
      .attr('class', 'prot-axis axis-x')
      .attr('transform', `translate(0,${brushHeight + brushMargin + axisHeight})`);

  cont.append('g')
      .attr('class', 'rad-axis axis-x')
      .attr('transform', `translate(0,${brushHeight + brushMargin + axisHeight})`);

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

  const defaultTimeInterval = d3.timeDay;
  const dateExt = d3.extent(data, d => defaultTimeInterval.floor(d.date));

  const yDate = d3.scaleTime()
      .domain(dateExt)
      .range([0, dim.height]);

  const yDate2 = yDate.copy().range([0, width - 20]);

  const handle = gBrush.selectAll('.handle--custom')
  .data([{ type: 'w' }, { type: 'e' }])
  .enter().append('path')
    .attr('class', 'handle--custom')
    .attr('fill', '#666')
    .attr('fill-opacity', 0.8)
    .attr('stroke', '#000')
    .attr('stroke-width', 1.5)
    .attr('cursor', 'ew-resize')
    .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(brushHeight / 2)
        .startAngle(0)
        .endAngle((_, i) => (i ? Math.PI : -Math.PI)));

  function brushmoved(handle, s) {
    if (s == null) {
      handle.attr('display', 'none');
    // circle.classed("active", false);
    } else {
      handle
        .attr('display', null)
        .attr('transform', (d, i) => `translate(${s[i]},${brushHeight / 2})`);
    }
  }

  const brush = d3.brushX()
    .extent([[0, 0], [dim.width, brushHeight]])
    .handleSize(brushHandleSize)
    .on('brush end', () => {
      const s = d3.event.selection || yDate2.range();
      const d0 = s.map(yDate2.invert, yDate2);
      const d1 = d0.map(defaultTimeInterval.round);
      if (d1[0] >= d1[1]) {
        d1[0] = defaultTimeInterval.floor(d0[0]);
        d1[1] = defaultTimeInterval.offset(d1[0]);
      }
      if (d3.event.sourceEvent) {
        yDate.domain(d1);
        update(data, dim, { timeIntervalStr: 'days', yDate });
      }
      brushmoved(handle, s);
    })
    .on('start', e => brushmoved(handle, e));

  d3.select('.brush')
      .call(brush)
      .call(brush.move, yDate2.range());

  update(data, dim, { timeIntervalStr: 'days', yDate });

  // TODO: sort data
  // console.log('textures', textures);
  // data.reduce((acc, d) => {
  // });

  // data.sort((a, b) => b.total - a.total);
}


export { create, update };
