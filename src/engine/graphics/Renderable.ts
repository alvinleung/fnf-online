import { m4, v3 } from "twgl.js";
import { Component } from "../ecs";
import { AttribDataBuffer } from "./AttribDataBuffer";
import { Image } from "./Image";
import { Texture } from "./Texture";

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
    textureImage: Image // texture name
  ) {
    this.objectCoords = objectCoords;
    this.textureCoords = textureCoords;
    this.textureImage = textureImage;
  }
  public readonly objectCoords: number[];
  public readonly textureCoords: number[];
  public readonly textureImage: Image;
  public transform: m4.Mat4 = m4.translation(v3.create(0, 0, 0));

  /**
   * references for texture rendering
   */
  private _isLoadedOntoGPUMemory: boolean = false;

  private _coordsBuffer: AttribDataBuffer;
  private _texCoordsBuffer: AttribDataBuffer;
  private _texture: Texture;

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
    // load image onto the gpu
    if (this.textureImage)
      this._texture = new Texture(gl, { image: this.textureImage });
  }

  public getCoordsBuffer() {
    return this._coordsBuffer;
  }

  public getTextureCoordsBuffer() {
    return this._texCoordsBuffer;
  }

  public isLoadedOntoGPUMemory() {
    return this._isLoadedOntoGPUMemory;
  }

  public getTexture() {
    return this._texture;
  }

  public hasTexture(): boolean {
    return this._texture ? true : false;
  }
}
