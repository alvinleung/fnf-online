// import * as THREE from "three";
// import REGL from "regl";
import twgl from "twgl.js";

// game engine modules
import InputSystem, { KeyboardInput, MouseInput } from "./Input";
import GameScene from "./GameScene";
import { AssetManager } from "./assets";

abstract class Game {
  protected scene: GameScene;
  public readonly input: InputSystem;
  public readonly assets: AssetManager;

  private canvasElement: HTMLCanvasElement;

  constructor() {
    this.canvasElement = this.setupCanvas();

    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.input = this.setupInput();
    this.assets = this.setupAssets();

    // init the game
    this.tick();
  }

  private setupCanvas(): HTMLCanvasElement {
    const canvasElement = document.createElement("canvas");
    // set the size
    canvasElement.width = window.innerWidth * window.devicePixelRatio;
    canvasElement.width = window.innerHeight * window.devicePixelRatio;
    const gl = canvasElement.getContext("webgl");
    const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

    return canvasElement;
  }

  // facotry function for binding input controls
  protected abstract setupInput(): InputSystem;
  protected abstract setupAssets(): AssetManager;

  public setScene(scene: GameScene) {
    if (this.scene) this.scene.onSceneWillUnmount(this);
    this.scene = scene;
    this.scene.onSceneDidMount(this);
  }

  public getCanvas(): HTMLCanvasElement {
    // return this.renderer.domElement;
    return this.canvasElement;
  }

  private tick() {
    if (this.scene) {
      this.scene.onUpdate();
      // this.scene.onRender(this.renderer);
    }

    // get ready for next update
    requestAnimationFrame(() => {
      this.tick();
    });
  }
}

// function init(): HTMLCanvasElement {
//   const scene = new THREE.Scene();
//   const camera = new THREE.PerspectiveCamera(
//     75,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
//   );

//   const geometry = new THREE.BoxGeometry();
//   const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//   const cube = new THREE.Mesh(geometry, material);
//   scene.add(cube);
//   scene.add(camera);

//   camera.position.z = 5;

//   // add the renderer to html
//   const renderer = new THREE.WebGLRenderer();
//   renderer.setSize(window.innerWidth, window.innerHeight);

//   // start the update function
//   update(renderer, scene, camera);

//   return renderer.domElement;
// }

// function update(
//   renderer: THREE.WebGLRenderer,
//   scene: THREE.Scene,
//   camera: THREE.Camera
// ) {
//   if (InputSystem.getAxis("x") !== 0) {
//     console.log("test " + InputSystem.getAxis("x"));
//   }

//   // render the game scene
//   renderer.render(scene, camera);

//   // get ready for next update
//   requestAnimationFrame(() => {
//     update(renderer, scene, camera);
//   });
// }

export default Game;
