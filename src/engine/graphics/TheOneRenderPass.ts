import { Shader, ShaderManager } from "./3dRender/shaders/ShaderManager";
import { MaterialProperties } from "./Materials/Material";
import { RenderableObject } from "./Renderable";

import { RenderingSystem } from "./RenderingSystem";
import { RenderPass } from "./RenderPass";


export class ShaderPlan implements MaterialProperties {

  private plan:string[]; // a ordered list of strings(shaderID) each identifing a shader program
  
  constructor(){
    this.plan = ShaderManager.getInstance().getDefaultPlan();
  }
}

// Shader set

export class DataBufferHandler {

}
export class DataBufferPair {

}

export class Material implements MaterialProperties {
  public get(propertyName):any{

  }
  public getSize():number{
    return 0;
  }
}

export class TheOneRenderPass extends RenderPass {

  private strategy:{shaderId: string, renderableList: RenderableObject[] }[] = [];
  // store: object { shaderId, renderables }

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) {

    /*
      resolve shader strategy
    */

    this.resolveStrategy(null);
  }

  // this will be called per frame
  public render(
    gl: WebGLRenderingContext,
    system: RenderingSystem,
  ) {
    const shaderManager = ShaderManager.getInstance();
    this.strategy.forEach(subPass => {
      const shaderProgram = system.getShaderProgram(subPass.shaderId);
      shaderProgram.useProgram();
      
      /** Get Naming scheme from shader manager */
      const verticeName = shaderManager.getVariableName(Shader.NAMES.VERTICES);
      const normalsName = shaderManager.getVariableName(Shader.NAMES.NORMALS);
      const texCoordsName = shaderManager.getVariableName(Shader.NAMES.TEXCOORDS);
      const modelMatrixName = shaderManager.getVariableName(Shader.NAMES.MODEL_MATRIX);
      const viewMatrixName = shaderManager.getVariableName(Shader.NAMES.VIEW_MATRIX);
      const projectionMatrixName = shaderManager.getVariableName(Shader.NAMES.PROJECTION_MATRIX);

      subPass.renderableList.forEach(renderableObject => {
        /** Transform */
        const cameraMatrix = system.getCameraMatrix();
        const projectionMatrix = system.getProjectionMatrix();
        shaderProgram.writeUniformMat4(viewMatrixName, cameraMatrix);
        shaderProgram.writeUniformMat4(projectionMatrixName, projectionMatrix);

        /** Geomatery */
        const geometry = renderableObject.getGeometry();
        shaderProgram.writeUniformMat4(modelMatrixName,geometry.get(modelMatrixName))
        shaderProgram.useAttribForRendering(verticeName,geometry.get(verticeName));
        shaderProgram.useAttribForRendering(normalsName,geometry.get(normalsName));
        shaderProgram.useAttribForRendering(texCoordsName,geometry.get(texCoordsName));

        /** Materials */
        const materials = renderableObject.getMaterials();
        const material = materials.getProperty<Material>("material");
        const variableMapping = shaderManager.getMaterialMapping(material);
        for(let [variableName,type] of Object.entries(variableMapping)){
          switch(type){
            case Shader.UNIFORM.BOOLEAN:
              shaderProgram.writeUniformBoolean(variableName,material.get(variableName))
              break;
            case Shader.UNIFORM.FLOAT:
              shaderProgram.writeUniformFloat(variableName,material.get(variableName))
              break;
            case Shader.UNIFORM.MAT4:
              shaderProgram.writeUniformMat4(variableName,material.get(variableName))
              break;
            case Shader.UNIFORM.VEC3:
              shaderProgram.writeUniformVec3Float(variableName,material.get(variableName))
              break;
            case Shader.UNIFORM.VEC4:
              shaderProgram.writeUniformVec4Float(variableName,material.get(variableName))
              break;
            case type >= 100 && type < 200:
              shaderProgram.useAttribForRendering(variableName,material.get(variableName))
              break;
          }
        }

        /** DRAW */
        gl.drawArrays(gl.TRIANGLES,0,material.getSize())
      })
    });

  }

  public resolveStrategy(renderableObjects:RenderableObject[]){

  }

}















