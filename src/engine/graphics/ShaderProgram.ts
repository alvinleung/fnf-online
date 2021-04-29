import { GraphicBuffer } from "./GraphicBufffer";

const twgl = require("twgl.js");

export class ShaderProgram {
  private shaderProgram: WebGLProgram;
  private gl: WebGLRenderingContext;

  private cachedUniformLocation = {};
  private cachedAttribLocation = {};

  private graphicBuffers = {};

  /**
   * Init and compile a shader program, wrapper of the shader API in webgl
   *
   * @param gl webgl rendering context
   * @param vert vertex shader code in string
   * @param frag fragment shader code in string
   */
  constructor(gl: WebGLRenderingContext, vert: string, frag: string) {
    // compile the shader program
    this.shaderProgram = this.compileShaderProgram(gl, vert, frag);
    this.gl = gl;
  }

  public getShader() {
    return this.shaderProgram;
  }
//TODO: add support for uniforms
  public initAttrib(
    attribName: string,
    bufferData: Float32Array | number,
    size?: number // how the data should be read
  ) {
    // initialise attribute
    const attribLocation = this.gl.getAttribLocation(
      this.shaderProgram,
      attribName
    );
    const buffer = new GraphicBuffer(this.gl, attribLocation);
    this.graphicBuffers[attribName] = buffer;
    buffer.writeBuffer(bufferData, size);
  }

  public prepareAttribForRendering(attribName: string) {
    this.graphicBuffers[attribName].prepareBufferForRendering();
  }

  public writeAttrib(
    attribName: string,
    bufferData: Float32Array,
    size: number
  ) {
    this.graphicBuffers[attribName].writeBuffer(bufferData, size);
  }

  public getAttribLocation(attributeName: string | {}) {
    if (typeof attributeName !== "string") {
      console.warn("Supplied attribute name is not a string.");
      return;
    }

    const attribLocation = this.cachedAttribLocation[attributeName];
    if (attribLocation) {
      return attribLocation;
    }

    this.cachedAttribLocation[attributeName] = this.gl.getAttribLocation(
      this.compileShaderProgram,
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

  private compileShaderProgram(
    gl: WebGLRenderingContext,
    vert: string,
    frag: string
  ): WebGLProgram {
    return twgl.createProgram(gl, [vert, frag]);
  }

  public getGraphicBuffer(name: string): GraphicBuffer {
    return this.graphicBuffers[name];
  }

  public useProgram() {
    this.gl.useProgram(this.shaderProgram);
  }
}
