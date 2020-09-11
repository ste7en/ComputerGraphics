#version 300 es
precision mediump float;

in vec2 uv_fs;

out vec4 outColor;

uniform sampler2D u_texture;
uniform vec4 tail_color;
uniform vec4 hand_color;

void main() {
  outColor = texture(u_texture, uv_fs);
  //outColor = vec4(1.0, 0.5, 0.3, 1.0);
}