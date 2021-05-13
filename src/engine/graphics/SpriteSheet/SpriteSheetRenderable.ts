import { Image } from "../Image/Image";
import { Plane } from "../3dRender/objects/Plane";
import { FrameBuffer } from "../FrameBuffer";
import { Texture } from "../Texture";
import { SpriteSheet } from "./SpriteSheet";
import { RenderableObject } from "../Renderable";
import { Editor, Field, Instantiable } from "../../editor";
import { SpriteSheetAnimator } from "./SpriteSheetAnimator";

/**
 * Renderable object for the SpriteSheetRenderPass
 */
// @InstantiableObject([
//   {
//     type: Editor.INSTANCE,
//     defaultValue: new SpriteSheetAnimator(Image.createEmpty(), 12, 16, 16),
//   },
// ])

@Instantiable("RenderableObject")
export class SpriteSheetRenderable extends RenderableObject {
  private _frameBuffer: FrameBuffer;
  private _spriteSheetTexture: Texture;

  @Field(Editor.CLASS, { category: "SpriteSheetAnimator" })
  public readonly animator: SpriteSheetAnimator;

  constructor(
    animator: SpriteSheetAnimator = new SpriteSheetAnimator(Image.createEmpty(), 12, 32, 32)
  ) {
    super(
      require("../3dRender/objects/Primitives").plane,
      require("../3dRender/objects/Primitives").quad_2d,
      null
    );
    animator.observe(this.textureNeedUpdate.bind(this));
    this.animator = animator;
  }

  private textureNeedUpdate() {
    this.reload();
  }

  // override the initialisation of the buffer
  protected createBufferObjectsInGPU(gl: WebGLRenderingContext) {
    super.createBufferObjectsInGPU(gl);

    const spriteSheet = this.animator.spriteSheet;
    this._spriteSheetTexture = spriteSheet.getTexture(gl);

    // create framebuffer from the texture of this
    this._frameBuffer = FrameBuffer.fromSize(gl, spriteSheet.frameWidth, spriteSheet.frameHeight);

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
