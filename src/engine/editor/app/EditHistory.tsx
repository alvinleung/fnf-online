import React, { useContext, useEffect, useRef, useState } from "react";
import useUndo from "use-undo";
import { Component, Entity } from "../../ecs";
import { Game } from "../../Game";

interface EntityStateEdit {
  type: "update" | "add" | "remove" | "componentFieldChange";
  entity: Entity;
  component?: Component;
  value?: any;
  field?: any;
  beforeValue?: any;
  index: number; // the index at which the entity was in at the moment
}

const EditHistoryContext = React.createContext({
  history: null,
  pushEditChange: (change: EntityStateEdit) => {},
  undo: () => {},
  redo: () => {},
});

export const EditHistoryContextWrapper = ({
  children,
  game,
}: {
  children: React.ReactNode;
  game: Game;
}) => {
  const [
    editHistory,
    { set: pushEditChange, reset: resetEntites, undo: undoEdit, redo: redoEdit, canUndo, canRedo },
  ] = useUndo<EntityStateEdit>(null);

  // when entities record changes in the system
  const [previousFutureLength, setPreviousFutureLength] = useState(0);
  const [hasNewChangeJustPushed, setHasNewChangeJustPushed] = useState(false);

  // resolve edit state change
  useEffect(() => {
    // don't have to process do/undo the change is a new "commit"
    if (hasNewChangeJustPushed) {
      setHasNewChangeJustPushed(false);
      setPreviousFutureLength(editHistory.future.length);
      return;
    }

    if (editHistory.future.length > previousFutureLength) {
      // if the user is undo-ing
      // the user just undone sth and haven't commit anything else
      const change = editHistory.future[0];

      // do a revserse action of the latest do
      //
      // add the entity back in if removed
      if (change.type === "remove") {
        game.insertEntityAt(change.entity, change.index);
      }

      // add the entity back in if removed
      if (change.type === "add") {
        game.removeEntity(game.getEntityById(change.entity.id as string));
      }

      if (change.type === "componentFieldChange") {
        // revert to valueBefore
        change.component[change.field] = change.beforeValue;
      }
    }

    // if the user is redo-ing
    if (editHistory.future.length < previousFutureLength) {
      // handle redo here
      const redoChange = editHistory.present;

      if (redoChange.type === "remove") {
        game.removeEntity(game.getEntityById(redoChange.entity.id as string));
      }
      if (redoChange.type === "add") {
        game.insertEntityAt(redoChange.entity, redoChange.index);
      }

      if (redoChange.type === "componentFieldChange") {
        // revert to valueBefore
        redoChange.component[redoChange.field] = redoChange.value;
      }
    }

    setPreviousFutureLength(editHistory.future.length);
  }, [editHistory]);

  return (
    <EditHistoryContext.Provider
      value={{
        history: editHistory,
        pushEditChange: (param) => {
          setHasNewChangeJustPushed(true);
          pushEditChange(param);
        },
        undo: undoEdit,
        redo: redoEdit,
      }}
    >
      {children}
    </EditHistoryContext.Provider>
  );
};

export const useEditHistory = () => {
  const { history, pushEditChange } = useContext(EditHistoryContext);

  const timeoutRef = useRef(setTimeout(() => {}, 0));
  const hasEditPushed = useRef(true);
  const beforeValue = useRef(0);

  const rateLimitPushEditChange = (update, delay) => {
    if (!delay) {
      pushEditChange(update);
      return;
    }

    if (hasEditPushed.current === true) {
      hasEditPushed.current = false;
      beforeValue.current = update.beforeValue;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      pushEditChange({ ...update, beforeValue: beforeValue.current });
      hasEditPushed.current = true;
    }, delay);
  };

  return [history, rateLimitPushEditChange];
};

export const useUndoRedo = () => {
  const { undo, redo } = useContext(EditHistoryContext);
  return [undo, redo];
};
