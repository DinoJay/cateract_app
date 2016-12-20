import React from 'react';

import './global_styles/app.scss';
import Vis from './components/Vis.jsx';

export default () => (
  <div>
    <h1>It Works!</h1>
    <p>This React project just works including <span className="redBg">module</span> local styles.</p>
    <p>Example Comp!</p>
    <Vis />
  </div>
  );
