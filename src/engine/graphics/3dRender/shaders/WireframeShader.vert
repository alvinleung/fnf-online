precision mediump float;

attribute vec3 vPosition;
varying vec3 fWorldPosition;

uniform mat4 modelMatrix; // transfrom from model CS to world CS
uniform mat4 viewMatrix; // tranform from world CS to camera CS (camera/view clip space)
uniform mat4 projectionMatrix; // from cameara CS to NDCS(normalized device CS), just means its now from -1 to 1 for xyz


void main()
{
    
    fWorldPosition = (modelMatrix * vec4(vPosition,1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPosition,1.0);
    
}