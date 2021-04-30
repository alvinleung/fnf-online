import { m4, v3 } from "twgl.js";
import { Renderer, RendererSetup } from "../Renderer";
import { RenderingSystem } from "../RenderingSystem";
import { ShaderProgram } from "../ShaderProgram";
import { SpriteSheet, SpriteSheetAnimator } from "./SpriteSheet";

const SPRITE_SHEET_VERT = require("./ShaderSpriteSheet.vert");
const SPRITE_SHEET_FRAG = require("./ShaderSpriteSheet.frag");

export class SpriteSheetRendererSetup extends RendererSetup {
  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {
    // setup the Image Rendering Code here

    // compile shaders here
    const program = new ShaderProgram(gl, SPRITE_SHEET_VERT, SPRITE_SHEET_FRAG);

    // verticies for a quad
    const quadVerticies = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];

    program.initAttrib("a_position", new Float32Array(quadVerticies), 2);
    program.initAttrib("a_texcoord", new Float32Array(quadVerticies), 2);

    // add the shader to the rendering system
    system.useShaderProgram("spriteSheetRenderer", program);
  }
}

export class SpriteSheetRenderer extends Renderer {
  private animator: SpriteSheetAnimator;
  private spriteSheet: SpriteSheet;

  constructor(animator: SpriteSheetAnimator) {
    super();
    this.animator = animator;
    this.spriteSheet = animator.spriteSheet;
  }
  public render(
    gl: WebGLRenderingContext,
    system: RenderingSystem,
    transformMatrix: m4.Mat4
  ) {
    const program = system.getShaderProgram("spriteSheetRenderer");
    program.useProgram();

    const tex = system.getTexture(this.spriteSheet.image.name);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Setup the attributes to pull data from our buffers
    program.prepareAttribForRendering("a_position");
    program.prepareAttribForRendering("a_texcoord");

    // this matrix will convert from pixels to clip space
    let matrix = m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    // let the rendering result affected by the context
    matrix = m4.multiply(matrix, transformMatrix);

    // cols and rows in the tile
    const [col, row] = this.animator.getCurrentAnimationTilePos();

    // drawing target pos
    const dstX = 0;
    const dstY = 0;

    const dstWidth = this.spriteSheet.frameWidth;
    const dstHeight = this.spriteSheet.frameHeight;

    const srcX = this.spriteSheet.frameWidth * col;
    const srcY = this.spriteSheet.frameHeight * row;

    const srcWidth = this.spriteSheet.frameWidth;
    const srcHeight = this.spriteSheet.frameHeight;

    const texWidth = this.spriteSheet.image.width;
    const texHeight = this.spriteSheet.image.height;

    // this matrix will translate our quad to dstX, dstY
    // matrix = m4.translate(matrix, dstX, dstY, 0);
    matrix = m4.translate(matrix, v3.create(dstX, dstY, 0));

    matrix = m4.scale(matrix, v3.create(dstWidth, dstHeight, 1));

    // Set the matrix.
    program.writeUniformMat4("u_matrix", matrix);

    let textureMatrix = m4.translation(
      v3.create(srcX / texWidth, srcY / texHeight, 0)
    );
    textureMatrix = m4.scale(
      textureMatrix,
      v3.create(srcWidth / texWidth, srcHeight / texHeight, 1)
    );

    // set the clipping position of the image texure
    program.writeUniformMat4("u_textureMatrix", textureMatrix);

    // Tell the shader to get the texture from texture unit 0
    program.writeUniformInt("u_texture", 0);

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
