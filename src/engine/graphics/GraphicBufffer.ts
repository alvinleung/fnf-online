export default class GraphicBuffer {
  private gl: WebGLRenderingContext;
  private buffer: WebGLBuffer;
  private bufferSize: number;
  private attributePointerLocation: number;

  constructor(
    gl: WebGLRenderingContext,
    attributePointerLocation: number,
    bufferSize: number
  ) {
    this.buffer = gl.createBuffer();
    this.gl = gl;
    this.attributePointerLocation = attributePointerLocation;
  }

  // write data into the buffer
  public writeBuffer(bufferData: Float32Array, bufferSize: number) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, this.gl.STATIC_DRAW);
    this.bufferSize = bufferSize;
  }

  // use the buffer for rendering
  public prepareBufferForRendering() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.enableVertexAttribArray(this.attributePointerLocation);
    this.gl.vertexAttribPointer(
      this.attributePointerLocation,
      this.bufferSize,
      this.gl.FLOAT,
      false,
      0,
      0
    );
  }
}
