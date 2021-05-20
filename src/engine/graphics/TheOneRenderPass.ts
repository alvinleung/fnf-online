import { Shader, ShaderManager } from "./Materials/ShaderManager";
import { Material, MaterialProperties } from "./Materials/Material";
import { RenderableObject } from "./Renderable";

import { RenderingSystem } from "./RenderingSystem";
import { RenderPass } from "./RenderPass";
import { Texture } from "./Texture";
import { TextureBufferLoader } from "./DataBufferPair";
import { LightComponent } from "./Light";
import { TransformComponent } from "../core/TransformComponent";
import { m4 } from "twgl.js";
import { PriorityQueue } from "../utils/DataStructUtils";

export class ShaderPlan implements MaterialProperties {
  private plan: string[]; // a ordered list of strings(shaderID) each identifing a shader program

  constructor() {
    this.plan = ShaderManager.getInstance().getDefaultPlan();
  }
}
export class TheOneRenderPass extends RenderPass {
  private strategy: { shaderId: string; renderableList: RenderableObject[] }[] = [];
  // store: object { shaderId, renderables }
  private strategyNeedsUpdate: boolean = true;
  private _frameRendered: number = 0;

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {}

  // this will be called per frame
  public render(gl: WebGLRenderingContext, system: RenderingSystem) {
    if (this.strategyNeedsUpdate) {
      this.resolveStrategy(system.getRenderables());
      this.strategyNeedsUpdate = false;
    }
    /* get variables from system */
    const cameraMatrix = system.getCameraMatrix();
    const projectionMatrix = system.getProjectionMatrix();

    const shaderManager = ShaderManager.getInstance();
    this.strategy.forEach((subPass) => {
      //const shaderProgram = system.getShaderProgram(subPass.shaderId);
      const shaderProgram = shaderManager.getShaderFor(gl, subPass.shaderId);
      if (!shaderProgram) {
        if (this._frameRendered % 30 == 0) {
          console.log("shader not found in cache, skipping:[" + subPass.shaderId + "]");
        }
        return;
      }
      shaderProgram.useProgram();

      /** Get Naming scheme from shader manager */
      const verticeName = Shader.NAMES.VERTICES;
      const normalsName = Shader.NAMES.NORMALS;
      const texCoordsName = Shader.NAMES.TEXCOORDS;
      const modelMatrixName = Shader.NAMES.MODEL_MATRIX;
      const viewMatrixName = Shader.NAMES.VIEW_MATRIX;
      const projectionMatrixName = Shader.NAMES.PROJECTION_MATRIX;

      // make sure this pass, it render to canvas
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      /** global */
      shaderProgram.writeUniformMat4(viewMatrixName, cameraMatrix);
      shaderProgram.writeUniformMat4(projectionMatrixName, projectionMatrix);

      /** FIX THIS */
      let light = system.getLights()[0];
      let lightProperties = light.getComponent(LightComponent);
      let lightOrigin = light.getComponent(TransformComponent).position;

      shaderProgram.writeUniformBoolean("isDirection", lightProperties.isDirectional);
      shaderProgram.writeUniformVec3Float("lightColor", lightProperties.color);
      shaderProgram.writeUniformVec3Float("lightOrigin", lightOrigin);

      shaderProgram.writeUniformVec3Float(
        "cameraPosition",
        m4.getTranslation(m4.inverse(cameraMatrix))
      );

      subPass.renderableList.forEach((renderableObject) => {
        /** Geomatery */
        const geometry = renderableObject.getGeometry();
        geometry.prepareInGPU(gl);
        shaderProgram.writeUniformMat4(modelMatrixName, geometry.get(modelMatrixName));
        shaderProgram.useAttribForRendering(verticeName, geometry.get(verticeName));
        shaderProgram.useAttribForRendering(normalsName, geometry.get(normalsName));
        shaderProgram.useAttribForRendering(texCoordsName, geometry.get(texCoordsName));

        /** Materials */
        const material = renderableObject.getMaterial();
        const variableMapping = shaderManager.getMaterialVariables(material);
        material.prepareInGPU(gl);

        for (let [variableName, variableInfo] of Object.entries(variableMapping)) {
          const info = variableInfo as any;
          const type = info.type;
          let nameInShader = info.nameInShader;
          switch (type) {
            case Shader.UNIFORM.BOOL:
              //console.log(material.get(variableName))
              shaderProgram.writeUniformBoolean(nameInShader, material.get(variableName));
              break;
            case Shader.UNIFORM.FLOAT:
              shaderProgram.writeUniformFloat(nameInShader, material.get(variableName));
              break;
            case Shader.UNIFORM.FLOAT_MAT4:
              shaderProgram.writeUniformMat4(nameInShader, material.get(variableName));
              break;
            case Shader.UNIFORM.FLOAT_VEC3:
              shaderProgram.writeUniformVec3Float(nameInShader, material.get(variableName));
              break;
            case Shader.UNIFORM.FLOAT_VEC4:
              shaderProgram.writeUniformVec4Float(nameInShader, material.get(variableName));
              break;
            case Shader.UNIFORM.SAMPLER_2D:
              const texture = material.get(variableName) as TextureBufferLoader;
              if (texture.hasTexture) {
                texture.buffer.useForRendering();
              }
              break;
            case Shader.ATTRIBUTE.FLOAT_VEC2:
              console.log("vec2 not supported yet");
              break;
            case Shader.ATTRIBUTE.FLOAT_VEC4:
              //console.log(variableName)
              shaderProgram.useAttribForRendering(nameInShader, material.get(variableName));
              break;
            default:
              console.error("variable Name [" + variableName + "] not found");
              return;
            /*
            case type >= 100 && type < 200:
              console.log( "100 ~ 200" +  variableName )
              shaderProgram.useAttribForRendering(variableName,material.get0(variableName))
              break;*/
          }
        }

        /** DRAW */
        gl.drawArrays(gl.TRIANGLES, 0, geometry.vertexCount);
        //shaderProgram.cleanUpAttribs()
        if (this._frameRendered % 240 == 0) {
          //console.log(geometry.get(verticeName))
        }
      });
    });
    this._frameRendered++;
  }
  /*
    resolve shader strategy
  */
  public resolveStrategy(renderableObjects: RenderableObject[]) {
    let plans = [];
    renderableObjects.forEach((renderableObject) => {
      for (let i = 0; i < renderableObject.plan.length; i++) {
        if (!plans[i]) {
          // add new layer of plans for the renderable's plan length
          plans[i] = {};
        }
        if (!plans[i][renderableObject.plan[i]]) {
          // add namespace for plan
          plans[i][renderableObject.plan[i]] = [];
        }
        plans[i][renderableObject.plan[i]].push(renderableObject);
      }
    });
    const shaderQueue = new PriorityQueue((a, b) => a[1] > b[1]);
    for (let i = 0; i < plans.length; i++) {
      for (const shaderName in plans[i]) {
        console.log(plans[i][shaderName].length);
      }
    }
    // Pairwise comparison semantics
    const pairwiseQueue = new PriorityQueue((a, b) => a[1] > b[1]);
    pairwiseQueue.push(["low", 0], ["medium", 5], ["high", 6]);
    console.log("value:" + pairwiseQueue.peekVal("low"));
    while (!pairwiseQueue.isEmpty()) {
      console.log(pairwiseQueue.pop()[0]); //=> 'high', 'medium', 'low'
    }
    /*
    let cache:string;
    this.strategy = [];
    for(let i = 0; i < plans.length; i++){
      cache = plans[i];
      let strategy = {
        shaderId:cache,
        renderableList: renderableObjects
      };
    }
*/
    //console.log(plans)
    this.strategy.push({
      shaderId: renderableObjects[0].plan[0],
      renderableList: renderableObjects,
    });
  }
}
