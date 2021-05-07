import { Family, FamilyBuilder, System } from "../ecs";
import { Game } from "../Game";
import { TransformComponent } from "./TransformComponent";
import * as q from "../utils/quaternion";
import { v3 } from "twgl.js";
import { EditorControlComponent } from "./EditorControlComponent";

const SPEED = 5;
const SPEED_MODIFIER = 4;
const ROT_SPEED = 2;

export default class EditorControlSystem extends System {
  private mainCameraEntity: Family;

  private rotXAmount = 0;
  private rotYAmount = 0;

  onAttach(game: Game) {
    this.mainCameraEntity = new FamilyBuilder(game)
      .include(EditorControlComponent, TransformComponent)
      .build();
  }
  update(game: Game, delta: number): void {
    // assuming there is only one Editor in the scene
    if (
      !this.mainCameraEntity.entities ||
      this.mainCameraEntity.entities.length === 0
    )
      return;

    const cameraEntity = this.mainCameraEntity.entities[0];

    const transform = cameraEntity.getComponent(TransformComponent);

    const panMode = game.input.isActive("editor:pan");

    // Rotation
    this.rotXAmount = panMode
      ? this.rotXAmount
      : this.rotXAmount + game.input.getAxisChange("pointerX") * ROT_SPEED * delta;

    this.rotYAmount = panMode
      ? this.rotYAmount
      : Math.max(
          Math.min(
            this.rotYAmount +
              game.input.getAxisChange("pointerY") * ROT_SPEED * delta,
            Math.PI / 2
          ),
          -Math.PI / 2
        );

    transform.rotation = q.fromEulerAngles(0, this.rotXAmount, 0);
    transform.rotation = q.mult(
      q.fromEulerAngles(this.rotYAmount, 0, 0),
      transform.rotation
    );

    // Translation
    const hoveMode = false; //game.input.isActive("hoverMode");
    const speedMode = game.input.isActive("speedMode");
    const speedCoefficent = SPEED * delta * (speedMode ? SPEED_MODIFIER : 1);
    const forwardSpeed = game.input.getAxisChange("foward") * speedCoefficent;
    const sideSpeed = game.input.getAxisChange("horizontal") * speedCoefficent;
    const verticalSpeed =
      game.input.getAxisChange("vertical") * speedCoefficent;

    let direction: any;
    if (hoveMode) {
      direction = q.multVec3(
        q.inverse(transform.rotation),
        v3.create(sideSpeed, verticalSpeed, forwardSpeed)
      );
    } else {
      direction = v3.create(0, verticalSpeed, 0);
      direction = v3.add(
        q.multVec3(
          q.inverse(q.fromEulerAngles(0, this.rotXAmount, 0)),
          v3.create(sideSpeed, 0, forwardSpeed)
        ),
        direction
      );
    }

    // Translation with mouse
    if (panMode) {
      direction = direction = q.multVec3(
        q.inverse(transform.rotation),
        v3.create(
          -game.input.getAxisChange("pointerX") * speedCoefficent,
          -game.input.getAxisChange("pointerY") * speedCoefficent,
          0
        )
      );
    }

    transform.position = v3.add(transform.position, direction);
  }
}
