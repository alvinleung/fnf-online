import Game from "../Game";
import Component from "./Component";
import LifeCycleObject from "./LifeCycleObject";

export default abstract class System<T extends Component>
  implements LifeCycleObject {
  protected readonly components: Array<T> = new Array<T>();
  protected game: Game;

  public onDidMount(game: Game) {
    this.game = game;
    // init
  }
  public onWillUnmount() {} // cleanup
  public update() {
    for (let i = 0; i < this.components.length; i++) {
      this.updateComponent(this.components[i]);
    }
  }
  protected abstract updateComponent(component: T);

  public registerComponent(component: T) {
    this.components.push(component);
  }
  public unregisterComponent(component: T) {
    this.components.splice(this.components.indexOf(component), 1);
  }
}
