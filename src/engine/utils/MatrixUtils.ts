import { m4, v3 } from "twgl.js";


export module v4 {
  export type Vec4 = number[] | Float32Array;
  
  export function create(x:number,y:number,z:number,w:number): v4.Vec4{
    return [x,y,z,w];
  };
  export function multiplyVec4Mat4(v4:v4.Vec4, m4:m4.Mat4): v4.Vec4{
    let m00 = m4[0];
    let m01 = m4[1];
    let m02 = m4[2];
    let m03 = m4[3];
    let m10 = m4[4];
    let m11 = m4[5];
    let m12 = m4[6];
    let m13 = m4[7];
    let m20 = m4[8];
    let m21 = m4[9];
    let m22 = m4[10];
    let m23 = m4[11];
    let m30 = m4[12];
    let m31 = m4[13];
    let m32 = m4[14];
    let m33 = m4[15];

    return [
      v4[0] * m00 + v4[1] * m10 + v4[2] * m20 + v4[3] * m30,
      v4[0] * m01 + v4[1] * m11 + v4[2] * m21 + v4[3] * m31,
      v4[0] * m02 + v4[1] * m12 + v4[2] * m22 + v4[3] * m32,
      v4[0] * m03 + v4[1] * m13 + v4[2] * m23 + v4[3] * m33,
    ];
  };
  export function multiplyMat4Vec4(m4:m4.Mat4, v4:v4.Vec4): v4.Vec4{
    let m00 = m4[0];
    let m01 = m4[1];
    let m02 = m4[2];
    let m03 = m4[3];
    let m10 = m4[4];
    let m11 = m4[5];
    let m12 = m4[6];
    let m13 = m4[7];
    let m20 = m4[8];
    let m21 = m4[9];
    let m22 = m4[10];
    let m23 = m4[11];
    let m30 = m4[12];
    let m31 = m4[13];
    let m32 = m4[14];
    let m33 = m4[15];

    return [
      v4[0] * m00 + v4[1] * m01 + v4[2] * m02 + v4[3] * m03,
      v4[0] * m10 + v4[1] * m11 + v4[2] * m12 + v4[3] * m13,
      v4[0] * m20 + v4[1] * m21 + v4[2] * m22 + v4[3] * m23,
      v4[0] * m30 + v4[1] * m31 + v4[2] * m32 + v4[3] * m33,
    ];
  };
  export function normalize(v4:v4.Vec4): v4.Vec4{
    if(v4[3] == 0) return v4;
    return create(v4[0] / v4[3],v4[1] / v4[3],v4[2] / v4[3], 1.0);
  }
  export function xyz(v4:v4.Vec4): v3.Vec3{
    if( isPoint(v4) ){
      return v3.create(v4[0] / v4[3],v4[1] / v4[3],v4[2] / v4[3]);
    } else {
      return v3.create(v4[0],v4[1],v4[2]);
    }
  }
  // the w component indicates if the vec4 is a point or a direction: direction has w = 0
  export function isPoint(v4:v4.Vec4): boolean{
    return v4[3] != 0.0;
  }
}

