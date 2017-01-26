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

function aggregate(data, timeInterval) {
  return d3.nest()
          .key(d => formatTime(timeInterval(d.date)))
          .entries(data)
          .map((e) => {
            e.date = new Date(e.key);
            e.totalProtection = d3.sum(e.values, a => a.totalProtection) / e.values.length;
            e.totalRadiation = d3.sum(e.values, a => a.radiation) / e.values.length;
            return e;
          });
}

function intervalBefore(intervalStr) {
  switch (intervalStr) {
  case 'months': return d3.timeYear;
  case 'weeks': return d3.timeMonth;
  case 'days': return d3.timeWeek;
  case 'hours': return d3.timeDay;
  default: return d3.timeHour;
  }
}

function d3TimeSwitch(data, startDate, endDate) {
  const limit = 10;
  switch (true) {
  case (d3.timeHour.count(startDate, endDate) < limit):
    return {
      intervalStr: 'hours',
      tickInterval: d3.timeHour,
      nestInterval: d3.timeHour,
      timeFormat: d3.timeFormat('%I %p')
    };
  case (d3.timeDay.count(startDate, endDate) < limit):
    return {
      intervalStr: 'days',
      tickInterval: d3.timeDay,
      nestInterval: d3.timeDay,
      timeFormat: d3.timeFormat('%a %d')
    };
  case (d3.timeWeek.count(startDate, endDate) < limit):
    return {
      intervalStr: 'weeks',
      tickInterval: d3.timeWeek,
      nestInterval: d3.timeDay,
      timeFormat: d3.timeFormat('%b Week %U')
    };
  case (d3.timeMonth.count(startDate, endDate) < limit):
    return {
      intervalStr: 'months',
      tickInterval: d3.timeMonth,
      nestInterval: d3.timeWeek,
      timeFormat: d3.timeFormat('%B')
    };
  default:
    return {
      intervalStr: 'years',
      tickInterval: d3.timeYear,
      nestInterval: d3.timeMonth,
      timeFormat: d3.timeFormat('%Y')
    };
  }
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

  d.radiation = 1 - d.totalProtection;

  d.equipment = parseFloat(d.usedEquipment);

  return d;
}


