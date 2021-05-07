import { Component } from "../ecs";
import { m4, v3 } from "twgl.js";
import * as q from "../utils/quaternion";
import { EditableComponent, EditableField, Editor } from "../editor";

/**
 * A component for 2d spatial manipulation
 */
@EditableComponent
export class TransformComponent implements Component {
  private _matrix = m4.translation(v3.create(0, 0, 0));
  private _changed = false;

  private _x: number = 0;
  private _y: number = 0;
  private _z: number = 0;
  private _scaleX: number = 1;
  private _scaleY: number = 1;
  private _scaleZ: number = 1;

  @EditableField(Editor.VECTOR)
  public set position([x, y, z]: v3.Vec3) {
    this._changed = true;
    this._x = x;
    this._y = y;
    this._z = z;
  }

  public get position(): v3.Vec3 {
    return [this._x, this._y, this._z];
  }

  @EditableField(Editor.VECTOR)
  public set scale([x, y, z]: v3.Vec3) {
    this._changed = true;
    this._scaleX = x;
    this._scaleY = y;
    this._scaleZ = z;
  }

  public get scale() {
    return [this._scaleX, this._scaleY, this._scaleZ];
  }

  /**
   * The initial euler angles for the component.
   */
  private _initialRotation: v3.Vec3 = [0, 0, 0];

  @EditableField(Editor.ROTATION)
  public set initialRotation(angles: v3.Vec3) {
    this._changed = true;
    this._initialRotation = angles;
    this.rotation = q.fromEulerAngles(angles[0], angles[1], angles[2]);
  }

  public get initialRotation() {
    return this._initialRotation;
  }

  private _rotationQuat: q.Quat = q.fromEulerAngles(
    this.initialRotation[0],
    this.initialRotation[1],
    this.initialRotation[2]
  );

  public set rotation(quaternion: q.Quat) {
    this._changed = true;
    this._rotationQuat = quaternion;
  }

  public get rotation(): q.Quat {
    return this._rotationQuat;
  }

  public getMatrix(): m4.Mat4 {
    // return the cached matrix if it is unchanged
    if (!this._changed) return this._matrix;

    // calculate a new matrix object if there is manipulation happen
    // sidenote - the applicaiton of matrix transformation is inverted (last in first out)
    let matrix = m4.translation([this._x, this._y, this._z]);
    matrix = m4.multiply(matrix, q.quatToMat4(this._rotationQuat));
    matrix = m4.scale(matrix, [this._scaleX, this._scaleY, this._scaleZ]);

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
