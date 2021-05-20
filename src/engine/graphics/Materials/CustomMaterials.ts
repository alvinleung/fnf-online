import { v3 } from "twgl.js";
import { COLORS_VEC4 } from "../3dRender/objects/Primitives";
import { Material } from "./Material";
import { Image } from "../Image/Image";
import { Shader, Uniform } from "../shader/ShaderManager";
import { DataBufferLoader, TextureBufferLoader } from "../DataBufferPair";
import { Texture } from "../Texture";

export class TestMaterial extends Material {
  //public shaders: ShaderSet = ShaderManager.getShader(shader3d);
  @Uniform(Shader.ATTRIBUTE.FLOAT_VEC3)
  public testFieldOne: v3.Vec3;
  @Uniform(Shader.ATTRIBUTE.FLOAT_VEC4)
  public testFieldTwo: v3.Vec3;

  public getSize(): number {
    throw new Error("Method not implemented.");
  }
  public prepareInGPU(): boolean {
    throw new Error("Method not implemented.");
  }
}

/*
Attributes
	0:vPosition [FLOAT_VEC3]
	1:vColor [FLOAT_VEC4]
	2:vTextureCoords [FLOAT_VEC2]
	3:vNormal [FLOAT_VEC3]
Uniforms
	0:lightOrigin [FLOAT_VEC3]
	1:cameraPosition [FLOAT_VEC3]
	2:useTexture [BOOL]
	3:modelMatrix [FLOAT_MAT4]
	4:viewMatrix [FLOAT_MAT4]
	5:projectionMatrix [FLOAT_MAT4]
	6:shininessConstant [FLOAT]
	7:ambientConstant [FLOAT]
	8:specularConstant [FLOAT]
	9:diffuseConstant [FLOAT]
	10:uTexture [SAMPLER_2D]
*/
