import { Image } from "./Image";

export interface ITexture {
  webglTexture: WebGLTexture;
  width: number;
  height: number;
}

interface TextureConfig {
  image?: Image;
  width?: number;
  height?: number;
  useSmoothScaling?: boolean;
}

export class Texture implements ITexture {
  private _webglTexture: WebGLTexture;
  private _width: number;
  private _height: number;
  private _gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, config?: TextureConfig) {
    const image = config.image;

    const desiredWidth = config.width;
    const desiredHeight = config.height;

    const width =
      desiredWidth !== undefined ? desiredWidth : image && image.width;
    const height =
      desiredHeight !== undefined ? desiredHeight : image && image.height;

    const useSmoothScaling = config.useSmoothScaling || false;

    this.loadImageIntoBuffer(gl, image, width, height, useSmoothScaling);
    this._gl = gl;
  }

  private loadImageIntoBuffer(
    gl: WebGLRenderingContext,
    image: Image,
    width: number,
    height: number,
    useSmoothScaling = false
  ) {
    const texture = gl.createTexture();

    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    gl.bindTexture(gl.TEXTURE_2D, texture);

    if (image && image.elm) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        image.elm
      );
    } else {
      // create and empty texture if there are no image supplied
      // const data = new ImageData(width, height);
      // define size and format of level 0
      const level = 0;
      const internalFormat = gl.RGBA;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      const data = null;
      gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        format,
        type,
        data
      );
    }

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(width) && isPowerOf2(height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // For scaling pixel art, we want to use gl.NEAREST for scaling
    // to preserve the crisp pixel look when magnifying. gl.LINEAR will
    // yeild a muddy result when scale up.
    if (useSmoothScaling) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    this._webglTexture = texture;
    this._width = width;
    this._height = height;
  }

  public get width() {
    return this._width;
  }

  public get height() {
    return this._height;
  }

  public get webglTexture() {
    return this._webglTexture;
  }

  public useForRendering() {
    this._gl.bindTexture(this._gl.TEXTURE_2D, this._webglTexture);
  }
}

export class DepthTexture implements ITexture {
  private _webglTexture: WebGLTexture;
  public readonly width: number;
  public readonly height: number;

  constructor(gl: WebGLRenderingContext, width: number, height: number) {
    // check if deph texture supported in webgl
    const ext = gl.getExtension("WEBGL_depth_texture");
    if (!ext) {
      new Error("need WEBGL_depth_texture");
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D, // target
      0, // mip level
      gl.DEPTH_COMPONENT, // internal format
      width, // width
      height, // height
      0, // border
      gl.DEPTH_COMPONENT, // format
      gl.UNSIGNED_INT, // type
      null
    ); // data

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.width = width;
    this.height = height;
  }

  public get webglTexture() {
    return this._webglTexture;
  }
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
