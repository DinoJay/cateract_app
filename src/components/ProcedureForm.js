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


class OperationForm extends React.Component {
  constructor(props) {
    // Pass props to parent class
    super(props);
    // Set initial state
    this.state = {
      procedure: 'CA',
      equipment: 'Carm',
      glasses: false,
      shield: false,
      cabin: false,
      startDate: moment(),
      endDate: moment()
    };
  }

  render() {
    return (
      <form className="container">
        <div className="form-group">
          <div className="row">
            <div className="col-sm-3">
              <div className="row justify-content-center">
                <label htmlFor="lgFormGroupInput" className="col-form-label col-form-label-lg">Procedure</label>
              </div>

              <div className="row justify-content-center">
                <div className="equip-proc" role="group">
                  <select className="form-control" id="exampleSelect1" ref={d => (this.procedure = d)}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="col-sm-3">
              <div className="row justify-content-center">
                <label htmlFor="lgFormGroupInput" className="col-form-label col-form-label-lg">Equipment</label>
              </div>
              <div className="row">
                <div className="equip-proc">
                  <select className="form-control" id="exampleSelect1" ref={d => (this.equipment = d)}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="row justify-content-center">
                <label htmlFor="lgFormGroupInput" className="col-form-label col-form-label-lg">Protection</label>
              </div>
              <div className="row">
                <div className="protection btn-group-sm">
                  <button
                    type="button" className="btn btn-success" style={{ opacity: this.state.glasses ? 1 : 0.5 }}
                    onClick={() => (this.setState({ glasses: !this.state.glasses }))}
                  >
                    glasses
                  </button>
                  <button
                    type="button" className="btn btn-warning" style={{ opacity: this.state.cabin ? 1 : 0.5 }}
                    onClick={() => (this.setState({ cabin: !this.state.cabin }))}
                  >
                    Cabin
                  </button>
                  <button
                    type="button" className="btn btn-primary" style={{ opacity: this.state.shield ? 1 : 0.5 }}
                    onClick={() => (this.setState({ shield: !this.state.shield }))}
                  >
                    Shield
                  </button>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="row justify-content-center">
                <label htmlFor="lgFormGroupInput" className="col-form-label col-form-label-lg">Protection</label>
              </div>
              <div className="row">
                <div className="datepicker btn-group-vertical btn-group-sm">
                  <button id="timerange" type="button" className="btn btn-secondary">
                    <DatePicker
                      ref={d => (this.startDate = d)}
                      selected={this.state.startDate}
                      onChange={d => this.setState({ startDate: d })}
                    />
                  </button>
                  <button type="button" className="btn btn-secondary">
                    <DatePicker
                      ref={d => (this.endDate = d)}
                      selected={this.state.endDate}
                      onChange={d => this.setState({ endDate: d })}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="form-group">
          <button
            type="button" className="btn btn-primary btn-lg btn-block"
            onClick={() => {
              this.props.addOperation(Object.assign({}, this.state));
            }}
          >
        Add!
      </button>

        </div>
      </form>
    );
  }
}
const Operation = ({ data, remove }) => (
  <tr onClick={() => { remove(todo.id); }}>
    <th scope="row">{data.id}</th>
    <td>{ data.procedure }</td>
    <td>{ data.equipment }</td>
    <td>
      <div className="">{data.startDate.format('DD-MM-YYYY')}</div>
      <div className="">{data.startDate.format('DD-MM-YYYY')}</div>
    </td>
    <td> { data.glasses } </td>
    <td> <button type="button" className="btn btn-sm btn-danger img-circle">x</button> </td>
  </tr>
);

const OperationList = ({ operations, remove }) => {
  // Map through the operations
  console.log('Operations', operations);
  const opNodes = operations.map(op => (<Operation data={op} key={op.id} remove={remove} />));
  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div className="row">

        <ul className="list-group" />
        <table className="table">
          <thead className="">
            <tr>
              <th>#</th>
              <th>Procedure</th>
              <th>Equipment</th>
              <th>TimeRange</th>
            </tr>
          </thead>
          <tbody>
            {opNodes}
          </tbody>
        </table>

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
  addOperation(op) {
    // Assemble data
    op.id = this.state.data.length + 1;
    // Update data
    this.state.data.push(op);
    // Update state
    this.setState({ data: this.state.data });
  }
  // Handle remove
  handleRemove(id) {
    // Filter all operations except the one to be removed
    const remainder = this.state.data.filter((todo) => {
      if (todo.id !== id) return todo;
    });
    // Update state with filter
    this.setState({ data: remainder });
  }

  render() {
    console.log('render', this.state);
    return (
      <div>
        <OperationForm addOperation={this.addOperation.bind(this)} />
        <OperationList
          operations={this.state.data}
          remove={this.handleRemove.bind(this)}
        />
      </div>
    );
  }
}


// Contaner Component
// Todo Id
window.id = 0;
