import { Vector3 } from "three";

let __entityCounter__ = 0;

class Entity {
  public readonly id: string;
  protected position: Vector3 = new Vector3(0, 0, 0);

  constructor(instanceId?: string) {
    this.id = instanceId || "entity-instance-" + __entityCounter__; // OK
    __entityCounter__++;
  }

  // init here
  public onEntityDidMount() {}

  // destroy here
  public onEntityWillUnmount() {}

  public onUpdate() {}
  public onRender() {}
}

export default Entity;
