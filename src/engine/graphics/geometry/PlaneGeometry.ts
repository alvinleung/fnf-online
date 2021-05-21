import { m4, primitives } from "twgl.js";
import { Instantiable } from "../../editor";
import { Geometry, GeometryTemplate } from "./Geometry";

@Instantiable("Geometry")
export class PlaneGeometry extends Geometry {
  constructor() {
    super({
      vertices: require("../3dRender/objects/Primitives").plane,
      normals: require("../3dRender/objects/Primitives").plane,
      texCoords: require("../3dRender/objects/Primitives").quad_2d,
      transform: m4.identity(),
    });
  }
}
