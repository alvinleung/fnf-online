/**
 * 3d Objects types
 * a Sphere object with dimension 2x2x2(model units) centered at 0,0,0
 *
 */
import { RenderableObject } from "../../Renderable";
import { primitives } from "twgl.js";
import { InstantiableObject } from "../../../editor";

@InstantiableObject([])
export class Sphere extends RenderableObject {
  constructor() {
    const radius = 1;
    const subDAxis = 2;
    const subDHeight = 2;

    const sphereVertices: any = primitives.createSphereVertices(
      radius,
      subDAxis,
      subDHeight
    );

    // TypedArray includes data of position, indices, normals, texcoords
    super(
      sphereVertices.position,
      sphereVertices.texcoords,
      null,
      sphereVertices.position
    );
  }
}