function update(data, dim, yDate) {
  const {
    intervalStr,
    tickInterval,
    timeFormat,
    nestInterval
  } = { ...d3TimeSwitch(data, ...yDate.domain()), yDate };

  const nestedData = aggregate(data, nestInterval);

  const startDate = yDate.domain()[0];
  const barHeight = yDate(startDate) - yDate(nestInterval.offset(startDate, -1));
  const symbols = d3.scaleOrdinal()
                  .range(extraSymbols);

  const protColor = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeCategory10);

  const radDose = d3.scaleLinear()
    .domain(d3.extent(nestedData, d => d.totalRadiation))
    .range(['#ffff00', '#ff0000']);


  const padding = 0;
  (function protectionBars() {
    const axis = d3.select('.prot-axis').call(d3.axisTop(d3.scaleLinear()
                .rangeRound([dim.width / 2 + dim.subMargin.center / 2, dim.width])
                .domain([0, 1])
                ));
      // .tickFormat(d3.format('.0%'))
      //            .tickSizeInner(12)
      //            .tickPadding(-2));

    // axis.selectAll('.tick text')
    // .attr('x', 5)
    // .attr('dy', null)
    // .style('text-anchor', null);

    axis.append('text')
      .attr('x', -45)
      .attr('dy', '-30')
      .attr('dx', dim.width)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('font-size', 15)
      .attr('font-weight', 'bold')
      .text('Protection');

    const barWidth = d3.scaleLinear()
      .range([dim.width / 2 + dim.subMargin.center / 2, dim.width])
      .domain([0, 1]);

    const stacked = d3.stack()
                  .keys(keys)
                  .value((a, key) =>
                    d3.sum(a.values, e => e.protections.find(b => b.key === key)
                      .value) / a.values.length)(nestedData);

    symbols.domain(['CA', 'CA+PCI', 'PVI', 'PM-Implantation']);

    const protLayer = d3.select('g.right').selectAll('.prot-layer')
      // TODO: find correct
      .data(stacked, (d, i) => `prots${intervalStr}+${i}`);

    protLayer.exit().remove();

    const area = d3.area()
        .y(d => yDate(nestInterval(d.data.date)) + padding / 2)
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
        .attr('opacity', 0.1)
        .style('stroke', 'black');

    protLayerEnter.selectAll('path')
      .attr('d', area);

    protLayer.selectAll('path')
      .style('fill', 'green')
      .attr('d', area);

    const protSeg = protLayer.selectAll('.prot-seg')
      .data(d => d, (d, i) => `prots${timeFormat(d.data.date)}+${i}`);

    const protSegEnter = protSeg
      .enter()
      .append('rect')
      .attr('class', 'prot-seg')
        .style('fill', function() {
          return protColor(d3.select(this.parentNode).datum().key);
        });

    protSeg.merge(protSegEnter)
        .attr('x', function() { return d3.select(this).attr('x'); })
        .attr('y', function() { return d3.select(this).attr('y'); })
        .transition()
        .duration(500)
        .attr('y', d => yDate(d.data.date) + padding / 2)
        .attr('x', d => barWidth(d[0]))
        .attr('width', d => barWidth(d[1]) - barWidth(d[0]))
        .attr('height', barHeight - padding);

    protSeg.exit().remove();

    // protLayer.selectAll('.prot-bar').style('fill', 'red')
    //     .attr('y', d => yDate(tickInterval(d.data.date)) + padding / 2)
    //     .attr('x', d => dim.width / 2 + dim.subMargin.center / 2 + barWidth(d[0]))
    //     .attr('width', d => barWidth(d[1]) - barWidth(d[0]))
    //     .attr('height', tickHeight - padding);

      //   .style('stroke', 'black')
      //   .on('click', function(d) {
      //     console.log('parent data', d, d3.select(this.parentNode).datum().key);
      //   });

    // (function timeLine() {
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

    (function timeLine() {
      const padding = 0;
      const width = dim.subMargin.center - padding;
      const height = d => yDate(tickInterval.offset(d, 1)) - yDate(d);

      const [startDate, endDate] = yDate.domain();
      const timeData = tickInterval
          .range(...[tickInterval.floor(startDate), tickInterval.ceil(endDate)])
          .map(d => ({ key: timeFormat(d), date: d }));

      const yAxis = d3.select('.date-axis').selectAll('.time-tick')
          .data(timeData, d => d.key);


      console.log('tickInterval', intervalStr);
      const yAxisEnter = yAxis.enter()
          .append('g')
          .attr('transform', (n) => {
            // console.log('transform yAxis enter', yAxis.enter().data(), 'yAxis exit', yAxis.exit().data());
            const olddata = yAxis.exit().merge(yAxis).data();
            const dateDict = olddata.map((d) => {
              const stDate = d3.min([d.date, n.date]);
              const enDate = d3.max([d.date, n.date]);
              const count = intervalBefore(intervalStr).count(stDate, enDate);
              return { date: d.date, value: count };
            });
            console.log('dateDict', dateDict);
            const minDate = dateDict.reduce((acc, d) => (acc.value > d.value ? d : acc), dateDict[0]);
            // console.log('minDate', minDate);
            const nearest = yAxis.exit().filter(d => d.date === minDate.date);
            // console.log('nearest', nearest);
            if (!nearest.empty()) {
              return nearest.attr('transform');
            }
          })
          .attr('class', 'time-tick');

      yAxisEnter
         .append('text')
         .attr('font-size', 14)
         .attr('text-anchor', 'middle')
         .attr('transform', function(d) {
           const bbox = this.getBBox();
           return `translate(${0},${height(d.date) / 2 + bbox.height / 4})`;
         });
          // .on('mouseover', d => console.log('d', d));

      yAxisEnter.append('rect')
          .attr('transform', `translate(${-width / 2}, 0)`)
          // .attr('height', d => d.height)
          // .attr('width', width)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('fill', 'lightgrey')
          .attr('opacity', 0.4)
          .attr('stroke', 'grey');
          // .on('touchstart', (d) => {
          //   const timeDomain = [tickInterval.floor(d), tickInterval.offset(d, 1)];
          //   // d3.selectAll()
          //   yDate.domain(timeDomain);
          //   update(data, dim, yDate);
          // });

          // .map((d) => {
          //   d.height = ;
          //   return d;
          // });

      yAxis
          .attr('transform', function() {
            return d3.select(this).attr('transform');
          })
          // .attr('transform', (n) => {
          //   // console.log('transform yAxis enter', yAxis.enter().data(), 'yAxis exit', yAxis.exit().data());
          //   const olddata = yAxis.exit().data();
          //   const dateDict = olddata.map((d) => {
          //     const stDate = d3.min([d, n]);
          //     const enDate = d3.max([d, n]);
          //     const count = d3.timeDay.count(stDate, enDate);
          //     return { date: d, value: count };
          //   });
          //   console.log('dateDict', dateDict);
          //   const minDate = dateDict.reduce((acc, d) => (acc.value > d.value ? d : acc), dateDict[0]);
          //   // console.log('minDate', minDate);
          //   const nearest = yAxis.exit().filter(d => d === minDate.date);
          //   // console.log('nearest', nearest);
          //   if (!nearest.empty()) {
          //     return nearest.attr('transform');
          //   }
          // })
          .transition()
          .duration(2000)
          .attr('transform', d => `translate(0, ${yDate(d.date)})`);

      yAxis.merge(yAxisEnter)
          .select('rect')
          // .attr('height', 0)
          // .attr('width', 0)
          .transition()
          .duration(500)
          .attr('height', d => height(d.date))
          .attr('width', width);


      yAxis.merge(yAxisEnter).select('text')
        .text(d => timeFormat(d.date))

         .attr('transform', function(d) {
           const bbox = this.getBBox();
           return `translate(${0},${height(d.date) / 2 + bbox.height / 4})`;
         });

      yAxis.exit().remove();

      // yAxis.exit().selectAll('rect')
      //     .transition()
      //     .duration(1000)
      //     .attr('height', 0)
      //     .attr('width', 0)
      //     .remove();
    }());


    // const proc = d3.select('g.center').selectAll('.proc')
    //     .data(nestedData, d => `${d.key}-${intervalStr}`);

      // const procWidth = d3.min([dim.subMargin.center / 2, tickHeight]);

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
    // }());
    //
  }());

  (function radiationBars() {
    // const stack = d3.stack();
    // stack
    //   .keys(keys)
    //   .value((a, key) => a.protections.find(b => b.key === key).value);

    const radBarWidth = d3.scaleLinear()
      .rangeRound([(dim.width / 2) - (dim.subMargin.center / 2), 0])
      .domain([0, d3.max(nestedData, d => d.totalRadiation)]);

    // g.append('g')
    //         .attr('class', 'grid')
    //         .attr('transform', `translate(0,${height})`)
    //         .call(d3.axisTop(radBarWidth)
    //             .tickSize(height, 0, 0)
    //             .tickFormat('')
    //         );

    const radBar = d3.select('.left').selectAll('.rad-bar')
      .data(nestedData, (d, i) => `rad${intervalStr}+${i}`);

    const radBarEnter = radBar.enter()
      // .append('g')
      // .attr('class', 'rad-cont')
      // .selectAll('rect')
      // .data(d => d.radiation)
      // .enter()
      .append('rect')
        .attr('class', 'rad-bar');
        // .style('opacity', d => ((d.key === 'right eye') ? 0.2 : 1))
        // .style('stroke', 'black')
        // .on('click', () => update(data, dim));

    radBar.merge(radBarEnter)
      .attr('x', function() { return d3.select(this).attr('x'); })
      .attr('y', function() { return d3.select(this).attr('y'); })
      .transition()
      .duration(500)
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
  }());
}

