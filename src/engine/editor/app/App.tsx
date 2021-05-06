import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import "./style/typography.css";
import "./style/layout.css";
import "./style/variables.css";
import { Panel } from "./components/Panel";
import { List } from "./components/List";
import { ListItem } from "./components/ListItem";
import { EntityInspectorHead } from "./components/EntityInspectorHead";
import { Game } from "../../Game";
import { Entity } from "../../ecs";
import useForceUpdate from "./hooks/useForceUpdate";
import { ComponentInspector } from "./ComponentInspector";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "./Hotkeys";
import { PanelGroup } from "./components/PanelGroup";

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

  return (
    <PanelGroup>
      <Panel dockingSide="left">
        <List onSelect={handleEntityListSelect}>
          {game.entities.map((entity, index) => {
            return (
              <ListItem value={entity.id as string} key={index}>
                {entity.id as string}
              </ListItem>
            );
          })}
        </List>
      </Panel>
      <Panel dockingSide="right">
        <EntityInspectorHead
          selectedEntity={selectedEntity && (selectedEntity.id as string)}
        />
        <ComponentInspector game={game} selectedEntity={selectedEntity} />
      </Panel>
    </PanelGroup>
  );
};

export default App;
