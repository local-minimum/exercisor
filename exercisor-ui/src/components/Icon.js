import React from 'react';

import editIcon from './icons/edit.png';
import viewIcon from './icons/view.png';
import collapseIcon from './icons/collapse.png';
import expandIcon from './icons/expand.png';
import deleteIcon from './icons/delete.png';
import saveIcon from './icons/save.png';
import loginIcon from './icons/login.png';
import logoutIcon from './icons/logout.png';
import runIcon from './icons/run.png';
import crosstrainerIcon from './icons/crosstrainer.png';
import bikeIcon from './icons/bike.png';
import followIcon from './icons/follow.png';
import unfollowIcon from './icons/unfollow.png';

import './icons/icons.css';

export default function Icon({ type, inTextButton }) {
    const className = inTextButton ? "text-button-icon" : "button-icon";
    let icon = null;
    if (type === 'edit') icon = editIcon;
    else if (type === 'view') icon = viewIcon;
    else if (type === 'collapse') icon = collapseIcon;
    else if (type === 'expand') icon = expandIcon;
    else if (type === 'delete') icon = deleteIcon;
    else if (type === 'save') icon = saveIcon;
    else if (type === 'login') icon = loginIcon;
    else if (type === 'logout') icon = logoutIcon;
    else if (type === 'bike') icon = bikeIcon;
    else if (type === 'run') icon = runIcon;
    else if (type === 'crosstrainer') icon = crosstrainerIcon;
    else if (type === 'follow') icon = followIcon;
    else if (type === 'unfollow') icon = unfollowIcon;
    else return null;
    return <img src={icon} alt={type} className={className} />
}