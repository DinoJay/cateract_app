import React, { PropTypes } from 'react';
import * as d3 from 'd3';
import moment from 'moment';

// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';


import refData from '../refData.json';

const formatTime = d3.timeFormat('%d/%m/%Y %H:%M');

import DayPicker, { DateUtils } from 'react-day-picker';

import 'react-day-picker/lib/style.css';

// const refData = rawRefData.map((d) => {
//   d.shield = d.shield === 'Yes';
//   d.glasses = d.glasses === 'Yes';
//   d.cabin = d.cabin === 'Yes';
//   return d;
// });

function getEntry(d, e) {
  return (
    d.equipment === e.equipment &&
    d.procedure === e.procedure &&
    d.shield === e.shield &&
    d.glasses === e.glasses &&
    d.cabin === e.cabin
  );
}


const procedures = [
  'CA',
  'CA + PCI (PTCA)',
  'PM implantation',
  'PM resynchronisation',
  'RF catheter ablation',
  'PVI',
  'Valvuloplasty',
  'CTO'
];

function abbr(proc) {
  switch (proc) {
  case procedures[0]:
    return procedures[0];
  case procedures[1]:
    return 'PTCA';
  case procedures[2]:
    return 'PM impl.';
  case procedures[3]:
    return 'PM resynch.';
  case procedures[4]:
    return 'RF';
  case procedures[5]:
    return procedures[5];
  case procedures[6]:
    return 'Val';
  default: return procedures[7];
  }
}


const DateButton = ({ onClick, value }) => (
  <button
    className="btn btn-secondary"
    onClick={onClick}
  >
    {value}
  </button>
);

DateButton.propTypes = {
  onClick: PropTypes.func,
  value: PropTypes.string
};

  // propTypes: {
  //   onClick: React.PropTypes.func,
  //   value: React.PropTypes.string
  // },


class OperationForm extends React.Component {
  constructor(props) {
    // Pass props to parent class
    super(props);
    // Set initial state
    this.handleDayClick = this._handleDayClick.bind(this);
    this.state = {
      procedure: 'CA',
      equipment: 'Carm',
      glasses: false,
      shield: false,
      cabin: false,
      from: new Date(),
      to: new Date(),
      quantity: 1
    };
  }

  _handleDayClick(day) {
    const range = DateUtils.addDayToRange(day, this.state);
    this.setState({ from: range.from, to: range.to });
    console.log('range', range);
  }

  render() {
    const { from, to } = this.state;
    // console.log('from', from, 'to', to.getDate());
    return (
      <div className="container">
        <div className="form-group">
          <div className="row">
            <div className="col-12">
              <div className="row justify-content-center">
                <label htmlFor="lgFormGroupInput" className="col-form-label col-form-label-lg">
                  Procedure
                </label>
              </div>
              <div className="row justify-content-center">
                <div className="equip-proc" role="group">
                  <select
                    className="form-control" id="exampleSelect1"
                    value={this.state.procedure}
                    onChange={e => (this.setState({ procedure: e.target.value }))}
                  >
                    { procedures.map(proc => <option key={proc}>{ proc }</option>) }
                  </select>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="row justify-content-center">
                <label htmlFor="lgFormGroupInput" className="col-form-label col-form-label-lg">
                  Equipment
                </label>
              </div>
              <div className="row">
                <div className="equip-proc">
                  <select
                    className="form-control" id="exampleSelect1"
                    value={this.state.equipment}
                    onChange={e => (this.setState({ equipment: e.target.value }))}
                  >
                    <option>BiPlane</option>
                    <option>Carm</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="row justify-content-center">
                <label htmlFor="lgFormGroupInput" className="col-form-label col-form-label-lg">
                  Protection
                </label>
              </div>
              <div className="row">
                <div className="protection btn-group-sm">
                  <button
                    type="button"
                    className={`btn ${this.state.glasses ? 'my-btn-success' : 'my-btn-outline-success'}`}
                    onClick={() => (this.setState({ glasses: !this.state.glasses }))}
                  >
                    glasses
                  </button>
                  <button
                    type="button"
                    className={`btn ${this.state.cabin ? 'my-btn-warning' : 'my-btn-outline-warning'}`}
                    onClick={() => (this.setState({ cabin: !this.state.cabin }))}
                  >
                    Cabin
                  </button>
                  <button
                    type="button"
                    className={`btn ${this.state.shield ? 'my-btn-primary' : 'my-btn-outline-primary'}`}
                    onClick={() => (this.setState({ shield: !this.state.shield }))}
                  >
                    Shield
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="row justify-content-center">
                <label htmlFor="lgFormGroupInput" className="col-form-label col-form-label-lg">
                Start / End Date
              </label>
              </div>
              <div>
                <DayPicker
                  selectedDays={[from, { from, to }]}
                  onDayClick={this.handleDayClick}
                />
              </div>
            </div>

            <div className="col-12">
              <div className="row justify-content-center">
                <label htmlFor="lgFormGroupInput" className="col-form-label col-form-label-lg">
                  Number
                </label>
              </div>
              <div className="row justify-content-center">
                <input
                  type="number" className="form-control" min="1" placeholder="1"
                  onChange={e => this.setState({ quantity: parseInt(e.target.value, 10) })}
                />
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
      </div>
    );
  }
}

