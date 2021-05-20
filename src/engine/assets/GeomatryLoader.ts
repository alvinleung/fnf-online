import { m4 } from "twgl.js";
import { Geomatry, GeomatryTemplate } from "../graphics/Geomatry/Geomatry";
import { AssetConfig, AssetLoader } from "./AssetLoader";
import { parseObjFileFormat } from "./parser/ObjParser";

export class GeomatryLoader extends AssetLoader<Geomatry> {
  // implements loading function
  protected async loadItem({ name, path }: AssetConfig): Promise<Geomatry> {
    // load geomatry here
    const objData = await fetch(path);

    const parsedData = parseObjFileFormat(objData);

    const geomatryConfig: GeomatryTemplate = {
      normals: parsedData.normals,
      texCoords: parsedData.textures,
      vertices: parsedData.vertices,
      transform: m4.identity(),
    };

    const geomatry = new Geomatry(geomatryConfig);
    geomatry.name = name;
    geomatry.path = path;

    return geomatry;
  }
}
