import { m4, v3 } from "twgl.js";
import { Component } from "../ecs";
import { AttribDataBuffer } from "./AttribDataBuffer";
import { Image } from "./Image/Image";
import { Texture } from "./Texture";

const VERBOSE = true;

export class RenderableComponent implements Component {
  renderableObject: RenderableObject;
}

/**
 * Rendeable Objects types, this is designed to hold information
 * that are necessary for rendering an object onto the scene.
 *
 * If possible, try to decouple the object behaviour logic from this class.
 */
export abstract class RenderableObject {
  constructor(
    objectCoords: number[],
    textureCoords: number[],
    textureImage?: Image // texture name
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
  private _isLoadedIntoGPUMemory: boolean = false;

  private _coordsBuffer: AttribDataBuffer;
  private _texCoordsBuffer: AttribDataBuffer;
  private _texture: Texture;

  public loadIntoGPU(gl: WebGLRenderingContext) {
    this.createBufferObjectsInGPU(gl);
    this._isLoadedIntoGPUMemory = true;
  }

  protected createBufferObjectsInGPU(gl: WebGLRenderingContext) {
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
    if (this.textureImage) {
      this._texture = new Texture(gl, { image: this.textureImage });
    } else {
      VERBOSE &&
        console.log(
          "No texture image supplied, will not create texture for this renderable."
        );
    }
  }

  public getCoordsBuffer() {
    if (!this.isLoadedIntoGPUMemory()) {
      console.warn(
        "Cant get coords buffer, this RenderableObject has not been loaded into gpu."
      );
      return;
    }
    return this._coordsBuffer;
  }

  public getTextureCoordsBuffer() {
    if (!this.isLoadedIntoGPUMemory()) {
      console.warn(
        "Cant get texture coords buffer, this RenderableObject has not been loaded into gpu."
      );
      return;
    }
    return this._texCoordsBuffer;
  }

  /**
   * Return if the data of this renderable object has complete it's webgl setups already.
   * @returns
   */
  public isLoadedIntoGPUMemory() {
    return this._isLoadedIntoGPUMemory;
  }

  /**
   * Set the texture to be rendered during a render pass.
   * @returns
   */
  public setRenderingTexture(texture: Texture) {
    this._texture = texture;
  }

  /**
   * Returns the texture to be rendered during a render pass.
   * @returns
   */
  public getRenderingTexture(): Texture {
    return this._texture;
  }

  public hasRenderingTexture(): boolean {
    return this._texture ? true : false;
  }
}
