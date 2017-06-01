import * as d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';
import 'font-awesome/css/font-awesome.css';
// import _ from 'lodash';
// import $ from 'jquery';
// import { introJs } from 'intro.js';

// delete for web build
// import 'cordova';
// import 'intro.js/introjs.css';
// import 'cordova_plugins';

import './global_styles/app.scss';
import Visualization from './components/Visualization';
import Collapsible from './components/Collapsible';
import Home from './components/Home';


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
    this.operationRemoveHandler = this._operationRemoveHandler.bind(this);
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
      eye: true,
      aggrSel: false,
      threshhold: 0.4,
      timeBounds: [new Date(-8640000000000000), new Date()],
      home: data.length === 0
    };
  }

  componentDidMount() {
    if (this.state.data.length === 0) {
      $(() => {
        $('[data-toggle="tooltip"]').tooltip();
      });
      $('.tooltip-holder').tooltip('toggle');
    }
  }


  _selectionHandler({ eye, cumulated }) {
    console.log('cumulated', cumulated);
    this.setState({ eye, cumulated });
  }

  _dataChangeHandler(newData) {
    const rawData = JSON.parse(localStorage.getItem('dataHHH'));
    const newRawData = rawData.concat(newData);
    newRawData.forEach((d, i) => (d.id = i));
    localStorage.setItem('dataHHH', JSON.stringify(newRawData));

    const realData = this.state.data.concat(newData.map(preprocess))
      .sort((a, b) => a.date - b.date);

    this.setState({ data: realData, home: realData.length === 0 });
  }

  _dataWipeHandler() {
    localStorage.setItem('dataHHH', JSON.stringify([]));
    this.setState({ data: [], home: true });
  }

  _operationRemoveHandler(ids) {
    console.log('operation remove', ids);
    if (ids.length === 0) return;
    const rawData = JSON.parse(localStorage.getItem('dataHHH'));
    const newData = rawData.filter(d => !ids.includes(d.id));
    localStorage.setItem('dataHHH', JSON.stringify(newData));

    const realData = newData.map(preprocess)
      .sort((a, b) => a.date - b.date);

    this.setState({ data: realData });
  }
// TODO: change later!
  render() {
    console.log('render', this.state.timeBounds);

    const newData = this.state.data.filter((d) => {
      const newDate = d.date.setHours(12);
      return newDate >= this.state.timeBounds[0] && newDate <= this.state.timeBounds[1];
    });


    return (
      <div>
        <Collapsible
          data={newData}
          eye={this.state.eye}
          dataWipeHandler={this.dataWipeHandler}
          dataChangeHandler={this.dataChangeHandler}
          selectionHandler={this.selectionHandler}
          operationRemoveHandler={this.operationRemoveHandler}
          homeHandler={() => this.setState({ home: !this.state.home })}
          active={this.state.home}
        />

        {
          this.state.home ? <Home /> : <Visualization
            timeChange={d => this.setState({ timeBounds: d })} {...this.state}
          />
        }
      </div>
    );
  }

}

window.onload = ReactDOM.render(<App />, document.getElementById('app'));

// const app = {
//     // visualization Constructor
//   initialize() {
//     document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
//   },
//
//     // deviceready Event Handler
//     //
//     // Bind any cordova events here. Common events are:
//     // 'pause', 'resume', etc.
//   onDeviceReady() {
//     ReactDOM.render(<App />, document.getElementById('app'));
//   },
//
//     // Update DOM on a Received Event
//   receivedEvent() {
//   }
// };
//
// app.initialize();
