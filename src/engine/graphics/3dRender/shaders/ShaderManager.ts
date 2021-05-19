import { string } from "prop-types";
import { v3 } from "twgl.js";
import { MaterialProperties } from "../../Materials/Material";


export namespace Shader{
  // variable storage qualifier -> variable type
  export enum ATTRIBUTE {
    VEC3 = 100,
    VEC4 = 101,
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
export interface ShaderSet {
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

  public shaderMaterialVariableNameMap:{[shaderName:string]:{[materialName:string]:any}} = {};
  public geomatryNames: {[shaderName:string]:{[variableName:string]: string}} = {};

  public getShaderFor(gl:WebGLRenderingContext, shaderSet:ShaderSet){
    
  }
  public getDefaultPlan(): string[]{
    //TODO: return a default plan for rendering object
    return [
      "SpriteSheet",
      "Phong",
      "WireFrame",
      //"Metrics",
    ];

    /**
      // new ImageRendererSetup(),
      // new SpriteSheetRendererSetup(),
      new SpriteSheetRenderPass(),
      new PhongRenderPass(),
      new WireFrameRenderPass(),
      new MetricsRenderPass(),
      // new GizmoPass(),
    */
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
  }
}




