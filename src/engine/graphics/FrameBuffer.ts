import { DepthTexture, Texture } from "./Texture";

/**
 * A buffer for off screen rendering
 */
export class FrameBuffer {
  private _frameBuffer: WebGLFramebuffer;
  private _gl: WebGLRenderingContext;
  private _frameBufferTexture: Texture;

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
  ): FrameBuffer {
    const frameBufferTexture = new Texture(gl, {
      width: width,
      height: height,
      useSmoothScaling: false,
    });
    return new this(gl, frameBufferTexture);
  }

  constructor(gl: WebGLRenderingContext, renderTargetTexture: Texture) {
    const tex = renderTargetTexture.webglTexture; //createTextureForDebug(gl);

    // create and init a frame buffer
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, // target
      gl.COLOR_ATTACHMENT0, // attachment point
      gl.TEXTURE_2D, // texture target
      tex, // texture
      0 // mip level
    );

    //https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html

    // create a depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

    // make a depth buffer and the same size as the targetTexture
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      renderTargetTexture.width,
      renderTargetTexture.height
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      depthBuffer
    );

    this._frameBuffer = frameBuffer;
    this._gl = gl;
    this._frameBufferTexture = renderTargetTexture;
  }

  /**
   * Call by the RenderPass object during render time.
   * This fucntion binds and clear the frame buffer.
   * Also setup the appropriate viewport size
   */
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
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // colour blend mode
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  public getOutputTexture() {
    return this._frameBufferTexture;
  }
}

/**
 * TODO: WIP, haven't debug yet, not sure if this is working or not
 */
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
