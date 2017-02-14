import * as d3 from 'd3';

function d3TimeSwitch(startDate, endDate) {
  switch (true) {
  case (d3.timeDay.count(startDate, endDate) <= 1):
    return {
      intervalKey: 'hours',
      tickInterval: d3.timeHour,
      nestInterval: d3.timeHour,
      timeFormat: d3.timeFormat('%H %M')
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
      // e.totalProtection = d3.sum(e.values, a => a#<{(| .t |)}>#otalProtection) / e.values.length;
      e.sumRadiation = d3.sum(e.values, a => a.radiation);
      return e;
    });
}

export { aggregate, d3TimeSwitch };
