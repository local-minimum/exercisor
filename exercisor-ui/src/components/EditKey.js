import React from 'react';
const closeDelay = 1000 * 2;

export default class ExerciseOverviewCharts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {expanded: false, lastEdit: 0};
  }

  autoCollapse = () => {
      const { lastEdit, expanded } = this.state;
      if (expanded && new Date().getTime() - lastEdit > closeDelay) {
        this.setState({expanded: false});
      }
  }

  handleChange = (evt) => {
    const { onSetEditKey } = this.props;
    onSetEditKey(evt.target.value);
    this.setState({lastEdit: new Date().getTime()});
    setTimeout(this.autoCollapse, closeDelay);
  }

  render() {
    const { editKey, onSetEditKey } = this.props;
    const { expanded } = this.state;
    const editing = editKey.length > 0;
    if (expanded) {
      return (
        <div className="edit-key">
          Nyckel: <input type="password" value={editKey} onChange={this.handleChange}/>
        </div>
      );
    } else if (editing) {
      return (
        <button className="edit-key-small" onClick={() => onSetEditKey("")}>Avsluta Editering</button>
      );
    }
    return (
      <button className="edit-key-small" onClick={() => this.setState({expanded: !expanded})}>Editera</button>
    );
  }
}
