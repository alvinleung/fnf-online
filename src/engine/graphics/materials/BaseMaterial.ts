import { TextureBufferLoader } from "../DataBufferPair";
import { ShaderConstants } from "../shader/ShaderConstants";
import { Uniform } from "./Uniform";
import { Material } from "./Material";
import { Image } from "../image/Image";
import { ShaderSet } from "../shader/ShaderSet";
import { AssetManager } from "../../assets";

export interface BaseMaterialTemplate {
  specularConstant: number;
  ambientConstant: number;
  diffuseConstant: number;
  shininessConstant: number;
  materialColor: number[];
  textureImage: Image;
}

export class BaseMaterial extends Material {
  @Uniform(ShaderConstants.UNIFORM.FLOAT)
  public readonly specularConstant: number;

  @Uniform(ShaderConstants.UNIFORM.FLOAT)
  public readonly ambientConstant: number;

  @Uniform(ShaderConstants.UNIFORM.FLOAT)
  public readonly diffuseConstant: number;

  @Uniform(ShaderConstants.UNIFORM.FLOAT)
  public readonly shininessConstant: number;

  @Uniform(ShaderConstants.UNIFORM.FLOAT_VEC4)
  public readonly materialColor: number[];

  @Uniform(ShaderConstants.UNIFORM.BOOL)
  public get useTexture() {
    return this._textureImage.hasTexture;
  }
  @Uniform(ShaderConstants.UNIFORM.SAMPLER_2D, "uTexture")
  public _textureImage: TextureBufferLoader;

  constructor(template?: BaseMaterialTemplate) {
    super();

    // BaseMaterial basically Phong
    this.shader = AssetManager.getInstance().shader.get("Phong");

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
      // get from asset manager
    }

    if (template.textureImage) {
      this._textureImage = new TextureBufferLoader(template.textureImage);
    } else {
      this._textureImage = new TextureBufferLoader(null);
    }
  }
}
