// import * as d3 from 'd3';
import * as d3 from 'd3';
// import style from './styles/Comp.scss';

import '../global_styles/app.scss';

import Vis from './vis';

const timeFormatStr = '%d/%m/%Y';
const parseDate = d3.timeParse(timeFormatStr);

const keys = ['shield', 'glasses', 'cabin'];
function preprocess(d) {
  d.initProtSel = Object.assign({}, d.protSel);
  d.date = parseDate(d.date);
  return d;
}

function generateProtValue(e) {
  return {
    shield: e.protSel.shield ? Math.random() / keys.length : 0,
    glasses: e.protSel.glasses ? Math.random() / keys.length : 0,
    cabin: e.protSel.cabin ? Math.random() / keys.length : 0
  };
}

function generateRadValue(e) {
  return Math.random() * 0.5;
}

function selectData(data, leftEyeChecked, rightEyeChecked) {
  return data.map((e) => {
    e.radiation = generateRadValue(e, leftEyeChecked, rightEyeChecked);
    e.protection = generateProtValue(e, leftEyeChecked, rightEyeChecked);
    return e;
  });
}

function callback(prot, data) {
  console.log('callback', prot, data);
  let newData;
  if (prot.selected) {
    newData = data.map((e) => {
      e.protSel[prot.key] = false;
      return e;
    });
    prot.selected = false;
  } else {
    newData = data.map((e) => {
      e.protSel[prot.key] = true;
      return e;
    });
    prot.selected = true;
  }
  return newData;
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
    if (error) throw error;
    const data = rawData.map(preprocess).sort((a, b) => a.date - b.date);
    console.log('selectData', selectData(data));
    const selectedData = selectData(data);

    const VisObj = new Vis(d3.select('#app'), dim, selectedData, callback);

    d3.select('#left-eye-sel').on('click', function() {
      const rightEyeChecked = d3.select('#right-eye-sel').property('checked');
      const leftEyeChecked = d3.select(this).property('checked');
      if (!leftEyeChecked && !rightEyeChecked) {
        d3.event.preventDefault();
        return;
      }
      const newData = selectData(data, leftEyeChecked, rightEyeChecked);
      VisObj.setState({ data: newData });
    });
    d3.select('#right-eye-sel').on('click', function() {
      console.log('click right eye');
      const leftEyeChecked = d3.select('#left-eye-sel').property('checked');
      const rightEyeChecked = d3.select(this).property('checked');

      if (!leftEyeChecked && !rightEyeChecked) {
        d3.event.preventDefault();
        return;
      }

      const newData = selectData(data, leftEyeChecked, rightEyeChecked);

      VisObj.setState({ newData });
    });
  });
};
  // }

// export default Comp;
//
