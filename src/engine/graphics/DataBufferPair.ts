import { AttribDataBuffer } from "./AttribDataBuffer";
import { Texture } from "./Texture";
import { Image } from "./Image/Image";


export interface IDataBufferPair<D,B>{
  needUpdate: boolean;
  data: D;
  buffer: B;
  setBufferData(gl: WebGLRenderingContext,elementSize:number):any;
}
export class DataBufferPair implements IDataBufferPair<number[],AttribDataBuffer> {
  private _data:number[];
  private _buffer: AttribDataBuffer;
  public needUpdate: boolean;

  constructor(data:any[],buffer?:AttribDataBuffer){
    if(buffer){
      this._data = data;
      this._buffer = buffer;
      this.needUpdate = false;
    } else {
      this._data = data;
      this.needUpdate = true;
    }
  }

  public get data(){
    return this._data;
  }
  public get buffer(){
    if(!this._buffer){
      console.log("warning: buffer not initialized");
    }
    return this._buffer;
  }
  setBufferData(gl: WebGLRenderingContext,elementSize:number) {
    this._buffer = AttribDataBuffer.fromData(gl,new Float32Array(this._data),elementSize);
  }
}


export class TextureBufferPair implements IDataBufferPair<Image,Texture> {
  private _data:Image;
  private _buffer: Texture;
  public needUpdate: boolean;
  public hasTexture: boolean;

  constructor(data: Image, buffer?: Texture) {
    if(data){
      this.hasTexture = true;
    } else {
      this.hasTexture = false;
    }
    if(buffer){
      this._data = data;
      this._buffer = buffer;
      this.needUpdate = false;
    } else {
      this._data = data;
      this.needUpdate = true;
    }
  }

  public get data(){
    return this._data;
  }
  public set data(val:Image){
    this._data = val;
    this.needUpdate = true;
  }
  public get buffer(){
    
    if(!this._buffer){
      console.log("warning: buffer not initialized");
      return;
    }
    return this._buffer;
  }
  public set buffer(val:Texture){
    this._buffer = val;
    this._data = null;
    this.hasTexture = true;
  }
  public setBufferData(gl: WebGLRenderingContext) {
    if(this.hasTexture && this.needUpdate){
      this._buffer = new Texture(gl, { image: this._data });
    }
  }

}