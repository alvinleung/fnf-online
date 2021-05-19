import { string } from "prop-types";
import { v3 } from "twgl.js";
import { Asset, AssetManager } from "../../assets";
import { AssetLoaderEvent } from "../../assets/AssetLoader";
import { ShaderSetLoader } from "../../assets/ShaderSetLoader";
import { ShaderProgramLoader } from "../DataBufferPair";
import { ShaderProgram } from "../ShaderProgram";
import { MaterialProperties } from "./Material";


export namespace Shader{
  // variable storage qualifier -> variable type
  // ATTRIBUTE and UNIFORM **Not same value as webgl enums https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
  // TODO: maybe make the enum consistent with webgl enums
  export enum ATTRIBUTE {
    FLOAT_VEC3 = 100,
    FLOAT_VEC4 = 101,
  };
  export enum UNIFORM {
    VEC3,
    VEC4,
    MAT4,
    FLOAT,
    BOOLEAN,
  };
  export enum NAMES{
    VERTICES,
    NORMALS,
    TEXCOORDS,
    MODEL_MATRIX,
    VIEW_MATRIX,
    PROJECTION_MATRIX,
  }
}
export interface ShaderSet extends Asset {
  fragmentShader:string;
  vertexShader:string;
}
export function shaderVariable(type:number,nameInShader?:string): any{
  return function(target:any,property:string,descriptor:PropertyDescriptor){
    const parent = target.constructor.name;
    if(!nameInShader){
      nameInShader = property;
    }
    ShaderManager.getInstance().addVariableToMapping(parent,nameInShader,type)
    return descriptor;
  };
}
export class ShaderManager {

  private shaderMaterialVariableNameMap:{[shaderName:string]:{[materialName:string]:any}} = {};
  private geomatryNames: {[shaderName:string]:{[variableName:string]: string}} = {};
  //private shaderSets:{[name:string]:ShaderSet} = {};
  private shaders:{[name:string]:ShaderProgramLoader} = {};

  public getShaderFor(gl:WebGLRenderingContext, shaderName:string):ShaderProgram{
    if( !this.shaders[shaderName] ){
      return null;
    }
    return this.shaders[shaderName].getProgram(gl);
  }
  public getDefaultPlan(): any[]{
    //TODO: return a default plan for rendering object
    return [
      "Phong"
    ];
  }
  /**
   * add and store relation between a materialClass, a shader, and a variable that exist in both places
   * @param materialClassName 
   * @param variableName 
   * @param shaderSetName 
   */
  public addVariableToMapping(materialClassName:string,variableName:string,type:number,shaderSetName?:string){
    if(!shaderSetName){
      shaderSetName = "any";
    }
    if(!this.shaderMaterialVariableNameMap[shaderSetName]){
      this.shaderMaterialVariableNameMap[shaderSetName] = {};
    }
    if(!this.shaderMaterialVariableNameMap[shaderSetName][materialClassName]){
      this.shaderMaterialVariableNameMap[shaderSetName][materialClassName] = {};
    }
    this.shaderMaterialVariableNameMap[shaderSetName][materialClassName][variableName] = type;
  }
  public getMaterialMapping(materialClass:MaterialProperties,shaderSetName?:string){
    if(!shaderSetName){
      shaderSetName = "any";
    }
    // @ts-ignore
    const materialName = materialClass.name?materialClass.name:materialClass.constructor.name;
    return this.shaderMaterialVariableNameMap[shaderSetName][materialName];
  }
  public getVariableName(shaderVariable:Shader.NAMES,shaderSetName?:string): string{
    if(!shaderSetName){
      shaderSetName = "any";
    }
    switch(shaderVariable){
      case Shader.NAMES.VERTICES:
        return this.geomatryNames[shaderSetName]["vertices"];
      case Shader.NAMES.NORMALS:
        return this.geomatryNames[shaderSetName]["normals"];
      case Shader.NAMES.TEXCOORDS:
        return this.geomatryNames[shaderSetName]["texCoords"];
      case Shader.NAMES.MODEL_MATRIX:
        return "modelMatrix";
      case Shader.NAMES.VIEW_MATRIX:
        return "viewMatrix";
      case Shader.NAMES.PROJECTION_MATRIX:
        return "projectionMatrix";
      default:
        throw("no default variable name for enum["+shaderVariable+"] was found");
    }
  }
  public callUpdateShaderSets(){
    const shaderLoader = AssetManager.getInstance().shader;
    shaderLoader.addEventListener(AssetLoaderEvent.COMPLETE, (loader:ShaderSetLoader) => {
      const shaderDict = loader.getAssetDictionary();
      for(const shaderName in shaderDict){
        ShaderManager.getInstance().addShader(shaderDict[shaderName])
      }
    })
  }

  public addShader(shaderSet: ShaderSet, program?:ShaderProgram): boolean{
    const name = shaderSet.name;
    if(this.shaders[name]){
      return false;
    }
    this.shaders[name] = new ShaderProgramLoader(shaderSet,program);
    return true;
  }

  /* Singleton */
  private constructor(){}
  private static _instance: ShaderManager;
  public static getInstance(){
    if(!ShaderManager._instance){
      ShaderManager._instance = new ShaderManager();
      ShaderManager._instance.init();
    }
    return ShaderManager._instance;
  }

  private init(){
    this.geomatryNames['any'] = {
      vertices: "vPosition",
      normals: "vNormal",
      texCoords:"vTexCoord",
    }
    this.callUpdateShaderSets();
  }
}



