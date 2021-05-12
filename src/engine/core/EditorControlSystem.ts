import { Family, FamilyBuilder, System } from "../ecs";
import { Game } from "../Game";
import { TransformComponent } from "./TransformComponent";
import * as q from "../utils/quaternion";
import { m4, v3 } from "twgl.js";
import { EditorControlComponent } from "./EditorControlComponent";

const SPEED = 5;
const SPEED_MODIFIER = 4;

const USE_BLENDER_CONTROL_SCHEME = true;
const ROTATION_SPEED = 2.5;
const PAN_SPEED = 2.5;
const INITIAL_ZOOM_LEVEL = 6;
const INITIAL_CAMERA_ANGLE = [0, Math.PI / 6, -Math.PI / 8]; // euler angles

export default class EditorControlSystem extends System {
  private mainCameraEntity: Family;

  private rotXAmount = 0;
  private rotYAmount = 0;

  private rotPivotPoint: v3.Vec3 = [0, 0, 0];

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
    const scrollAmount = game.input.getAxis("scroll");
    const pointerX = game.input.getAxisChange("pointerX");
    const pointerY = game.input.getAxisChange("pointerY");

    // Rotation
    this.rotXAmount = panMode
      ? this.rotXAmount
      : this.rotXAmount + pointerX * ROTATION_SPEED * delta;

    this.rotYAmount = panMode
      ? this.rotYAmount
      : Math.max(
          Math.min(
            this.rotYAmount + pointerY * ROTATION_SPEED * delta,
            Math.PI / 2
          ),
          -Math.PI / 2
        );

    if (USE_BLENDER_CONTROL_SCHEME) {
      const speedCoefficent = SPEED * delta * PAN_SPEED;

      // Pane the camera base on the camera orientation
      if (panMode) {
        const directionVector = q.multVec3(
          q.inverse(transform.rotation),
          v3.create(-pointerX * speedCoefficent, pointerY * speedCoefficent, 0)
        );
        this.rotPivotPoint = v3.add(this.rotPivotPoint, directionVector);
      }

      // translate the camera about pivot point rotation by offset
      const cameraDist = Math.pow(
        1 / 2,
        -(INITIAL_ZOOM_LEVEL + scrollAmount * 0.0025)
      );

      // rotate the scene about origin
      let rotMatrix = m4.rotationY(
        INITIAL_CAMERA_ANGLE[1] + -this.rotXAmount * ROTATION_SPEED
      );
      rotMatrix = m4.rotateX(
        rotMatrix,
        INITIAL_CAMERA_ANGLE[2] + -this.rotYAmount * ROTATION_SPEED
      );

      // create a translation base on pivot point
      const translationMatrix = m4.translation(this.rotPivotPoint);
      const rotatedPoint = m4.transformPoint(rotMatrix, [0, 0, cameraDist]);

      transform.position = m4.transformPoint(translationMatrix, rotatedPoint);
      transform.rotation = q.mat4ToQuat(rotMatrix);

      return;
    }

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
          game.input.getAxisChange("pointerY") * speedCoefficent,
          0
        )
      );
    }

    transform.position = v3.add(transform.position, direction);
  }
}
