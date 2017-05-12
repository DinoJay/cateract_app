import React, { PropTypes } from 'react';

import ProcedureForm from './ProcedureForm';
import ProcedureGrid from './ProcedureGrid';

import helpScreenSrc from '../global_styles/anno_screen.svg';
import logoSrc from '../global_styles/logo.png';

export default class Collapsible extends React.Component {
  constructor(props) {
    // Pass props to parent class
    super(props);

    this.state = { ...this.props, idsDelete: [] };
    this.confirmWipeData = this._confirmWipeData.bind(this);
    this.operationRemove = this._operationRemove.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ data: nextProps.data });
  }

  _onClickView() {
    const newState = {
      eye: this.state.eye,
      cumulated: !this.state.cumulated
    };

    this.props.selectionHandler(newState);
    this.setState(newState);
  }

  _confirmWipeData() {
    if (confirm('Are you sure that you want to wipe all your past procedure data?') === true) {
      this.props.dataWipeHandler();
    }
  }

  _operationRemove(id) {
    // const rawData = JSON.parse(localStorage.getItem('dataHHH'));
    const newData = this.state.data.filter(d => d.id !== id);
    // localStorage.setItem('dataHHH', JSON.stringify(newData));
    const realData = newData
      .sort((a, b) => a.date - b.date);

    this.setState(prevState => ({ data: realData, idsDelete: prevState.idsDelete.concat([id]) }));
  }

  render() {
    console.log('render Collapsible');
    return (
      <div >
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

              <a className="navbar-brand" href="#">
                <img src={logoSrc} width="100" height="30" className="d-inline-block " alt="" />
              </a>
              <button
                className="btn btn-sm"
                data-toggle="modal"
                data-target="#modal-help"
              >
                <i
                  className="fa fa-question fa-2x" aria-hidden="true"
                />
              </button>

            </span>

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
                      <label className="custom-control custom-radio">
                        <input
                          type="radio" id="left-eye-sel"
                          className="custom-control-input"
                          onClick={() => {
                            const newState = {
                              eye: true,
                              cumulated: this.state.cumulated
                            };
                            this.props.selectionHandler(newState);
                            this.setState(newState);
                          }}
                          checked={this.state.eye}
                        />
                        <span className="custom-control-indicator" />
                        <span className="custom-control-description">Left Eye</span>
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <label className="custom-control custom-radio">
                        <input
                          type="radio" id="right-eye-sel"
                          onClick={() => {
                            const newState = {
                              eye: false,
                              cumulated: this.state.cumulated
                            };

                            this.props.selectionHandler(newState);
                            this.setState(newState);
                          }}
                          className="custom-control-input"
                          checked={!this.state.eye}
                        />
                        <span className="custom-control-indicator" />
                        <span className="custom-control-description">Right Eye</span>
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

                <hr className="my-3" />

                <div className="justify-content-center">
                  <div className="justify-content-md-center btn-group">
                    <button
                      type="button" className="btn btn-success" data-toggle="modal"
                      data-target="#myModal"
                    >
                        Enter<br />Procedure
                      </button>
                    <button
                      type="button" className="btn btn-primary" data-toggle="modal"
                      data-target="#myModal2"
                    >
                        Selected<br />Procedures
                      </button>
                    <button
                      type="button" className="btn btn-danger"
                      onClick={this.confirmWipeData}
                    >
                        Wipe all<br />Procedures
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div
            className="modal bd-example-modal-lg fade" id="modal-help" tabIndex="-1" role="dialog"
            aria-labelledby="exampleModalLabel" aria-hidden="true"
          >
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content" >

                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">Help Menu</h5>
                  <button
                    type="button" className="close" data-dismiss="modal" aria-label="Close"
                  >
                    <span aria-hidden="true">x</span>
                  </button>

                </div>
                <div className="modal-body">
                  <img src={helpScreenSrc} className="img-fluid" alt="Responsive image" />
                </div>
              </div>
            </div>
          </div>
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
              <div className="modal-content" >

                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">Selected Procedures</h5>
                  <button
                    type="button" className="close" data-dismiss="modal" aria-label="Close"
                    onClick={() => this.setState({ data: this.props.data, idsDelete: [] })}
                  >
                    <span aria-hidden="true">x</span>
                  </button>
                </div>
                <ProcedureGrid
                  {...this.state}
                  operationRemove={this.operationRemove}
                  operationRemoveHandler={this.props.operationRemoveHandler}
                  timeBounds={this.props.timeBounds}
                />

                <div className="modal-footer">
                  <button
                    type="button"
                    className={'btn btn-primary'}
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={() => this.props.operationRemoveHandler(this.state.idsDelete)}
                  >
                    Save changes
                </button>
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
  dataWipeHandler: PropTypes.func,
  operationRemoveHandler: PropTypes.func,
  timeBounds: PropTypes.array
};
