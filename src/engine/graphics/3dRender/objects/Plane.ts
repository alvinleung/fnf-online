/**
 * 3d Objects types
 */

import { Image } from "../../Image/Image";
import { RenderableObject } from "../../Renderable";

export class Plane extends RenderableObject {
  constructor(textureImage?: Image) {
    super(
      require("./Primitives").plane,
      require("./Primitives").quad_2d,
      textureImage
    );
  }
}
