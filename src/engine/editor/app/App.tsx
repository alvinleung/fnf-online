import React, { useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import "./App.css";
import "./style/typography.css";
import "./style/layout.css";
import "./style/variables.css";
import "./style/form.css";
import { Panel } from "./components/Panel";
import { List } from "./components/List";
import { ListItem } from "./components/ListItem";
import { EntityInspectorHead } from "./components/EntityInspectorHead";
import { Game, GameEvent } from "../../Game";
import { Engine, Entity } from "../../ecs";
import useForceUpdate from "./hooks/useForceUpdate";
import { ComponentInspector } from "./ComponentInspector";
import { PanelGroup } from "./components/PanelGroup";
import { Modal } from "./components/Modal";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import { ComponentRegistry } from "../EditorDecorators";
import { EditorContextWrapper } from "./EditorContextWrapper";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "./Hotkeys";
import lodashCloneDeep from "lodash.clonedeep";
import useUndo from "use-undo";
import { useEditHistory, useUndoRedo } from "./EditHistory";

interface Props {
  game: Game;
}

interface EntityStateEdit {
  type: "update" | "add" | "remove";
  value: any;
  index: number; // the index at which the entity was in at the moment
}

const App = ({ game }: Props): JSX.Element => {
  const [editHistory, pushEditHistory] = useEditHistory();
  const [undo, redo] = useUndoRedo();

  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity>();

  useHotkeys(HotkeyConfig.REDO, redo, {}, [editHistory]);
  useHotkeys(HotkeyConfig.UNDO, undo, {}, [editHistory]);

  // sync the in game entities list with the Editor entities list
  const syncEditorEntityList = (game: Game) => {
    setEntities([...game.entities]);
  };

  const handleEntityListSelect = (val: string) => {
    const selectedEntity = game.getEntityById(val);
    setSelectedEntity(selectedEntity);
  };

  const forceUpdate = useForceUpdate();
  const handleEngineUpdate = useCallback(
    (game: Game, _delta: number) => {
      // force update the ui if we are inspecting a particular entity
      if (selectedEntity) forceUpdate();
    },
    [selectedEntity]
  );
  useEffect(() => {
    game.addEventListener(GameEvent.UPDATE, handleEngineUpdate);
    return () => {
      game.removeEventListener(GameEvent.UPDATE, handleEngineUpdate);
    };
  }, [selectedEntity]);

  // add and remove entity in the list when notified
  useEffect(() => {
    game.addEventListener(GameEvent.ENTITY_SELECT, (entity: Entity) => {
      if (entity) {
        setSelectedEntity(entity);
        return;
      }
      setSelectedEntity(null);
    });

    // listen to game entity changes
    game.addEventListener(GameEvent.ENTITY_LIST_CHANGE, (entitiesList: Entity[]) => {
      syncEditorEntityList(game);
    });
  }, []);

  const handleItemRemove = (entityId: string) => {
    const entityToBeRemoved = game.getEntityById(entityId);

    setSelectedEntity(null);
    const removeIndex = game.removeEntity(entityToBeRemoved);

    // add remove action to history
    pushEditHistory({
      type: "remove",
      entity: entityToBeRemoved.clone(),
      index: removeIndex,
    });

    // sync the entity list with game
    syncEditorEntityList(game);
  };

  /**
   * Logic for creating an entity
   */
  const [isCreatingEntity, setIsCreatingEntity] = useState(false);
  const [entityCreationName, setEntityCreationName] = useState("");
  const createEntity = (name: string) => {
    if (!name) return;

    const newEntity = Entity.create(name);

    // when the entity create
    game.addEntity(newEntity);

    pushEditHistory({
      type: "add",
      entity: newEntity.clone(),
      index: game.getEntityIndex(newEntity),
    });

    setIsCreatingEntity(false);
  };
  const entityNameInputRef = useRef<HTMLInputElement>();
  useEffect(() => {
    if (isCreatingEntity && entityNameInputRef.current) entityNameInputRef.current.focus();
  }, [isCreatingEntity]);

  /**
   * For component selection
   */
  const [selectedComponent, setSelectedComponent] = useState("");
  const handleComponentSelection = (component: string) => {
    setSelectedComponent(component);
  };
  const handleComponentAdd = () => {
    setSelectedComponent("New Component");
  };
  const handleComponentRemove = useCallback(() => {
    const componentClass = ComponentRegistry.getComponentClass(selectedComponent);
    // remove the current component in the
    selectedEntity.removeComponent(componentClass);
  }, [selectedEntity, selectedComponent]);

  const handleEntityDuplicate = (entityId: string) => {
    const newEntity = game.getEntityById(entityId).clone();

    const trailingNumberRegex = /\d+$/;
    const originalEntityId = newEntity.id as string;

    // check how many entity in the scene
    let finalId = originalEntityId;
    let loopCount = 1;

    // try increment the entity id until no entity occupies that name
    while (game.getEntityById(finalId)) {
      const originalEntityCountArr = originalEntityId.match(trailingNumberRegex);
      const entityCount = originalEntityCountArr && originalEntityCountArr[0];
      // if entityCount is null means that the entity doesn not use a number
      // incremental naming scheme, it is save to set nubmer 1
      const newEntityTrailingNumber = !entityCount
        ? `${loopCount}`
        : `${Number(entityCount) + loopCount}`;

      finalId = !entityCount
        ? originalEntityId + newEntityTrailingNumber
        : originalEntityId.replace(trailingNumberRegex, newEntityTrailingNumber);

      loopCount++;
    }

    newEntity.id = finalId;
    game.addEntity(newEntity);
  };

  return (
    <EditorContextWrapper
      game={game}
      selectedEntity={selectedEntity}
      selectedComponent={selectedComponent}
      setSelectedComponent={setSelectedComponent}
    >
      <PanelGroup>
        <Panel dockingSide="left" minSize={150} initialState="expanded" header="Entity List">
          <ContextMenuTrigger id="item-menu-trigger">
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
            <MenuItem divider={true} />
            <MenuItem
              data={{ action: "add-entity" }}
              onClick={() => handleEntityDuplicate(selectedEntity && (selectedEntity.id as string))}
            >
              Duplicate "{selectedEntity && selectedEntity.id}"
            </MenuItem>
            <MenuItem
              data={{ action: "remove-entity" }}
              onClick={() => {
                handleItemRemove(selectedEntity.id as string);
              }}
            >
              Remove "{selectedEntity && selectedEntity.id}"
            </MenuItem>
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
                createEntity(entityCreationName);
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
                    onChange={(e) => setEntityCreationName(e.target.value)}
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
        </Panel>
        <Panel dockingSide="right" initialState="expanded" minSize={250}>
          <ContextMenuTrigger id="entity-component-inspector">
            <div className="inspector-container">
              <EntityInspectorHead
                selectedEntity={selectedEntity && (selectedEntity.id as string)}
              />
              <ComponentInspector
                game={game}
                selectedEntity={selectedEntity}
                onSelectComponent={handleComponentSelection}
              />
              {selectedEntity && (
                <ContextMenu id="entity-component-inspector">
                  <MenuItem onClick={handleComponentAdd}>Add Component</MenuItem>

                  {selectedComponent !== "" && (
                    <>
                      <MenuItem divider={true} />
                      <MenuItem onClick={handleComponentRemove}>
                        Remove "{selectedComponent}"
                      </MenuItem>
                    </>
                  )}
                </ContextMenu>
              )}
            </div>
          </ContextMenuTrigger>
        </Panel>
      </PanelGroup>
    </EditorContextWrapper>
  );
};

export default App;
