
precision mediump float;

varying vec4 fColor;
varying vec3 fWorldPosition;
varying vec2 fTextureCoords;

uniform sampler2D uTexture;
uniform bool useTexture;
uniform vec3 cameraPosition;

void main()
{
    // gl_FragColor = fColor;
    //if(fTextureCoords)

    float dist = length(cameraPosition - fWorldPosition);
    float alpha = 1.0 - dist / 40.0;
    gl_FragColor = vec4(fColor.rgb, max(min(alpha,1.0),0.0)); 
    //gl_FragColor = fColor;

    if(useTexture){
        gl_FragColor = texture2D(uTexture, fTextureCoords);
        if(gl_FragColor.a < .5) discard;
    }
    // render the alpha
    // gl_FragColor = vec4(texture2D(uTexture, fTextureCoords).w,0.0,0.0,1.0);
    
    // don't render low alpha pixels

}
