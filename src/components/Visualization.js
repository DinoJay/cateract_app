import * as d3 from 'd3';
import React, { PropTypes } from 'react';

import Vis from './vis';

import rawRefData from '../refData.json';

const timeFormatStr = '%d/%m/%Y %H:%M';
const parseDate = d3.timeParse(timeFormatStr);


const refData = rawRefData.map((d) => {
  d.shield = d.shield === 'Yes';
  d.glasses = d.glasses === 'Yes';
  d.cabin = d.cabin === 'Yes';
  return d;
});

function getEntry(d, e, conf) {
  if (conf.eye) {
    return (
    d.eye === 'left' && d.equipment === e.equipment &&
    d.procedure === e.procedure && d.shield === e.protSel.shield &&
    d.glasses === e.protSel.glasses && d.cabin === e.protSel.cabin
    );
  }
  if (!conf.eye) {
    return (
    d.eye === 'right' && d.equipment === e.equipment &&
    d.procedure === e.procedure && d.shield === e.protSel.shield &&
    d.glasses === e.protSel.glasses && d.cabin === e.protSel.cabin
    );
  }
  return false;
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
  const refEntries = refData.filter(d => getEntry(d, e, conf));
  if (refEntries.length === 0) return 0;
  if (refEntries.length === 1) return refEntries[0].radiation;
  return (refEntries[0].radiation + refEntries[1].radiation) / 2;
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
    const legendMargin = 30;
    const outerMargin = { top: 0, right: 0, bottom: 0, left: 5 };
    const innerMargin = {
      top: brushHeight + brushMargin + legendHeight + legendMargin,
      right: 10,
      bottom: 0,
      left: 10
    };
      // TODO: change laterwindow.innerHeight
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
      threshhold: this.props.threshhold,
      timeChange: this.props.timeChange
    });

    if (this.props.data.length > 0) {
      VisObj.setState({ data: filterData(this.props.data, this.props) });
      VisObj.reset(this.props.cumulated);
    }

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
      VisObj.setState({ data: filterData(this.props.data, this.props) });
      VisObj.reset(this.props.cumulated);
    } else {
      const fd = filterData(this.props.data, this.props);
      if (fd.length > 0) {
        VisObj.setState({ data: fd });
        VisObj.update(false, this.props.cumulated);
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
        <div className="container  h-100">
          <h3 className="row justify-content-center align-self-center">
      No Procedure Added!
    </h3>
        </div>
      </div>
    );
  }
}
Visualization.propTypes = {
  threshhold: PropTypes.number,
  cumulated: PropTypes.boolean
};

Visualization.defaultProps = {
  threshhold: 0.3,
  cumulated: false
};


export default Visualization;
