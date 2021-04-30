import { Image } from "./Image";

export interface ITexture {
  source: WebGLTexture;
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
  public readonly width: number;
  public readonly height: number;

  constructor(gl: WebGLRenderingContext, config?: TextureConfig) {
    const {
      image,
      width = image.width,
      height = image.height,
      useSmoothScaling = false,
    } = config;

    const texture = gl.createTexture();

    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image ? image.elm : null
    );

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
    this.width = width;
    this.height = height;
  }

  public get source() {
    return this._webglTexture;
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

  public get source() {
    return this._webglTexture;
  }
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
