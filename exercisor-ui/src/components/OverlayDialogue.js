import React from 'react';
import Icon from './Icon';

import './OverlayDialogue.css';

export default function OverlayDialgue({
    header, body, buttons,
}) {
    const btns = buttons.map(btn => 
        <div key={btn.title} className="buttonized pill" onClick={btn.action}>
            <Icon type={btn.icon} title={btn.title} inTextButton/>{btn.title}
        </div>
    );
    return (
        <div className="overlay">
            <div className="dialogue">
                <div className="header">{header}</div>
                <div className="body">{body}</div>
                <div className="buttons">
                    {btns}
                </div>
            </div>
        </div>
    )
}