// import * as THREE from "three";
// import REGL from "regl";
import { Engine } from "./ecs";

// game engine modules
import InputSystem, { KeyboardInput, MouseInput } from "./input";
import { AssetLoader, AssetManager } from "./assets";

export abstract class Game extends Engine {
  public readonly assets: AssetManager;
  public readonly input: InputSystem;
  private canvasElement: HTMLCanvasElement;

  // when enabled, it will render more pixels to make things
  // look cleaner in retina display, but it will increase
  // rendering cost
  public readonly SCALE_FOR_RETINA_DISPLAY: boolean = true;

  private previousTick = Date.now();

  constructor() {
    super();

    this.canvasElement = this.setupCanvas();
    this.input = this.setupInput();

    // setup load all assets
    this.assets = this.setupAssets();
    Object.values(this.assets).forEach((assetLoader: AssetLoader<any>) => {
      assetLoader.loadAll();
      assetLoader.addLoadedListener(handleLoadProgress);
    });

    let that = this;

    function handleLoadProgress() {
      if (!that.isAllAssetAloaded()) return;
      // continue the rest of initialisation after all the assets loaded

      // setup other game systems
      that.setupSystems();

      // finished setup
      that.gameDidInit();

      // init the game
      that.tick();
    }
  }
  private isAllAssetAloaded() {
    const isUnfinish = Object.values(this.assets).some(
      (assetLoader: AssetLoader<any>) => assetLoader.isLoaded() === false
    );
    return !isUnfinish;
  }

  private setupCanvas(): HTMLCanvasElement {
    const canvasElement = document.createElement("canvas");
    const scaleFactor = this.SCALE_FOR_RETINA_DISPLAY
      ? window.devicePixelRatio
      : 1;

    // set the size
    canvasElement.width = window.innerWidth * scaleFactor;
    canvasElement.height = window.innerHeight * scaleFactor;
    canvasElement.style.width = "100vw";
    canvasElement.style.height = "100vh";
    window.addEventListener("resize", () => {
      canvasElement.width = window.innerWidth * scaleFactor;
      canvasElement.height = window.innerHeight * scaleFactor;
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
    const currentTick = Date.now();
    const deltaTimeInSeconds = (currentTick - this.previousTick) * 0.001;
    this.update(deltaTimeInSeconds);
    this.previousTick = currentTick;

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
