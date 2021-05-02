import { Component } from "../ecs";
import { m4, v3 } from "twgl.js";
import * as q from "../utils/quaternion";

/**
 * A component for 2d spatial manipulation
 */
export class TransformComponent implements Component {
  private _matrix = m4.translation(v3.create(0, 0, 0));
  private _changed = false;

  private _x: number = 0;
  private _y: number = 0;
  private _z: number = 0;
  private _scaleX: number = 1;
  private _scaleY: number = 1;
  private _scaleZ: number = 1;
  // private _rotationZ: number = 0;
  // private _rotationY: number = 0;
  // private _rotationX: number = 0;
  private _rotationQuat: q.Quat = q.fromEulerAngles(0, 0, 0);

  public set position([x, y, z]: v3.Vec3) {
    this._changed = true;
    this._x = x;
    this._y = y;
    this._z = z;
  }

  public get position(): v3.Vec3 {
    return [this._x, this._y, this._z];
  }

  public set scale([x, y, z]: v3.Vec3) {
    this._changed = true;
    this._scaleX = x;
    this._scaleY = y;
    this._scaleZ = z;
  }

  public get scale() {
    return [this._scaleX, this._scaleY, this._scaleZ];
  }

  public set rotation(quaternion: q.Quat) {
    this._changed = true;
    this._rotationQuat = quaternion;
  }

  public get rotation(): q.Quat {
    return this._rotationQuat;
  }

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

  public get z() {
    return this._z;
  }

  public set z(val: number) {
    this._changed = true;
    this._z = val;
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

  public get scaleZ() {
    return this._scaleZ;
  }

  public set scaleZ(val: number) {
    this._changed = true;
    this._scaleZ = val;
  }

  public getMatrix(): m4.Mat4 {
    // return the cached matrix if it is unchanged
    if (!this._changed) return this._matrix;

    // calculate a new matrix object if there is manipulation happen
    // sidenote - the applicaiton of matrix transformation is inverted (last in first out)
    let matrix = m4.scaling([this._scaleX, this._scaleY, this._scaleZ]);
    matrix = m4.multiply(matrix, m4.translation([this._x, this._y, this._z]));
    matrix = m4.multiply(matrix, q.quatToMat4(this._rotationQuat));

    // set the _changed flag back to false
    this._changed = false;

    // cache the calculated matrix
    this._matrix = matrix;

    return matrix;
  }

  public getPosition(): v3.Vec3 {
    return v3.create(this._x, this._y, this._z);
  }
}
