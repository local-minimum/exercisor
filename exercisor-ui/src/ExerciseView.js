import React from 'react';

class ExerciseView extends React.Component {

  componentDidMount() {
    const { onReloadUser, name } = this.props;
    onReloadUser(name, null);
  }

  componentDidUpdate() {
    const { userOutOfSync, onReloadUser, name } = this.props;
    if (userOutOfSync) onReloadUser(name, null);
  }

  renderSummary() {
      const { excercises } = this.props;
      return (
        <div>
          <h2>Sammanställning</h2>
          <p>{excercises} pass {excercises === 1 ? 'utfört' : 'utförda'}.</p>
        </div>
      );
  }

  renderTableRow(event) {
    return (
      <tr key={event.id}>
        <td>{event.date}</td>
        <td>{event.distance}</td>
        <td>{event.duration}</td>
        <td>{event.calories}</td>
        <td>CrossTrainer</td>
      </tr>
    )
  }

  renderTable() {
      const { events } = this.props;
      const eventRows = events
        .slice(Math.max(events.length - 5, 0))
        .reverse()
        .map(this.renderTableRow);

      return (
        <table>
          <tr>
            <th>Datum</th>
            <th>Distans (km)</th>
            <th>Tid (minuter)</th>
            <th>Kalorier</th>
            <th>Typ</th>
          </tr>
          {eventRows}
        </table>
      );
  }

  render() {
    return <div className="App-main-item">
      {this.renderSummary()}
      {this.renderTable()}
    </div>;
  }
}

export default ExerciseView;
