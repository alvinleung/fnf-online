/**
 * interface for the renderable class
 */

import { Component, Entity } from "../ecs";

export default class PositionComponent implements Component {
  public x: number = 0;
  public y: number = 0;
}
