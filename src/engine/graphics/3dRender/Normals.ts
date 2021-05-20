import { v3 } from "twgl.js";
import { spreadArrayRecusively } from "../../utils/ArrayUtils";
import { AttribDataBuffer } from "../AttribDataBuffer";

export class Normals {
  public normals: number[];
  private _normalBuffer: AttribDataBuffer;
  private _isLoadedIntoGPUMemory: boolean;

  constructor(vertices: number[], rightHandRule: boolean) {
    let objectNormals = [];
    let vertOrder: number[];
    if (rightHandRule) {
      vertOrder = [0, 1, 2];
    } else {
      vertOrder = [0, 2, 1];
    }
    for (var i = 0; i < vertices.length; i += 9) {
      const vert0 = v3.create(vertices[i], vertices[i + 1], vertices[i + 2]);
      const vert1 = v3.create(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
      const vert2 = v3.create(vertices[i + 6], vertices[i + 7], vertices[i + 8]);
      const verts = [vert0, vert1, vert2];

      const normal = v3.cross(
        v3.subtract(verts[vertOrder[0]], verts[vertOrder[1]]),
        v3.subtract(verts[vertOrder[2]], verts[vertOrder[1]])
      ); // as number[];
      objectNormals.push(...normal, ...normal, ...normal);
    }
    this.normals = spreadArrayRecusively(objectNormals);
    //this.normals = smoothNormals(this.normals, vertices);
    this._isLoadedIntoGPUMemory = false;
  }

  public getNormalsBuffer(): AttribDataBuffer {
    return this._normalBuffer;
  }

  //TODO: refactor out logic
  public isLoadedIntoGPUMemory() {
    return this._isLoadedIntoGPUMemory;
  }
  public createBufferObjectsInGPU(gl: WebGLRenderingContext) {
    this._normalBuffer = AttribDataBuffer.fromData(gl, new Float32Array(this.normals), 3);
  }
}

export function smoothNormals(normalsArray: number[], verticesArray: number[]) {
  let vertices = [];
  let normals = [];
  for (var i = 0; i < verticesArray.length; i += 3) {
    vertices.push([verticesArray[i], verticesArray[i + 1], verticesArray[i + 2]]);
    normals.push([normalsArray[i], normalsArray[i + 1], normalsArray[i + 2]]);
  }
  var angleThreashold = 50;
  var percisionInDecimalPoints = 10;

  var vertexMapping = {};
  var vertexCumulativeNormal = [];

  for (var i = 0; i < vertices.length; i++) {
    var vertString = vertices[i].toString();
    var vectexCumulativeIndex = 0;
    if (!vertexMapping[vertString]) {
      vectexCumulativeIndex = vertexCumulativeNormal.length;
      vertexMapping[vertString] = vectexCumulativeIndex;
      vertexCumulativeNormal[vectexCumulativeIndex] = normals[i];
    } else {
      vectexCumulativeIndex = vertexMapping[vertString];
    }

    vertexCumulativeNormal[vectexCumulativeIndex] = v3.add(
      vertexCumulativeNormal[vectexCumulativeIndex],
      normals[i]
    );
  }

  // normalize normals
  for (var i = 0; i < vertexCumulativeNormal.length; i++) {
    vertexCumulativeNormal[i] = v3.normalize(vertexCumulativeNormal[i]);
  }

  var smoothedNormals = [];
  for (var i = 0; i < vertices.length; i++) {
    var vertString = vertices[i].toString();
    var vectexCumulativeIndex = vertexMapping[vertString];
    smoothedNormals.push(...vertexCumulativeNormal[vectexCumulativeIndex]);
  }
  return smoothedNormals;
}
