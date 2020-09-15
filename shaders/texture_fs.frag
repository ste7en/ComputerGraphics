#version 300 es
precision mediump float;

in vec2 uv_fs;
out vec4 outColor;
uniform sampler2D u_texture1;
uniform sampler2D u_texture2;

void main() {
  vec4 text1 = texture(u_texture1, uv_fs);
  vec4 text2 = texture(u_texture2, uv_fs);
  outColor = text1 * text2;
  //outColor = texture(u_texture, uv_fs);
}