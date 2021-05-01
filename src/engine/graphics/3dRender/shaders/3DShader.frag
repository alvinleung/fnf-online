
precision mediump float;

varying vec4 fColor;
varying vec2 fTextureCoords;

uniform sampler2D uTexture;

void main()
{
    // gl_FragColor = fColor;
    gl_FragColor = texture2D(uTexture, fTextureCoords);
}