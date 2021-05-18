import React, { useEffect } from "react";
import { Entity } from "../../../../ecs";
import { Game, GameEvent } from "../../../../Game";

export default function useEntityListUpdate(
  game: Game,
  setSelectedEntity: React.Dispatch<React.SetStateAction<Entity>>,
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>
) {
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
      setEntities([...game.entities]);
    });
  }, []);
}
