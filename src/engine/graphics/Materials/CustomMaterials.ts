import { v3 } from "twgl.js";
import { COLORS_VEC4 } from "../3dRender/objects/Primitives";
import { Material, MaterialProperties } from "./Material";
import { Image } from "../Image/Image";
import { Shader, shaderVariable } from "./ShaderManager";
import { DataBufferLoader, TextureBufferLoader } from "../DataBufferPair";

export class TestMaterial extends Material {
  //public shaders: ShaderSet = ShaderManager.getShader(shader3d);
  @shaderVariable(Shader.ATTRIBUTE.FLOAT_VEC3)
  public testFieldOne:v3.Vec3;
  @shaderVariable(Shader.ATTRIBUTE.FLOAT_VEC4)
  public testFieldTwo:v3.Vec3;

  public getSize(): number {
    throw new Error("Method not implemented.");
  }
}

export interface BaseMaterialTemplate{
  specularConstant: number;
  ambientConstant: number;
  diffuseConstant: number;
  shininess: number;
  color:number[];
  textureImage:Image;
}
export class BaseMaterial extends Material {
  @shaderVariable(Shader.UNIFORM.FLOAT)
  private _specularConstant: number;
  @shaderVariable(Shader.UNIFORM.FLOAT)
  private _ambientConstant: number;
  @shaderVariable(Shader.UNIFORM.FLOAT)
  private _diffuseConstant: number;
  @shaderVariable(Shader.UNIFORM.FLOAT)
  private _shininess: number;
  @shaderVariable(Shader.ATTRIBUTE.FLOAT_VEC4)
  private _colors:DataBufferLoader;

  private _textureImage: TextureBufferLoader;
  private size:number;

  constructor(size:number,template?:BaseMaterialTemplate){
    super();
    
    if(template){
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

    if(template.color){
      this._colors = new DataBufferLoader( template.color );
    } else {
      this._colors = new DataBufferLoader( COLORS_VEC4.grayColor(size, 0.75) );
    }

    if(template.textureImage){
      this._textureImage = new TextureBufferLoader(template.textureImage);
    } else {
      this._textureImage = new TextureBufferLoader(null);
    }
  }
  public hasTexture():boolean{
    return this._textureImage.hasTexture;
  }
  public prepareInGPU(gl: WebGLRenderingContext) {
    if(this._colors.needUpdate){
      this._colors.load(gl,4);
    }
    if(this._textureImage.needUpdate){
      this._textureImage.load(gl);
    }
  }

  public getSize(): number {
    return 0;
  }
}

export interface PhongMaterialTwoTemplate{
  specularConstant: number;
  ambientConstant: number;
  diffuseConstant: number;
  shininess: number;
  vertexCount:number;
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
  private _colors:DataBufferLoader;

  private size:number;
  constructor(size:number,template?:PhongMaterialTwoTemplate){
    super();
    
    if(template){
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
    
    this._colors = new DataBufferLoader( COLORS_VEC4.grayColor(size, 0.75) );
  }
  prepareInGPU(gl: WebGLRenderingContext) {
    if(this._colors.needUpdate){
      this._colors.load(gl,4);
    }
  }

  public getSize(): number {
    return 0;
  }
}

