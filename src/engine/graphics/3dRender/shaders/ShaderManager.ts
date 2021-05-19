import { string } from "prop-types";
import { v3 } from "twgl.js";
import { MaterialProperties } from "../../Renderable";

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

  /* Singleton */
  private constructor(){}
  private static _instance: ShaderManager;
  public static getInstance(){
    if(!ShaderManager._instance){
      ShaderManager._instance = new ShaderManager();
    }
    return ShaderManager._instance;
  }
}




