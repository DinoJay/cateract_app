import * as d3 from 'd3';

const keys = ['shield', 'glasses', 'cabin'];

const delay = 900;

const paddingScale = d3.scaleOrdinal()
  .domain(['years', 'months', 'weeks', 'days', 'hours'])
  .range([16, 8, 2, 2, 7]);

const arrowSize = d3.scaleOrdinal()
  .domain(['years', 'months', 'weeks', 'days', 'hours'])
  .range([16, 8, 8, 8, 7]);

const protColor = d3.scaleOrdinal()
    .domain(keys)
    .range(['#0275d8', '#5cb85c', '#f0ad4e']);


const iconSize = 30;
function minusPath(rawSize = iconSize) {
  const size = rawSize / 2;
  return `M${-size / 2},${-size / 6} L${-size / 2},${size / 6} L${size / 2},${size / 6} L${size / 2},${-size / 6} Z`;
}

function barPath(rawSize = iconSize) {
  const size = rawSize / 2;
  return `M${-size / 6},${-size / 2} L${-size / 6},${size / 2} L${size / 6},${size / 2} L${size / 6},${-size / 2} Z`;
}

const iconPathScale = d3.scaleOrdinal()
                    .domain([0, 0.5, 1])
                    .range([minusPath, barPath, d3.symbol().size(iconSize * 5).type(d3.symbolCross)]);

// const protSymbol = d3.scaleOrdinal()
//                         .domain([0, 1, 2])
//                         .range([d3.symbol().type(d3.symbolMinus), d3.symbolCrod3.symbolCross, cabinSrc]);


const radColors = ['#ffff00', '#ffe600', '#ffcd00', '#ffb400', '#ff9900', '#ff7a00', '#ff5300', '#ff0000'];

const gcd = function(a, b) {
  if (!b) {
    return a;
  }

  return gcd(b, a % b);
};

