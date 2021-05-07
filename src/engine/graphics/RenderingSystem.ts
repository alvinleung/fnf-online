import { Entity, Family, FamilyBuilder, System } from "../ecs";
import { Game } from "../Game";
import { Image } from "./Image/Image";
import { ShaderProgram } from "./ShaderProgram";
import { TransformComponent } from "../core/TransformComponent";
import { m4} from "twgl.js";
import CameraComponent from "../camera/CameraComponent";
import { RenderableComponent } from "./Renderable";
import { Texture } from "./Texture";
import { RenderPass } from "./RenderPass";
import { FrameBuffer } from "./FrameBuffer";
import { cameraMatrixFromTransform } from "../utils/MatrixUtils";

/**
 * RENDERING CONFIG
 */
export module RenderingConfig {
  const FOV = 54.4;
  const CLIP_NEAR = 1;
  const CLIP_FAR = 2000;

  export function getPerspectiveMatrix(aspectRatio:number){
    return m4.perspective(
      (FOV * Math.PI) / 180, // field of view
      aspectRatio, // aspect ratio
      CLIP_NEAR, // nearZ: clip space properties
      CLIP_FAR // farZ: clip space properties
    );
  }
} 

export class RenderingSystem extends System {
  private gl: WebGLRenderingContext;
  private _texturesRefs: { [name: string]: Texture } = {};
  private _shaderProgram: { [name: string]: ShaderProgram } = {};

  private _renderPasses: RenderPass[] = [];

  private _renderList: Family;
  private _cameras: Family;

  constructor(renderPasses: RenderPass[]) {
    super();
    this._renderPasses = renderPasses;
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
    this._renderPasses.forEach((renderPass) => {
      renderPass.setup(this.gl, this);
    });

    // create a cached sub list of entitites that are going to be rendered
    this._renderList = new FamilyBuilder(game)
      .include(TransformComponent, RenderableComponent)
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
    const allTextures: { [name: string]: Texture } = {};

    Object.keys(allImages).forEach((key) => {
      const currentImage = allImages[key];
      // allTextures[key] = createTexture(gl, currentImage);
      allTextures[key] = new Texture(gl, { image: currentImage });
    });

    return allTextures;
  }

  public getTexture(name: string) {
    return this._texturesRefs[name].webglTexture;
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
    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // for 3d rendering
    gl.enable(gl.DEPTH_TEST);

    const mainCamera = this.getMainCamera();
    if (!mainCamera) {
      console.warn("No active camera found in the entities, aborting draw.");
      return;
    }

    // camera matrix
    const cameraMatrix = cameraMatrixFromTransform(mainCamera.getComponent(TransformComponent));

    // perspective matrix
    const aspectRatio = game.getCanvas().width / game.getCanvas().height;
    const perspectiveMatrix = RenderingConfig.getPerspectiveMatrix(aspectRatio);
    

    // setup the renederableObject inside for rendering
    const renderablObjects = this._renderList.entities.map((e) => {
      const renderableObject = e.getComponent(RenderableComponent)
        .renderableObject;

      // set the transform base on the entity's transform component
      renderableObject.transform = e
        .getComponent(TransformComponent)
        .getMatrix();

      return renderableObject;
    });

    // for each render pass
    this._renderPasses.forEach((renderPass) => {
      // render the scene
      renderPass.render(
        gl,
        this,
        cameraMatrix,
        perspectiveMatrix,
        renderablObjects
      );
    });
  }

  private getMainCamera() {
    if (this._cameras.entities.length === 1) {
      return this._cameras.entities[0];
    }

    return this._cameras.entities.find((e: Entity) => {
      if (!e.getComponent(CameraComponent)) return;
    });
  }
}
