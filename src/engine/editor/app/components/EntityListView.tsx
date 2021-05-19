import React, { useEffect, useRef, useState } from "react";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import { useEntityContext, useGameContext, useSelectedEntity } from "../EditorContextWrapper";
import { useEntityEditing } from "../hooks/useEntityEditing";
import { DraftEditField } from "./DraftEditing/DraftEditField";
import { List } from "./List";
import { ListItem } from "./List/ListItem";

/**
 * UI for scene entity list manipulation
 * @returns
 */
export const EntityListView = () => {
  const game = useGameContext();

  const { entities, selectedEntity, setSelectedEntity } = useEntityContext();
  const { createEntity, deleteEntity, duplicateEntity, changeEntityId } = useEntityEditing(game);

  const [isCreatingEntity, setIsCreatingEntity] = useState(false);
  const [entityCreationName, setEntityCreationName] = useState("new-entity");

  const [entityNameEditIndex, setEntityNameEditIndex] = useState<number>(null);

  useEffect(() => {
    if (isCreatingEntity) {
      let entityNameInitial = "new-entity";
      let entityName = entityNameInitial;
      let count = 1;

      while (game.getEntityById(entityName)) {
        entityName = entityNameInitial + "-" + count;
        count++;
      }

      setEntityCreationName(entityName);
    }
  }, [isCreatingEntity]);

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

  const handleEntityCreationDiscard = () => {
    setIsCreatingEntity(false);
  };

  const handleEntityListSelect = (val: string) => {
    const selectedEntity = game.getEntityById(val);
    setSelectedEntity(selectedEntity);
  };

  const handleItemRemove = (entityId: string) => {
    deleteEntity(entityId);

    setSelectedEntity(null);
  };

  const handleEntityNameAbort = () => {
    setEntityNameEditIndex(null);
    // setIsCreatingEntity(false);
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
          onDiscard={handleEntityNameAbort}
          value={entity.id as string}
          editing={isEditing}
        />
      </ListItem>
    );
  });

  const entityCreationField = (
    <ListItem value={entityCreationName} key={"creation"}>
      <DraftEditField
        onCommit={handleEntityCreation}
        onDiscard={handleEntityCreationDiscard}
        value={entityCreationName}
        editing={isCreatingEntity}
        key={"creation"}
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
          onClick={(e) => {
            // prevent it conflicting with clickoutside in editor
            e.preventDefault();
            e.stopPropagation();
            setIsCreatingEntity(true);
          }}
        >
          Add Entity
        </MenuItem>
        {selectedEntity && (
          <>
            <MenuItem divider={true} />
            <MenuItem
              onClick={(e) => {
                // prevent it conflicting with clickoutside in editor
                e.preventDefault();
                e.stopPropagation();
                const targetEntity = entities.findIndex(({ id }) => id === selectedEntity.id);
                setEntityNameEditIndex(targetEntity);
              }}
            >
              Rename "{selectedEntity.id}"
            </MenuItem>
            <MenuItem
              onClick={() => {
                const entity = duplicateEntity(selectedEntity.id as string);
                setSelectedEntity(entity);
              }}
            >
              Duplicate "{selectedEntity.id}"
            </MenuItem>
            <MenuItem
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
