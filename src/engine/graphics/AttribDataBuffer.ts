/**
 * Class for webgl data buffer wrapper with extra perks
 */
export class AttribDataBuffer {
  private _gl: WebGLRenderingContext;
  private _buffer: WebGLBuffer;
  private _bufferSize: number;

  public static fromData(
    gl: WebGLRenderingContext,
    data: Float32Array | number[] | number,
    bufferSize: number
  ): AttribDataBuffer {
    const b = new AttribDataBuffer(gl);
    b.write(data, bufferSize);
    return b;
  }

  constructor(gl: WebGLRenderingContext) {
    this._buffer = gl.createBuffer();
    this._gl = gl;
  }

  // write data into the buffer
  public write(
    bufferData: Float32Array | number[] | number,
    bufferSize: number
  ) {
    if (bufferData instanceof Float32Array) {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);
      this._gl.bufferData(
        this._gl.ARRAY_BUFFER,
        bufferData,
        this._gl.STATIC_DRAW
      );
      this._bufferSize = bufferSize;
      return;
    }

    if (typeof bufferData === "number") {
      this._gl.bindBuffer(this._gl.FLOAT, this._buffer);
      this._gl.bufferData(
        this._gl.FLOAT,
        new Float32Array([bufferData]),
        this._gl.STATIC_DRAW
      );
      this._bufferSize = 1;
      return;
    }

    console.warn("Cannot write buffer, invalid data type");
  }

  public get buffer() {
    return this._buffer;
  }

  public get bufferSize() {
    return this._bufferSize;
  }
}
