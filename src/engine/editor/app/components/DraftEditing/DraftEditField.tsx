import React, { HTMLProps, useEffect, useRef, useState } from "react";
import { useDraft } from "./useDraft";

import "./DraftEditField.css";
import useClickOutside from "../../hooks/useClickOutside";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "../../Hotkeys";

interface Props extends React.HTMLProps<HTMLInputElement> {
  onCommit: (val: string) => void;
  onDiscard: (val: string) => void;
  discardWhenClickoutside?: boolean;
  value: string;
  editing: boolean;
}

export const DraftEditField = ({
  onCommit,
  onDiscard,
  value,
  editing,
  discardWhenClickoutside,
  ...props
}: Props) => {
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
    // prevent premature return of the de-focus
    if (discardWhenClickoutside) {
      onDiscard && onDiscard(textfieldDraft);
    } else {
      onCommit && onCommit(textfieldDraft);
    }
    setIsEditing(false);
  });

  // onabort editing
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onDiscard && onDiscard(textfieldDraft);
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", keyDownHandler, { capture: true });

    return () => {
      window.removeEventListener("keydown", keyDownHandler, { capture: true });
    };
  }, []);

  return (
    <>
      {!isEditing && (
        <div className="draft-edit-field" {...props}>
          {value}
        </div>
      )}
      {isEditing && (
        <input
          className="draft-edit-field"
          ref={textfieldRef}
          type="text"
          value={textfieldDraft}
          onChange={(val) => setTextfieldDraft(val.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          {...props}
        />
      )}
    </>
  );
};
