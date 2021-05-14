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
    const game = engine as MyGame;


    let scaleX = (Math.sin(this.renderCount / 30) ) ;
    let scaleY = (Math.sin((this.renderCount + 60) / 30) ) ;
    let scaleZ = (Math.sin((this.renderCount + 120) / 30) ) ;

    //transform.scale = [scaleX,scaleY,scaleZ]


    //https://stackoverflow.com/questions/7692988/opengl-math-projecting-screen-space-to-world-space-coords

    //let output = m4.multiply(transform.getMatrix(),pos);
    if (this.renderCount % 30 == 0) {
      //console.log(point);
      //console.log(absoulteX,absoulteY);
      //console.log("cameraFront:", roundVec3(cameraFrontVector,1),"\nscreenFront:\n",roundVec3(direction,1));
      return;
    
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
