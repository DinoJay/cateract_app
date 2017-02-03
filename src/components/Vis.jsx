// import * as d3 from 'd3';
import * as d3 from 'd3';
// import style from './styles/Comp.scss';

import '../global_styles/app.scss';

import { create, update } from './vis';

const timeFormatStr = '%d/%m/%Y';
const parseDate = d3.timeParse(timeFormatStr);

function preselect(eye) {
  return (d) => {
    d.protection = d[eye].protection;
    d.totalProtection = d.protection.shield
    + d.protection.glasses + d.protection.cabin;
    d.radiation = d[eye].radiation;
  };
}

function preprocess(d) {
  d.date = parseDate(d.date);
  preselect('leftEye')(d);
  return d;
}

window.onload = function() {
  const brushHandleSize = 40;
  const brushHeight = 50;
  const brushMargin = 65;
  const legendHeight = 35;
  const legendMargin = 10;
  const outerMargin = { top: 20, right: 0, bottom: 0, left: 0 };
  const innerMargin = {
    top: brushHeight + brushMargin + legendHeight + legendMargin,
    right: 0,
    bottom: 0,
    left: 0
  };
  const offsetX = 30;
  const offsetY = 50;
  const width = window.innerWidth - outerMargin.left - outerMargin.right - offsetX;
  const height = window.innerHeight - outerMargin.top - outerMargin.bottom - offsetY;
  const subHeight = height - innerMargin.top - innerMargin.bottom;
  const centerWidth = 50;

  const dim = {
    width,
    height,
    subHeight,
    centerWidth,
    innerMargin,
    brushHandleSize,
    brushHeight,
    brushMargin,
    legendHeight,
    legendMargin,
    outerMargin
  };


  d3.json('testData.json', (error, rawData) => {
    const data = rawData.map(preprocess).sort((a, b) => a.date - b.date);
    if (error) throw error;
    const { yDate, brush, brushScale } = create(d3.select('#app'), dim, data);

    d3.select('#left-eye-sel').on('click', () => {
      data.forEach(preselect('leftEye'));
      const checked = d3.select('#right-eye-sel').property('checked');
      update(data, dim, yDate, brush, brushScale);
    });
    d3.select('#right-eye-sel').on('click', () => {
      const checked = d3.select('#left-eye-sel').property('checked');
      console.log('checked', checked);
      data.forEach(preselect('rightEye'));

      update(data, dim, yDate, brush, brushScale);
    });
  });
};
  // }

// export default Comp;
//
