import { ShaderConstants } from "./shader/ShaderConstants";
import { MaterialManager } from "./materials/MaterialManager";
import { RenderableObject } from "./Renderable";

import { RenderingSystem } from "./RenderingSystem";
import { RenderPass } from "./RenderPass";
import { DataBufferLoader, TextureBufferLoader } from "./DataBufferPair";
import { LightComponent } from "./Light";
import { TransformComponent } from "../core/TransformComponent";
import { m4 } from "twgl.js";
import { ShaderProgram } from "./ShaderProgram";

interface SubPass {
  shaderName: string;
  renderableList: RenderableObject[];
  shaderProgram: ShaderProgram;
}

export class TheOneRenderPass extends RenderPass {
  // store: object { shaderId, renderables }
  private _frameRendered: number = 0;

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {}

  // this will be called per frame
  public render(gl: WebGLRenderingContext, system: RenderingSystem) {
    const materialManager = MaterialManager.getInstance();
    const renderables = system.getRenderables();

    // sort the renderables into the shader list for each shader
    const renderList = renderables.reduce((renderList, renderable) => {
      const shaderSet = renderable.getMaterial().shader;

      if (!renderList[shaderSet.name])
        renderList[shaderSet.name] = {
          shaderName: shaderSet.name,
          shaderProgram: materialManager.getShaderProgram(gl, shaderSet),
          renderableList: [],
        };

      renderList[shaderSet.name].renderableList.push(renderable);

      return renderList;
    }, {} as { [name: string]: SubPass });

    /* get variables from system */
    const cameraMatrix = system.getCameraMatrix();
    const projectionMatrix = system.getProjectionMatrix();

    Object.values(renderList).forEach((subPass) => {
      //const shaderProgram = system.getShaderProgram(subPass.shaderId);
      const shaderProgram = subPass.shaderProgram;
      if (!shaderProgram) {
        if (this._frameRendered % 30 == 0) {
          console.log("Shader program not provided:[" + subPass.shaderName + "]");
        }
        return;
      }
      shaderProgram.useProgram();

      /** Get Naming scheme from shader manager */
      const verticeName = ShaderConstants.GEOMETRY.VERTICES;
      const normalsName = ShaderConstants.GEOMETRY.NORMALS;
      const texCoordsName = ShaderConstants.GEOMETRY.TEXCOORDS;
      const modelMatrixName = ShaderConstants.GEOMETRY.MODEL_MATRIX;
      const viewMatrixName = ShaderConstants.GEOMETRY.VIEW_MATRIX;
      const projectionMatrixName = ShaderConstants.GEOMETRY.PROJECTION_MATRIX;

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
        const variableMapping = materialManager.getMaterialVariables(material);

        for (let [variableName, variableInfo] of Object.entries(variableMapping)) {
          const info = variableInfo as any;
          const type = info.type;
          let nameInShader = info.nameInShader;

          switch (type) {
            case ShaderConstants.UNIFORM.BOOL:
              shaderProgram.writeUniformBoolean(nameInShader, material.get(variableName));
              break;

            case ShaderConstants.UNIFORM.FLOAT:
              shaderProgram.writeUniformFloat(nameInShader, material.get(variableName));
              break;

            case ShaderConstants.UNIFORM.FLOAT_MAT4:
              shaderProgram.writeUniformMat4(nameInShader, material.get(variableName));
              break;

            case ShaderConstants.UNIFORM.FLOAT_VEC3:
              shaderProgram.writeUniformVec3Float(nameInShader, material.get(variableName));
              break;

            case ShaderConstants.UNIFORM.FLOAT_VEC4:
              shaderProgram.writeUniformVec4Float(nameInShader, material.get(variableName));
              break;

            case ShaderConstants.UNIFORM.SAMPLER_2D:
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
}
