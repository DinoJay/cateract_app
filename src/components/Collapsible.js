import React from 'react';
import * as d3 from 'd3';
import ProcedureForm from './ProcedureForm';


export default class Collapsible extends React.Component {
  constructor(props) {
    // Pass props to parent class
    super(props);

    this.state = props;
  }

  componentWillReceiveProps(nextProps) {
    console.log('newProps', nextProps);
  }

  _onClickView() {
    const newState = {
      leftEye: this.state.leftEye,
      rightEye: this.state.rightEye,
      aggrSel: !this.state.aggrSel
    };

    if (!newState.leftEye && !newState.rightEye) return;
    this.props.clickHandler(newState);
    this.setState(newState);
  }

  render() {
    return (
      <div>
        <div className="">
          <nav className="navbar navbar-light bg-faded" >
            <button
              className="navbar-toggler navbar-toggler-right" type="button"
              data-toggle="collapse" data-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent" aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <h3>EyeRad</h3>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <div className="navbar-nav mr-auto">
                <div className="row">
                  <label htmlFor="lgFormGroupInput" className="col-sm-3 col-form-label col-form-label-lg">
                  Selection
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
                              aggrSel: this.state.aggrSel
                            };
                            this.props.clickHandler(newState);
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
                              aggrSel: this.state.aggrSel
                            };

                            if (!newState.leftEye && !newState.rightEye) return;
                            this.props.clickHandler(newState);
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
                  View
                </label >
                  <div className="col-sm-10">
                    <div className="form-check form-check-inline">
                      <label className="custom-control custom-checkbox">
                        <span className="custom-control-description">Procedure</span>
                        <input
                          type="checkbox"
                          onClick={this._onClickView.bind(this)}
                          className="custom-control-input"
                          checked={this.state.aggrSel}
                        />
                        <span className="custom-control-indicator" />
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <label className="custom-control custom-checkbox mb-12 mr-sm-12 mb-sm-12">
                        <span className="custom-control-description">Sum</span>
                        <input
                          type="radio"
                          onClick={this._onClickView.bind(this)}
                          className="custom-control-input"
                          checked={!this.state.aggrSel}
                        />
                        <span className="custom-control-indicator" />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="row">
                    <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#myModal">
                    Enter Data
                  </button>
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
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div id="modalBody" className="modal-body" >
                  <ProcedureForm />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                  <button type="button" className="btn btn-primary">Save changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
