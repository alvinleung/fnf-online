import { m4, primitives } from "twgl.js";
import { Instantiable } from "../../editor";
import { Geometry, GeometryTemplate } from "./Geometry";

@Instantiable("Geometry")
export class SphereGeometry extends Geometry {
  constructor() {
    const radius = 1;
    const subDAxis = 12;
    const subDHeight = 12;

    const sphereVerticesIndexed = primitives.createSphereVertices(radius, subDAxis, subDHeight);
    //console.log(sphereVerticesIndexed);
    const sphereVertices = primitives.deindexVertices(sphereVerticesIndexed);

    const config: GeometryTemplate = {
      //@ts-ignore
      vertices: sphereVertices.position as [],
      //@ts-ignore
      normals: sphereVertices.normal as [],
      //@ts-ignore
      texCoords: sphereVertices.texcoord as [],
      transform: m4.identity(),
    };
    // TypedArray includes data of position, indices, normals, texcoords
    super(config);
  }
}
