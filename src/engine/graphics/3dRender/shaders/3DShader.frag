
precision mediump float;

varying vec4 fColor;
varying vec2 fTextureCoords;

uniform sampler2D uTexture;


void main()
{
    // gl_FragColor = fColor;
    gl_FragColor = texture2D(uTexture, fTextureCoords);

    // render the alpha
    // gl_FragColor = vec4(texture2D(uTexture, fTextureCoords).w,0.0,0.0,1.0);
    
    // don't render low alpha pixels
    if(gl_FragColor.a < .5) discard;
}
