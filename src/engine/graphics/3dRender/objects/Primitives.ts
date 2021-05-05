import { spreadArrayRecusively } from "../../../utils/ArrayUtils";

export const plane = [
  // Front face
  -1.0, -1.0,  0.0,
   1.0, -1.0,  0.0,
   1.0,  1.0,  0.0,

   1.0,  1.0,  0.0,
   -1.0,  1.0,  0.0,
   -1.0, -1.0,  0.0,
]

export const plane_colors = [
  1.0,0.0,0.0,1.0,
  0.0,1.0,0.0,1.0,
  0.0,0.0,1.0,1.0,
  0.0,0.0,1.0,1.0,
  1.0,1.0,1.0,1.0,
  1.0,0.0,0.0,1.0,
]

// export const quad_2d = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
export const quad_2d = [
  1, 0,
  0, 0,
  0, 1,
  0, 1,
  1, 1,
  1, 0,
];

// All alpha defaults as 0
export const COLORS_VEC4 = {
  red: [1.0, 0.0, 0.0, 1.0],
  green: [0.0, 1.0, 0.0, 1.0],
  blue: [0.0, 0.0, 1.0, 1.0],
  white: [1.0, 1.0, 1.0, 1.0],
  black: [0.0, 0.0, 0.0, 1.0],
  // Color Scheme for Rubik's cube
  Pigment_Green: [0.0, 155 / 225, 0.0, 1.0],
  UE_Red: [185 / 255, 0.0, 0.0, 1.0],
  Cobalt_Blue: [0.0, 69/255, 173/255, 1.0],
  Pantone_Orange: [1.0, 89/255, 0.0, 1.0],
  Cyber_Yellow: [1.0, 213/255, 0.0, 1.0],
  /**
   * @param percentage a float between 0.0 to 1.0 as a percentage of blackness
   * @returns gray color corresponding to the percentage
   */
  grayFromPercent: function (percentage:number){
    const color = Math.min(Math.max(percentage,0.0),1.0);
    return [color,color,color, 1.0];
  },

}

const cubeVertices = [
  // Top anti-clockwise
  [0.5,0.5,0.5], 
  [-0.5,0.5,0.5],
  [-0.5,0.5,-0.5],
  [0.5,0.5,-0.5],

  // bottom anti-clockwise
  [0.5,-0.5,0.5], 
  [-0.5,-0.5,0.5],
  [-0.5,-0.5,-0.5],
  [0.5,-0.5,-0.5],

]
function rectangleFace(allVertices:Array<Array<number>>,v1:number,v2:number,v3:number,v4:number){
  let vertices = [];
  
  // 1 rectanglurFace from 4 vertices assuming parameter vertices is anti-clockwise
  // face is genereted like triangle fan with v1 as origin
  vertices.push(allVertices[v1],allVertices[v2],allVertices[v3]);
  vertices.push(allVertices[v1],allVertices[v3],allVertices[v4]);

  return vertices;
}

export function generateColoredCube(){
  let vertices = [];
  let colors = [];

  // 1 line per triangle
  // Top
  vertices.push(...rectangleFace(cubeVertices,0,1,2,3));
  colors.push(Array(6).fill(COLORS_VEC4.white));

  // bottom
  vertices.push(...rectangleFace(cubeVertices,4,7,6,5));
  colors.push(Array(6).fill(COLORS_VEC4.Cyber_Yellow));

  // front
  vertices.push(...rectangleFace(cubeVertices,0,4,5,1));
  colors.push(Array(6).fill(COLORS_VEC4.Cobalt_Blue));

  // back
  vertices.push(...rectangleFace(cubeVertices,3,2,6,7));
  colors.push(Array(6).fill(COLORS_VEC4.Pigment_Green));
  
  // left
  vertices.push(...rectangleFace(cubeVertices,0,3,7,4));
  colors.push(Array(6).fill(COLORS_VEC4.UE_Red));

  // right
  vertices.push(...rectangleFace(cubeVertices,2,1,5,6));
  colors.push(Array(6).fill(COLORS_VEC4.Pantone_Orange));

  return {
    verticeArray: spreadArrayRecusively(vertices),
    colorArray: spreadArrayRecusively(colors)
  }
}