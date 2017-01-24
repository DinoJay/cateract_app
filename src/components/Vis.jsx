import * as d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';

import style from './styles/Comp.scss';

import { create } from './vis';

class Comp extends React.Component {
  static propTypes() {
    return {
      width: React.PropTypes.number.isRequired,
      height: React.PropTypes.number.isRequired
    };
  }

  componentDidMount() {
    d3.csv('testData.csv', (error, data) => {
      if (error) throw error;
      const svg = d3.select(ReactDOM.findDOMNode(this));
      create(svg, data);
    });
  }

  render() {
    return (
      <svg className={style.Comp} width={this.props.width} height={this.props.height} />
    );
  }
}

Comp.defaultProps = {
  width: 400,
  height: 610
};
// const pureComp = () => (
//   <div className={style.pureComp}>
//     pureComp
//   </div>
//   );


export default Comp;
