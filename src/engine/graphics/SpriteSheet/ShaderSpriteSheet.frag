precision mediump float;
 
varying vec2 v_texcoord;
 
uniform sampler2D u_texture;
 
void main() {
   gl_FragColor = texture2D(u_texture, v_texcoord);
   // gl_FragColor = vec4(sin(v_texcoord.y),0,0,1); // debug gradient 
}