import { v3 } from "twgl.js";
import { Material, MaterialProperties } from "./Material";

import { Shader, shaderVariable } from "../3dRender/shaders/ShaderManager";

export class TestMaterial implements MaterialProperties {
  //public shaders: ShaderSet = ShaderManager.getShader(shader3d);
  @shaderVariable(Shader.ATTRIBUTE.VEC3)
  public testFieldOne:v3.Vec3;
  @shaderVariable(Shader.ATTRIBUTE.VEC4)
  public testFieldTwo:v3.Vec3;
}

export class PhongMaterialTwo implements Material {
  public get(propertyName: any) {
    throw new Error("Method not implemented.");
  }
  public getSize(): number {
    throw new Error("Method not implemented.");
  }
  
}