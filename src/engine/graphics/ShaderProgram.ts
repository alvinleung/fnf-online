import { AttribDataBuffer } from "./AttribDataBuffer";

const twgl = require("twgl.js");

export class ShaderProgram {
  private shaderProgram: WebGLProgram;
  private gl: WebGLRenderingContext;

  private cachedUniformLocation = {};
  private cachedAttribLocation = {};

  private _uncleanAttrib:{[name:string]: number} = {};

  private attribBuffers = {};

  public readonly variableNameMap:{
    // name:type where type is webglenum 
    attributeMap:{[attributeName:string]:number}
    unfiromMap:{[unifromName:string]:number}
  }



  /**
   * Init and compile a shader program, wrapper of the shader API in webgl
   *
   * @param gl webgl rendering context
   * @param vert vertex shader code in string
   * @param frag fragment shader code in string
   */
  constructor(gl: WebGLRenderingContext, vert: string, frag: string, ) {
    // compile the shader program
    this.shaderProgram = this.compileShaderProgram(gl, vert, frag);
    this.gl = gl;
  }

  public getShader() {
    return this.shaderProgram;
  }

  /**
   * Insert buffer data into the rendering of the buffer
   * @param attribName
   * @param data
   */
  public useAttribForRendering(
    attribName: string,
    dataBuffer: AttribDataBuffer
  ) {
    const attribPointerLocation = this.getAttribLocation(attribName);
    // use the buffer for rendering
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, dataBuffer.buffer);
    this.gl.enableVertexAttribArray(attribPointerLocation);
    this.gl.vertexAttribPointer(
      attribPointerLocation,
      dataBuffer.bufferSize,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    // add the used attribute to the clean up list
    this._uncleanAttrib[attribPointerLocation] = attribPointerLocation;
  }

  /**
   * Usually called at the end of the render pass, the function 
   * disable all the currently enabled vertex attributes.
   * (enabled by the useAttribForRendering function) 
   */
  public cleanUpAttribs() {
    const uncleanAttribs = Object.values(this._uncleanAttrib);
    for(let i = 0; i < uncleanAttribs.length; i++) {
      this.gl.disableVertexAttribArray(uncleanAttribs[i]);
    }
  }

  public getAttribLocation(attributeName: string) {
    if (typeof attributeName !== "string") {
      console.warn("Supplied attribute name is not a string.");
      return;
    }

    const attribLocation = this.cachedAttribLocation[attributeName];
    if (attribLocation) {
      return attribLocation;
    }

    this.cachedAttribLocation[attributeName] = this.gl.getAttribLocation(
      this.shaderProgram,
      attributeName
    );

    return this.cachedAttribLocation[attributeName];
  }

  public getUniformLocation(uniformName: string) {
    if (typeof uniformName !== "string") {
      console.warn("Supplied uniform name is not a string.");
      return;
    }

    const uniformLocation = this.cachedUniformLocation[uniformName];
    if (uniformLocation) {
      return uniformLocation;
    } else {
      return (this.cachedUniformLocation[
        uniformName
      ] = this.gl.getUniformLocation(this.shaderProgram, uniformName));
    }
  }

  public writeUniformVec2Float(uniformName: string, vec) {
    this.gl.uniform2fv(
      this.getUniformLocation(uniformName),
      new Float32Array(vec)
    );
  }
  public writeUniformVec3Float(uniformName: string, vec) {
    this.gl.uniform3fv(
      this.getUniformLocation(uniformName),
      new Float32Array(vec)
    );
  }

  public writeUniformVec4Float(uniformName: string, vec) {
    this.gl.uniform4fv(
      this.getUniformLocation(uniformName),
      new Float32Array(vec)
    );
  }

  public writeUniformVec2Int(uniformName: string, vec) {
    this.gl.uniform2iv(
      this.getUniformLocation(uniformName),
      new Float32Array(vec)
    );
  }

  public writeUniformVec3Int(uniformName: string, vec) {
    this.gl.uniform3iv(
      this.getUniformLocation(uniformName),
      new Float32Array(vec)
    );
  }
  public writeUniformVec4Int(uniformName: string, vec) {
    this.gl.uniform4iv(
      this.getUniformLocation(uniformName),
      new Float32Array(vec)
    );
  }

  public writeUniformMat4(uniformName: string, matrix) {
    this.gl.uniformMatrix4fv(
      this.getUniformLocation(uniformName),
      false,
      new Float32Array(matrix)
    );
  }

  public writeUniformMat2(uniformName: string, matrix) {
    this.gl.uniformMatrix2fv(
      this.getUniformLocation(uniformName),
      false,
      new Float32Array(matrix)
    );
  }
  public writeUniformMat3(uniformName: string, matrix) {
    this.gl.uniformMatrix3fv(
      this.getUniformLocation(uniformName),
      false,
      new Float32Array(matrix)
    );
  }
  public writeUniformInt(uniformName: string, value) {
    this.gl.uniform1i(this.getUniformLocation(uniformName), value);
  }
  public writeUniformBoolean(uniformName: string, value) {
    this.gl.uniform1i(this.getUniformLocation(uniformName), value);
  }
  public writeUniformFloat(uniformName: string, value) {
    this.gl.uniform1f(this.getUniformLocation(uniformName), value);
  }

  private compileShaderProgram(
    gl: WebGLRenderingContext,
    vert: string,
    frag: string
  ): WebGLProgram {
    return twgl.createProgram(gl, [vert, frag]);
  }

  public getAttribBuffer(name: string): AttribDataBuffer {
    return this.attribBuffers[name];
  }

  public useProgram() {
    this.gl.useProgram(this.shaderProgram);
  }
}
