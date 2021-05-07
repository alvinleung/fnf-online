/**
 * 
 * Implementation of ray-triangle intersection algorithms
 * 
 */

import { v3 } from "twgl.js";

export module RayTriangle {

  export type Triangle = v3.Vec3[];
  //export type Ray = v3.Vec3[];
  const EPSILON = 0.00000001 // a very small number used to check zero which accounts for floating point percision 
  const DEFAULT_RAY_TRIANGLE_INTERSECTION_FUNCTION = mollerTruboreFrontFace;
  
  /*
  export function createRay(point:v3.Vec3, direction:v3.Vec3){
    return [point,direction];
  }
  */
 
  export function createTriangle(vertex0: v3.Vec3, vertex1:v3.Vec3, vertex2: v3.Vec3){
    return [vertex0, vertex1, vertex2];
  }
  export function intersect(rayPosition:v3.Vec3, rayDirection:v3.Vec3, triangle:Triangle): number{
    return DEFAULT_RAY_TRIANGLE_INTERSECTION_FUNCTION(rayPosition, rayDirection, triangle);
  }
  /**
   * implementation of moller Trumbore intersecton algorithm
   * two face Version
   * @returns the lenth of the ray if hit, null if not 
   */
  function mollerTruboreTwoSided(rayPosition:v3.Vec3, rayDirection:v3.Vec3, triangle:Triangle): number{
    
    /**
     * implemented in javascript
     * closely following explaination of original algorithm's paper
     * https://www.youtube.com/watch?v=fK1RPmF_zjQ&t=906s&ab_channel=enigmatutorials
     */

    // find vectors of two edges sharing vertex0
    let edge01 = v3.subtract(triangle[1], triangle[0]);
    let edge02 = v3.subtract(triangle[2], triangle[0]);

    let RayDirection_cross_edge02 = v3.cross(rayDirection,edge02);
    // scaler triple products of edge1, edge2 and ray direction
    // properties: is 0 when the vectors is on the same plane
    let det = v3.dot(edge01, RayDirection_cross_edge02);
    if(det > -EPSILON && det < EPSILON){ // det is zero(very close if there is floating point errors)
      // geometrically: ray is parallel to plane/ is within the plane
      return null; // does not hit, is null is "raylenth" is not avalible
    }
    let inverseDet = 1.0 / det;

    // BeryCentric calculation
    // if any Bery is not within 0 and 1, ray misses

    // test U parameter
    let vertex0TorayPos = v3.subtract(rayPosition,triangle[0]);
    let beryU = v3.dot(vertex0TorayPos, RayDirection_cross_edge02) * inverseDet;
    if(beryU > 1.0 || beryU < 0.0){
      return null;
    }

    // test V parameter
    let vertex0TorayPos_cross_edge01 = v3.cross(vertex0TorayPos,edge01);
    let beryV = v3.dot(rayDirection, vertex0TorayPos_cross_edge01) * inverseDet;
    if(beryV + beryU > 1.0 || beryV < 0.0){
      return null;
    }

    let raylength = v3.dot(edge02, vertex0TorayPos_cross_edge01) * inverseDet;
    
    return raylength;
  }

  function mollerTruboreFrontFace(rayPosition:v3.Vec3, rayDirection:v3.Vec3, triangle:Triangle): number{
    
    /**
     * implemented in javascript
     * closely following explaination of original algorithm's paper
     * https://www.youtube.com/watch?v=fK1RPmF_zjQ&t=906s&ab_channel=enigmatutorials
     */

    // find vectors of two edges sharing vertex0
    let edge01 = v3.subtract(triangle[1], triangle[0]);
    let edge02 = v3.subtract(triangle[2], triangle[0]);

    let RayDirection_cross_edge02 = v3.cross(rayDirection,edge02);
    // scaler triple products of edge1, edge2 and ray direction
    // properties: is 0 when the vectors is on the same plane
    let det = v3.dot(edge01, RayDirection_cross_edge02);
    if(det < EPSILON){ // det is zero(very close if there is floating point errors)
      // geometrically: ray is parallel to plane/ is within the plane
      return null; // does not hit, is null is "raylenth" is not avalible
    }

    // [optimisation (delay division)]

    // BeryCentric calculation
    // if any Bery is not within 0 and 1, ray misses

    // test U parameter
    let vertex0TorayPos = v3.subtract(rayPosition,triangle[0]);
    let beryU = v3.dot(vertex0TorayPos, RayDirection_cross_edge02) ;
    if(beryU < 0.0 || beryU > det){
      return null;
    }

    // test V parameter
    let vertex0TorayPos_cross_edge01 = v3.cross(vertex0TorayPos,edge01);
    let beryV = v3.dot(rayDirection, vertex0TorayPos_cross_edge01) ;
    if(beryV + beryU > det || beryV < 0.0){
      return null;
    }

    let inverseDet = 1.0 / det;
    let raylength = v3.dot(edge02, vertex0TorayPos_cross_edge01) * inverseDet;
    //beryU *= inverseDet;
    //beryV *= inverseDet;
    
    return raylength;
  }

}
