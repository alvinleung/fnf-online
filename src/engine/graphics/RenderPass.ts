import { m4 } from "twgl.js";
import { Entity } from "../ecs";
import { FrameBuffer } from "./FrameBuffer";
import { RenderableObject } from "./RenderableObject";
import { RenderingSystem } from "./RenderingSystem";

export abstract class RenderPass {
  public abstract setup(gl: WebGLRenderingContext, system: RenderingSystem);
  public abstract render(gl: WebGLRenderingContext, system: RenderingSystem);
}
