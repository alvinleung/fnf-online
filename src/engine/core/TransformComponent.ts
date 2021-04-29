import { Component } from "../ecs";
import { m4, v3 } from "twgl.js";

/**
 * A component for 2d spatial manipulation
 */
export class TransformComponent implements Component {
  private _matrix = m4.translation(v3.create(0, 0, 0));
  private _changed = false;

  private _x: number = 0;
  private _y: number = 0;
  private _scaleX: number = 1;
  private _scaleY: number = 1;
  private _rotation: number = 0;

  public get x() {
    return this._x;
  }

  public set x(val: number) {
    this._changed = true;
    this._x = val;
  }

  public get y() {
    return this._y;
  }

  public set y(val: number) {
    this._changed = true;
    this._y = val;
  }
  public get scaleY() {
    return this._scaleY;
  }

  public set scaleY(val: number) {
    this._changed = true;
    this._scaleY = val;
  }

  public get scaleX() {
    return this._scaleX;
  }

  public set scaleX(val: number) {
    this._changed = true;
    this._scaleX = val;
  }

  public get rotation() {
    return this._rotation;
  }

  public set rotation(radian: number) {
    this._changed = true;
    this._rotation = radian;
  }

  public getMatrix() {
    // return the cached matrix if it is unchanged
    if (!this._changed) return this._matrix;

    // calculate a new matrix object if there is manipulation happen
    let matrix = m4.translation(v3.create(0, 0, 0));
    matrix = m4.translate(matrix, v3.create(this._x, this._y, 0));
    matrix = m4.scale(matrix, v3.create(this._scaleX, this._scaleY, 0));
    matrix = m4.rotateZ(matrix, this._rotation);

    // set the _changed flag back to false
    this._changed = false;
    
    // cache the calculated matrix
    this._matrix = matrix;
    
    return matrix;
  }
}
