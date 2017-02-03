import * as d3 from 'd3';
// import _ from 'lodash';
// import textures from 'textures';

// import { dateDiff } from './lib/utils';
// import * as moreSymbols from 'd3-symbol-extra';

// import '../global_styles/style.scss';
import cabinSrc from './cabin.png';
import glassesSrc from './glasses.png';
import shieldSrc from './shield.png';

// const extraSymbols = Object.values(moreSymbols).reverse();
// const timeFormatStr = '%d/%m/%Y';
// const formatDate = d3.timeFormat(timeFormatStr);

const keys = ['shield', 'glasses', 'cabin'];
const formatTime = d3.timeFormat('%Y/%m/%d %H:%M:%S %Z');

const delay = 700;

const paddingScale = d3.scaleOrdinal()
  .domain(['years', 'months', 'weeks', 'days', 'hours'])
  .range([16, 8, 2, 2, 7]);

const arrowSize = d3.scaleOrdinal()
  .domain(['years', 'months', 'weeks', 'days', 'hours'])
  .range([16, 8, 8, 8, 7]);

const protColor = d3.scaleOrdinal()
    .domain(keys)
    .range(['rgb(55, 126, 184)', 'rgb(77, 175, 74)', 'rgb(166, 86, 40)']);

const protIconScale = d3.scaleOrdinal()
                        .domain(keys)
                        .range([shieldSrc, glassesSrc, cabinSrc]);


const radColors = ['#ffff00', '#ffe600', '#ffcd00', '#ffb400', '#ff9900', '#ff7a00', '#ff5300', '#ff0000'];

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
      // e.totalProtection = d3.sum(e.values, a => a#<{(| .t |)}>#otalProtection) / e.values.length;
      e.totalRadiation = d3.sum(e.values, a => a.radiation) / e.values.length;
      return e;
    });
}

