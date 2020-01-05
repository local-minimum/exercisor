import React from 'react';

const route = [
    ["Alingsås", "Örgrytemotet, Heden, Göteborg"],
];

export default class DistanceOnEarth extends React.Component {
    render() {
      return (
        <div>
          <h2>Tillryggalagd Sträcka</h2>
          <em>Inte riktigt redo än</em>
        </div>
      );
    }

    componentDidMount() {
      //this.props.onLoadRoute(route[0][0], route[0][1]);
    }
};
