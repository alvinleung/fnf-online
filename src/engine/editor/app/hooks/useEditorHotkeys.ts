import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Entity } from "../../../ecs";
import { Game } from "../../../Game";
import { useEditHistory, useUndoRedo } from "../EditHistory";
import { HotkeyConfig } from "../Hotkeys";
import { useEntityEditing } from "./useEntityEditing";

/**
 * Set up editor hot keys
 * @param game
 * @param selectedEntity
 * @param setSelectedEntity
 */
export default function useEditorHotkeys(
  game: Game,
  selectedEntity: Entity,
  setSelectedEntity: React.Dispatch<React.SetStateAction<Entity>>
) {
  const [editHistory, pushEditHistory] = useEditHistory();
  const [undo, redo] = useUndoRedo();

  const { duplicateEntity } = useEntityEditing(game);

  useHotkeys(HotkeyConfig.REDO, redo, {}, [editHistory]);
  useHotkeys(HotkeyConfig.UNDO, undo, {}, [editHistory]);

  /**
   * copy and pasting entities
   */
  const [copyingEntity, setCopyingEntity] = useState<Entity>();
  useHotkeys(
    HotkeyConfig.COPY,
    () => {
      setCopyingEntity(selectedEntity);
    },
    [selectedEntity]
  );
  useHotkeys(
    HotkeyConfig.PASTE,
    () => {
      const duplicatedInstance = duplicateEntity(copyingEntity && (copyingEntity.id as string));
      setSelectedEntity(duplicatedInstance);
    },
    [copyingEntity]
  );
}
