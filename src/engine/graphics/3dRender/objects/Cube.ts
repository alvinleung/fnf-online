/**
 * 3d Objects types
 * a Cube object with dimension 2x2x2(model units) centered at 0,0,0
 *
 */
import { m4 } from "twgl.js";
import { Instantiable } from "../../../editor";
import { Geometry } from "../../geometry/Geometry";
import { BaseMaterial } from "../../materials/BaseMaterial";
import { Material } from "../../materials/Material";
import { RenderableObject } from "../../RenderableObject";
import { Normals } from "../Normals";
import { generateColoredCube } from "./Primitives";

@Instantiable("RenderableObject")
export class Cube extends RenderableObject {
  constructor() {
    let cube = generateColoredCube();
    super(
      new Geometry({
        vertices: cube.verticeArray,
        normals: new Normals(cube.verticeArray, true).normals,
        texCoords: null,
      }),
      new BaseMaterial()
    );
  }
}
