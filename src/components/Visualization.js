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

function getEntry(d, e, conf) {
  const eye = conf.leftEye ? 'left' : 'right';
  return (
    d.eye === eye && d.equipment === e.equipment &&
    d.procedure === e.procedure && d.shield === e.protSel.shield &&
    d.glasses === e.protSel.glasses && d.cabin === e.protSel.cabin
  );
}

// const keys = ['shield', 'glasses', 'cabin'];

function lookUpProtection(e, conf) {
  const refEntry = refData
    .find(d => getEntry(d, e, conf));

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

function lookupRadiation(e, conf) {
  // TODO
  const refEntry = refData.find(d => getEntry(d, e, conf));
  return refEntry ? refEntry.radiation : 0;
}

function filterData(data, config) {
  if (!config.aggrSel) {
    console.log('eyes');
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

function protClickCallback(prot, data) {
  console.log('prot selected', prot.selected);
  const changedData = data.map((e) => {
    e.protSel[prot.key] = d3.scaleOrdinal()
       .domain([0, 0.5, 1])
       .range([false, e.initProtSel[prot.key], true])(prot.selected);
    return e;
  });

  const newData = filterData(changedData, this.props);
  return newData;
}

let VisObj;
class Visualization extends React.Component {
  constructor(props) {
    // Pass props to parent class
    super(props);
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

  componentDidMount() {
    // Set initial state
    const brushHandleSize = 40;
    const brushHeight = 50;
    const brushMargin = 65;
    const legendHeight = 35;
    const legendMargin = 10;
    const outerMargin = { top: 0, right: 0, bottom: 0, left: 5 };
    const innerMargin = {
      top: brushHeight + brushMargin + legendHeight + legendMargin,
      right: 10,
      bottom: 0,
      left: 10
    };
    const width = window.innerWidth - outerMargin.left - outerMargin.right;
    const height = window.innerHeight - outerMargin.top - outerMargin.bottom;
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


    VisObj = new Vis({
      el: this.Vis,
      dim,
      data: filterData(this.props.data, this.props),
      callback: protClickCallback.bind(this),
      threshhold: 0.02
    });

    // VisObj.setState({
    //   data: filterData(this.props.data, this.props)
    // });

    // const onClick = () => {
    //   // const config = getUIConfig();
    //   const filteredData = filterData(this.props.data, this.props);
    //
    //   VisObj.setState({
    //     data: filteredData
    //   });
    // };
    //
    // d3.select('#left-eye-sel').on('click', onClick);
    // d3.select('#right-eye-sel').on('click', onClick);
    //
    // d3.select('#procedure-sel').on('click', onClick);
    // d3.select('#aggr-sel').on('click', onClick);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.data.length !== prevProps.data.length) {
      console.log('reset', 'oldData', prevProps.data, 'newData', this.props.data);
      VisObj.setState({ data: filterData(this.props.data, this.props) });
      VisObj.reset();
    } else {
      const fd = filterData(this.props.data, this.props);
      console.log('fd', fd);
      if (fd.length > 0) {
        VisObj.setState({ data: fd });
        VisObj.update();
      }
    }
  }

  // clickHandler() {
  //
  //
  // }
  // shouldComponentUpdate(nextProps) {
  //   return nextProps.data.length !== this.props.data.length;
  // }

  render() {
    return (
      <div ref={c => (this.Vis = c)} >
        <div className="jumbotron">
          <h2 className="display-3">Hello, User!</h2>
          <p className="lead">It seems that you open the app for the first time. Let me help you a bit!</p>
          <hr className="my-4" />
          <p>Click the <mark>context menu</mark> above to add your first bunch of procedures you want to analyze according to your radiation dose!</p>
        </div>
      </div>
    );
  }
}

export default Visualization;