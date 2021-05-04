attribute vec3 vPosition;
attribute vec4 vColor;
attribute vec2 vTextureCoords;

varying vec4 fColor;
varying vec2 fTextureCoords;

uniform mat4 modelMatrix; // transfrom from model CS to world CS
uniform mat4 viewMatrix; // tranform from world CS to camera CS (camera/view clip space)
uniform mat4 projectionMatrix; // from cameara CS to NDCS(normalized device CS), just means its now from -1 to 1 for xyz
uniform vec3 cameraPosition;

void main()
{
    /*
    vec3 vertexWorldCoord = (modelMatrix * vec4(vPosition,1.0)).xyz;
    float dist = length(vec3(0.0,0.0,0.0), vertexWorldCoord)
    float alpha = dist;
    fColor = vec4(vColor.rgb, max(min(alpha,1.0),0.0)); 
*/
    fColor = vColor;
    fTextureCoords = vTextureCoords.xy * vec2(-1,-1) + vec2(1,1);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPosition,1.0);

}