import { Image } from "../Image/Image";
import { Texture } from "../Texture";
import { SpriteSheetAnimationSequence } from "./SpriteSheetAnimator";

export class SpriteSheet {
  public frameRate: number;
  public _image: Image;
  private _frameWidth: number;
  private _frameHeight: number;
  private _rows: number;
  private _cols: number;

  constructor(
    image: Image = Image.createEmpty(),
    frameRate: number = 12,
    frameWidth: number = 32,
    frameHeight: number = 32
  ) {
    this._image = image;
    this.frameRate = frameRate;
    this._frameWidth = frameWidth;
    this._frameHeight = frameHeight;
    this._cols = image.width / frameWidth;
    this._rows = image.height / frameHeight;
  }

  set frameWidth(val: number) {
    this._frameWidth = val;
    this._cols = this.image.width / this._frameWidth;
  }
  get frameWidth() {
    return this._frameWidth;
  }

  set frameHeight(val: number) {
    this._frameHeight = val;
    this._rows = this.image.height / this._frameHeight;
  }
  get frameHeight() {
    return this._frameHeight;
  }
  get cols() {
    return this._cols;
  }
  get rows() {
    return this._rows;
  }

  set image(val: Image) {
    this._cols = val.width / this.frameWidth;
    this._rows = val.height / this.frameHeight;
    this._image = val;
  }

  get image() {
    return this._image;
  }

  public getAnimationSequence(
    beginFrame: number,
    endFrame: number,
    frameRate?: number
  ): SpriteSheetAnimationSequence {
    return {
      spriteSheet: this,
      beginFrame: beginFrame,
      endFrame: endFrame,
      totalFrames: endFrame - beginFrame + 1, // +1 because begin frame start from 0
      frameRate: frameRate || this.frameRate,
    };
  }

  public getTexture(gl: WebGLRenderingContext): Texture {
    return new Texture(gl, { image: this.image });
  }
}
