import React, { useEffect } from "react";
import { useDraft } from "./useDraft";

interface Props {
  onCommit: (val: string) => void;
  value: string;
  editing: boolean;
}

export const DraftEditField = ({ onCommit, value, editing = false }: Props) => {
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

  return (
    <>
      {!isEditing && <div>{value}</div>}
      {isEditing && (
        <input
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
