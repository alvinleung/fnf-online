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


export class ShaderPlan implements MaterialProperties {

  private plan:string[]; // a ordered list of strings(shaderID) each identifing a shader program
  
  constructor(){
    this.plan = ShaderManager.getInstance().getDefaultPlan();
  }
}
export class TheOneRenderPass extends RenderPass {

  private strategy:{shaderId: string, renderableList: RenderableObject[] }[] = [];
  // store: object { shaderId, renderables }
  private strategyNeedsUpdate:boolean = true;
  private _frameRendered:number = 0;

  public setup(gl: WebGLRenderingContext, system: RenderingSystem) { }

  // this will be called per frame
  public render(
    gl: WebGLRenderingContext,
    system: RenderingSystem,
  ) {
    if(this.strategyNeedsUpdate){
      this.resolveStrategy(system.getRenderables());
      this.strategyNeedsUpdate = false;
    }
    /* get variables from system */
    const cameraMatrix = system.getCameraMatrix();
    const projectionMatrix = system.getProjectionMatrix();

    const shaderManager = ShaderManager.getInstance();
    this.strategy.forEach( subPass=> {
      //const shaderProgram = system.getShaderProgram(subPass.shaderId);
      const shaderProgram =  shaderManager.getShaderFor(gl,subPass.shaderId);
      if (!shaderProgram){
        if(this._frameRendered % 30 == 0){
          console.log("shader not found in cache, skipping:["+ subPass.shaderId +"]")
        }
        return;
      }
      shaderProgram.useProgram();

      /** Get Naming scheme from shader manager */
      const verticeName = shaderManager.getVariableName(Shader.NAMES.VERTICES);
      const normalsName = shaderManager.getVariableName(Shader.NAMES.NORMALS);
      const texCoordsName = shaderManager.getVariableName(Shader.NAMES.TEXCOORDS);
      const modelMatrixName = shaderManager.getVariableName(Shader.NAMES.MODEL_MATRIX);
      const viewMatrixName = shaderManager.getVariableName(Shader.NAMES.VIEW_MATRIX);
      const projectionMatrixName = shaderManager.getVariableName(Shader.NAMES.PROJECTION_MATRIX);

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

      subPass.renderableList.forEach(renderableObject => {
        /** Geomatery */
        const geometry = renderableObject.getGeometry();
        geometry.prepareInGPU(gl);
        shaderProgram.writeUniformMat4(modelMatrixName,geometry.get(modelMatrixName))
        shaderProgram.useAttribForRendering(verticeName,geometry.get(verticeName));
        shaderProgram.useAttribForRendering(normalsName,geometry.get(normalsName));
        shaderProgram.useAttribForRendering(texCoordsName,geometry.get(texCoordsName));

        /** Materials */
        const materials = renderableObject.getMaterials();
        const material = materials.getProperty<Material>("material");
        const variableMapping = shaderManager.getMaterialMapping(material);
        material.prepareInGPU(gl);
        
        for(let [variableName,type] of Object.entries(variableMapping)){
          switch(type){
            case Shader.UNIFORM.BOOL:
              //console.log(material.get(variableName))
              shaderProgram.writeUniformBoolean(variableName,material.get(variableName))
              break;
            case Shader.UNIFORM.FLOAT:
              shaderProgram.writeUniformFloat(variableName,material.get(variableName))
              break;
            case Shader.UNIFORM.FLOAT_MAT4:
              shaderProgram.writeUniformMat4(variableName,material.get(variableName))
              break;
            case Shader.UNIFORM.FLOAT_VEC3:
              shaderProgram.writeUniformVec3Float(variableName,material.get(variableName))
              break;
            case Shader.UNIFORM.FLOAT_VEC4:
              shaderProgram.writeUniformVec4Float(variableName,material.get(variableName))
              break;
            case Shader.UNIFORM.SAMPLER_2D:
              const texture = material.get(variableName) as TextureBufferLoader;
              if(texture.hasTexture){
                texture.buffer.useForRendering();
              } 
              break;
            case Shader.ATTRIBUTE.FLOAT_VEC2:
              console.log("vec2 not supported yet")
              break;
            case Shader.ATTRIBUTE.FLOAT_VEC4:
              //console.log(variableName)
              shaderProgram.useAttribForRendering(variableName,material.get(variableName))
              break;
            default:
              console.error("variable Name [" + variableName + "] not found")
              return;
            /*
            case type >= 100 && type < 200:
              console.log( "100 ~ 200" +  variableName )
              shaderProgram.useAttribForRendering(variableName,material.get0(variableName))
              break;*/
          }
        }

        /** DRAW */
        gl.drawArrays(gl.TRIANGLES,0,material.getSize())
        //shaderProgram.cleanUpAttribs()
        if(this._frameRendered %240 == 0){
          //console.log(geometry.get(verticeName))
        }
      })
    });
    this._frameRendered++;
  }
  /*
    resolve shader strategy
  */
  public resolveStrategy(renderableObjects:RenderableObject[]){
    let plans = [];
    renderableObjects.forEach(renderableObject => {
      plans.push( renderableObject.getRenderingPlan() );
    });

    let cache:string;
    this.strategy = [];
    for(let i = 0; i < plans.length; i++){
      cache = plans[i];
      let strategy = {
        shaderId:cache,
        renderableList: renderableObjects
      };
      this.strategy.push(strategy);
    }
  }
}















