/**
 *
 * Component is a stateless interface which the system will manipulate.
 *
 * It is posess and configure by an entity.
 * You can think of this as some sort of state of the entity.
 *
 */

import Entity from "./Entity";
import System from "./System";

// export default abstract class Component implements LifeCycleObject {
//   public onDidMount(game: Game, system: System) {}
//   public abstract onWillUnmount();
//   public abstract update();
// }

export default interface Component {
  // the owner of this component
  type: string;
  entity: Entity;
  system: System<this>;
}
