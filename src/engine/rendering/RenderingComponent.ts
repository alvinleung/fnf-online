/**
 * interface for the renderable class
 */

import { Component, Entity } from "../ecs";
import Game from "../Game";
import ObjectRenderer from "./ObjectRenderer";

export default class RenderingComponent implements Component {
  // renderering function
  public render(
    gl: WebGLRenderingContext,
    entity: Entity,
    engine: Game,
    delta: number
  ) {}
}
