import React from 'react';

import Icon from './Icon';

const handleUnfollow = (following, name, onUnfollow) => {
  following.forEach(follow => {
    if (follow.name === name) onUnfollow(follow.id);
  });
}

export default ({ loggedIn, name, following, onFollow, onUnfollow }) => {
  if (loggedIn == null || loggedIn === name) return null;
  if (following.some(follow => follow.name === name)) {
    return <div className="buttonized pill edit-mode-btn" onClick={() => handleUnfollow(following, name, onUnfollow)}><Icon type="unfollow" inTextButton/>Avfölj</div>
  }
  return <div className="buttonized pill edit-mode-btn" onClick={() => onFollow(name)}><Icon type="follow" inTextButton/>Följ</div>
}
