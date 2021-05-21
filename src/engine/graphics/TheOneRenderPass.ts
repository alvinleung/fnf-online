import { Shader } from "./shader/ShaderConstants";
import { MaterialManager } from "./materials/MaterialManager";
import { RenderableObject } from "./Renderable";

import { RenderingSystem } from "./RenderingSystem";
import { RenderPass } from "./RenderPass";
import { DataBufferLoader, TextureBufferLoader } from "./DataBufferPair";
import { LightComponent } from "./Light";
import { TransformComponent } from "../core/TransformComponent";
import { m4 } from "twgl.js";
import { PriorityQueue } from "../utils/DataStructUtils";

export class ShaderPlan {
  private plan: string[]; // a ordered list of strings(shaderID) each identifing a shader program

  constructor() {
    this.plan = MaterialManager.getInstance().getDefaultPlan();
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

    const shaderManager = MaterialManager.getInstance();
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

        // prepare custom attributes
        Object.keys(geometry.attributes).forEach((key) => {
          const attribute = geometry.attributes[key];
          if (attribute.needUpdate) {
            attribute.load(gl);
          }
          shaderProgram.useAttribForRendering(key, attribute.buffer);
        });

        /** Materials */
        const material = renderableObject.getMaterial();
        const variableMapping = shaderManager.getMaterialVariables(material);

        for (let [variableName, variableInfo] of Object.entries(variableMapping)) {
          const info = variableInfo as any;
          const type = info.type;
          let nameInShader = info.nameInShader;

          switch (type) {
            case Shader.UNIFORM.BOOL:
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
              const textureLoader = material.get(variableName) as TextureBufferLoader;
              if (!textureLoader.hasTexture) break;
              textureLoader.load(gl);
              textureLoader.buffer.useForRendering();
              break;

            default:
              console.warn(
                `Variable [${variableName}] is using unsupported type, abort rendering.`
              );
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
