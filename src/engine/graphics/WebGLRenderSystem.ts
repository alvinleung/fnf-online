import Component from "../core/Component";
import LifeCycleObject from "../core/LifeCycleObject";
import Game from "../Game";
import GameScene from "../GameScene";

export default class WebGLRenderSystem implements LifeCycleObject {
  public onDidMount(game: Game) {
    throw new Error("Method not implemented.");
  }
  public onWillUnmount() {
    throw new Error("Method not implemented.");
  }
  public update() {
    throw new Error("Method not implemented.");
  }
}
