import React, { useContext, useEffect, useState } from "react";
import useUndo from "use-undo";

interface EntityStateEdit {
  type: "update" | "add" | "remove";
  value: any;
  index: number; // the index at which the entity was in at the moment
}

const EditHistoryContext = React.createContext({
  history: null,
  pushEditChange: (change: EntityStateEdit) => {},
  undo: () => {},
  redo: () => {},
});

export const EditHistoryContextWrapper = ({ children, game }) => {
  const [
    editHistory,
    { set: pushEditChange, reset: resetEntites, undo: undoEdit, redo: redoEdit, canUndo, canRedo },
  ] = useUndo<EntityStateEdit>(null);

  // when entities record changes in the system
  const [previousFutureLength, setPreviousFutureLength] = useState(0);

  // resolve edit state change
  useEffect(() => {
    // if the user is undo-ing
    if (editHistory.future.length > previousFutureLength) {
      // the user just undone sth and haven't commit anything else
      const change = editHistory.future[0];

      // do a revserse action of the latest do
      //
      // add the entity back in if removed
      if (change.type === "remove") {
        game.insertEntityAt(change.value, change.index);
      }

      // add the entity back in if removed
      if (change.type === "add") {
        game.removeEntity(change.value);
      }
    }

    // if the user is redo-ing
    if (editHistory.future.length < previousFutureLength) {
      // handle redo here
      const redoChange = editHistory.present;

      if (redoChange.type === "remove") {
        game.removeEntity(redoChange.value);
      }
      if (redoChange.type === "add") {
        game.insertEntityAt(redoChange.value, redoChange.index);
      }
    }

    setPreviousFutureLength(editHistory.future.length);
  }, [editHistory]);

  return (
    <EditHistoryContext.Provider
      value={{
        history: editHistory,
        pushEditChange: pushEditChange,
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
  return [history, pushEditChange];
};

export const useUndoRedo = () => {
  const { undo, redo } = useContext(EditHistoryContext);
  return [undo, redo];
};
