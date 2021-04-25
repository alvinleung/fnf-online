import DemoEntity from "./DemoEntity";
import GameScene from "./engine/GameScene";

export default class DemoScene extends GameScene {
  onSceneDidMount() {
    // initialisation here
    const demoEntity = new DemoEntity();
    this.addEntity(demoEntity);
  }
}
