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

  protected SHADER_PROGRAM_NAME = "ShaderSpriteSheet";

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {
    // init shader progam
    const program = new ShaderProgram(
      gl,
      SPRITE_SHEET_SHADER_VERT,
      SPRITE_SHEET_SHADER_FRAG
    );
    system.useShaderProgram(this.SHADER_PROGRAM_NAME, program);
  }

  public render(
    gl: WebGLRenderingContext,
    system: RenderingSystem,
  ) {
    const program = system.getShaderProgram(this.SHADER_PROGRAM_NAME);
    program.useProgram();
    const renderableObjects = system.getRenderables();
    
    renderableObjects.forEach((renderableObject) => {
      if (!(renderableObject instanceof SpriteSheetRenderable)) return;
      const animation: SpriteSheetRenderable = renderableObject as SpriteSheetRenderable;

      if (!renderableObject.isLoadedIntoGPUMemory()) {
        renderableObject.loadIntoGPU(gl);
      }
      // set the texture attributes
      if (!animation.hasSpriteSheetTexture()) return;

      // draw the animation out
      this.renderSpriteSheetAnimation(gl, program, animation);
    });
  }

  /**
   * Render out individual sprite sheet animation onto a texture
   * @param gl
   * @param program
   * @param animation
   */
  private renderSpriteSheetAnimation(
    gl: WebGLRenderingContext,
    program: ShaderProgram,
    animation: SpriteSheetRenderable
  ) {
    // access the sprite sheet resources
    const spriteSheet = animation.animator.spriteSheet;

    // prepare for rendering
    animation.getFrameBuffer().useForRendering();
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

    // this matrix will convert from pixels to clip space of the target rendering texture
    const targetRenderingTexture = animation.getRenderingTexture();
    let matrix = m4.ortho(
      -targetRenderingTexture.width,
      targetRenderingTexture.width,
      -targetRenderingTexture.height,
      targetRenderingTexture.height,
      -1,
      1
    );
    matrix = m4.translate(matrix, v3.create(dstX, dstY, 0));
    matrix = m4.scale(matrix, v3.create(dstWidth, dstHeight, 1));
    program.writeUniformMat4("u_matrix", matrix);

    // setup uniform of the clipping position of the image texure
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

    //get the texture from texture unit 0
    program.writeUniformInt("u_texture", 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
