import { Entity, Component } from "../ecs";
import Game from "../Game";

export default abstract class ObjectRenderer implements Component {
  // renderer
  public abstract render(entity: Entity, engine: Game, delta: number);
}