OperationForm.propTypes = {
  addOperation: PropTypes.func
};

const Operation = ({ data, remove }) => (
  <tr>
    <th scope="row">{data.quantity}</th>
    <td>{abbr(data.procedure)}</td>
    <td>{ data.equipment }</td>
    <td>
      <div className="">{d3.timeFormat('%Y-%m-%d')(data.from)}</div>
      <div className="">{d3.timeFormat('%Y-%m-%d')(data.to)}</div>
    </td>
    <td>
      <div className="btn-group btn-group-vertical">
        { data.glasses
          && <button type="button" className="btn btn-success btn-sm" > glasses </button>
        }
        {
          data.cabin
            && <button type="button" className="btn btn-warning btn-sm" > Cabin </button>
        }
        { data.shield &&
        <button type="button" className="btn btn-primary btn-sm" > Shield </button>
        }
        { !data.glasses && !data.shield && !data.cabin && <p><strong>No </strong></p> }
      </div>
    </td>
    <td>
      <button
        type="button" className="btn btn-sm btn-danger img-circle"
        onClick={() => { remove(data.id); }}
      >
      x
    </button>
    </td>
  </tr>
);

Operation.propTypes = {
  data: PropTypes.object,
  remove: PropTypes.func
};

const OperationList = ({ operations, remove }) => {
  // Map through the operations
  const opNodes = operations.map(op => (<Operation data={op} key={op.id} remove={remove} />));
  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div className="row">

        <ul className="list-group" />
        <table className="table table-sm table-bordered">
          <thead className="">
            <tr>
              <th>#</th>
              <th>Proc.</th>
              <th>Equip.</th>
              <th>Time</th>
              <th>Prot.</th>
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

OperationList.propTypes = {
  operations: PropTypes.array,
  remove: PropTypes.func
};

export default class ProcedureForm extends React.Component {
  constructor(props) {
    // Pass props to parent class
    super(props);
    this.addOperation = this.addOperation.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.generateData = this.generateData.bind(this);
    // Set initial state
    this.state = {
      data: []
    };
  }
  addOperation(op) {
    console.log('OP', op.shield, op.cabin, op.glasses, 'refData', refData);
    const refEntry = refData
      .find(d => getEntry(op, d));

    console.log('refEntry', refEntry);
    if (!refEntry) {
      alert('The selected configuration of procedure, equipment and protection is currently not in our database!');
      return;
    }
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
    const remainder = this.state.data.filter(proc => ((proc.id !== id) ? proc : null));
    // Update state with filter
    this.setState({ data: remainder });
  }

  generateData() {
    console.log('data number procedures', this.state.data);
    const data = this.state.data.reduce((acc, d) => {
      const entries = [];
      while (entries.length < d.quantity) {
        const minDate = d3.timeDay.offset(d.from, -1);
        const dayRange = d3.timeDay.range(minDate, d.to);
        entries.push(...dayRange.reduce((acc2, date) => {
          const newDate = new Date(date);
          const dateTimeStr = formatTime(newDate);
          if ((entries.length + acc2.length) < d.quantity) {
            const entry = {
              date: dateTimeStr,
              equipment: d.equipment,
              protSel: { shield: d.shield, glasses: d.glasses, cabin: d.cabin },
              procedure: d.procedure
            };
            return acc2.concat([entry]);
          }
          return acc2;
        }, []));
      }
      return acc.concat(entries);
    }, []);
    console.log('data', data);
    this.setState({ data: [] });
    this.props.dataChangeHandler(data);
  }

  render() {
    return (
      <div>
        <div className="modal-body">
          <OperationForm addOperation={this.addOperation} />
          <OperationList
            operations={this.state.data}
            remove={this.handleRemove}
          />
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className={`btn btn-primary ${this.state.data.length === 0 && 'disabled'}`}
            data-dismiss="modal"
            aria-label="Close"
            onClick={this.generateData}
          >
            Save changes
          </button>
        </div>
      </div>
    );
  }
}

ProcedureForm.propTypes = {
  dataChangeHandler: PropTypes.func
};
