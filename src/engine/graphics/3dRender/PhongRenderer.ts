
import { v3 } from "twgl.js";
import { TransformComponent } from "../../core/TransformComponent";
import { Component } from "../../ecs";
import { EditableComponent, EditableField, Editor, InstantiableObject, ObjectField } from "../../editor";
import { spreadArrayRecusively } from "../../utils/ArrayUtils";
import { v4 } from "../../utils/MatrixUtils";
import { RayTriangle } from "../../utils/RayTriangle";
import { AttribDataBuffer } from "../AttribDataBuffer";
import { LightComponent } from "../light/Light";
import { MaterialProperties, RenderableObject } from "../Renderable";
import { RenderingSystem } from "../RenderingSystem";
import { ShaderProgram } from "../ShaderProgram";
import { Renderer3D } from "./Renderer3D";

const PHONG_SHADER_VERT = require("./shaders/PhongShader.vert");
const PHONG_SHADER_FRAG = require("./shaders/PhongShader.frag");

/*
@InstantiableObject([
  { type: Editor.INTEGER, defaultValue: 0.4 },
  { type: Editor.INTEGER, defaultValue: 0.2 },
  { type: Editor.INTEGER, defaultValue: 0.5 },
  { type: Editor.INTEGER, defaultValue: 5 },
])*/
@EditableComponent
export class PhongMaterialProperties implements MaterialProperties {
  private _specularConstant: number;
  private _ambientConstant: number;
  private _diffuseConstant: number;
  private _shininess: number;
  constructor(){
    this._specularConstant = 0.4;
    this._ambientConstant = 0.2;
    this._diffuseConstant = 0.8;
    this._shininess = 5;
  }

  @ObjectField(Editor.NUMBER)
  public set specularConstant(val:number){
    this._specularConstant = val;
  }
  public get specularConstant():number{
    return this._specularConstant;
  }
  @ObjectField(Editor.NUMBER)
  public set ambientConstant(val:number){
    this._ambientConstant = val;
  }
  public get ambientConstant():number{
    return this._ambientConstant;
  }
  @ObjectField(Editor.NUMBER)
  public set diffuseConstant(val:number){
    this._diffuseConstant = val;
  }
  public get diffuseConstant():number{
    return this._diffuseConstant;
  }
  @ObjectField(Editor.NUMBER)
  public set shininess(val:number){
    this._shininess = val;
  }
  public get shininess():number{
    return this._shininess;
  }

}
export class Normals implements MaterialProperties {
  private normals: number[];
  private _normalBuffer: AttribDataBuffer;
  private _isLoadedIntoGPUMemory: boolean;

  constructor(vertices: number[]){
    let objectNormals = [];
    for(var i = 0; i < vertices.length; i+=9){
      const vert0 = v3.create( vertices[ i ],vertices[i+1],vertices[i+2] );
      const vert1 = v3.create( vertices[i+3],vertices[i+4],vertices[i+5] );
      const vert2 = v3.create( vertices[i+6],vertices[i+7],vertices[i+8] );
      const normal = v3.cross(v3.subtract(vert0,vert1), v3.subtract(vert2,vert1))// as number[]; 
      objectNormals.push(...normal,...normal,...normal);
    }

    this.normals = spreadArrayRecusively(objectNormals);
    this._isLoadedIntoGPUMemory = false;
  }

  public getNormals():AttribDataBuffer{
    return this._normalBuffer;
  }

  //TODO: refactor out logic
  public isLoadedIntoGPUMemory(){
    return this._isLoadedIntoGPUMemory;
  }
  public createBufferObjectsInGPU(gl: WebGLRenderingContext){
    this._normalBuffer = AttribDataBuffer.fromData(
      gl,
      new Float32Array(this.normals),
      3
    );
  }
}

export class PhongRenderer extends Renderer3D {

  protected SHADER_PROGRAM_NAME = "phongShader";
  protected DEFAULT_PROPERTIES: PhongMaterialProperties;

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {

    // compile shaders here
    const phongShader = new ShaderProgram(
      gl,
      PHONG_SHADER_VERT,
      PHONG_SHADER_FRAG
    );

    /*
    this.DEFAULT_PROPERTIES = {
      specularConstant: 0.4,
      ambientConstant: 0.2,
      diffuseConstant: 0.5,
      shininess: 5,
    }*/

    // for trigger the cache
    phongShader.getUniformLocation("modelMatsrix");
    phongShader.getUniformLocation("viewMatrix");
    phongShader.getUniformLocation("projectionMatrix");

    // add the shader to the rendering system
    system.useShaderProgram(this.SHADER_PROGRAM_NAME, phongShader);
  }
  
  // virtual/ abstract method called before gl.draw
  protected beforeDraws(gl: WebGLRenderingContext, system: RenderingSystem, phongShader:ShaderProgram, renderableObjects: RenderableObject[]){
    let light = system.getLights()[0];
    let lightProperties = light.getComponent(LightComponent);
    let lightOrigin = light.getComponent(TransformComponent).position;

    phongShader.writeUniformBoolean("isDirection", lightProperties.isDirectional);
    phongShader.writeUniformVec3Float("lightColor", lightProperties.color);
    phongShader.writeUniformVec3Float("lightOrigin", lightOrigin);

  }
  protected beforeDraw(gl: WebGLRenderingContext, system: RenderingSystem, phongShader:ShaderProgram, renderableObject: RenderableObject){
    let materials = renderableObject.getMaterials();
    let properties:PhongMaterialProperties;
    let normals:Normals;
    if(materials){ 
      properties = materials.getProperty<PhongMaterialProperties>("Phong");
      normals = materials.getProperty<Normals>("Normals");
    }
    if(!normals){
      return false;
    }
    if(!normals.isLoadedIntoGPUMemory()){
      normals.createBufferObjectsInGPU(gl);
    }
    if(!properties){
      //properties = this.DEFAULT_PROPERTIES;
    }
    
    phongShader.writeUniformFloat("shininessConstant", properties.shininess );
    phongShader.writeUniformFloat("ambientConstant", properties.ambientConstant );
    phongShader.writeUniformFloat("specularConstant", properties.specularConstant );
    phongShader.writeUniformFloat("diffuseConstant", properties.diffuseConstant );
    phongShader.useAttribForRendering(
      "vNormal",
      normals.getNormals()
    );
    
    return true;
  }
}