import { m4, v3 } from "twgl.js";

/*
 * Adapted from
 * https://gist.github.com/joenoon/c1b5dd58e6e736675f0a5298e415a2ee#file-quaternion-js-L423
 */

//[(basic) vector func]
var negate = function (vec) {
  return vec.map(function (e) {
    return -e;
  });
};
//[dot product]
//- dot(a, b) = distance(a)*distance(b)*angle(a, b)
//- a * dot(a, b): means a-parallel part of b (if a is x-axis, just [b.x, 0])
var dot = function (a, b) {
  var s = 0;
  for (var i = 0; i < a.length; i++) {
    s += a[i] * b[i];
  }
  return s;
};

export type Quat = number[] | Float32Array;

export const Y_AXIS = [0, 1, 0];
export const X_AXIS = [1, 0, 0];
export const Z_AXIS = [0, 0, 1];

export function fromAxisAndAngle(axis: v3.Vec3, phi: number): Quat {
  var cos = Math.cos(phi / 2);
  var sin = Math.sin(phi / 2);
  var normal = v3.normalize(axis);
  return [cos, sin * normal[0], sin * normal[1], sin * normal[2]];
}

//https://stackoverflow.com/questions/50011864/changing-xyz-order-when-converting-euler-angles-to-quaternions
export function fromEulerAngles(
  rotationX: number,
  rotationY: number,
  rotationZ: number
): Quat {
  // Assuming the angles are in radians.
  const c1 = Math.cos(rotationX / 2);
  const s1 = Math.sin(rotationX / 2);
  const c2 = Math.cos(rotationY / 2);
  const s2 = Math.sin(rotationY / 2);
  const c3 = Math.cos(rotationZ / 2);
  const s3 = Math.sin(rotationZ / 2);
  // const c1c2 = c1 * c2;
  // const s1s2 = s1 * s2;

  // return [w, x, y, z];
  return [
    c1 * c2 * c3 + s1 * s2 * s3,
    s1 * c2 * c3 - c1 * s2 * s3,
    c1 * s2 * c3 + s1 * c2 * s3,
    c1 * c2 * s3 - s1 * s2 * c3,
  ];
}

export function quatToMat4(q: Quat): m4.Mat4 {
  const q01 = q[0] * q[1],
    q02 = q[0] * q[2],
    q03 = q[0] * q[3];
  const q11 = q[1] * q[1],
    q12 = q[1] * q[2],
    q13 = q[1] * q[3];
  const q21 = q12,
    q22 = q[2] * q[2],
    q23 = q[2] * q[3];
  const q31 = q13,
    q32 = q23,
    q33 = q[3] * q[3];

  return [
    //row 1
    1 - 2 * (q22 + q33),
    2 * (q12 - q03),
    2 * (q13 + q02),
    0,
    // row 2
    2 * (q21 + q03),
    1 - 2 * (q33 + q11),
    2 * (q23 - q01),
    0,
    //row 3
    2 * (q31 - q02),
    2 * (q32 + q01),
    1 - 2 * (q11 + q22),
    0,
    //row 4
    0,
    0,
    0,
    1,
  ] as m4.Mat4;
}

/**
 * @param m
 * @returns
 */
export function mat4ToQuat(m: m4.Mat4): Quat {
  const m00 = m[0],
    m01 = m[1],
    m02 = m[2];
  const m10 = m[4],
    m11 = m[5],
    m12 = m[6];
  const m20 = m[8],
    m21 = m[9],
    m22 = m[10];

  let q0 = Math.sqrt(1 + m00 + m11 + m22) / 2;
  let q1 = Math.sqrt(1 + m00 - m11 - m22) / 2;
  let q2 = Math.sqrt(1 - m00 + m11 - m22) / 2;
  let q3 = Math.sqrt(1 - m00 - m11 + m22) / 2;
  if (q0 >= q1 && q0 >= q2 && q0 >= q3) {
    q3 = (m10 - m01) / (4 * q0);
    q2 = (m02 - m20) / (4 * q0);
    q1 = (m21 - m12) / (4 * q0);
  } else if (q1 >= q0 && q1 >= q2 && q1 >= q3) {
    q2 = (m10 + m01) / (4 * q1);
    q3 = (m02 + m20) / (4 * q1);
    q0 = (m21 - m12) / (4 * q1);
  } else if (q2 >= q0 && q2 >= q1 && q2 >= q3) {
    q1 = (m10 + m01) / (4 * q2);
    q3 = (m21 + m12) / (4 * q2);
    q0 = (m02 - m20) / (4 * q2);
  } else if (q3 >= q0 && q3 >= q1 && q3 >= q2) {
    q1 = (m02 + m20) / (4 * q3);
    q2 = (m21 + m12) / (4 * q3);
    q0 = (m10 - m01) / (4 * q3);
  } else throw Error("unreachable point");
  const q = [q0, q1, q2, q3];
  return q0 < 0 ? negate(q) : q;
}

export function lerp(s: Quat, e: Quat, t: number): Quat {
  var ps = 1 - t;
  var pe = t;
  var r = [];
  for (var i = 0; i < s.length; i++) {
    r.push(ps * s[i] + pe * e[i]);
  }
  return r;
}

// [slerp: spherical linear interpolation]
export function slerp(s: Quat, e: Quat, t: number): Quat {
  var cos = dot(s, e);
  var sin = Math.sqrt(1 - cos * cos);
  if (sin === 0) return lerp(s, e, t);
  var angle = Math.acos(cos);
  var ps = Math.sin(angle * (1 - t)) / sin;
  var pe = Math.sin(angle * t) / sin;
  var r = [];
  for (var i = 0; i < s.length; i++) {
    r.push(ps * s[i] + pe * e[i]);
  }
  return r;
}

export function mult(a: Quat, b: Quat) {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] + a[2] * b[0] + a[3] * b[1] - a[1] * b[3],
    a[0] * b[3] + a[3] * b[0] + a[1] * b[2] - a[2] * b[1],
  ];
}

//https://answers.unity.com/questions/372371/multiply-quaternion-by-vector3-how-is-done.html
export function multVec3(q: Quat, v: v3.Vec3): v3.Vec3 {
  const [qw, qx, qy, qz] = q;
  const [vx, vy, vz] = v;

  const num = qx * 2;
  const num2 = qy * 2;
  const num3 = qz * 2;
  const num4 = qx * num;
  const num5 = qy * num2;
  const num6 = qz * num3;
  const num7 = qx * num2;
  const num8 = qx * num3;
  const num9 = qy * num3;
  const num10 = qw * num;
  const num11 = qw * num2;
  const num12 = qw * num3;

  return [
    (1 - (num5 + num6)) * vx + (num7 - num12) * vy + (num8 + num11) * vz,
    (num7 + num12) * vx + (1 - (num4 + num6)) * vy + (num9 - num10) * vz,
    (num8 - num11) * vx + (num9 + num10) * vy + (1 - (num4 + num5)) * vz,
  ];
}

/**
 *
 * @param q Quaternion to inverse.
 * @returns
 */
export function inverse(q: Quat): Quat {
  const [w, x, y, z] = q;
  return [w, -x, -y, -z];
}
