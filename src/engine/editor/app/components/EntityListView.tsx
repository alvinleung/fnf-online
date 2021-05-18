import { m } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import { useHotkeys } from "react-hotkeys-hook";
import { Game, GameEvent } from "../../../Game";
import { useEntityContext, useGameContext, useSelectedEntity } from "../EditorContextWrapper";
import useTriggerViewportContextMenu from "../hooks/GameEngineCommunication/useTriggerViewportContextMenu";
import useClickOutside from "../hooks/useClickOutside";
import { useEntityEditing } from "../hooks/useEntityEditing";
import { HotkeyConfig } from "../Hotkeys";
import { DraftEditField } from "./DraftEditing/DraftEditField";
import { List } from "./List";
import { ListItem } from "./List/ListItem";
import { Modal } from "./Modal";

/**
 * UI for scene entity list manipulation
 * @returns
 */
export const EntityListView = () => {
  const game = useGameContext();

  const { entities, selectedEntity, setSelectedEntity } = useEntityContext();
  const { createEntity, deleteEntity, duplicateEntity, changeEntityId } = useEntityEditing(game);

  const [isCreatingEntity, setIsCreatingEntity] = useState(false);
  const entityCreationName = "New Entity";

  const [entityNameEditIndex, setEntityNameEditIndex] = useState<number>(null);

  const handleEntityCreation = (id: string) => {
    if (!id) return;

    // check if entity have the same name in the system
    if (game.getEntityById(id)) {
      alert(`Entity with ID "${id}" already exist, please provide another ID.`);
      return;
    }

    const newEntity = createEntity(id);

    //close editor
    setIsCreatingEntity(false);
    setSelectedEntity(newEntity);
  };

  const handleEntityCreationAbort = () => {
    setIsCreatingEntity(false);
  };

  const handleEntityListSelect = (val: string) => {
    const selectedEntity = game.getEntityById(val);
    setSelectedEntity(selectedEntity);
  };

  const handleItemRemove = (entityId: string) => {
    deleteEntity(entityId);

    // sync the entity list with game
    // syncEditorEntityList(game);
    setSelectedEntity(null);
  };

  const handleEntityNameAbort = () => {
    setEntityNameEditIndex(null);
  };

  const handleEntityNameCommit = (commitValue: string) => {
    // no change
    if (commitValue === selectedEntity.id) {
      setEntityNameEditIndex(null);
      return;
    }

    // id conflict
    if (game.getEntityById(commitValue)) {
      alert(`Entity with ID "${commitValue}" already exist, please provide another ID.`);
      return;
    }

    // commit the change here
    const changedEntity = changeEntityId(selectedEntity, commitValue);

    // close editor
    setEntityNameEditIndex(null);
    setSelectedEntity(changedEntity);
  };

  const entityList = entities.map((entity, index) => {
    const isEditing = entityNameEditIndex === index;

    return (
      <ListItem
        value={entity.id as string}
        onDoubleClick={() => setEntityNameEditIndex(index)}
        key={index}
      >
        <DraftEditField
          onCommit={handleEntityNameCommit}
          onAbort={handleEntityNameAbort}
          value={entity.id as string}
          editing={isEditing}
        />
      </ListItem>
    );
  });

  const entityCreationField = isCreatingEntity && (
    <ListItem value={entityCreationName} key={entities.length}>
      <DraftEditField
        onCommit={handleEntityCreation}
        onAbort={handleEntityCreationAbort}
        value={entityCreationName}
        editing={isCreatingEntity}
      />
    </ListItem>
  );

  return (
    <>
      <div className="header-label panel__header panel-hor-spacing">Entity List</div>
      <List
        onSelect={handleEntityListSelect}
        onItemRemove={handleItemRemove}
        value={selectedEntity && (selectedEntity.id as string)}
      >
        {isCreatingEntity ? entityList.concat(entityCreationField) : entityList}
      </List>
      <ContextMenu id="item-menu-trigger">
        <MenuItem
          data={{ action: "add-entity" }}
          onClick={() => {
            setIsCreatingEntity(true);
          }}
        >
          Add Entity
        </MenuItem>
        {selectedEntity && (
          <>
            <MenuItem divider={true} />
            <MenuItem
              data={{ action: "add-entity" }}
              onClick={() => duplicateEntity(selectedEntity.id as string)}
            >
              Duplicate "{selectedEntity.id}"
            </MenuItem>
            <MenuItem
              data={{ action: "remove-entity" }}
              onClick={() => {
                handleItemRemove(selectedEntity.id as string);
              }}
            >
              Remove "{selectedEntity.id}"
            </MenuItem>
          </>
        )}
      </ContextMenu>
    </>
  );
};
