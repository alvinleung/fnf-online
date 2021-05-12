/**
 * 3d Objects types
 * a Sphere object with dimension 2x2x2(model units) centered at 0,0,0
 *
 */
import { RenderableObject } from "../../Renderable";
import { primitives } from "twgl.js";
import { Instantiable } from "../../../editor";

@Instantiable("RenderableObject")
export class Sphere extends RenderableObject {
  constructor() {
    const radius = 1;
    const subDAxis = 15;
    const subDHeight = 15;

    const sphereVerticesIndexed = primitives.createSphereVertices(radius, subDAxis, subDHeight);

    const sphereVertices = primitives.deindexVertices(sphereVerticesIndexed);
    console.log(sphereVertices);

    // TypedArray includes data of position, indices, normals, texcoords
    super([...sphereVertices.position], null, null);
  }
}
