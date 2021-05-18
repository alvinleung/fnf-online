import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "../../Hotkeys";

export function useDraft(onCommit: (value: string) => void) {
  const [textfieldDraft, setTextfieldDraft] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const textfieldRef = useRef<HTMLInputElement>(null);

  // abort editing
  useHotkeys(
    HotkeyConfig.ESCAPE,
    () => {
      setIsEditing(false);
    },
    {
      enableOnTags: ["INPUT", "TEXTAREA"],
    },
    []
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // commit
      onCommit && onCommit(textfieldDraft);
    }
  };

  return {
    textfieldRef,
    handleKeyDown,
    textfieldDraft,
    setTextfieldDraft,
    isEditing,
    setIsEditing,
  };
}
