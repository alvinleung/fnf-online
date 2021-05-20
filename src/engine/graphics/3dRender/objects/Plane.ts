/**
 * 3d Objects types
 */

import { Editor, Instantiable, Field } from "../../../editor";
import { Image } from "../../Image/Image";
import { RenderableObject } from "../../Renderable";

// @InstantiableObject([
//   {
//     type: Editor.RESOURCE_IMAGE,
//     defaultValue: null,
//   },
// ])
@Instantiable("RenderableObject")
export class Plane extends RenderableObject {
  constructor(textureImage?: Image) {
    super(require("./Primitives").plane, require("./Primitives").quad_2d, textureImage);
  }
  @Field(Editor.RESOURCE_IMAGE)
  public get textureImage() {
    return super.textureImage;
  }
  public set textureImage(val) {
    super.textureImage = val;
  }
}
