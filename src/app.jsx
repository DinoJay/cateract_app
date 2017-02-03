import React from 'react';
import * as d3 from 'd3';

import './global_styles/app.scss';
import Vis from './components/Vis';

class App extends React.Component {
  static propTypes() {
    return {
      width: React.PropTypes.number.isRequired,
      height: React.PropTypes.number.isRequired
    };
  }
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  componentWillMount() {
    d3.json('testData.json', (error, data) => {
      if (error) throw error;
      this.setState({ data });
    });
  }

  componentDidUpdate() {
  }


  render() {
    return (
      <div className="section">
        <Vis data={this.state.data} />
      </div>
    );
  }
}

export default App;
