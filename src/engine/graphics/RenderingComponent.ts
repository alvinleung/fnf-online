/**
 * interface for the renderable class
 */

import { Component, Entity } from "../ecs";
import Game from "../Game";
import Renderer from "./Renderer";

export default class RenderingComponent implements Component {
  private renderer: Renderer;
  public setRenderer(renderer: Renderer) {
    this.renderer = renderer;
  }
  public getRenderer() {
    return this.renderer;
  }
}
