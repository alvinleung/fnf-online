import { m4 } from "twgl.js";
import { Geometry, GeometryTemplate } from "../graphics/geometry/Geometry";
import { AssetConfig, AssetLoader } from "./AssetLoader";
import { parseObjFileFormat } from "./parser/ObjParser";

export class GeometryLoader extends AssetLoader<Geometry> {
  // implements loading function
  protected async loadItem({ name, path }: AssetConfig): Promise<Geometry> {
    // load geometry here
    const objData = await fetch(path);

    const parsedData = parseObjFileFormat(objData);

    const geometryConfig: GeometryTemplate = {
      normals: parsedData.normals,
      texCoords: parsedData.textures,
      vertices: parsedData.vertices,
      transform: m4.identity(),
    };

    const geometry = new Geometry(geometryConfig);
    geometry.name = name;
    geometry.path = path;

    return geometry;
  }
}
