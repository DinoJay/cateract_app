import React, { PropTypes } from 'react';
import { timeFormat } from 'd3';

const formatTime = timeFormat('%d/%m/%Y');

import Griddle, { ColumnDefinition, RowDefinition } from 'griddle-react';
import ProcedureForm from './ProcedureForm';

import { connect } from 'react-redux';

const CustomRowComponent = connect((state, props) => ({ rowData: plugins.LocalPlugin.selectors.rowDataSelector(state, props) }))(({ rowData }) => (
  <div
    style={{
      backgroundColor: '#EDEDED',
      border: '1px solid #777',
      padding: 5,
      margin: 10
    }}
  >
    <h1>{rowData.name}</h1>
    <ul>
      <li><strong>State</strong>: {rowData.state}</li>
      <li><strong>Company</strong>: {rowData.company}</li>
    </ul>
  </div>
  ));

const dbg = (arg) => {
  console.log('dbg', arg);
  return arg;
};

const griddleStyle = {
  classNames: {
    Cell: 'griddle-cell',
    Filter: 'griddle-filter',
    Loading: 'griddle-loadingResults',
    NextButton: 'griddle-next-button',
    NoResults: 'griddle-noResults',
    PageDropdown: 'griddle-page-select',
    Pagination: 'griddle-pagination',
    PreviousButton: 'griddle-previous-button',
    Row: 'griddle-row',
    RowDefinition: 'griddle-row-definition',
    Settings: 'griddle-settings',
    SettingsToggle: 'griddle-settings-toggle',
    Table: 'table table-sm table-bordered',
    TableBody: 'griddle-table-body',
    TableHeading: 'griddle-table-heading',
    TableHeadingCell: 'griddle-table-heading-cell',
    TableHeadingCellAscending: 'griddle-heading-ascending',
    TableHeadingCellDescending: 'griddle-heading-descending'
  }
};

export default class Collapsible extends React.Component {
  constructor(props) {
    // Pass props to parent class
    super(props);
    this.state = props;
    this.confirmWipeData = this._confirmWipeData.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    console.log('newProps', nextProps);
  }

  _onClickView() {
    const newState = {
      leftEye: this.state.leftEye,
      rightEye: this.state.rightEye,
      cumulated: !this.state.cumulated
    };

    if (!newState.leftEye && !newState.rightEye) return;
    this.props.selectionHandler(newState);
    this.setState(newState);
  }

  _confirmWipeData() {
    if (confirm('Are you sure that you want to wipe all your past procedure data?') === true) {
      this.props.dataWipeHandler();
    }
  }

