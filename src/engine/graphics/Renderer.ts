/*
 * Owned by the {RenderingComponent}
 *
 * A Renderer is responsible for carrying out actual rendering for the
 * rendering component
 */
import { RenderingSystem } from "./RenderingSystem";
import { m4 } from "twgl.js";

export abstract class Renderer {
  // renderer
  public abstract render(
    gl: WebGLRenderingContext,
    system: RenderingSystem,
    transformMatrix: m4.Mat4
  );
}

/**
 * a class that is used to configure the RenderingSystem
 */
export abstract class RendererSetup {
  public abstract setup(gl: WebGLRenderingContext, system: RenderingSystem);
}
