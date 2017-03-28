import React from 'react';
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
