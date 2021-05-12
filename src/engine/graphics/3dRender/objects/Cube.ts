/**
 * 3d Objects types
 * a Cube object with dimension 2x2x2(model units) centered at 0,0,0
 *
 */
import { Instantiable } from "../../../editor";
import { RenderableObject } from "../../Renderable";
import { generateColoredCube } from "./Primitives";

@Instantiable("RenderableObject")
export class Cube extends RenderableObject {
  constructor() {
    let cube = generateColoredCube();
    super(cube.verticeArray, null, null, cube.colorArray);
  }
}
