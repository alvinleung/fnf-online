import React, { useEffect } from "react";
import { useDraft } from "./useDraft";

import "./DraftEditField.css";
import useClickOutside from "../../hooks/useClickOutside";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "../../Hotkeys";

interface Props {
  onCommit: (val: string) => void;
  onAbort: (val: string) => void;
  value: string;
  editing: boolean;
}

export const DraftEditField = ({ onCommit, onAbort, value, editing = false }: Props) => {
  const {
    textfieldRef,
    handleKeyDown,
    textfieldDraft,
    setTextfieldDraft,
    isEditing,
    setIsEditing,
  } = useDraft(onCommit);

  // when start editing
  useEffect(() => {
    if (!isEditing || !textfieldRef.current) return;
    textfieldRef.current.focus();
    setTextfieldDraft(value);
  }, [isEditing]);

  // toggle editing
  useEffect(() => {
    setIsEditing(editing);
  }, [editing]);

  // handle focus
  const handleFocus = () => {
    textfieldRef.current.select();
  };

  useClickOutside(textfieldRef, () => {
    onAbort && onAbort(textfieldDraft);
    setIsEditing(false);
  });

  // abort editing
  useHotkeys(
    HotkeyConfig.ESCAPE,
    () => {
      onAbort && onAbort(textfieldDraft);
      setIsEditing(false);
    },
    {
      enableOnTags: ["INPUT", "TEXTAREA"],
    },
    []
  );

  return (
    <>
      {!isEditing && <div className="draft-edit-field">{value}</div>}
      {isEditing && (
        <input
          className="draft-edit-field"
          ref={textfieldRef}
          type="text"
          value={textfieldDraft}
          onChange={(val) => setTextfieldDraft(val.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
      )}
    </>
  );
};
