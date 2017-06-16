import React, { PropTypes } from 'react';

import Griddle, { plugins } from 'griddle-react';
import Operation from './Operation';


const TableHeading = () => (
  <thead className="">
    <tr>
      <th>Proc.</th>
      <th>Equip.</th>
      <th>Time</th>
      <th>Prot.</th>
    </tr>
  </thead>
  );

TableHeading.propTypes = {
  rowData: PropTypes.object,
  remove: PropTypes.func
};

  // '',
  // 'CA + PCI (PTCA)',
  // 'PM implantation',
  // 'PM resynchronisation',
  // 'RF catheter ablation',
  // 'PVI',
  // 'Valvuloplasty',
  // 'CTO'
class Filter extends React.Component {
  onChange(e) {
    console.log('target-value', e.target.value);
    const result = this.props.setFilter(e.target.value);
    console.log('result', result);
  }

  render() {
    return (
      <select className={this.props.className} id="equipment" onChange={this.onChange.bind(this)}>
        <option value="">All</option>
        <option value="CA">CA</option>
        <option value="CA + PCI (PTCA)">CA + PCI (PTCA)</option>
        <option value="PM resynchronisation">PM resynchronisation</option>
        <option value="RF catheter ablation">RF catheter ablation</option>
        <option value="PVI">PVI</option>
        <option value="PM implantation">PM implantation</option>
        <option value="CTO">CTO</option>
      </select>
    );
  }
}

const Layout = ({ Filter, Table, Pagination }) => (
  <div>
    <Filter />
    <Table />
    <Pagination />
  </div>
);

const griddleStyle = {
  classNames: {
    Cell: 'griddle-cell',
    Filter: 'form-control form-control-lg',
    Loading: 'griddle-loadingResults',
    NextButton: 'griddle-next-button',
    NoResults: 'griddle-noResults',
    PageDropdown: 'form-control form-control-lg',
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

const ProcedureGrid = props =>
  <div className="modal-body">
    <Griddle
      styleConfig={griddleStyle}
      data={props.data.map((d) => {
        if (d.initProtSel.glasses) { d.glass = 'glass'; }
        if (d.initProtSel.shield) {
          d.shield = 'shield';
        }
        if (d.initProtSel.cabin) { d.cabin = 'cabin'; }
        return d;
      })}
      plugins={[plugins.LocalPlugin]}
      components={{
        Row: Operation(props.operationRemove),
        TableHeading,
        Layout,
        Filter
      }}
    />
  </div>;

ProcedureGrid.propTypes = {
  data: PropTypes.array,
  operationRemove: PropTypes.func
};
export default ProcedureGrid;
