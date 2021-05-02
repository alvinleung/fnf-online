import { Family, FamilyBuilder, System } from "../ecs";
import { Game } from "../Game";
import { PlayerControlComponent } from "./PlayerControlComponent";
import { TransformComponent } from "./TransformComponent";
import * as q from "../utils/quaternion";
import { v3 } from "twgl.js";

const SPEED = 5;
const ROT_SPEED = 2;

export default class PlayerControlSystem extends System {
  private playerEntity: Family;

  private rotAmount = 0;

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

    this.rotAmount += game.input.getAxis("yawX") * ROT_SPEED * delta;
    transform.rotation = q.fromAxisAndAngle(q.Y_AXIS, this.rotAmount);

    const forwardSpeed = game.input.getAxis("vertical") * SPEED * delta;
    const sideSpeed = game.input.getAxis("horizontal") * SPEED * delta;
    const direction = q.multVec3(
      q.inverse(transform.rotation),//transform.rotation,//
      v3.create(sideSpeed, 0, forwardSpeed)
    );

    // transform.z += forwardSpeed;
    transform.position = v3.add(transform.position, direction);

    //console.log(game.input.getAxis("yawY"));

    // transform.rotationY += game.input.getAxis("horizontal") * SPEED * delta;

    //console.log(this.playerEntity.entities)

    // const triangleEntity = this.playerEntity.entities[1];
    // const triangleTransform = triangleEntity.getComponent(TransformComponent);
    // triangleTransform.rotationZ += game.input.getAxis("yawX") * 10 * delta;
    // triangleTransform.rotationX += game.input.getAxis("yawY") * 10 * delta;
  }
}
