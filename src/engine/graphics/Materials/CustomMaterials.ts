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
  public testFieldOne:v3.Vec3;
  @shaderVariable(Shader.ATTRIBUTE.FLOAT_VEC4)
  public testFieldTwo:v3.Vec3;

  public getSize(): number {
    throw new Error("Method not implemented.");
  }
  public prepareInGPU(): boolean {
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
  private specularConstant: number;
  @shaderVariable(Shader.UNIFORM.FLOAT)
  private ambientConstant: number;
  @shaderVariable(Shader.UNIFORM.FLOAT)
  private diffuseConstant: number;
  @shaderVariable(Shader.UNIFORM.FLOAT,"shininessConstant")
  private shininess: number;
  private _colors:DataBufferLoader;
  @shaderVariable(Shader.ATTRIBUTE.FLOAT_VEC4,"vColor")
  private get vColor(){
    return this._colors.buffer;
  }
  @shaderVariable(Shader.UNIFORM.BOOL)
  private get useTexture(){
    return this.hasTexture()
  }
  /*
  @shaderVariable(Shader.UNIFORM.SAMPLER_2D)
  private get uTexture():TextureBufferLoader{
    return this._textureImage;
  }*/
  @shaderVariable(Shader.UNIFORM.SAMPLER_2D,"uTexture")
  private _textureImage: TextureBufferLoader;
  private size:number;

  constructor(size:number,template?:BaseMaterialTemplate){
    super();
    this.size = size

    if(template){
      this.ambientConstant = template.ambientConstant;
      this.diffuseConstant = template.diffuseConstant;
      this.shininess = template.shininess;
      this.specularConstant = template.specularConstant;
    } else {
      this.specularConstant = 0.4;
      this.ambientConstant = 0.2;
      this.diffuseConstant = 0.8;
      this.shininess = 5.0;
    }

    if(template.color && false){
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
  //TODO: duplicated 
  public hasTexture():boolean{
    return this._textureImage.hasTexture;
  }
  public prepareInGPU(gl: WebGLRenderingContext):boolean {
    let updated = false;
    if(this._colors.needUpdate){
      this._colors.load(gl,4);
      updated = true;
    }
    if(this._textureImage.needUpdate){
      this._textureImage.load(gl);
      updated = true;
    }
    return updated;
  }

  public getSize(): number {
    return this.size;
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
  prepareInGPU(gl: WebGLRenderingContext):boolean {
    let updated = false;
    if(this._colors.needUpdate){
      this._colors.load(gl,4);
      updated = true;
    }
    return updated;
  }

  public getSize(): number {
    return 0;
  }
}

