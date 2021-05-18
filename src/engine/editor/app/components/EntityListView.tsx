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
  const { createEntity, deleteEntity, duplicateEntity } = useEntityEditing(game);

  const [isCreatingEntity, setIsCreatingEntity] = useState(false);
  const [entityCreationName, setEntityCreationName] = useState("");

  const [entityNameDraft, setEntityNameDraft] = useState("");
  const [entityNameEditIndex, setEntityNameEditIndex] = useState<number>(null);
  const entityNameDrafRef = useRef<HTMLInputElement>(null);

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

  /**
   * For editing entity name draft
   */
  useClickOutside(entityNameDrafRef, () => {
    setEntityNameEditIndex(null);
  });
  useEffect(() => {
    if (!entityNameEditIndex || !selectedEntity) return;
    // focus on ref when edit
    if (entityNameDrafRef.current !== undefined) {
      setEntityNameDraft(selectedEntity.id as string);
      entityNameDrafRef.current.focus();
    }
  }, [entityNameEditIndex, selectedEntity]);

  const nameEditFieldFocus = () => {
    entityNameDrafRef.current.select();
  };

  // abort editing
  useHotkeys(
    HotkeyConfig.ESCAPE,
    () => {
      setEntityNameEditIndex(null);
    },
    {
      enableOnTags: ["INPUT", "TEXTAREA"],
    },
    []
  );

  const nameEditFieldKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // no change
      if (entityNameDraft === selectedEntity.id) {
        setEntityNameEditIndex(null);
        return;
      }

      // id conflict
      if (game.getEntityById(entityNameDraft)) {
        alert(`Entity with ID "${entityNameDraft}" already exist, please provide another ID.`);
        return;
      }

      // commit the change here
      const entity = game.getEntityById(selectedEntity.id as string);
      const newId = entityNameDraft;
      const changedEntity = game.changeEntityId(newId, entity);

      setEntityNameEditIndex(null);
      setSelectedEntity(changedEntity);
    }
  };

  const getNameEditField = () => {
    return (
      <input
        ref={entityNameDrafRef}
        type="text"
        value={entityNameDraft}
        onChange={(val) => setEntityNameDraft(val.target.value)}
        onFocus={nameEditFieldFocus}
        onKeyDown={nameEditFieldKeyDown}
      />
    );
  };

  return (
    <>
      <div className="header-label panel__header panel-hor-spacing">Entity List</div>
      <List
        onSelect={handleEntityListSelect}
        onItemRemove={handleItemRemove}
        value={selectedEntity && (selectedEntity.id as string)}
      >
        {entities.map((entity, index) => {
          const editField = entityNameEditIndex === index && getNameEditField();

          return (
            <ListItem
              value={entity.id as string}
              onDoubleClick={() => setEntityNameEditIndex(index)}
              key={index}
            >
              {(() => {
                if (editField) {
                  return editField;
                }
                return entity.id as string;
              })()}
            </ListItem>
          );
        })}
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
