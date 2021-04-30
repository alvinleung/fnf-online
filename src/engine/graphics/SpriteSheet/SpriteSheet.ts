import { AssetConfig } from "../../assets/AssetLoader";
import { Image } from "../Image";

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
}

/**
 * This is a state machine for controlling spritesheet animation
 */
export class SpriteSheetAnimator {
  public readonly spriteSheet: SpriteSheet;
  private currentAnimation: SpriteSheetAnimationSequence;

  private isPlaying: boolean = false;
  private loopAnimation: boolean = false;

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
