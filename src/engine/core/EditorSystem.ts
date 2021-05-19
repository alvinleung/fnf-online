import { m4, v3 } from "twgl.js";
import { Entity } from "../ecs/Entity";
import { Family, FamilyBuilder } from "../ecs/Family";
import { System } from "../ecs/System";
import { Game, GameEvent } from "../Game";
import { RenderableComponent } from "../graphics/Renderable";
import { RenderingConfig } from "../graphics/RenderingSystem";
import { cameraMatrixFromTransform, v4 } from "../utils/MatrixUtils";
import { RayTriangle } from "../utils/RayTriangle";

import { EditorControlComponent } from "./EditorControlComponent";
import { SelectableComponent } from "./SelectionSystem";
import { TransformComponent } from "./TransformComponent";

export default class EditorSystem extends System {
  private editorCameras: Family;
  private systemRenderables: Family;

  onAttach(game: Game) {
    this.editorCameras = new FamilyBuilder(game)
      .include(EditorControlComponent, TransformComponent)
      .build();
    this.systemRenderables = new FamilyBuilder(game).include(RenderableComponent).build();
  }
  update(game: Game, delta: number): void {
    let clicked =
      game.input.wasClicked("editor:mouse-right") || game.input.wasClicked("editor:mouse-left");

    if (clicked) {
      let targetEntity = this.castRayOnCursor(game);
      game.fireEvent(GameEvent.ENTITY_SELECT, targetEntity);

      if(targetEntity){
        if(targetEntity.hasComponent(SelectableComponent)){
          targetEntity.getComponent(SelectableComponent).isSelected = true;
        }
      }
    }
  }

  private castRayOnCursor(game: Game): Entity {
    // set up required variables
    const mainCamera = this.editorCameras.entities[0];
    if (!mainCamera) return;
    const clientwidth = game.getCanvas().width;
    const clientHeight = game.getCanvas().height;
    const aspectRatio = clientwidth / clientHeight;
    const perspectiveMatrix = RenderingConfig.getPerspectiveMatrix(aspectRatio);
    const cameraTransform = mainCamera.getComponent(TransformComponent);
    const cameraMatrix = cameraMatrixFromTransform(cameraTransform);

    const screenX = (game.input.getAxis("pointerX") / clientwidth) * 2 - 1;
    const screenY = -((game.input.getAxis("pointerY") / clientHeight) * 2 - 1);

    // calculate cursor direction vector
    const screenToWorldMatrix = m4.inverse(m4.multiply(perspectiveMatrix, cameraMatrix));
    const normalizedDevicePoint0 = v4.create(screenX, screenY, 0.0, 1.0);
    const normalizedDevicePoint1 = v4.create(screenX, screenY, -0.5, 1.0);
    const worldPoint0 = v4.xyz(v4.multiplyVec4Mat4(normalizedDevicePoint0, screenToWorldMatrix));
    const worldPoint1 = v4.xyz(v4.multiplyVec4Mat4(normalizedDevicePoint1, screenToWorldMatrix));
    const direction = v3.normalize(v3.subtract(worldPoint0, worldPoint1));

    let targetEntity = null;
    let minlength = Number.MAX_VALUE;

    // cast ray onto the world with direction and cameraPosition
    this.systemRenderables.entities.forEach((renderableEntity) => {
      const renderableObject = renderableEntity.getComponent(RenderableComponent).renderableObject;
      const vertices = renderableObject.objectCoords;
      const objectTransform = renderableObject.transform;

      for (var i = 0; i < vertices.length; i += 9) {
        if (!vertices[i + 8] && vertices[i + 8] != 0) {
          break;
        }

        // TODO: can optimize, is actually matrix operation
        let vert1 = v4.create(vertices[i], vertices[i + 1], vertices[i + 2], 1.0);
        let vert2 = v4.create(vertices[i + 3], vertices[i + 4], vertices[i + 5], 1.0);
        let vert3 = v4.create(vertices[i + 6], vertices[i + 7], vertices[i + 8], 1.0);
        vert1 = v4.multiplyVec4Mat4(vert1, objectTransform);
        vert2 = v4.multiplyVec4Mat4(vert2, objectTransform);
        vert3 = v4.multiplyVec4Mat4(vert3, objectTransform);

        let triangle = RayTriangle.createTriangle(v4.xyz(vert1), v4.xyz(vert2), v4.xyz(vert3));

        /*
        // calculating seperately is faster with ratio 3 times more frequently at the moment
        // so chose seperately, might change with GPU optimization
        let vertMatRaw = [
          vertices[ i ], vertices[i+1], vertices[i+2], 1.0,
          vertices[i+3], vertices[i+4], vertices[i+5], 1.0,
          vertices[i+6], vertices[i+7], vertices[i+8], 1.0,
          0.0,0.0,0.0,1.0]
        let vertMat = m4.multiply(objectTransform,vertMatRaw);
        //loginfo = "matrix: " + vertMat + "\n" +[...vert1,...vert2,...vert3] + "\nvert1:" + vert1 + "\nvert2:" + vert2+ "\nvert3:" + vert3 ;

        let triangle2 = RayTriangle.createTriangle(
          [vertMat[0],vertMat[1],vertMat[2]],
          [vertMat[4],vertMat[5],vertMat[6]],
          [vertMat[8],vertMat[9],vertMat[10]],
          );
          */

        let rayLength = RayTriangle.intersect(cameraTransform.position, direction, triangle);

        if (rayLength) {
          // not null
          if (rayLength < minlength) {
            targetEntity = renderableEntity;
            minlength = rayLength;
          }
        }
      }
    });

    return targetEntity;
  }
}
