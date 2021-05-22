/**
 * 3d Objects types
 * a Sphere object with dimension 2x2x2(model units) centered at 0,0,0
 *
 */
import { RenderableObject } from "../../RenderableObject";
import { m4, primitives } from "twgl.js";
import { Instantiable } from "../../../editor";
import { Geometry } from "../../geometry/Geometry";
import { BaseMaterial } from "../../materials/BaseMaterial";

@Instantiable("RenderableObject")
export class Sphere extends RenderableObject {
  constructor() {
    const radius = 1;
    const subDAxis = 12;
    const subDHeight = 12;

    const sphereVerticesIndexed = primitives.createSphereVertices(radius, subDAxis, subDHeight);
    //console.log(sphereVerticesIndexed);
    const sphereVertices = primitives.deindexVertices(sphereVerticesIndexed);

    // TypedArray includes data of position, indices, normals, texcoords
    // super([...sphereVertices.position], null, null);

    super(
      new Geometry({
        vertices: sphereVertices.position as any,
        normals: sphereVertices.normal as any,
        texCoords: sphereVertices.texcoord as any,
        transform: m4.identity(),
      }),
      new BaseMaterial({
        specularConstant: 0.4,
        ambientConstant: 0.2,
        diffuseConstant: 0.8,
        shininessConstant: 5.0,
        materialColor: [0.6, 0.6, 0.6, 1],
        textureImage: null,
      })
    );
  }
}
