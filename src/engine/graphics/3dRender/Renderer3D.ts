import { m4 } from "twgl.js";
import { Renderer, RendererSetup } from "../Renderer";
import { RenderingSystem } from "../RenderingSystem";
import { ShaderProgram } from "../ShaderProgram";

const RENDER3D_SHADER_VERT = require("./shaders/3DShader.vert");
const RENDER3D_SHADER_FRAG = require("./shaders/3DShader.frag");


let sampleObjectVertices = [
  // Front face
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,

   1.0,  1.0,  1.0,
   -1.0,  1.0,  1.0,
   -1.0, -1.0,  1.0,


]

let sampleObjectColors = [
  1.0,0.0,0.0,1.0,
  0.0,1.0,0.0,1.0,
  0.0,0.0,1.0,1.0,
  0.0,0.0,1.0,1.0,
  1.0,1.0,1.0,1.0,
  1.0,0.0,0.0,1.0,
]


export class Renderer3Dsetup extends RendererSetup {
  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {
    // setup the Image Rendering Code here

    // compile shaders here
    const renderer3DShader = new ShaderProgram(
      gl,
      RENDER3D_SHADER_VERT,
      RENDER3D_SHADER_FRAG
    );

    // this part run once per entity
    renderer3DShader.initAttrib("vPosition",
      new Float32Array( sampleObjectVertices ),
      3
    )

    renderer3DShader.initAttrib("vColor",
      new Float32Array( sampleObjectColors ),
      4
    )

    renderer3DShader.getUniformLocation("modelMatrix");
    renderer3DShader.getUniformLocation("viewMatrix");
    renderer3DShader.getUniformLocation("projectionMatrix");

    // add the shader to the rendering system
    system.useShaderProgram("renderer3DShader", renderer3DShader);
  }
}


export class Renderer3D extends Renderer{

  constructor() {
    super();
  }

  // this will be called per frame
  public render(
    gl: WebGLRenderingContext,
    system: RenderingSystem,
    transformMatrix: m4.Mat4,
    cameraMatrix: m4.Mat4,
    projectionMatrix: m4.Mat4
  ) {

    const renderer3DShader = system.getShaderProgram("renderer3DShader");
    
    renderer3DShader.useProgram();

    renderer3DShader.writeUniformMat4("modelMatrix", transformMatrix);
    renderer3DShader.writeUniformMat4("viewMatrix", cameraMatrix);
    renderer3DShader.writeUniformMat4("projectionMatrix", projectionMatrix);

    // Step 1 change pointers
    renderer3DShader.prepareAttribForRendering("vPosition");
    renderer3DShader.prepareAttribForRendering("vColor");

    // Step 2 draw
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
}
  

