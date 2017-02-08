// import * as d3 from 'd3';
import * as d3 from 'd3';
// import style from './styles/Comp.scss';

import '../global_styles/app.scss';

import rawRefData from './refData.json';
import Vis from './vis';

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
  // TODO: EYE select
  const refEntry = refData
    .find(d => getEntry(d, e, 'left'));

  return {
    shield: refEntry.shieldLevel,
    glasses: refEntry.glassesLevel,
    cabin: refEntry.cabinLevel
  };
}

function lookupRadiation(e, config) {
  const refEntry = refData.find(d => getEntry(d, e, 'left'));

  if (!refEntry) console.log('not found', e);
  return refEntry.radiation;
}

function selectData(config) {
  return (e) => {
    e.radiation = lookupRadiation(e, config);
    e.protection = lookUpProtection(e, config);
    return e;
  };
}

function getUIConfig() {
  const leftChecked = d3.select('#left-eye-sel').property('checked');
  // var rightChecked = d3.select('#right-eye-sel').property('checked');

  return {
    eye: leftChecked ? 'left' : 'right',
    sum: false
  };
}

function protClickHandler(prot, data) {
  const newData = data.map((e) => {
    if (prot.selected) e.protSel[prot.key] = false;
    else e.protSel[prot.key] = e.initProtSel[prot.key];
    return e;
  }).map(selectData(getUIConfig()));

  prot.selected = !prot.selected;
  d3.selectAll('.prot-icon').attr('opacity', d => d.selected ? 1 : 0.4);

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

    const selectedData = data.map(selectData(getUIConfig()));
    console.log('selectedData', selectedData);

    const VisObj = new Vis(d3.select('#app'), dim, selectedData, protClickHandler);

    function clickHandler() {
      const config = getUIConfig();
      if (!config.leftEye && !config.rightEye) {
        d3.event.preventDefault();
        return;
      }
      const newData = data.map(selectData(config));
      VisObj.setState({ data: newData });
    }

    d3.select('#left-eye-sel').on('click', clickHandler);
    d3.select('#right-eye-sel').on('click', clickHandler);
  });
};
