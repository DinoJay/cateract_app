import * as d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';

import 'cordova';

import './global_styles/app.scss';
import Visualization from './components/Visualization';


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
      data: []
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

  render() {
    return (
      <div >
        <TodoApp />
        <Visualization data={this.state.data} />
      </div>
    );
  }
}


const Title = () => (
  <div>
    <div>
      <h1>Add Procedures</h1>
    </div>
  </div>
  );

const ProcForm = ({ addTodo }) => {
  // Input Tracker
  let input;
  // Return JSX
  return (
    <div>
      <input
        ref={(node) => {
          input = node;
        }}
      />
      <button
        onClick={() => {
          addTodo(input.value);
          input.value = '';
        }}
      >
        +
      </button>
    </div>
  );
};

const Todo = ({ todo, remove }) =>
  // Each Todo
   (<li onClick={() => { remove(todo.id); }}>{todo.text}</li>);

const ProcList = ({ todos, remove }) => {
  // Map through the todos
  const todoNode = todos.map(todo => (<Todo todo={todo} key={todo.id} remove={remove} />));
  return (<ul>{todoNode}</ul>);
};

// Contaner Component
// Todo Id
window.id = 0;
class TodoApp extends React.Component {
  constructor(props) {
    // Pass props to parent class
    super(props);
    // Set initial state
    this.state = {
      data: []
    };
  }
  // Add todo handler
  addTodo(val) {
    // Assemble data
    const todo = { text: val, id: window.id++ };
    // Update data
    this.state.data.push(todo);
    // Update state
    this.setState({ data: this.state.data });
  }
  // Handle remove
  handleRemove(id) {
    // Filter all todos except the one to be removed
    const remainder = this.state.data.filter((todo) => {
      if (todo.id !== id) return todo;
    });
    // Update state with filter
    this.setState({ data: remainder });
  }

  render() {
    // Render JSX
    return (
      <div>
        <ProcForm addTodo={this.addTodo.bind(this)} />
        <ProcList
          todos={this.state.data}
          remove={this.handleRemove.bind(this)}
        />
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
