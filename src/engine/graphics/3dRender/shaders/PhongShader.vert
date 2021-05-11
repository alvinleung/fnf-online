precision mediump float;

attribute vec3 vPosition;
attribute vec4 vColor;
attribute vec2 vTextureCoords;
attribute vec3 vNormal;

varying vec4 fColor;
varying vec3 fWorldPosition;
varying vec2 fTextureCoords;
varying vec3 fNormal;
varying vec3 viewDirection;
varying vec3 lightDirection;

uniform vec3 lightOrigin;
uniform vec3 cameraPosition;
uniform bool useTexture;
uniform mat4 modelMatrix; // transfrom from model CS to world CS
uniform mat4 viewMatrix; // tranform from world CS to camera CS (camera/view clip space)
uniform mat4 projectionMatrix; // from cameara CS to NDCS(normalized device CS), just means its now from -1 to 1 for xyz

void main()
{
  
    fWorldPosition = (modelMatrix * vec4(vPosition,1.0)).xyz;
    fColor = vColor;
    if(useTexture){
        fTextureCoords = vTextureCoords.xy * vec2(-1,-1) + vec2(1,1);
    }
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPosition,1.0);
    fNormal = (viewMatrix * modelMatrix * vec4(vNormal,0.0)).xyz;
    //fNormal = vNormal;
    viewDirection = cameraPosition - (viewMatrix * modelMatrix * vec4(vPosition,1.0)).xyz;
    lightDirection = normalize((viewMatrix * vec4(lightOrigin,0.0)).xyz);
}