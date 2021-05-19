import { m4, v3 } from "twgl.js";
import { spreadArrayRecusively } from "../../utils/ArrayUtils";
import { v4 } from "../../utils/MatrixUtils";
import { AttribDataBuffer } from "../AttribDataBuffer";
import { MaterialProperties, RenderableObject } from "../Renderable";
import { RenderingSystem } from "../RenderingSystem";
import { RenderPass } from "../RenderPass";
import { ShaderProgram } from "../ShaderProgram";
import { COLORS_VEC4, wireFrameFromTriangles } from "./objects/Primitives";

const WIREFRAME_SHADER_VERT = require("./shaders/WireframeShader.vert");
const WIREFRAME_SHADER_FRAG = require("./shaders/WireframeShader.frag");

export class wireFrameMaterialProperties implements MaterialProperties {
  
  private _lineVertBuffer: AttribDataBuffer;
  private _lineVertices: number[];
  private _lineColor: v4.Vec4;
  private _isLoadedIntoGPUMemory:boolean = false;

  constructor(objectVertices: number[], color = COLORS_VEC4.black) {
    this._lineVertices = wireFrameFromTriangles(objectVertices);
    //this._lineColors = spreadArrayRecusively(Array(this._lineVertices.length / 3).fill(color));
    this._lineColor = color;
  }
  public isLoadedIntoGPUMemory() {
    return this._isLoadedIntoGPUMemory;
  }
  public createBufferObjectsInGPU(gl: WebGLRenderingContext) {
    this._lineVertBuffer = AttribDataBuffer.fromData(gl, new Float32Array(this._lineVertices), 3);
  }
  public get lineVertBuffer() : AttribDataBuffer{
    return this._lineVertBuffer;
  }
  public get lineColor() : v4.Vec4{
    return this._lineColor;
  }
  public vertexCount():number{
    return this._lineVertices.length / 3;
  }
}

export class WireFrameRenderPass extends RenderPass {
  protected SHADER_PROGRAM_NAME = "WireFrameShader";

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {
    if (!system.getShaderProgram(this.SHADER_PROGRAM_NAME)) {
      const wireFrameShader = new ShaderProgram(
        gl,
        WIREFRAME_SHADER_VERT,
        WIREFRAME_SHADER_FRAG
      );
      system.useShaderProgram(this.SHADER_PROGRAM_NAME, wireFrameShader);
    }
  }

  // this will be called per frame
  public render(gl: WebGLRenderingContext, system: RenderingSystem) {
    const wireFrameShader = system.getShaderProgram(this.SHADER_PROGRAM_NAME);
    if (!wireFrameShader) return;
    wireFrameShader.useProgram();
    const cameraMatrix = system.getCameraMatrix();
    const projectionMatrix = system.getProjectionMatrix();
    const renderableObjects = system.getRenderables();

    // make sure this pass, it render to canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // set world matrix
    wireFrameShader.writeUniformMat4("viewMatrix", cameraMatrix);
    wireFrameShader.writeUniformMat4("projectionMatrix", projectionMatrix);
    wireFrameShader.writeUniformVec3Float(
      "cameraPosition",
      m4.getTranslation(m4.inverse(cameraMatrix))
    );
    
    // load attribs 
    renderableObjects.forEach((renderableObject) => {
      // check for and get wireframes from Matrials 
      const materials = renderableObject.getMaterials();
      if(!materials) return;
      const wireframe = materials.getProperty<wireFrameMaterialProperties>("WireFrame");
      if(!wireframe) return;
      if(!wireframe.isLoadedIntoGPUMemory()) wireframe.createBufferObjectsInGPU(gl);

      this.setupObjectTrasnform(wireFrameShader, renderableObject);
      this.setupObjectWireframe(wireFrameShader, wireframe)

      //if(!this.beforeDraw(gl, system, renderer3DShader, renderableObject)) return;
      this.callDraw(gl, wireframe.vertexCount());
    });

    // disable all the used attributes
    wireFrameShader.cleanUpAttribs();

  }
  protected setupObjectTrasnform(renderer3DShader:ShaderProgram, renderableObject: RenderableObject ) {
    // change the transformation base on the renderable object setting
    renderer3DShader.writeUniformMat4(
      "modelMatrix",
      renderableObject.transform
    );
  }
  protected setupObjectWireframe(renderer3DShader:ShaderProgram, wireFrame:wireFrameMaterialProperties){
    renderer3DShader.writeUniformVec4Float("vColor",wireFrame.lineColor);
    renderer3DShader.useAttribForRendering("vPosition", wireFrame.lineVertBuffer);
  }

  private callDraw(gl: WebGLRenderingContext, drawCount:number){
    gl.drawArrays(gl.LINES, 0, drawCount);
  }
}
