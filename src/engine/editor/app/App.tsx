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

interface Props {
  game: Game;
}

const EAGER_ENGINE_REFRESH = false;

const App = ({ game }: Props): JSX.Element => {
  const [editHistory, pushEditHistory] = useEditHistory();
  const [undo, redo] = useUndoRedo();

  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity>();

  useHotkeys(HotkeyConfig.REDO, redo, {}, [editHistory]);
  useHotkeys(HotkeyConfig.UNDO, undo, {}, [editHistory]);

  useHotkeys(HotkeyConfig.SAVE, (e) => {
    e.preventDefault();
    const serializedScene = game.saveScene();
    downloadFile(serializedScene, "Scene.json", "application/json");
  });

  // for scene file drop
  useEffect(() => {
    const dropArea = document.querySelector("body");

    const handleDragOver = (event) => {
      event.stopPropagation();
      event.preventDefault();
      // Style the drag-and-drop as a "copy file" operation.
      event.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (event) => {
      event.stopPropagation();
      event.preventDefault();
      const fileList = event.dataTransfer.files;
      const sceneFile = fileList[0];

      // yet it is working
      // EditorServerIO.getInstance().writeFile(`./sceneData/${sceneFile.name}`, sceneFile);

      // typecheck the scene file
      if (sceneFile.type && !sceneFile.type.startsWith("application/json")) {
        console.log("File is not a text/json file.", sceneFile.type, sceneFile);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => game.loadScene(reader.result as string);
      reader.onerror = () => console.log(reader.error);

      reader.readAsText(sceneFile);
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, []);

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

  // sync the in game entities list with the Editor entities list
  const syncEditorEntityList = (game: Game) => {
    setEntities([...game.entities]);
  };

  const handleEntityListSelect = (val: string) => {
    const selectedEntity = game.getEntityById(val);
    setSelectedEntity(selectedEntity);
  };

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (!selectedEntity) return;

    // when selected entity, it forces the editor to keep up with the game state
    const handleEngineUpdate = (game: Game, _delta: number) => {
      // force update the ui if we are inspecting a particular entiy
      EAGER_ENGINE_REFRESH && forceUpdate();
    };

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
      // console.log(entitiesList);
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

    // add transform component
    newEntity.useComponent(TransformComponent);

    // when the entity create
    game.addEntity(newEntity);

    pushEditHistory({
      type: "add",
      entity: newEntity.clone(),
      index: game.getEntityIndex(newEntity),
    });

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

  const duplicateEntity = (entityId: string) => {
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

    console.log(game.getEntityById(finalId));

    newEntity.id = finalId;
    game.addEntity(newEntity);

    pushEditHistory({
      type: "add",
      entity: newEntity.clone(),
      index: game.getEntityIndex(newEntity),
    });

    return newEntity;
  };

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
