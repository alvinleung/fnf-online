import { v3 } from "twgl.js";
import { MaterialProperties } from "../../Materials/Material";

import { Shader, shaderVariable } from "./ShaderManager";

export class TestMaterial implements MaterialProperties {
  //public shaders: ShaderSet = ShaderManager.getShader(shader3d);
  @shaderVariable(Shader.ATTRIBUTE.VEC3)
  public testFieldOne:v3.Vec3;
  @shaderVariable(Shader.ATTRIBUTE.VEC4)
  public testFieldTwo:v3.Vec3;
}