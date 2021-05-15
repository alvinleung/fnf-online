
precision mediump float;

varying vec4 fColor;
varying vec3 fWorldPosition;

uniform vec3 cameraPosition;
uniform vec4 vColor;

void main()
{

    float dist = length(cameraPosition - fWorldPosition);
    float alpha = 3.5 - dist / 10.0;
    gl_FragColor = vec4(vColor.rgb, max(min(alpha,1.0),0.0));
    
}
