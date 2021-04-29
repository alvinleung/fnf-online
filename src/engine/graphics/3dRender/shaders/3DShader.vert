attribute  vec4 vPosition;
attribute  vec4 vColor;
attribute  vec3 vNormal;

varying vec4 fColor;

uniform mat4 modelMatrix; // transfrom from model CS to world CS
uniform mat4 viewMatrix; // tranform from world CS to camera CS (camera/view clip space)
uniform mat4 projectionMatrix; // from cameara CS to NDCS(normalized device CS), just means its now from -1 to 1 for xyz


void main()
{
    fColor = vColor;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}