import { DepthTexture, ITexture, Texture } from "./Texture";

export const DEFAULT_FRAME_BUFFER_WIDTH = 512;
export const DEFAULT_FRAME_BUFFER_HEIGHT = 512;

/**
 * A render target for off screen rendering
 */
export class FrameBuffer {
  private _frameBuffer: WebGLFramebuffer;
  private _gl: WebGLRenderingContext;
  private _frameBufferTexture: ITexture;

  /**
   * static factory methods for creating a framebuffer with certain size
   * @param gl
   * @param width
   * @param height
   */
  public static fromSize(
    gl: WebGLRenderingContext,
    width: number,
    height: number
  ) {
    const frameBufferTexture = new Texture(gl, {
      width: width,
      height: height,
      useSmoothScaling: false,
    });
    new this(gl, frameBufferTexture);
  }

  constructor(gl: WebGLRenderingContext, renderTargetTexture: ITexture) {
    // create and init a frame buffer
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, // target
      gl.DEPTH_ATTACHMENT, // attachment point
      gl.TEXTURE_2D, // texture target
      renderTargetTexture.source, // texture
      0 // mip level
    );

    this._frameBuffer = frameBuffer;
    this._gl = gl;
    this._frameBufferTexture = renderTargetTexture;
  }

  // call in render time
  public useForRendering() {
    const gl = this._gl;

    // set drawing target to this frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);

    // set the dimension of the drawing
    gl.viewport(
      0,
      0,
      this._frameBufferTexture.width,
      this._frameBufferTexture.height
    );

    // clean the viewport
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}

export class DepthBuffer {
  public readonly buffer: WebGLRenderbuffer;

  constructor(gl: WebGLRenderingContext, width: number, height: number) {
    // create a depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

    const depthTexture = new DepthTexture(gl, width, height);

    // make a depth buffer and the same size as the targetTexture
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      width,
      height
    );

    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      depthBuffer
    );

    this.buffer = depthBuffer;
  }
}
