import { m4 } from "twgl.js";
import { Editor, Field, Instantiable } from "../editor";
import { Normals } from "./3dRender/Normals";
import { Geometry } from "./geometry/Geometry";
import { BaseMaterial } from "./materials/BaseMaterial";
import { Material } from "./materials/Material";

/**
 * Rendeable Objects types, this is designed to hold information
 * that are necessary for rendering an object onto the scene.
 *
 * If possible, try to decouple the object behaviour logic from this class.
 */

@Instantiable("RenderableObject")
export class RenderableObject {
  private _plan: any[] = [];
  // private _lal: Materials;
  @Field(Editor.CLASS, { category: "Material" })
  private _material: Material;
  @Field(Editor.CLASS, { category: "Geometry" })
  private _geometry: Geometry;

  constructor(geometry: Geometry, material: Material) {
    if (geometry) {
      this._geometry = geometry;
    } else {
      this._geometry = new Geometry({
        vertices: [],
        normals: new Normals([], false).normals,
        texCoords: [],
        transform: m4.identity(),
      });
    }

    if (material) {
      this._material = material;
    } else {
      this._material = new BaseMaterial();
    }

    return this;
  }

  public getMaterial(): Material {
    return this._material;
  }
  public getGeometry(): Geometry {
    return this._geometry;
  }
}