function create(svg, rawData) {
  const data = rawData.map(preprocess).sort((a, b) => a.date - b.date);
  // const svg = d3.select('#app').append('svg')
  //           .attr('width', 1200)
  //           .attr('height', 800);

  const brushHeight = 50;
  const brushHandleSize = 40;
  const axisHeight = 45;

  const outerMargin = { top: 0, right: 10, bottom: 0, left: 10 };

  const subMargin = {
    top: brushHeight + axisHeight + 40,
    right: 0,
    bottom: 0,
    left: 0,
    center: 50
  };

  const width = +svg.attr('width') - outerMargin.left - outerMargin.right;
  const height = +svg.attr('height') - outerMargin.top - outerMargin.bottom;
  const subHeight = height - subMargin.top - subMargin.bottom;
  const subWidth = height - subMargin.left - subMargin.right;

  const dim = { width, height, subMargin };

  const cont = svg
            .append('g')
            .attr('class', 'cont')
            .attr('transform', `translate(${outerMargin.left},${outerMargin.top})`);

  const context = cont.append('g')
    .attr('class', 'context');

  const gBrush = context.append('g')
      .attr('class', 'brush');

  const subCont = cont
            .append('g')
            .attr('class', 'sub-cont')
            .attr('transform', `translate(${0},${subMargin.top})`);

  subCont.append('g')
      .attr('class', 'prot-axis axis-x')
      // .attr('transform', `translate(0,${0})`);
      .attr('transform', `translate(0,${-10})`);

  subCont.append('g')
      .attr('class', 'rad-axis axis-x')
      // .attr('transform', `translate(0,${-20})`);
      .attr('transform', `translate(0,${-10})`);

  const gMain = subCont.append('g')
            .attr('class', 'main')
            .attr('clip-path', 'url(#clip)');

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
      .attr('class', 'date-axis');

  // const defaultTimeInterval = d3.timeDay;
  const [startDate, endDate] = d3.extent(data, d => d.date);

  const yDate = d3.scaleTime()
      .domain([d3.timeMonth.floor(startDate), d3.timeMonth.ceil(endDate)])
      .range([0, subHeight]);

  const yDate2 = yDate.copy();

  const brushScale = d3.scaleTime()
    .domain([d3.timeMonth.floor(startDate), d3.timeMonth.ceil(endDate)])
      // .domain([startDate, endDate])
    .range([brushHandleSize, width - brushHandleSize]);

  context.selectAll('.mark')
  .data(data)
  .enter()
  .append('line')
  .attr('stroke', 'grey')
  .attr('stroke-width', 0.5)
  .attr('x1', d => brushScale(d.date))
  .attr('y1', 0)
  .attr('y2', brushHeight)
  .attr('x2', d => brushScale(d.date));

  context.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${brushHeight})`)
      .call(d3.axisBottom(brushScale));

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
    } else {
      handle
        .attr('display', null)
        .attr('transform', (d, i) => `translate(${s[i]},${brushHeight / 2})`);
    }
  }

  function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
    const t = d3.event.transform;
    // yDate2 = yDate.copy();
    yDate.domain(t.rescaleX(yDate2).domain());
    update(data, dim, yDate);
    context.select('.brush').call(brush.move, brushScale.range().map(t.invertX, t));
  }

  const zoomHandler = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .duration(1000)
    .on('zoom', zoomed);

  const brush = d3.brushX()
    .extent([[0, 0], [dim.width, brushHeight]])
    .handleSize(brushHandleSize)
    .on('start brush', () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
      const s = d3.event.selection || brushScale.range();
      const d0 = s.map(brushScale.invert, brushScale);
      // const d1 = d0.map(defaultTimeInterval.round);
      // if (d1[0] >= d1[1]) {
      //   d1[0] = defaultTimeInterval.floor(d0[0]);
      //   d1[1] = defaultTimeInterval.offset(d1[0]);
      // }
      // if (d3.event.sourceEvent) {
      yDate.domain(d0);

      // svg.select('.zoom').call(zoom.transform, d3.zoomIdentity
      //   .scale(width / (s[1] - s[0]))
      //   .translate(-s[0], 0));

      update(data, dim, yDate);
      brushmoved(handle, s);
      // }
    });


  function progZoom(el, x) {
    zoomHandler.transform(svg, d3.zoomIdentity.translate(x, 0));
  }

  let factor = 0;
  svg.append('rect')
      .attr('class', 'zoom')
      .attr('width', 20)
      .attr('height', 20)
      // .attr('fill', 'none')
      .attr('opacity', 0.1)
      .attr('transform', `translate(${width - 20},${height - 20})`)
      // .call(zoomHandler);
      .on('click', function() {
        progZoom(d3.select(this), factor);
        factor += 40;
      });

  svg.append('rect')
      // .attr('class', 'zoom')
      .attr('width', 20)
      .attr('height', 20)
      // .attr('fill', 'none')
      .attr('opacity', 0.1)
      .attr('transform', `translate(${width - 20},${height - 40})`)
      // .call(zoomHandler);
      .on('click', function() {
        progZoom(d3.select(this), factor);
        factor -= 40;
      });

  svg.append('rect')
      .attr('class', 'zoom')
      .attr('width', subWidth)
      .attr('height', subHeight)
      // .attr('fill', 'none')
      .attr('opacity', 0.1)
      .attr('transform', `translate(${subMargin.left},${subMargin.top})`)
      .call(zoomHandler);
  //
  d3.select('.brush')
      .call(brush)
      .call(brush.move, brushScale.range());

  update(data, dim, yDate);
}


export { create, update };
