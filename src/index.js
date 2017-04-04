import * as d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';

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


    d3.json('testData.json', (error, rawData) => {
      if (error) throw error;
      const data = rawData.map(preprocess).sort((a, b) => a.date - b.date);

      this.setState({ data });

    //   const VisObj = new Vis({
    //     el: this.Vis,
    //     dim,
    //     data: filtered,
    //     callback: protClickCallback,
    //     threshhold: 0.02
    //   });
    //
    //   function clickHandler() {
    //     const config = getUIConfig();
    //     const filteredData = filterData(data, config);
    //   // if (!config.leftEye && !config.rightEye) {
    //   //   d3.event.preventDefault();
    //   //   return;
    //   // }
    //     VisObj.setState({
    //       data: filteredData
    //     });
    //   }
    //
    //   d3.select('#left-eye-sel').on('click', clickHandler);
    //   d3.select('#right-eye-sel').on('click', clickHandler);
    //
    //   d3.select('#procedure-sel').on('click', clickHandler);
    //   d3.select('#aggr-sel').on('click', clickHandler);
    });
  }

  clickHandler({ leftEye, rightEye, aggrSel }) {
    this.setState({ leftEye, rightEye, aggrSel });
  }
//
  render() {
    return (
      <div>
        <Collapsible {...this.state} clickHandler={this.clickHandler.bind(this)} />
        <Visualization {...this.state} data={this.state.data} />
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
    // alert(window.innerWidth);
    // window.plugins.screensize.get(d => alert(d.width), err => console.log('err', err));
    // window.onload(() => {
    alert(NativeStorage);
    ReactDOM.render(<App />, document.getElementById('app'));
  },

    // Update DOM on a Received Event
  receivedEvent() {
  }
};

app.initialize();
