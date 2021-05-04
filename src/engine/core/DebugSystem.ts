import { Engine, Family, FamilyBuilder, System } from "../ecs";
import { TransformComponent } from "./TransformComponent";

export class DebugSystem extends System {
  private debugObjects: Family;
    
  onAttach(engine: Engine): void {
    this.debugObjects = new FamilyBuilder(engine)
    .include(TransformComponent,DebugComponent)
    .build()
  }
  update(engine: Engine, delta: number): void {

  }
}
