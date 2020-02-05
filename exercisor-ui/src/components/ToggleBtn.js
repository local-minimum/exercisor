import React from 'react';

export default function ToggleBtn({children, onClick, toggled=false, disabled=false, name=null}) {
  const className = ['pill'];
  if (disabled || onClick == null) {
    className.push('buttonized-disabled');
  } else if (toggled) {
    className.push('buttonized-pressed');
  } else {
    className.push('buttonized');
  }
  return (
    <div
      className={className.join(' ')}
      onClick={() => disabled || onClick == null ? null : onClick(!toggled, name)}
    >
      {children}
    </div>
  )
}
