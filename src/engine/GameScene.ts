import * as THREE from "three";

import EntitiesController from "./core/EntitiesController";
import Entity from "./core/Entity";
import Game from "./Game";

class GameScene {
  protected scene: THREE.Scene;
  protected camera: THREE.Camera;
  protected readonly entities: EntitiesController;
  protected readonly game: Game; // ref to the game object

  constructor(game: Game) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.entities = new EntitiesController();
  }

  public addEntity(entity: Entity) {
    this.entities.add(entity, this.game, this);
  }
  public removeEntity(entity: Entity) {
    this.entities.remove(entity, this.game, this);
  }

  // life cycle
  public onSceneDidMount(game: Game) {
    // init here
  }
  public onSceneWillUnmount(game: Game) {
    // when remove here
  }

  public onUpdate() {
    // when update
    this.entities.onUpdate(this.game, this);
  }
  public onRender(renderer: THREE.WebGLRenderer) {
    this.entities.onRender(this.game, this);
    // render the scene
    renderer.render(this.scene, this.camera);
  }

  public getCamera() {
    return this.camera;
  }
  public getScene() {
    return this.scene;
  }
}

export default GameScene;
