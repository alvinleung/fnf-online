import { Engine, System } from "../ecs";

export class PhaysicsSystem extends System {
  onAttach(engine: Engine): void {
    // init the system
  }
  update(engine: Engine, delta: number): void {
    // update the system
    // step - 1 interpolate physics
  }
}
