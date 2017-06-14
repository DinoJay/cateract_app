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

const Layout = ({ Table, Pagination, Filter }) => (
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

function filter(arg) {
  console.log('arg', arg);
}
const ProcedureGrid = props =>
  <div className="modal-body">
    <Griddle
      styleConfig={griddleStyle}
      data={props.data}
      plugins={[plugins.LocalPlugin]}
      components={{
        Row: Operation(props.operationRemove),
        TableHeading,
        Layout
      }}
      events={{
        onFilter: filter
      }}
    />
  </div>;

ProcedureGrid.propTypes = {
  data: PropTypes.array,
  operationRemove: PropTypes.func
};
export default ProcedureGrid;
