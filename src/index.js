// import * as d3 from 'd3';
import * as d3 from 'd3';
// import style from './styles/Comp.scss';

import './global_styles/app.scss';

import rawRefData from './refData.json';
import Vis from './components/vis';

const timeFormatStr = '%d/%m/%Y %H:%M';
const parseDate = d3.timeParse(timeFormatStr);

const refData = rawRefData.map((d) => {
  d.shield = d.shield === 'Yes';
  d.glasses = d.glasses === 'Yes';
  d.cabin = d.cabin === 'Yes';
  return d;
});

function getEntry(d, e, eye) {
  return (
    d.eye === eye && d.equipment === e.equipment &&
    d.procedure === e.procedure && d.shield === e.protSel.shield &&
    d.glasses === e.protSel.glasses && d.cabin === e.protSel.cabin
  );
}

// const keys = ['shield', 'glasses', 'cabin'];
function preprocess(d) {
  d.initProtSel = Object.assign({}, d.protSel);
  d.date = parseDate(d.date);
  if (d.date === null) console.log('date null', d);
  return d;
}

function lookUpProtection(e) {
  const refEntry = refData
    .find(d => getEntry(d, e, 'left'));

  return refEntry ? {
    shield: refEntry.shieldLevel,
    glasses: refEntry.glassesLevel,
    cabin: refEntry.cabinLevel
  } : {
    shield: 0,
    glasses: 0,
    cabin: 0
  }
}

function lookupRadiation(e, config) {
  const refEntry = refData.find(d => getEntry(d, e, 'left'));
  return refEntry ? refEntry.radiation: 0;
}

function filterData(data, config) {
  if (!config.aggrSel) {
    return data.map((e) => {
      e.radiation = lookupRadiation(e, config);
      e.protection = lookUpProtection(e, config);
      return e;
    });
  }
  const redData = data.reduce(({ acc, sum }, e) => {
    const newSum = sum + lookupRadiation(e, config);
    e.radiation = newSum;
    e.protection = lookUpProtection(e, config);
    return { sum: newSum, acc: acc.concat([e]) };
  }, { acc: [], sum: 0 });
  console.log('redData', redData);
  return redData.acc;
  // if (config.aggrSel) {
  //   return ;
  // }
  // return (e) => {
  //   e.radiation = lookupRadiation(e, config);
  //   e.protection = lookUpProtection(e, config);
  //   return e;
  // };
}

function getUIConfig() {
  const leftChecked = d3.select('#left-eye-sel').property('checked');
  const rightChecked = d3.select('#right-eye-sel').property('checked');

  const aggrSel = d3.select('#aggr-sel').property('checked');

  let eye;
  if (leftChecked && rightChecked) {
    eye = 'both';
  }
  if (leftChecked) {
    eye = 'left';
  }
  if (rightChecked) {
    eye = 'both';
  }

  return {
    eye,
    aggrSel
  };
}

function protClickCallback(prot, data) {
  const changedData = data.map((e) => {
    switch (prot.selected) {
    case 0:
      e.protSel[prot.key] = e.initProtSel[prot.key];
      break;
    case 1:
      e.protSel[prot.key] = true;
      break;
    default: e.protSel[prot.key] = false;
    }
    return e;
  });

  console.log('changedData', changedData);
  const newData = filterData(changedData, getUIConfig());

  d3.selectAll('.prot-icon').attr('opacity', d => (d.selected ? 1 : 0.4));

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

    const filtered = filterData(data, getUIConfig());
    console.log('filtered Data', filtered);
    const maxRad = d3.max(filtered, d => d.radiation);
    console.log('maxRad', maxRad);

    const VisObj = new Vis({
      el: d3.select('#app'),
      dim,
      data: filtered,
      callback: protClickCallback,
      threshhold: maxRad
    });

    function clickHandler() {
      const config = getUIConfig();
      console.log('clickHandler', filterData(data, config));
      const filteredData = filterData(data, config);
      // if (!config.leftEye && !config.rightEye) {
      //   d3.event.preventDefault();
      //   return;
      // }
      VisObj.setState({
        data: filteredData,
        threshhold: d3.max(filteredData, d => d.radiation)
      });
    }

    d3.select('#left-eye-sel').on('click', clickHandler);
    d3.select('#right-eye-sel').on('click', clickHandler);

    d3.select('#procedure-sel').on('click', clickHandler);
    d3.select('#aggr-sel').on('click', clickHandler);
  });
};
