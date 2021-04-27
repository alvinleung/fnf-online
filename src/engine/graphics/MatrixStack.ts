// @ts-check
import { m4, v3 } from "twgl.js";

class MatrixStack {
  private stack = [];

  constructor() {
    // since the stack is empty this will put an initial matrix in it
    this.restore();
  }

  public restore() {
    this.stack.pop();
    // Never let the stack be totally empty
    if (this.stack.length < 1) {
      this.stack[0] = m4.identity();
    }
  }

  public save() {
    this.stack.push(this.getCurrentMatrix());
  }

  public getCurrentMatrix() {
    return this.stack[this.stack.length - 1].slice();
  }

  public setCurrentMatrix(m: m4.Mat4) {
    this.stack[this.stack.length - 1] = m;
    return m;
  }

  public translate(x: number, y: number, z: number) {
    if (z === undefined) {
      z = 0;
    }
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.translate(m, v3.create(x, y, z)));
  }

  public rotateZ(angleInRadians: number) {
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.rotateZ(m, angleInRadians));
  }

  public scale = function (x: number, y: number, z: number) {
    if (z === undefined) {
      z = 1;
    }
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.scale(m, v3.create(x, y, z)));
  };
}

export { MatrixStack };
