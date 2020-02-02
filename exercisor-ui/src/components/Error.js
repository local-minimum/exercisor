import React from 'react';
import { emptyOrNull } from '../util';

export default class Error extends React.Component {
  render() {
    const { error, targetFilter } = this.props;
    if (emptyOrNull(error)) return null;
    const { message, target } = error;
    if (target !== targetFilter) return null;
    return <div className="error">{message}</div>;
  }
}
