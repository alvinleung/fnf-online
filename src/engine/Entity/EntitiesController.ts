import Entity from "./Entity";

class EntitiesController {
  private entities: Array<Entity>;
  private entitiesLookup = {};

  public add(entity: Entity) {
    this.entities.push(entity);
    this.entitiesLookup[entity.id] = entity;
    entity.onEntityDidMount();
  }
  public remove(entity: Entity) {
    entity.onEntityWillUnmount();
    // remove
    this.entities.splice(this.entities.indexOf(entity), 1);
    delete this.entitiesLookup[entity.id];
  }

  public onUpdate() {
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].onUpdate();
    }
  }
  public onRender() {
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].onRender();
    }
  }
}

export default EntitiesController;
