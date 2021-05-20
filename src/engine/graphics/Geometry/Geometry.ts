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

  private _vertexCount: number;

  constructor(template?: GeometryTemplate) {
    if (template) {
      this._vertices = new DataBufferLoader(template.vertices);
      this._normals = new DataBufferLoader(template.normals);
      this._transform = template.transform;
      if (template.texCoords) {
        this._texCoords = new DataBufferLoader(template.texCoords);
      } else {
        let zerosTexCoords = Array((template.vertices.length * 2) / 3).fill(0);
        this._texCoords = new DataBufferLoader(zerosTexCoords);
      }
    } else {
      this._vertices = new DataBufferLoader([]);
      this._normals = new DataBufferLoader([]);
      this._texCoords = new DataBufferLoader([]);
      this._transform = m4.identity();
    }

    this.updateVertexCount();
  }

  private updateVertexCount() {
    this._vertexCount = this.vertices.length / 3;
  }
  public get vertexCount() {
    return this._vertexCount;
  }

  private validateDataVertexCount() {
    const normalVertexCount = this.normals.length / 3;
    const texCoordVertexCount = this.texCoords.length / 2;

    if (normalVertexCount !== this.vertexCount) {
      console.warn(
        `Normal vertex count is incompatable, expected to be ${this.vertexCount}, provided ${normalVertexCount}`
      );
    }

    if (texCoordVertexCount !== this.vertexCount) {
      console.warn(
        `TexCoord vertex count is incompatable, expected to be ${this.vertexCount}, provided ${texCoordVertexCount}`
      );
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
    this.updateVertexCount();
  }
  public set normals(data: number[]) {
    this._normals = new DataBufferLoader(data);
    this.validateDataVertexCount();
  }
  public set texCoords(data: number[]) {
    this._texCoords = new DataBufferLoader(data);
    this.validateDataVertexCount();
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
      case "vTextureCoords":
        return this._texCoords.buffer;
      case "vTexCoord": //TODO: NOT supposed to be named like this, artifact of refactoring
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

  public prepareInGPU(gl: WebGLRenderingContext): boolean {
    let updated = false;
    if (this._vertices.needUpdate) {
      this._vertices.load(gl, 3);
      updated = true;
    }
    if (this._normals.needUpdate) {
      this._normals.load(gl, 3);
      updated = true;
    }
    if (this._texCoords.needUpdate) {
      this._texCoords.load(gl, 2);
      updated = true;
    }
    return updated;
  }
}
