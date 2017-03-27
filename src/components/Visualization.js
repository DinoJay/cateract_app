import * as d3 from 'd3';
import React from 'react';

import Vis from './vis';

const timeFormatStr = '%d/%m/%Y %H:%M';
const parseDate = d3.timeParse(timeFormatStr);

import rawRefData from '../refData.json';

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
  };
}

function lookupRadiation(e, config) {
  // TODO
  const refEntry = refData.find(d => getEntry(d, e, 'left'));
  return refEntry ? refEntry.radiation : 0;
}

function filterData(data, config) {
  if (!config.aggrSel) {
    const ret = data.map((e) => {
      e.radiation = lookupRadiation(e, config);
      e.protection = lookUpProtection(e, config);
      return e;
    });
    return ret;
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
  console.log('prot selected', prot.selected);
  const changedData = data.map((e) => {
    e.protSel[prot.key] = d3.scaleOrdinal()
       .domain([0, 0.5, 1])
       .range([false, e.initProtSel[prot.key], true])(prot.selected);
    return e;
  });

  console.log('changedData', changedData);
  const newData = filterData(changedData, getUIConfig());
  return newData;
}

class Visualization extends React.Component {
  constructor(props) {
    // Pass props to parent class
    super(props);


    this.state = {
      Vis: null
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log('newProps', nextProps);
  }

  // componentDidUpdate() {
  //   console.log('didUpdate', this.props);
  //   this.state.Vis.setState({
  //     data: this.props.data
  //   });
  // }

  componentDidUpdate() {
    // Set initial state
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

    console.log('mount', this.props);

    const VisObj = new Vis({
      el: this.Vis,
      dim,
      data: filterData(this.props.data, getUIConfig()),
      callback: protClickCallback,
      threshhold: 0.02
    });
    // this.setState({ Vis: });

    const onClick = () => {
      const config = getUIConfig();
      const filteredData = filterData(this.props.data, config);

      VisObj.setState({
        data: filteredData
      });
    };

    d3.select('#left-eye-sel').on('click', onClick);
    d3.select('#right-eye-sel').on('click', onClick);

    d3.select('#procedure-sel').on('click', onClick);
    d3.select('#aggr-sel').on('click', onClick);
  }


  render() {
    return (
      <div ref={c => (this.Vis = c)} />
    );
  }
}

export default Visualization;
