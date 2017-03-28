import React from 'react';
import * as d3 from 'd3';
import ProcedureForm from './ProcedureForm';


export default function({ clickHandler }) {
  const onClick = () => {
    console.log('onClick', clickHandler);
    const leftChecked = d3.select('#left-eye-sel').property('checked');
    const rightChecked = d3.select('#right-eye-sel').property('checked');

    const aggrSel = d3.select('#aggr-sel').property('checked');

    let eye;
    if (leftChecked && rightChecked) {
      eye = 'both';
    }
    if (leftChecked) {
      eye = 'left';
    }
    if (rightChecked) {
      eye = 'both';
    }
    clickHandler(eye, aggrSel);
  };
  return (
    <div className="container-fluid">
      <div className="pos-f-t">
        <div className="collapse" id="navbarToggleExternalContent">
          <div className="bg-faded p-4">
            <h4>Collapsed content</h4>
            <span className="text-muted">Toggleable via the navbar brand.</span>
          </div>
        </div>
        <nav className="navbar navbar-light bg-faded" >
          <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
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
                      <input type="checkbox" id="left-eye-sel" onClick={onClick} className="custom-control-input" checked />
                      <span className="custom-control-indicator" />
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <label className="custom-control custom-checkbox">
                      <span className="custom-control-description">Right Eye</span>
                      <input type="checkbox" id="right-eye-sel" onClick={onClick} className="custom-control-input" />
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
                      <input type="radio" id="procedure-sel" name="aggr" className="custom-control-input" />
                      <span className="custom-control-indicator" />
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <label className="custom-control custom-checkbox mb-12 mr-sm-12 mb-sm-12">
                      <span className="custom-control-description">Sum</span>
                      <input type="radio" id="aggr-sel" onClick={onClick} name="aggr" className="custom-control-input" />
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
        <div className="modal fade" id="myModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Enter Procedures</h5>
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
