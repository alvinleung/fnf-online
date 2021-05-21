import { m4 } from "twgl.js";
import { Component } from "../ecs";
import { EditableField, Editor, Field, Instantiable } from "../editor";
import { Normals } from "./3dRender/Normals";
import { DataBufferLoader, TextureBufferLoader } from "./DataBufferPair";
import { Geometry } from "./geometry/Geometry";
import { Image } from "./image/Image";
import { BaseMaterial } from "./materials/BaseMaterial";
import { Material } from "./materials/Material";
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
  private _plan: any[] = [];
  // private _lal: Materials;
  private _material: Material;
  private _geometry: Geometry;

  constructor(geometry: Geometry, material: Material) {
    if (geometry) {
      this._geometry = geometry;
    } else {
      this._geometry = new Geometry({
        vertices: [],
        normals: new Normals([], false).normals,
        texCoords: [],
        transform: m4.identity(),
      });
    }

    if (material) {
      this._material = material;
    } else {
      this._material = new BaseMaterial({
        textureImage: null,
      });
    }

    return this;
  }
  public get transform() {
    return this._geometry.transform;
  }
  public set transform(matrix: m4.Mat4) {
    this._geometry.transform = matrix;
  }

  @Field(Editor.ARRAY_NUMBER, { defaultValue: [] })
  public set objectCoords(val) {
    this._isLoadedIntoGPUMemory = false;
    console.log(this._geometry);
    this._geometry.vertices = val;
  }
  public get objectCoords() {
    return this._geometry.vertices;
  }

  @Field(Editor.RESOURCE_IMAGE)
  public set textureImage(val) {
    this._isLoadedIntoGPUMemory = false;

    // const material = this._material.getProperty<BaseMaterial>("material");
    let textureBuffer = this._material.get("_textureImage") as TextureBufferLoader;
    textureBuffer.data = val;
  }
  public get textureImage() {
    return (this._material.get("_textureImage") as TextureBufferLoader).data;
  }

  @Field(Editor.ARRAY_NUMBER)
  public set textureCoords(val) {
    this._isLoadedIntoGPUMemory = false;
    this._geometry.texCoords = val;
  }
  public get textureCoords() {
    return this._geometry.texCoords;
  }

  @Field(Editor.ARRAY_NUMBER)
  public set objectColors(val) {
    this._isLoadedIntoGPUMemory = false;
    // const material = this._material.getProperty<BaseMaterial>("material");
    this._material.get("_textureImage");
  }

  /**
   * references for texture rendering
   */
  private _isLoadedIntoGPUMemory: boolean = false;
  private _needTextureReload: boolean = false;

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
    this._geometry.prepareInGPU(gl);

    // load image onto the gpu
    if (this.textureImage) {
      this.loadTextureIntoGPU(gl);
    } else {
      VERBOSE &&
        console.log("No texture image supplied, will not create texture for this renderable.");
    }
  }

  private loadTextureIntoGPU(gl: WebGLRenderingContext) {
    // this._material.prepareInGPU(gl);
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
    (this._material.get("_textureImage") as TextureBufferLoader).buffer = texture;
  }

  /**
   * Returns the texture to be rendered during a render pass.
   * @returns
   */
  public getRenderingTexture(): Texture {
    return (this._material.get("_textureImage") as TextureBufferLoader).buffer;
  }

  public hasRenderingTexture(): boolean {
    return (this._material as BaseMaterial).useTexture;
  }

  public getObjectVerticeSize() {
    return this.objectCoords.length / 3;
  }

  // public getMaterials(): Materials {
  //   return this._material;
  // }
  public getMaterial(): Material {
    return this._material;
  }
  public getGeometry(): Geometry {
    return this._geometry;
  }
  public set plan(plan: string[]) {
    this._plan = plan;
  }
  public get plan() {
    return this._plan;
  }
}
