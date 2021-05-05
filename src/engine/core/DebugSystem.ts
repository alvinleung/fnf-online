import { Engine, Family, FamilyBuilder, System } from "../ecs";
import { DebugComponent } from "./DebugComponent";
import { TransformComponent } from "./TransformComponent";

export class DebugSystem extends System {
  private debugObjects: Family;
    
  onAttach(engine: Engine): void {
    this.debugObjects = new FamilyBuilder(engine)
    .include(TransformComponent,DebugComponent)
    .build();
  }
  update(engine: Engine, delta: number): void {
    const debugEntity = this.debugObjects.entities[0];
    let transform = debugEntity.getComponent(TransformComponent);
    console.log(transform.position);

  }
}
