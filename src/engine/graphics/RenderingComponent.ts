/**
 * interface for the renderable class
 */

import { Component, Entity } from "../ecs";
import { Renderer } from "./Renderer";

export class RenderingComponent implements Component {
  private renderer: Renderer;
  public setRenderer(renderer: Renderer) {
    this.renderer = renderer;
  }
  public getRenderer() {
    return this.renderer;
  }
}
