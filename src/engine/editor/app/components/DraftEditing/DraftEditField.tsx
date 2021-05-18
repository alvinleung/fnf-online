import React, { useEffect, useRef, useState } from "react";
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

export const DraftEditField = ({ onCommit, onAbort, value, editing }: Props) => {
  const [textfieldDraft, setTextfieldDraft] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const textfieldRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // commit
      onCommit && onCommit(textfieldDraft);
    }
  };

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

  useClickOutside(textfieldRef, (e) => {
    onCommit(textfieldDraft);
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
