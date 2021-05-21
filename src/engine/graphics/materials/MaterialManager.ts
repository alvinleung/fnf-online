import { ShaderSet } from "../shader/ShaderSet";
import { ShaderProgram } from "../ShaderProgram";
import { Material } from "./Material";

interface ShaderProgramMap {
  [name: string]: ShaderProgram;
}

export class MaterialManager {
  private shaderMaterialVariableNameMap: { [materialName: string]: any } = {};

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

  /* Singleton */
  private constructor() {}
  private static _instance: MaterialManager;
  public static getInstance() {
    if (!MaterialManager._instance) {
      MaterialManager._instance = new MaterialManager();
    }
    return MaterialManager._instance;
  }
}
