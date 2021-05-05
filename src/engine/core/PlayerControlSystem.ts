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

  private rotXAmount = 0;
  private rotYAmount = 0;

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

    // Rotation
    this.rotXAmount += game.input.getAxisChange("yawX") * ROT_SPEED * delta;
    this.rotYAmount = Math.max(Math.min(this.rotYAmount - game.input.getAxisChange("yawY") * ROT_SPEED * delta, Math.PI / 2),-1.0);
    transform.rotation = q.fromEulerAngles(0, this.rotXAmount, 0);
    transform.rotation = q.mult(
      q.fromEulerAngles(this.rotYAmount, 0, 0),
      transform.rotation
    );

    // Translation
    const forwardSpeed = game.input.getAxisChange("foward") * SPEED * delta;
    const sideSpeed = game.input.getAxisChange("horizontal") * SPEED * delta;
    const verticalSpeed = game.input.getAxisChange("vertical") * SPEED * delta;

    const direction = q.multVec3(
      q.inverse(transform.rotation),
      v3.create(sideSpeed, verticalSpeed, forwardSpeed)
    );
    
    transform.position = v3.add(transform.position, direction);
  }
}
