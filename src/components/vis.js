import * as d3 from 'd3';
// import _ from 'lodash';
// import textures from 'textures';

// import { dateDiff } from './lib/utils';
import * as moreSymbols from 'd3-symbol-extra';

import '../global_styles/style.scss';
import cabinSrc from './cabin.png';
import glassesSrc from './glasses.png';
import shieldSrc from './shield.png';

const extraSymbols = Object.values(moreSymbols).reverse();
const timeFormatStr = '%d/%m/%Y';
// const formatDate = d3.timeFormat(timeFormatStr);
const parseDate = d3.timeParse(timeFormatStr);

const keys = ['shield', 'glasses', 'cabin'];
const formatTime = d3.timeFormat('%Y/%m/%d %H:%M:%S %Z');

const delay = 700;

const paddingScale = d3.scaleOrdinal()
  .domain(['years', 'months', 'weeks', 'days', 'hours'])
  .range([10, 2, 2, 1, 1]);

const arrowSize = d3.scaleOrdinal()
  .domain(['years', 'months', 'weeks', 'days', 'hours'])
  .range([16, 8, 8, 8, 7]);

const protColor = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeCategory10);

const protIconScale = d3.scaleOrdinal()
                        .domain(keys)
                        .range([shieldSrc, glassesSrc, cabinSrc]);

d3.selection.prototype.tspans = function(lines, lh) {
  return this.selectAll('tspan')
            .data(lines)
            .enter()
            .append('tspan')
            .text(d => d)
            .attr('x', 0)
            .attr('dy', (d, i) => (i ? lh || 15 : 0));
};

function wordwrap(line, maxCharactersPerLine) {
  const w = line.split(' ');
  const lines = [];
  const words = [];
  const maxChars = maxCharactersPerLine || 40;
  let l = 0;

  w.forEach((d) => {
    if (l + d.length > maxChars) {
      lines.push(words.join(' '));
      words.length = 0;
      l = 0;
    }
    l += d.length;
    words.push(d);
  });
  if (words.length) {
    lines.push(words.join(' '));
  }
  return lines;
}


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

function arrow(width, totalHeight, arrH) {
  const height = totalHeight;
  const data = [
    [-width / 2, height - arrH],
    [-width / 2, 0],
    [0, arrH],
    [width / 2, 0],
    [width / 2, height - arrH],
    [0, height]
  ];
  return d3.line()(data);
}

