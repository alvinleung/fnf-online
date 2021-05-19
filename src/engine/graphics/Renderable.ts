import { connect } from "node:http2";
import { m4, v3 } from "twgl.js";
import { Component } from "../ecs";
import { EditableField, Editor, Field, Instantiable } from "../editor";
import { COLORS_VEC4 } from "./3dRender/objects/Primitives";
import { Normals, PhongMaterialProperties } from "./3dRender/PhongRenderPass";
import { wireFrameMaterialProperties } from "./3dRender/WireframeRenderPass";
import { AttribDataBuffer } from "./AttribDataBuffer";
import { DataBufferLoader, TextureBufferLoader } from "./DataBufferPair";
import { Geomatry } from "./Geomatry/Geomatry";
import { Image } from "./Image/Image";
import { BaseMaterial} from "./Materials/CustomMaterials";
import { Material, Materials } from "./Materials/Material";
import { ShaderManager, ShaderSet } from "./Materials/ShaderManager";
import { Texture } from "./Texture";

const VERBOSE = false;

export class RenderableComponent implements Component {
  @EditableField(Editor.CLASS, { category: "RenderableObject" })
  renderableObject: RenderableObject;
}

/**
 * Rendeable Objects types, this is designed to hold information
 * that are necessary for rendering an object onto the scene.
 *
 * If possible, try to decouple the object behaviour logic from this class.
 */
@Instantiable("RenderableObject")
export class RenderableObject {

  //private _objectCoords: number[];
  //private _textureImage: Image;
  //private _textureCoords: number[];
  //private _objectColors: number[];
  //public transform: m4.Mat4 = m4.translation(v3.create(0, 0, 0));
  private _plan: any[] = [];
  //public shaderSet: ShaderSet;

  @Field(Editor.CLASS)
  private _material: Materials;
  private _geometry: Geomatry;

  constructor(
    objectCoords: number[] = [],
    textureCoords: number[] = [],
    textureImage?: Image, // texture name
    objectColors?: number[]
  ) {
    //this.objectCoords = objectCoords;
    //this.textureCoords = textureCoords;
    //this.textureImage = textureImage;

    /*
    if (objectColors) {
      this.objectColors = objectColors;
    } else {
      //this.objectColors = COLORS_VEC4.randomColor(objectCoords.length / 3, 3);
      this.objectColors = COLORS_VEC4.grayColor(objectCoords.length / 3, 0.75);
    }*/

    this._material = new Materials()
    .addProperty("Phong", new PhongMaterialProperties())
    .addProperty("Normals", new Normals(objectCoords, false))
  //.addProperty("WireFrame", new wireFrameMaterialProperties(objectCoords))
    .addProperty("material", new BaseMaterial(objectCoords.length / 3,{
      specularConstant: 0.4,
      ambientConstant: 0.2,
      diffuseConstant: 0.8,
      shininess: 5,
      color:objectColors? objectColors:null,
      textureImage:textureImage,
      }));
 

    this._geometry = new Geomatry({
      vertices: objectCoords,
      normals:(new Normals(objectCoords, false)).normals,
      texCoords:textureCoords,
      transform: m4.identity(),
    })
    
    this._plan = ShaderManager.getInstance().getDefaultPlan();

    return this;
  }
  public get transform(){
    return this._geometry.transform;
  }
  public set transform(matrix:m4.Mat4){
    this._geometry.transform = matrix;
  }

  @Field(Editor.ARRAY_NUMBER, { defaultValue: [] })
  public set objectCoords(val) {
    this._isLoadedIntoGPUMemory = false;
    console.log(this._geometry)
    this._geometry.vertices = val;
    //this._objectCoords = val;
  }
  public get objectCoords() {
    return this._geometry.vertices;
    //return this._objectCoords;
  }

  @Field(Editor.RESOURCE_IMAGE)
  public set textureImage(val) {
    this._isLoadedIntoGPUMemory = false;
    
    const material = this._material.getProperty<BaseMaterial>("material");
    let textureBuffer = material.get("_textureImage") as TextureBufferLoader
    textureBuffer.buffer = val
  }
  public get textureImage() {
    return ((this._material.getProperty<BaseMaterial>("material")).get("_textureImage") as TextureBufferLoader).buffer
  }

