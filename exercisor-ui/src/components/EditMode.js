import React from 'react';

export default function EditMode({ editMode, onSetEditMode, loggedIn }) {
  if (!loggedIn) return null;
  const text = editMode ? "📄 Visa" : "🖉 Editera";
  return <div className="pill buttonized edit-mode-btn" onClick={() => onSetEditMode(!editMode)}>{text}</div>
}
