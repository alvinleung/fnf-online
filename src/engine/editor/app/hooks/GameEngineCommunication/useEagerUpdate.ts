import { useEffect, useState } from "react";
import { Entity } from "../../../../ecs";
import { Game, GameEvent } from "../../../../Game";
import useForceUpdate from "../useForceUpdate";

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
