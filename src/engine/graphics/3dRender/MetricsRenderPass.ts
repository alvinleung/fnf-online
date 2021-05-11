import { m4, v3 } from "twgl.js";
import { AttribDataBuffer } from "../AttribDataBuffer";
import { RenderableObject } from "../Renderable";
import { RenderingSystem } from "../RenderingSystem";
import { RenderPass } from "../RenderPass";
import { ShaderProgram } from "../ShaderProgram";

const RENDER3D_SHADER_VERT = require("./shaders/3DShader.vert");
const RENDER3D_SHADER_FRAG = require("./shaders/3DShader.frag");

export class MetricsRenderPass extends RenderPass {
  private positionBuffer: AttribDataBuffer;
  private colorBuffer: AttribDataBuffer;
  private verticeSize: number;

  protected SHADER_PROGRAM_NAME = "renderer3DShader";
  private GRID_SIZE = 100;
  private GRID_COLOR = [0.65, 0.65, 0.65, 0.5];
  private GRID_AXIS_COLOR = {
    x: [1.0, 0.0, 0.0, 1.0],
    y: [0.0, 1.0, 0.0, 1.0],
    z: [0.0, 0.0, 1.0, 1.0],
  };

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {
    if (!system.getShaderProgram(this.SHADER_PROGRAM_NAME)) {
      const renderer3DShader = new ShaderProgram(
        gl,
        RENDER3D_SHADER_VERT,
        RENDER3D_SHADER_FRAG
      );
      system.useShaderProgram(this.SHADER_PROGRAM_NAME, renderer3DShader);
    }

    let Size = this.GRID_SIZE;

    var xLinesVertices = [];
    for (var i = 0; i < Size; i++) {
      xLinesVertices.push(Size, 0, i + 1);
      xLinesVertices.push(-Size, 0, i + 1);

      xLinesVertices.push(Size, 0, -i - 1);
      xLinesVertices.push(-Size, 0, -i - 1);
    }

    var zLinesVertices = [];
    for (var i = 0; i < Size; i++) {
      zLinesVertices.push(i + 1, 0, Size);
      zLinesVertices.push(i + 1, 0, -Size);

      zLinesVertices.push(-i - 1, 0, Size);
      zLinesVertices.push(-i - 1, 0, -Size);
    }

    var gridVertices = xLinesVertices.concat(zLinesVertices);

    var gridColors = [];
    for (var i = 0; i < gridVertices.length / 3; i++) {
      gridColors.push(...this.GRID_COLOR);
    }

    // Axis lines
    // X
    gridVertices.push(Size, 0, 0);
    gridVertices.push(-Size, 0, 0);
    gridColors.push(...this.GRID_AXIS_COLOR.x);
    gridColors.push(...this.GRID_AXIS_COLOR.x);
    // Y
    /*
    gridVertices.push(0, Size, 0);
    gridVertices.push(0, -Size, 0);
    gridColors.push(...this.GRID_AXIS_COLOR.y);
    gridColors.push(...this.GRID_AXIS_COLOR.y);
    */
    // Z
    gridVertices.push(0, 0, Size);
    gridVertices.push(0, 0, -Size);
    gridColors.push(...this.GRID_AXIS_COLOR.z);
    gridColors.push(...this.GRID_AXIS_COLOR.z);

    this.verticeSize = gridVertices.length / 3;
    // init the buffer
    this.positionBuffer = AttribDataBuffer.fromData(
      gl,
      new Float32Array(gridVertices),
      3
    );
    this.colorBuffer = AttribDataBuffer.fromData(
      gl,
      new Float32Array(gridColors),
      4
    );
  }

  // this will be called per frame
  public render(gl: WebGLRenderingContext, system: RenderingSystem) {
    const renderer3DShader = system.getShaderProgram(this.SHADER_PROGRAM_NAME);
    if (!renderer3DShader) return;
    renderer3DShader.useProgram();
    const cameraMatrix = system.getCameraMatrix();
    const projectionMatrix = system.getProjectionMatrix();

    // make sure this pass, it render to canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // set world matrix
    renderer3DShader.writeUniformMat4("viewMatrix", cameraMatrix);
    renderer3DShader.writeUniformMat4("projectionMatrix", projectionMatrix);
    renderer3DShader.writeUniformVec3Float(
      "cameraPosition",
      m4.getTranslation(m4.inverse(cameraMatrix))
    );

    // load attribs to render grid
    renderer3DShader.writeUniformMat4("modelMatrix", m4.identity());
    renderer3DShader.useAttribForRendering("vPosition", this.positionBuffer);
    renderer3DShader.useAttribForRendering("vColor", this.colorBuffer);

    // disable texture
    renderer3DShader.writeUniformBoolean("useTexture", false);

    // Step 2 draw
    gl.drawArrays(gl.LINES, 0, this.verticeSize);
  }
}
