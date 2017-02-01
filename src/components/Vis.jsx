import * as d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';

import style from './styles/Comp.scss';

import { create } from './vis';

  // function reset() {
  //   console.log('reset');
  //   zoomHandler.transform(svg.select('.zoom'),
  //     d3.zoomIdentity
  //     .translate(100, 0));
  // }
class Comp extends React.Component {
  static propTypes() {
    return {
      width: React.PropTypes.number.isRequired,
      height: React.PropTypes.number.isRequired
    };
  }

  componentDidMount() {
    d3.json('testData.json', (error, data) => {
      if (error) throw error;
      console.log('data', data);
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
