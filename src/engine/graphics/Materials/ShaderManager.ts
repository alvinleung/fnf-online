import { string } from "prop-types";
import { glEnumToString, v3 } from "twgl.js";
import { Asset, AssetManager } from "../../assets";
import { AssetLoaderEvent } from "../../assets/AssetLoader";
import { ShaderSetLoader } from "../../assets/ShaderSetLoader";
import { ShaderProgramLoader } from "../DataBufferPair";
import { ShaderProgram } from "../ShaderProgram";
import { MaterialProperties } from "./Material";

export namespace Shader {
  // variable storage qualifier -> variable type

  export enum ATTRIBUTE {
    FLOAT_VEC2 = 100,
    FLOAT_VEC3, 
    FLOAT_VEC4,
  };
  export enum UNIFORM {
    FLOAT_VEC3 = 200,
    FLOAT_VEC4,
    FLOAT_MAT4,
    FLOAT,
    BOOL,
    SAMPLER_2D,
  };
  export enum NAMES{
    VERTICES = 300,
    NORMALS,
    TEXCOORDS,
    MODEL_MATRIX,
    VIEW_MATRIX,
    PROJECTION_MATRIX,
  }
  // translation for webglEnum 
  // https://developer.mozilla.org/en-US//docs/Web/API/WebGL_API/Constants
  const webGLenumMapLocal = {
    0x8B51:"FLOAT_VEC3",
    0x8B52:"FLOAT_VEC4",
    0x8B50:"FLOAT_VEC2",
    0x8B5C:"FLOAT_MAT4",
    0x8B56:"BOOL",
    0x1406:"FLOAT",
    0x1404:"INT",
    0x8B54:"INT_VEC3",
    0x8B5E:"SAMPLER_2D",
  }
  /**
   * Since Webgl types Enum does not distingush between attribute or unifrom, this function is used to translate (webglenum,attrib/unfirom) ,into a single enum 
   * @param glEnum a webgl enum according to  // https://developer.mozilla.org/en-US//docs/Web/API/WebGL_API/Constants
   * @param enumType a namespace string of either "ATTRIBUTE" or "UNIFORM"
   * @returns local version of enum
   */ 
  export function resolveEnumFromGLType(glEnum:number,enumType:string){
    const namespace = enumType.trim().toUpperCase();
    const enumName = webGLenumMapLocal[glEnum];
    if(!Shader[namespace]){
      console.error("enum namespace not found: ["+enumType+"]");
      return null;
    }
    if(!enumName ){
      console.error("enum: ["+glEnum+"] not supported yet, if this is a valid WebGL type, please contact the developers")
      return null;
    } else if (!Shader[namespace][enumName]) {
      console.error("enum: ["+glEnum+"] in namespace["+namespace+"] not supported yet, if this is a valid WebGL type, please contact the developers")
      return null;
    }
    return Shader[namespace][enumName];
  }
}
export interface ShaderSet extends Asset {
  fragmentShader: string;
  vertexShader: string;
}
export function shaderVariable(type: number, nameInShader?: string): any {
  return function (target: any, property: string, descriptor: PropertyDescriptor) {
    const parent = target.constructor.name;
    ShaderManager.getInstance().addVariableToMapping(parent, property, type, nameInShader);
    return descriptor;
  };
}
export class ShaderManager {
  private shaderMaterialVariableNameMap: {[materialName: string]: any }  =
    {};
  private geometryNames: { [variableName: string]: string }  = {};
  //private shaderSets:{[name:string]:ShaderSet} = {};
  private shaders: { [name: string]: ShaderProgramLoader } = {};

  public getShaderFor(gl: WebGLRenderingContext, shaderName: string): ShaderProgram {
    if (!this.shaders[shaderName]) {
      return null;
    }
    return this.shaders[shaderName].getProgram(gl);
  }
  public getDefaultPlan(): any[] {
    //TODO: return a default plan for rendering object
    return ["Phong"];
  }
  /**
   * add and store relation between a materialClass, a shader, and a variable that exist in both places
   * @param materialClassName
   * @param variableName
   * @param shaderSetName
   */
  public addVariableToMapping(
    materialClassName: string,
    variableName: string,
    type: number,
    nameInShader?: string
  ) {
    if (!this.shaderMaterialVariableNameMap) {
      this.shaderMaterialVariableNameMap = {};
    }
    if (!this.shaderMaterialVariableNameMap[materialClassName]) {
      this.shaderMaterialVariableNameMap[materialClassName] = {};
    }
    this.shaderMaterialVariableNameMap[materialClassName][variableName] = {type:type,nameInShader:nameInShader?nameInShader:variableName};
  }
  public getMaterialMapping(materialClass: MaterialProperties) {
    // @ts-ignore
    const materialName = materialClass.name ? materialClass.name : materialClass.constructor.name;
    return this.shaderMaterialVariableNameMap[materialName];
  }
  public getVariableName(shaderVariable: Shader.NAMES): string {
    switch (shaderVariable) {
      case Shader.NAMES.VERTICES:
        return this.geometryNames["vertices"];
      case Shader.NAMES.NORMALS:
        return this.geometryNames["normals"];
      case Shader.NAMES.TEXCOORDS:
        return this.geometryNames["texCoords"];
      case Shader.NAMES.MODEL_MATRIX:
        return "modelMatrix";
      case Shader.NAMES.VIEW_MATRIX:
        return "viewMatrix";
      case Shader.NAMES.PROJECTION_MATRIX:
        return "projectionMatrix";
      default:
        throw "no default variable name for enum[" + shaderVariable + "] was found";
    }
  }
  public callUpdateShaderSets() {
    const shaderLoader = AssetManager.getInstance().shader;
    shaderLoader.addEventListener(AssetLoaderEvent.COMPLETE, (loader: ShaderSetLoader) => {
      const shaderDict = loader.getAssetDictionary();
      for (const shaderName in shaderDict) {
        ShaderManager.getInstance().addShader(shaderDict[shaderName]);
      }
    });
  }

  public addShader(shaderSet: ShaderSet, program?: ShaderProgram): boolean {
    const name = shaderSet.name;
    if (this.shaders[name]) {
      return false;
    }
    this.shaders[name] = new ShaderProgramLoader(shaderSet, program);
    return true;
  }

  /* Singleton */
  private constructor() {}
  private static _instance: ShaderManager;
  public static getInstance() {
    if (!ShaderManager._instance) {
      ShaderManager._instance = new ShaderManager();
      ShaderManager._instance.init();
    }
    return ShaderManager._instance;
  }

  private init() {
    this.geometryNames = {
      vertices: "vPosition",
      normals: "vNormal",
      texCoords: "vTextureCoords",
    };
    this.callUpdateShaderSets();
  }
}
