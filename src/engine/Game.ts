// import * as THREE from "three";
// import REGL from "regl";
import twgl from "twgl.js";
import { Engine } from "./ecs";

// game engine modules
import InputSystem, { KeyboardInput, MouseInput } from "./input";
import { AssetManager } from "./assets";

abstract class Game extends Engine {
  public readonly assets: AssetManager;
  public readonly input: InputSystem;
  private canvasElement: HTMLCanvasElement;

  constructor() {
    super();

    this.canvasElement = this.setupCanvas();

    this.input = this.setupInput();
    this.assets = this.setupAssets();

    // setup other game systems
    this.setupSystems();

    // finished setup
    this.gameDidInit();

    // init the game
    this.tick();
  }

  private setupCanvas(): HTMLCanvasElement {
    const canvasElement = document.createElement("canvas");
    // set the size
    canvasElement.width = window.innerWidth * window.devicePixelRatio;
    canvasElement.height = window.innerHeight * window.devicePixelRatio;
    canvasElement.style.width = "100vw";
    canvasElement.style.height = "100vh";
    window.addEventListener("resize", () => {
      canvasElement.width = window.innerWidth * window.devicePixelRatio;
      canvasElement.height = window.innerHeight * window.devicePixelRatio;
    });

    return canvasElement;
  }

  // create a system pipeline
  protected abstract setupSystems();

  // facotry function for binding input controls
  protected abstract setupInput(): InputSystem;
  protected abstract setupAssets(): AssetManager;

  protected gameDidInit() {
    // finished initialisation
    // can probably do some
  }

  public getCanvas(): HTMLCanvasElement {
    // return this.renderer.domElement;
    return this.canvasElement;
  }

  private tick() {
    // update here

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
