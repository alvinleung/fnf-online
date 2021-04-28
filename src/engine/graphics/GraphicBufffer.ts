export class GraphicBuffer {
  private gl: WebGLRenderingContext;
  private buffer: WebGLBuffer;
  private bufferSize: number;
  private attributePointerLocation: number;

  constructor(gl: WebGLRenderingContext, attributePointerLocation: number) {
    this.buffer = gl.createBuffer();
    this.gl = gl;
    this.attributePointerLocation = attributePointerLocation;
  }

  // write data into the buffer
  public writeBuffer(bufferData: Float32Array | number, bufferSize: number) {
    if (bufferData instanceof Float32Array) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, this.gl.STATIC_DRAW);
      this.bufferSize = bufferSize;
      return;
    }

    if (typeof bufferData === "number") {
      this.gl.bindBuffer(this.gl.FLOAT, this.buffer);
      this.gl.bufferData(
        this.gl.FLOAT,
        new Float32Array([bufferData]),
        this.gl.STATIC_DRAW
      );
      this.bufferSize = 1;
      return;
    }

    console.warn("Cannot write buffer, invalid data type");
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
