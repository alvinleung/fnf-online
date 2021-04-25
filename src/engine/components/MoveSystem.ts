import System from "../core/System";
import PositionComponent from "./MoveComponent";

export default class PositionSystem extends System<PositionComponent> {
  protected updateComponent(component: PositionComponent) {
    component.x += component.velx;
    component.y += component.vely;
  }
}
