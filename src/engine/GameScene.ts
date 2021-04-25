import * as THREE from "three";

import EntitiesController from "./Entity/EntitiesController";
import Entity from "./Entity/Entity";
import Game from "./Game";

class GameScene {
  protected scene: THREE.Scene;
  protected camera: THREE.Camera;
  protected entities: EntitiesController;

  constructor(game: Game) {
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
    this.entities.add(entity);
  }
  public removeEntity(entity: Entity) {
    this.entities.remove(entity);
  }

  // life cycle
  public onSceneDidMount() {
    // init here
  }
  public onSceneWillUnmount() {
    // when remove here
  }

  public onUpdate() {
    // when update
    this.entities.onUpdate();
  }
  public onRender(renderer: THREE.WebGLRenderer) {
    this.entities.onRender();
    // render the scene
    renderer.render(this.scene, this.camera);
  }

  public getCamera() {
    return this.scene;
  }
  public getScene() {
    return this.camera;
  }
}

export default GameScene;
