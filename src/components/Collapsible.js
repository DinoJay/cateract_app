import React, { PropTypes } from 'react';
import ProcedureForm from './ProcedureForm';

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
      aggrSel: !this.state.aggrSel
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
                              aggrSel: this.state.aggrSel
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
                  View
                </label >
                  <div className="col-sm-10">
                    <label className="custom-control custom-radio">
                      <input
                        onClick={this._onClickView.bind(this)}
                        id="radio1" name="radio" type="radio" className="custom-control-input"
                        checked={!this.state.aggrSel}
                      />
                      <span className="custom-control-indicator" />
                      <span className="custom-control-description">Procedure</span>
                    </label>
                    <label className="custom-control custom-radio">
                      <input
                        onClick={this._onClickView.bind(this)}
                        id="radio2" name="radio" type="radio" className="custom-control-input"
                        checked={this.state.aggrSel}
                      />
                      <span className="custom-control-indicator" />
                      <span className="custom-control-description">Accumulation</span>
                    </label>
                  </div>
                </div>
                <div>
                  <hr className="my-3" />
                  <div className="float-left">
                    <button
                      type="button" className="btn btn-primary" data-toggle="modal"
                      data-target="#myModal"
                    >
                        Enter Data
                      </button>
                  </div>
                  <div className="float-right">
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
        </div>
      </div>
    );
  }

}

Collapsible.propTypes = {
  selectionHandler: PropTypes.func,
  dataWipeHandler: PropTypes.func
};
