import React from 'react';

import Icon from './Icon';

export default function EditMode({ editMode, onSetEditMode, loggedIn, name }) {
  if (loggedIn == null || loggedIn !== name) return null;
  const text = editMode ? "Visa" : "Editera";
  return (
    <div className="pill buttonized edit-mode-btn" onClick={() => onSetEditMode(!editMode)}>
      <Icon type={editMode ? 'view' : 'edit'} inTextButton/>{text}
    </div>
  );
}
