import { connect } from "node:http2";
import { m4, v3 } from "twgl.js";
import { Component } from "../ecs";
import { EditableField, Editor, Field, Instantiable } from "../editor";
import { COLORS_VEC4 } from "./3dRender/objects/Primitives";
import { Normals, PhongMaterialProperties } from "./3dRender/PhongRenderPass";
import { wireFrameMaterialProperties } from "./3dRender/WireframeRenderPass";
import { AttribDataBuffer } from "./AttribDataBuffer";
import { Geomatry } from "./Geomatry/Geomatry";
import { Image } from "./Image/Image";
import { Materials } from "./Materials/Material";
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
  constructor(
    objectCoords: number[] = [],
    textureCoords: number[] = [],
    textureImage?: Image, // texture name
    objectColors?: number[]
  ) {
    this.objectCoords = objectCoords;
    this.textureCoords = textureCoords;
    this.textureImage = textureImage;

    this._material = new Materials()
      .addProperty("Phong", new PhongMaterialProperties())
      .addProperty("Normals", new Normals(objectCoords, false));
    //.addProperty("WireFrame", new wireFrameMaterialProperties(objectCoords))

    if (objectColors) {
      this.objectColors = objectColors;
    } else {
      //this.objectColors = COLORS_VEC4.randomColor(objectCoords.length / 3, 3);
      this.objectColors = COLORS_VEC4.grayColor(objectCoords.length / 3, 0.75);
    }

    return this;
  }

  private _objectCoords: number[];
  private _textureImage: Image;
  private _textureCoords: number[];
  private _objectColors: number[];

  @Field(Editor.CLASS)
  private _material: Materials;
  private _geometry: Geomatry;

  @Field(Editor.ARRAY_NUMBER, { defaultValue: [] })
  public set objectCoords(val) {
    this._isLoadedIntoGPUMemory = false;
    this._objectCoords = val;
  }
  public get objectCoords() {
    return this._objectCoords;
  }

  @Field(Editor.RESOURCE_IMAGE)
  public set textureImage(val) {
    this._isLoadedIntoGPUMemory = false;
    this._textureImage = val;
  }
  public get textureImage() {
    return this._textureImage;
  }

  @Field(Editor.ARRAY_NUMBER)
  public set textureCoords(val) {
    this._isLoadedIntoGPUMemory = false;
    this._textureCoords = val;
  }
  public get textureCoords() {
    return this._textureCoords;
  }

  @Field(Editor.ARRAY_NUMBER)
  public set objectColors(val) {
    this._isLoadedIntoGPUMemory = false;
    this._objectColors = val;
  }
  public get objectColors() {
    return this._objectColors;
  }

  public transform: m4.Mat4 = m4.translation(v3.create(0, 0, 0));

  /**
   * references for texture rendering
   */
  private _isLoadedIntoGPUMemory: boolean = false;
  private _needTextureReload: boolean = false;

  private _coordsBuffer: AttribDataBuffer;
  private _texCoordsBuffer: AttribDataBuffer;
  private _colorBuffer: AttribDataBuffer;
  private _texture: Texture;


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
    this._coordsBuffer = AttribDataBuffer.fromData(gl, new Float32Array(this.objectCoords), 3);
    this._texCoordsBuffer = AttribDataBuffer.fromData(gl, new Float32Array(this.textureCoords), 2);
    // colors defaulted to gray
    this._colorBuffer = AttribDataBuffer.fromData(gl, new Float32Array(this.objectColors), 4);

    // load image onto the gpu
    if (this.textureImage) {
      this.loadTextureIntoGPU(gl);
    } else {
      VERBOSE &&
        console.log("No texture image supplied, will not create texture for this renderable.");
    }
  }

  private loadTextureIntoGPU(gl: WebGLRenderingContext) {
    this._texture = new Texture(gl, { image: this.textureImage });
    this._needTextureReload = false;
  }

  public getCoordsBuffer() {
    if (!this.isLoadedIntoGPUMemory()) {
      console.warn("Cant get coords buffer, this RenderableObject has not been loaded into gpu.");
      return;
    }
    return this._coordsBuffer;
  }

  public getTextureCoordsBuffer() {
    if (!this.isLoadedIntoGPUMemory()) {
      console.warn(
        "Cant get texture coords buffer, this RenderableObject has not been loaded into gpu."
      );
      return;
    }
    return this._texCoordsBuffer;
  }

  public getColorBuffer() {
    if (!this.isLoadedIntoGPUMemory()) {
      console.warn("Cant get color buffer, this RenderableObject has not been loaded into gpu.");
      return;
    }
    return this._colorBuffer;
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
    this._texture = texture;
  }

  /**
   * Returns the texture to be rendered during a render pass.
   * @returns
   */
  public getRenderingTexture(): Texture {
    return this._texture;
  }

  public hasRenderingTexture(): boolean {
    return this._texture ? true : false;
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
}
