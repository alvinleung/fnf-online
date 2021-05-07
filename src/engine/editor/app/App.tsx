import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import "./style/typography.css";
import "./style/layout.css";
import "./style/variables.css";
import "./style/form.css";
import { Panel } from "./components/Panel";
import { List } from "./components/List";
import { ListItem } from "./components/ListItem";
import { EntityInspectorHead } from "./components/EntityInspectorHead";
import { Game } from "../../Game";
import { Engine, Entity } from "../../ecs";
import useForceUpdate from "./hooks/useForceUpdate";
import { ComponentInspector } from "./ComponentInspector";
import { PanelGroup } from "./components/PanelGroup";
import { Modal } from "./components/Modal";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";

interface Props {
  game: Game;
}

const App = ({ game }: Props): JSX.Element => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity>();

  const handleEntityAdded = (entity: Entity) => {
    setEntities([...entities, entity]);
  };
  const handleEntityRemoved = (entity: Entity) => {
    setEntities(entities.splice(entities.indexOf(entity), 1));
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
    game.onUpdate(handleEngineUpdate);
  }, [selectedEntity]);

  // add and remove entity in the list when notified
  useEffect(() => {
    game.addEntityListener({
      onEntityAdded: handleEntityAdded,
      onEntityRemoved: handleEntityRemoved,
    });
  }, []);

  const handleItemRemove = (entityId: string) => {
    setSelectedEntity(null);
    game.removeEntity(game.getEntityById(entityId));
  };
  const [isCreatingEntity, setIsCreatingEntity] = useState(false);
  const [entityCreationName, setEntityCreationName] = useState("");
  const createEntity = (name: string) => {
    // when the entity create
    game.addEntity(Entity.create(name));
    setIsCreatingEntity(false);
  };

  return (
    <PanelGroup>
      <Panel
        dockingSide="left"
        minSize={150}
        initialState="expanded"
        header="Entity List"
      >
        <ContextMenuTrigger id="item-menu-trigger">
          <List
            onSelect={handleEntityListSelect}
            onItemRemove={handleItemRemove}
          >
            {game.entities.map((entity, index) => {
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
            data={{ action: "remove-entity" }}
            onClick={() => {
              handleItemRemove(selectedEntity.id as string);
            }}
          >
            Remove Entity
          </MenuItem>
        </ContextMenu>

        <Modal
          show={isCreatingEntity}
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
            <h2>Create an Entity</h2>
            <label className="field">
              Entity Name
              <input
                type="text"
                value={entityCreationName}
                onChange={(e) => setEntityCreationName(e.target.value)}
              />
            </label>
            <button type="submit">Create</button>
          </form>
        </Modal>
      </Panel>

      <Panel dockingSide="right" initialState="expanded" minSize={250}>
        <EntityInspectorHead
          selectedEntity={selectedEntity && (selectedEntity.id as string)}
        />
        <ComponentInspector game={game} selectedEntity={selectedEntity} />
      </Panel>
    </PanelGroup>
  );
};

export default App;
