import React, { useEffect, useRef, useState } from "react";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import { Game } from "../../../Game";
import { useEntityContext, useGameContext, useSelectedEntity } from "../EditorContextWrapper";
import useTriggerViewportContextMenu from "../hooks/GameEngineCommunication/useTriggerViewportContextMenu";
import { useEntityEditing } from "../hooks/useEntityEditing";
import { List } from "./List";
import { ListItem } from "./List/ListItem";
import { Modal } from "./Modal";

export const EntityListView = () => {
  const game = useGameContext();

  const { entities, selectedEntity, setSelectedEntity } = useEntityContext();
  const { createEntity, deleteEntity, duplicateEntity } = useEntityEditing(game);

  const [isCreatingEntity, setIsCreatingEntity] = useState(false);
  const [entityCreationName, setEntityCreationName] = useState("");

  const handleEntityCreation = (name: string) => {
    if (!name) return;

    const newEntity = createEntity(name);
    setIsCreatingEntity(false);
    setSelectedEntity(newEntity);
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

  const entityNameInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (isCreatingEntity && entityNameInputRef.current) {
      setEntityCreationName("");
      entityNameInputRef.current.focus();
    }
  }, [isCreatingEntity]);

  const entityContextMenuTriggerRef = useTriggerViewportContextMenu();

  return (
    <>
      <ContextMenuTrigger id="item-menu-trigger" ref={entityContextMenuTriggerRef}>
        <List
          onSelect={handleEntityListSelect}
          onItemRemove={handleItemRemove}
          value={selectedEntity && (selectedEntity.id as string)}
        >
          {entities.map((entity, index) => {
            return (
              <ListItem value={entity.id as string} key={index}>
                {entity.id as string}
              </ListItem>
            );
          })}
        </List>
      </ContextMenuTrigger>
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
      <Modal
        isVisible={isCreatingEntity}
        onHide={() => {
          setIsCreatingEntity(false);
        }}
        width="10rem"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEntityCreation(entityCreationName);
          }}
        >
          <h2>Create Entity</h2>
          <div className="field">
            <label>
              Entity Name
              <input
                ref={entityNameInputRef}
                type="text"
                value={entityCreationName}
                onChange={(e) =>
                  setEntityCreationName(
                    e.target.value
                      .match(/^[A-Za-z0-9 -]*$/)
                      .join("")
                      .replace(" ", "-")
                  )
                }
              />
            </label>
          </div>
          <div className="field">
            <button type="submit">Create</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={(e) => setIsCreatingEntity(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
