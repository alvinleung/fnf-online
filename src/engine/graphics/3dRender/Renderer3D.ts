import { m4, v3 } from "twgl.js";
import { AttribDataBuffer } from "../AttribDataBuffer";
import { RenderableObject } from "../Renderable";
import { RenderingSystem } from "../RenderingSystem";
import { RenderPass } from "../RenderPass";
import { ShaderProgram } from "../ShaderProgram";

const RENDER3D_SHADER_VERT = require("./shaders/3DShader.vert");
const RENDER3D_SHADER_FRAG = require("./shaders/3DShader.frag");

let sampleObjectVertices = require("./objects/Primitives").plane;
let sampleObjectColors = require("./objects/Primitives").plane_colors;

export class Renderer3D extends RenderPass {
  private positionBuffer: AttribDataBuffer;
  private colorBuffer: AttribDataBuffer;

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {
    // compile shaders here
    const renderer3DShader = new ShaderProgram(
      gl,
      RENDER3D_SHADER_VERT,
      RENDER3D_SHADER_FRAG
    );

    // this part run once per entity

    // init the buffer
    this.positionBuffer = AttribDataBuffer.fromData(
      gl,
      new Float32Array(sampleObjectVertices),
      3
    );
    this.colorBuffer = AttribDataBuffer.fromData(
      gl,
      new Float32Array(sampleObjectColors),
      4
    );

    this.colorBuffer = AttribDataBuffer.fromData(
      gl,
      new Float32Array(sampleObjectColors),
      4
    );

    // for trigger the cache
    renderer3DShader.getUniformLocation("modelMatsrix");
    renderer3DShader.getUniformLocation("viewMatrix");
    renderer3DShader.getUniformLocation("projectionMatrix");

    // add the shader to the rendering system
    system.useShaderProgram("renderer3DShader", renderer3DShader);
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
    renderer3DShader.useProgram();

    // set world matrix
    renderer3DShader.writeUniformMat4("viewMatrix", cameraMatrix);
    renderer3DShader.writeUniformMat4("projectionMatrix", projectionMatrix);

    renderableObjects.forEach((renderableObject) => {
      if (!renderableObject.isLoadedOntoGPUMemory()) {
        // load the object onto gpu if it is not on gpu yet
        renderableObject.loadOntoGPU(gl);
      }

      // change the transformation base on the renderable object setting
      renderer3DShader.writeUniformMat4(
        "modelMatrix",
        renderableObject.transform
      );

      // Step 1 change pointers
      renderer3DShader.useAttribForRendering(
        "vPosition",
        renderableObject.getCoordsBuffer()
      );

      if (renderableObject.hasTexture()) {
        //TODO:render texture here

        // change the pointer to texture
        gl.bindTexture(
          gl.TEXTURE_2D,
          renderableObject.getTexture().webglTexture
        );

        // supply the texture map coordinates
        renderer3DShader.useAttribForRendering(
          "vTextureCoords",
          renderableObject.getTextureCoordsBuffer()
        );

        // supply the texture memory location
        // renderer3DShader.writeUniformInt("uTexture", 0);
      } else {
        // render a place-holder colour when there is no texture
        renderer3DShader.useAttribForRendering("vColor", this.colorBuffer);
      }

      // Step 2 draw
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
  }
}
