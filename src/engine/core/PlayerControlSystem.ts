import { Family, FamilyBuilder, System } from "../ecs";
import { Game } from "../Game";
import { PlayerControlComponent } from "./PlayerControlComponent";
import { PositionComponent } from "./PositionComponent";

const SPEED = 100;
export default class PlayerControlSystem extends System {
  private playerEntity: Family;

  onAttach(game: Game) {
    this.playerEntity = new FamilyBuilder(game)
      .include(PlayerControlComponent, PositionComponent)
      .build();
  }
  update(game: Game, delta: number): void {
    // assuming there is only one player entity in the scene
    if (!this.playerEntity.entities) return;
    const playerEntity = this.playerEntity.entities[0];

    const pos = playerEntity.getComponent(PositionComponent);

    // mutate the player speed state
    pos.x += game.input.getAxis("horizontal") * SPEED * delta;
    pos.y += game.input.getAxis("vertical") * SPEED * delta;
  }
}
