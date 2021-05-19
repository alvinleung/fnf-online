import { v3 } from "twgl.js";
import { spreadArrayRecusively } from "../../../utils/ArrayUtils";
import { roundTo } from "../../../utils/MathUtils";

export const plane = [
  // Front face
  -1.0, -1.0,  0.0, // bottomleft
   1.0, -1.0,  0.0, // bottomright
   1.0,  1.0,  0.0, // topright

   1.0,  1.0,  0.0, // topright
   -1.0,  1.0,  0.0, // topleft
   -1.0, -1.0,  0.0, // bottomleft
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
  randomColor: function(size: number, faceVertexCount:number , randomOrder = false): number[]{
    const colors = [this.red,this.green,this.blue,this.white,this.Pigment_Green,this.UE_Red,this.Cobalt_Blue,this.Pantone_Orange]//,this.Cyber_Yellow]
    const avalibleColorNum = colors.length;
    
    let colorArray :number[] = [];
    for(let i = 0; i < size / faceVertexCount; i++){
      for(let j = 0; j < faceVertexCount; j++){
        colorArray.push(...colors[i % avalibleColorNum]);
      }
    }

    return colorArray;
  },
  /**
   * 
   * @param size the number of faces/lines/triangles , NOT number of vertices
   * @param percentage 
   * @returns 
   */
  grayColor: function(size: number, percentage:number): number[]{
    let grayColor = this.grayFromPercent(percentage);

    let colorArray :number[] = [];
    for(let i = 0; i < size ; i++){
      colorArray.push(...grayColor);
    }

    return colorArray;
  }
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

export function generateCustomCube(xMin:number,xMax:number,yMin:number,yMax:number,zMin:number,zMax:number){

  const customCubeVertices = [
    // Top anti-clockwise
    [xMax,yMax,zMax], 
    [xMin,yMax,zMax],
    [xMin,yMax,zMin],
    [xMax,yMax,zMin],

    // bottom anti-clockwise
    [xMax,yMin,zMax], 
    [xMin,yMin,zMax],
    [xMin,yMin,zMin],
    [xMax,yMin,zMin],
  ];

  let vertices = [];
  // 1 line per triangle
  // Top
  vertices.push(...rectangleFace(customCubeVertices,0,1,2,3));
  // bottom
  vertices.push(...rectangleFace(customCubeVertices,4,7,6,5));
  // front
  vertices.push(...rectangleFace(customCubeVertices,0,4,5,1));
  // back
  vertices.push(...rectangleFace(customCubeVertices,3,2,6,7));  
  // left
  vertices.push(...rectangleFace(customCubeVertices,0,3,7,4));
  // right
  vertices.push(...rectangleFace(customCubeVertices,2,1,5,6));
  return {
    verticeArray: spreadArrayRecusively(vertices),
  }
}

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

  //colors.push(Array(6 * 6).fill(COLORS_VEC4.Pantone_Orange));

  return {
    verticeArray: spreadArrayRecusively(vertices),
    colorArray: spreadArrayRecusively(colors)
  }
}

/**
 * makeShift function for getting wireframe from triangles
 * large room for optimization
 * @param triangleVertices 
 */
export function wireFrameFromTriangles( triangleVertices:number[], trim = true ): number[]{

  // how many decimal points to be treated as different a vertex
  const percision = 5;
  // Generate line vertices from triangles
  let lineVertices:number[] = [];
  for(let i = 0; i < triangleVertices.length; i+=9){
    // a triangle
    const vert0 = [ 
      roundTo( triangleVertices[ i ], percision ),
      roundTo( triangleVertices[i+1], percision ),
      roundTo( triangleVertices[i+2], percision ) ];
    const vert1 = [ 
      roundTo( triangleVertices[i+3], percision ),
      roundTo( triangleVertices[i+4], percision ),
      roundTo( triangleVertices[i+5], percision ) ];
    const vert2 = [ 
      roundTo( triangleVertices[i+6], percision ),
      roundTo( triangleVertices[i+7], percision ),
      roundTo( triangleVertices[i+8], percision ) ];

    lineVertices.push(...vert0,...vert1);
    lineVertices.push(...vert0,...vert2);
    lineVertices.push(...vert2,...vert1);
  }

  if(!trim){
    return lineVertices;
  }

  // trim duplicate lines
  let linesRegister = {};
  let linestrimmed = [];
  let elimitated = 0;
  for(let i = 0; i < lineVertices.length; i+=6){
    // a line
    const vert0 = [ lineVertices[ i ],lineVertices[i+1],lineVertices[i+2] ];
    const vert1 = [ lineVertices[i+3],lineVertices[i+4],lineVertices[i+5] ];

    let lineString01 = vert0.toString().concat(vert1.toString());
    let lineString10 = vert1.toString().concat(vert0.toString());

    if(!linesRegister[lineString01] && !linesRegister[lineString10]){
      linesRegister[lineString01] = true;
      linestrimmed.push(...vert0,...vert1);
    } else {
      elimitated++;
    }

  }
  return linestrimmed;
}



