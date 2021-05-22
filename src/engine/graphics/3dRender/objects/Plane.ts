/**
 * 3d Objects types
 */

import { m4 } from "twgl.js";
import { Editor, Instantiable, Field } from "../../../editor";
import { Geometry } from "../../geometry/Geometry";
import { Image } from "../../image/Image";
import { BaseMaterial } from "../../materials/BaseMaterial";
import { Material } from "../../materials/Material";
import { RenderableObject } from "../../RenderableObject";

// @InstantiableObject([
//   {
//     type: Editor.RESOURCE_IMAGE,
//     defaultValue: null,
//   },
// ])
@Instantiable("RenderableObject")
export class Plane extends RenderableObject {
  constructor(textureImage?: Image) {
    super(
      new Geometry({
        vertices: require("./Primitives").plane,
        normals: require("./Primitives").plane,
        texCoords: require("./Primitives").quad_2d,
        transform: m4.identity(),
      }),
      new BaseMaterial({
        textureImage: textureImage,
      })
    );
  }
  // @Field(Editor.RESOURCE_IMAGE)
  // public get textureImage() {
  //   return super.textureImage;
  // }
  // public set textureImage(val) {
  //   super.textureImage = val;
  // }
}
