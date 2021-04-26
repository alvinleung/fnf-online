import { Engine, System } from "../ecs";
import Game from "../Game";
import RenderingComponent from "./RenderingComponent";

export default class RenderingSystem extends System {
  private gl: WebGLRenderingContext;

  onAttach(game: Game) {
    // initialise webgl here
    const canvas = game.getCanvas();
    const gl: WebGLRenderingContext = canvas.getContext("webgl");

    this.gl = gl;
  }

  update(game: Game, delta: number): void {
    // update engine
    game.entities.forEach((e) => {
      // render the entitites base on their
      const renderComponent = e.getComponent(RenderingComponent);
      renderComponent.render(this.gl, e, game, delta);
    });
  }
}
