import { Component } from "../ecs";
import { EditableField, Editor } from "../editor";
import { RenderableObject } from "./RenderableObject";

export class RenderableComponent implements Component {
  @EditableField(Editor.CLASS, { category: "RenderableObject" })
  renderableObject: RenderableObject;
}
