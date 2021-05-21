import { AttribDataBuffer } from "./AttribDataBuffer";
import { Texture } from "./Texture";
import { Image } from "./image/Image";
import { ShaderProgram } from "./ShaderProgram";
import { printProgramInfo } from "../utils/GLUtils";
import { ShaderSet } from "./shader/ShaderSet";

export interface IBufferLoader<D, B> {
  needUpdate: boolean;
  data: D;
  buffer: B;
  load(gl: WebGLRenderingContext, elementSize: number): any;
}
export class DataBufferLoader implements IBufferLoader<number[], AttribDataBuffer> {
  private _data: number[];
  private _buffer: AttribDataBuffer;
  public needUpdate: boolean;
  private _elementSize: number;

  constructor(data: any[], elementSize: number, buffer?: AttribDataBuffer) {
    this._elementSize = elementSize;

    if (buffer) {
      this._data = data;
      this._buffer = buffer;
      this.needUpdate = false;
    } else {
      this._data = data;
      this.needUpdate = true;
    }
  }

  public get data() {
    return this._data;
  }
  public get buffer() {
    if (!this._buffer) {
      console.log("warning: buffer not initialized");
    }
    return this._buffer;
  }
  load(gl: WebGLRenderingContext, elementSize?: number) {
    this._buffer = AttribDataBuffer.fromData(
      gl,
      new Float32Array(this._data),
      elementSize | this._elementSize
    );
    this.needUpdate = false;
  }
}

export class TextureBufferLoader implements IBufferLoader<Image, Texture> {
  private _data: Image;
  private _buffer: Texture;
  public needUpdate: boolean;
  public hasTexture: boolean;

  constructor(data: Image, buffer?: Texture) {
    if (data) {
      this.hasTexture = true;
      this._data = data;
    } else {
      this.hasTexture = false;
    }
    if (buffer) {
      this._data = data;
      this._buffer = buffer;
      this.needUpdate = false;
    } else {
      this._data = data;
      this.needUpdate = true;
    }
  }

  public get data() {
    return this._data;
  }
  public set data(val: Image) {
    this._data = val;
    this.needUpdate = true;
  }
  public get buffer() {
    if (!this._buffer) {
      console.log("warning: buffer not initialized");
      return;
    }
    return this._buffer;
  }
  public set buffer(val: Texture) {
    this._buffer = val;
    this._data = null;
    this.hasTexture = true;
  }
  public load(gl: WebGLRenderingContext) {
    if (this.hasTexture && this.needUpdate) {
      this._buffer = new Texture(gl, { image: this._data });
      this.needUpdate = false;
    }
  }
}
