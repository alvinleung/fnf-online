import { Entity, Family, FamilyBuilder, System } from "../ecs";
import { Game } from "../Game";
import { Image } from "./image/Image";
import { ShaderProgram } from "./ShaderProgram";
import { TransformComponent } from "../core/TransformComponent";
import { m4 } from "twgl.js";
import CameraComponent from "../camera/CameraComponent";
import { RenderableComponent, RenderableObject } from "./Renderable";
import { Texture } from "./Texture";
import { RenderPass } from "./RenderPass";
import { FrameBuffer } from "./FrameBuffer";
import { cameraMatrixFromTransform } from "../utils/MatrixUtils";
import { LightComponent } from "./Light";
let halt = false;

export class RenderingSystem extends System {
  private gl: WebGLRenderingContext;
  private _texturesRefs: { [name: string]: Texture } = {};
  private _shaderProgram: { [name: string]: ShaderProgram } = {};

  private _renderPasses: RenderPass[] = [];

  private _renderList: Family;
  private _cameras: Family;
  private _lights: Family;

  // Matrices
  private projectionMatrix: m4.Mat4;
  private cameraMatrix: m4.Mat4;
  private renderableObjects: RenderableObject[];

  constructor(renderPasses: RenderPass[]) {
    super();
    this._renderPasses = renderPasses;
  }

  /**
   * Initialisation
   */

  onAttach(game: Game) {
    // initialise webgl here
    const gl = game.getCanvas().getContext("webgl", { antialias: false, alpha: false }); // disable AA for pixel art
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

    this._cameras = new FamilyBuilder(game).include(TransformComponent, CameraComponent).build();

    this._lights = new FamilyBuilder(game).include(TransformComponent, LightComponent).build();
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
    this.cameraMatrix = cameraMatrixFromTransform(mainCamera.getComponent(TransformComponent));
    const cameraSetting = mainCamera.getComponent(CameraComponent);

    // perspective matrix
    const aspectRatio = game.getCanvas().width / game.getCanvas().height;
    this.projectionMatrix = m4.perspective(
      (cameraSetting.fov * Math.PI) / 180, // field of view
      aspectRatio, // aspect ratio
      cameraSetting.clipNear, // nearZ: clip space properties
      cameraSetting.clipFar // farZ: clip space properties
    );

    // setup the renederableObject inside for rendering
    this.renderableObjects = this._renderList.entities.reduce((filteredEntityList, entity) => {
      const renderableObject = entity.getComponent(RenderableComponent).renderableObject;

      // only configure valid renderable object, don't render unset objects
      if (renderableObject) {
        // set the transform base on the entity's transform component
        renderableObject.transform = entity.getComponent(TransformComponent).getMatrix();

        filteredEntityList.push(renderableObject);
      }
      return filteredEntityList;
    }, []);

    // for each render pass
    this._renderPasses.forEach((renderPass) => {
      // render the scene

      try {
        if (!halt) {
          renderPass.render(gl, this);
        }
      } catch (e) {
        halt = true;
        // prevent error killing the whole program
        console.error("Error from Rendering System - ");
        console.error(e);
      }
      //renderPass.render(gl, this);
    });
  }

  public getMainCamera() {
    if (
      this._cameras.entities.length === 1 &&
      this._cameras.entities[0].getComponent(CameraComponent).isActive
    ) {
      return this._cameras.entities[0];
    }

    return this._cameras.entities.find((e: Entity) => {
      if (e.getComponent(CameraComponent) && e.getComponent(CameraComponent).isActive) return;
    });
  }

  public getLights() {
    return this._lights.entities;
  }

  public getRenderables(): RenderableObject[] {
    return this.renderableObjects;
  }

  public getProjectionMatrix(): m4.Mat4 {
    return this.projectionMatrix;
  }

  public getCameraMatrix(): m4.Mat4 {
    return this.cameraMatrix;
  }
}
