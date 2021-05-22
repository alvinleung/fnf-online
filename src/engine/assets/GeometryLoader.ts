import { m4 } from "twgl.js";
import { Geometry, GeometryTemplate } from "../graphics/geometry/Geometry";
import { spreadArrayRecusively } from "../utils/ArrayUtils";
import { AssetConfig, AssetLoader } from "./AssetLoader";
import { parseObjFileFormat } from "./parser/ObjParser";

export class GeometryLoader extends AssetLoader<Geometry> {
  // implements loading function
  protected async loadItem({ name, path }: AssetConfig): Promise<Geometry> {
    // load geometry here
    const objData = await fetch(path);
    const fileContent = await objData.text();

    // const parsedData =
    const parsedData = parseObjFileFormat(fileContent);
    // console.log(parsedData);
    // const parsedMesh = new OBJ.Mesh(fileContent);

    const geometry = new Geometry({
      vertices: spreadArrayRecusively(parsedData.vertices),
      normals: spreadArrayRecusively(parsedData.normals),
      texCoords: spreadArrayRecusively(parsedData.textures),
      transform: m4.identity(),
    });
    geometry.name = name;
    geometry.path = path;

    return geometry;
  }
}
