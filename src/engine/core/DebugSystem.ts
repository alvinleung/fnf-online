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
  private elapsed:number;
  private renderCount:number;
    
  onAttach(engine: Engine): void {
    this.debugObjects = new FamilyBuilder(engine)
    .include(TransformComponent,DebugComponent)
    .build();
    
    this.camera = new FamilyBuilder(engine)
    .include(TransformComponent,CameraComponent)
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

    //transform.position = v3.add(transform.position, v3.create(0,delta,0));
    //cameraTranform.position = v3.add(cameraTranform.position, v3.create(1,0,0))
    //console.log(cameraTranform.position);

    /*
    transform.rotation = q.slerp(
      q.fromAxisAndAngle(q.X_AXIS,0),
      q.fromAxisAndAngle(q.X_AXIS,Math.PI / 2),
      this.elapsed * 1
    );*/

    let absoulteX = (game.input.getAxis("yawX") / clientwidth) * 2 - 1;
    let absoulteY = (game.input.getAxis("yawY") / clientHeight) * 2 - 1;
    
    let mousePos = cameraTranform.getPosition();
    let offset = q.multVec3(
      q.inverse(cameraTranform.rotation),
      v3.create(absoulteX, - absoulteY,0)
    );

    mousePos = v3.add(mousePos, offset)
    let look = m4.lookAt(transform.getPosition(),mousePos,v3.create(0,1,0));
    //transform.position = offset;
    transform.rotation = q.mult( 
      q.fromAxisAndAngle(q.X_AXIS,Math.PI / 2),
      q.mat4ToQuatv2(look)
    );

    // Vector of the direction the camera is looking at
    let cameraFrontVector = v3.negate( m4.multiply( q.quatToMat4(cameraTranform.rotation), [0,0,1,1]).slice(0,3) );
    
    //https://stackoverflow.com/questions/7692988/opengl-math-projecting-screen-space-to-world-space-coords
    let pos = v4.create( 0.0, 0.0, 0.0, 1.0 );
    let screenToWorldMatrix = m4.inverse( m4.multiply(perspectiveMatrix,cameraMatrix) );
    let point = v4.xyz( v4.multiplyVec4Mat4(pos,screenToWorldMatrix) );

    //let output = m4.multiply(transform.getMatrix(),pos);
    if(this.renderCount % 30 == 0){
      console.log(point);
      //console.log(absoulteX,absoulteY);
      positionDirectionPlaneIntersect(
        cameraTranform.position,
        cameraFrontVector
        );
    }
  }

}

function positionDirectionPlaneIntersect(position: v3.Vec3,direction: v3.Vec3){

  if(direction[1] >= 0){
    console.log("direction pointing at sky")
    return;
  }
  //const normalizedDirection = v3.normalize(direction);
  let multiplier = Math.abs(position[1] / direction[1]);
  let destination = v3.add(v3.mulScalar(direction,multiplier), position);
  let roundedDestination = roundVec3(destination);
  //console.log("x:" + roundedDestination[0] + ", z:" + roundedDestination[2]);
}

function roundVec3(vector:v3.Vec3){
  let x = Math.round( vector[0] );
  let y = Math.round( vector[1] );
  let z = Math.round( vector[2] );
  return v3.create(x,y,z);
}
