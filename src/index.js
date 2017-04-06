import * as d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

import 'cordova';
// import 'cordova_plugins';

import './global_styles/app.scss';
import Visualization from './components/Visualization';
import Collapsible from './components/Collapsible';


const timeFormatStr = '%d/%m/%Y %H:%M';
const parseDate = d3.timeParse(timeFormatStr);

function preprocess(d) {
  d.initProtSel = Object.assign({}, d.protSel);
  d.date = parseDate(d.date);
  if (d.date === null) console.log('date null', d);
  return d;
}


class App extends React.Component {
  constructor(props) {
    // Pass props to parent class
    super(props);
    this.clickHandler = this.clickHandler.bind(this);
    this.dataChangeHandler = this.dataChangeHandler.bind(this);
    // Set initial state
    this.state = {
      data: [],
      leftEye: true,
      rightEye: false,
      aggrSel: false
    };
  }

  componentDidMount() {
    console.log('didMount APP', this);

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
    const height = window.innerHeight - outerMargin.top - outerMargin.bottom - innerMargin.top;
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

    const stringData = localStorage.getItem('9');
    if (stringData !== null) {
      const rawData = JSON.parse(stringData);
      console.log('rawData', rawData);
      const newData = _.cloneDeep(rawData).map(preprocess).sort((a, b) => a.date - b.date);
      this.setState({ data: _.cloneDeep(newData) });
    } else {
      d3.json('testData.json', (error, rawData) => {
        const data = _.cloneDeep(rawData).map(preprocess).sort((a, b) => a.date - b.date);
        localStorage.setItem('9', JSON.stringify(rawData));
        this.setState({ data: _.cloneDeep(data) });
      });
    }
    // localStorage.setItem('6', JSON.stringify(ArrayData));

    // NativeStorage.getItem('5', (rawData) => {
    //   console.log('data exists', rawData);
    // }, () => {
    //   d3.json('testData.json', (error, rawData) => {
    //     console.log('init', rawData);
    //     if (error) throw error;
    //     NativeStorage.setItem('5', rawData, () => {
    //       const data = rawData.map(preprocess).sort((a, b) => a.date - b.date);
    //       this.setState({ data: _.cloneDeep(data) });
    //     }, err => console.log('err'));
    //   });
    // });
  }

  clickHandler({ leftEye, rightEye, aggrSel }) {
    this.setState({ leftEye, rightEye, aggrSel });
  }

  dataChangeHandler(newData) {
    const rawData = JSON.parse(localStorage.getItem('9'));
    localStorage.setItem('9', JSON.stringify(rawData.concat(newData)));
    this.setState({ data: this.state.data.concat(newData.map(preprocess)).sort((a, b) => a.date - b.date) });
  }
//
  render() {
    return (
      <div>
        <Collapsible {...this.state} dataChangeHandler={this.dataChangeHandler} clickHandler={this.clickHandler} />
        <Visualization {...this.state} />
      </div>
    );
  }

}

// window.onload = visualization;

const app = {
    // visualization Constructor
  initialize() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
  onDeviceReady() {
    ReactDOM.render(<App />, document.getElementById('app'));
  },

    // Update DOM on a Received Event
  receivedEvent() {
  }
};

app.initialize();
