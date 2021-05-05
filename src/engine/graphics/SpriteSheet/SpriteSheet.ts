import { Image } from "../Image/Image";
import { Texture } from "../Texture";
import { SpriteSheetAnimationSequence } from "./SpriteSheetAnimation";

export class SpriteSheet {
  public readonly frameRate: number;
  public readonly frameWidth: number;
  public readonly frameHeight: number;
  public readonly rows: number;
  public readonly cols: number;
  public readonly image: Image;

  constructor(
    image: Image,
    frameRate: number,
    frameWidth: number,
    frameHeight: number
  ) {
    this.image = image;
    this.frameRate = frameRate;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.cols = image.width / frameWidth;
    this.rows = image.height / frameHeight;
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
