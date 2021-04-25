import Game from "../Game";

export default interface LifeCycleObject {
  onDidMount(game: Game);
  onWillUnmount();
  update();
}
