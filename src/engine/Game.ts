import * as THREE from "three";

// game engine modules
import InputSystem, { KeyboardInput, MouseInput } from "./Input";
import GameScene from "./GameScene";
import { AssetManager } from "./Assets/";

abstract class Game {
  protected scene: GameScene;
  protected renderer: THREE.WebGLRenderer;
  public input: InputSystem;
  public assets: AssetManager;

  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.input = this.setupInput();
    this.assets = this.setupAssets();
  }

  // facotry function for binding input controls
  protected abstract setupInput(): InputSystem;
  protected abstract setupAssets(): AssetManager;

  public setScene(scene: GameScene) {
    if (this.scene) this.scene.onSceneWillUnmount();
    this.scene = scene;
    this.scene.onSceneDidMount();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  private tick() {
    if (this.scene) {
      this.scene.onUpdate();
      this.scene.onRender(this.renderer);
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