  render() {
    const DateCol = ({ value }) => <span style={{ color: '#0000AA' }}>{dbg(formatTime(value))}</span>;
    const ProtCol = (arg) => {
      console.log('arg', arg);
      return (<div className="btn-group-sm btn-group-vertical">
        { glasses && <button type="button" className="btn btn-success btn-sm" > glasses </button>
        }
        {
          cabin && <button type="button" className="btn btn-warning btn-sm" > Cabin </button>
        }
        { shield && <button type="button" className="btn btn-primary btn-sm" > Shield </button>
        }
        { !glasses && !shield && !cabin && <p><strong>No </strong></p> }
      </div>);
    };

    return (
      <div className="container">
        <div >
          <nav className="navbar navbar-light bg-faded" >
            <span>
              <button
                className="navbar-toggler navbar-toggler-right"
                type="button"
                data-toggle="collapse" data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation"
                onClick={() => $('.tooltip-holder').tooltip('dispose')}
              >
                <span
                  data-toggle="tooltip"
                  data-placement="left"
                  title="context menu"
                  className="navbar-toggler-icon tooltip-holder"
                />
              </button>
            </span>
            <h3>EyeRad</h3>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <div className="navbar-nav mr-auto">
                <div className="row">
                  <label
                    htmlFor="lgFormGroupInput"
                    className="col-sm-3 col-form-label col-form-label-lg"
                  >
                  Eye
                  </label >
                  <div className="col-sm-10">
                    <div className="form-check form-check-inline">
                      <label className="custom-control custom-checkbox">
                        <span className="custom-control-description">Left Eye</span>
                        <input
                          type="checkbox" id="left-eye-sel"
                          onClick={() => {
                            const newState = {
                              leftEye: !this.state.leftEye,
                              rightEye: this.state.rightEye,
                              cumulated: this.state.cumulated
                            };
                            this.props.selectionHandler(newState);
                            this.setState(newState);
                          }}
                          className="custom-control-input"
                          checked={this.state.leftEye}
                        />
                        <span className="custom-control-indicator" />
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <label className="custom-control custom-checkbox">
                        <span className="custom-control-description">Right Eye</span>
                        <input
                          type="checkbox" id="right-eye-sel"
                          onClick={() => {
                            const newState = {
                              leftEye: this.state.leftEye,
                              rightEye: !this.state.rightEye,
                              cumulated: this.state.cumulated
                            };

                            if (!newState.leftEye && !newState.rightEye) return;
                            this.props.selectionHandler(newState);
                            this.setState(newState);
                          }}
                          className="custom-control-input"
                          checked={this.state.rightEye}
                        />
                        <span className="custom-control-indicator" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <label htmlFor="lgFormGroupInput" className="col-sm-4 col-form-label col-form-label-lg">
                  Display
                </label >
                  <div className="col-sm-10">
                    <label className="custom-control custom-radio">
                      <input
                        onClick={this._onClickView.bind(this)}
                        id="radio1"
                        name="radio" type="radio" className="custom-control-input"
                        checked={!this.state.cumulated}
                      />
                      <span className="custom-control-indicator" />
                      <span className="custom-control-description">Period</span>
                    </label>
                    <label className="custom-control custom-radio">
                      <input
                        onClick={this._onClickView.bind(this)}
                        id="radio2" name="radio" type="radio" className="custom-control-input"
                        checked={this.state.cumulated}
                      />
                      <span className="custom-control-indicator" />
                      <span className="custom-control-description">Total Cumulated</span>
                    </label>
                  </div>
                </div>
                <div className="row">
                  <hr className="my-3" />
                  <div >
                    <div className="col">
                      <button
                        type="button" className="btn btn-primary" data-toggle="modal"
                        data-target="#myModal"
                      >
                        Enter Data
                      </button>
                    </div>
                    <div className="col">
                      <button
                        type="button" className="btn btn-primary" data-toggle="modal"
                        data-target="#myModal2"
                      >
                        Vis Data
                      </button>
                    </div>
                    <div className="col">
                      <button
                        type="button" className="btn btn-danger"
                        onClick={this.confirmWipeData}
                      >
                        Wipe all data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <div
            className="modal bd-example-modal-lg fade" id="myModal" tabIndex="-1" role="dialog"
            aria-labelledby="exampleModalLabel" aria-hidden="true"
          >
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">Add Procedures</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">x</span>
                  </button>
                </div>
                <ProcedureForm {...this.props} />
              </div>
            </div>
          </div>
          <div
            className="modal bd-example-modal-lg fade" id="myModal2" tabIndex="-1" role="dialog"
            aria-labelledby="exampleModalLabel" aria-hidden="true"
          >
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">Vis Data</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">x</span>
                  </button>
                </div>
                <div className="modal-body">
                  <Griddle
                    styleConfig={griddleStyle}
                    data={this.props.data}
                    components={{
                      Row: d => <tr>test </tr>
                    }}
                  >
                    <RowDefinition>
                      <ColumnDefinition id="date" customComponent={DateCol} />
                      <ColumnDefinition id="procedure" />
                      <ColumnDefinition id="equipment" />
                      <ColumnDefinition id="initProtSel" />
                    </RowDefinition>
                  </Griddle>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

Collapsible.propTypes = {
  selectionHandler: PropTypes.func,
  dataWipeHandler: PropTypes.func
};