function d3TimeSwitch(yDate) {
  // const [startDate, endDate] = yDate.domain();
  // var maxWidth = / 5;
  switch (true) {
  case (d3.timeDay.count(...yDate.domain()) <= 10):
    return {
      intervalKey: 'days',
      tickInterval: d3.timeDay,
      nestInterval: d3.timeDay,
      timeFormat: d3.timeFormat('%a %d')
    };
  case (d3.timeWeek.count(...yDate.domain()) <= 5):
    return {
      intervalKey: 'weeks',
      tickInterval: d3.timeWeek,
      nestInterval: d3.timeWeek,
      timeFormat: d3.timeFormat('%b week %U')
    };
  case (d3.timeMonth.count(...yDate.domain()) <= 4):
    return {
      intervalKey: 'months',
      tickInterval: d3.timeMonth,
      nestInterval: d3.timeWeek,
      timeFormat: d3.timeFormat('%b')
    };
  case (d3.timeMonth.count(...yDate.domain()) <= 12):
    return {
      intervalKey: 'months',
      tickInterval: d3.timeMonth,
      nestInterval: d3.timeMonth,
      timeFormat: d3.timeFormat('%b')
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

const formatTime = d3.timeFormat('%Y/%m/%d %H:%M ');

function aggregate(data, timeInterval) {
  return d3.nest()
    .key(d => formatTime(timeInterval(d.date)))
    .entries(data)
    .map((e) => {
      e.date = new Date(e.key);
      e.sumRadiation = d3.max(e.values, a => a.radiation);
      return e;
    });
}


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
  console.log('l', l);
  if (l.source === undefined || l.target === undefined) return null;
  const points = [
                [l.source.x, l.source.y + l.source.height],
                [l.source.x, l.source.y],
                [l.source.x + l.source.width, l.source.y],
                [l.source.x + l.source.width, l.source.y + l.source.height],

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

// function nextInterval(intervalKey) {
//   switch (intervalKey) {
//   case 'years': return d3.timeYear;
//   case 'months': return d3.timeWeek;
//   case 'weeks': return d3.timeDay;
//   case 'days': return d3.timHour;
//   case 'hours': return d3.timeDay;
//   default: return d3.timeHour;
//   }
// }


function _update() {
  const self = this;

  console.log('yDate', self.yDate);
  if (self.yDate === undefined) return;

  const {
    intervalKey,
    tickInterval,
    timeFormat,
    nestInterval
  } = d3TimeSwitch(self.yDate);
  // yDate.domain([tickInterval.floor(startDate), tickInterval.offset(endDate, 1)]);


  const nestedData = aggregate(self.data, nestInterval);
  const newMaxRad = d3.max(nestedData, d => d.sumRadiation);
  self.maxRad = newMaxRad > 0 ? newMaxRad : self.maxRad;

  // const [startDate, endDate] = yDate.domain();
  // const barHeight = self.yDate(startDate) - self.yDate(nestInterval.offset(startDate, -1));
  // const symbols = d3.scaleOrdinal()
  //   .range(extraSymbols);

  const radBarWidth = d3.scaleLinear()
          .rangeRound([(self.dim.width / 2) - (self.dim.centerWidth / 2), 0])
          .domain([0, self.maxRad]);


  const thresholdLine = d3.select('.rad-legend').selectAll('#thresholdLine')
    .data([self.threshhold]);

  const threshholdLineEnter = thresholdLine.enter()
    .append('line')
        .attr('id', 'thresholdLine')
        .style('stroke', 'black')
        .style('stroke-dasharray', 2.5);


  thresholdLine.merge(threshholdLineEnter)
        .transition()
        .duration(delay)
        .attr('x1', radBarWidth)
        .attr('y1', self.dim.legendHeight)
        .attr('x2', radBarWidth)
        .attr('y2', self.dim.height);

  (function updateRadLegend() {
    const stepNum = 4;
    const tickVals = d3.ticks(0, self.maxRad, stepNum).slice(1);
    const w = radBarWidth(tickVals[1]) - radBarWidth(tickVals[0]);
    const radAxis = d3.axisTop(radBarWidth.copy().domain([0, self.maxRad]))
                      .tickValues(tickVals)
                      .tickSize(self.dim.legendHeight)
                      .tickPadding(0);

    d3.select('.rad-axis')
      .transition()
      .duration(delay)
      .call(radAxis);


    d3.select('.rad-axis').selectAll('.tick text')
      .attr('font-size', 12)
      .style('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('dy', self.dim.legendHeight / 2)
      .attr('dx', -w / 2);

    // d3.select('.rad-axis')

    // d3.select('.rad-axis').remove('.domain');

    // TODO: change
  }());


  const barHeight = d => self.yDate(nestInterval.offset(d, 1)) - self.yDate(d);

  (function protBars() {
    const stacked = d3.stack()
      .keys(self.keys)
      .value((a, key) => d3.mean(a.values, e => e.protection[key]))(nestedData);

    stacked.forEach((layer) => {
      layer.forEach((d) => {
        const w = radBarWidth(d.data.sumRadiation);
        const barWidth = d3.scaleLinear()
          .domain([0, 1])
          .range([0, w > 0 ? w : 3]);
          // .clamp(true);

        d.y = self.yDate(d.data.date) + (arrowSize(intervalKey) / 2);
        d.x = barWidth(d[0]);
        d.width = barWidth(d[1]) - barWidth(d[0]);
        d.height = d3.max([4, barHeight(d.data.date) - (arrowSize(intervalKey) * (3 / 2))]);
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
    }]));

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

    const protLayer = d3.select('.right').selectAll('.prot-layer')
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
      })
      .on('click', d => console.log('click', d));

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
  }());

  (function timeLine() {
    const tickHeight = d => self.yDate(tickInterval.offset(d, 1)) - self.yDate(d);
    const margin = 15;
    const width = self.dim.centerWidth - margin;
    const trange = [tickInterval.floor(self.yDate.domain()[0]),
      tickInterval.ceil(self.yDate.domain()[1])];


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
      return `translate(${self.dim.width / 2},${self.dim.height / 2})`;
    }

    const yAxisEnterG = (function enter() {
      const gEnter = yAxis.enter()
        .append('g')
        .attr('transform', initTransform)
        .attr('class', 'time-tick')
        .attr('transform', d => `translate(0, ${self.yDate(d.date)})`)
        .style('text-anchor', 'middle');

      gEnter
        .append('text')
        .attr('font-size', 14)
        .tspans(d => wordwrap(timeFormat(d.date), 3))
        .attr('alignment-baseline', 'hanging');

      gEnter
        .append('path')
        .attr('fill', 'grey')
        .attr('opacity', 0.4)
        .attr('stroke', 'grey')
        .on('click', (d) => {
          // const interval = nextInterval(intervalKey);

          const timeDomain = [tickInterval.floor(d.date),
            tickInterval.ceil(tickInterval.offset(d.date, 1))];
          // console.log('timeDomain', timeDomain);

          d3.select('.context').select('.brush')
            .transition()
            .duration(100)
            .call(self.brush.move, timeDomain.map(self.brushScale));
        });

      return gEnter;
    }());


    yAxis
      .attr('transform', function() {
        return d3.select(this).attr('transform');
      })
      .transition()
      .duration(delay)
      .attr('transform', d => `translate(0, ${self.yDate(d.date)})`);

    (function enterUpdate() {
      const enterUpdateG = yAxis.merge(yAxisEnterG);
      enterUpdateG.select('path')
        .attr('stroke-opacity', 1)
        .transition()
        .duration(delay)
        .attr('stroke-opacity', 0)
        .attr('d', d => arrowLine(width, tickHeight(d.date), arrowSize(intervalKey)))
        .attr('height', d => tickHeight(d.date))
        .attr('width', width);

      enterUpdateG.select('text')
        .transition()
        .duration(delay)
        .attr('transform', function(d) {
          const bbox = this.getBBox();
          return `translate(${0},${tickHeight(d.date) / 2 - bbox.height / 2})`;
        });
    }());

    yAxis.exit()
      .remove();
  }());

  (function radiationBars() {
    const radBar = d3.select('.left').selectAll('.rad-bar')
      .data(nestedData, (d, i) => `rad${intervalKey}+${i}`);

    nestedData.forEach((d) => {
      d.x = radBarWidth(d.sumRadiation);
      d.y = self.yDate(d.date) + (arrowSize(intervalKey) / 2);
      d.width = radBarWidth(0) - radBarWidth(d.sumRadiation);
      d.height = d3.max([4, barHeight(d.date) - (arrowSize(intervalKey) * (3 / 2))]);
    });

    const radBarEnter = radBar.enter()
    // .append('g')
    // .attr('class', 'rad-cont')
    // .selectAll('rect')
    // .data(d => d.radiation)
    // .enter()
      .append('rect')
      .attr('class', 'rad-bar')
      .on('click', d => console.log('click radBar', d));
    // .style('opacity', d => ((d.key === 'right eye') ? 0.2 : 1))
    // .style('stroke', 'black')
    // .on('click', () => _update(data, dim));

    radBar.merge(radBarEnter)
      .attr('x', function() { return d3.select(this).attr('x'); })
      .attr('y', function() { return d3.select(this).attr('y'); })
      .transition()
      .duration(delay)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      // .style('fill', d => radDose(d.sumRadiation));
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
        .insert('path', '.rad-bar')
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


function create() {
  const el = d3.select(this.el);
  el.selectAll('*').remove();
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
  } = this.dim;

  const data = this.data;

  const self = this;

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

// radColors.reverse()
  // defs.selectAll('.gradient')
  //   .data(radLegendData.reverse())
  //   .enter()
  //   .append('linearGradient')
  //     .attr('class', 'gradient')
  //     .attr('id', (_, i) => `gradient-${i}`)
  //     .attr('gradientUnits', 'userSpaceOnUse')
  //     .attr('x1', '11%')
  //     .attr('y1', '0%')
  //     .attr('x2', '0%')
  //     .attr('y2', '0%')
  //     .selectAll('stop')
  //     .data(d => d)
  //     .enter()
  //   .append('stop')
  //     .attr('offset', (d, i) => (i === 0 ? '0%' : '100%'))
  //     .attr('stop-color', d => d);
//

  console.log('Outermargin', outerMargin);
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
    const r = 8;
    const protData = keys.map(k => ({ key: k, selected: 0.5 }));

    const protLegend = svg.append('g')
    .attr('class', 'prot-legend')
    .attr('transform', `translate(${width / 2 + centerWidth / 2},${brushHeight + brushMargin + outerMargin.top})`);

    protLegend.append('g')
      .attr('class', 'header')
      .selectAll('text')
      .data(protData)
      .enter('g')
      .append('g')
      .attr('transform', (d, i) => `translate(${i * iconWidth},${0})`)
      .append('text')
      .text(d => d.key)
      .attr('dy', -10)
      .attr('fill', '#000')
      .attr('font-size', 15)
      .attr('font-weight', 'bold');

    const margin = iconSize / 3;
    const shapePosScale = d3.scaleOrdinal()
                                    .domain([0, 0.5, 1])
                                    .range([margin, iconWidth / 2, iconWidth - margin]);

    const protIcon = protLegend.selectAll('.prot-icon')
          .attr('width', iconWidth)
          .attr('height', legendHeight)
          .data(protData)
          .enter()
          .append('g')
          .attr('class', 'prot-icon')
          // .style('width', `${iconWidth}px`)
          .style('transform', (d, i) => `translate(${i * iconWidth}px,${0}px)`)
          .on('click', function (d) {
            d.selected = d.selected === 0 ? 0.5 : d.selected === 0.5 ? 1 : 0;

            d3.select(this).select('.inner-rect')
              .attr('fill', b => protColor(b.key))
              .attr('opacity', b => b.selected);

            d3.select(this).select('.sel-circle')
              .attr('transform', function() {
                return d3.select(this).attr('transform');
              })
              .transition()
              .duration(delay / 2)
              .attr('transform', b => `translate(${shapePosScale(b.selected)}, ${legendHeight / 2})`);

            d3.select(this).selectAll('.shape')
              .transition()
              .duration(delay / 2)
              .attr('opacity', e => (e === d.selected ? 0.7 : 0.3));

            const newData = self.callback(d, data);
            self.setState({ data: newData });
            self.update();
          });
          // .text(d => d.key);

    protIcon.append('rect')
          .attr('width', iconWidth)
          .attr('height', legendHeight)
          .attr('stroke', 'black')
          .attr('class', 'outer-rect')
          // .attr('rx', 4)
          // .attr('ry', 4)
          .attr('fill', 'none');

    protIcon.append('rect')
          .attr('width', iconWidth)
          .attr('height', legendHeight)
          .attr('class', 'inner-rect')
          // .attr('rx', 4)
          // .attr('ry', 4)
          .attr('fill', b => protColor(b.key))
          .attr('opacity', 0.5);


    protIcon.selectAll('.shape')
      .data([0, 0.5, 1])
      .enter()
      .append('path')
      .attr('class', 'shape')
      .attr('d', d => iconPathScale(d)())
      // .append('text')
      // .style('text-anchor', 'middle')
      .attr('fill', 'black')
      // .style('font-size', 20)
      .attr('opacity', d => (d === 0.5 ? 0.7 : 0.3))
      .attr('transform', d => `translate(${shapePosScale(d)}, ${legendHeight / 2})`);
      // .text(d => d.key);
      // .attr('fill', 'grey');

    protIcon.append('circle')
      .attr('class', 'sel-circle')
      .attr('r', iconSize / 4)
      .attr('transform', `translate(${iconWidth / 2}, ${legendHeight / 2})`)
      .attr('stroke', 'black')
      .attr('fill', 'none');
  }());

  (function createRadLegend() {
    // const x = d3.scale.linear()
    // .domain([0, 1]);
    const radLegend = cont.append('g')
      .attr('class', 'rad-legend')
      .attr('transform', `translate(${0},${brushHeight + brushMargin})`);

    radLegend.append('rect')
      .attr('width', (width / 2) - (centerWidth / 2))
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
      .text('Radiation (mSv)');

  // make quantized key legend items
    radLegend
      .append('g')
      .attr('transform', `translate(${0},${legendHeight})`)
      .attr('class', 'rad-axis');
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
    .attr('transform', `translate(${(width / 2) + (centerWidth / 2)},${0})`);

  gCenter.append('g')
    .attr('class', 'date-axis');

  (function createBrush() {
    let startDate;
    let endDate;
    if (data.length > 1) {
      const ext = d3.extent(data, d => d.date);
      startDate = ext[0];
      endDate = ext[1];
    } else {
      startDate = new Date();
      endDate = d3.timeMonth.offset(new Date(), 1);
    }
    console.log('startDate', startDate, 'endDate', endDate);

    const offset = 30;
    const yDate = d3.scaleTime()
    .domain([d3.timeMonth.floor(startDate), d3.timeMonth.offset(endDate, 1)])
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

    const brush = d3.brushX()
    .extent([[0, 0], [width, brushHeight]])
    .handleSize(brushHandleSize)
    .on('start brush', () => {
      // if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
      const s = d3.event.selection || brushScale.range();
      const d0 = s.map(brushScale.invert, brushScale);
      yDate
        .domain(d0);

      self.setState({ data, yDate, brush, brushScale });
      self.update();

      if (s == null) {
        handle.attr('display', 'none');
      } else {
        handle
        .attr('display', null)
        .attr('transform', (d, i) => `translate(${s[i]},${brushHeight / 2})`);
      }
      // }
    });

    d3.select('.brush')
    .call(brush)
    .call(brush.move, brushScale.range());
  }());
}

class Vis {
  constructor(initState) {
    // TODO: move out instance vars
    console.log('this', this);
    Object.keys(initState).forEach(k => (this[k] = initState[k]));
    console.log('this', this);
    this.keys = keys;
    this.maxRad = 0;
    // create.bind(this)();
  }


  reset() {
    create.bind(this)();
  }

  update() {
    _update.bind(this)();
  }

  setState(state) {
    Object.keys(state).forEach(k => (this[k] = state[k]));
  }

}


export default Vis;
