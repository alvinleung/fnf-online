/**
 * 3d Objects types
 */

import { InstantiableObject, Editor } from "../../../editor";
import { Image } from "../../Image/Image";
import { RenderableObject } from "../../Renderable";

@InstantiableObject([
  {
    type: Editor.RESOURCE_IMAGE,
    defaultValue: null,
  },
])
export class Plane extends RenderableObject {
  constructor(textureImage?: Image) {
    super(
      require("./Primitives").plane,
      require("./Primitives").quad_2d,
      textureImage
    );
  }
}
