import Component from "../core/Component";

export default interface PositionComponent extends Component {
  x: number;
  y: number;
  velx: number;
  vely: number;
}
