import { m4, v3 } from "twgl.js";
import { AttribDataBuffer } from "../AttribDataBuffer";
import { RenderableObject } from "../Renderable";
import { RenderingSystem } from "../RenderingSystem";
import { RenderPass } from "../RenderPass";
import { ShaderProgram } from "../ShaderProgram";

//let gridVertices = require("./objects/Primitives").plane;
//let gridColors = require("./objects/Primitives").plane_colors;


export class MetricsRenderPass extends RenderPass {
  private positionBuffer: AttribDataBuffer;
  private colorBuffer: AttribDataBuffer;
  private verticeSize: number;

  private GRID_SIZE = 100;

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {
    // this part run once per entity

    let Size = this.GRID_SIZE;

    var xLinesVertices = [];
    for (var i = 0; i < Size; i++){
        xLinesVertices.push(Size,0,i + 1);
        xLinesVertices.push(-Size,0,i + 1);
  
        xLinesVertices.push(Size,0,-i - 1);
        xLinesVertices.push(-Size,0,-i - 1);
    }
  
    var zLinesVertices = [];
    for (var i = 0; i < Size; i++){
        zLinesVertices.push(i + 1,0,Size);
        zLinesVertices.push(i + 1,0,-Size);
  
        zLinesVertices.push(-i - 1,0,Size);
        zLinesVertices.push(-i - 1,0,-Size);
    } 

    var gridVertices = xLinesVertices.concat(zLinesVertices);

    var gridColors = [];
    for(var i = 0; i < gridVertices.length ; i++){
      gridColors.push(1.0);
      gridColors.push(1.0);
      gridColors.push(1.0);
      gridColors.push(1.0);
    }

    this.verticeSize = gridVertices.length;
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
    this.colorBuffer.bufferSize
  }

  // this will be called per frame
  public render(
    gl: WebGLRenderingContext,
    system: RenderingSystem,
    cameraMatrix: m4.Mat4,
    projectionMatrix: m4.Mat4,
    renderableObjects: RenderableObject[]
  ) {
    const renderer3DShader = system.getShaderProgram("renderer3DShader");
    if(!renderer3DShader) return;
    renderer3DShader.useProgram();

    // make sure this pass, it render to canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // set world matrix
    renderer3DShader.writeUniformMat4("viewMatrix", cameraMatrix);
    renderer3DShader.writeUniformMat4("projectionMatrix", projectionMatrix);
    renderer3DShader.writeUniformVec3Float("cameraPosition", m4.inverse(m4.getTranslation(cameraMatrix)));

    //console.log(m4.identity())
    

    // load attribs to render grid 
    renderer3DShader.writeUniformMat4("modelMatrix", m4.identity());
    renderer3DShader.useAttribForRendering("vPosition", this.positionBuffer);
    renderer3DShader.useAttribForRendering("vColor", this.colorBuffer);

    // disable texture
    renderer3DShader.writeUniformBoolean("useTexture",false);

    // Step 2 draw
    gl.drawArrays(gl.LINES, 0, this.verticeSize);
    
  }
}


