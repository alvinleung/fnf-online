import { TextureBufferLoader } from "../DataBufferPair";
import { ShaderConstants } from "../shader/ShaderConstants";
import { Uniform } from "./Uniform";
import { Material } from "./Material";
import { Image } from "../image/Image";
import { ShaderSet } from "../shader/ShaderSet";
import { AssetManager } from "../../assets";

export interface BaseMaterialTemplate {
  specularConstant?: number;
  ambientConstant?: number;
  diffuseConstant?: number;
  shininessConstant?: number;
  materialColor?: number[];
  textureImage?: Image;
}

const DEFAULT_CONFIG: BaseMaterialTemplate = {
  specularConstant: 0.4,
  ambientConstant: 0.2,
  diffuseConstant: 0.8,
  shininessConstant: 5.0,
  materialColor: [0.6, 0.6, 0.6, 1],
  textureImage: null,
};

export class BaseMaterial extends Material {
  @Uniform(ShaderConstants.UNIFORM.FLOAT)
  public readonly specularConstant: number;

  @Uniform(ShaderConstants.UNIFORM.FLOAT)
  public readonly ambientConstant: number;

  @Uniform(ShaderConstants.UNIFORM.FLOAT)
  public readonly diffuseConstant: number;

  @Uniform(ShaderConstants.UNIFORM.FLOAT)
  public readonly shininessConstant: number;

  @Uniform(ShaderConstants.UNIFORM.FLOAT_VEC4, "materialColor")
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

    template = template || {};

    this.ambientConstant = template.ambientConstant || DEFAULT_CONFIG.ambientConstant;
    this.diffuseConstant = template.diffuseConstant || DEFAULT_CONFIG.diffuseConstant;
    this.shininessConstant = template.shininessConstant || DEFAULT_CONFIG.shininessConstant;
    this.specularConstant = template.specularConstant || DEFAULT_CONFIG.specularConstant;
    this.materialColor = template.materialColor || DEFAULT_CONFIG.materialColor;

    if (template.textureImage) {
      this._textureImage = new TextureBufferLoader(template.textureImage);
    } else {
      this._textureImage = new TextureBufferLoader(null);
    }
  }
}
