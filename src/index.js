import * as d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import $ from 'jquery';
// import { introJs } from 'intro.js';

import 'cordova';
// import 'intro.js/introjs.css';
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
    this.selectionHandler = this._selectionHandler.bind(this);
    this.dataChangeHandler = this._dataChangeHandler.bind(this);
    this.dataWipeHandler = this._dataWipeHandler.bind(this);
    // Set initial state
    const stringData = localStorage.getItem('dataHHH');
    console.log('stringData', stringData);
    let data = [];
    if (stringData !== null) {
      const rawData = JSON.parse(stringData);
      const newData = _.cloneDeep(rawData).map(preprocess).sort((a, b) => a.date - b.date);
      data = _.cloneDeep(newData);
    } else {
      localStorage.setItem('dataHHH', JSON.stringify([]));
    }
    this.state = {
      data,
      leftEye: true,
      rightEye: false,
      aggrSel: false,
      threshhold: 0.4
    };
  }

  componentDidMount() {
    if (this.state.data.length === 0) {
      $(() => {
        $('[data-toggle="tooltip"]').tooltip();
      });
      $('.tooltip-holder').tooltip('toggle');
      console.log('first-try');
    }
  }

    // localStorage.setItem('6', JSON.stringify(ArrayData));

    // NativeStorage.getItem('5', (rawData) => {
    //   console.log('data exists', rawData);
    // }, () => {
    // });

  _selectionHandler({ leftEye, rightEye, cumulated }) {
    console.log('cumulated', cumulated);
    this.setState({ leftEye, rightEye, cumulated });
  }

  _dataChangeHandler(newData) {
    const rawData = JSON.parse(localStorage.getItem('dataHHH'));
    localStorage.setItem('dataHHH', JSON.stringify(rawData.concat(newData)));
    this.setState({ data: this.state.data.concat(newData.map(preprocess))
      .sort((a, b) => a.date - b.date) });
  }

  _dataWipeHandler() {
    localStorage.setItem('dataHHH', JSON.stringify([]));
    this.setState({ data: [] });
  }
// TODO: change later!
  render() {
    return (
      <div style={{ maxWidth: '400px' }}>
        <Collapsible
          {...this.state}
          dataWipeHandler={this.dataWipeHandler}
          dataChangeHandler={this.dataChangeHandler}
          selectionHandler={this.selectionHandler}
        />
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
