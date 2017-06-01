import React from 'react';

import logoSrc from '../global_styles/big_logo.png';

export default () => (
  <div className="jumbotron">

    <img src={logoSrc} className="d-inline-block " alt="" />
    <hr className="my-4" />
    <p className="lead">Welcome to <strong>myEyeDose!</strong></p>
    <p>
          Track, calculate and learn how to optimise the radiation dose to your eye lens. <br />
          Click the <mark>context menu</mark> above to start adding your cardiac procedures.
        </p>
    <div className="bd-callout bd-callout-warning">
      <h4>Dosimeter</h4>
      <p>Always use an eye lens dosimeter for a more accurate radiation dose estimation.</p>
    </div>
  </div>
);
