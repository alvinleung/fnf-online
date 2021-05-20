import { m4 } from "twgl.js";

import { DataBufferLoader } from "../DataBufferPair";
import { Asset } from "../../assets/Asset";

export interface GeometryTemplate {
  vertices: number[];
  normals: number[];
  texCoords: number[];
  transform: m4.Mat4;
}
export class Geometry implements Asset {
  path: string;
  name: string;

  private _vertices: DataBufferLoader;
  private _normals: DataBufferLoader;
  private _texCoords: DataBufferLoader;
  private _transform: m4.Mat4;

  constructor(template?: GeometryTemplate) {
    if (template) {
      this._vertices = new DataBufferLoader(template.vertices);
      this._normals = new DataBufferLoader(template.normals);
      this._texCoords = new DataBufferLoader(template.texCoords);
      this._transform = template.transform;
    } else {
      this._vertices = new DataBufferLoader([]);
      this._normals = new DataBufferLoader([]);
      this._texCoords = new DataBufferLoader([]);
      this._transform = m4.identity();
    }
  }

  public get vertices(): number[] {
    return this._vertices.data;
  }
  public get normals(): number[] {
    return this._normals.data;
  }
  public get texCoords(): number[] {
    return this._texCoords.data;
  }
  public set vertices(data: number[]) {
    this._vertices = new DataBufferLoader(data);
  }
  public set normals(data: number[]) {
    this._normals = new DataBufferLoader(data);
  }
  public set texCoords(data: number[]) {
    this._texCoords = new DataBufferLoader(data);
  }
  public get transform(): m4.Mat4 {
    return this._transform;
  }
  public set transform(matrix: m4.Mat4) {
    this._transform = matrix;
  }
  public get(val: any): any {
    switch (val) {
      case "vPosition":
        return this._vertices.buffer;
      case "vNormal":
        return this._normals.buffer;
      case "vTexCoord":
        return this._texCoords.buffer;
      case "modelMatrix":
        return this.transform;
      default:
        throw (
          "variable name: [" +
          val +
          "] not found in default names, please consider overriding get function"
        );
    }
  }

  prepareInGPU(gl: WebGLRenderingContext) {
    if (this._vertices.needUpdate) {
      this._vertices.load(gl, 3);
    }
    if (this._normals.needUpdate) {
      this._normals.load(gl, 3);
    }
    if (this._texCoords.needUpdate) {
      this._texCoords.load(gl, 2);
    }
  }
}
