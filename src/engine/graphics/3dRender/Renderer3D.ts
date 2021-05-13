import { m4, v3 } from "twgl.js";
import { AttribDataBuffer } from "../AttribDataBuffer";
import { RenderableObject } from "../Renderable";
import { RenderingSystem } from "../RenderingSystem";
import { RenderPass } from "../RenderPass";
import { ShaderProgram } from "../ShaderProgram";

const RENDER3D_SHADER_VERT = require("./shaders/3DShader.vert");
const RENDER3D_SHADER_FRAG = require("./shaders/3DShader.frag");

export class Renderer3D extends RenderPass {

  protected SHADER_PROGRAM_NAME = "renderer3DShader";

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
    system.useShaderProgram(this.SHADER_PROGRAM_NAME, renderer3DShader);
  }

  // this will be called per frame
  public render(
    gl: WebGLRenderingContext,
    system: RenderingSystem,
  ) {
    const renderer3DShader = system.getShaderProgram(this.SHADER_PROGRAM_NAME);
    renderer3DShader.useProgram();
    const cameraMatrix = system.getCameraMatrix();
    const projectionMatrix = system.getProjectionMatrix();
    const renderableObjects = system.getRenderables();

    // make sure this pass, it render to canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // set world matrix
    renderer3DShader.writeUniformMat4("viewMatrix", cameraMatrix);
    renderer3DShader.writeUniformMat4("projectionMatrix", projectionMatrix);

    let deferredRenderingList = [];

    //console.log(renderableObjects[1])
    this.beforeDraws(gl, system, renderer3DShader, renderableObjects);

    renderableObjects.forEach((renderableObject) => {
      if (!renderableObject.isLoadedIntoGPUMemory()) {
        // load the object onto gpu if it is not on gpu yet
        renderableObject.loadIntoGPU(gl);
      }

      if(renderableObject.getMaterials() && renderableObject.getMaterials().hasProperty("WireFrame")){
        return;
      }


      // push colour only object to a posponed render batch
      if(!renderableObject.hasRenderingTexture()){
        deferredRenderingList.push(renderableObject);
        return;
      }

      // SUB-PASS 1 - render object with texture
      this.setupObjectTrasnform(renderer3DShader, renderableObject);
      this.setupObjectTexture(gl,renderer3DShader, renderableObject);
      if(!this.beforeDraw(gl, system, renderer3DShader, renderableObject)) return;
      this.callDraw(gl, gl.TRIANGLES, renderableObject.getObjectVerticeSize());
    });

    // clean up the first batch
    renderer3DShader.cleanUpAttribs();

    if(deferredRenderingList.length === 0) return;

    // SUB-PASS 2 - render object with texture, if there is coloured texture
    this.beforeDraws(gl, system, renderer3DShader, renderableObjects);
    deferredRenderingList.forEach((renderableObject) => {
      this.setupObjectTrasnform(renderer3DShader, renderableObject);
      // render a place-holder colour when there is no texture
      this.setupObjectColor(renderer3DShader, renderableObject);
      if(!this.beforeDraw(gl, system, renderer3DShader, renderableObject)) return;
      this.callDraw(gl, gl.TRIANGLES, renderableObject.getObjectVerticeSize());
    })

    // disable all the used attributes
    renderer3DShader.cleanUpAttribs();
  }

  private callDraw(gl: WebGLRenderingContext, drawType:number, drawCount:number){
    gl.drawArrays(drawType, 0, drawCount);
  }

  /**
   * Setup transform for colour and texture
   * @param renderer3DShader 
   * @param renderableObject 
   */
  protected setupObjectTrasnform(renderer3DShader:ShaderProgram, renderableObject: RenderableObject ) {
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
  protected setupObjectColor(renderer3DShader:ShaderProgram, renderableObject: RenderableObject){
    renderer3DShader.useAttribForRendering("vColor", renderableObject.getColorBuffer());
    renderer3DShader.writeUniformBoolean("useTexture",false);
  }
  protected setupObjectTexture(gl: WebGLRenderingContext, renderer3DShader:ShaderProgram, renderableObject: RenderableObject){
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
  }
  // virtual/ abstract method called before gl.draw
  // returns true if continues with the draw
  protected beforeDraw(gl: WebGLRenderingContext, system: RenderingSystem, renderer3DShader:ShaderProgram, renderableObject: RenderableObject):boolean{return true}

  protected beforeDraws(gl: WebGLRenderingContext, system: RenderingSystem, renderer3DShader:ShaderProgram, renderableObjects: RenderableObject[]){}

}
