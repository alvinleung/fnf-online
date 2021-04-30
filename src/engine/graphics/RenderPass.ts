import { m4 } from "twgl.js";
import { Entity } from "../ecs";
import { RenderableObject } from "./Renderable";
import { RenderingSystem } from "./RenderingSystem";

export abstract class RenderPass {
  public abstract setup(gl: WebGLRenderingContext, system: RenderingSystem);
  public abstract render(
    gl: WebGLRenderingContext,
    system: RenderingSystem,
    cameraMatrix: m4.Mat4,
    projectionMatrix: m4.Mat4,
    renderableObject: RenderableObject[]
  );
}
