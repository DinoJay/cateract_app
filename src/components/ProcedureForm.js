import React from 'react';
import DatePicker from 'react-datepicker';

import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';

console.log('DatePicker', DatePicker);

const Title = () => (
  <div>
    <div>
      <h1>Add Procedures</h1> </div> </div>
  );

const ProcForm = ({ addTodo }) => {
  // Input Tracker
  let input;
  // Return JSX
  //
  // p
    <label htmlFor="procedure">Mobile</label>;
  return (
    <form className="">
      <div className="btn-group" role="group" aria-label="First group">
        <div className="btn-group">
          <button
            id="procedure" type="button" className="btn btn-secondary dropdown-toggle"
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
          >
              Procedure
          </button>
          <div className="dropdown-menu" aria-labelledby="btnGroupDrop1">
            <a className="dropdown-item" href="#">Dropdown link</a>
            <a className="dropdown-item" href="#">Dropdown link</a>
          </div>
        </div>

        <div className="btn-group-vertical" role="group">
          <button id="timerange" type="button" className="btn btn-secondary">
            <DatePicker
              selected={moment()}
              onChange={() => console.log('change')}
            />
          </button>
          <button type="button" className="btn btn-secondary">
            <DatePicker
              selected={moment()}
              onChange={() => console.log('change')}
            />
          </button>
        </div>
        <div className="btn-group" role="group">
          <button
            id="btnGroupDrop1" type="button" className="btn btn-secondary dropdown-toggle"
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
          >
              Equipment
          </button>
          <div className="dropdown-menu" aria-labelledby="btnGroupDrop1">
            <a className="dropdown-item" href="#">Dropdown link</a>
            <a className="dropdown-item" href="#">Dropdown link</a>
          </div>
        </div>

        <div className="btn-group" role="group">
          <button
            id="btnGroupDrop1" type="button" className="btn btn-secondary dropdown-toggle"
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
          >
              Eye
          </button>
          <div className="dropdown-menu" aria-labelledby="btnGroupDrop1">
            <a className="dropdown-item" href="#">Dropdown link</a>
            <a className="dropdown-item" href="#">Dropdown link</a>
          </div>
        </div>
        <div className="btn-group-vertical btn-group-sm">
          <button type="button" className="btn btn-success">glasses</button>
          <button type="button" className="btn btn-warning">Cabin</button>
          <button type="button" className="btn btn-primary">Shield</button>
        </div>

        <div className="btn-group" role="group">
          <button
            ref={(node) => {
              input = node;
            }}
            type="button" className="btn btn-secondary" onClick={() => {
              addTodo(input.value);
              input.value = '';
            }}
          >
            +
          </button>
        </div>
      </div>
    </form>
  );
};

const Todo = ({ todo, remove }) =>
   (<li className="list-group-item" onClick={() => { remove(todo.id); }}>
     <form className="">
       <div className="btn-group " role="group" aria-label="First group">
         <div className="btn-group btn-group-sm">
           <button
             id="procedure" type="button" className="btn btn-secondary dropdown-toggle"
             data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
           >
              Procedure
          </button>
           <div className="dropdown-menu" aria-labelledby="btnGroupDrop1">
             <a className="dropdown-item" href="#">Dropdown link</a>
             <a className="dropdown-item" href="#">Dropdown link</a>
           </div>
         </div>

         <div className="btn-group-vertical btn-group-sm" role="group">
           <button id="timerange" type="button" className="btn btn-secondary">
             <DatePicker
               selected={moment()}
               onChange={() => console.log('change')}
             />
           </button>
           <button type="button" className="btn btn-secondary">
             <DatePicker
               selected={moment()}
               onChange={() => console.log('change')}
             />
           </button>
         </div>
         <div className="btn-group btn-group-sm" role="group">
           <button
             id="btnGroupDrop1" type="button" className="btn btn-secondary dropdown-toggle"
             data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
           >
              Equipment
          </button>
           <div className="dropdown-menu" aria-labelledby="btnGroupDrop1">
             <a className="dropdown-item" href="#">Dropdown link</a>
             <a className="dropdown-item" href="#">Dropdown link</a>
           </div>
         </div>

         <div className="btn-group btn-group-sm" role="group">
           <button
             id="btnGroupDrop1" type="button" className="btn btn-secondary dropdown-toggle"
             data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
           >
              Eye
          </button>
           <div className="dropdown-menu" aria-labelledby="btnGroupDrop1">
             <a className="dropdown-item" href="#">Dropdown link</a>
             <a className="dropdown-item" href="#">Dropdown link</a>
           </div>
         </div>
         <div className="btn-group-vertical btn-group-sm">
           <button type="button" className="btn btn-success">glasses</button>
           <button type="button" className="btn btn-warning">Cabin</button>
           <button type="button" className="btn btn-primary">Shield</button>
         </div>
         <div className="btn-group" role="group">
           <button
             type="button" className="btn btn-danger" onClick={() => { }}
           >
             <span aria-hidden="true">×</span>
           </button>
         </div>
       </div>

     </form>
   </li>);

const ProcList = ({ todos, remove }) => {
  // Map through the todos
  const todoNode = todos.map(todo => (<Todo todo={todo} key={todo.id} remove={remove} />));
  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div className="row">
        <ul className="list-group">
          {todoNode}
        </ul>
      </div>
    </div>
  );
};


export default class TodoApp extends React.Component {
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


// Contaner Component
// Todo Id
window.id = 0;
