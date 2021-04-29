import { Entity, Family, FamilyBuilder, System } from "../ecs";
import { Game } from "../Game";
import { RenderingComponent } from "./RenderingComponent";
import { Image } from "./Image/Image";
import { ShaderProgram } from "./ShaderProgram";
import { RendererSetup } from "./Renderer";
import { MatrixStack } from "./MatrixStack";
import { TransformComponent } from "../core/TransformComponent";
//import { flatten, lookAt, perspective } from "../../../../../Webgl/MV";
import { config } from "node:process";
import { m4 } from "twgl.js";
import CameraComponent from "../camera/CameraComponent";

// designing for 1920x1080
const BASE_VIEWPORT_WIDTH = 1920;
const CLIENT_WIDTH = window.innerWidth;
const DEFAULT_MAGNIFICAITON = 4;
const WORLD_SCALING =
  (CLIENT_WIDTH / BASE_VIEWPORT_WIDTH) * DEFAULT_MAGNIFICAITON;

export class RenderingSystem extends System {
  private gl: WebGLRenderingContext;
  private _texturesRefs: { [name: string]: WebGLTexture } = {};
  private _shaderProgram: { [name: string]: ShaderProgram } = {};

  private _rendererConfigurators: RendererSetup[] = [];

  private _renderList: Family;
  private _cameras: Family;

  constructor(rendererConfigurators: RendererSetup[]) {
    super();
    this._rendererConfigurators = rendererConfigurators;
  }

  /**
   * Initialisation
   */

  onAttach(game: Game) {
    // initialise webgl here
    const gl = game
      .getCanvas()
      .getContext("webgl", { antialias: false, alpha: false }); // disable AA for pixel art
    this.gl = gl;

    this._texturesRefs = this.convertAllImagesToTextures(
      this.gl,
      game.assets.image.getAssetDictionary()
    );

    // Allow different texture blend together when overlap.
    // to support png texture transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // initialise all the renderers here
    this._rendererConfigurators.forEach((renderer) => {
      renderer.setup(this.gl, this);
    });

    // create a cached sub list of entitites that are going to be rendered
    this._renderList = new FamilyBuilder(game)
      .include(TransformComponent, RenderingComponent)
      .build();

    this._cameras = new FamilyBuilder(game)
      .include(TransformComponent, CameraComponent)
      .build();
  }

  /**
   * Textures
   */

  private convertAllImagesToTextures(
    gl: WebGLRenderingContext,
    allImages: { [name: string]: Image }
  ) {
    const allTextures: { [name: string]: WebGLTexture } = {};

    Object.keys(allImages).forEach((key) => {
      const currentImage = allImages[key];
      allTextures[key] = createTexture(gl, currentImage);
    });

    return allTextures;
  }

  public getTexture(name: string) {
    return this._texturesRefs[name];
  }

  /**
   * For compiling and managing shader program
   */

  public useShaderProgram(name: string, program: ShaderProgram): boolean {
    if (this._shaderProgram[name]) {
      console.log(
        `Abort shader program creation, shader "${name}" already exist in the record. Please choose another name.`
      );
      return false;
    }
    this._shaderProgram[name] = program;
    return true;
  }
  public getShaderProgram(name: string): ShaderProgram {
    return this._shaderProgram[name];
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
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // render the camera

    const mainCamera = this.getMainCamera();
    if (mainCamera) {
      const cameraComponent = mainCamera.getComponent(CameraComponent);
      const cameraTransform = mainCamera.getComponent(TransformComponent);
      // handle camera update here
      this.processCameraUpdate(this.gl, cameraComponent, cameraTransform);
    }

    // render all the entitites in the family
    this._renderList.entities.forEach((e) => {
      // render the entitites base on their
      const renderComponent = e.getComponent(RenderingComponent);
      const transformComponent = e.getComponent(TransformComponent);

      const matrixStack = new MatrixStack();

      matrixStack.setCurrentMatrix(transformComponent.getMatrix());
      matrixStack.scale(WORLD_SCALING, WORLD_SCALING, 0);

      // camera matrix
      const cameraMatrix = m4.inverse( m4.lookAt( [0,0,1], [0,0,0], [0,1,0] ));

      // perspective matrix
      const perspectiveMatrix = m4.perspective(
        90 * Math.PI / 180,  // field of view
        game.getCanvas().width / game.getCanvas().height, // aspect ratio
        1,   // nearZ: clip space properties
        2000 // farZ: clip space properties
      );


      renderComponent
        .getRenderer()
        .render(this.gl, this, matrixStack.getCurrentMatrix(), cameraMatrix, perspectiveMatrix);
    });
  }

  private processCameraUpdate(
    gl: WebGLRenderingContext,
    cameraConfg: CameraComponent,
    transform: TransformComponent
  ) {}

  private getMainCamera() {
    if (this._cameras.entities.length === 1) {
      return this._cameras.entities[0];
    }

    return this._cameras.entities.find((e: Entity) => {
      if (!e.getComponent(CameraComponent)) return;
    });
  }
}

/**
 * Local scope
 */

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function createTexture(gl: WebGLRenderingContext, image: Image) {
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
