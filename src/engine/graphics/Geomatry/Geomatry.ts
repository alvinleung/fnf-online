import { m4 } from "twgl.js";
import { Cube } from "../3dRender/objects/Cube";
import { generateColoredCube } from "../3dRender/objects/Primitives";
import { AttribDataBuffer } from "../AttribDataBuffer";





export interface GeomatryTemplate{
  vertices:number[];
  normals:number[];
  texCoords:number[];
  transform:m4.Mat4;
}
export class Geomatry {
  private _vertices:DataBufferPair;
  private _normals:DataBufferPair;
  private _texCoords:DataBufferPair;
  private _transform:m4.Mat4;

  constructor(template?:GeomatryTemplate){
    if(template){
      this._vertices = new DataBufferPair(template.vertices);
      this._normals = new DataBufferPair(template.normals);
      this._texCoords = new DataBufferPair(template.texCoords);
      this._transform = template.transform;
    } else {
      this._vertices = new DataBufferPair([]);
      this._normals = new DataBufferPair([]);
      this._texCoords = new DataBufferPair([]);
      this._transform = m4.identity();
    }
  }

  public get vertices():number[]{
    return this._vertices.data;
  }
  public get normals():number[]{
    return this._normals.data;
  }
  public get texCoords():number[]{
    return this._texCoords.data;
  }
  public set vertices(data:number[]){
    this._vertices = new DataBufferPair(data);
  }
  public set normals(data:number[]){
    this._normals = new DataBufferPair(data);
  }
  public set texCoords(data:number[]){
    this._texCoords = new DataBufferPair(data);
  }
  public get transform():m4.Mat4{
    return this._transform;
  }
  public set transform(matrix:m4.Mat4){
    this._transform = matrix;
  }
  public get(val:any):any{
    switch(val){
      case "vPosition":
        return this._vertices.buffer;
      case "vNormal":
        return this._normals.buffer;
      case "vTexCoord":
        return this._texCoords.buffer;
      case "modelMatrix":
        return this.transform;
      default:
        throw("variable name: ["+val+"] not found in default names, please consider overriding get function");
    }
  }

  prepareInGPU(gl: WebGLRenderingContext) {
    if(this._vertices.needUpdate){
      this._vertices.writeBuffer(gl,3);
    }
    if(this._normals.needUpdate){
      this._normals.writeBuffer(gl,3);
    }
    if(this._texCoords.needUpdate){
      this._texCoords.writeBuffer(gl,2);
    }
  }
}
export class DataBufferPair {
  private _data:any[];
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
  writeBuffer(gl: WebGLRenderingContext,elementSize:number) {
    this._buffer = AttribDataBuffer.fromData(gl,new Float32Array(this._data),elementSize);
  }
}