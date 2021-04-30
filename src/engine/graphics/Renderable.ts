import { m4, v3 } from "twgl.js";
import { Component } from "../ecs";
import { AttribDataBuffer } from "./AttribDataBuffer";

export class RenderableComponent implements Component {
  renderableObject: RenderableObject;
}

/**
 * Rendeable Objects types
 */

export abstract class RenderableObject {
  constructor(
    objectCoords: number[],
    textureCoords: number[],
    textureName: string // texture name
  ) {
    this.objectCoords = objectCoords;
    this.textureCoords = textureCoords;
    this.textureName = textureName;
  }
  public readonly objectCoords: number[];
  public readonly textureCoords: number[];
  public readonly textureName: string;
  public transform: m4.Mat4 = m4.translation(v3.create(0, 0, 0));

  /**
   * references for texture rendering
   */
  private _isLoadedOntoGPUMemory: boolean = false;

  private _coordsBuffer: AttribDataBuffer;
  private _texCoordsBuffer: AttribDataBuffer;

  public loadOntoGPU(gl: WebGLRenderingContext) {
    this.makeObjectBuffers(gl);
    this._isLoadedOntoGPUMemory = true;
  }

  private makeObjectBuffers(gl: WebGLRenderingContext) {
    // load the object onto a buffer
    this._coordsBuffer = AttribDataBuffer.fromData(
      gl,
      new Float32Array(this.objectCoords),
      3
    );
    this._texCoordsBuffer = AttribDataBuffer.fromData(
      gl,
      new Float32Array(this.textureCoords),
      2
    );
  }

  public get coordsBuffer() {
    return this._coordsBuffer;
  }

  public get textureCoordsBuffer() {
    return this._texCoordsBuffer;
  }

  public get isLoadedOntoGPUMemory() {
    return this._isLoadedOntoGPUMemory;
  }
}
