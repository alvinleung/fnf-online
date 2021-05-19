import { useEffect, useState } from "react";
import { Entity } from "../../../../ecs";
import { Game, GameEvent } from "../../../../Game";
import useForceUpdate from "../useForceUpdate";

/**
 * Optional entity eager update. By enabling entity eager update, the game
 * will poll the entity list in the game whe inspecting a particular entity.
 * By default, the editor won't be notified whether the entities in the
 * game has changed or not.
 *
 * @param game
 * @param selectedEntity
 * @param eagerInitialValue
 * @returns
 */
export default function useEagerUpdate(
  game: Game,
  selectedEntity: Entity,
  eagerInitialValue: boolean
) {
  const forceUpdate = useForceUpdate();
  const [eager, setEager] = useState(eagerInitialValue);

  useEffect(() => {
    if (!selectedEntity) return;

    // when selected entity, it forces the editor to keep up with the game state
    const handleEngineUpdate = (game: Game, _delta: number) => {
      // force update the ui if we are inspecting a particular entiy
      eager && forceUpdate();
    };

    game.addEventListener(GameEvent.UPDATE, handleEngineUpdate);
    return () => {
      game.removeEventListener(GameEvent.UPDATE, handleEngineUpdate);
    };
  }, [selectedEntity]);

  return setEager;
}
