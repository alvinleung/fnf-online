import { AssetManager } from "../../assets";
import { AssetLoaderEvent } from "../../assets/AssetLoader";
import { ShaderSetLoader } from "../../assets/ShaderSetLoader";
import { ShaderProgramLoader } from "../DataBufferPair";
import { ShaderSet } from "../shader/ShaderSet";
import { ShaderProgram } from "../ShaderProgram";
import { Material } from "./Material";

interface ShaderProgramMap {
  [name: string]: ShaderProgram;
}

export class MaterialManager {
  private shaderMaterialVariableNameMap: { [materialName: string]: any } = {};
  //private shaderSets:{[name:string]:ShaderSet} = {};
  private shaders: { [name: string]: ShaderProgramLoader } = {};

  private _shaderProgramInstances: ShaderProgramMap = {};

  public getShaderProgram(gl: WebGLRenderingContext, shaderSet: ShaderSet): ShaderProgram {
    // if the program already created, use the created one
    if (this._shaderProgramInstances[shaderSet.name]) {
      return this._shaderProgramInstances[shaderSet.name];
    }

    // if not then we compile the program
    const programInstance = new ShaderProgram(gl, shaderSet.vertexShader, shaderSet.fragmentShader);
    this._shaderProgramInstances[shaderSet.name] = programInstance;
    return programInstance;
  }

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
  public addMaterialVariable(
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
    this.shaderMaterialVariableNameMap[materialClassName][variableName] = {
      type: type,
      nameInShader: nameInShader ? nameInShader : variableName,
    };
  }

  public getMaterialVariables(materialClass: Material) {
    // @ts-ignore
    const materialName = materialClass.name ? materialClass.name : materialClass.constructor.name;
    return this.shaderMaterialVariableNameMap[materialName];
  }

  public callUpdateShaderSets() {
    const shaderLoader = AssetManager.getInstance().shader;
    shaderLoader.addEventListener(AssetLoaderEvent.COMPLETE, (loader: ShaderSetLoader) => {
      const shaderDict = loader.getAssetDictionary();
      for (const shaderName in shaderDict) {
        MaterialManager.getInstance().addShader(shaderDict[shaderName]);
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
  private static _instance: MaterialManager;
  public static getInstance() {
    if (!MaterialManager._instance) {
      MaterialManager._instance = new MaterialManager();
      MaterialManager._instance.init();
    }
    return MaterialManager._instance;
  }

  private init() {
    this.callUpdateShaderSets();
  }
}
