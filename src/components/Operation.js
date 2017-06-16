import React, { PropTypes } from 'react';

import { connect } from 'react-redux';
import { timeFormat } from 'd3';
import { plugins } from 'griddle-react';

const formatTime = timeFormat('%d/%m/%Y');


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


const dbg = (arg) => {
  console.log('dbg', arg);
  return arg;
};

const Operation = remove => connect((state, props) => ({
  rowData: plugins.LocalPlugin.selectors.rowDataSelector(state, props)
}))(({ rowData }) => (
  <tr >
    <td>{abbr(rowData.procedure)}</td>
    <td>{ rowData.equipment }</td>
    <td>
      <div className="">{dbg(formatTime(new Date(rowData.date)))}</div>
    </td>
    <td>
      <div className="btn-group-sm btn-group-vertical">
        { rowData.initProtSel.glasses
          && <button type="button" className="btn btn-success btn-sm" > glasses </button>
        }
        {
          rowData.initProtSel.cabin
            && <button type="button" className="btn btn-warning btn-sm" > Cabin </button>
        }
        { rowData.initProtSel.shield &&
          <button type="button" className="btn btn-primary btn-sm" > Shield </button>
        }
        { !rowData.initProtSel.glasses && !rowData.initProtSel.shield && !rowData.initProtSel.cabin
          && <p><strong>No </strong></p> }
        {rowData.glass}
      </div>
    </td>
    <td>
      <button
        type="button" className="btn btn-sm btn-danger img-circle"
        onClick={() => { remove(rowData.id); }}
      >
      x
    </button>
    </td>
  </tr>
  ));

Operation.propTypes = {
  rowData: PropTypes.object,
  remove: PropTypes.func
};


export default Operation ;
