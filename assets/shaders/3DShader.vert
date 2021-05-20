attribute vec3 vPosition;
attribute vec4 vColor;
attribute vec2 vTextureCoords;

varying vec4 fColor;
varying vec3 fWorldPosition;
varying vec2 fTextureCoords;

uniform bool useTexture;
uniform mat4 modelMatrix; // transfrom from model CS to world CS
uniform mat4 viewMatrix; // tranform from world CS to camera CS (camera/view clip space)
uniform mat4 projectionMatrix; // from cameara CS to NDCS(normalized device CS), just means its now from -1 to 1 for xyz

vec4 ERROR_COLOR = vec4(1.0, 0.0, 0.549, 1.0);

void main()
{
    fWorldPosition = (modelMatrix * vec4(vPosition,1.0)).xyz;
    fColor = ERROR_COLOR;
    if(useTexture){
        fTextureCoords = vTextureCoords.xy * vec2(-1,-1) + vec2(1,1);
    }
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPosition,1.0);

}