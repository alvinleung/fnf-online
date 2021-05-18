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
import { useEditHistory, useUndoRedo } from "./EditHistory";

import { downloadFile } from "../../utils/DownloadFile";
import { TransformComponent } from "../../core/TransformComponent";
import { EditorServerIO } from "../EditorServerIO";
import { AssetExplorer } from "./components/AssetExplorer/AssetExplorer";
import { useFileDrop } from "./components/FileDrop/useFileDrop";
import { useFileSave } from "./components/FileDrop/useFileSave";
import { useEntityEditing } from "./hooks/useEntityEditing";
import useEagerUpdate from "./hooks/GameEngineCommunication/useEagerUpdate";
import useEditorHotkeys from "./hooks/useEditorHotkeys";

interface Props {
  game: Game;
}

const EAGER_ENGINE_REFRESH = false;

const App = ({ game }: Props): JSX.Element => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity>();

  useFileDrop(game);
  useFileSave(game);
  useEditorHotkeys(game, selectedEntity, setSelectedEntity);

  // sync the in game entities list with the Editor entities list
  const syncEditorEntityList = (game: Game) => {
    setEntities([...game.entities]);
  };

  const handleEntityListSelect = (val: string) => {
    const selectedEntity = game.getEntityById(val);
    setSelectedEntity(selectedEntity);
  };

  /**
   * Engine communication functionalities
   */
  useEagerUpdate(game, selectedEntity, EAGER_ENGINE_REFRESH);

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

  const { duplicateEntity, createEntity, deleteEntity } = useEntityEditing(game);

  const handleItemRemove = (entityId: string) => {
    deleteEntity(entityId);

    // sync the entity list with game
    syncEditorEntityList(game);
    setSelectedEntity(null);
  };

  /**
   * Logic for creating an entity
   */
  const [isCreatingEntity, setIsCreatingEntity] = useState(false);
  const [entityCreationName, setEntityCreationName] = useState("");
  const handleEntityCreation = (name: string) => {
    if (!name) return;

    const newEntity = createEntity(name);
    setIsCreatingEntity(false);
    setSelectedEntity(newEntity);
  };

  const entityNameInputRef = useRef<HTMLInputElement>();
  useEffect(() => {
    if (isCreatingEntity && entityNameInputRef.current) {
      setEntityCreationName("");
      entityNameInputRef.current.focus();
    }
  }, [isCreatingEntity]);

  /**
   * For component selection
   */
  const [selectedComponent, setSelectedComponent] = useState("");
  const handleComponentSelection = useCallback((component: string) => {
    setSelectedComponent(component);
  }, []);

  const handleComponentAdd = () => {
    setSelectedComponent("New Component");
  };

  const [editHistory, pushEditHistory] = useEditHistory();
  const handleComponentRemove = useCallback(() => {
    const componentClass = ComponentRegistry.getComponentClass(selectedComponent);
    // remove the current component in the
    selectedEntity.removeComponent(componentClass);

    pushEditHistory({
      type: "componentRemove",
      entity: selectedEntity,
      component: componentClass,
    });
  }, [selectedEntity, selectedComponent]);

  /**
   * Hacky way to allow context menu click in the game viewport
   */
  const entityContextMenuTriggerRef = useRef();
  useEffect(() => {
    const gameViewportContainer = document.querySelector("#game");
    const handleMenu = (e) => {
      //@ts-ignore
      entityContextMenuTriggerRef.current.handleContextClick(e);
    };
    gameViewportContainer.addEventListener("contextmenu", handleMenu);
    return () => {
      gameViewportContainer.removeEventListener("contextmenu", handleMenu);
    };
  }, []);

  return (
    <EditorContextWrapper
      game={game}
      setSelectedEntity={setSelectedEntity}
      selectedEntity={selectedEntity}
      selectedComponent={selectedComponent}
      setSelectedComponent={setSelectedComponent}
    >
      <PanelGroup>
        <Panel dockingSide="left" minSize={150} initialState="expanded" header="Entity List">
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