  @Field(Editor.ARRAY_NUMBER)
  public set textureCoords(val) {
    this._isLoadedIntoGPUMemory = false;
    //this._textureCoords = val;
    this._geometry.texCoords = val;
  }
  public get textureCoords() {
    //return this._textureCoords;
    return this._geometry.texCoords;
  }

  @Field(Editor.ARRAY_NUMBER)
  public set objectColors(val) {
    this._isLoadedIntoGPUMemory = false;
    //this._objectColors = val;
    const material = this._material.getProperty<BaseMaterial>("material");
    material.get("_textureImage") 
  }
  //TODO:remove
  public get objectColors() {
    const material = this._material.getProperty<BaseMaterial>("material");
    //console.log(material.get("_colors"))
    return (material.get("_colors") as DataBufferLoader).data; // this._objectColors;
  }

  /**
   * references for texture rendering
   */
  private _isLoadedIntoGPUMemory: boolean = false;
  private _needTextureReload: boolean = false;

  //private _coordsBuffer: AttribDataBuffer;
  //private _texCoordsBuffer: AttribDataBuffer;
  //private _colorBuffer: AttribDataBuffer;
  //private _texture: Texture;


  public loadIntoGPU(gl: WebGLRenderingContext) {
    this.createBufferObjectsInGPU(gl);
    this._isLoadedIntoGPUMemory = true;

    if (this._needTextureReload) this.loadTextureIntoGPU(gl);
  }

  /**
   * Reload texture onto gpu in the next rendering cycle
   */
  public reloadTexture() {
    this._needTextureReload = true;
  }

  /**
   * Reload all the data onto gpu in the next rendering cycle
   */
  public reload() {
    this._isLoadedIntoGPUMemory = false;
  }

  protected createBufferObjectsInGPU(gl: WebGLRenderingContext) {
    // load the object onto a buffer
    //this._coordsBuffer = AttribDataBuffer.fromData(gl, new Float32Array(this.objectCoords), 3);
    //this._texCoordsBuffer = AttribDataBuffer.fromData(gl, new Float32Array(this.textureCoords), 2);
    this._geometry.prepareInGPU(gl);
    // colors defaulted to gray
    //this._colorBuffer = AttribDataBuffer.fromData(gl, new Float32Array(this.objectColors), 4);
    this._material.getProperty<BaseMaterial>("material").prepareInGPU(gl)


    // load image onto the gpu
    if (this.textureImage) {
      this.loadTextureIntoGPU(gl);
    } else {
      VERBOSE &&
        console.log("No texture image supplied, will not create texture for this renderable.");
    }
  }

  private loadTextureIntoGPU(gl: WebGLRenderingContext) {
    //this._texture = new Texture(gl, { image: this.textureImage });
    this._material.getProperty<BaseMaterial>("material").prepareInGPU(gl);
    this._needTextureReload = false;
  }

  //TODO:toremove
  public getCoordsBuffer() {
    return this._geometry.get("vPosition");
  }
  //TODO:toremove
  public getTextureCoordsBuffer() {
    return this._geometry.get("vTexCoord");
  }
  //TODO:toremove
  public getColorBuffer() {
    return (this._material.getProperty<BaseMaterial>("material").get("_colors") as DataBufferLoader).buffer
  }
  /**
   * Return if the data of this renderable object has complete it's webgl setups already.
   * @returns
   */
  public isLoadedIntoGPUMemory() {
    return this._isLoadedIntoGPUMemory;
  }

  /**
   * Set the texture to be rendered during a render pass.
   * @returns
   */
  public setRenderingTexture(texture: Texture) {
    (this._material.getProperty<BaseMaterial>("material").get("_textureImage") as TextureBufferLoader).buffer = texture;
  }

  /**
   * Returns the texture to be rendered during a render pass.
   * @returns
   */
  public getRenderingTexture(): Texture {
    return (this._material.getProperty<BaseMaterial>("material").get("_textureImage") as TextureBufferLoader).buffer;
  }

  public hasRenderingTexture(): boolean {
    return this._material.getProperty<BaseMaterial>("material").hasTexture();
  }

  public getObjectVerticeSize() {
    return this.objectCoords.length / 3;
  }

  public getMaterials(): Materials {
    return this._material;
  }
  public getGeometry(): Geomatry {
    return this._geometry;
  }
  public getRenderingPlan(): string[]{
    return this._plan;
  }
}
