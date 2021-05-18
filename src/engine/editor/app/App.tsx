import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import "./style/typography.css";
import "./style/layout.css";
import "./style/variables.css";
import "./style/form.css";
import { Panel } from "./components/Panel";
import { List } from "./components/List";
import { ListItem } from "./components/List/ListItem";
import { EntityInspectorHead } from "./components/EntityInspectorHead";
import { Game, GameEvent } from "../../Game";
import { Engine, Entity } from "../../ecs";
import { ComponentInspector } from "./ComponentInspector";
import { PanelGroup } from "./components/Panel/PanelGroup";
import { Modal } from "./components/Modal";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import { EditorContextWrapper } from "./EditorContextWrapper";
import { useFileDrop } from "./components/FileDrop/useFileDrop";
import { useFileSave } from "./components/FileDrop/useFileSave";
import { useEntityEditing } from "./hooks/useEntityEditing";
import useEagerUpdate from "./hooks/GameEngineCommunication/useEagerUpdate";
import useEditorHotkeys from "./hooks/useEditorHotkeys";
import useTriggerViewportContextMenu from "./hooks/GameEngineCommunication/useTriggerViewportContextMenu";
import { EntityListView } from "./components/EntityListView";

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

  const { duplicateEntity, createEntity, deleteEntity, removeComponent } = useEntityEditing(game);

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

  const entityContextMenuTriggerRef = useTriggerViewportContextMenu();

  return (
    <EditorContextWrapper
      game={game}
      entities={entities}
      setSelectedEntity={setSelectedEntity}
      selectedEntity={selectedEntity}
      selectedComponent={selectedComponent}
      setSelectedComponent={setSelectedComponent}
    >
      <PanelGroup>
        <Panel dockingSide="left" minSize={150} initialState="expanded" header="Entity List">
          <EntityListView syncEditorEntityList={syncEditorEntityList} />
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
            </div>
          </ContextMenuTrigger>
        </Panel>
      </PanelGroup>
    </EditorContextWrapper>
  );
};

export default App;
