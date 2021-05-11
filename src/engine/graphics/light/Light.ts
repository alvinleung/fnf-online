import { v3 } from "twgl.js";
import { Component } from "../../ecs";
import { EditableComponent, EditableField, Editor } from "../../editor";
import { v4 } from "../../utils/MatrixUtils";
import { MaterialProperties } from "../Renderable";


@EditableComponent
export class LightComponent implements Component{
  private _isDirectional: boolean;
  private _color: v3.Vec3;
  private _intensity: number;

  constructor(){
    this._isDirectional = true;
    this._color = v3.create(1,1,1);
    this._intensity = 1;
  }


  @EditableField(Editor.RGBA)
  public set color([r, b, g, a]: v3.Vec3) {
    this._color = [r, g, b];
  }

  public get color() {
    return this._color;
  }

  @EditableField(Editor.BOOLEAN)
  public set isDirectional(val: boolean) {
    this._isDirectional = val;
  }

  public get isDirectional() {
    return this._isDirectional;
  }

  @EditableField(Editor.NUMBER)
  public set intensity(val: number) {
    this._intensity = val;
  }

  public get intensity() {
    return this._intensity;
  }


}






