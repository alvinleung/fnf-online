import { Family, FamilyBuilder, System } from "../ecs";
import { Game } from "../Game";
import { TransformComponent } from "./TransformComponent";
import * as q from "../utils/quaternion";
import { m4, v3 } from "twgl.js";
import { EditorControlComponent } from "./EditorControlComponent";
import { clamp } from "../utils/MathUtils";

const SPEED = 5;
const SPEED_MODIFIER = 4;

const USE_BLENDER_CONTROL_SCHEME = true;
const ROTATION_SPEED = 2.5;
const PAN_SPEED = 2.5;
const INITIAL_ZOOM_LEVEL = 3.5;
const INITIAL_CAMERA_ANGLE = [0, Math.PI / 6, -Math.PI / 8]; // euler angles

export default class EditorControlSystem extends System {
  private mainCameraEntity: Family;

  private rotXAmount = -INITIAL_CAMERA_ANGLE[1];
  private rotYAmount = -INITIAL_CAMERA_ANGLE[2];
  private scrollAmount = 0;

  private rotPivotPoint: v3.Vec3 = [0, 0, 0];

  private useTrackpad = false;

  onAttach(game: Game) {
    this.mainCameraEntity = new FamilyBuilder(game)
      .include(EditorControlComponent, TransformComponent)
      .build();
  }
  update(game: Game, delta: number): void {
    // assuming there is only one Editor in the scene
    if (!this.mainCameraEntity.entities || this.mainCameraEntity.entities.length === 0) return;

    const cameraEntity = this.mainCameraEntity.entities[0];
    const transform = cameraEntity.getComponent(TransformComponent);

    const panMode = game.input.isActive("editor:pan");

    const mouseScrollChange = game.input.getAxisChange("editor:mouse-zoom");
    const trackpadScrollChange = game.input.getAxisChange("editor:trackpad-zoom");

    const trackpadXChange = game.input.getAxisChange("editor:trackpad-x");
    const trackpadYChange = game.input.getAxisChange("editor:trackpad-y");
    const mouseXChange = game.input.getAxisChange("editor:mouse-x");
    const mouseYChange = game.input.getAxisChange("editor:mouse-y");

    const mouseXPosition = game.input.getAxis("editor:mouse-x");

    if (!this.useTrackpad && trackpadXChange !== 0) {
      this.useTrackpad = true;
    }
    if (this.useTrackpad && mouseXChange !== 0) {
      this.useTrackpad = false;
    }

    const pointerX = this.useTrackpad ? trackpadXChange : mouseXChange;
    const pointerY = this.useTrackpad ? trackpadYChange : mouseYChange;

    const scrollChange = this.useTrackpad ? trackpadScrollChange : mouseScrollChange;

    this.scrollAmount += scrollChange;

    // Rotation
    this.rotXAmount = panMode
      ? this.rotXAmount
      : this.rotXAmount + pointerX * ROTATION_SPEED * delta;

    this.rotYAmount = panMode
      ? this.rotYAmount
      : clamp(this.rotYAmount + pointerY * ROTATION_SPEED * delta, -Math.PI/2, Math.PI/2);

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
    const cameraDist = Math.pow(1 / 2, -(INITIAL_ZOOM_LEVEL + this.scrollAmount * 0.0025));

    // rotate the scene about origin
    let rotMatrix = m4.rotationY( -this.rotXAmount );
    rotMatrix = m4.rotateX(rotMatrix, -this.rotYAmount);

    // create a translation base on pivot point
    const translationMatrix = m4.translation(this.rotPivotPoint);
    const rotatedPoint = m4.transformPoint(rotMatrix, [0, 0, cameraDist]);

    transform.position = m4.transformPoint(translationMatrix, rotatedPoint);
    transform.rotation = q.mat4ToQuat(rotMatrix);
  }
}