function arrowLine(width, totalHeight, arrH) {
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
function prevInterval(intervalKey) {
  switch (intervalKey) {
  case 'months': return d3.timeYear;
  case 'weeks': return d3.timeMonth;
  case 'days': return d3.timeWeek;
  case 'hours': return d3.timeDay;
  default: return d3.timeHour;
  }
}

function nextInterval(intervalKey) {
  switch (intervalKey) {
  case 'years': return d3.timeYear;
  case 'months': return d3.timeWeek;
  case 'weeks': return d3.timeDay;
  case 'days': return d3.timHour;
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
  case (d3.timeDay.count(startDate, endDate) <= 15):
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


function update(data, dim, yDate, brush, brushScale) {
  // const selData = data.map(preselect);
  //
  const [startDate, endDate] = d3.extent(data, d => d.date);
  //
  const {
    intervalKey,
    tickInterval,
    timeFormat,
    nestInterval
  } = { ...d3TimeSwitch(data, ...yDate.domain()), yDate };
  // yDate.domain([tickInterval.floor(startDate), tickInterval.offset(endDate, 1)]);

  console.log('yDate domain', yDate.domain());

  const nestedData = aggregate(data, nestInterval);

  // const [startDate, endDate] = yDate.domain();
  const barHeight = yDate(startDate) - yDate(nestInterval.offset(startDate, -1));
  // const symbols = d3.scaleOrdinal()
  //   .range(extraSymbols);

  const barPadding = paddingScale(intervalKey);
  (function protBars() {
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
      .domain([0, 1])
      .range([0, dim.width / 2]);

    const stacked = d3.stack()
      .keys(keys)
      .value((a, key) => d3.sum(a.values, e => e.protection[key]) / a.values.length)(nestedData);

    stacked.forEach((layer) => {
      layer.forEach((d) => {
        d.y = yDate(d.data.date);
        d.x = barWidth(d[0]);
        d.width = barWidth(d[1]) - barWidth(d[0]);
        d.height = barHeight - barPadding;
      });
    });

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

    const protLinkLayer = d3.select('.right').selectAll('.prot-link-layer')
        .data(links);

    protLinkLayer.enter()
        .append('g')
        .attr('class', 'prot-link-layer');

    protLinkLayer.exit().remove();

    const protLinkPath = protLinkLayer.selectAll('.link')
        .data(d => d);

    const protLinkPathEnter = protLinkPath.enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', d => protColor(d.key))
        .attr('opacity', 0.3);

    protLinkPath.merge(protLinkPathEnter)
        .transition()
        .duration(delay)
        .attr('d', linkSeg);

    protLinkPath.exit().remove();


    // symbols.domain(['CA', 'CA+PCI', 'PVI', 'PM-Implantation']);

    const protLayer = d3.select('.right').selectAll('.prot-layer')
    // TODO: find correct
      .data(stacked, (d, i) => `prots${intervalKey}+${i}`);

    protLayer.exit().remove();


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
      .attr('y', d => d.y)
      .attr('x', d => d.x)
      .attr('width', d => d.width)
      .attr('height', d => d.height);

    protSeg.exit().remove();

    (function linkData() {
      // keys.forEach((key) => {
        // const seg = d3.selectAll('.prot-seg').filter(d => d.data.key === key);

      // });
    }());
  }());

  (function timeLine() {
    const margin = 15;
    const width = dim.centerWidth - margin;
    const tickHeight = d => yDate(tickInterval.offset(d, 1)) - yDate(d);
    const trange = [tickInterval.floor(yDate.domain()[0]), tickInterval.ceil(yDate.domain()[1])];
    const timeData = tickInterval
      .range(...trange)
      .map(d => ({ key: timeFormat(d), date: d }));

    const yAxis = d3.select('.date-axis').selectAll('.time-tick')
      .data(timeData, d => d.key);

    function initTransform(n) {
      const dateDict = yAxis.exit().data().map((d) => {
        const count = prevInterval(intervalKey)
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
          const interval = nextInterval(intervalKey);

          const timeDomain = [tickInterval.floor(d.date),
            tickInterval.ceil(tickInterval.offset(d.date, 1))];
          console.log('timeDomain', timeDomain);

          d3.select('.context').select('.brush')
            .transition()
            .duration(100)
            .call(brush.move, timeDomain.map(brushScale));
        });

      return gEnter;
    }());


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
        .attr('d', d => arrowLine(width, tickHeight(d.date), arrowSize(intervalKey)))
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
    // const radDose = d3.scaleLinear()
    // .domain(d3.extent(nestedData, d => d.totalRadiation))
    // .range(['#ffff00', '#ff0000']);
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

    nestedData.forEach((d) => {
      d.x = radBarWidth(d.totalRadiation);
      d.y = yDate(d.date);
      d.width = radBarWidth(0) - radBarWidth(d.totalRadiation);
      d.height = barHeight - barPadding;
    });

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
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      // .style('fill', d => radDose(d.totalRadiation));
      .style('fill', 'url(#full-gradient)');

    radBar.exit().remove();


    const radLinks = nestedData.slice(2).reduce((acc, cur) => {
      const last = acc[acc.length - 1].target;
      return acc.concat([{
        source: last,
        target: cur
      }]);
    }, [{
      source: nestedData[0],
      target: nestedData[1]
    }]);

    const radLinkLine = d3.select('.left').selectAll('.rad-link')
        .data(radLinks);

    const radLinkLineEnter = radLinkLine.enter()
        .append('path')
        .attr('class', 'rad-link')
        .style('fill', 'url(#full-gradient)')
        .attr('opacity', 0.3);
        // .style('stroke', 'black');

        // .style('stroke-width', l => y(l.value))
    radLinkLine.merge(radLinkLineEnter)
        .transition()
        .duration(delay)
        .attr('d', linkSeg);

    radLinkLine.exit().remove();
  }());
}


function create(el, dim, data) {
  const {
  width,
  height,
  subHeight,
  centerWidth,
  innerMargin,
  brushHandleSize,
  brushHeight,
  brushMargin,
  legendHeight,
  // legendMargin,
  outerMargin
  // innerMargin
} = dim;


  const svg = el.append('svg')
                  .attr('width', width)
                  .attr('height', height);

  const defs = svg.append('svg:defs');

  defs.append('linearGradient')
      .attr('id', 'full-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '60%')
      .attr('y2', '0%')
      .selectAll('stop')
      .data(radColors.reverse())
      .enter()
    .append('stop')
      .attr('offset', (d, i) => i / (radColors.length - 1))
      .attr('stop-color', d => d);

  const radLegendData = radColors.reverse().slice(1)
    .reduce((acc, d, i) => {
      const last = acc[acc.length - 1];
      if (i % 2 === 0) {
        last.push(d);
      } else {
        acc.push([d]);
      }
      return acc;
    }, [[radColors[0]]]);

// radColors.reverse()
  defs.selectAll('.gradient')
    .data(radLegendData.reverse())
    .enter()
    .append('linearGradient')
      .attr('class', 'gradient')
      .attr('id', (_, i) => `gradient-${i}`)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', '11%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '0%')
      .selectAll('stop')
      .data(d => d)
      .enter()
    .append('stop')
      .attr('offset', (d, i) => (i === 0 ? '0%' : '100%'))
      .attr('stop-color', d => d);
//

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
    .attr('transform', `translate(${0},${innerMargin.top})`);

  subCont.append('g')
    .attr('class', 'prot-axis')
  // .attr('transform', `translate(0,${0})`);
    .attr('transform', `translate(0,${-10})`);


  (function createProtLegend() {
    const iconWidth = (width / 2 - centerWidth / 2) / keys.length;
    const protLegend = cont.append('g')
    .attr('class', 'protection-legend')
    .attr('transform', `translate(${width / 2 + centerWidth / 2},${brushHeight + brushMargin})`);

    protLegend.append('text')
      .attr('dy', -10)
      .attr('dx', width / 2 - centerWidth / 2)
    .attr('text-anchor', 'end')
      .attr('fill', '#000')
      .attr('font-size', 15)
      .attr('font-weight', 'bold')
      .text('Protection');

    const protIcon = protLegend.selectAll('.prot-icon')
          .attr('width', iconWidth)
          .attr('height', legendHeight)
          .data(keys)
          .enter()
          .append('g')
          .attr('class', 'prot-icon')
          .attr('transform', (d, i) => `translate(${i * iconWidth},${0})`);

    protIcon.append('rect')
          .attr('width', iconWidth)
          .attr('height', legendHeight)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('fill', protColor);

    protIcon
        .append('image')
          .attr('width', iconWidth)
          .attr('height', legendHeight)
        .attr('xlink:href', protIconScale);
  }());

  (function createRadLegend() {
    // const x = d3.scale.linear()
    // .domain([0, 1]);

    const maxRad = d3.extent(data, d => d.radiation)[1];

    const iconWidth = (width / 2 - centerWidth / 2) / radLegendData.length;

    const stepNum = 4;
    // const iconWidth = (width / 2 - centerWidth / 2) / stepNum;
    // const maxRad = d3.extent(data, d => d.radiation)[1];

    const step = maxRad / stepNum;
    const range = d3.range(step, maxRad + step, step);

    const quantiles = range.slice(1)
      .reduce((acc, d) => acc.concat([{ start: acc[acc.length - 1].end, end: d }]),
        [{ start: 0, end: range[0] }]);

    const radLegend = cont.append('g')
      .attr('class', 'rad-legend').attr('transform', `translate(${0},${brushHeight + brushMargin})`); radLegend.append('rect')
    .attr('width', width / 2 - centerWidth / 2)
    .attr('height', legendHeight)
    .style('fill', 'url(#full-gradient)');
// make legend

    radLegend.append('text')
      .attr('dy', -10)
      // .attr('dx', width / 2 - centerWidth / 2)
      // .attr('text-anchor', 'end')
      .attr('fill', '#000')
      .attr('font-size', 15)
      .attr('font-weight', 'bold')
      .text('Radiation');

  // make quantized key legend items
    const li = radLegend.append('g')
    // .attr('transform', `translate (8,${titleheight + })`) return;
    .attr('class', 'legend-items');

    const g = li.selectAll('g')
    .data(quantiles.reverse())
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(${i * iconWidth},${0})`);

    g.append('rect')
    // .attr('y', (d, i) => i * 20 + 20 - 20)
    .attr('width', iconWidth)
    .attr('height', legendHeight)
    .attr('rx', 4)
    .attr('ry', 4)
    .attr('stroke', 'black')
    .attr('stroke-width', 0.5)
    .style('fill', 'none');
    // .style('fill', (d, i) => `url(#gradient-${i})`);

    g.append('text')
      // .append('tspan')
      .text(d => `> ${Math.round(d.end * 100) / 100}`)
      .style('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', 13)
      .attr('transform', function() {
        const parbbox = this.parentNode.getBBox();
        const bbox = this.getBBox();
        return `translate(${parbbox.width / 2 - bbox.width / 4},${parbbox.height / 2 - bbox.height / 4})`;
      });
  }());

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
    .attr('class', 'right')
    .attr('transform', `translate(${width / 2 + centerWidth / 2},${0})`);

  gCenter.append('g')
    .attr('class', 'date-axis');

  // const defaultTimeInterval = d3.timeDay;
  const [startDate, endDate] = d3.extent(data, d => d.date);

  const offset = 30;
  const yDate = d3.scaleTime()
    // .domain([d3.timeMonth.floor(startDate), d3.timeMonth.offset(endDate, 1)])
    // TODO: fix offset bug
    .range([0, subHeight - offset]);

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
      // if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
      const s = d3.event.selection || brushScale.range();
      const d0 = s.map(brushScale.invert, brushScale);
      console.log('brushDomain', d0);
      yDate
        .domain(d0);
        // .domain([d3.timeMonth.floor(d0[0]), d3.timeMonth.ceil(d0[1])]);


      update(data, dim, yDate, brush, brushScale);
      d3.selectAll('*').on('mouseover', d => console.log('d', d));
      brushmoved(handle, s);
      // }
    });

  d3.select('.brush')
    .call(brush)
    .call(brush.move, brushScale.range());


  return { yDate, brush, brushScale };
}

export { create, update };
