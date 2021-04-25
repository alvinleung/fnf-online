import { Vector3 } from "three";
import Game from "../Game";
import GameScene from "../GameScene";

let __entityCounter__ = 0;

abstract class Entity {
  public readonly id: string;
  protected position: Vector3 = new Vector3(0, 0, 0);

  constructor(instanceId?: string) {
    this.id = instanceId || "entity-instance-" + __entityCounter__; // OK
    __entityCounter__++;
  }

  // init here
  public abstract onEntityDidMount(game: Game, scene: GameScene);

  // destroy here
  public abstract onEntityWillUnmount(game: Game, scene: GameScene);

  public abstract onUpdate(game: Game, scene: GameScene);
  public abstract onRender(game: Game, scene: GameScene);
}

export default Entity;
