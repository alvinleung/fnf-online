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
  private _rotationQuat: q.Quat = [0, 0, 0, 0];

  public set position([x, y, z]: v3.Vec3) {
    this._x = x;
    this._y = y;
    this._z = z;
  }

  public get position(): v3.Vec3 {
    return [this._x, this._y, this._z];
  }

  public set scale([x, y, z]: v3.Vec3) {
    this._scaleX = x;
    this._scaleY = y;
    this._scaleZ = z;
  }

  public get scale() {
    return [this._scaleX, this._scaleY, this._scaleZ];
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

  // public get rotationZ() {
  //   return this._rotationZ;
  // }

  // public set rotationZ(radian: number) {
  //   this._rotChanged = true;
  //   this._rotationZ = radian;
  // }

  // public get rotationX() {
  //   return this._rotationX;
  // }

  // public set rotationX(radian: number) {
  //   this._rotChanged = true;
  //   this._rotationX = radian;
  // }

  // public get rotationY() {
  //   return this._rotationY;
  // }

  // public set rotationY(radian: number) {
  //   this._rotChanged = true;
  //   this._rotationY = radian;
  // }

  public getMatrix(): m4.Mat4 {
    // return the cached matrix if it is unchanged
    if (!this._changed) return this._matrix;

    // calculate a new matrix object if there is manipulation happen
    let matrix = m4.translation(v3.create(0, 0, 0));
    matrix = m4.translate(matrix, v3.create(this._x, this._y, this._z));
    matrix = m4.scale(
      matrix,
      v3.create(this._scaleX, this._scaleY, this._scaleZ)
    );
    // matrix = m4.rotateZ(matrix, this._rotationZ);
    // matrix = m4.rotateY(matrix, this._rotationY);
    // matrix = m4.rotateX(matrix, this._rotationX);

    // set the _changed flag back to false
    this._changed = false;

    // cache the calculated matrix
    this._matrix = matrix;

    return matrix;
  }

  public getPosition(): v3.Vec3 {
    return v3.create(this._x, this._y, this._z);
  }

  public set rotation(quaternion: q.Quat) {
    this._rotationQuat = quaternion;
  }

  public get rotation() {
    return this._rotationQuat;
  }

  // public setRotationQuat(quaternion: q.Quat) {
  //   this._rotationQuat = quaternion;
  //   // set rotation
  // }

  // public getRotation(): q.Quat {
  //   if (!this._rotChanged) return this._rotationQuat;

  //   this._rotationQuat = q.fromEuler([
  //     this._rotationX,
  //     this._rotationY,
  //     this._rotationZ,
  //   ]);
  //   this._rotChanged = false;

  //   // return this._rotationQuat;
  //   return this._rotationQuat;
  // }
}