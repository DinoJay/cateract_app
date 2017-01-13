import React from 'react';

import './global_styles/app.scss';
import Vis from './components/Vis';

export default () => (
  <div className="section">
    <h2>EyeRad</h2>
    <div className="row">
      <h5 className="col m12"> A visualization to keep track of your daily radiation dose!</h5>
    </div>
    <div className="row">
      <fieldset className="col m3" id="impact">
        <legend>Eye Aggregation</legend>
        <p>
          <input type="checkbox" id="test5" />
          <label htmlFor="test5">Left Eye</label>
        </p>
        <p>
          <input type="checkbox" id="test6" checked="checked" />
          <label htmlFor="test6">Right Eye</label>
        </p>
      </fieldset>

      <fieldset className="col m3" id="aggr">
        <legend>Radiation Aggregation</legend>

        <p>
          <input type="checkbox" id="test5" checked="checked" />
          <label htmlFor="test5">Single</label>
        </p>
        <p>
          <input type="checkbox" id="test6" />
          <label htmlFor="test6">Sum</label>
        </p>
      </fieldset>

      <fieldset className="col m4" id="aggr2">
        <legend>Time aggregation</legend>
        <div className="col m6">
          <p>
            <input type="checkbox" id="test5" checked="checked" />
            <label htmlFor="test5">Days</label>
          </p>
          <p>
            <input type="checkbox" id="test6" />
            <label htmlFor="test6">Years</label>
          </p>
        </div>
        <p className="col m6">
          <input type="checkbox" id="test6" />
          <label htmlFor="test6">Months</label>
        </p>
      </fieldset>
    </div>

    <Vis />
  </div>
  );