function intervalBefore(intervalKey) {
  switch (intervalKey) {
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
      intervalKey: 'hours',
      tickInterval: d3.timeHour,
      nestInterval: d3.timeHour,
      timeFormat: d3.timeFormat('%I %p')
    };
  case (d3.timeDay.count(startDate, endDate) <= 10):
    return {
      intervalKey: 'days',
      tickInterval: d3.timeDay,
      nestInterval: d3.timeDay,
      timeFormat: d3.timeFormat('%a %d')
    };
  case (d3.timeMonth.count(startDate, endDate) <= 1):
    return {
      intervalKey: 'weeks',
      tickInterval: d3.timeWeek,
      nestInterval: d3.timeDay,
      timeFormat: d3.timeFormat('%b week %U')
    };
  case (d3.timeMonth.count(startDate, endDate) <= 12):
    return {
      intervalKey: 'months',
      tickInterval: d3.timeMonth,
      nestInterval: d3.timeWeek,
      timeFormat: d3.timeFormat('%B')
    };
  default:
    return {
      intervalKey: 'years',
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
    intervalKey,
    tickInterval,
    timeFormat,
    nestInterval
  } = { ...d3TimeSwitch(data, ...yDate.domain()), yDate };

  console.log('timeInterval', intervalKey, 'timeDomain', yDate.domain());
  const nestedData = aggregate(data, nestInterval);

  const [startDate, endDate] = yDate.domain();
  const barHeight = yDate(startDate) - yDate(nestInterval.offset(startDate, -1));
  const symbols = d3.scaleOrdinal()
    .range(extraSymbols);


  const barPadding = paddingScale(intervalKey);
  (function protectionBars() {
    // const axis = d3.select('.prot-axis').call(d3.axisTop(d3.scaleLinear()
    //   .rangeRound([dim.width / 2 + dim.centerWidth / 2, dim.width])
    //   .domain([0, 1])
    // ));

    // axis.append('text')
    //   .attr('x', -45)
    //   .attr('dy', '-30')
    //   .attr('dx', dim.width)
    //   .attr('text-anchor', 'middle')
    //   .attr('fill', '#000')
    //   .attr('font-size', 15)
    //   .attr('font-weight', 'bold')
    //   .text('Protection');

    const barWidth = d3.scaleLinear()
      .range([dim.width / 2 + dim.centerWidth / 2, dim.width])
      .domain([0, 1]);

    const stacked = d3.stack()
      .keys(keys)
      .value((a, key) => d3.sum(a.values, e => e.protections.find(b => b.key === key)
          .value) / a.values.length)(nestedData);

    stacked.forEach((layer) => {
      layer.forEach((d) => {
        d.y = yDate(d.data.date) + barPadding / 2;
        d.x = barWidth(d[0]);
        d.width = barWidth(d[1]) - barWidth(d[0]);
        d.height = barHeight - barPadding;
      });
    });

    symbols.domain(['CA', 'CA+PCI', 'PVI', 'PM-Implantation']);

    const protLayer = d3.select('g.right').selectAll('.prot-layer')
    // TODO: find correct
      .data(stacked, (d, i) => `prots${intervalKey}+${i}`);

    protLayer.exit().remove();

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
      .duration(delay)
      .attr('y', d => yDate(d.data.date) + barPadding / 2)
      .attr('x', d => barWidth(d[0]))
      .attr('width', d => barWidth(d[1]) - barWidth(d[0]))
      .attr('height', barHeight - barPadding);

    protSeg.exit().remove();

    (function linkData() {
      // keys.forEach((key) => {
        // const seg = d3.selectAll('.prot-seg').filter(d => d.data.key === key);
      const links = stacked.map(layer => layer.slice(2).reduce((acc, cur) => {
        const last = acc[acc.length - 1].target;
        return acc.concat([{
          source: last,
          target: cur,
          key: layer.key
        }]);
      }, [{
        key: layer.key,
        source: layer[0],
        target: layer[1]
      }])
      );
      console.log('links', links);

      function linkSeg(l) {
        const points = [
                [l.source.x, l.source.y + l.source.height],
                [l.source.x, l.source.y],
                [l.source.x + l.source.width, l.source.y],
                [l.source.x + l.source.width, l.source.y + l.source.height],
                // [l.source.x, l.source.y + l.source.height],

                [l.target.x + l.target.width, l.target.y],
                [l.target.x + l.target.width, l.target.y + l.target.height],
                [l.target.x, l.target.y + l.target.height],
                [l.target.x, l.target.y]
        ];
        return d3.line()(points);
      }

      const linkLayer = d3.select('.right').selectAll('.link-layer')
        .data(links);

      const linkLayerEnter = linkLayer.enter()
        .append('g')
        .attr('class', 'link-layer');

      linkLayer.exit().remove();

      const linkLine = linkLayer.selectAll('path')
        .data(d => d);

      const linkLineEnter = linkLine.enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', d => protColor(d.key))
        .attr('opacity', 0.5);
        // .style('stroke', 'black');

        // .style('stroke-width', l => y(l.value))
      linkLine.merge(linkLineEnter)
        .transition()
        .duration(delay)
        .attr('d', linkSeg);

      linkLine.exit().remove();

      // });
    }());
  }());

  (function timeLine() {
    const margin = 15;
    const width = dim.centerWidth - margin;
    const tickHeight = d => yDate(tickInterval.offset(d, 1)) - yDate(d);

    const timeData = tickInterval
      .range(...[tickInterval.floor(startDate), tickInterval.ceil(endDate)])
      .map(d => ({ key: timeFormat(d), date: d }));

    const yAxis = d3.select('.date-axis').selectAll('.time-tick')
      .data(timeData, d => d.key);

    function initTransform(n) {
      const dateDict = yAxis.exit().data().map((d) => {
        const count = intervalBefore(intervalKey)
            .count(d3.min([d.date, n.date]), d3.max([d.date, n.date]));
        return { date: d.date, value: count };
      });
      const minDate = dateDict
          .reduce((acc, d) => (acc.value > d.value ? d : acc), dateDict[0]);
      const nearest = yAxis.exit().filter(d => d.date === minDate.date);
      if (!nearest.empty()) {
        return nearest.attr('transform');
      }
      return `translate(${dim.width / 2},${dim.height / 2})`;
    }

    const yAxisEnterG = (function enter() {
      const gEnter = yAxis.enter()
        .append('g')
        .attr('transform', initTransform)
        .attr('class', 'time-tick')
        .attr('transform', d => `translate(0, ${yDate(d.date)})`);

      gEnter
        .append('text')
        // .text(d => timeFormat(d.date))
        .attr('font-size', 14)
        .attr('text-anchor', 'middle')
        .tspans(d => wordwrap(timeFormat(d.date), 3));

      gEnter
        .append('path')
        .attr('fill', 'grey')
        .attr('opacity', 0.4)
        .attr('stroke', 'grey')
        .on('click', (d) => {
          const timeDomain = [tickInterval.floor(d.date), tickInterval.offset(d.date, 1)];
          const yDateCopy = yDate.copy().domain(timeDomain);
          // context.select('.brush').call(brush.move, brushScale.range().map(t.invertX, t));
          update(data, dim, yDateCopy);
        });

      return gEnter;
    }());

    d3.selectAll('*').on('mouseover', d => console.log('mouseover', d));

    yAxis
      .attr('transform', function() {
        return d3.select(this).attr('transform');
      })
      .transition()
      .duration(delay)
      .attr('transform', d => `translate(0, ${yDate(d.date)})`);

    (function enterUpdate() {
      const enterUpdateG = yAxis.merge(yAxisEnterG);
      enterUpdateG.select('path')
        .transition()
        .duration(delay)
        .attr('d', d => arrow(width, tickHeight(d.date), arrowSize(intervalKey)))
        .attr('height', d => tickHeight(d.date))
        .attr('width', width);

      enterUpdateG.select('text')
        .transition()
        .duration(delay)
        .attr('transform', function(d) {
          return `translate(${0},${tickHeight(d.date) / 2 - this.getBBox().height / 4})`;
        });
    }());

    yAxis.exit().remove();
    // yAxis.exit().selectAll('rect')
    //     .transition()
    //     .duration(1000)
    //     .attr('height', 0)
    //     .attr('width', 0)
    //     .remove();
  }());


  // const proc = d3.select('g.center').selectAll('.proc')
  //     .data(nestedData, d => `${d.key}-${intervalKey}`);

  // const procWidth = d3.min([dim.margin.center / 2, tickHeight]);

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

  (function radiationBars() {
    const radDose = d3.scaleLinear()
    .domain(d3.extent(nestedData, d => d.totalRadiation))
    .range(['#ffff00', '#ff0000']);
    // const stack = d3.stack();
    // stack
    //   .keys(keys)
    //   .value((a, key) => a.protections.find(b => b.key === key).value);

    const radBarWidth = d3.scaleLinear()
      .rangeRound([(dim.width / 2) - (dim.centerWidth / 2), 0])
      .domain([0, d3.max(nestedData, d => d.totalRadiation)]);

    // g.append('g')
    //         .attr('class', 'grid')
    //         .attr('transform', `translate(0,${height})`)
    //         .call(d3.axisTop(radBarWidth)
    //             .tickSize(height, 0, 0)
    //             .tickFormat('')
    //         );

    const radBar = d3.select('.left').selectAll('.rad-bar')
      .data(nestedData, (d, i) => `rad${intervalKey}+${i}`);

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
      .duration(delay)
      .attr('x', d => radBarWidth(d.totalRadiation))
      .attr('y', d => yDate(d.date) + barPadding / 2)
      .attr('width', d => radBarWidth(0) - radBarWidth(d.totalRadiation))
      .attr('height', barHeight - barPadding)
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

  const brushMargin = 40;
  const legendHeight = 35;
  const legendMargin = 10;

  const outerMargin = { top: 0, right: 10, bottom: 0, left: 10 };

  const margin = {
    top: brushHeight + brushMargin + legendHeight + legendMargin,
    right: 0,
    bottom: 0,
    left: 0
  };

  const width = +svg.attr('width') - outerMargin.left - outerMargin.right;
  const height = +svg.attr('height') - outerMargin.top - outerMargin.bottom;
  const subHeight = height - margin.top - margin.bottom;
  // const subWidth = height - margin.left - margin.right;
  const centerWidth = 50;

  const dim = { width, height, centerWidth, margin };


  // const radDose = d3.scaleQuantile()
  // .domain([d3.extent(data, d => d.radiation)])
  // .range(['yellow', 'orange', 'red']);

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
    .attr('transform', `translate(${0},${margin.top})`);

  subCont.append('g')
    .attr('class', 'prot-axis axis-x')
  // .attr('transform', `translate(0,${0})`);
    .attr('transform', `translate(0,${-10})`);

  const iconWidth = (width / 2 - centerWidth / 2) / keys.length;
  const iconHeight = 40;

  (function protLegend() {
    const iconCont = cont.append('g')
    .attr('class', 'protection-legend')
    .attr('transform', `translate(${width / 2 + centerWidth / 2},${brushHeight + brushMargin})`);
    const iconG = iconCont.selectAll('.icon')
          .attr('width', iconWidth)
          .attr('height', iconHeight)
          .data(keys)
          .enter()
          .append('g')
          .attr('class', 'icon')
          .attr('transform', (d, i) => `translate(${i * iconWidth},${0})`);

    iconG.append('rect')
          .attr('width', iconWidth)
          .attr('height', iconHeight)
          .attr('rx', 12)
          .attr('ry', 12)
          .attr('fill', protColor);

    iconG
        .append('image')
          .attr('width', iconWidth)
          .attr('height', iconHeight)
        .attr('xlink:href', protIconScale);
  }());

  (function radLegend() {
    const maxRad = d3.extent(data, d => d.radiation)[1];

    const stepNum = 3;
    const step = maxRad / stepNum;
    const da = d3.range(step, maxRad + step, step);

    const quants = da.slice(1).reduce((acc, d) => {
      const last = acc[acc.length - 1];
      return acc.concat([{ start: last.end, end: d }]);
    }, [{ start: 0, end: da[0] }]);

    console.log('data', data);
    const radScale = d3.scaleOrdinal()
    .domain(quants.map(d => d.end))
    .range(['yellow', 'orange', 'red'].reverse());

    const iconCont = cont.append('g')
    .attr('class', 'radiation-legend')
    .attr('transform', `translate(${0},${brushHeight + brushMargin})`);

    const iconG = iconCont.selectAll('.icon')
          .attr('width', iconWidth)
          .attr('height', iconHeight)
          .data(quants)
          .enter()
          .append('g')
          .attr('class', 'icon')
          .attr('transform', (d, i) => `translate(${i * iconWidth},${0})`);

    iconG.append('rect')
          .attr('width', iconWidth)
          .attr('height', iconHeight)
          .attr('rx', 12)
          .attr('ry', 12)
          .attr('fill', d => radScale(d.end));

    // iconG
    //     .append('image')
    //       .attr('width', iconWidth)
    //       .attr('height', iconHeight)
    //     .attr('xlink:href', protIconScale);
  }());

  // subCont.append('g')
  //   .attr('class', 'rad-axis axis-x')
  // // .attr('transform', `translate(0,${-20})`);
  //   .attr('transform', `translate(0,${-10})`);

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
    .call(d3.axisBottom(brushScale).ticks(d3.timeMonth.every(1)));

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

  // svg.append('rect')
  //   .attr('class', 'zoom')
  //   .attr('width', subWidth)
  //   .attr('height', subHeight)
  // // .attr('fill', 'none')
  //   .attr('opacity', 0.1)
  //   .attr('transform', `translate(${margin.left},${margin.top})`)
  //   .call(zoomHandler);
  //
  d3.select('.brush')
    .call(brush)
    .call(brush.move, brushScale.range());

  update(data, dim, yDate);
}

export { create, update };
