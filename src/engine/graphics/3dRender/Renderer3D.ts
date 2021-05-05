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

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {
    // compile shaders here
    const renderer3DShader = new ShaderProgram(
      gl,
      RENDER3D_SHADER_VERT,
      RENDER3D_SHADER_FRAG
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

    // make sure this pass, it render to canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // set world matrix
    renderer3DShader.writeUniformMat4("viewMatrix", cameraMatrix);
    renderer3DShader.writeUniformMat4("projectionMatrix", projectionMatrix);

    let deferredRenderingList = [];

    //console.log(renderableObjects[1])
    renderableObjects.forEach((renderableObject) => {
      if (!renderableObject.isLoadedIntoGPUMemory()) {
        // load the object onto gpu if it is not on gpu yet
        renderableObject.loadIntoGPU(gl);
      }

      // push colour only object to a posponed render batch
      if(!renderableObject.hasRenderingTexture()){
        deferredRenderingList.push(renderableObject);
        return;
      }
      
      // SUB-PASS 1 - render object with texture

      this.setupObjectTrasnform(renderer3DShader, renderableObject);

        // change the pointer to texture
        gl.bindTexture(
          gl.TEXTURE_2D,
          renderableObject.getRenderingTexture().webglTexture
        );

        // supply the texture map coordinates
        renderer3DShader.useAttribForRendering(
          "vTextureCoords",
          renderableObject.getTextureCoordsBuffer()
        );

        // enable textures
        renderer3DShader.writeUniformBoolean("useTexture",true);

      // Step 2 draw
      gl.drawArrays(gl.TRIANGLES, 0, renderableObject.getObjectVerticeSize());
    });

    // clean up the first batch
    renderer3DShader.cleanUpAttribs();

    if(deferredRenderingList.length === 0) return;

    // SUB-PASS 2 - render object with texture, if there is coloured texture
    deferredRenderingList.forEach((renderableObject) => {
      
      this.setupObjectTrasnform(renderer3DShader, renderableObject);

      // render a place-holder colour when there is no texture
      renderer3DShader.useAttribForRendering("vColor", renderableObject.getColorBuffer());
      renderer3DShader.writeUniformBoolean("useTexture",false);

      gl.drawArrays(gl.TRIANGLES, 0, renderableObject.getObjectVerticeSize());
    })

    // disable all the used attributes
    renderer3DShader.cleanUpAttribs();
  }

  /**
   * Setup transform for colour and texture
   * @param renderer3DShader 
   * @param renderableObject 
   */
  private setupObjectTrasnform(renderer3DShader:ShaderProgram, renderableObject: RenderableObject ) {
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
  }

}
