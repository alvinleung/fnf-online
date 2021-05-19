import { AttribDataBuffer } from "./AttribDataBuffer";
import { Texture } from "./Texture";
import { Image } from "./Image/Image";
import { Shader, ShaderSet } from "./Materials/ShaderManager";
import { ShaderProgram } from "./ShaderProgram";
import { printProgramInfo } from "../utils/GLUtils";


export interface IBufferLoader<D,B>{
  needUpdate: boolean;
  data: D;
  buffer: B;
  load(gl: WebGLRenderingContext,elementSize:number):any;
}
export class DataBufferLoader implements IBufferLoader<number[],AttribDataBuffer> {
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
  load(gl: WebGLRenderingContext,elementSize:number) {
    this._buffer = AttribDataBuffer.fromData(gl,new Float32Array(this._data),elementSize);
  }
}

export class TextureBufferLoader implements IBufferLoader<Image,Texture> {
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
  public load(gl: WebGLRenderingContext) {
    if(this.hasTexture && this.needUpdate){
      this._buffer = new Texture(gl, { image: this._data });
    }
  }
}

export class ShaderProgramLoader implements IBufferLoader<ShaderSet,ShaderProgram> {

  private _shaderSet:ShaderSet;
  private _program: ShaderProgram;
  public needUpdate: boolean;
  
  constructor(shaderSet:ShaderSet,program?:ShaderProgram){
    this._shaderSet = shaderSet;
    this.needUpdate = true;
    if(program){
      this._program = program;
      this.needUpdate = false;
    }
  }
  public getShaderSet(): ShaderSet {
    return this.data
  }
  public getProgram(gl:WebGLRenderingContext): ShaderProgram {
    this.load(gl)
    return this.buffer;
  }

  public get data(): ShaderSet{
    return this._shaderSet;
  };
  public get buffer(): ShaderProgram{
    return this._program;
  }
  public load(gl: WebGLRenderingContext) {
    if(this.needUpdate || !this._program){
      this._program = new ShaderProgram(gl,
        this._shaderSet.vertexShader,
        this._shaderSet.fragmentShader);
      console.log("New Program created:")
      printProgramInfo(gl,this._program.getShader())
      this.needUpdate = false;
    }
  }
}

