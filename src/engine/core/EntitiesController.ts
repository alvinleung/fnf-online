import Game from "../Game";
import GameScene from "../GameScene";
import Entity from "./Entity";

class EntitiesController {
  private entities: Array<Entity> = new Array<Entity>();
  private entitiesLookup = {};

  public add(entity: Entity, game: Game, scene: GameScene) {
    this.entities.push(entity);
    this.entitiesLookup[entity.id] = entity;
    entity.onEntityDidMount(game, scene);
  }
  public remove(entity: Entity, game: Game, scene: GameScene) {
    entity.onEntityWillUnmount(game, scene);
    // remove
    this.entities.splice(this.entities.indexOf(entity), 1);
    delete this.entitiesLookup[entity.id];
  }

  public onUpdate(game: Game, scene: GameScene) {
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].onUpdate(game, scene);
    }
  }
  public onRender(game: Game, scene: GameScene) {
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].onRender(game, scene);
    }
  }
}

export default EntitiesController;
