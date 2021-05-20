import { v3 } from "twgl.js";
import { COLORS_VEC4 } from "../3dRender/objects/Primitives";
import { Material, MaterialProperties } from "./Material";
import { Image } from "../Image/Image";
import { Shader, shaderVariable } from "./ShaderManager";
import { DataBufferLoader, TextureBufferLoader } from "../DataBufferPair";
import { Texture } from "../Texture";

export class TestMaterial extends Material {
  //public shaders: ShaderSet = ShaderManager.getShader(shader3d);
  @shaderVariable(Shader.ATTRIBUTE.FLOAT_VEC3)
  public testFieldOne: v3.Vec3;
  @shaderVariable(Shader.ATTRIBUTE.FLOAT_VEC4)
  public testFieldTwo: v3.Vec3;

  public getSize(): number {
    throw new Error("Method not implemented.");
  }
  public prepareInGPU(): boolean {
    throw new Error("Method not implemented.");
  }
}

export interface BaseMaterialTemplate {
  specularConstant: number;
  ambientConstant: number;
  diffuseConstant: number;
  shininessConstant: number;
  materialColor: number[];
  textureImage: Image;
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
export class BaseMaterial extends Material {
  @shaderVariable(Shader.UNIFORM.FLOAT)
  public readonly specularConstant: number;

  @shaderVariable(Shader.UNIFORM.FLOAT)
  public readonly ambientConstant: number;

  @shaderVariable(Shader.UNIFORM.FLOAT)
  public readonly diffuseConstant: number;

  @shaderVariable(Shader.UNIFORM.FLOAT)
  public readonly shininessConstant: number;

  @shaderVariable(Shader.UNIFORM.FLOAT_VEC4)
  public readonly materialColor: number[];

  @shaderVariable(Shader.UNIFORM.BOOL)
  public get useTexture() {
    return this._textureImage.hasTexture;
  }
  @shaderVariable(Shader.UNIFORM.SAMPLER_2D, "uTexture")
  public _textureImage: TextureBufferLoader;

  constructor(template?: BaseMaterialTemplate) {
    super();

    if (template) {
      this.ambientConstant = template.ambientConstant;
      this.diffuseConstant = template.diffuseConstant;
      this.shininessConstant = template.shininessConstant;
      this.specularConstant = template.specularConstant;
      this.materialColor = template.materialColor;
    } else {
      this.specularConstant = 0.4;
      this.ambientConstant = 0.2;
      this.diffuseConstant = 0.8;
      this.shininessConstant = 5.0;
      this.materialColor = [0.6, 0.6, 0.6, 1];
    }

    if (template.textureImage) {
      this._textureImage = new TextureBufferLoader(template.textureImage);
    } else {
      this._textureImage = new TextureBufferLoader(null);
    }
  }
}

export interface PhongMaterialTwoTemplate {
  specularConstant: number;
  ambientConstant: number;
  diffuseConstant: number;
  shininess: number;
  vertexCount: number;
}
export class PhongMaterialTwo extends Material {
  @shaderVariable(Shader.UNIFORM.FLOAT)
  private _specularConstant: number;
  @shaderVariable(Shader.UNIFORM.FLOAT)
  private _ambientConstant: number;
  @shaderVariable(Shader.UNIFORM.FLOAT)
  private _diffuseConstant: number;
  @shaderVariable(Shader.UNIFORM.FLOAT)
  private _shininess: number;
  @shaderVariable(Shader.ATTRIBUTE.FLOAT_VEC4)
  private _colors: DataBufferLoader;

  private size: number;
  constructor(size: number, template?: PhongMaterialTwoTemplate) {
    super();

    if (template) {
      this._ambientConstant = template.ambientConstant;
      this._diffuseConstant = template.diffuseConstant;
      this._shininess = template.shininess;
      this._specularConstant = template.specularConstant;
    } else {
      this._specularConstant = 0.4;
      this._ambientConstant = 0.2;
      this._diffuseConstant = 0.8;
      this._shininess = 5;
    }

    this._colors = new DataBufferLoader(COLORS_VEC4.grayColor(size, 0.75), 4);
  }
  prepareInGPU(gl: WebGLRenderingContext): boolean {
    let updated = false;
    if (this._colors.needUpdate) {
      this._colors.load(gl, 4);
      updated = true;
    }
    return updated;
  }

  public getSize(): number {
    return 0;
  }
}
