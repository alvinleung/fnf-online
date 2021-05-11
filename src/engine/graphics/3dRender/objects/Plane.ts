/**
 * 3d Objects types
 */

import {
  InstantiableObject,
  Editor,
  InstantiableClass,
  Field,
} from "../../../editor";
import { Image } from "../../Image/Image";
import { RenderableObject } from "../../Renderable";

// @InstantiableObject([
//   {
//     type: Editor.RESOURCE_IMAGE,
//     defaultValue: null,
//   },
// ])
@InstantiableClass()
export class Plane extends RenderableObject {
  constructor(textureImage?: Image) {
    super(
      require("./Primitives").plane,
      require("./Primitives").quad_2d,
      textureImage
    );
  }
  @Field(Editor.RESOURCE_IMAGE, Image.createEmpty())
  public set textureImage(val) {
    super.textureImage = val;
  }
  public get textureImage() {
    return super.textureImage;
  }
}
