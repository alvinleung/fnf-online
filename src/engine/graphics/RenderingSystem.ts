import { Family, FamilyBuilder, System } from "../ecs";
import { Game } from "../Game";
import { RenderingComponent } from "./RenderingComponent";
import { Image } from "./Image/Image";
import { ShaderProgram } from "./ShaderProgram";
import { RendererSetup } from "./Renderer";
import { GraphicBuffer } from "./GraphicBufffer";
import { MatrixStack } from "./MatrixStack";
import { PositionComponent } from "../core/PositionComponent";

export class RenderingSystem extends System {
  private gl: WebGLRenderingContext;
  private texturesDict: { [name: string]: WebGLTexture } = {};
  private shaderProgram: { [name: string]: ShaderProgram } = {};
  private graphicBuffers: { [name: string]: GraphicBuffer } = {};

  private rendererConfigurators: RendererSetup[] = [];

  private renderList: Family;

  constructor(rendererConfigurators: RendererSetup[]) {
    super();
    this.rendererConfigurators = rendererConfigurators;
  }

  /**
   * Initialisation
   */

  onAttach(game: Game) {
    // initialise webgl here
    this.gl = game.getCanvas().getContext("webgl", { antialias: false }); // disable AA for pixel art
    this.texturesDict = this.convertAllImagesToTextures(this.gl, game);

    // initialise all the renderers here
    this.rendererConfigurators.forEach((renderer) => {
      renderer.setup(this.gl, this);
    });

    this.renderList = new FamilyBuilder(game)
      .include(PositionComponent, RenderingComponent)
      .build();
  }

  /**
   * Textures
   */

  private convertAllImagesToTextures(gl: WebGLRenderingContext, game: Game) {
    const allTextures: { [name: string]: WebGLTexture } = {};
    const allImages = game.assets.image.getAssetDictionary();

    Object.keys(allImages).forEach((key) => {
      const currentImage = allImages[key];
      if (currentImage.isLoaded) {
        allTextures[key] = this.createTexture(gl, currentImage.reference);
      }
    });

    return allTextures;
  }

  private createTexture(gl: WebGLRenderingContext, image: Image) {
    const texture = gl.createTexture();

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue

    if (!image.isLoaded) {
      console.warn(
        `Unable to create texture, image is not loaded. (${image.elm.src})`
      );

      // if the image is not accesable, return a opaque blue texture for placeholder
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel
      );
      return texture;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image.elm
    );

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
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
    if (image.useSmoothScaling) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    return texture;
  }

  public getTexture(name: string) {
    return this.texturesDict[name];
  }

  /**
   * For compiling and managing shader program
   */

  public useShaderProgram(name: string, program: ShaderProgram): boolean {
    if (this.shaderProgram[name]) {
      console.log(
        `Abort shader program creation, shader "${name}" already exist`
      );
      return false;
    }
    this.shaderProgram[name] = program;
    return true;
  }
  public getShaderProgram(name: string): ShaderProgram {
    return this.shaderProgram[name];
  }

  /**
   * Update loop
   * @param game
   * @param delta
   */
  update(game: Game, delta: number): void {
    const gl = this.gl;

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // render all the entitites in the family
    this.renderList.entities.forEach((e) => {
      // render the entitites base on their
      const renderComponent = e.getComponent(RenderingComponent);
      const positionComponent = e.getComponent(PositionComponent);

      const matrixStack = new MatrixStack();
      matrixStack.translate(positionComponent.x, positionComponent.y, 0);
      matrixStack.scale(10, 10, 0);

      renderComponent
        .getRenderer()
        .render(this.gl, this, matrixStack.getCurrentMatrix());
    });
  }
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
