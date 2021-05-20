import { TextureBufferLoader } from "../DataBufferPair";
import { Shader, Uniform } from "../shader/ShaderManager";
import { Material } from "./Material";
import { Image } from "../Image/Image";

export interface BaseMaterialTemplate {
  specularConstant: number;
  ambientConstant: number;
  diffuseConstant: number;
  shininessConstant: number;
  materialColor: number[];
  textureImage: Image;
}

export class BaseMaterial extends Material {
  @Uniform(Shader.UNIFORM.FLOAT)
  public readonly specularConstant: number;

  @Uniform(Shader.UNIFORM.FLOAT)
  public readonly ambientConstant: number;

  @Uniform(Shader.UNIFORM.FLOAT)
  public readonly diffuseConstant: number;

  @Uniform(Shader.UNIFORM.FLOAT)
  public readonly shininessConstant: number;

  @Uniform(Shader.UNIFORM.FLOAT_VEC4)
  public readonly materialColor: number[];

  @Uniform(Shader.UNIFORM.BOOL)
  public get useTexture() {
    return this._textureImage.hasTexture;
  }
  @Uniform(Shader.UNIFORM.SAMPLER_2D, "uTexture")
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
