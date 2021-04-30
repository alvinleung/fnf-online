import { Family, FamilyBuilder, System } from "../ecs";
import { Game } from "../Game";
import { PlayerControlComponent } from "./PlayerControlComponent";
import { TransformComponent } from "./TransformComponent";

const SPEED = 1;
export default class PlayerControlSystem extends System {
  private playerEntity: Family;

  private t = 0;

  onAttach(game: Game) {
    this.playerEntity = new FamilyBuilder(game)
      .include(PlayerControlComponent, TransformComponent)
      .build();
  }
  update(game: Game, delta: number): void {
    // assuming there is only one player entity in the scene
    if (!this.playerEntity.entities || this.playerEntity.entities.length === 0)
      return;

    const playerEntity = this.playerEntity.entities[0];

    const transform = playerEntity.getComponent(TransformComponent);

    // transform.rotate(game.input.isActive("attack") ? 1 * delta : 0);
    // mutate the player speed state
    transform.z += game.input.getAxis("vertical") * SPEED * delta;
    transform.rotationY += game.input.getAxis("horizontal") * SPEED * delta;

    //console.log(this.playerEntity.entities)

    // const triangleEntity = this.playerEntity.entities[1];
    // const triangleTransform = triangleEntity.getComponent(TransformComponent);
    // triangleTransform.rotationZ += game.input.getAxis("yawX") * 10 * delta;
    // triangleTransform.rotationX += game.input.getAxis("yawY") * 10 * delta;
  }
}
