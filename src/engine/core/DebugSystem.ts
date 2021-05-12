import { m4, v3 } from "twgl.js";
import MyGame from "../../MyGame";
import CameraComponent from "../camera/CameraComponent";
import { Engine, Family, FamilyBuilder, System } from "../ecs";
import { v4 } from "../utils/MatrixUtils";
import * as q from "../utils/quaternion";
import { DebugComponent } from "./DebugComponent";
import { TransformComponent } from "./TransformComponent";

export class DebugSystem extends System {
  private debugObjects: Family;
  private camera: Family;
  private elapsed: number;
  private renderCount: number;

  onAttach(engine: Engine): void {
    this.debugObjects = new FamilyBuilder(engine)
      .include(TransformComponent, DebugComponent)
      .build();

    this.camera = new FamilyBuilder(engine)
      .include(TransformComponent, CameraComponent)
      .build();

    this.elapsed = 0;
    this.renderCount = 0;
  }
  update(engine: Engine, delta: number): void {
    const debugEntity = this.debugObjects.entities[0];
    const cameraEntity = this.camera.entities[0];
    const transform = debugEntity.getComponent(TransformComponent);
    const cameraTranform = cameraEntity.getComponent(TransformComponent);

    this.renderCount++;

    const FOV = 54.4;
    const CLIP_NEAR = 1;
    const CLIP_FAR = 2000;
    const game = engine as MyGame;

    const clientwidth = game.getCanvas().width;
    const clientHeight = game.getCanvas().height;

    const perspectiveMatrix = m4.perspective(
      (FOV * Math.PI) / 180, // field of view
      clientwidth / clientHeight, // aspect ratio
      CLIP_NEAR, // nearZ: clip space properties
      CLIP_FAR // farZ: clip space properties
    );

    const negativeOffsetPos = v3.negate(cameraTranform.position);
    const cameraRotMat = m4.inverse(q.quatToMat4(cameraTranform.rotation));
    const cameraMatrix = m4.translate(cameraRotMat, negativeOffsetPos);

    this.elapsed += delta;

    let absoulteX = (game.input.getAxis("pointerX") / clientwidth) * 2 - 1;
    let absoulteY = -((game.input.getAxis("pointerY") / clientHeight) * 2 - 1);

    // Vector of the direction the camera is looking at
    let cameraFrontVector = v3.negate(
      m4
        .multiply(q.quatToMat4(cameraTranform.rotation), [0, 0, 1, 1])
        .slice(0, 3)
    );

    //https://stackoverflow.com/questions/7692988/opengl-math-projecting-screen-space-to-world-space-coords

    let screenToWorldMatrix = m4.inverse(
      m4.multiply(perspectiveMatrix, cameraMatrix)
    );
    let pos000 = v4.create(absoulteX, absoulteY, 0.0, 1.0);
    let pos001 = v4.create(absoulteX, absoulteY, -0.5, 1.0);
    let point000 = v4.xyz(v4.multiplyVec4Mat4(pos000, screenToWorldMatrix));
    let point001 = v4.xyz(v4.multiplyVec4Mat4(pos001, screenToWorldMatrix));
    let direction = v3.normalize(v3.subtract(point000, point001));

    //let output = m4.multiply(transform.getMatrix(),pos);
    if (this.renderCount % 30 == 0) {
      //console.log(point);
      //console.log(absoulteX,absoulteY);
      //console.log("cameraFront:", roundVec3(cameraFrontVector,1),"\nscreenFront:\n",roundVec3(direction,1));
      return;
      positionDirectionPlaneIntersect(cameraTranform.position, direction);
    }
  }
}

function positionDirectionPlaneIntersect(
  position: v3.Vec3,
  direction: v3.Vec3
) {
  if (direction[1] >= 0) {
    console.log("direction pointing at sky");
    return;
  }
  //const normalizedDirection = v3.normalize(direction);
  let multiplier = Math.abs(position[1] / direction[1]);
  let destination = v3.add(v3.mulScalar(direction, multiplier), position);
  let roundedDestination = roundVec3(destination, 0);
  console.log(
    "x:" +
      roundedDestination[0] +
      ", y:" +
      roundedDestination[1] +
      ", z:" +
      roundedDestination[2]
  );
}

function roundVec3(vector: v3.Vec3, decimalPlaces: number) {
  let factor = Math.pow(10, decimalPlaces);
  let x = Math.round(vector[0] * factor) / factor;
  let y = Math.round(vector[1] * factor) / factor;
  let z = Math.round(vector[2] * factor) / factor;
  return v3.create(x, y, z);
}
