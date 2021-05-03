import { Image } from "../Image";
import { Plane } from "../3dRender/objects/Plane";
import { FrameBuffer } from "../FrameBuffer";
import { Texture } from "../Texture";
import { SpriteSheet } from "./SpriteSheet";
import { RenderableObject } from "../Renderable";

/**
 * Renderable object for the SpriteSheetRenderPass
 */
export class SpriteSheetRenderable extends RenderableObject {
  private _frameBuffer: FrameBuffer;
  private _spriteSheetTexture: Texture;

  public readonly animator: SpriteSheetAnimator;

  constructor(animator: SpriteSheetAnimator) {
    super(
      require("../3dRender/objects/Primitives").plane,
      require("../3dRender/objects/Primitives").quad_2d,
      animator.spriteSheet.image
    );
    this.animator = animator;
  }

  // override the initialisation of the buffer
  protected createBufferObjectsInGPU(gl: WebGLRenderingContext) {
    super.createBufferObjectsInGPU(gl);

    const spriteSheet = this.animator.spriteSheet;
    this._spriteSheetTexture = spriteSheet.getTexture(gl);

    // create framebuffer from the texture of this
    this._frameBuffer = FrameBuffer.fromSize(
      gl,
      spriteSheet.frameWidth,
      spriteSheet.frameHeight
    );

    // set the output texture for render
    this.setRenderingTexture(this._frameBuffer.getOutputTexture());
  }

  public getFrameBuffer(): FrameBuffer {
    if (!this._frameBuffer) {
      console.warn(`Unable to access frame buffer: not initialised`);
    }

    return this._frameBuffer;
  }

  /**
   * Require the renderable object
   * @returns
   */
  public getSpriteSheetTexture(): Texture {
    if (!this.isLoadedIntoGPUMemory()) {
      console.warn("Sprite sheet have not been loaded into gpu");
    }
    return this._spriteSheetTexture;
  }
  public hasSpriteSheetTexture(): boolean {
    if (!this.isLoadedIntoGPUMemory()) {
      console.warn("Sprite sheet have not been loaded into gpu");
    }
    return this._spriteSheetTexture ? true : false;
  }
}

/**
 * This is a state machine for controlling spritesheet animation
 */
export class SpriteSheetAnimator {
  public readonly spriteSheet: SpriteSheet;
  private currentAnimation: SpriteSheetAnimationSequence;

  private isPlaying: boolean = false;
  private loopAnimation: boolean = false;

  private _frameBuffer: FrameBuffer;
  private _spriteSheetTexture: Texture;

  private animationLookupTable: {
    [animationName: string]: SpriteSheetAnimationSequence;
  } = {};

  // save the initial play time for animation in order to get current frame;
  private playBeginTime: number = Date.now();

  constructor(
    image: Image,
    frameRate: number,
    frameWidth: number,
    frameHeight: number
  ) {
    this.spriteSheet = new SpriteSheet(
      image,
      frameRate,
      frameWidth,
      frameHeight
    );
  }

  /**
   * Define an animation with label name from the state machine
   * @param animationLabel
   */
  public defineAnimation(
    animationLabel: string,
    beginFrame: number,
    endFrame: number,
    frameRate?: number
  ) {
    // define aniamtion here
    this.animationLookupTable[
      animationLabel
    ] = this.spriteSheet.getAnimationSequence(beginFrame, endFrame, frameRate);
  }
  /**
   * Begin playing the animation
   * @param animation
   */
  public play(animation: SpriteSheetAnimationSequence | string) {
    this.isPlaying = true;
    this.playBeginTime = Date.now();

    // play the animation label or an animation sequence
    this.currentAnimation =
      typeof animation === "string"
        ? this.animationLookupTable[animation]
        : animation;
  }

  /**
   * Begin playing the animation sequence, restart when animation finish
   * @param animation
   */
  public loop(animation: SpriteSheetAnimationSequence | string) {
    this.loopAnimation = true;
    this.play(animation);
  }

  public stop() {
    this.isPlaying = false;
  }

  public getElapsedTime(): number {
    return (Date.now() - this.playBeginTime) * 0.001;
  }

  public getCurrentAnimationTilePos(): [col: number, row: number] {
    const currentFrame = this.getCurrentAnimationFrame();

    // calculate which col and row to play
    const col = currentFrame % this.spriteSheet.cols;
    const row = Math.floor(currentFrame / this.spriteSheet.cols);

    return [col, row];
  }

  public getCurrentAnimationFrame(): number {
    if (!this.isPlaying) return 0;

    // calculate which animation frame is it right now
    const frameRate = this.currentAnimation.frameRate;
    const elapsedTimeInSeconds = (Date.now() - this.playBeginTime) * 0.001;

    // calculate how much frames have elapsed
    const elapsedFrames = Math.round(frameRate * elapsedTimeInSeconds);

    // not looping and at the end of the naimation
    if (
      elapsedFrames >= this.currentAnimation.totalFrames &&
      !this.loopAnimation
    ) {
      this.stop();
      return this.currentAnimation.endFrame;
    }

    // return the playhead of the animation
    const currentFrame =
      this.currentAnimation.beginFrame +
      (elapsedFrames % this.currentAnimation.totalFrames);
    return currentFrame;
  }
}
/**
 * Stateless declaration of the SpriteSheetAnimation Information
 */
export interface SpriteSheetAnimationSequence {
  spriteSheet: SpriteSheet;
  frameRate: number;
  beginFrame: number;
  endFrame: number;
  totalFrames: number;
}

export interface SpriteSheetAnimationFrame {
  animation: SpriteSheetAnimationSequence;
  frame: number;
}