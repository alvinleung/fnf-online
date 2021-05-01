import { m4, v3 } from "twgl.js";
import { FrameBuffer } from "../FrameBuffer";
import { RenderableObject } from "../Renderable";
import { RenderingSystem } from "../RenderingSystem";
import { RenderPass } from "../RenderPass";
import { ShaderProgram } from "../ShaderProgram";
import { SpriteSheetRenderable } from "./SpriteSheetAnimation";

const SPRITE_SHEET_SHADER_VERT = require("./ShaderSpriteSheet.vert");
const SPRITE_SHEET_SHADER_FRAG = require("./ShaderSpriteSheet.frag");

export class SpriteSheetRenderPass extends RenderPass {
  private _program: ShaderProgram;
  private _frameBuffer: FrameBuffer;

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {
    const program = new ShaderProgram(
      gl,
      SPRITE_SHEET_SHADER_VERT,
      SPRITE_SHEET_SHADER_FRAG
    );
    this._program = program;

    // create a framebuffer for the program
    // const bufferOutputTexture = new Texture(gl, { width: 512, height: 512 });
    // this._frameBuffer = new FrameBuffer(gl, bufferOutputTexture);
  }

  public render(
    gl: WebGLRenderingContext,
    system: RenderingSystem,
    cameraMatrix: m4.Mat4,
    projectionMatrix: m4.Mat4,
    renderableObjects: RenderableObject[]
  ) {
    const program = this._program;
    program.useProgram();

    // this._frameBuffer.useForRendering();

    renderableObjects.forEach((renderableObject) => {
      if (!(renderableObject instanceof SpriteSheetRenderable)) return;
      const animation: SpriteSheetRenderable = renderableObject as SpriteSheetRenderable;

      if (!renderableObject.isLoadedIntoGPUMemory()) {
        renderableObject.loadIntoGPU(gl);
      }

      // set the texture attributes
      if (!animation.hasSpriteSheetTexture()) return;

      // access the sprite sheet resources
      const spriteSheet = animation.animator.spriteSheet;
      const finalRenderingTexture = animation.getRenderingTexture();

      // bindBuffer
      animation.getFrameBuffer().useForRendering();

      // bind texture
      animation.getSpriteSheetTexture().useForRendering();

      // add the texture onto the gpu program
      program.useAttribForRendering("a_position", animation.getCoordsBuffer());

      program.useAttribForRendering(
        "a_texcoord",
        animation.getTextureCoordsBuffer()
      );

      // cols and rows in the tile
      const [col, row] = animation.animator.getCurrentAnimationTilePos();

      // drawing target pos
      const dstX = 0;
      const dstY = 0;
      const dstWidth = spriteSheet.frameWidth;
      const dstHeight = spriteSheet.frameHeight;

      const srcClipX = spriteSheet.frameWidth * col;
      const srcClipY = spriteSheet.frameHeight * row;
      const srcClipWidth = dstWidth;
      const srcClipHeight = dstHeight;

      const texWidth = spriteSheet.image.width;
      const texHeight = spriteSheet.image.height;

      // this matrix will convert from pixels to clip space
      let matrix = m4.ortho(
        -finalRenderingTexture.width,
        finalRenderingTexture.width,
        -finalRenderingTexture.height,
        finalRenderingTexture.height,
        -1,
        1
      );

      matrix = m4.translate(matrix, v3.create(dstX, dstY, 0));
      matrix = m4.scale(matrix, v3.create(dstWidth, dstHeight, 1));
      program.writeUniformMat4("u_matrix", matrix);

      // set the clipping position of the image texure
      let textureMatrix = m4.translation([
        srcClipX / texWidth,
        srcClipY / texHeight,
        0,
      ]);
      textureMatrix = m4.scale(textureMatrix, [
        srcClipWidth / texWidth,
        srcClipHeight / texHeight,
        1,
      ]);

      program.writeUniformMat4("u_textureMatrix", textureMatrix);
      program.writeUniformInt("u_texture", 0); //get the texture from texture unit 0

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });

    return this._frameBuffer;
  }
}
