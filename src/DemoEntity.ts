import * as THREE from "three";
import Entity from "./engine/core/Entity";
import Game from "./engine/Game";
import GameScene from "./engine/GameScene";

class DemoEntity extends Entity {
  private cube: THREE.Mesh;

  public onEntityDidMount(game: Game, scene: GameScene) {
    // init here
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);

    scene.getScene().add(this.cube);
  }
  public onEntityWillUnmount(game: Game, scene: GameScene) {
    scene.getScene().remove(this.cube);
  }
  public onUpdate(game: Game, scene: GameScene) {
    // rendering game object
  }
  public onRender(game: Game, scene: GameScene) {
    // manipulate the threejs rendering objects
    this.cube.position.set(this.position.x, this.position.y, this.position.z);
  }
}

export default DemoEntity;
