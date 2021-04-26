import { Entity, Engine, Component } from "../ecs";
import Image from "./Image";
import Game from "../Game";
import ObjectRenderer from "./ObjectRenderer";
import RenderingComponent from "./RenderingComponent";

export default class ImageRenderer extends RenderingComponent {
  private image: Image;
  public setImage(image: Image) {
    this.image = image;
  }
  public render(
    gl: WebGLRenderingContext,
    entity: Entity,
    engine: Game,
    delta: number
  ) {
    //TODO: render an image
  }
}
