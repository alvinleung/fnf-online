import { Image } from "./Image";
import { Renderer, RendererSetup } from "../Renderer";
import { RenderingSystem } from "../RenderingSystem";
import { m4, v3 } from "twgl.js";
import { ShaderProgram } from "../ShaderProgram";

const TEXTURE_SHADER_FRAG = require("./shaders/2DImageShader.frag");
const TEXTURE_SHADER_VERT = require("./shaders/2DImageShader.vert");

export class ImageRendererSetup extends RendererSetup {
  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {
    // setup the Image Rendering Code here

    // compile shaders here
    const imageRendererShader = new ShaderProgram(
      gl,
      TEXTURE_SHADER_VERT,
      TEXTURE_SHADER_FRAG
    );

    // verticies for a quad
    const quadVerticies = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];

    imageRendererShader.initAttrib(
      "a_position",
      new Float32Array(quadVerticies),
      2
    );
    imageRendererShader.initAttrib(
      "a_texcoord",
      new Float32Array(quadVerticies),
      2
    );

    // add the shader to the rendering system
    system.useShaderProgram("imageRendererShader", imageRendererShader);
  }
}

export class ImageRenderer extends Renderer {
  private image: Image;
  private scale: number = 1;

  constructor(image: Image) {
    super();
    this.image = image;
  }
  public setResourceName(image: Image) {
    this.image = image;
  }

  // this will be called per frame
  public render(
    gl: WebGLRenderingContext,
    system: RenderingSystem,
    transformMatrix: m4.Mat4
  ) {
    const imageRendererShader = system.getShaderProgram("imageRendererShader");
    const tex = system.getTexture(this.image.name);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // const texWidth = this.image.width;
    // const texHeight = this.image.height;
    const dstX = 0;
    const dstY = 0;

    // Tell WebGL to use our shader program pair
    imageRendererShader.useProgram();

    // Setup the attributes to pull data from our buffers
    imageRendererShader.useAttribForRendering("a_position");
    imageRendererShader.useAttribForRendering("a_texcoord");

    // this matrix will convert from pixels to clip space
    let matrix = m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    // let the rendering result affected by the context
    matrix = m4.multiply(matrix, transformMatrix);

    // this matrix will translate our quad to dstX, dstY
    // matrix = m4.translate(matrix, dstX, dstY, 0);
    matrix = m4.translate(matrix, v3.create(dstX, dstY, 0));

    // this matrix will scale our 1 unit quad
    // from 1 unit to texWidth, texHeight units
    // matrix = m4.scale(matrix, texWidth, texHeight, 1);
    matrix = m4.scale(
      matrix,
      v3.create(this.image.width, this.image.height, 1)
    );

    // Set the matrix.
    imageRendererShader.writeUniformMat4("u_matrix", matrix);

    // Tell the shader to get the texture from texture unit 0
    imageRendererShader.writeUniformInt("u_texture", 0);

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
